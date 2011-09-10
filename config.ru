%w[sinatra/base haml sass ./lib/controller ./lib/client ./lib/sandbox].each do |f|
	require f
end

# you probably better load hosts from a config file or something
map 'http://client.dev/' do
	run Client
end
map 'http://sandbox.dev/' do
	run Sandbox
end
