require 'sinatra/base'
require 'sinatra/reloader'
require 'haml'
require 'sass'

class Controller < Sinatra::Base
	log = File.new('sinatra.log', 'a')
	STDOUT.reopen(log)
	STDERR.reopen(log)

	configure :development, :test do |config|
		register Sinatra::Reloader
	end

	set :root, File.expand_path('../..', __FILE__)
	set :haml, :format => :html5, :attr_wrapper => '"', :ugly => true
	set :sass, :style => :compact

end
