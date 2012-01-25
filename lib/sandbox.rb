class Sandbox < Controller
	get '/' do
		headers 'X-Frame-Options' => ''
		body 'SANDBOX'
	end

	post '/' do
		framework = Framework.new.get params[:framework]
		locals = {
			:html => params[:markup],
			:css => params[:style],
			:js => params[:interaction],
			:scripts => [
				'/frameworks/'+framework[:filepath]
			]
		}

		headers 'X-Frame-Options' => ''
		body haml :sandbox, :locals => locals
	end
end
