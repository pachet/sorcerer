

function convertToXML(data) {
	return 'obobobobo';
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
		result += '<li>' + convertToHTML(value) + '</li>';
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
	var result = '';

	try {
		data = JSON.parse(JSON.stringify(data));
	} catch(e) {
		return '';
	}

	if (!is_fragment) {
		result += '<!DOCTYPE html><html><head></head><body>';
	}

	if (isArray(data)) {
		result += formatArrayAsHTML(data);
	} else if (data instanceof Object) {
		result += formatObjectAsHTML(data);
	} else {
		result += formatPrimitiveAsHTML(data);
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
