class User

	# Create a new user
	def initialize
		@dirty = false
		@data = {}
	end

	# attempt to register a new user
	def register
		exists = DB[:user].filter(:username => @data['username']).count
		return nil if exists > 0

		hash = Digest::SHA1.hexdigest(Time.new.to_i.to_s)[0..4]
		password_hash = Digest::SHA1.hexdigest(@data['password'])

		# insert the user with status 1; awaiting verification
		DB[:user].insert(
			:username => @data['username'],
			:password => password_hash,
			:email => @data['email'],
			:hash => hash,
			:status => 1
		)

		return true
	end

	# Retrieve a value
	def []( key )
		@data[key] || nil
	end

	# Set a value
	def []=( key, value )
		@data[key] = value
		@dirty = true
	end

end
