var
	Router = require('./router'),
	extend = require('../utilities/extend'),
	accepts = require('../utilities/accepts'),
	converter = require('../utilities/converter');


module.exports = Resource;

function isArray(array) {
	return array && Object.prototype.toString.call(array) === '[object Array]';
}

function Resource(parameters) {
	this.description = parameters.description;
	this.key = parameters.key || 'id';
	this.url = parameters.url;
	this.routers = [ ];
	this.get = parameters.get;
	this.put = parameters.put;
	this.post = parameters.post;
	this.delete = parameters.delete;
	this.parent = parameters.parent;

	this.links = { };

	this.identity = {
		href: this.url,
		description: this.description,
		methods: [ ]
	};

	this.fields = {
		links: {
			'self': this.identity,
			'parent': this.parent
		}
	};

	this.routers.forEach((function each(router) {
		this.addRouter(router, true);
	}).bind(this));
}


Resource.prototype = {
	routers: null,
	item_resource: null,
	allowed_verbs: [
		'get',
		'put',
		'post',
		'delete'
	]
};

Resource.prototype.link = function link(name, properties) {
	var subresource,
		key,
		url;

	if (this.url !== '/') {
		url = this.url + '/' + name;
	} else {
		url = '/' + name;
	}

	if (properties instanceof Resource) {
		subresource = properties;
	} else {
		subresource = new Resource(extend({
			url: url,
			parent: this.identity
		}, properties));
	}

	// trim off leading colon, if it exists:
	if (name[0] === ':') {
		this.item_resource = subresource;
		key = name.slice(1);
	} else {
		key = name;
	}

	this.fields.links[key] = subresource.identity;

	this.routers.forEach(function each(router) {
		subresource.addRouter(router);
	});


	return subresource;
};

Resource.prototype.hasServer = function hasServer(server) {
	var index = this.routers.length;

	while (index--) {
		if (this.routers[index].server === server) {
			return true;
		}
	}

	return false;
};

Resource.prototype.attach = function attach(server) {
	if (this.hasServer(server)) {
		return;
	}
	
	this.addRouter(new Router(server));
};

Resource.prototype.describe = function describe(description) {
	this.description = description;
	this.identity.description = description;
};

Resource.prototype.wrap = function wrap(result, url) {
	var links = { },
		key,
		link,
		original_href,
		new_href,
		token,
		parts,
		subresource;

	for (key in this.fields.links) {
		link = this.fields.links[key];

		if (!link) {
			continue;
		}

		original_href = link.href;
		if (original_href && url !== this.url) {
			delete link.href;
			new_href = original_href.replace(this.url, url);
			if (new_href.indexOf(':') !== -1) {
				if (key === 'parent') {
					token = new_href.split('/').pop();
					if (token[0] === ':') {
						parts = url.split('/');
						new_href = new_href.replace(token, parts[parts.length - 2]);
					}
				} else {
					new_href = new_href.replace(/:([^\/]+)/, function replacer(match, token) {
						var value = result[token],
							type = typeof value;

						if (type === 'string' || type === 'number') {
							return value;
						}

						return match;
					});
				}
			}

			links[key] = extend({
				href: new_href
			}, link);
			link.href = original_href;
		} else {
			links[key] = link;
		}
	}

	key = this.key;

	if (isArray(result)) {
		subresource = this.item_resource;

		if (subresource) {
			result.forEach(function each(item) {
				var key = item[key] || item.id;
				
				if (key) {
					subresource.wrap(item, url + '/' + key);
				}
			});
		}

		result = {
			items: result
		};
	}

	result.links = links;

	return result;
};

Resource.prototype.addRouter = function addRouter(router, prevent_recursion) {
	if (this.hasServer(router.server)) {
		return;
	}

	this.routers.push(router);
	this.allowed_verbs.forEach((function each(verb) {
		var handler = this[verb],
			key;

		if (handler) {
			this.addRoute(router, verb, handler);
			if (!prevent_recursion) {
				for (key in this.links) {
					//TODO
					//recursively attach handlers to children
				}
			}
		}
	}).bind(this));
};

Resource.prototype.addRoute = function addRoute(router, key, handler) {
	var wrap = this.wrap.bind(this);

	if (this.identity.methods.indexOf(key) === -1) {
		this.identity.methods.push(key);
	}

	router.declare(key, this.url, function interstitial(request, response) {
		handler(request, response, function(error, result) {
			if (error) {
				return void response.error(error);
			}

			result = wrap(result, request.url);

			if (!accepts(request, 'json')) {
				if (accepts(request, 'html')) {
					result = converter.convertToHTML(result);
					response.setType('html');
				} else {
					result = converter.convertToXML(result);
					response.setType('xml');
				}
			} else {
				response.setType('json');
			}

			return void response.send(result);
		});
	});
};



