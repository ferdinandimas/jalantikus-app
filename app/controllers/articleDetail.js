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
	function (_, Backbone, $, Article, App, articleLayout, headerLayout) {
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
					.removeClass("on-top")
					.empty()
					.append((_.template(headerLayout))());

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

					$(".app-load").css("display", "block");
					$(".app-retry").css("display", "none");

					$(".splash .app-loader").removeClass("showbtn");

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

				jtCache.getItem(Backbone.history.getFragment(), function(_data) {
					if (_data == null || _data.expired == "true") {
						if (!jt.isOffline()) {
							that.model.fetch({
								timeout: typeof options != "undefined" && typeof options.timeout != "undefined" ? options.timeout : 5000,
								success: function () {
									_buff = _data = that.model.toJSON();

									jtCache.setItem(Backbone.history.getFragment(), JSON.stringify(_data), null, null, function () {
										that.render(_buff);
									});
								},
								error  : function () {
									$(".app-load").css("display", "none");
									$(".app-retry").css("display", "block");

									$(".splash .app-loader").addClass("showbtn");

									$(".app-retry").on("touchend click", function () {
										that.isConnected = true;

										$(".app-load").css("display", "block");
										$(".app-retry").css("display", "none");

										$(".splash .app-loader").removeClass("showbtn");

										that.fetch({ timeout: 10000 });
									});

									if ($(".splash").length >= 1) {
										if ($(".no-splash").length >= 1) {
											$(".splash").show().find(".splash-content").fadeIn();
											$(".no-splash").fadeOut();
										}

										$(".splash .app-refreshed").html("Tidak ada jaringan").fadeIn();
										setTimeout(function () {
											$(".splash .app-refreshed").fadeOut();
										}, 2000);

										$(".splash-content .app-loader").fadeIn();

										$(".splash-quote").remove();
										$(".splash-speaker").remove();
										$(".splash-loading").hide();
									}

									if (that.isConnected) {
										$(".app-refreshed").html("Tidak ada jaringan").fadeIn();
										setTimeout(function () {
											$(".app-refreshed").fadeOut();
										}, 2000);

										that.isConnected = false;
									}
								}
							});
						}
						else {
							setTimeout(function () {
								$(".app-load").css("display", "none");
								$(".app-retry").css("display", "block");

								$(".splash .app-loader").addClass("showbtn");

								if ($(".splash").length >= 1) {
									if ($(".no-splash").length >= 1) {
										$(".splash").show().find(".splash-content").fadeIn();
										$(".no-splash").fadeOut();
									}

									$(".splash .app-refreshed").html("Tidak ada jaringan").fadeIn();
									setTimeout(function () {
										$(".splash .app-refreshed").fadeOut();
									}, 2000);

									$(".splash-content .app-loader").fadeIn();

									$(".splash-quote").remove();
									$(".splash-speaker").remove();
									$(".splash-loading").hide();
								}

								if (that.isConnected) {
									$(".app-refreshed").html("Tidak ada jaringan").fadeIn();
									setTimeout(function () {
										$(".app-refreshed").fadeOut();
									}, 2000);

									that.isConnected = false;
								}
							}, 2000);
						}
					}
					else {
						_buff = JSON.parse(_data.value);

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
				});
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

					$("#app-body").empty().append(that.layout({
						detail: _data
					}));

					$("#app-userpanel").panel("close");
					$("#app-searchpanel").panel("close");

					$("#app-body .app-detail-container").scroll(function () {
						window.sessionStorage.setItem(Backbone.history.getFragment() + "/scrollTop", $(".app-detail-container").scrollTop());
					});

					$("img").each(function (key, val) {
						var that = this;

						$(val).attr("alt", "");

						$(val).load(function () {
							if ($(that).attr("src").indexOf("filesystem") < 0) {
								var xhr  = new XMLHttpRequest();
								xhr.onreadystatechange = function(){
									if (this.readyState == 4 && this.status == 200) {
										cacheKey = "image.article.";
										url      = btoa($(that).attr("src"));

										jtCache.setItem(cacheKey + url, {
											"type"     : "blob",
											"value"    : this.response,
											"extension": "",
											"fileType" : this.response.type
										}, window.TEMPORARY);
									}
								}
								xhr.open('GET', $(this).attr("src"));
								xhr.responseType = 'blob';
								xhr.send();
							}
						});

						/*
						 Using Placeholder
						 */
						if (isUsingPlaceholder = true) {
							regExp = /(https?\:\/\/(.*?\.)?(jalantikus\.com|babe\.news)\/assets\/cache\/)(.*?\/.*?)(\/.*?)$/g;
							value  = $(val).attr("src");

							var _placeholder = "";

							if (typeof value != "undefined" && value.match(regExp) && !$(val).hasClass("banner")) {
								var matches = regExp.exec(value);

								_images = matches[ 1 ] + $(".app-detail-body").width() + "/0" + matches[ 5 ];
								_placeholder = matches[ 1 ] + Math.ceil($(".app-detail-body").width() / 100) + "/0" + matches[ 5 ];

								$(val).data("src", _images);

								if (typeof window.resolveLocalFileSystemURL == "function") {
									window.resolveLocalFileSystemURL("cdvfile://localhost/temporary/image/image.article." + btoa(_placeholder) + ".", function (entry) {
										var nativePath = entry.toURL();
										if (typeof nativePath != "undefined") {
											$(val).attr("src", nativePath);
										}
										else {
											$(val).attr("src", _placeholder);
										}

										loadImage();
									}, function (e) {
										$(val).attr("src", _placeholder);

										loadImage();
									});
								}
								else {
									$(val).attr("src", _placeholder);

									loadImage();
								}
							}
							else if (typeof value != "undefined") {
								$(val).data("src", $(val).attr("src"));
								//$(val).attr("src", "");

								loadImage();
							}
						}
						else {
							loadImage();
						}
						/*
						 Using Placeholder
						 */

						function loadImage() {
							var img = new Image();
							$(img).on("load", function () {
								$(val).attr("src", $(img).attr("src"));
							});

							if (typeof window.resolveLocalFileSystemURL == "function") {
								window.resolveLocalFileSystemURL("cdvfile://localhost/temporary/image/image.article." + btoa($(val).data("src")) + ".", function (entry) {
									var nativePath = entry.toURL();
									if (typeof nativePath != "undefined") {
										$(val).attr("src", nativePath);
									}
									else {
										img.src = $(val).data("src");
									}
								}, function (e) {
									img.src = $(val).data("src");
								});
							}
							else {
								img.src = $(val).data("src");
							}
						}
					});

					$(".app-detail-body img").error(function () {
						var _this = $(this);
						var parent = _this.closest("p");

						if (parent.find(".image-refresh").length == 0) {
							parent.append("<div class='image-refresh'>Muat ulang gambar<a href='javascript:void(0);' class='card-link'><div class='ripple'></div></a></div>");
						}
						else {
							parent.find(".image-refresh").removeClass("active");
						}

						_this.hide();

						parent.find(".image-refresh").on("click", function () {
							if (!parent.find(".image-refresh").hasClass("active")) {
								parent.find(".image-refresh").addClass("active");
							}
							_this.attr("src", _this.data("src")).load(function () {
								parent.find(".image-refresh").remove();
								_this.fadeIn(200);
							});
						})
					});

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

					$("a").each(function (key, val) {
						regExp = /https?\:\/\/app\.jalantikus\.com\/(gadgets|tips|news|gokil)\/(.*?)(\/|$|\?)/gim;
						value  = $(val).attr("href");

						if (typeof value != "undefined") {
							$(val).attr("href", value.replace("https://app.jalantikus.com", "https://jalantikus.com").replace("https://app.jalantikus.com", "http://jalantikus.com"));
						}

						if (typeof value != "undefined" && value.match(regExp)) {
							var matches = regExp.exec(value);

							$(this).attr("href", "#article/" + matches[ 2 ]);
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

					$(".apps-detail.horizontal").each(function (key, val) {
						var _appDetail = $(this).find(".click-target").attr("href");
						var _that      = this;
						var _appSlug;

						$(this).find("a").attr("href", "javascript:void()").click(function (e) {
							e.preventDefault()
						});
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
						if (_config.environment == "live") {
							$("#iframe-jalantikus").prop("src", $("#iframe-jalantikus").data("src"));
						}
					}, 2000);

					$("#iframe-jalantikus").on("load", function () {
						$(".app-scroll-button").fadeIn();
					});

					$("a").on("click", function (e) {
						if (jt.isOffline() && !$(this).hasClass("app-home") && !$(this).hasClass("app-toggle-back")) {
							e.preventDefault();

							that.showOffline();
						}
					});

					$(".app-retry").on("touchend click", function () {
						that.isConnected = true;

						$(".app-load").css("display", "block");
						$(".app-retry").css("display", "none");

						$(".splash .app-loader").removeClass("showbtn");

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

					jtCache.getItem("favorite/" + Backbone.history.getFragment(), function(_data) {
						if (_data != null) {
							jtCache.getItem(Backbone.history.getFragment(), function(_data) {
								if (_data != null) {
									jtCache.setItem("favorite/" + Backbone.history.getFragment(), JSON.stringify(_data.value), window.PERSISTENT);
								}
							});

							$(".app-addtofavorite").addClass("active");
						}
					}, window.PERSISTENT);

					if (window.localStorage.getItem("favorite/" + Backbone.history.getFragment()) != null) {
						window.localStorage.setItem("favorite/" + Backbone.history.getFragment(), window.sessionStorage.getItem(Backbone.history.getFragment()));

						$(".app-addtofavorite").addClass("active");
					}
				}
			},
			showOffline: function () {
				$(".app-refreshed").html("Tidak ada jaringan").fadeIn();
				setTimeout(function () {
					$(".app-refreshed").fadeOut();
				}, 2000);
			},
			cleanup    : function () {
				this.undelegateEvents();
			}
		});

		return articleDetailView;
	}
);