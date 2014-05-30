

function convertToXML(data) {
	//TODO
	//implement
	return data;
}

function isArray(value) {
	if (!value) {
		return false;
	}

	return Object.prototype.toString.call(value) === '[object Array]';
}

function formatArrayAsHTML(array) {
	var result = '<ol>';

	array.forEach(function each(value) {
		result += '<li>' + convertToHTML(value, true) + '</li>';
	});

	result += '</ol>';

	return result;
}

function formatObjectAsHTML(object) {
	var key,
		result = '';

	result += '<ul>';
	for (key in object) {
		result += '<li>';
		result += key + ':';
		if (key === 'href') {
			object[key] = '<a href="' + object[key] + '">' + object[key] + '</a>';
		}
		result += convertToHTML(object[key], true);
		result += '</li>';
	}

	result += '</ul>';

	return result;
}

function formatPrimitiveAsHTML(primitive) {
	return '&nbsp;<strong>' + primitive + '</strong>';
}

function convertToHTML(data, is_fragment) {
	var result;

	if (typeof data === 'string') {
		return ' <strong>' + data + '</strong>';
	}

	result = '';

	try {
		data = JSON.parse(JSON.stringify(data));
	} catch(e) {
		return '&nbsp';
	}

	if (!is_fragment) {
		result += '<!DOCTYPE html><html><head></head><body>';
	}

	if (isArray(data)) {
		result += formatArrayAsHTML(data, is_fragment);
	} else if (data instanceof Object) {
		result += formatObjectAsHTML(data, is_fragment);
	} else {
		result += formatPrimitiveAsHTML(data, is_fragment);
	}

	if (!is_fragment) {
		result += '</body></html>';
	}

	return result;
}


module.exports = {
	convertToXML: convertToXML,
	convertToHTML: convertToHTML
};
