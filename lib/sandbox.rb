class Sandbox < Controller
	get '/' do
		headers 'X-Frame-Options' => ''
		body 'SANDBOX'
	end

	post '/' do
		puts params
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
			if params[:assets][:js]
				params[:assets][:js].each do |asset|
					locals[:scripts] << asset
				end
			end
			if params[:assets][:css]
				params[:assets][:css].each do |asset|
					locals[:stylesheets] << asset
				end
			end
		end

		puts locals

		headers 'X-Frame-Options' => ''
		body haml :sandbox, :locals => locals
	end
end
