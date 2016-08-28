module.exports = function() {
	return new Screenshot(arguments);
};

var path = require('flavored-path');
var jimp = require('jimp');
var fs = require('fs');

function Screenshot(args) {
	var config = this.parseArgs(args);
	var self = this;

	try {
		require("./capture/" + process.platform + ".js")(config.options, function(error, options) {
			// TODO add option for string, rather than file
			if(error && typeof config.callback === "function")
				config.callback(error, null);
			else if(!error) {
				if (typeof options.intermediate === "string") {
					self.processImage(options.intermediate, options.output, options, function (error, success) {
						fs.unlink(options.intermediate, handleCallback); // delete intermediate
					});
				}
				else
					self.processImage(options.output, options.output, options, handleCallback);
			}
		});
	}
	catch(error) {
		if(typeof error == "object" && typeof error.code === "string" && error.code === "MODULE_NOT_FOUND")
			handleCallback("unsupported_platform");
	}

	function handleCallback(error, success) {
		if(typeof config.callback === "function") {
			if(typeof success === "undefined")
				success = !error;
			config.callback(error, success);
		}
	}
}

Screenshot.prototype.processImage = function(input, output, options, callback) {
	if(typeof options.width !== "number" && typeof  options.height !== "number" && typeof options.quality !== "number") // no processing required
		callback(null);
	else {
		new jimp(input, function (err, image) {
			if(typeof options.width === "number")
				var resWidth = Math.floor(options.width);
			if(typeof options.height === "number")
				var resHeight = Math.floor(options.height);

			if(typeof resWidth === "number" && typeof resHeight !== "number") // resize to width, maintain aspect ratio
				var resHeight = Math.floor(image.bitmap.height * (resWidth / image.bitmap.width));
			else if(typeof resHeight === "number" && typeof resWidth !== "number") // resize to height, maintain aspect ratio
				var resWidth = Math.floor(image.bitmap.width * (resHeight / image.bitmap.height));

			try {
				image.resize(resWidth, resHeight);

				if(typeof options.quality === "number" && options.quality >= 0 && options.quality <= 100)
					image.quality(Math.floor(options.quality)); // only works with JPEGs

				image.write(output, callback);
			}
			catch(error) {
				callback(error);
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
		config.options.output = path.normalize(config.options.output);

	return config;
};
