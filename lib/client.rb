class Client < Controller
	get '/' do
		tinker = Tinker.new
		libraries = Framework.list
		haml :index, :locals => {:tinker => tinker, :libraries => libraries, :urls => APP_CONFIG['urls']}
	end

	get %r{^/([A-Za-z0-9]+)(?:\/([0-9]+))?$} do |hash, revision|
		tinker = Tinker.new hash, revision
		libraries = Framework.list
		haml :index, :locals => {:tinker => tinker, :libraries => libraries, :urls => APP_CONFIG['urls']}
	end

	post %r{^/save(?:\/([A-Za-z0-9]+))?/?$} do |hash|
		entry = {
			:markup => params[:markup],
			:style => params[:style],
			:interaction => params[:interaction]
		}

		tinker = Tinker.new
		if hash
			tinker.update hash, entry
		else
			tinker.create entry
		end
	end

	get '/css/base.css' do
		sass :base
	end
end
