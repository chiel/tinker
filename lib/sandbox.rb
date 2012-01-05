class Sandbox < Controller
	get '/' do
		headers 'X-Frame-Options' => ''
		body 'SANDBOX'
	end

	post '/' do
		headers 'X-Frame-Options' => ''
		body haml :sandbox, :locals => {:bouncie => params}
	end
end
