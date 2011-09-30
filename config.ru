# add bounce lib path
$:.unshift File.expand_path('.') + '/lib'

%w[sinatra/base haml sass controller client sandbox bouncie].each { |f| require f }

# Local development url's, this should be in a config file
map 'http://bounce.dev/' do
	run Client
end
map 'http://bounce-sandbox.dev/' do
	run Sandbox
end
