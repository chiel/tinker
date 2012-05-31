require 'bcrypt'
require 'digest/sha2'

class User

	# create a new session user
	def initialize( id = 0 )
		@id = id
	end

	#
	def self.find( email )
		DB[:user].filter(:email => email).first
	end

	# check if user is logged in
	def logged_in?
		@id > 0
	end

	# attempt to log a user in
	def login( email, password )
		user_data = User.find email
		raise UserError, 'User does not exist' unless user_data

		stored = BCrypt::Password.new(user_data[:password])
		raise UserError, 'Invalid username / password combination' unless stored == password

		@id = user_data[:id]
	end

	# log a user out
	def logout
		@id = 0
		true
	end

	#
	def signup( email, password )
		if User.find email
			raise UserError, 'User name taken. :((('
		end

		@id = DB[:user].insert(
			:email => email,
			:password => BCrypt::Password.create(password, :cost => 13),
			:salt => generate_salt,
			:hash => Digest::SHA1.hexdigest(Time.new.to_i.to_s),
			:status => 1
		)
	end

	def generate_salt length = 50
		salt = ''
		1.upto(length) { salt << (rand(93) + 33).chr }
		salt
	end

	def to_json
		{
			:id => @id
		}.to_json
	end
end

class UserError < Exception; end

