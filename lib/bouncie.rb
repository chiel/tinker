class Bouncie

	attr_reader :markup, :style, :interaction

	#
	#
	#
	def initialize(hash = nil, revision = 0)
		if !revision
			revision = 0
		end

		if hash
			self.read hash, revision
		end
	end

	#
	#
	#
	def properties
		{
			:hash => @hash,
			:revision => @revision
		}
	end

	#
	#
	#
	def create(entry)
		hash = Digest::SHA1.hexdigest(Time.new.to_i.to_s)[0..4]
		response = {}
		begin
			client = Mysql2::Client.new(
				:host => APP_CONFIG['db']['host'],
				:username => APP_CONFIG['db']['user'],
				:password => APP_CONFIG['db']['pass'],
				:database => APP_CONFIG['db']['name']
			)
			query = 'INSERT INTO bouncie_revision (x_bouncie_hash, revision, markup, style, interaction) '
			query << 'VALUES ("'+client.escape(hash)+'", 0, '
			query << '"'+client.escape(entry[:markup])+'", '
			query << '"'+client.escape(entry[:style])+'", '
			query << '"'+client.escape(entry[:interaction])+'")'
			results = client.query(query)
			response = {
				:hash => hash,
				:revision => 0
			}
		rescue Mysql2::Error => e
			puts 'SQL ERROR: '+e.message
		end
		return response.to_json
	end

	#
	#
	#
	def read(hash, revision)
		entry = DB[:bouncie_revision].filter(
			:x_bouncie_hash => hash,
			:revision => revision.to_i > 0 ? revision.to_i : 0
		).first

		@hash = hash
		@revision = revision
		@markup = entry[:markup]
		@style = entry[:style]
		@interaction = entry[:interaction]
	end

	#
	#
	#
	def update(hash, entry)
		print 'update '+hash.to_s+"\n\n"
		response = {}
		begin
			client = Mysql2::Client.new(
				:host => APP_CONFIG['db']['host'],
				:username => APP_CONFIG['db']['user'],
				:password => APP_CONFIG['db']['pass'],
				:database => APP_CONFIG['db']['name']
			)
			query = 'SELECT MAX(revision) as max FROM bouncie_revision '
			query << 'WHERE x_bouncie_hash = "'+hash+'"'
			results = client.query(query)

			max = results.first['max'].to_i
			revision = (max + 1).to_s

			query = 'INSERT INTO bouncie_revision (x_bouncie_hash, revision, markup, style, interaction) '
			query << 'VALUES ("'+client.escape(hash)+'", '+revision+', '
			query << '"'+client.escape(entry[:markup])+'", '
			query << '"'+client.escape(entry[:style])+'", '
			query << '"'+client.escape(entry[:interaction])+'")'
			results = client.query(query)
			response = {
				:hash => hash,
				:revision => revision
			}
		rescue Mysql2::Error => e
			puts 'SQL ERROR: '+e.message
		end
		return response.to_json
	end

	#
	#
	#
	def delete(hash, revision)
		#
	end
end

