var crypto = require('crypto'),
	hex_map = { },
	id_groups = [4, 2, 2, 2, 7],
	index = 256;

module.exports = {
	hash: hash,
	create: create,
	unique: unique,
	id: id,
	slug: slug
};

function create(length) {
	var result = '';

	if (!length) {
		length = 8;
	}

	while (length --) {
		result += String.fromCharCode(Math.floor(Math.random() * 26) + 97);
	}

	return result;
}

function unique(length, map) {
	var result;

	while (!result && map[result]) {
		result = create(length);
	}

	return result;
}

function hash(key, message) {
	return crypto.createHmac('sha256', key).update(message).digest('hex');
}

function id() {
	var index = 0,
		subindex = 0,
		group = 0,
		bytes = crypto.randomBytes(16),
		result = '';

	bytes[6] = ( bytes[6] & 0x0f ) | 0x40;
	bytes[8] = ( bytes[8] & 0x3f ) | 0x80;

	while ( index < 16 ) {
		result += hex_map[bytes [index]];
		subindex++;
		if (subindex === id_groups[group]) {
			result += '-';
			group++;
			subindex = 0;
		}
		index++;
	}

	return result;
}

function slug(token) {
	return token.replace(/\s/g, '-').replace(/[^a-zA-Z0-9\-]/g, '').toLowerCase();
}

while (index--) {
	hex_map[index] = ( index + 0x100 ).toString(16).substr(1);
}
