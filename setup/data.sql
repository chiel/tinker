-- Doctypes
INSERT INTO doctype(name, code) VALUES("XHTML 1.0 Frameset", "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Frameset//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-frameset.dtd\">");
INSERT INTO doctype(name, code) VALUES("XHTML 1.0 Transitional", "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">");
INSERT INTO doctype(name, code) VALUES("XHTML 1.0 Strict", "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Strict//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd\">");

INSERT INTO doctype(name, code) VALUES("HTML 4.01 Frameset", "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01 Frameset//EN\" \"http://www.w3.org/TR/html4/frameset.dtd\">");
INSERT INTO doctype(name, code) VALUES("HTML 4.01 Transitional", "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01 Transitional//EN\" \"http://www.w3.org/TR/html4/loose.dtd\">");
INSERT INTO doctype(name, code) VALUES("HTML 4.01 Strict", "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01//EN\" \"http://www.w3.org/TR/html4/strict.dtd\">");

INSERT INTO doctype(name, code) VALUES("HTML 5", "<!DOCTYPE HTML>");

-- Frameworks and framework versions

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


-- YUI
-- INSERT INTO framework(id, name, dirname) VALUES(3, "YUI", "yui");


-- Dojo
-- INSERT INTO framework(id, name, dirname) VALUES(4, "Dojo", "dojo");


-- Raphael
-- INSERT INTO framework(id, name, dirname) VALUES(5, "Raphaël", "raphael");
