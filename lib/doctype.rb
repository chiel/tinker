#
class Doctype
	#
	class << self
		#
		#
		#
		# def get(id)
		# 	if !id
		# 		return nil
		# 	end
		# 	version = DB[:framework_version].select(:id, :x_framework_id, :name, :dirname, :filename).filter(:id => id).first;
		# 	framework = DB[:framework].select(:name, :dirname).filter(:id => version[:x_framework_id]).first
		# 	# puts framework
		# 	# puts version
		# 	version[:filepath] = framework[:dirname]+'/'+version[:dirname]+'/'+version[:filename]
		# 	version
		# end

		#
		# Grab a list of all available libraries
		#
		def list
			DB[:doctype].select(:id, :name).order(:id.desc).all
		end

		#
		# Get the doctype code for an id
		#
		def code(id)
			doctype = DB[:doctype].select(:code).filter(:id => id).first
			doctype[:code]
		end
	end
end
