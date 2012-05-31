require 'digest/sha2'

class Session
	def initialize( id = nil )
		@data = {}
		@data[:id] = id || Digest::SHA256.hexdigest(Time.new.to_i.to_s)
	end

	def []( key )
		@data[key] || nil
	end

	def []=( key, value )
		@data[key] = value
	end
end

