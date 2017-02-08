define(
	[
		"underscore",
		"backbone",
		"jquery",
		"models/article",
		"models/app",
		"text!views/article_layout.html",
		"text!views/header_detail_layout.html",
		"prettify"
	],
	function (_, Backbone, $, Article, App, articleLayout, headerDetailLayout) {
		var articleDetailView = Backbone.View.extend({
			layout: _.template(articleLayout),
			model : new Article(),
			isConnected: true,
			initialize: function (_articleSlug) {
				if (jt.isOffline()) {
					this.isConnected = false;
				}

				var that = this;

				$("#app-toolbar")
					.addClass("detail")
					.removeClass("scroll")
					.removeClass("beranda")
					.empty()
					.append((_.template(headerDetailLayout))());

				$("#app-body").empty().append(
					'<div class="app-detail-container"><div class="app-toolbar-placeholder"></div><div class="app-loader"><a href="javascript:void(0)" class="app-retry">Gagal memuat. Coba lagi?</a><div class="app-load"></div></div></div>'
				);

				if ($("#app-body .app-refreshed").length == 0) {
					$("#app-body").append(
							'<div class="app-refreshed"></div>'
					);
				}

				$(".app-retry").on("touchend click", function () {
					that.isConnected = true;

					$(".app-loader").removeClass("showbtn");

					that.fetch({ timeout: 10000 });
				});

				$(".app-home").on("click", function (e) {
					window.stop();
				});

				if (window.sessionStorage.getItem(Backbone.history.getFragment() + "/scrollTop") == null) {
					window.sessionStorage.setItem(Backbone.history.getFragment() + "/scrollTop", $(".app-detail-container").scrollTop());
				}

				that.model = new Article({
					slug: _articleSlug
				});

				that.fetch();
			},
			fetch     : function (options) {
				var that = this;

				function fetch(_data) {
					if ($(".app-detail-container .app-loader").length >= 1) {
						if (typeof _data != "undefined" && _data != null && typeof _data.value != "undefined" && _data.value != null) {
							window.sessionStorage.setItem("currentArticle", _data.value);

							var _buff = JSON.parse(_data.value);
						}

						if ((typeof _data == "undefined" || _data == null || typeof _buff == "undefined" || typeof _buff.slug == "undefined" || _buff.slug == null) || (_data.expired == "true" && !jt.isOffline())) {
							if (!jt.isOffline()) {
								that.model.fetch({
									timeout: typeof options != "undefined" && typeof options.timeout != "undefined" ? options.timeout : 5000,
									success: function () {
										_buff = _data = that.model.toJSON();

										window.sessionStorage.setItem("currentArticle", JSON.stringify(_data));

										that.render(_buff);
									},
									error  : function () {
										$(".app-loader").addClass("showbtn");

										$(".app-retry").on("touchend click", function () {
											that.isConnected = true;

											$(".app-loader").removeClass("showbtn");

											that.fetch({ timeout: 10000 });
										});

										if ($(".splash").length >= 1) {
											if ($(".no-splash").length >= 1) {
												$(".splash").show().find(".splash-content").fadeIn();
												$(".no-splash").fadeOut();
											}

											if (!$(".splash .app-refreshed").hasClass("active")) {
												$(".splash .app-refreshed").html("Tidak ada jaringan").addClass("active").fadeIn();
												setTimeout(function () {
													$(".splash .app-refreshed").removeClass("active").fadeOut();
												}, 2000);
											}

											$(".splash-content .app-loader").fadeIn();

											$(".splash-quote").remove();
											$(".splash-speaker").remove();
											$(".splash-loading").hide();
										}

										if (!$(".app-refreshed").hasClass("active")) {
											$(".app-refreshed").html("Tidak ada jaringan").addClass("active").fadeIn();
											setTimeout(function () {
												$(".app-refreshed").removeClass("active").fadeOut();
											}, 2000);

											that.isConnected = false;
										}
									}
								});
							}
							else {
								setTimeout(function () {
									$(".app-loader").addClass("showbtn");

									if ($(".splash").length >= 1) {
										if ($(".no-splash").length >= 1) {
											$(".splash").show().find(".splash-content").fadeIn();
											$(".no-splash").fadeOut();
										}

										if (!$(".splash .app-refreshed").hasClass("active")) {
											$(".splash .app-refreshed").html("Tidak ada jaringan").addClass("active").fadeIn();
											setTimeout(function () {
												$(".splash .app-refreshed").removeClass("active").fadeOut();
											}, 2000);
										}

										$(".splash-content .app-loader").fadeIn();

										$(".splash-quote").remove();
										$(".splash-speaker").remove();
										$(".splash-loading").hide();
									}

									if (!$(".app-refreshed").hasClass("active")) {
										$(".app-refreshed").html("Tidak ada jaringan").addClass("active").fadeIn();
										setTimeout(function () {
											$(".app-refreshed").removeClass("active").fadeOut();
										}, 2000);

										that.isConnected = false;
									}
								}, 2000);
							}
						}
						else {
							if (window.localStorage.getItem("show_splash") === "true") {
								$(".no-splash").hide();

								if ($(".splash").length >= 1) {
									setTimeout(function () {
										$(".splash").fadeOut("fast", function () {
											$(this).remove();
										})
									}, 2000);
								}
							}
							else {
								$(".splash").fadeOut(350, function() {
									$(this).remove();
								});
								$(".no-splash").fadeOut(350, function() {
									$(this).remove();
								});
							}

							that.render(_buff);
						}
					}
				}

				jtCache.getItem("offline/" + Backbone.history.getFragment(), function (_data) {
					if (_data != null) {
						fetch(_data);
					}
					else {
						jtCache.getItem("favorite/" + Backbone.history.getFragment(), function (_data) {
							if (_data != null) {
								fetch(_data);
							}
							else {
								fetch(null);
							}
						}, window.PERSISTENT);
					}
				}, window.PERSISTENT);
			},
			render    : function (_data) {
				var that    = this;
				var tooltip = false;

				if (typeof _data.slug == "undefined") {
					window.sessionStorage.removeItem(Backbone.history.getFragment() + "/scrollTop");

					Backbone.history.loadUrl();
				}
				else {
					$(".app-detail-container .app-loader").remove();

					$.each(_data.related.article, function (key, value) {
						if (value.views_last_24h >= 2100) {
							value.label = "populer";
						}
						else if (value.views_last_24h >= 1200 && value.views_last_24h < 2100) {
							value.label = "wajibbaca";
						}
						else if (value.views_last_24h >= 500 && value.views_last_24h < 1200) {
							value.label = "banyakdisukai";
						}
						else if (Math.floor((new Date() - new Date(value.published)) / 1000) < 18000) {
							value.label = "terbaru";
						}
						else {
							_label = [ 'populer', 'wajibbaca', 'banyakdisukai', 'direkomendasikan' ];
							value.label = _label[ Math.floor(Math.random() * _label.length) ];
						}
					});

					_data.description = _data.description.replace(/([src|href])=([\"|\'])\/\//g, "$1=$2http://");

					$("#app-body").empty().append(that.layout({
						detail: _data
					}));

					jtCache.getItem("favorite/" + Backbone.history.getFragment(), function (_data) {
						if (_data != null) {
							$(".app-addtofavorite").addClass("active");

							jtCache.setItem("favorite/" + Backbone.history.getFragment(), window.sessionStorage.getItem("currentArticle"), window.PERSISTENT);

							cachePreviewImage()
						}
					}, window.PERSISTENT);

					jtCache.getItem("offline/" + Backbone.history.getFragment(), function (_data) {
						if (_data != null) {
							$(".app-addtooffline").addClass("active");

							jtCache.setItem("offline/" + Backbone.history.getFragment(), window.sessionStorage.getItem("currentArticle"), window.PERSISTENT);

							cachePreviewImage();
						}
					}, window.PERSISTENT);

					if (jt.isOffline()) {
						$(".more-article-frame").hide();
						$(".app-gotoweb-description").hide();
						$(".app-gotohome-description").css("margin-top", "5px");
					}

					function cachePreviewImage() {
						/*
						 Cache preview image
						 */
						$("img.for-preview:not(.rendered)").each(function (key, val) {
							if (typeof window.resolveLocalFileSystemURL == "function") {
								window.resolveLocalFileSystemURL("filesystem:" + window.location.origin + "/persistent/data/image." + Backbone.history.getFragment().replace("/", ".") + "." + btoa($(val).data("src")) + ".", function () {

								}, function () {
									var xhr = new XMLHttpRequest();

									xhr.onreadystatechange = function () {
										if (this.readyState == 4 && this.status == 200) {
											/*
											 Caching image
											 */

											jtCache.setItem("image." + Backbone.history.getFragment() + "." + btoa($(val).data("src")), {
												"type"     : "blob",
												"value"    : xhr.response,
												"extension": "",
												"fileType" : xhr.response.type
											}, window.PERSISTENT, null);

											$(val).addClass("rendered");
										}
									}

									xhr.open('GET', $(val).data("src"));
									xhr.responseType = 'blob';
									xhr.send();
								});
							}
						});
					}

					$("#app-userpanel").panel("close");
					$("#app-searchpanel").panel("close");

					$("#app-body .app-detail-container").scroll(function () {
						window.sessionStorage.setItem(Backbone.history.getFragment() + "/scrollTop", $(".app-detail-container").scrollTop());
					});

					$("img:not(.for-preview):not(.rendered)").each(function (key, val) {
						if (typeof $(val).attr("src") != "undefined" && $(val).attr("src").indexOf("http") >= 0) {
							$(val).attr("alt", "");

							/*
							 Using Placeholder
							 */
							isUsingPlaceholder = true;

							if (!$(val).hasClass("banner") && isUsingPlaceholder == true) {
								regExp = /(https?\:\/\/(.*?\.)?(jalantikus\.com|babe\.news)\/assets\/cache\/)(.*?\/.*?)(\/.*?)$/g;
								value  = $(val).attr("src");

								var _placeholder = "";

								if (typeof value != "undefined" && value.match(regExp)) {
									var matches = regExp.exec(value);

									_placeholder = matches[ 1 ] + Math.ceil($(".app-detail-body").width() / 100) + "/0" + matches[ 5 ];

									if (!$(val).hasClass("banner") && !$(val).hasClass("more-banner")) {
										_images = matches[ 1 ] + $(".app-detail-body").width() + "/0" + matches[ 5 ];
									}
									else {
										_images = $(val).attr("src");
									}

									$(val).data("src", _images);
									$(val).attr("src", _placeholder);

									loadImage();
								}
								else if (typeof value != "undefined") {
									$(val).data("src", $(val).attr("src"));

									loadImage();
								}
							}
							else {
								$(val).data("src", $(val).attr("src"));

								loadImage();
							}
							/*
							 Using Placeholder
							 */

							function loadImage() {
								var img = new Image();

								$(img).on("load", function () {
									$(val).attr("src", $(img).attr("src")).addClass("rendered");
								});

								if (typeof window.resolveLocalFileSystemURL == "function") {
									window.resolveLocalFileSystemURL("filesystem:" + window.location.origin + "/persistent/data/image." + Backbone.history.getFragment().replace("/", ".") + "." + btoa($(val).data("src")) + ".", function (entry) {
										var nativePath = entry.toURL();
										if (typeof nativePath != "undefined") {
											$(val).attr("src", nativePath);
										}
										else {
											img.src = $(val).data("src");
										}
									}, function (e) {
										jtCache.getItem("offline/" + Backbone.history.getFragment(), function (_data) {
											if (_data != null) {
												renderImage();
											}
											else {
												jtCache.getItem("favorite/" + Backbone.history.getFragment(), function (_data) {
													if (_data != null) {
														renderImage();
													}
												}, window.PERSISTENT);
											}
										}, window.PERSISTENT);

										function renderImage() {
											var xhr = new XMLHttpRequest();

											xhr.onreadystatechange = function () {
												if (this.readyState == 4 && this.status == 200) {
													/*
													 Caching image
													 */
													jtCache.setItem("image." + Backbone.history.getFragment() + "." + btoa($(val).data("src")), {
														"type"     : "blob",
														"value"    : xhr.response,
														"extension": "",
														"fileType" : xhr.response.type
													}, window.PERSISTENT, null);
												}
											}

											xhr.open('GET', $(val).data("src"));
											xhr.responseType = 'blob';
											xhr.send();
										}

										img.src = $(val).data("src");
									});
								}
								else {
									img.src = $(val).data("src");
								}
							}
						}
					});

					$(".app-detail-body p img").one("error", function (e) {
						var _this = $(this);
						var parent = _this.closest("p");
						var isRun = false;
						if (parent.find(".image-refresh").length == 0) {
							parent.append(
									"<div class='image-refresh-container'><div class='image-refresh'>Muat ulang gambar<a href='javascript:void(0);' class='image-refresh-link card-link'><div class='ripple'></div></a></div></div>");
							parent.find(".image-refresh").on("click", function () {
								if (!jt.isOffline() && !isRun) {
									isRun = true;
									if (!$(this).hasClass("active")) {
										$(this).addClass("active");
									}
									var tO;

									_this.one("load", function () {
										clearTimeout(tO);
										isRun = false;
										_this.fadeIn(200);
										parent.find(".image-refresh").remove();
									})

									tO = setTimeout(function () {
										parent.find(".image-refresh")
												.on('animationiteration webkitAnimationIteration', function () {
													parent.find(".image-refresh").removeClass("active");
													_this.attr("src", "");
													if (!$(".app-refreshed").hasClass("active")) {
														$(".app-refreshed")
																.html("Gagal memuat ulang")
																.addClass("active")
																.fadeIn();
														setTimeout(function () {
															$(".app-refreshed").removeClass("active").fadeOut();
														}, 2000);
													}
													parent.find(".image-refresh")
															.off("animationiteration webkitAnimationIteration");
												});
										isRun = false;
									}, 10000)

									_this.attr("src", _this.data("src"));
								}
								else {
									setTimeout(that.showOffline(), 2000);
								}
							})
						}
						else {
							parent.find(".image-refresh").removeClass("active");
						}
						_this.hide();
						_this.attr("src", "");
					});

					if ($("#app-header-detail").length < 0) {
						$("#app-toolbar")
								.addClass("detail")
								.empty()
								.append((_.template(headerDetailLayout))());
					}

					$("#app-toolbar").addClass("detail").addClass("scroll");

					if ($("#app-body .app-refreshed").length == 0) {
						$("#app-body").append(
								'<div class="app-refreshed"></div>'
						);
					}

					$(".jt-not-view.appsinner").remove();
					$(".jt-not-view.artikelmenarik").remove();
					$(".partner-banner-aftc-artikel-menarik").remove();

					$(".app-detail-container").on("scroll touchmove", function () {
						if ($(this).scrollTop() > 60) {
							$("#app-toolbar").removeClass("scroll");
						}
						else {
							$("#app-toolbar").addClass("scroll");
						}
						if ($(this).scrollTop() <= 0) {
							if ($(".scroll-up").css("display") != "none") {
								$(".scroll-up").css("display", "none");
							}
						}
						else if ($(".app-detail-end").is(":in-viewport")) {
							if ($(".scroll-down").css("display") != "none") {
								$(".scroll-down").css("display", "none");
							}
						}
						else {
							if ($(".scroll-up").css("display") == "none") {
								$(".scroll-up").css("display", "block");
							}
							if ($(".scroll-down").css("display") == "none") {
								$(".scroll-down").css("display", "block");
							}
						}
					});

					$(".app-detail-body script").each(function (index, element) {
						url = $(element).attr("src");
						if (typeof url != "undefined" && url != "null") {
							if (url.indexOf("http:") < 0 && url.indexOf("https:") < 0) {
								url = "http:" + url;
							}

							$.getScript(url);
						}
					});

					$(".app-detail-body iframe").each(function (index, element) {
						if(!jt.isOffline())
						{
							$(element).attr("width", "100%").attr("height", "");

							if ($(element).attr("src").indexOf("http:") < 0 && $(element).attr("src").indexOf("https:") < 0) {
								$(element).attr("src", "http:" + $(element).attr("src"));
							}

							if ($(element).attr("src").indexOf("giphy.com") >= 0) {
								var _this = $(this);
								var parent = _this.closest("p");

								if (parent.find(".image-refresh").length == 0) {
									parent.append("<div class='image-refresh'>Lihat gambar di Web<a href='" + $(".app-gotoweb.app-goto").attr("href") + "' class='card-link'><div class='ripple'></div></a></div>");
								}
								_this.remove();
							}
						}
						else
						{
							var _this = $(this);
							var parent = _this.parent();
							if (parent.find(".image-refresh").length == 0) {
								parent.html("<div class='image-refresh-container'>Konten Tidak Dapat Dimuat<br><div class='image-refresh not-support'>Lihat Konten di Web<a href='javascript:void(0);' data-href='" + $(".app-gotoweb.app-goto").data("href") + "' class='card-link'><div class='ripple'></div></a></div></div>").attr("style", "");
							}
							parent.css("padding", 0).css("height", "auto")
							_this.remove()
						}
					});

					$(".app-detail-body iframe").one("error", function (index, element) {
						var _this = $(this);
						var parent = _this.parent();
						if (parent.find(".image-refresh").length == 0) {
							parent.html("<div class='image-refresh-container'>Konten Tidak Dapat Dimuat<br><div class='image-refresh not-support'>Lihat Konten di Web<a href='javascript:void(0);' data-href='" + $(".app-gotoweb.app-goto").data("href") + "' class='card-link'><div class='ripple'></div></a></div></div>").attr("style", "");
						}
						parent.css("padding", 0).css("height", "auto")
						_this.remove()	
					});

	

					$("a").each(function (key, val) {
						value  = $(val).attr("href");

						if (typeof value != "undefined") {
							$(val).attr("href", value.replace("https://app.jalantikus.com", "https://jalantikus.com").replace("http://app.jalantikus.com", "https://jalantikus.com"));
						}
					});

					$(".app-detail-body a").each(function (key, val) {
						regExp = /https?\:\/\/(app\.)?jalantikus\.com\/(gadgets|tips|news|gokil)\/(.*?)(\/|$|\?)/gim;
						value  = $(val).attr("href");

						if (typeof value != "undefined" && value.match(regExp)) {
							var matches = regExp.exec(value);

							$(this).attr("href", "#article/" + matches[ 3 ]);
						}
						else if (typeof value != "undefined" && !value.match(regExp)) {
							$(this).attr("onclick", "window.open('" + value + "', '_system');");
							$(this).attr("href", "#");

							$(this).click(function (e) {
								e.preventDefault();
							});
						}
					});

					$(".share-container a").each(function (key, val) {
						value  = $(val).attr("href");

						if (value.indexOf("http:") == 0 || value.indexOf("https:") == 0) {
							$(this).attr("onclick", "window.open('" + value + "', '_system');");
							$(this).attr("href", "#");

							$(this).click(function (e) {
								e.preventDefault();
							});
						}
					});

					$("#app-body .app-detail-container a").each(function (key, val) {
						regExp = /(https?\:\/\/app\.jalantikus\.com\/(gadgets|tips|news|gokil)\/(.*?)(\/|$|\?)|\#)/gim;
						value  = $(val).attr("href");

						if (typeof value != "undefined" && !value.match(regExp) && !$(this).hasClass("share") && !$(this).hasClass("scroll-button") && !$(this).hasClass("download-btn") && !$(this).hasClass("googleplay-btn")) {
							$(this).attr("href", "#browser/" + encodeURIComponent(value));
						}
					});

					$(".app-gotoweb").each(function (key, val) {
						regExp = /(https?\:\/\/app\.jalantikus\.com\/(gadgets|tips|news|gokil)\/(.*?)(\/|$|\?)|\#)/gim;
						value  = $(val).attr("href");

						if (typeof value != "undefined" && !value.match(regExp) && !$(this).hasClass("share") && !$(this).hasClass("scroll-button") && !$(this).hasClass("download-btn") && !$(this).hasClass("googleplay-btn")) {
							$(this).attr("href", "#browser/" + encodeURIComponent(value));
						}
					});

					$(".instagram-media").each(function (index, element) {
						var _this = $(this);

						_this.html("<div class='image-refresh-container'>Konten Tidak Dapat Dimuat<br><div class='image-refresh not-support'>Lihat Konten di Web<a href='javascript:void(0);' data-href='" + $(".app-gotoweb.app-goto").data("href") + "' class='card-link'><div class='ripple'></div></a></div></div>").attr("style", "").removeClass("instagram-media");
					});

					$("p img").each(function(key, val)
					{
						var _this = $(this);
						if(_this.attr("src").indexOf("jalantikus.com/") < 0 && _this.attr("src").indexOf("babe.news/") < 0 )
						{
							_this.closest("p").append("<div class='image-refresh-container'>Konten Tidak Dapat Dimuat<br><div class='image-refresh  not-support'>Buka di Web<a href='javascript:void(0);' data-href='" + $(".app-gotoweb.app-goto").data("href") + "' class='card-link'><div class='ripple'></div></a></div></div>").attr("style", "");
							_this.remove();
						}
					});
					
					$(".apps-detail.horizontal").each(function (key, val) {
						var _appDetail = $(this).find(".click-target").attr("href");
						var _that      = this;
						var _appSlug;

						$(this)
								.find(".info-container .info h3")
								.replaceWith(
										$('<h3><div class="title text-link-container">' + $(this)
														.find(".info-container .title.text-link-container")
														.html() + '</div></h3>')
								);

						regExp      = /https?:\/\/(app\.)?jalantikus\.com\/(apps|games)\/(.*?)(\/|$)/gi;
						var matches = regExp.exec(_appDetail);

						if (matches != null) {
							_appSlug = matches[ 3 ];

							_appDetail = new App({
								slug: _appSlug
							});

							_appDetail.fetch({
								timeout: 5000,
								success: function () {
									_appDetail = _appDetail.toJSON();

									$(_that)
											.find(".action-btn.download-btn")
											.attr("href",
													_config.jtFiles + _appDetail.id + "/" + _appDetail.version.id + "/" + _appDetail.version.uri)
											.off();

									if (typeof _appDetail.version.external_url != "undefined" && _appDetail.version.external_url != "") {
										$(_that)
												.find(".action-btn.googleplay-btn")
												.attr("href", _appDetail.version.external_url)
												.off();
									}
									else {
										$(_that).find(".action-btn.googleplay-btn").remove();
									}
								},
								error  : function () {
									$(_that).parent().parent().remove();
								}
							});
						}
					});

					setTimeout(function () {
						if (_config.environment == "live" && !jt.isOffline()) {
							$("#iframe-jalantikus").prop("src", $("#iframe-jalantikus").data("src"));
						}
					}, 2000);

					$(".app-body a").on("click", function (e) {
						if ((jt.isOffline() && !$(this).hasClass("share") && !$(this).hasClass("app-goto") && !$(this).hasClass("app-home") && !$(this).hasClass("app-toggle-back"))) {
							e.preventDefault();

							that.showOffline();
						}
					});

					$(".app-retry").on("touchend click", function () {
						that.isConnected = true;

						$(".app-loader").removeClass("showbtn");

						that.fetch({ timeout: 10000 });
					});

					$(".prettify-copy-selected").on("touchend click", function (e) {
						document.execCommand('copy');
						validateTooltip(e)
					});

					$(".link-share a").on("click", function (e) {
						e.preventDefault();
						document.querySelector("#share-link").select();
						document.execCommand('copy');

						$(".app-refreshed").html("Link berhasil disalin").fadeIn();
						setTimeout(function () {
							$(".app-refreshed").fadeOut();
						}, 2000);
					});

					$(".addon-gadgets .action-container").remove();
					$(".addon-gadgets a").on("click", function (e) {
						e.preventDefault();
					});

					$(".prettify-copy-all").on("touchend click", function (e) {
						_el     = $(this).parent().parent();
						_result = "";
						$(_el).find("li").each(function (obj, val) {
							_result += $(val).text() + "\n";
						});

						var dummy = document.createElement("textarea");
						document.body.appendChild(dummy);
						dummy.setAttribute("id", "dummy_id");
						document.getElementById("dummy_id").value = _result;
						$(dummy).select();
						document.execCommand("copy");
						document.body.removeChild(dummy);
						validateTooltip(e)
					});

					function validateTooltip(e) {
						if (!tooltip) {
							tooltip  = true;
							var q   = "<div class='prettify-tooltip'>Berhasil disalin</div>"
							var posX = e.target.clientX;
							var posY = e.target.clientY;
							$(e.target).append(q);
							$('.prettify-tooltip').slideDown(300);
							var w  = $(e.target).innerWidth();
							var fw = (100 - w) / 2
							if (fw > 0) {
								$('.prettify-tooltip').css('left', (fw * -1));
							}
							else {
								$('.prettify-tooltip').css('left', fw);
							}
							var td = setInterval(function () {
								tooltip = false;
								clearInterval(td);
								$('.prettify-tooltip').slideUp(300, function () {
									$(this).remove();
								})
							}, 2000)
						}
					}

					function decodeHtml(html) {
						var txt       = document.createElement("textarea");
						txt.innerHTML = html;
						return txt.value;
					}

					$(".prettyprint").each(function (key, value) {
						$(this).text(decodeHtml($(this).text()));
					});

					PR.prettyPrint();

					if (window.sessionStorage.getItem(Backbone.history.getFragment() + "/scrollTop") != null) {
						$(".app-detail-container").scrollTop(parseInt(window.sessionStorage.getItem(Backbone.history.getFragment() + "/scrollTop")));
					}

					if (window.localStorage.getItem("favorite/" + Backbone.history.getFragment()) != null) {
						window.localStorage.setItem("favorite/" + Backbone.history.getFragment(), window.sessionStorage.getItem(Backbone.history.getFragment()));

						$(".app-addtofavorite").addClass("active");
					}
				}

				if (window.localStorage.getItem("show_splash") === "true") {
					$(".no-splash").hide();

					if ($(".splash").length >= 1) {
						setTimeout(function () {
							$(".splash").fadeOut("fast", function () {
								$(this).remove();
							})
						}, 2000);
					}
				}
				else {
					$(".splash").fadeOut(350, function() {
						$(this).remove();
					});
					$(".no-splash").fadeOut(350, function() {
						$(this).remove();
					});
				}
			},
			showOffline: function () {
				if (!$(".app-refreshed").hasClass("active")) {
					$(".app-refreshed").html("Tidak ada jaringan").addClass("active").fadeIn();
					setTimeout(function () {
						$(".app-refreshed").removeClass("active").fadeOut();
					}, 2000);
				}
			},
			cleanup    : function () {
				this.undelegateEvents();
			}
		});

		return articleDetailView;
	}
);