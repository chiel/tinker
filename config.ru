$:.unshift File.expand_path('.') + '/lib'
%w[yaml sinatra/base mysql2 haml sass controller client sandbox bouncie].each { |f| require f }

APP_CONFIG = YAML.load_file 'config.yml'

map APP_CONFIG['urls']['client'] do
	run Client
end
map APP_CONFIG['urls']['sandbox'] do
	run Sandbox
end
