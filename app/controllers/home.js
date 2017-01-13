define(
	[
		"underscore",
		"backbone",
		"jquery",
		"collections/homeTimeline",
		"text!views/home_layout.html",
		"text!views/header_layout.html",
		"text!views/template/timeline.html",
		"text!views/header_detail_layout.html",
		"models/article",
	],
	function (_, Backbone, $, Timeline, homeLayout, headerLayout, timelineTemplate, headerDetailLayout, Article) {
		var homeView = Backbone.View.extend({
			timelineTemplate: _.template(timelineTemplate),
			layout          : _.template(homeLayout),
			collection      : new Timeline(),
			articleModel    : new Article(),
			isConnected     : true,
			page            : 1,
			options         : "",
			cacheSource     : window.sessionStorage,
			initialize      : function (_options) {
				if (jt.isOffline()) {
					this.cacheSource = window.localStorage;
					this.isConnected = false;
				}

				if (typeof _options != "undefined") {
					this.options = _options;
				}

				var that = this;

				$("#app-toolbar")
					.removeClass("detail")
					.removeClass("search")
					.removeClass("beranda")
					.removeClass("scroll")
					.removeClass("disukai")
					.empty()
					.append((_.template(headerLayout))());

				$("#app-body").empty().append(this.layout());

				if ($("#app-body .app-refreshed").length == 0) {
					$("#app-body").append(
						'<div class="app-refreshed"></div>'
					);
				}

				if (typeof _options != "undefined" && typeof _options.type != "undefined" && _options.type == "favorites") {
					var those = that = this;
					
					$("#app-toolbar").addClass("disukai");

					jtCache.getItem("favorite.list", function(_data) {
						_data = (_data != null && typeof _data.value != "undefined" ? _data.value : "[]");
						_buff = JSON.parse(_data);

						if (_buff.length > 0) {
							key = 0;
							Promise.all(_buff.map(function (val) {
								_buff[ key ] = val;
								_buff[ key ].type = "favorite";

								jtCache.getItem("article." + val.slug, function(_data) {
									if (_data == null || _data.expired == "true") {
										that.articleModel = new Article({
											slug: val.slug
										});

										that.articleModel.fetch({
											timeout: 5000,
											success: function (_data) {
												jtCache.setItem("article." + val.slug, JSON.stringify(_data));
											}
										});
									}
								});

								key++;
							})).then(function () {
								$("#app-body .app-content-container .card-placeholder").remove();
								$("#app-body .app-content-container").empty()
										.append('<div class="app-toolbar-placeholder"></div>')
										.append(those.timelineTemplate({
											timelineArticle: _buff
										}));

								if (Backbone.history.getFragment().trim() != "") {
									$(".app-toolbar").removeClass("beranda");
									$(".app-content-container .app-index-card:first-child").css("margin-top", "0px");
								}

								finishedRendering()
							});
						}
						else {
							$("#app-body .app-content-container").empty().append(
									'<div class="favorite-empty">' +
									'Maaf, belum ada artikel yang kamu sukai' +
									'</div>' +
									'<div class="recommended-articles">REKOMENDASI UNTUK KAMU</div>' +
									'<div class="app-index-card card-placeholder"> <div class="card-description"> <div class="card-title"> </div> <div class="card-note"> </div> </div> <div class="card-image"></div> </div>' +
									'<div class="app-index-card card-placeholder"> <div class="card-description"> <div class="card-title"> </div> <div class="card-note"> </div> </div> <div class="card-image"></div> </div>'
							);

							if (!jt.isOffline()) {
								that.collection = new Timeline({
									order   : "24hour",
									limit   : 10,
								});

								that.collection.fetch({
									timeout: 5000,
									success: function () {
										var _data = that.collection.toJSON();

										$.each(_data, function (key, val) {
											_data[ key ].type = "favorite";

											jtCache.getItem("article." + val.slug, function(_data) {
												if (_data == null || _data.expired == "true") {
													that.articleModel = new Article({
														slug: val.slug
													});

													that.articleModel.fetch({
														timeout: 5000,
														success: function (_data) {
															jtCache.setItem("article." + val.slug, JSON.stringify(_data));
														}
													});
												}
											});
										});

										$("#app-body .app-content-container .card-placeholder").remove();
										$("#app-body .app-content-container")
												.append(that.timelineTemplate({
													timelineArticle: _data
												}));

										that.loadImages();
									},
									error  : function () {
										$(".recommended-articles").fadeOut();
										$(".card-placeholder").fadeOut();
									}
								});
							}
							else {
								$(".recommended-articles").fadeOut();
							}

							finishedRendering();
						}

						function finishedRendering() {
							if (that.cacheSource.getItem("show_splash") === "true") {
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

							if (that.cacheSource.getItem(Backbone.history.getFragment() + "/scrollTop") != null) {
								$(".app-content-container")
										.scrollTop(parseInt(that.cacheSource.getItem(Backbone.history.getFragment() + "/scrollTop")));
							}

							$(".app-toggle-refresh").remove();

							$("#app-body .app-content-container").scroll(function () {
								window.sessionStorage.setItem(Backbone.history.getFragment() + "/scrollTop", $(".app-content-container").scrollTop());
								window.localStorage.setItem(Backbone.history.getFragment() + "/scrollTop", $(".app-content-container").scrollTop());
							});
							$(".app-toolbar").removeClass("beranda");

							that.loadImages();
						}
					}, window.PERSISTENT);
				}
				else {
					if (typeof _options != "undefined" && typeof _options.type != "undefined") {
						this.type = _options.type;

						switch (_options.type) {
							case "home1":
								this.order = "published";
								break;
							case "home2":
								this.order = "12hour";
								break;
							case "home3":
								this.category = "tips";
								break;
							case "home4":
								this.category = "gokil";
								break;
							case "home5":
								this.category = "gadgets";
								break;
							case "home6":
								this.category = "news";
								break;
							case "search":
								this.search = _options.search;

								$("#app-toolbar")
										.removeClass("detail")
										.removeClass("scroll")
										.removeClass("disukai")
										.removeClass("beranda")
										.addClass("search")
										.empty()
										.append((_.template(headerDetailLayout))());

								$("#search-form [name='search']").val(_options.search);
								$("#app-toolbar .header-description").html("Hasil Pencarian");
								break;
						}
					}
					else {
						this.filter = "shuffle";
						this.order  = "6hour";
						this.limit  = 12;
						this.cache  = 300;
						this.where  = "views_last_24hour>=250";

						$("#search-form [name='search']").val("");

						if (that.cacheSource.getItem(Backbone.history.getFragment() + "/page") >= 5) {
							window.sessionStorage.setItem(Backbone.history.getFragment() + "/isLastPage", true);
							window.localStorage.setItem(Backbone.history.getFragment() + "/isLastPage", true);
							$(".app-loader").remove();
						}
					}

					if (!jt.isOffline()) {
						this.collection = new Timeline({
							order: typeof this.order != "undefined" ? this.order : "",
							category: typeof this.category != "undefined" ? this.category : "",
							search: typeof this.search != "undefined" ? this.search : "",
							filter: typeof this.filter != "undefined" ? this.filter : "",
							limit: typeof this.limit != "undefined" ? this.limit : "",
							cache: typeof this.cache != "undefined" ? this.cache : "",
							where: typeof this.where != "undefined" ? this.where : "",
							page: (that.cacheSource.getItem(Backbone.history.getFragment() + "/page") != null ? that.cacheSource.getItem(Backbone.history.getFragment() + "/page") : 1),
						});
					}

					if (that.cacheSource.getItem(Backbone.history.getFragment() + "/page") != null) {
						this.page = parseInt(that.cacheSource.getItem(Backbone.history.getFragment() + "/page"));
					}
					else {
						this.page = 1;

						window.sessionStorage.setItem(Backbone.history.getFragment() + "/page", this.page);
						window.localStorage.setItem(Backbone.history.getFragment() + "/page", this.page);
						window.sessionStorage.setItem(Backbone.history.getFragment() + "/scrollTop", $(".app-content-container").scrollTop());
						window.localStorage.setItem(Backbone.history.getFragment() + "/scrollTop", $(".app-content-container").scrollTop());
					}

					if (that.cacheSource.getItem(Backbone.history.getFragment()) != null) {
						window.sessionStorage.setItem(Backbone.history.getFragment() + "/page", this.page);
						window.localStorage.setItem(Backbone.history.getFragment() + "/page", this.page);

						window.sessionStorage.setItem(Backbone.history.getFragment(), that.cacheSource.getItem(Backbone.history.getFragment()));
						window.localStorage.setItem(Backbone.history.getFragment(), that.cacheSource.getItem(Backbone.history.getFragment()));

						$(".header-refresh").show();

						if (that.type != "search") {
							$("#app-body .app-content-container").empty();
						}
						$("#app-body .app-content-container").append('<div class="app-toolbar-placeholder"></div>');

						that.render(true);
					}
					else {
						function offlineHandler() {
							$("#app-body .app-content-container").empty().append(
									'<div class="app-loader"><a href="javascript:void(0)" class="app-retry">Gagal memuat. Coba lagi?</a><div class="app-load"></div></div>'
							);

							$(".app-load").css("display", "none");
							$(".app-retry").css("display", "block");

							if ($(".no-splash").length >= 1) {
								$(".splash").show().find(".splash-content").fadeIn();
								$(".no-splash").fadeOut();

								if (that.isConnected) {
									$(".splash .app-refreshed").html("Tidak ada jaringan").fadeIn();
									setTimeout(function () {
										$(".splash .app-refreshed").fadeOut();
									}, 2000);

									that.isConnected = false;
								}

								$(".splash-content .app-loader").fadeIn();

								$(".app-load").css("display", "none");
								$(".splash .app-loader").addClass("showbtn");

								$(".splash-quote").remove();
								$(".splash-speaker").remove();
								$(".splash-loading").hide();
							}

							$(".app-retry").on("click touchend", function () {
								that.isConnected = true;

								$(".app-load").css("display", "block");
								$(".app-retry").css("display", "none");

								$(".splash .app-loader").removeClass("showbtn");

								that.autoload();
							});
						}

						if (!jt.isOffline()) {
							this.collection.fetch({
								timeout: 5000,
								success: function () {
									$(".header-refresh").show();

									if (that.type != "search") {
										$("#app-body .app-content-container").empty();
									}
									$("#app-body .app-content-container").append('<div class="app-toolbar-placeholder"></div>');

									that.isConnected = true;

									that.render();
								},
								error  : function () {
									offlineHandler();
								}
							});
						}
						else {
							if (that.cacheSource.getItem(Backbone.history.getFragment()) == null) {
								offlineHandler();
							}
							else {
								$(".header-refresh").show();

								if (that.type != "search") {
									$("#app-body .app-content-container").empty();
								}
								$("#app-body .app-content-container").append('<div class="app-toolbar-placeholder"></div>');

								that.render();
							}
						}
					}

					if (typeof _options == "undefined") {

					}
					else if (this.type == "search") {
						$("#app-body .app-content-container").empty().append(
								'<div class="app-search">' +
								'<span class="app-search-result">Hasil pencarian dari: </span>' +
								'<span class="app-search-keyword">"' + this.search + '"</span>' +
								'</div>' +
								'<div class="app-index-card card-placeholder"> <div class="card-description"> <div class="card-title"> </div> <div class="card-note"> </div> </div> <div class="card-image"></div> </div>' +
								'<div class="app-index-card card-placeholder"> <div class="card-description"> <div class="card-title"> </div> <div class="card-note"> </div> </div> <div class="card-image"></div> </div>' +
								'<div class="app-index-card card-placeholder"> <div class="card-description"> <div class="card-title"> </div> <div class="card-note"> </div> </div> <div class="card-image"></div> </div>'
						);
					}
					else {
						$(".app-toggle-refresh").show();
					}

					$(".header-refresh").on("click", function () {
						if (!$(".app-content-container .app-load").hasClass("loading") && !$(this).hasClass("active")) {
							if (!jt.isOffline()) {
								$(".header-refresh").addClass("active");

								$(".app-content-container .app-loader").fadeOut();

								window.sessionStorage.removeItem(Backbone.history.getFragment());
								window.sessionStorage.removeItem(Backbone.history.getFragment() + "/page");
								window.sessionStorage.removeItem(Backbone.history.getFragment() + "/scrollTop");
								window.sessionStorage.removeItem(Backbone.history.getFragment() + "/isLastPage");

								window.localStorage.removeItem(Backbone.history.getFragment());
								window.localStorage.removeItem(Backbone.history.getFragment() + "/page");
								window.localStorage.removeItem(Backbone.history.getFragment() + "/scrollTop");
								window.localStorage.removeItem(Backbone.history.getFragment() + "/isLastPage");

								that.page = 1;

								that.collection = new Timeline({
									order: typeof that.order != "undefined" ? that.order : "",
									category: typeof that.category != "undefined" ? that.category : "",
									search: typeof that.search != "undefined" ? that.search : "",
									filter: typeof that.filter != "undefined" ? that.filter : "",
									limit: typeof that.limit != "undefined" ? that.limit : "",
									cache: typeof that.cache != "undefined" ? that.cache : "",
									where: typeof that.where != "undefined" ? that.where : "",
									page: (that.cacheSource.getItem(Backbone.history.getFragment() + "/page") != null ? that.cacheSource.getItem(Backbone.history.getFragment() + "/page") : 1),
								});

								that.collection.fetch({
									timeout: 10000,
									success: function () {
										setTimeout(function () {
											$(".header-refresh").removeClass("active");

											$(".app-refreshed").html("Refresh selesai").fadeIn();

											$(".app-content-container").scrollTop(0)

											$("#app-body .app-content-container").empty();
											$("#app-body .app-content-container").append('<div class="app-toolbar-placeholder"></div>');
											that.render();

											setTimeout(function () {
												$(".app-refreshed").fadeOut();
											}, 2000);
										}, 1500);
									},
									error: function() {
										setTimeout(function () {
											$(".header-refresh").removeClass("active");
											$(".app-content-container .app-loader").fadeIn();

											$(".app-refreshed").html("Refresh selesai").fadeIn();
											setTimeout(function () {
												$(".app-refreshed").fadeOut();
											}, 2000);
										}, 1500);
									}
								});
							}
							else {
								if (that.isConnected) {
									$(".app-refreshed").html("Tidak ada jaringan").fadeIn();
									setTimeout(function () {
										$(".app-refreshed").fadeOut();
									}, 2000);

									that.isConnected = false;
								}
							}
						}
					});
				}

				$("a.usermenu-item").removeClass("active").each(function () {
					if ($(this).attr("href") == "#" + Backbone.history.getFragment()) {
						var isKategori = $(this).attr("href").split("/")[1];
						// $("#app-toolbar .header-description").html($(this).find(".usermenu-item-detail").html());
						if ($(this).find(".usermenu-item-detail").html().trim() != "Beranda") {
							$(".app-header .header-description").html($(this).find(".usermenu-item-detail").html());
							if(isKategori == "favorites")
							{
								$(".app-header .header-description").html("Artikel Favorit");
							}
							$(".app-logo").hide();
						}
						else {
							$(".app-logo").show();
							$(".app-toolbar").addClass("beranda");
						}
						$(this).addClass("active");
						if(isKategori == "home3" || isKategori == "home4" || isKategori == "home5" || isKategori == "home6" )
						{
							$(".app-kategori").addClass("active");
						}
					}
				});
			},
			render          : function (_isUsingCache) {
				var that  = this;
				var _data = this.collection.toJSON();

				if (_isUsingCache && that.cacheSource.getItem(Backbone.history.getFragment()) != null && (JSON.parse(that.cacheSource.getItem(Backbone.history.getFragment()))).length > 0) {
					_data = JSON.parse(that.cacheSource.getItem(Backbone.history.getFragment()));
				}
				else if (_data.length == 0) {
					that.page = that.page - 1;

					window.sessionStorage.setItem(Backbone.history.getFragment() + "/page", that.page);
					window.localStorage.setItem(Backbone.history.getFragment() + "/page", that.page);
					window.sessionStorage.setItem(Backbone.history.getFragment() + "/isLastPage", true);
					window.localStorage.setItem(Backbone.history.getFragment() + "/isLastPage", true);
				}
				else {
					if (that.cacheSource.getItem(Backbone.history.getFragment()) != null && this.page > 1) {
						_buff = JSON.parse(that.cacheSource.getItem(Backbone.history.getFragment()));
					}

					$.each(_data, function (key, val) {
						if (that.cacheSource.getItem(Backbone.history.getFragment()) != null && that.page > 1) {
							_buff.push(val);
						}

						jtCache.getItem("article." + val.slug, function(_data) {
							if (_data == null || _data.expired == "true") {
								that.articleModel = new Article({
									slug: val.slug
								});

								that.articleModel.fetch({
									timeout: 5000,
									success: function (_data) {
										jtCache.setItem("article." + val.slug, JSON.stringify(_data));
									}
								});
							}
						});
					});

					if (that.cacheSource.getItem(Backbone.history.getFragment()) != null && this.page > 1) {
						window.sessionStorage.setItem(Backbone.history.getFragment(), JSON.stringify(_buff));
						window.localStorage.setItem(Backbone.history.getFragment(), JSON.stringify(_buff));
					}
					else{
						window.sessionStorage.setItem(Backbone.history.getFragment(), JSON.stringify(_data));
						window.localStorage.setItem(Backbone.history.getFragment(), JSON.stringify(_data));
					}
				}

				if (_data.length > 0) {
					if (typeof _data[0].id == "undefined") {
						window.sessionStorage.removeItem(Backbone.history.getFragment());
						window.sessionStorage.removeItem(Backbone.history.getFragment() + "/page");
						window.sessionStorage.removeItem(Backbone.history.getFragment() + "/scrollTop");
						window.sessionStorage.removeItem(Backbone.history.getFragment() + "/isLastPage");

						window.localStorage.removeItem(Backbone.history.getFragment());
						window.localStorage.removeItem(Backbone.history.getFragment() + "/page");
						window.localStorage.removeItem(Backbone.history.getFragment() + "/scrollTop");
						window.localStorage.removeItem(Backbone.history.getFragment() + "/isLastPage");

						Backbone.history.loadUrl();
					}
					else {
						if (typeof that.options.type == "undefined") {
							$.each(_data, function (key, value) {
								if (value.views_last_24hour >= 2100) {
									value.label = "populer";
								}
								else if (value.views_last_24hour >= 1200 && value.views_last_24hour < 2100) {
									value.label = "wajibbaca";
								}
								else if (value.views_last_24hour >= 500 && value.views_last_24hour < 1200) {
									value.label = "banyakdisukai";
								}
								else if (Math.floor((new Date() - new Date(value.published)) / 1000) < 18000) {
									value.label = "terbaru";
								}
								else {
									value.label = "direkomendasikan";
								}
							});
						}

						$("#app-body .app-content-container .card-placeholder").remove();
						$("#app-body .app-content-container")
								.append(this.timelineTemplate({
									timelineArticle: _data
								}));

						if (Backbone.history.getFragment().trim() != "") {
							$(".app-toolbar").removeClass("on-top");
							$(".app-content-container .app-index-card:first-child").css("margin-top", "0px");
						}

						$("#app-body .app-content-container").append(
								'<div class="app-loader"><a href="javascript:void(0)" class="app-retry">Gagal memuat. Coba lagi?</a><div class="app-load"></div></div>'
						);

						$("#app-body .app-content-container").scroll(function () {
							clearTimeout($.data(this, 'scrollTimer'));
							$.data(this, 'scrollTimer', setTimeout(function () {
								that.autoload();
							}, 250));

							window.sessionStorage.setItem(Backbone.history.getFragment() + "/scrollTop", $(".app-content-container").scrollTop());
							window.localStorage.setItem(Backbone.history.getFragment() + "/scrollTop", $(".app-content-container").scrollTop());
						});

						$("#app-body .app-content-container").on("touchend", function () {
							that.autoload();
						});

						$(".app-retry").on("click touchend", function () {
							that.isConnected = true;

							$(".app-load").css("display", "block");
							$(".app-retry").css("display", "none");
							$(".splash .app-loader").removeClass("showbtn");

							that.autoload();
						});
					}
				}
				else if (_isUsingCache) {
					window.sessionStorage.removeItem(Backbone.history.getFragment());
					window.sessionStorage.removeItem(Backbone.history.getFragment() + "/page");
					window.sessionStorage.removeItem(Backbone.history.getFragment() + "/scrollTop");
					window.sessionStorage.removeItem(Backbone.history.getFragment() + "/isLastPage");

					window.localStorage.removeItem(Backbone.history.getFragment());
					window.localStorage.removeItem(Backbone.history.getFragment() + "/page");
					window.localStorage.removeItem(Backbone.history.getFragment() + "/scrollTop");
					window.localStorage.removeItem(Backbone.history.getFragment() + "/isLastPage");

					Backbone.history.loadUrl();
				}

				if (that.cacheSource.getItem(Backbone.history.getFragment() + "/isLastPage") != null) {
					$(".app-content-container .app-loader").remove();
				}

				if (that.cacheSource.getItem("show_splash") === "true") {
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

				if (that.cacheSource.getItem(Backbone.history.getFragment() + "/scrollTop") != null) {
					$(".app-content-container").scrollTop(parseInt(that.cacheSource.getItem(Backbone.history.getFragment() + "/scrollTop")));
				}

				that.loadImages();

				this.collection.reset();
			},
			autoload        : function () {
				var that = this;

				if ($(".app-content-container .app-load").is(":in-viewport") && !$(".app-content-container .app-load").hasClass("loading") && !jt.isOffline()) {
					$(".app-content-container .app-load").addClass("loading");

					window.sessionStorage.setItem(Backbone.history.getFragment() + "/page", this.page + 1);
					window.localStorage.setItem(Backbone.history.getFragment() + "/page", this.page + 1);

					if (typeof this.options.type == "undefined" && that.cacheSource.getItem(Backbone.history.getFragment() + "/page") >= 5) {
						window.sessionStorage.setItem(Backbone.history.getFragment() + "/isLastPage", true);
						window.localStorage.setItem(Backbone.history.getFragment() + "/isLastPage", true);
						$(".app-toggle-refresh").hide();
					}

					if (!jt.isOffline()) {
						this.collection = new Timeline({
							order: typeof this.order != "undefined" ? this.order : "",
							category: typeof this.category != "undefined" ? this.category : "",
							search: typeof this.search != "undefined" ? this.search : "",
							filter: typeof this.filter != "undefined" ? this.filter : "",
							limit: typeof this.limit != "undefined" ? this.limit : "",
							cache: typeof this.cache != "undefined" ? this.cache : "",
							where: typeof this.where != "undefined" ? this.where : "",
							page: this.page + 1,
						});
					}

					if (!jt.isOffline()) {
						this.collection.fetch({
							timeout: 10000,
							success: function () {
								that.page = that.page + 1;

								$(".header-refresh").show();
								$(".app-content-container .app-loader").remove();

								that.isConnected = true;

								that.render();
							},
							error  : function () {
								$(".app-load").css("display", "none");
								$(".app-retry").css("display", "block");
								$(".splash .app-loader").addClass("showbtn");
							}
						});
					}
				}
				else if (jt.isOffline()) {
					setTimeout(function () {
						$(".app-load").css("display", "none");
						$(".app-retry").css("display", "block");
						$(".splash .app-loader").addClass("showbtn");

						if (that.isConnected) {
							$(".app-refreshed").html("Tidak ada jaringan").fadeIn();
							setTimeout(function () {
								$(".app-refreshed").fadeOut();
							}, 2000);

							that.isConnected = false;
						}
					}, 2000);
				}
			},
			loadImages: function () {
				$("img").error(function () {
					$(this).attr("src", "").attr("alt", "");
				}).load(function () {
					if ($(this).attr("src").indexOf("filesystem") < 0) {
						var that = this;
						var xhr  = new XMLHttpRequest();
						xhr.onreadystatechange = function(){
							if (this.readyState == 4 && this.status == 200){
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

				$("img").each(function (key, val) {
					var img = new Image();
					$(img).on("load", img, function () {
						$(val).attr("src", $(val).data("src"));
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
				});
			}
		});

		return homeView;
	}
);