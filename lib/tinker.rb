# A class to manage everything concerning tinkers
class Tinker

	# Create a new tinker
	def initialize
		@dirty = false
		@data = {}
	end

	# Find a tinker by hash (and revision)
	def self.find( hash, revision = nil )
		tinker = Tinker.new
		return tinker unless hash

		data = DB[:tinker].join(:tinker_revision, :tinker_revision__x_tinker_hash => :hash)
		data = data.filter(:hash => hash)
		if revision == nil
			data = data.order(:tinker_revision__revision.desc)
		else
			data = data.filter(:tinker_revision__revision => revision)
		end
		data = data.first

		return tinker unless data

		tinker['hash'] = hash
		tinker['revision'] = data[:revision]
		tinker['doctype'] = data[:x_doctype_id]
		tinker['framework'] = data[:x_framework_version_id]
		tinker['normalize'] = data[:normalize]
		tinker['title'] = data[:title]
		tinker['description'] = data[:description]
		tinker['markup'] = data[:markup]
		tinker['style'] = data[:style]
		tinker['interaction'] = data[:interaction]

		assets = []
		data = DB[:tinker_revision_asset].select(:url).filter(
			:x_tinker_hash => hash,
			:revision => tinker['revision']
		).all
		data.each do |asset|
			assets << asset[:url]
		end
		tinker['assets'] = assets

		extensions = []
		data = DB[:tinker_revision_extension].select(:x_framework_extension_id).filter(
			:x_tinker_hash => hash,
			:revision => tinker['revision']
		).all
		data.each do |extension|
			extensions << extension[:x_framework_extension_id]
		end
		tinker['extensions'] = extensions

		tinker
	end

	# Check if anything has changed in the tinker
	def dirty?
		@dirty
	end

	# Check if it's a new tinker
	def new?
		!@data['hash'] || @data['hash'].nil?
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

	# Get a new unique hash
	def new_hash
		longhash = Digest::SHA1.hexdigest(Time.new.to_i.to_s)
		i = 0
		hash = nil
		while true do
			hash = longhash[i..(i+4)]
			if DB[:tinker].filter(:hash => hash).count == 0
				break
			end
		end
		hash
	end

	# Get a new revision number for the current hash
	def new_revision
		revision = DB[:tinker_revision].filter(:x_tinker_hash => @data['hash']).max(:revision)
		revision.to_i + 1
	end

	# Save the tinker's current state
	def save
		return true unless dirty?

		if new?
			@data['hash'] = new_hash
			@data['revision'] = 0
			DB[:tinker].insert(:hash => @data['hash'], :title => @data['title'], :description => @data['description'])
		else
			@data['revision'] = new_revision
			DB[:tinker].filter(:hash => @data['hash']).update(:title => @data['title'], :description => @data['description'])
		end

		DB[:tinker_revision].insert(
			:x_tinker_hash => @data['hash'],
			:revision => @data['revision'],
			:x_doctype_id => @data['doctype'],
			:x_framework_version_id => @data['framework'],
			:normalize => @data['normalize'],
			:markup => @data['markup'],
			:style => @data['style'],
			:interaction => @data['interaction']
		)

		if @data['extensions']
			@data['extensions'].each do |extension|
				DB[:tinker_revision_extension].insert(
					:x_tinker_hash => @data['hash'],
					:revision => @data['revision'],
					:x_framework_extension_id => extension
				)
			end
		end

		if @data['assets']
			@data['assets'].each do |asset|
				DB[:tinker_revision_asset].insert(
					:x_tinker_hash => @data['hash'],
					:revision => @data['revision'],
					:url => asset
				)
			end
		end

		return true
	end

	# Return a json object representing the tinker's state
	def to_json
		data = @data.dup
		data['markup'] = CGI::escapeHTML data['markup']
		data['style'] = CGI::escapeHTML data['style']
		data['interaction'] = CGI::escapeHTML data['interaction']
		data.to_json
	end
end

