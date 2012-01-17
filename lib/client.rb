class Client < Controller
	get '/' do
		bouncie = Bouncie.new
		haml :index, :locals => {:bouncie => bouncie, :urls => APP_CONFIG['urls']}
	end

	get %r{^/([A-Za-z0-9]+)(?:\/([0-9]+))?$} do |hash, revision|
		bouncie = Bouncie.new hash, revision
		haml :index, :locals => {:bouncie => bouncie, :urls => APP_CONFIG['urls']}
	end

	post %r{^/save(?:\/([A-Za-z0-9]+))?/?$} do |hash|
		entry = {
			:markup => params[:markup],
			:style => params[:style],
			:interaction => params[:interaction]
		}

		bouncie = Bouncie.new
		if hash
			bouncie.update hash, entry
		else
			bouncie.create entry
		end
	end

	get '/css/base.css' do
		sass :base
	end
end
