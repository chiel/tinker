# add bounce lib path
$:.unshift File.expand_path('.') + '/lib'

%w[sinatra/base haml sass controller client sandbox].each { |f| require f }

map 'http://client.dev/' do
	run Client
end
map 'http://sandbox.dev/' do
	run Sandbox
end
