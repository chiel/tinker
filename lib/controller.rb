class Controller < Sinatra::Base
	set :root, File.expand_path('../..', __FILE__)
	set :haml, :format => :html5, :attr_wrapper => '"', :ugly => true
	set :sass, :style => :compact
end
