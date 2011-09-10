class Client < Controller
	get '/' do
		haml :index
	end
	get '/css/base.css' do
		sass :base
	end
end
