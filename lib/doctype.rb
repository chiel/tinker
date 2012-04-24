#
class Doctype
	#
	class << self

		# Grab a list of all available libraries
		def list
			DB[:doctype].select(:id, :name).order(:id.desc).all
		end

		# Get the doctype code for an id
		def code(id)
			doctype = DB[:doctype].select(:code).filter(:id => id).first
			doctype[:code]
		end
	end
end
