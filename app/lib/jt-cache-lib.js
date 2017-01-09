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

	//console.log("Error (" + cacheKey + "): " + msg, e);
	jt.log("Error (" + cacheKey + "): " + msg);

	return false;
}

var jtCache = function () {
	return {
		setItem: function (cacheKey, cacheValue, type, ttl, callback) {
			cacheKey += ".json";
			cacheKey = cacheKey.replace(/\//g, ".");

			if (typeof ttl == "undefined" || ttl == null) {
				ttl = (60 * 60);
			}

			type = (typeof type == "undefined" || type == null ? window.TEMPORARY : type);

			buffValue = JSON.parse(cacheValue);

			cacheValue = JSON.stringify({
				"ttl"  : Math.floor((new Date()).getTime() / 1000) + ttl,
				"value": encodeURI(JSON.stringify(cacheValue)),
			});

			var size = jt.byteLength(cacheValue);

			if (typeof window.requestFileSystem == "function") {
				window.requestFileSystem(type, size, function (fs) {
					fs.root.getFile(cacheKey, { create: true }, function (fileEntry) {

						fileEntry.createWriter(function (fileWriter) {
							fileWriter.onwriteend = function (e) {
								//console.log("Write success: " + cacheKey, buffValue);
								jt.log("Write success: " + cacheKey);

								if (typeof callback == "function") {
									callback();
								}
							};

							fileWriter.onerror = function (e) {
								jt.log("Write failed: " + e.toString());
							};

							var blob = new Blob([ cacheValue ], { type: "application/json" });
							fileWriter.write(blob);
						}, errorHandler.bind(null, cacheKey));

					}, errorHandler.bind(null, cacheKey));
				}, errorHandler.bind(null, cacheKey));
			}
			else {
				window.sessionStorage.setItem(cacheKey, cacheValue);
			}
		},
		getItem: function (cacheKey, callback, type) {
			cacheKey += ".json";
			cacheKey = cacheKey.replace(/\//g, ".");

			type = (typeof type == "undefined" || type == null ? window.TEMPORARY : type);

			if (typeof window.requestFileSystem == "function") {
				window.requestFileSystem(type, 0, function (fs) {
					fs.root.getFile(cacheKey, {}, function (fileEntry) {
						fileEntry.file(function (file) {
							var reader = new FileReader();

							reader.onloadend = function (e) {
								if (this.result.length > 0) {
									try {
										buff       = JSON.parse(this.result);
										buff.value = JSON.parse(decodeURI(buff.value));

										if (typeof buff.ttl == "undefined" || (typeof buff.ttl != "undefined" && Math.floor((new Date()).getTime() / 1000) > buff.ttl)) {
											buff.expired = "true"
										}

										if (typeof callback == "function") {
											callback(buff);
										}
									}
									catch (e) {
										console.log("Read failed: " + e.toString(), e);
										//jt.log("Read failed: " + e.toString());

										callback(null);
									}
								}
							};

							reader.readAsText(file);
						}, errorHandler.bind(null, cacheKey));
					}, function () {
						callback(null);
					});
				}, errorHandler.bind(null, cacheKey));
			}
			else {
				buff = window.sessionStorage.getItem(cacheKey);

				if (buff != null) {
					buff       = JSON.parse(buff);
					buff.value = JSON.parse(decodeURI(buff.value));

					if (typeof buff.ttl == "undefined" || (typeof buff.ttl != "undefined" && Math.floor((new Date()).getTime() / 1000) > buff.ttl)) {
						buff.expired = "true"
					}

					if (typeof callback == "function") {
						callback(buff);
					}
				}
				else {
					if (typeof callback == "function") {
						callback(null);
					}
				}
			}
		},
		removeItem: function (cacheKey, type, callback) {
			cacheKey += ".json";
			cacheKey = cacheKey.replace(/\//g, ".");

			type = (typeof type == "undefined" || type == null ? window.TEMPORARY : type);

			var size = 1 * 1024 * 1024;

			if (typeof window.requestFileSystem == "function") {
				window.requestFileSystem(type, size, function (fs) {
					fs.root.getFile(cacheKey, {}, function (fileEntry) {

						fileEntry.remove(function (file) {
							jt.log("Remove success: " + cacheKey);

							if (typeof callback == "function") {
								callback();
							}
						}, errorHandler.bind(null, cacheKey));

					}, errorHandler.bind(null, cacheKey))
				}, errorHandler.bind(null, cacheKey));
			}
			else {
				window.sessionStorage.removeItem(cacheKey);
			}
		},
	}
}
var jtCache = jtCache();