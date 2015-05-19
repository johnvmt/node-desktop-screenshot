module.exports = function(options, callback) {

	var fs = require('fs');
	var childProcess = require('child_process');
	var path = require('path');
	
	childProcess.exec(path.join(__dirname, "bin", "nircmdc.exe") + " savescreenshot " + options.output, function(error, stdout, stderr) {
		if(stderr)
			callback(stderr, null);
		else {
			try {
				fs.statSync(options.output);
				callback(null, options); // callback with options, in case options added
			}
			catch (error) {
				callback("file_not_found", null);
			}
		}
	});
};