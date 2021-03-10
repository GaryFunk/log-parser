const { DefaultEscaper } = require("./lib/escaper");
const build_definitions = require("./lib/definition");

const myEscaper = new DefaultEscaper();
myEscaper.add_custom_escape(/Validator\s+\(\d{0,2}\)/);

module.exports = build_definitions(myEscaper);