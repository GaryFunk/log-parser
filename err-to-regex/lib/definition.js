const fs = require('fs');
const path = require('path');

const ERRORS_DIR = path.resolve(__dirname, '../errors');
const FILE_EXT = /.*\.error\.json$/;

class ErrorDefinition {
	constructor() {
		this.name; 			// string
		this.description; 	// string
		this.tags; 			// []string

		this.value; 		// string
		this.b64value; 		// string
		this.isb64encoded;  // boolean
		this.raw_value;		// string
		this.regexp;		// RegExp

		this.hooks;			// []object
		this.limit_to;		// []string

		this.solutions;		// []object
		this.links;			// []object
	}
}

function get_error_files() {
	const files = fs.readdirSync(ERRORS_DIR);
	return files.filter(filename => filename.match(FILE_EXT));
}

function read_error_file(filename) {
	const content = fs.readFileSync(`${ERRORS_DIR}/${filename}`);
	const json = JSON.parse(content.toString());
	const definition = new ErrorDefinition();
	definition.name = json.name;
	definition.description = json.description;
	definition.tags = json.tags;
	definition.value = json.value;
	definition.hooks = json.hooks;
	definition.limit_to = json.limit_to;
	definition.hooks_async = json.hooks_async;
	definition.isb64encoded = json.b64encoded;
	definition.links = json.links;
	definition.solutions = json.solutions;
	return definition;
}

function update_error_file(filename, payload) {
	fs.writeFileSync(`${ERRORS_DIR}/${filename}`, JSON.stringify(payload));
}

/*
* 	build_definitions() : builds error definitions objects from *.error.log files
*
* 	param {Escaper} Escaper to escape regex "special" characters and custom patterns
* 	returns {[]ErrorDefinition} the array of parsed ErrorDefinitions
* */
function build_definitions(escaper) {
	return get_error_files().map(file => {
		const definition = read_error_file(file);
		// update the file with the following keys
		definition.raw_value = Buffer.from(definition.value, 'base64').toString();
		definition.raw_regexp = escaper.escape(definition.raw_value);
		update_error_file(file, definition);
		// exclude the below files from the update, only keep in memory
		definition.regexp = new RegExp(definition.raw_regexp, 'g');
		return definition;
	});
}

module.exports = build_definitions;