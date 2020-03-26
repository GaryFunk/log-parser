let fs = require("fs");

let helpers = {
  readFile(path) {
    return fs.readFileSync(path, "utf8", (err, data) => {
			if (err) {
				console.log(`There was an error: ${err}. Exiting`);
				return;
			}
			return data;
		})
	},

	readDir(dir) {
		return fs.readdirSync(dir, { encoding: "utf8" });
	},

  toRegExp(arr) {
		let acc = [];

    for (let i = 0, len = arr.length; i < len; i++) {
			acc.push(
				new RegExp(arr[i].replace(/\\/g, "\\\\")
						.replace(/\//g, "\\/")
						.replace(/Validator\s+\(\d{0,2}\)/g, "Validator\\s+(\\d{0,2})")
						.replace(/\n/g, "\\n*\\s*")
						.replace(/\t+/g, "\\t*")
						.replace(/\s+/g, "\\s*")
						.replace(/\./g, "\\.")
						.replace(/\(/g, "\\(")
						.replace(/\)/g, "\\)")
						.replace(/\[/g, "\\[")
						.replace(/\]/g, "\\]")
						.replace(/\d{4}-\d{2}-\d{2}\\s\*\d{2}:\d{2}:\d{2}[A-Z]/g, "\\d{4}-\\d{2}-\\d{2}\\s\+\\d{2}:\\d{2}:\\d{2}[A-Z]")
						.replace(/\\n\\s\*\-\-\-\\n\\s\*/g, "\n\n")
						.replace(/\{[A-Z0-9]{8}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{12}\}/g, "\{[A-Z0-9]{8}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{12}\}")
						.replace(/0x[A-Z0-9]{8}/g, "0x[A-Z0-9]{8}"), "gi")
			)
		}

		return acc;
  }
}

module.exports = helpers;