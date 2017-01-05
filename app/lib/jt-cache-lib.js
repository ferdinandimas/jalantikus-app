/*
 jt-cache-lib.js handling file
 */
var errorHandler = function (cacheKey, e) {
	var msg = "";

	switch (e.code) {
		case FileError.QUOTA_EXCEEDED_ERR:
			msg = "Storage quota exceeded";
			break;
		case FileError.NOT_FOUND_ERR:
			msg = "File not found";
			break;
		case FileError.SECURITY_ERR:
			msg = "Security error";
			break;
		case FileError.INVALID_MODIFICATION_ERR:
			msg = "Invalid modification";
			break;
		case FileError.INVALID_STATE_ERR:
			msg = "Invalid state";
			break;
		default:
			msg = "Unknown error";
			break;
	}

	jt.log("Error (" + cacheKey + "): " + msg, e);

	return false;
}

var jtCache = function () {
	return {
		setItem: function (cacheKey, cacheValue, ttl) {
			if (typeof ttl == "undefined") {
				ttl = (60 * 60);
			}

			var type = window.TEMPORARY;

			cacheValue = JSON.stringify({
				"ttl"  : Math.floor((new Date()).getTime() / 1000) + ttl,
				"value": cacheValue
			});

			var size = jt.byteLength(cacheValue);

			window.requestFileSystem(type, size, function (fs) {
				fs.root.getFile(cacheKey, { create: true }, function (fileEntry) {

					fileEntry.createWriter(function (fileWriter) {
						fileWriter.onwriteend = function (e) {
							jt.log("Write success: " + cacheKey);
						};

						fileWriter.onerror = function (e) {
							jt.log("Write failed: " + e.toString());
						};

						var blob = new Blob([ cacheValue ], { type: "text/plain" });
						fileWriter.write(blob);
					}, errorHandler.bind(null, cacheKey));

				}, errorHandler.bind(null, cacheKey));
			}, errorHandler.bind(null, cacheKey));
		},
		getItem: function (cacheKey, result) {
			var type = window.TEMPORARY;
			var size = 50 * 1024 * 1024;

			window.requestFileSystem(type, size, function (fs) {
				fs.root.getFile(cacheKey, {}, function (fileEntry) {

					fileEntry.file(function (file) {
						var reader = new FileReader();

						reader.onloadend = function (e) {
							if (this.result.length > 0) {
								//console.log("HERE", this.result);
								buff = JSON.parse(this.result);

								if (typeof buff.ttl != "undefined" && buff.ttl > Math.floor((new Date()).getTime() / 1000)) {
									buff.expired = true
								}

								console.log("HERE", buff);
							}

							result(buff);
						};

						reader.readAsText(file);
					}, errorHandler.bind(null, cacheKey));

				}, function() {
					result(null);
				})
			}, errorHandler.bind(null, cacheKey));
		},
	}
}
var jtCache = jtCache();