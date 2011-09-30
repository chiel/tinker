class Client < Controller
	get '/' do
		bouncie = Bouncie.new
		haml :index, :locals => {:bouncie => bouncie}
	end

	get %r{^/([A-Za-z0-9]+)$} do |hash|
		bouncie = Bouncie.new hash
		haml :index, :locals => {:bouncie => bouncie}
	end

	get '/save/?' do
		'save here'
	end

	get '/css/base.css' do
		sass :base
	end
end
