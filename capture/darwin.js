module.exports = function(options, callback) {

	var path = require('path');
	var fs = require('fs');
	var childProcess = require('child_process');

	capture(options.output, callback);

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