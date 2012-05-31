require 'sinatra/base'
require 'sinatra/cookies'
require 'sinatra/reloader'
require 'haml'
require 'session'
require 'user'
require 'pp'

class Controller < Sinatra::Base
	log = File.new('sinatra.log', 'a')
	STDOUT.reopen(log)
	STDERR.reopen(log)

	configure :development, :test do |config|
		register Sinatra::Reloader
		Dir.glob('lib/*.rb') do |file|
			also_reload file
		end
	end

	use Rack::Session::Pool, :expire_after => 1209600
	set :root, File.expand_path('../..', __FILE__)
	set :haml, :format => :html5, :attr_wrapper => '"', :ugly => true

	helpers Sinatra::Cookies

	before do
		p session[:user]
		if !session[:user]
			session[:user] = User.new
		end
	end
end

