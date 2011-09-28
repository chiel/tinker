class Client < Controller
	get '/' do
		bouncie = {'html' => '', 'css' => '', 'js' => ''}
		haml :index, :locals => {:bouncie => bouncie}
	end
	get '/:bouncie?' do
		bouncie = {'html' => '<a href="#"></a>', 'css' => 'body {
  font: 12px \'helvetica neue\', arial, helvetica, sans-serif;
}
a {
  color: #f00;
}', 'js' => 'var a = document.getElement(\'a\');
a.addEvent(\'click\', function(e) {
  e.stop();
  console.log(\'clicked\');
});'}
		haml :index, :locals => {:bouncie => bouncie}
	end
	get '/save/?' do
		'save here'
	end
	get '/css/base.css' do
		sass :base
	end
end
