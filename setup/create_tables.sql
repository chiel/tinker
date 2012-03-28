CREATE TABLE IF NOT EXISTS tinker (
  hash CHAR(5) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  PRIMARY KEY (hash)
) ENGINE=InnoDB DEFAULT CHARSET 'utf8';

CREATE TABLE IF NOT EXISTS tinker_revision (
  x_tinker_hash CHAR(5) NOT NULL,
  revision INT(10) NOT NULL DEFAULT 0,
  x_doctype_id INT(10) NOT NULL,
  x_framework_version_id int(10) NOT NULL,
  normalize BOOL NOT NULL,
  markup TEXT NOT NULL,
  style TEXT NOT NULL,
  interaction TEXT NOT NULL,
  PRIMARY KEY (x_tinker_hash, revision)
) ENGINE=InnoDB DEFAULT CHARSET 'utf8';

CREATE TABLE IF NOT EXISTS tinker_revision_asset (
  x_tinker_hash CHAR(5) not null,
  revision INT(10) not null,
  url VARCHAR(255) not null
) ENGINE=InnoDB DEFAULT CHARSET 'utf8';

CREATE TABLE IF NOT EXISTS tinker_revision_extension (
  x_tinker_hash CHAR(5) not null,
  revision INT(10) not null,
  x_framework_extension_id int (10) not null
) ENGINE=InnoDB DEFAULT CHARSET 'utf8';

CREATE TABLE IF NOT EXISTS doctype (
  id int(10) NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  code TEXT NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET 'utf8';

CREATE TABLE IF NOT EXISTS framework (
  id int(10) NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  dirname VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET 'utf8';

CREATE TABLE IF NOT EXISTS framework_version (
  id int(10) NOT NULL AUTO_INCREMENT,
  x_framework_id int(10) NOT NULL,
  name VARCHAR(255) NOT NULL,
  dirname VARCHAR(255) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  PRIMARY KEY(id)
) ENGINE=InnoDB DEFAULT CHARSET 'utf8';

CREATE TABLE IF NOT EXISTS framework_extension (
  id int(10) NOT NULL AUTO_INCREMENT,
  x_framework_version_id int(10) NOT NULL,
  name VARCHAR(255) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  PRIMARY KEY(id)
) ENGINE=InnoDB DEFAULT CHARSET 'utf8';

CREATE TABLE IF NOT EXISTS user (
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  hash CHAR(5) NOT NULL,
  status INT(10) NOT NULL,
  PRIMARY KEY (username)
) ENGINE=InnoDB DEFAULT CHARSET 'utf8';

