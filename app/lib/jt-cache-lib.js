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

	console.log("Error (" + cacheKey + "): " + msg, e);
	//jt.log("Error (" + cacheKey + "): " + msg);

	return false;
}

var jtCache = function () {
	return {
		setItem: function (cacheKey, cacheValue, type, ttl, callback) {
			var _cacheKey = cacheKey;

			cacheKey += ".json";
			cacheKey = cacheKey.replace(/\//g, ".");

			var data = {
				"type"    : "",
				"fileType": "",
			};

			if (typeof ttl == "undefined" || ttl == null) {
				ttl = (60 * 60);
			}

			type = (typeof type == "undefined" || type == null ? window.TEMPORARY : type);

			if (typeof cacheValue == "object" && typeof cacheValue.type != "undefined" && typeof cacheValue.value != "undefined") {
				if (cacheValue.type == "blob") {

					data.type     = cacheValue.type;
					data.fileType = cacheValue.fileType;

					cacheKey   = cacheKey.replace(".json", "." + cacheValue.extension);
					cacheValue = cacheValue.value;
				}
			}
			else {
				if (typeof cacheValue == "object") {
					cacheValue = JSON.stringify(cacheValue);
				}

				buffValue = JSON.parse(cacheValue);

				cacheValue = JSON.stringify({
					"ttl"  : Math.floor((new Date()).getTime() / 1000) + ttl,
					"value": encodeURI(JSON.stringify(cacheValue)),
				});
			}

			var size = jt.byteLength(cacheValue);

			if (typeof window.requestFileSystem == "function") {
				_segment = cacheKey.split(".");
				if (_segment.length > 2) {
					if (isSubfoldering = true) {
						_segment[ 0 ] = "data";
					}

					window.requestFileSystem(type, 0, function (fs) {
						fs.root.getDirectory(_segment[ 0 ], {create: true, exclusive: false}, function(fs) {
							createFile(fs);
						}, function () {
							if (typeof callback == "function") {
								callback();
							}
						});
					}, function () {
						if (typeof callback == "function") {
							callback();
						}
					});
				}
				else {
					createFile();
				}

				function createFile(_fs) {
					if (typeof _fs == "undefined") {
						window.requestFileSystem(type, size, function (fs) {
							remove(fs.root);
						}, function () {
							if (typeof callback == "function") {
								callback();
							}
						});
					}
					else {
						remove(_fs);
					}
				}

				function remove(fs) {
					fs.getFile(cacheKey, {}, function (fileEntry) {
						fileEntry.remove(function (file) {
							jt.log("Remove success: " + cacheKey);

							create(fs);
						}, function () {
							create(fs);
						});
					}, function () {
						create(fs);
					});
				}

				function create(fs) {
					var isFired = false;

					fs.getFile(cacheKey, { create: true }, function (fileEntry) {
						fileEntry.createWriter(function (fileWriter) {
							fileWriter.onwriteend = function (e) {
								jt.log("Write success: " + cacheKey);

								if (typeof callback == "function") {
									callback();
								}
							};

							fileWriter.onerror = function (e) {
								if (typeof callback == "function") {
									callback();
								}
							};

							fileWriter.onwritestart = function (e) {
								isFired = true;
							};

							setTimeout(function () {
								if (!isFired) {
									fileWriter.abort();

									console.log("Write failed: Writer not fired");

									if (typeof callback == "function") {
										callback();
									}
								}
							}, 500);

							if (data.type == "blob") {
								var blob = cacheValue;
							}
							else {
								var blob = new Blob([ cacheValue ], { type: "application/json" });
							}

							fileWriter.write(blob);
						}, function () {
							if (typeof callback == "function") {
								callback();
							}
						});
					}, function () {
						if (typeof callback == "function") {
							callback();
						}
					});
				}
			}
			else {
				window.sessionStorage.setItem(cacheKey, cacheValue);

				if (typeof callback == "function") {
					callback();
				}
			}
		},
		getItem: function (cacheKey, callback, type) {
			if (cacheKey.substr(cacheKey.length - 1) != ".") {
				cacheKey += ".json";
			}
			cacheKey = cacheKey.replace(/\//g, ".");

			type = (typeof type == "undefined" || type == null ? window.TEMPORARY : type);

			if (typeof window.requestFileSystem == "function") {
				_segment = cacheKey.split(".");
				if (_segment.length > 2) {
					if (isSubfoldering = true) {
						_segment[ 0 ] = "data";
					}

					window.requestFileSystem(type, 0, function (fs) {
						fs.root.getDirectory(_segment[ 0 ], {}, function(fs) {
							readFile(fs);
						}, function () {
							if (typeof callback == "function") {
								callback(null);
							}
						});
					}, function () {
						if (typeof callback == "function") {
							callback(null);
						}
					});
				}
				else {
					readFile();
				}

				function readFile(_fs) {
					if (typeof _fs == "undefined") {
						window.requestFileSystem(type, size, function (fs) {
							read(fs.root);
						}, function () {
							if (typeof callback == "function") {
								callback(null);
							}
						});
					}
					else {
						read(_fs);
					}
				}

				function read(fs) {
					var isFired = false;

					fs.getFile(cacheKey, {}, function (fileEntry) {
						fileEntry.file(function (file) {
							var reader = new FileReader();

							reader.onloadend = function (e) {
								if (this.result != null && this.result.length > 0) {
									jt.log("Load success: " + cacheKey);

									buff       = JSON.parse(this.result);
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
							};

							reader.onerror = function (e) {
								reader.abort();

								console.log("Read failed: " + e.toString(), e);

								if (typeof callback == "function") {
									callback(null);
								}
							};

							reader.onloadstart = function (e) {
								isFired = true;
							};

							setTimeout(function () {
								if (!isFired) {
									reader.abort();

									console.log("Read failed: Reader not fired");

									if (typeof callback == "function") {
										callback(null);
									}
								}
							}, 500);

							reader.readAsText(file);
						}, function () {
							if (typeof callback == "function") {
								callback(null);
							}
						});
					}, function () {
						if (typeof callback == "function") {
							callback(null);
						}
					});
				}
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
				_segment = cacheKey.split(".");
				if (_segment.length > 2) {
					if (isSubfoldering = true) {
						_segment[ 0 ] = "data";
					}

					window.requestFileSystem(type, 0, function (fs) {
						fs.root.getDirectory(_segment[ 0 ], {}, function(fs) {
							removeFile(fs);
						}, function () {
							if (typeof callback == "function") {
								callback();
							}
						});
					}, function () {
						if (typeof callback == "function") {
							callback();
						}
					});
				}
				else {
					removeFile();
				}

				function removeFile(_fs) {
					if (typeof _fs == "undefined") {
						window.requestFileSystem(type, size, function (fs) {
							remove(fs.root);
						}, function () {
							if (typeof callback == "function") {
								callback();
							}
						});
					}
					else {
						remove(_fs);
					}
				}

				function remove(fs) {
					fs.getFile(cacheKey, {}, function (fileEntry) {
						fileEntry.remove(function () {
							jt.log("Remove success: " + cacheKey);

							if (typeof callback == "function") {
								callback();
							}
						}, function () {
							if (typeof callback == "function") {
								callback();
							}
						});
					}, function () {
						if (typeof callback == "function") {
							callback();
						}
					});
				}
			}
			else {
				window.sessionStorage.removeItem(cacheKey);

				if (typeof callback == "function") {
					callback();
				}
			}
		},
		listItem: function (location, callback, type, search, returnList) {
			type = (typeof type == "undefined" || type == null ? window.TEMPORARY : type);

			var size = 1 * 1024 * 1024;

			if (typeof window.requestFileSystem == "function") {
				window.requestFileSystem(type, 0, function (fs) {
					fs.root.getDirectory(location, {}, function (fs) {
						var reader = fs.createReader();

						reader.readEntries(function (entries) {
							var result = [];

							Promise.all(entries.map(function (val) {
								var dfd = $.Deferred();

								var _buff = val;

								if (typeof search == "undefined" || (typeof search == "string" && val.name.indexOf(search) >= 0)) {
									if (returnList) {
										result.push(_buff);

										dfd.resolve();
									}
									else {
										jtCache.getItem(val.name.replace(".json", ""), function (article) {
											if (article != null) {
												result.push(article);
											}

											dfd.resolve();
										}, type);
									}
								}
								else {
									dfd.resolve();
								}

								return dfd.promise();
							})).then(function () {
								if (typeof callback == "function") {
									callback(result);
								}
							});
						}, function () {
							if (typeof callback == "function") {
								callback([]);
							}
						});
					}, function () {
						if (typeof callback == "function") {
							callback([]);
						}
					});
				}, function () {
					if (typeof callback == "function") {
						callback([]);
					}
				});
			}
			else {
				if (typeof callback == "function") {
					callback([]);
				}
			}
		}
	}
}
var jtCache = jtCache();