
module.exports = {
	tokenize: tokenize
};


function tokenize ( string ) {
	var
		string_parts,
		regex,
		parameters,
		index = 0,
		length,
		part;

	if (string instanceof RegExp) {
		return [string, [ ]];
	}

	regex = '^\\/';
	parameters = [ ];

	if (string [0] === '/') {
		string = string.slice(1);
	}

	if (string [string.length - 1] === '/') {
		string = string.slice(0, -1);
	}

	string_parts = string.split('/');
	length = string_parts.length;

	while (index < length) {
		part = string_parts [index];

		if (index > 0) {
			regex += '\\/';
		}

		if (part [0] === ':') {
			regex += '([a-zA-Z0-9-_~\\.%@]+)';
			parameters.push(part.slice(1));
		} else {
			regex += part;
		}

		index ++;
	}

	regex += '\\/?(\\?[\\w\\=\\&]+)?$';

	return [
		new RegExp(regex),
		parameters
	];
}
