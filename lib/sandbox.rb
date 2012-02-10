class Sandbox < Controller
	get '/' do
		headers 'X-Frame-Options' => ''
		body 'SANDBOX'
	end

	post '/' do
		puts params
		framework = Framework.get params[:framework]
		locals = {
			:doctype => Doctype.code(params[:doctype]),
			:html => params[:markup],
			:css => params[:style],
			:js => params[:interaction],
			:scripts => [],
			:stylesheets => []
		}
		if framework
			locals[:scripts] << '/frameworks/'+framework[:filepath]
		end

		if params[:normalize]
			locals[:stylesheets] << '/css/normalize.css'
		end

		headers 'X-Frame-Options' => ''
		body haml :sandbox, :locals => locals
	end
end
