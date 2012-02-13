class Client < Controller
	get %r{^/(?:([A-Za-z0-9]+)(?:\/([0-9]+)))?$} do |hash, revision|
		locals = {
			:tinker => Tinker.find(hash, revision),
			:doctypes => Doctype.list,
			:frameworks => Framework.list,
			:urls => APP_CONFIG['urls']
		}
		haml :index, :locals => locals
	end

	post %r{^/save(?:\/([A-Za-z0-9]+))?/?$} do |hash|
		puts params
		entry = {
			:title => params[:title],
			:description => params[:description],
			:doctype => params[:doctype],
			:framework => params[:framework],
			:normalize => params[:normalize] ? 1 : 0,
			:markup => params[:markup],
			:style => params[:style],
			:interaction => params[:interaction],
			:assets => params[:assets] || []
		}

		puts entry

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
