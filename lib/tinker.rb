class Tinker

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
			:revision => @revision,
			:doctype => @doctype,
			:framework => @framework,
			:normalize => @normalize
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

			query = 'INSERT INTO tinker_revision (x_tinker_hash, revision, x_doctype_id, '
			query << 'x_framework_version_id, normalize, markup, style, interaction) '
			query << 'VALUES ("'+client.escape(hash)+'", 0, '
			query << '"'+client.escape(entry[:doctype])+'", '
			query << '"'+client.escape(entry[:framework])+'", '
			query << entry[:normalize].to_s+', '
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
		response.to_json
	end

	#
	#
	#
	def read(hash, revision)
		entry = DB[:tinker_revision].filter(
			:x_tinker_hash => hash,
			:revision => revision.to_i > 0 ? revision.to_i : 0
		).first

		@hash = hash
		@revision = revision
		@doctype = entry[:x_doctype_id]
		@framework = entry[:x_framework_version_id]
		@normalize = entry[:normalize]
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
			query = 'SELECT MAX(revision) as max FROM tinker_revision '
			query << 'WHERE x_tinker_hash = "'+hash+'"'
			results = client.query(query)

			max = results.first['max'].to_i
			revision = (max + 1).to_s

			query = 'INSERT INTO tinker_revision (x_tinker_hash, revision, x_doctype_id, '
			query << 'x_framework_version_id, normalize, markup, style, interaction) '
			query << 'VALUES ("'+client.escape(hash)+'", '+revision+', '
			query << '"'+client.escape(entry[:doctype])+'", '
			query << '"'+client.escape(entry[:framework])+'", '
			query << entry[:normalize].to_s+', '
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
		response.to_json
	end

	#
	#
	#
	def delete(hash, revision)
		#
	end
end

