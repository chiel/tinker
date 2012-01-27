$:.unshift File.expand_path('.') + '/lib'
%w[yaml json sinatra/base mysql2 sequel haml sass digest/sha2 controller client sandbox tinker framework].each do |f|
	require f
end

APP_CONFIG = YAML.load_file 'config.yml'
DB = Sequel.connect(APP_CONFIG['db']['url'])

map APP_CONFIG['urls']['client'] do
	run Client
end
map APP_CONFIG['urls']['sandbox'] do
	run Sandbox
end
