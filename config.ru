$:.unshift File.expand_path('.') + '/lib'

require 'sinatra/reloader'

%w[yaml json sinatra/base mysql2 sequel sprockets haml sass digest/sha2 base64 controller client sandbox tinker doctype framework].each do |f|
	require f
end

APP_CONFIG = YAML.load_file 'config.yml'
DB = Sequel.connect(APP_CONFIG['db'])


map APP_CONFIG['urls']['client']+'assets' do
	environment = Sprockets::Environment.new
	environment.append_path 'assets/scripts'
	environment.append_path 'assets/styles'
	run environment
end
map APP_CONFIG['urls']['client'] do
	run Client
end
map APP_CONFIG['urls']['sandbox'] do
	run Sandbox
end
