# Tinker

Tinker is an open-source tool to help people collaborate on code. It can also be found at https://tinker.io/


## Installing Tinker

```
$ git clone https://github.com/chielkunkels/tinker.git ~/projects/tinker
$ cd ~/projects/tinker
$ git submodule update --init --recursive
$ gem install sinatra sinatra-contrib mysql2 sequel sprockets haml sass
$ mysql -u user -p tinker < schema.sql
$ cp config-sample.yml config.yml
```

*Note: in the future Tinker will use Bundler, which should make installation of required gems a bit less painful.*

At this point, you'll want to crank open your editor of choice and modify `config.yml`. A sample config could look something like this:

```yaml
urls:
  client: 'http://localhost:9393/'
  sandbox: 'http://localhost:9394/'

db: 'mysql2://user:password@localhost/tinker'
ga_code: 'UA-29044087-1'
```

Tinker is written with Sinatra, which is written on top of Rack, so any kind of Rack-compatible server should work.


### Running locally with thin

Locally, I run Tinker on [Thin](http://code.macournoyer.com/thin/), so that's what I'll be using in this example.

```
$ gem install thin
$ thin -p 9393 -e development -P tmp/pids/tinker-client.pid -d -D start
$ thin -p 9394 -e development -P tmp/pids/tinker-sandbox.pid -d -D start
```

The client interface can now be found at `http://localhost:9393/` and the sandbox at `http://localhost:9394/`


### Compiling the javascript

Start off by installing [npm](http://npmjs.org/), then do this:

```
$ npm install -g wrapup
$ cd ~/projects/tinker/
$ wrup -r ./src/js/client.js --output ./public/tinker.client.js
$ wrup -r ./src/js/embed.js --output ./public/tinker.embed.js
```

## Copyright

Copyright (c) 2011 Chiel Kunkels

Tinker is licensed under the MIT license.
