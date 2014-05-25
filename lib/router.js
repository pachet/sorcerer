var responder = require('./responder'),
	keys = require('../utilities/keys'),
	promix = require('promix'),
	parser = require('../utilities/parser'),
	tokenizer = require('../utilities/tokenizer'),
	mimes = require('../utilities/mimes');

function array(args) {
	return Array.prototype.slice.call(args);
}

function Router(server) {
	this.routes = {
		'GET': [ ],
		'POST': [ ],
		'PUT': [ ],
		'DELETE': [ ]
	};

	this.server = server;
	this.server.on('request', this.serve.bind(this));
}

Router.prototype.declare = function declare(method, pattern, handler, ignore_session, ignore_body) {
	method = method.toUpperCase();
	pattern = tokenizer.tokenize(pattern);
	this.routes[method].push({
		method: method,
		pattern: pattern[0],
		parameters: pattern[1],
		exec: handler,
		weight: 0,
		session: !ignore_session,
		body: !ignore_body
	});
};

Router.prototype.bump = function bump(handler) {
	var method = this.routes[handler.method],
		index = method.indexOf(handler),
		replaced;

	handler.weight++;
	if (index + 1 < method.length && handler.weight > method[index + 1].weight + 4 ) {
		replaced = method[index + 1];
		method[index + 1] = handler;
		method[index] = replaced;
	}
};

Router.prototype.route = function route(request) {
	var method = this.routes[request.method],
		index = 0,
		length = method.length,
		match,
		handler,
		parameters,
		url = request.url;

	while (index < length) {
		handler = method[index];
		match = url.match(handler.pattern);
		if (match) {
			this.bump(handler);
			request.parameters = parser.parameters(handler.parameters, match.slice(1));
			return handler;
		}
		index++;
	}
};

Router.prototype.serve = function serve(request, response) {
	var handler = this.route(request);

	if (!handler) {
		return void responder.send(response, 404);
	}

	request.cookies = parser.cookies(request);
	request.query = parser.query(request);

	response.send = function success() {
		return void responder.send.apply(responder, [response].concat(array(arguments)));
	};

	response.setType = function setType(type) {
		this.content_type = mimes.type(type);
	};

	response.error = function failure(error) {
		if (!error) {
			error = { };
		}

		if (!error.status) {
			error.status = 500;
		}

		if (!error.message) {
			error.message = 'Internal server error';
		}

		return void responder.send(response, error.status, error.message);
	};

	this.prepare(handler, request, response);
};

Router.prototype.prepare = function prepare(handler, request, response) {
	if (!handler.body) {
		return void handler.exec(request, response);
	}

	parser.body(request, function interstitial(error, body) {
		if (error) {
			return void response.error(error);
		}

		response.body = body;
		handler.exec(request, response);
	});
};


module.exports = Router;
