var
	Resource = require('./lib/resource');

module.exports = new Resource({
	url: '/',
	get: function get(request, response, callback) {
		return void callback(null, { });
	}
});

