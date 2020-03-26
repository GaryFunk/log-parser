let helpers = require("./helpers")

class ErrFile {
	constructor(path) {
		this.path = process.env.DIR + "/" + path;

		this.data = helpers.readFile(this.path);
		this.regexp = helpers.toRegExp(this.getErrors());

		this.errorID = this.getErrorID();
		this.desc = this.getDesc();
		this.links = this.getLinks();
	}

	getRegExp() {
		return this.regexp;
	}

	getErrorID() {
		let split = this.path.split("/");
		let file_name = split[split.length - 1];
		let errorID = file_name.match(/([A-Za-z0-9_-]+)(?:\.txt)/)[1];

		return errorID.replace(/_/, " ");

	}

	getErrors() {
		let errors = this.data.split(/^===$/gm)[0];
		let errors_arr = errors.split((/^:::$/gm));

		for (let i = 0, len = errors_arr.length; i < len; i++) {
			errors_arr[i].replace(/^\n/g, "");
		}

		return errors_arr;
	}

	getDesc() {
		let data = this.data.split(/^===$/gm)[1];
		data.replace(/^\n/g, "");
		return data;
	}

	getLinks() {
		let data = this.data.split(/^===$/gm)[2];
		if (data) {
			data.replace(/^\n\s?/, "");
		}
		return data;
	}
}

module.exports = ErrFile;