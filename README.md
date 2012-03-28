About
-----
Social code collaboration made simple.

Installation
------------
*TODO*: these instructions are incomplete

* Don't forget to update git submodules (libraries in vendor/).
* You need the following prerequisites installed:
  + a recent version of ruby and gem
  + mysql
  + ruby gems: sinatra haml sass json mysql2 sequel sprockets rack
* Create a config.yml file based on config-sample.yml and configure it with your
  desired URLs and mysql login information.
  *NOTE*: the `client` URL should not have any path components besides '/', this will
  currently break some path references. Example good value:
  http://localhost:9292/
* Create initial DB tables:
  + `mysql -u $USER -p $PASSWORD -D $DBNAME < setup/create_tables.sql`
  + `mysql -u $USER -p $PASSWORD -D $DBNAME < setup/data.sql`
* Start the server locally on port 9292 with `rackup -p 9292 config.ru`

Online
------
Visit Tinker at http://tinker.io.

Copyright
---------
Copyright (c) 2011 Chiel Kunkels

Tinker is licensed under the MIT license.
