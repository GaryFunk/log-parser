process.env.DIR = __dirname + "/data"

let helpers = require("./lib/helpers");
let ErrFile = require("./lib/errfile")

let errfiles = [];
let files = helpers.readDir(process.env.DIR);

for (let i = 0, len = files.length; i < len; i++) {
	errfiles[i] = new ErrFile(files[i]);
}

module.exports = errfiles;
