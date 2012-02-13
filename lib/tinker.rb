class Tinker

	@dirty = false

	#
	#
	#
	def initialize
		@data = {}
	end

	#
	#
	#
	def self.find( hash, revision )
		t = Tinker.new

		return t unless hash

		data = DB[:tinker].join(:tinker_revision, :tinker_revision__x_tinker_hash => :hash)
		data = data.filter(:hash => hash)
		if revision == nil
			data = data.order(:tinker_revision__revision.desc)
		else
			data = data.filter(:tinker_revision__revision => revision)
		end
		data = data.first

		return t unless data

		t[:hash] = hash
		t[:revision] = data[:revision]
		t[:doctype] = data[:x_doctype_id]
		t[:framework] = data[:x_framework_version_id]
		t[:normalize] = data[:normalize]
		t[:markup] = data[:markup]
		t[:style] = data[:style]
		t[:interaction] = data[:interaction]

		data = DB[:tinker_revision_asset].select(:url, :filetype).filter(
			:x_tinker_hash => hash,
			:revision => revision
		).all

		assets = {}
		data.each do |asset|
			if !assets[asset[:filetype]]
				assets[asset[:filetype]] = []
			end

			assets[asset[:filetype]] << asset[:url]
		end
		t[:assets] = assets
		t
	end

	#
	#
	#
	def dirty?
		@dirty
	end

	#
	#
	#
	def new?
		@data[:hash].nil?
	end

	#
	#
	#
	def []=( key, value )
		@data[key] = value
		@dirty = true
	end

	#
	#
	#
	def save
		return true unless dirty?

		if new?
			#
		else
			#
		end
	end

	#
	#
	#
	def to_json
		@data.to_json
	end

	#
	#
	#
	# def create(entry)
	# 	hash = Digest::SHA1.hexdigest(Time.new.to_i.to_s)[0..4]
	# 	response = {}
	# 	begin
	# 		client = Mysql2::Client.new(
	# 			:host => APP_CONFIG['db']['host'],
	# 			:username => APP_CONFIG['db']['user'],
	# 			:password => APP_CONFIG['db']['pass'],
	# 			:database => APP_CONFIG['db']['name']
	# 		)
	# 		query = 'INSERT INTO tinker (hash, name, description) '
	# 		query << 'VALUES("'+client.escape(hash)+'", '
	# 		query << '"'+client.escape(entry[:title])+'", '
	# 		query << '"'+client.escape(entry[:description])+'")'
	# 		results = client.query(query)

	# 		query = 'INSERT INTO tinker_revision (x_tinker_hash, revision, x_doctype_id, '
	# 		query << 'x_framework_version_id, normalize, markup, style, interaction) '
	# 		query << 'VALUES ("'+client.escape(hash)+'", 0, '
	# 		query << '"'+client.escape(entry[:doctype])+'", '
	# 		query << '"'+client.escape(entry[:framework])+'", '
	# 		query << entry[:normalize].to_s+', '
	# 		query << '"'+client.escape(entry[:markup])+'", '
	# 		query << '"'+client.escape(entry[:style])+'", '
	# 		query << '"'+client.escape(entry[:interaction])+'")'
	# 		results = client.query(query)

	# 		if entry[:assets]
	# 			entry[:assets].each do |type, assets|
	# 				assets.each do |asset|
	# 					query = 'INSERT INTO tinker_revision_asset(x_tinker_hash, revision, url, filetype) '
	# 					query << 'VALUES("'+client.escape(hash)+'", 0, '
	# 					query << '"'+client.escape(asset)+'", "'+client.escape(type)+'")'
	# 					results = client.query(query)
	# 				end
	# 			end
	# 		end

	# 		response = {
	# 			:hash => hash,
	# 			:revision => 0
	# 		}
	# 	rescue Mysql2::Error => e
	# 		puts 'SQL ERROR: '+e.message
	# 	end
	# 	response.to_json
	# end

	#
	#
	#
	# def read(hash, revision)
	# 	@hash = hash
	# 	revision = revision != nil ? revision.to_i : nil

	# 	# main
	# 	entry = DB[:tinker].select(:name, :description).filter(:hash => @hash).first
	# 	@title = entry[:name]
	# 	@description = entry[:description]

	# 	# revision
	# 	rev = DB[:tinker_revision].filter(:x_tinker_hash => @hash)
	# 	if revision == nil
	# 		rev = rev.order(:revision.desc)
	# 	else
	# 		rev = rev.filter(:revision => revision)
	# 	end
	# 	entry = rev.first

	# 	@revision = entry[:revision]
	# 	@doctype = entry[:x_doctype_id]
	# 	@framework = entry[:x_framework_version_id]
	# 	@normalize = entry[:normalize]
	# 	@markup = entry[:markup]
	# 	@style = entry[:style]
	# 	@interaction = entry[:interaction]

	# 	# assets
	# 	assets = DB[:tinker_revision_asset].select(:url, :filetype).filter(
	# 		:x_tinker_hash => @hash,
	# 		:revision => @revision
	# 	).all

	# 	@assets = {}
	# 	assets.each do |asset|
	# 		if !@assets[asset[:filetype]]
	# 			@assets[asset[:filetype]] = []
	# 		end

	# 		@assets[asset[:filetype]] << asset[:url]
	# 	end
	# end

	#
	#
	#
	# def update(hash, entry)
	# 	response = {}
	# 	begin
	# 		client = Mysql2::Client.new(
	# 			:host => APP_CONFIG['db']['host'],
	# 			:username => APP_CONFIG['db']['user'],
	# 			:password => APP_CONFIG['db']['pass'],
	# 			:database => APP_CONFIG['db']['name']
	# 		)

	# 		query = 'UPDATE tinker SET name = "'+client.escape(entry[:title])+'", '
	# 		query << 'description = "'+client.escape(entry[:description])+'" '
	# 		query << 'WHERE hash = "'+client.escape(hash)+'"'
	# 		results = client.query(query)

	# 		query = 'SELECT MAX(revision) as max FROM tinker_revision '
	# 		query << 'WHERE x_tinker_hash = "'+hash+'"'
	# 		results = client.query(query)

	# 		max = results.first['max'].to_i
	# 		revision = (max + 1).to_s

	# 		query = 'INSERT INTO tinker_revision (x_tinker_hash, revision, x_doctype_id, '
	# 		query << 'x_framework_version_id, normalize, markup, style, interaction) '
	# 		query << 'VALUES ("'+client.escape(hash)+'", '+revision+', '
	# 		query << '"'+client.escape(entry[:doctype])+'", '
	# 		query << '"'+client.escape(entry[:framework])+'", '
	# 		query << entry[:normalize].to_s+', '
	# 		query << '"'+client.escape(entry[:markup])+'", '
	# 		query << '"'+client.escape(entry[:style])+'", '
	# 		query << '"'+client.escape(entry[:interaction])+'")'
	# 		results = client.query(query)

	# 		if entry[:assets]
	# 			entry[:assets].each do |type, assets|
	# 				assets.each do |asset|
	# 					query = 'INSERT INTO tinker_revision_asset(x_tinker_hash, revision, url, filetype) '
	# 					query << 'VALUES("'+client.escape(hash)+'", '+revision+', '
	# 					query << '"'+client.escape(asset)+'", "'+client.escape(type)+'")'
	# 					results = client.query(query)
	# 				end
	# 			end
	# 		end

	# 		response = {
	# 			:hash => hash,
	# 			:revision => revision
	# 		}
	# 	rescue Mysql2::Error => e
	# 		puts 'SQL ERROR: '+e.message
	# 	end
	# 	response.to_json
	# end

	#
	#
	#
	# def delete(hash, revision)
	# 	#
	# end
end

