var defaults = { };

function send (response, status, message, headers) {
	if (typeof status !== 'number') {
		headers = message;
		message = status;
		status = 200;
	}

	if (headers === undefined) {
		headers = defaults;
	}

	if (typeof message !== 'string') {
		try {
			message = JSON.stringify(message);
		} catch(error) {
			status = 500;
			message = JSON.stringify({
				error: error
			});
		}
		response.content_type = 'application/json';
	}

	if (!headers['Content-Type']) {
		if (response.content_type) {
			headers['Content-Type'] = response.content_type;
		} else {
			headers['Content-Type'] = 'application/json';
		}
	}

	response.writeHead(status, headers);
	response.end(message);
}

function stream(response, status, out_stream, headers) {

}

module.exports = {
	send : send,
	stream : stream
};
