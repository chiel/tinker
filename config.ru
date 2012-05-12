$:.unshift File.expand_path('.') + '/lib'

require 'bundler/setup'
require 'yaml'
require 'json'
require 'mysql2'
require 'sequel'
require 'client'
require 'sandbox'

APP_CONFIG = YAML.load_file 'config.yml'
DB = Sequel.connect(APP_CONFIG['db'])

map APP_CONFIG['urls']['client'] do
	run Client
end
map APP_CONFIG['urls']['sandbox'] do
	run Sandbox
end
