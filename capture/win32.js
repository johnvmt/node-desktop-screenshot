module.exports = function(options, callback) {

	var fs = require('fs');
	var childProcess = require('child_process');
	var path = require('path');
	
	var nircmd = childProcess.spawn(path.join(__dirname, "bin", "nircmd.exe"), ["savescreenshot", options.output]);	

	nircmd.on('close', function(code, signal) {
		try {
			fs.statSync(options.output);
			callback(null, options); // callback with options, in case options added
		}
		catch(error) {
			callback("file_not_found", null);
		}
	});
};