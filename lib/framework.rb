#
#
#
class Framework

	#
	#
	#
	def initialize

	end

	#
	# Grab a list of all available libraries
	#
	def list
		# Fetch frameworks
		frameworks = DB[:framework].select(:id, :name).all
		frameworks.each do |framework|
			# then versions
			versions = DB[:framework_version].select(:name, :filename).filter(:x_framework_id => framework[:id]).all
			versions.each do |version|
				# then extensions
				extensions = DB[:framework_extension].select(:name, :filename).filter(:x_framework_version_id => version[:id]).all
				version[:extensions] = extensions
			end
			framework[:versions] = versions
		end
		return frameworks
	end
end
