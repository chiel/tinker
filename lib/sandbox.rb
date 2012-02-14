class Sandbox < Controller
	get '/' do
		headers 'X-Frame-Options' => ''
		body 'SANDBOX'
	end

	post '/' do
		locals = {
			:title => params[:title] || 'Tinker &mdash; Sandbox',
			:doctype => Doctype.code(params[:doctype]),
			:html => params[:markup],
			:css => params[:style],
			:js => params[:interaction],
			:metas => [],
			:scripts => [],
			:stylesheets => []
		}

		if params[:framework] && params[:framework].to_i > 0
			framework = Framework.get params[:framework]
			locals[:scripts] << '/frameworks/'+framework[:filepath]
		end

		if params[:normalize]
			locals[:stylesheets] << '/css/normalize.css'
		end

		if params[:description]
			locals[:metas] << '<meta name="description" content="'+params[:description]+'">'
		end

		if params[:assets]
			params[:assets].each do |asset|
				type = asset.gsub /.*\.([a-z+]+)/i, '\1'
				if type == 'css'
					locals[:stylesheets] << asset
				elsif type == 'js'
					locals[:scripts] << asset
				end
			end
		end

		headers 'X-Frame-Options' => ''
		body haml :sandbox, :locals => locals
	end
end
