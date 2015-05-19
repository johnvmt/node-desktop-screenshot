module.exports = function(options, callback) {

	var path = require('path');
	var fs = require('fs');
	var childProcess = require('child_process');

	// due to bug in jpgjs processing OSX jpg images https://github.com/notmasteryet/jpgjs/issues/34
	// when requesting JPG capture as PNG, so JIMP can read it
	var ext = extension(options.output);
	if(ext === "jpeg" || ext === "jpg") {
		options.intermediate = path.resolve(path.join(__dirname, uniqueId() + ".png")); // create an intermediate file that can be processed, then deleted
		capture(options.intermediate, callbackReturn);
	}
	else
		capture(options.output, callbackReturn); // when jpegjs bug fixed, only need this line

	function callbackReturn(error, success) {
		// called from capture
		// callback with options, in case options added
		callback(error, options);
	}

	function uniqueId() {
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000)
				.toString(16)
				.substring(1);
		}
		return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
			s4() + '-' + s4() + s4() + s4();
	}

	function extension(file) {
		return path.extname(file).toLowerCase().substring(1);
	}

	function capture(output, callback) {
		var cmd = "screencapture"
		+ " -t " + path.extname(output).toLowerCase().substring(1) // will create PNG by default
		+ " -x " + output;

		childProcess.exec(cmd, function(error, stdout, stderr) {
			if(error)
				callback(error, null);
			else {
				try {
					fs.statSync(output);
					callback(null, true);
				}
				catch (error) {
					callback(error, null);
				}
			}
		});
	}
};