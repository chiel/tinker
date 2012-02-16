#
#
#
class Framework

	#
	#
	#
	def initialize

	end

	def self.get_extensions( ids )
		extensions = DB[:framework_extension].filter(:id => ids).all
		version = DB[:framework_version].select(:id, :x_framework_id, :name, :dirname, :filename).filter(:id => extensions[0][:x_framework_version_id]).first;
		framework = DB[:framework].select(:name, :dirname).filter(:id => version[:x_framework_id]).first
		extensions.each do |extension|
			extension[:filepath] = framework[:dirname]+'/'+version[:dirname]+'/'+extension[:filename]
		end
		extensions
	end

	#
	#
	#
	class << self
		#
		#
		#
		def get(id)
			if !id
				return nil
			end
			version = DB[:framework_version].select(:id, :x_framework_id, :name, :dirname, :filename).filter(:id => id).first;
			framework = DB[:framework].select(:name, :dirname).filter(:id => version[:x_framework_id]).first
			# puts framework
			# puts version
			version[:filepath] = framework[:dirname]+'/'+version[:dirname]+'/'+version[:filename]
			version
		end

		#
		# Grab a list of all available libraries
		#
		def list
			# Fetch frameworks
			frameworks = DB[:framework].select(:id, :name).all
			frameworks.each do |framework|
				# then versions
				versions = DB[:framework_version].select(:id, :name, :filename).filter(:x_framework_id => framework[:id]).order(:name.desc).all
				versions.each do |version|
					# then extensions
					extensions = DB[:framework_extension].select(:id, :name, :filename).filter(:x_framework_version_id => version[:id]).all
					version[:extensions] = extensions
				end
				framework[:versions] = versions
			end
			frameworks
		end
	end
end
