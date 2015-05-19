module.exports = function() {
	return new Screenshot(arguments);
};

var path = require('path');
var jimp = require('jimp');

function Screenshot(args) {
	var config = this.parseArgs(args);
	var self = this;

	try {
		require("./capture/" + process.platform + ".js")(config.options, function(error, success) {
			// TODO add option for string, rather than file

			if(error && typeof config.callback === "function")
				config.callback(error, success);
			else if(!error)
				self.resize(config.options.output, config.options, config.callback);

		});
	}
	catch(error) {
		if(typeof config.callback === "function") {
			if (typeof error == "object" && typeof error.code === "string" && error.code === "MODULE_NOT_FOUND")
				config.callback(null, "unsupported_platform");
		}
	}
}

Screenshot.prototype.resize = function(file, options, callback) {
	if(typeof options.width !== "number" && typeof  options.height !== "number") { // no resize
		if(typeof callback === "function")
			callback(null, true);
	}
	else {
		new jimp(file, function (err, image) {
			if(typeof options.width === "number")
				var resWidth = Math.floor(options.width);
			if(typeof options.height === "number")
				var resHeight = Math.floor(options.height);

			if(typeof resWidth === "number" && typeof resHeight !== "number") // resize to width, maintain aspect ratio
				var resHeight = Math.floor(image.bitmap.height * (resWidth / image.bitmap.width));
			else if(typeof resHeight === "number" && typeof resWidth !== "number") // resize to height, maintain aspect ratio
				var resWidth = Math.floor(image.bitmap.width * (resHeight / image.bitmap.height));

			try {
				image.resize(resWidth, resHeight).write(file, function(error, success) {
					if(typeof callback === "function")
						callback(error, (error == null));
				});
			}
			catch(error) {
				if(typeof callback === "function")
					callback(error, null);
			}
		});
	}
};

Screenshot.prototype.parseArgs = function(args) {
	var config = {options: {}};

	for(var property in args) {
		if (args.hasOwnProperty(property)) {
			switch(typeof args[property]) {
				case "string":
					var file = args[property];
					break;
				case "function":
					config.callback = args[property];
					break;
				case "object":
					if(args[property] != null)
						config.options = args[property];
					break;
			}
		}
	}

	if(typeof file === "string")
		config.options.output = file;

	if(typeof config.options.output === "string")
		config.options.output = path.resolve(config.options.output);

	return config;
};
