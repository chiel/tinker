# Handles sandbox calls
class Sandbox < Controller
	# View a tinker
	post '/' do
		locals = {
			:title => params[:title] || 'Tinker &mdash; Sandbox',
			:doctype => Doctype.code(params[:doctype]),
			:html => Base64.decode64(params[:markup]),
			:css => Base64.decode64(params[:style]),
			:js => Base64.decode64(params[:interaction]),
			:metas => [],
			:scripts => [],
			:stylesheets => []
		}

		if params[:framework] && params[:framework].to_i > 0
			framework = Framework.get params[:framework]
			locals[:scripts] << '/frameworks/'+framework[:filepath]
		end

		if params[:extensions]
			extensions = Framework.get_extensions params[:extensions]
			extensions.each do |extension|
				locals[:scripts] << '/frameworks/'+extension[:filepath]
			end
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
