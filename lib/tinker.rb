class Tinker

	#
	#
	#
	def initialize
		@dirty = false
		@data = {}
	end

	#
	#
	#
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

		data = DB[:tinker_revision_asset].select(:url).filter(
			:x_tinker_hash => hash,
			:revision => revision
		).all

		assets = []
		data.each do |asset|
			assets << asset[:url]
		end

		tinker['assets'] = assets
		tinker
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
		!@data['hash'] || @data['hash'].nil?
	end

	def []( key )
		@data[key] || nil
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

	#
	#
	#
	def new_revision
		revision = DB[:tinker_revision].filter(:x_tinker_hash => @data['hash']).max(:revision)
		revision.to_i + 1
	end

	#
	#
	#
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

	#
	#
	#
	def to_json
		@data.to_json
	end
end

