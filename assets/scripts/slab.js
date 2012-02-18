/*
Script: Slab.js
	Pretty simple templating.

Copyright and License:
	(c) 2012, Mark Obcena <markeeto@gmail.com>
	MIT-Style License
*/

(function(context){

var exps = {
	breakOrEmpty: (/%#=#%|\n;\s*\n/g),
	strings: (/('|").*\1/g),
	stringIdent: (/(%#%)[0-9]+\1/g),
	identifier: (/\.?[$A-Za-z_][$0-9A-Za-z_]*/g),
	reservedIdentifier: (/__[$0-9A-Za-z_]*/g),
	extractedIdentifier: (/^([$A-Za-z_][$0-9A-Za-z_]*)\./),
	operators: (/\s+(and|or|eq|neq|is|isnt)\s+/),
	statement: (/\{\s*([^}]+?)\s*\}/g),
	endState: (/^end$/),
	elseState: (/^else$/),
	elseIfState: (/^else\s+if\s+(.+)$/),
	ifState: (/^if\s+(.+)$/),
	eachState: (/^each\s+([$A-Za-z_][$0-9A-Za-z_]*)(?:\s*,\s*([$A-Za-z_][0-9A-Za-z_]*))?\s+in\s(.+)$/),
	forState: (/^for\s+([$A-Za-z_][$0-9A-Za-z_]*)(?:\s*,\s*([$A-Za-z_][0-9A-Za-z_]*))?\s+in\s+(.+)$/),
	forEveryState: (/^forEvery\s+([$A-Za-z_][$0-9A-Za-z_]*)(?:\s*,\s*([$A-Za-z_][0-9A-Za-z_]*))?\s+in\s+(.+)$/)
};

var slice = Array.prototype.slice;

function partial(fn){
	var args = slice.call(arguments, 1);
	return function(){
		return fn.apply(null, args.concat(slice.call(arguments)));
	};
}

// Operators
var ops = {
	and: ' && ', or: ' || ', eq: ' === ', neq: ' !== ',
	not: ' !', isnt: ' != ', is: ' == '
};

function parseOperators(_, op){
	return ops[op];
}

// (/^[$A-Za-z_][$0-9A-Za-z_]*/)

// End Statement
function parseEnd(stack){
	stack.pop();
	stack.pop();
	return '} %#=#%';
}

// Else Statement
function parseElse(){
	return '} else { %#=#%';
}

// Else If Statement
function parseElseIf(stack, _, state){
	return '} else if (' + parseIdents(stack, state) +') { %#=#%';
}

// If Statement
function parseIf(stack, _, state){
	stack.push(null, null);
	return 'if (' + parseIdents(stack, state) + ') { %#=#%';
}

// Each Statement
var iterator = 0;

function parseEach(stack, _, iter, value, array){
	/*jsl:ignore*/
	if (!value) iter = (value = iter, 'iterator' + iterator++);
	/*jsl:end*/
	var length = 'length' + iterator++;
	array = resolveIdents(stack, array);
	stack.push(iter, value);
	return 'for (var ' + iter + ' = 0, '
		+ length + ' = ' + array + '.length; '
		+ iter + ' < ' + length + '; ' + iter + '++) { %#=#%'
		+ 'var ' + value + ' = ' + array + '[' + (iter) + ']';
}

// For Statement

function parseFor(stack, _, key, value, object){
	/*jsl:ignore*/
	if (!value) key = (value = key, 'iterator' + iterator++);
	/*jsl:end*/
	object = resolveIdents(stack, object);
	stack.push(key, value);
	return 'for (var ' + key + ' in ' + object + '){ %#=#%'
		+ 'if (!' + object + '.hasOwnProperty('+ key +')) continue; %#=#%'
		+ 'var ' + value + ' = ' + object + '[' + key +']';
}

function parseForEvery(stack, _, key, value, object){
	/*jsl:ignore*/
	if (!value) key = (value = key, 'iterator' + iterator++);
	/*jsl:end*/
	object = resolveIdents(stack, object);
	stack.push(key, value);
	return 'for (var ' + key + ' in ' + object + '){ %#=#%'
		+ 'var ' + value + ' = ' + object + '[' + key +']';
}

// Identifiers

var notIdents = {
	'true': 1, 'false': 1, 'null': 1, 'undefined': 1,
	'typeof': 1, 'instanceof': 1, 'if': 1, 'else': 1,
	'_data_': 1
};

function resolveIdents(stack, match){
	var _match = match,
		matches = match.match(exps.extractedIdentifier);
	if (matches) match = matches[1];
	if (exps.reservedIdentifier.test(match)) return match;
	return (match.charAt(0) == '.'
		|| stack.indexOf(match) != -1
		|| notIdents[match]) ? _match : '_data_.' + _match;
}

function resolveReservedIdents(match){
	return match.slice(2);
}

function parseIdents(stack, str){
	var strings = {}, ident = 0;
	return str.replace(exps.strings, function(match, id){
		strings[(id = '%#%' + ident + '%#%')] = match;
		return id;
	}).replace(exps.identifier, partial(resolveIdents, stack))
	.replace(exps.reservedIdentifier, resolveReservedIdents)
	.replace(exps.stringIdent, function(match){ return strings[match]; });
}


var macros = {
	'string': function(x){
		return x + '.toString()';
	},
	'int': function(x, base){
		return 'parseInt(' + x + ', ' + base + ')';
	},
	'bool': function(x){
		return '(!!(' + x + '))';
	},
	'uppercase': function(x){
		return x + '.toUpperCase()';
	},
	'lowercase': function(x){
		return x + '.toLowerCase()';
	},
	'uri_encode': function(x){
		return '__encodeURIComponent(' + x + ')';
	},
	'uri_decode': function(x){
		return '__decodeURIComponent(' + x + ')';
	}
};

function expandMacros(string){
	for (var macro in macros){
		if (!macros.hasOwnProperty(macro)) continue;
		string = string.replace(new RegExp('#' + macro + '\\((.*)\\)', 'g'), function(_, args){
			args = args.split(',');
			var _args = [];
			for (var i = 0, l = args.length; i < l; i++) _args[i] = strip(args[i]);
			return macros[macro].apply(null, _args);
		});
	}
	return string;
}

// Main Parser
function parseStatement(stack, match, inner){
	var result = '"; %#=#%',
		prev = inner = expandMacros(inner).replace(exps.operators, parseOperators);

	inner = inner.replace(exps.elseState, parseElse)
		.replace(exps.elseIfState, partial(parseElseIf, stack))
		.replace(exps.ifState, partial(parseIf, stack))
		.replace(exps.eachState, partial(parseEach, stack))
		.replace(exps.forState, partial(parseFor, stack))
		.replace(exps.forState, partial(parseForEvery, stack))
		.replace(exps.endState, partial(parseEnd, stack));

	if (inner == prev){
		result += '_buffer_ += ';
		inner = parseIdents(stack, inner);
	}

	return result + inner.replace(/\t|\n|\r/, '') + '; %#=#%_buffer_ += "';
}

// Cleanup
function clean(str){
	return str.replace(/_buffer_\s\+=\s"";/g, '')
		.replace(/\n/g, '\\n')
		.replace(/\t/g, '\\t')
		.replace(/\r/g, '\\r')
		.replace(exps.breakOrEmpty, '\n');
}

function strip(str){
	return str.replace(/^\s+|\s+$/, '');
}

// Public Functions

var parseCache = {},
	compileCache = {},
	generateCache = {},
	scriptIter = 1;

function parse(str, id){
	id = id || 'script' + (scriptIter++) + '.js';
	if (parseCache[str]) return parseCache[str];
	var stack = [];
	return (parseCache[str] = clean( 'var _buffer_ = ""; %#=#%_buffer_ += "'
			+ str.replace(exps.statement, partial(parseStatement, stack))
			+ '"; %#=#%return _buffer_;%#=#%// @sourceURL=' + id));
}

function compile(str, id){
	if (compileCache[str]) return compileCache[str];
	var prev = str;
	str = str.replace(new RegExp('\\\\', 'g'), '\\\\').replace(/"/g, '\\"');
	try {
		return (compileCache[prev] = new Function('_data_', parse(str, id)));
	} catch(e){
		throw new Error('Cannot compile template: ' + fn);
	}
}

function generate(str, id){
	var key = id + '::' + str;
	if (generateCache[key]) return generateCache[key];
	str = str.replace(new RegExp('\\\\', 'g'), '\\\\').replace(/"/g, '\\"');
	return (generateCache[key] = 'function ' + (id || '') + '(_data_){\n' + parse(str, id) + '\n}');
}


// Cache Clearing

function clearCache(cache){
	for (var i in cache){
		if (cache.hasOwnProperty(i)) delete cache[i];
	}
}

parse.clear = partial(clearCache, parseCache);
compile.clear = partial(clearCache, compileCache);
generate.clear = partial(clearCache, generateCache);

context.slab = {
	compile: compile,
	parse: parse,
	generate: generate
};

})(typeof exports != 'undefined' ? exports : window);
