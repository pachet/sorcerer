
function accepts(request, type) {
	var header = request.headers.accept;
	
	if(!header) {
		return true;
	}

	return header.indexOf(type) !== -1;
}


module.exports = accepts;
