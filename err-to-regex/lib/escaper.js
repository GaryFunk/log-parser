/*
* 	Escaper : escapes plain text into a regular expression
*
* 	escape(str) : main method to takes in a plain text (string) and returns a string
* 	representing the matching regular expression. It's expected that a user will call
* 	`new Regexp(result)` somewhere after calling this method.
* */
class Escaper {
	escape(str) {
		throw new Error("escape() not implemented");
	}
}

class DefaultEscaper extends Escaper {
	constructor() {
		super();
		this.custom = [];
	}

	escape(str) {
		// *NOTE* order matters here, executing any `escape_` method before escape_slashes()
		// will result in an invalid regular expression due to duplicate 'escape' slashes.
		// (e.g moving whitespaces before would results in `\\s` becoming `\\\s`)
		str = escape_slashes(str);
		str = escape_delimiters(str);
		str = escape_whitespaces(str);
		str = escape_hexadecimal(str);
		str = escape_common_date_formats(str);
		this.custom.forEach(regex => {
			str = _escape(regex, str);
		})
		return str;
	}

	add_custom_escape(regexp) {
		this.custom.push(regexp);
	}
}

function escape_common_date_formats(str) {
	// 0000-00-00 00:00:00AM|PM
	str = _escape(/\d{4}-\d{2}-\d{2}\\s*\d{2}:\d{2}:\d{2}[A-Z]{1,2}/, str);
	return str;
}

function escape_hexadecimal(str) {
	// 0x0A, 0x0AF, ..., 0xFFFFFFFF
	str = _escape(/0x[A-F0-9]{2,8}/, str);
	return str;
}

function escape_delimiters(str) {
	str = _escape(/\(/, str);
	str = _escape(/\)/, str);
	str = _escape(/\[/, str);
	str = _escape(/\]/, str);
	str = _escape(/\./, str);
	return str;
}

function escape_whitespaces(str) {
	str = _escape(/\n/, str);
	str = _escape(/\t+/, str);
	str = _escape(/\s+/, str);
	return str;
}

function escape_slashes(str) {
	str = _escape(/\\/, str);
	str = _escape(/\//, str);
	return str;
}

function _escape(regexp, str) {
	const _regex = regexp.toString();
	const literal = _regex.slice(1, _regex.length-1);
	return str.replace(new RegExp(`${literal}`, 'g'), literal);
}

module.exports = { Escaper, DefaultEscaper };