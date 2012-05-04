$:.unshift File.expand_path('.') + '/lib'

require 'bundler/setup'
require 'sinatra/reloader'

%w[yaml json sinatra/base mysql2 sequel haml sass digest/sha2 base64 controller client sandbox tinker doctype framework].each do |f|
	require f
end

APP_CONFIG = YAML.load_file 'config.yml'
DB = Sequel.connect(APP_CONFIG['db'])

map APP_CONFIG['urls']['client'] do
	run Client
end
map APP_CONFIG['urls']['sandbox'] do
	run Sandbox
end
