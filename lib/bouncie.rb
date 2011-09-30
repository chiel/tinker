class Bouncie

	attr_reader :html, :css, :js

	def initialize(hash = nil)
		if hash
			self.read hash
		end
	end

	def read(hash)
		# Some dirty debug stuff
		@html = '<a href="#"></a>'
		@css = 'body {
  font: 12px \'helvetica neue\', arial, helvetica, sans-serif;
}
a {
  color: #f00;
}'
		@js = 'var a = document.getElement(\'a\');
a.addEvent(\'click\', function(e) {
  e.stop();
  console.log(\'clicked\');
});'
	end
end
