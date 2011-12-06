class Bouncie

	attr_reader :markup, :style, :interaction

	def initialize(hash = nil, revision = 0)
		if hash
			self.read hash, revision
		end
	end

	def read(hash, revision)
		begin
			client = Mysql2::Client.new(
				:host => APP_CONFIG['db']['host'],
				:username => APP_CONFIG['db']['user'],
				:password => APP_CONFIG['db']['pass'],
				:database => APP_CONFIG['db']['name']
			)
			query = 'SELECT markup, style, interaction FROM bouncie_revision WHERE x_bouncie_hash = "'+hash+'"'
			query+= 'AND revision = '+(revision.to_i > 0 ? revision.to_i : 0).to_s
			results = client.query(query)
		rescue Mysql2::Error => e
			puts 'SQL ERROR: '+e.message
		end

		if results.count == 0
			puts 'NO RESULTS'
			return
		end

		# There must be a better way to just get a single result...
		results.each do |row|
			@markup = row['markup']
			@style = row['style']
			@interaction = row['interaction']
			break
		end
	end
end
