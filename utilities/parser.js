

function body(request, callback) {
	var result = '';

	request.on('data', function handler(data) {
		result += data;
		if ( result.length > 1e6 ) {
			request.connection.destroy();
			return void callback(new Error('request exceeded max size'));
		}
	});

	request.on('end', function handler() {
		if ( ! result ) {
			return void callback(null, { });
		}

		try {
			return void callback(null, JSON.parse(result));
		} catch(error) {
			return void callback(error);
		}
	});
}

function cookies(request) {
	var result = { };

	if (!request.headers.cookie) {
		return result;
	}

	request.headers.cookie.split(';').forEach(function each(cookie) {
		var parts = cookie.split('=');
		result[parts[0].trim()] = parts[1] ? parts[1].trim() : '';
	});

	return result;
}

function query(request) {
	var result = { };

	if ( request.url.indexOf('?') === -1 ) {
		return result;
	}

	request.url.split('?')[1].split('&').forEach(function each(pair) {
		pair = pair.split('=');
		result[pair[0]] = pair[1];
	});

	return result;
}

function parameters(keys, values) {
	var result = { };

	values.forEach(function each(value, index) {
		if (value) {
			result[keys[index]] = value;
		}
	});

	return result;
}


module.exports = {
	body: body,
	cookies: cookies,
	query: query,
	parameters: parameters
};
