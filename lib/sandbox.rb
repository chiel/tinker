class Sandbox < Controller
	get '/' do
		headers 'X-Frame-Options' => ''
		body 'SANDBOX'
	end

	post '/' do
		puts params
		framework = Framework.get params[:framework]
		locals = {
			:html => params[:markup],
			:css => params[:style],
			:js => params[:interaction],
			:scripts => []
		}
		if framework
			locals[:scripts] << '/frameworks/'+framework[:filepath]
		end

		headers 'X-Frame-Options' => ''
		body haml :sandbox, :locals => locals
	end
end
