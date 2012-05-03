--
-- TABLES FIRST
--
CREATE TABLE tinker (
  hash CHAR(5) NOT NULL,
  x_fork_id INT(5) NOT NULL DEFAULT 0,
  x_user_id INT(5) NOT NULL DEFAULT 0,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  PRIMARY KEY (hash)
) ENGINE=InnoDB DEFAULT CHARSET 'utf8';

CREATE TABLE tinker_revision (
  id INT(10) NOT NULL AUTO_INCREMENT,
  x_tinker_hash CHAR(5) NOT NULL,
  revision INT(10) NOT NULL DEFAULT 0,
  x_doctype_id INT(10) NOT NULL,
  x_framework_version_id int(10) NOT NULL,
  normalize BOOL NOT NULL,
  markup TEXT NOT NULL,
  style TEXT NOT NULL,
  interaction TEXT NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY (x_tinker_hash, revision)
) ENGINE=InnoDB DEFAULT CHARSET 'utf8';

CREATE TABLE tinker_revision_asset (
  x_tinker_hash CHAR(5) not null,
  revision INT(10) not null,
  url VARCHAR(255) not null
) ENGINE=InnoDB DEFAULT CHARSET 'utf8';

CREATE TABLE tinker_revision_extension (
  x_tinker_hash CHAR(5) not null,
  revision INT(10) not null,
  x_framework_extension_id int (10) not null
) ENGINE=InnoDB DEFAULT CHARSET 'utf8';

CREATE TABLE doctype (
  id int(10) NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  code TEXT NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET 'utf8';

CREATE TABLE framework (
  id int(10) NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  dirname VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET 'utf8';

CREATE TABLE framework_version (
  id int(10) NOT NULL AUTO_INCREMENT,
  x_framework_id int(10) NOT NULL,
  name VARCHAR(255) NOT NULL,
  dirname VARCHAR(255) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  PRIMARY KEY(id)
) ENGINE=InnoDB DEFAULT CHARSET 'utf8';

CREATE TABLE framework_extension (
  id int(10) NOT NULL AUTO_INCREMENT,
  x_framework_version_id int(10) NOT NULL,
  name VARCHAR(255) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  PRIMARY KEY(id)
) ENGINE=InnoDB DEFAULT CHARSET 'utf8';

CREATE TABLE user (
  id int(10) NOT NULL AUTO_INCREMENT,
  username VARCHAR(255) NULL,
  password VARCHAR(255) NULL,
  email VARCHAR(255) NULL,
  hash VARCHAR(255) NULL,
  status int(10) NOT NULL DEFAULT 0,
  PRIMARY KEY(id)
) ENGINE=InnoDB DEFAULT CHARSET 'utf8';


--
-- DOCTYPES
--
INSERT INTO doctype(name, code) VALUES("XHTML 1.0 Frameset", "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Frameset//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-frameset.dtd\">");
INSERT INTO doctype(name, code) VALUES("XHTML 1.0 Transitional", "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">");
INSERT INTO doctype(name, code) VALUES("XHTML 1.0 Strict", "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Strict//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd\">");
INSERT INTO doctype(name, code) VALUES("HTML 4.01 Frameset", "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01 Frameset//EN\" \"http://www.w3.org/TR/html4/frameset.dtd\">");
INSERT INTO doctype(name, code) VALUES("HTML 4.01 Transitional", "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01 Transitional//EN\" \"http://www.w3.org/TR/html4/loose.dtd\">");
INSERT INTO doctype(name, code) VALUES("HTML 4.01 Strict", "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01//EN\" \"http://www.w3.org/TR/html4/strict.dtd\">");
INSERT INTO doctype(name, code) VALUES("HTML 5", "<!DOCTYPE HTML>");


--
-- FRAMEWORKS
--
-- Mootools
INSERT INTO framework(id, name, dirname) VALUES(1, "Mootools", "mootools");

INSERT INTO framework_version(id, x_framework_id, name, dirname, filename) VALUES(1, 1, "1.1.2", "1.1.2", "mootools.js");
INSERT INTO framework_version(id, x_framework_id, name, dirname, filename) VALUES(2, 1, "1.2.5", "1.2.5", "mootools.js");
INSERT INTO framework_version(id, x_framework_id, name, dirname, filename) VALUES(3, 1, "1.3.2", "1.3.2", "mootools.js");
INSERT INTO framework_version(id, x_framework_id, name, dirname, filename) VALUES(4, 1, "1.4.0", "1.4.0", "mootools.js");
INSERT INTO framework_version(id, x_framework_id, name, dirname, filename) VALUES(5, 1, "1.4.1", "1.4.1", "mootools.js");
INSERT INTO framework_version(id, x_framework_id, name, dirname, filename) VALUES(6, 1, "1.4.2", "1.4.2", "mootools.js");
INSERT INTO framework_version(id, x_framework_id, name, dirname, filename) VALUES(13, 1, "1.4.3", "1.4.3", "mootools.js");
INSERT INTO framework_version(id, x_framework_id, name, dirname, filename) VALUES(14, 1, "1.4.4", "1.4.4", "mootools.js");
INSERT INTO framework_version(id, x_framework_id, name, dirname, filename) VALUES(15, 1, "1.4.5", "1.4.5", "mootools.js");

INSERT INTO framework_extension(x_framework_version_id, name, filename) VALUES(2, "Mootools More 1.2.5.1", "mootools-more.js");
INSERT INTO framework_extension(x_framework_version_id, name, filename) VALUES(3, "Mootools More 1.3.2.1", "mootools-more.js");
INSERT INTO framework_extension(x_framework_version_id, name, filename) VALUES(4, "Mootools More 1.4.0.1", "mootools-more.js");
INSERT INTO framework_extension(x_framework_version_id, name, filename) VALUES(5, "Mootools More 1.4.0.1", "mootools-more.js");
INSERT INTO framework_extension(x_framework_version_id, name, filename) VALUES(6, "Mootools More 1.4.0.1", "mootools-more.js");
INSERT INTO framework_extension(x_framework_version_id, name, filename) VALUES(13, "Mootools More 1.4.0.1", "mootools-more.js");
INSERT INTO framework_extension(x_framework_version_id, name, filename) VALUES(14, "Mootools More 1.4.0.1", "mootools-more.js");
INSERT INTO framework_extension(x_framework_version_id, name, filename) VALUES(15, "Mootools More 1.4.0.1", "mootools-more.js");
INSERT INTO framework_extension(x_framework_version_id, name, filename) VALUES(4, "PowerTools! 1.1.1", "powertools.js");
INSERT INTO framework_extension(x_framework_version_id, name, filename) VALUES(5, "PowerTools! 1.1.1", "powertools.js");
INSERT INTO framework_extension(x_framework_version_id, name, filename) VALUES(6, "PowerTools! 1.1.1", "powertools.js");
INSERT INTO framework_extension(x_framework_version_id, name, filename) VALUES(13, "PowerTools! 1.1.1", "powertools.js");
INSERT INTO framework_extension(x_framework_version_id, name, filename) VALUES(14, "PowerTools! 1.1.1", "powertools.js");
INSERT INTO framework_extension(x_framework_version_id, name, filename) VALUES(15, "PowerTools! 1.1.1", "powertools.js");

-- jQuery
INSERT INTO framework(id, name, dirname) VALUES(2, "jQuery", "jquery");

INSERT INTO framework_version(id, x_framework_id, name, dirname, filename) VALUES(7, 2, "1.2.6", "1.2.6", "jquery.js");
INSERT INTO framework_version(id, x_framework_id, name, dirname, filename) VALUES(8, 2, "1.3.2", "1.3.2", "jquery.js");
INSERT INTO framework_version(id, x_framework_id, name, dirname, filename) VALUES(9, 2, "1.4.4", "1.4.4", "jquery.js");
INSERT INTO framework_version(id, x_framework_id, name, dirname, filename) VALUES(10, 2, "1.5.2", "1.5.2", "jquery.js");
INSERT INTO framework_version(id, x_framework_id, name, dirname, filename) VALUES(11, 2, "1.6.4", "1.6.4", "jquery.js");
INSERT INTO framework_version(id, x_framework_id, name, dirname, filename) VALUES(12, 2, "1.7.1", "1.7.1", "jquery.js");
