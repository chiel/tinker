require 'controller'
require 'tinker'
require 'doctype'
require 'framework'
require 'base64'

# Handles client calls
class Client < Controller
	# embed mode
	get %r{^(?:/([A-Za-z0-9_]+))?/([A-Za-z0-9]{5})(?:/([0-9]+))?/embed/?$} do |username, hash, revision|
		locals = {
			:tinker => Tinker.find(hash, revision),
			:urls => APP_CONFIG['urls'],
			:ga_code => APP_CONFIG['ga_code'],
			:environment => ENV['RACK_ENV']
		}

		headers 'X-Frame-Options' => ''
		body haml :embed, :locals => locals
	end

	# new or existing tinker
	get %r{^(?:/([A-Za-z0-9_]+))?/(?:([A-Za-z0-9]{5})(?:/([0-9]+))?/?)?$} do |username, hash, revision|
		locals = {
			:tinker => Tinker.find(hash, revision),
			:doctypes => Doctype.list,
			:frameworks => Framework.list,
			:user => session[:user],
			:urls => APP_CONFIG['urls'],
			:ga_code => APP_CONFIG['ga_code'],
			:environment => ENV['RACK_ENV']
		}
		haml :index, :locals => locals
	end

	# save new or existing tinker
	post '/save' do
		tinker = Tinker.find(params[:hash])

		tinker['title'] = params[:title]
		tinker['description'] = params[:description]
		tinker['doctype'] = params[:doctype]
		tinker['framework'] = params[:framework]
		tinker['extensions'] = params[:extensions] || []
		tinker['normalize'] = params[:normalize] ? 1 : 0
		tinker['assets'] = params[:assets] || []
		tinker['markup'] = Base64.decode64(params[:markup])
		tinker['style'] = Base64.decode64(params[:style])
		tinker['interaction'] = Base64.decode64(params[:interaction])

		p tinker['x_user_id']
		p params['x_user_id'].to_i

		if tinker['x_user_id'] != 0
			tinker['x_fork_id'] = params[:revision_id] || 0;
			tinker['x_user_id'] = 0
			tinker['hash'] = nil
			tinker['revision_id'] = nil
			tinker['username'] = nil
		end

		if tinker.save && !tinker['hash'].nil? && !tinker['revision'].nil?
			{
				:status => 'ok',
				:hash => tinker['hash'],
				:revision => tinker['revision'],
				:revision_id => tinker['revision_id']
			}.to_json
		else
			{
				:status => 'error',
				:error => {
					:code => 100,
					:message => 'Something went wrong while trying to save'
				}
			}.to_json
		end
	end

	# user login
	post '/login' do
		if session[:user].logged_in?
			return {
				:status => :error,
				:error => {
					:code => 21,
					:message => 'You are already logged in'
				}
			}.to_json
		end

		begin
			session[:user].login(params[:email], params[:password])
			{
				:status => :ok
			}.to_json
		rescue UserError => e
			{
				:status => :error,
				:error => {
					:code => 20,
					:message => e.message
				}
			}.to_json
		rescue Sequel::DatabaseError => e
			{
				:status => :error,
				:error => {
					:code => 90,
					:message => 'Uh-oh! It seems our system crapped all over itsself!'
				}
			}.to_json
		rescue Exception => e
			{
				:status => :error,
				:error => {
					:code => 90,
					:message => 'some other exception: '+e.message
				}
			}.to_json
		end
	end

	# user logout
	get '/logout' do
		session[:user].logout
		{
			:status => :ok
		}.to_json
	end

	# user signup
	post '/signup' do
		if session[:user].logged_in?
			return {
				:status => :error,
				:error => {
					:code => 21,
					:message => 'You are already logged in'
				}
			}.to_json
		end

		{
			:status => :unknown
		}.to_json
		begin
			user_id = session[:user].signup(params[:email], params[:password])
			{
				:status => :ok
			}.to_json
		rescue UserError => e
			{
				:status => :error,
				:error => {
					:code => 20,
					:message => e.message
				}
			}.to_json
		rescue Sequel::DatabaseError => e
			{
				:status => :error,
				:error => {
					:code => 90,
					:message => 'Uh-oh! It seems our system crapped all over itsself!'
				}
			}.to_json
		rescue Exception => e
			{
				:status => :error,
				:error => {
					:code => 90,
					:message => 'some other exception: '+e.message
				}
			}.to_json
		end
	end
end

