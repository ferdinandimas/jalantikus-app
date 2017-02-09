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
			articleList     : null,
			initialize      : function (_options) {
				window.sessionStorage.removeItem(Backbone.history.getFragment() + "/isLastPage");

				if (jt.isOffline() && this.type != "search") {
					this.cacheSource = window.localStorage;
				}

				if (typeof _options != "undefined") {
					this.options = _options;
				}

				var those = that = this;

				that._articleList = that.cacheSource.getItem(Backbone.history.getFragment());

				$("#app-toolbar")
						.removeClass("detail")
						.removeClass("search")
						.removeClass("beranda")
						.removeClass("scroll")
						.removeClass("disukai")
						.empty()
						.append((_.template(headerLayout))());

				$("#app-body").empty().append(that.layout());

				if ($("#app-body .app-refreshed").length == 0) {
					$("#app-body").append(
							'<div class="app-refreshed"></div>'
					);
				}

				if (typeof _options != "undefined" && typeof _options.type != "undefined" && _options.type == "favorites") {
					/*
					 Mode Favorite
					 */
					$("#app-toolbar").addClass("disukai");

					jtCache.listItem("data", function (_data) {
						var _buff = [];

						$.each(_data, function (key, val) {
							if (val != null && typeof val.value != "undefined") {
								_buff.push(val);
							}
						});

						if (_buff.length > 0) {
							key = 0;
							Promise.all(_buff.map(function (val) {
								article = JSON.parse(val.value);

								if (typeof article != "object") {
									article = JSON.parse(article);
								}

								if (val.expired == "true" && !jt.isOffline() && typeof article.slug != "undefined") {
									updateFavoriteArticle(article.slug);
								}

								_buff[ key ]      = article;
								_buff[ key ].type = "favorite";

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
									$(".app-content-container .app-index-card:first-child")
											.css("margin-top", "0px");
								}

								finishedRendering();
							});

							function updateFavoriteArticle(_slug) {
								var dfd = jQuery.Deferred();

								that.articleModel = new Article({
									slug: _slug
								});

								that.articleModel.fetch({
									timeout: 5000,
									success: function (_data) {
										jtCache.setItem("favorite/article." + _slug, JSON.stringify(_data), window.PERSISTENT, null);

										dfd.resolve();
									},
									error  : function () {
										$(".app-content-container .app-load").removeClass("loading");

										dfd.resolve();
									}
								});

								return dfd.promise();
							}
						}
						else {
							$("#app-body .app-content-container").empty().append(
									'<div class="favorite-empty">' +
									'<img class="emoji" src="assets/images/cry-icon.png">' +
									'Maaf, Belum Ada Artikel yang Disukai.' +
									'<img src="assets/images/favorit.png">' +
									'</div>' +
									'<div class="recommended-articles">REKOMENDASI UNTUK KAMU</div>' +
									'<div class="app-index-card card-placeholder"> <div class="card-description"> <div class="card-title"> </div> <div class="card-note"> </div> </div> <div class="card-image"></div> </div>' +
									'<div class="app-index-card card-placeholder"> <div class="card-description"> <div class="card-title"> </div> <div class="card-note"> </div> </div> <div class="card-image"></div> </div>'
							);

							if (!jt.isOffline()) {
								that.collection = new Timeline({
									order: "24hour",
									limit: 10,
									where: "views_last_24hour>=4000&&published>=" + date('Y-m-d H:00:00',
											strtotime('-1 month')),
								});

								that.collection.fetch({
									timeout: 5000,
									success: function () {
										var _data = that.collection.toJSON();

										$.each(_data, function (key, val) {
											_data[ key ].type = "favorite";
										});

										$("#app-body .app-content-container .card-placeholder").remove();
										$("#app-body .app-content-container")
												.append(that.timelineTemplate({
													timelineArticle: _data
												}));

										function cache(_data) {
											window.sessionStorage.setItem(Backbone.history.getFragment(), JSON.stringify(_data));

											if (that.type != "search") {
												window.localStorage.setItem(Backbone.history.getFragment(), JSON.stringify(_data));
											}

											that.loadImages();
										}

										that._articleList = JSON.stringify(_data);

										cache(_data);
									},
									error  : function () {
										$(".app-content-container .app-load").removeClass("loading");

										$(".recommended-articles").fadeOut();
										$(".card-placeholder").fadeOut();
									}
								});
							}
							else {
								if (that._articleList != null && (JSON.parse(that._articleList)).length > 0) {
									_data = JSON.parse(that._articleList);

									$.each(_data, function (key, val) {
										_data[ key ].type = "favorite";
									});

									$("#app-body .app-content-container .card-placeholder").remove();
									$("#app-body .app-content-container")
											.append(that.timelineTemplate({
												timelineArticle: _data
											}));

									that.loadImages();
								}
								else {
									$("#app-body .app-content-container").empty().append(
											'<div class="favorite-empty">' +
											'<img class="emoji" src="assets/images/cry-icon.png">' +
											'Maaf, Belum Ada Artikel yang Disukai.' +
											'<img src="assets/images/favorit.png">' +
											'</div>'
									);
								}
							}

							finishedRendering();
						}

						function finishedRendering() {
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
								$(".splash").fadeOut(350, function () {
									$(this).remove();
								});
								$(".no-splash").fadeOut(350, function () {
									$(this).remove();
								});
							}

							if (that.cacheSource.getItem(Backbone.history.getFragment() + "/scrollTop") != null) {
								$(".app-content-container").scrollTop(parseInt(that.cacheSource.getItem(Backbone.history.getFragment() + "/scrollTop")));
							}

							// $(".app-toggle-refresh").remove();

							$("#app-body .app-content-container").scroll(function () {
								window.sessionStorage.setItem(Backbone.history.getFragment() + "/scrollTop",
										$(".app-content-container").scrollTop());

								if (that.type != "search") {
									window.localStorage.setItem(Backbone.history.getFragment() + "/scrollTop",
											$(".app-content-container").scrollTop());
								}
							});
							$(".app-toolbar").removeClass("beranda");

							that.loadImages();
						}
					}, window.PERSISTENT, "favorite.article.");
				}
				else if ((typeof _options == "undefined" || typeof _options.type == "undefined") && jt.isOffline()) {
					that.offlineMode;
				}
				else {
					if (typeof _options != "undefined" && typeof _options.type != "undefined") {
						that.type = _options.type;

						switch (_options.type) {
							case "home1":
								that.order = "published";
								break;
							case "home2":
								that.orderBy = "[[views_last_24hour,desc]]";
								that.where   = "published>=" + date('Y-m-d H:00:00', strtotime('-3 days'));
								break;
							case "home3":
								that.category = "tips";
								break;
							case "home4":
								that.category = "gokil";
								break;
							case "home5":
								that.category = "gadgets";
								break;
							case "home6":
								that.category = "news";
								break;
							case "search":
								that.search = _options.search;

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
						that.filter = "shuffle";
						that.order  = "6hour";
						that.limit  = 12;
						that.cache  = 300;

						$("#search-form [name='search']").val("");

						if ((that.cacheSource.getItem(Backbone.history.getFragment() + "/page") >= 10 && 1 == 2)) {
							window.sessionStorage.setItem(Backbone.history.getFragment() + "/isLastPage", true);

							if (that.type != "search") {
								window.localStorage.setItem(Backbone.history.getFragment() + "/isLastPage", true);
							}
							$(".app-loader").remove();
						}
					}

					if (!jt.isOffline()) {
						that.collection = new Timeline({
							order   : typeof that.order != "undefined" ? that.order : "",
							orderBy : typeof that.orderBy != "undefined" ? that.orderBy : "",
							category: typeof that.category != "undefined" ? that.category : "",
							search  : typeof that.search != "undefined" ? that.search : "",
							filter  : typeof that.filter != "undefined" ? that.filter : "",
							limit   : typeof that.limit != "undefined" ? that.limit : "",
							cache   : typeof that.cache != "undefined" ? that.cache : "",
							where   : typeof that.where != "undefined" ? that.where : "",
							page    : (that.cacheSource.getItem(Backbone.history.getFragment() + "/page") != null ? that.cacheSource.getItem(
									Backbone.history.getFragment() + "/page") : 1),
						});
					}

					if (that.cacheSource.getItem(Backbone.history.getFragment() + "/page") != null) {
						that.page = parseInt(that.cacheSource.getItem(Backbone.history.getFragment() + "/page"));
					}
					else {
						that.page = 1;

						window.sessionStorage.setItem(Backbone.history.getFragment() + "/page", that.page);
						window.sessionStorage.setItem(Backbone.history.getFragment() + "/scrollTop",
								$(".app-content-container").scrollTop());

						if (that.type != "search") {
							window.localStorage.setItem(Backbone.history.getFragment() + "/page", that.page);
							window.localStorage.setItem(Backbone.history.getFragment() + "/scrollTop",
									$(".app-content-container").scrollTop());
						}

						window.sessionStorage.removeItem(Backbone.history.getFragment() + "/lastArticle");
						window.sessionStorage.removeItem(Backbone.history.getFragment() + "/isLastPage");
					}

					if (typeof _options == "undefined") {

					}
					else if (that.type == "search") {
						$("#app-body .app-content-container").empty().append(
								'<div class="app-search">' +
								'<span class="app-search-result">Hasil pencarian dari: </span>' +
								'<span class="app-search-keyword">"' + that.search + '"</span>' +
								'</div>' +
								'<div class="app-index-card card-placeholder"> <div class="card-description"> <div class="card-title"> </div> <div class="card-note"> </div> </div> <div class="card-image"></div> </div>' +
								'<div class="app-index-card card-placeholder"> <div class="card-description"> <div class="card-title"> </div> <div class="card-note"> </div> </div> <div class="card-image"></div> </div>' +
								'<div class="app-index-card card-placeholder"> <div class="card-description"> <div class="card-title"> </div> <div class="card-note"> </div> </div> <div class="card-image"></div> </div>'
						);
					}
					else {
						$(".app-toggle-refresh").show();
					}

					if (that._articleList != null) {
						window.sessionStorage.setItem(Backbone.history.getFragment() + "/page", that.page);

						if (that.type != "search") {
							window.localStorage.setItem(Backbone.history.getFragment() + "/page", that.page);
						}

						$(".header-refresh").show();

						if (that.type != "search") {
							$("#app-body .app-content-container").empty();
						}
						$("#app-body .app-content-container").append('<div class="app-toolbar-placeholder"></div>');

						that.render(true);
					}
					else {
						function offlineHandler() {
							$(".app-content-container .app-load").removeClass("loading");

							if (that.type != "search") {
								that.page = that.page - 1;

								if (typeof _options == "undefined" || typeof _options.type == "undefined") {
									that.offlineMode();
								}
								else {
									$("#app-body .app-content-container").empty().append(
											'<div class="app-loader"><a href="javascript:void(0)" class="app-retry">Gagal memuat. Coba lagi?</a><div class="app-load"></div></div>'
									).append(
											'<div class="app-toolbar-placeholder"></div>'
									);

									$(".app-loader").addClass("showbtn");

									if ($(".no-splash").length >= 1 || $(".splash").length >= 1) {
										$(".splash").show().find(".splash-content").fadeIn();
										$(".no-splash").fadeOut();

										if (!$(".splash .app-refreshed").hasClass("active")) {
											$(".splash .app-refreshed")
													.html("Jaringan tidak stabil")
													.addClass("active")
													.fadeIn();
											setTimeout(function () {
												$(".splash .app-refreshed").removeClass("active").fadeOut();
											}, 2000);

											that.isConnected = false;
										}

										$(".splash-content .app-loader").fadeIn();

										$(".app-loader").addClass("showbtn");

										$(".splash-quote").remove();
										$(".splash-speaker").remove();
										$(".splash-loading").hide();
									}

									$(".app-retry").on("click touchend", function () {
										that.isConnected = true;

										$(".app-loader").removeClass("showbtn");

										that.autoload("retry");
									});
								}
							}
							else {
								$("#app-body .app-content-container").empty().append(
										'<div class="app-search">' +
										'<span class="app-search-result">Tidak ada hasil untuk </span>' +
										'<span class="app-search-keyword">"' + that.search + '"</span>' +
										'</div>' +
										'<div class="recommended-articles">REKOMENDASI UNTUK KAMU</div>' +
										'<div class="app-index-card card-placeholder"> <div class="card-description"> <div class="card-title"> </div> <div class="card-note"> </div> </div> <div class="card-image"></div> </div>' +
										'<div class="app-index-card card-placeholder"> <div class="card-description"> <div class="card-title"> </div> <div class="card-note"> </div> </div> <div class="card-image"></div> </div>'
								);

								if (!jt.isOffline()) {
									that.collection = new Timeline({
										order: "24hour",
										limit: 10,
										where: "views_last_24hour>=4000&&published>=" + date('Y-m-d H:00:00',
												strtotime('-1 month')),
									});

									that.collection.fetch({
										timeout: 5000,
										success: function () {
											var _data = that.collection.toJSON();

											$("#app-body .app-content-container .card-placeholder").remove();
											$("#app-body .app-content-container")
													.append(that.timelineTemplate({
														timelineArticle: _data
													}));

											that._articleList = JSON.stringify(_data);

											that.loadImages();
										},
										error  : function () {
											$(".app-content-container .app-load").removeClass("loading");

											$(".recommended-articles").fadeOut();
											$(".card-placeholder").fadeOut();
										}
									});
								}
								else {
									$(".recommended-articles").fadeOut();
								}

								$(".splash").fadeOut().remove();
								$(".no-splash").fadeOut().remove();
							}
						}

						if (!jt.isOffline()) {
							that.collection.fetch({
								timeout: 5000,
								success: function () {
									var _data = that.collection.toJSON();

									if (_data.length > 0) {
										$(".header-refresh").show();

										if (that.type != "search") {
											$("#app-body .app-content-container").empty();
										}
										$("#app-body .app-content-container")
												.append('<div class="app-toolbar-placeholder"></div>');

										that.isConnected = true;

										that.render();
									}
									else {
										offlineHandler();
									}
								},
								error  : function () {
									offlineHandler();
								}
							});
						}
						else {
							if (that._articleList == null) {
								offlineHandler();
							}
							else {
								$(".header-refresh").show();

								if (that.type != "search") {
									$("#app-body .app-content-container").empty();
								}
								$("#app-body .app-content-container")
										.append('<div class="app-toolbar-placeholder"></div>');

								that.render();
							}
						}
					}

					var currentFragment = "";

					$(".header-refresh").on("click", function () {
						currentFragment = Backbone.history.getFragment();

						if (!$(".app-content-container .app-load").hasClass("loading") && !$(this)
										.hasClass("active")) {
							if (!jt.isOffline()) {
								$(".header-refresh").addClass("active");

								$(".app-content-container .app-loader").fadeOut();

								function refresh() {
									that.collection = new Timeline({
										order   : typeof that.order != "undefined" ? that.order : "",
										orderBy : typeof that.orderBy != "undefined" ? that.orderBy : "",
										category: typeof that.category != "undefined" ? that.category : "",
										search  : typeof that.search != "undefined" ? that.search : "",
										filter  : typeof that.filter != "undefined" ? that.filter : "",
										limit   : typeof that.limit != "undefined" ? that.limit : "",
										cache   : typeof that.cache != "undefined" ? that.cache : "",
										where   : typeof that.where != "undefined" ? that.where : "",
										page    : 1,
									});

									setTimeout(function () {
										that.collection.fetch({
											timeout: 10000,
											success: function () {
												$(".header-refresh")
														.one('animationiteration webkitAnimationIteration',
																function () {
																	$(".header-refresh")
																			.off("animationiteration webkitAnimationIteration");
																	$(".header-refresh").removeClass("active");
																});

												setTimeout(function () {
													if (currentFragment == Backbone.history.getFragment()) {
														window.sessionStorage.removeItem(currentFragment);
														window.sessionStorage.removeItem(currentFragment + "/page");
														window.sessionStorage.removeItem(currentFragment + "/isLastPage");
														window.sessionStorage.removeItem(currentFragment + "/lastArticle");

														if (that.type != "search") {
															window.localStorage.removeItem(currentFragment);
															window.localStorage.removeItem(currentFragment + "/page");
															window.localStorage.removeItem(currentFragment + "/isLastPage");
														}

														that.page = 1;

														$(".app-refreshed").html("Refresh selesai").fadeIn();

														$("#app-body .app-content-container").empty();
														$("#app-body .app-content-container")
																.append('<div class="app-toolbar-placeholder"></div>');

														window.sessionStorage.removeItem(currentFragment + "/scrollTop");
														if (that.type != "search") {
															window.localStorage.removeItem(currentFragment + "/scrollTop");
														}

														$(".app-content-container").scrollTop(0);

														that.render();

														setTimeout(function () {
															$(".app-refreshed").fadeOut();
														}, 2000);
													}
												}, 1000);
											},
											error  : function () {
												$(".app-content-container .app-load").removeClass("loading");
												$(".header-refresh")
														.one('animationiteration webkitAnimationIteration',
																function () {
																	$(".header-refresh")
																			.off("animationiteration webkitAnimationIteration");
																	$(".header-refresh").removeClass("active");
																});
												$(".app-content-container .app-loader").fadeIn();
											}
										});
									}, 250);
								}

								refresh();
							}
							else {
								if (!$(".app-refreshed").hasClass("active")) {
									$(".app-refreshed").html("Tidak ada jaringan").addClass("active").fadeIn();
									setTimeout(function () {
										$(".app-refreshed").removeClass("active").fadeOut();
									}, 2000);

									that.isConnected = false;
								}
							}
						}
					});
				}

				$("a.usermenu-item").removeClass("active").each(function () {
					if ($(this).attr("href") == "#" + Backbone.history.getFragment()) {
						var isKategori = $(this).attr("href").split("/")[ 1 ];
						if ($(this).find(".usermenu-item-detail").html().trim() != "Beranda") {
							$(".app-header .header-description").html($(this).find(".usermenu-item-detail").html());
							if (isKategori == "favorites") {
								$(".app-header .header-description").html("Artikel Favorit");
							}
							$(".app-logo").hide();
						}
						else {
							$(".app-logo").show();
							$(".app-toolbar").addClass("beranda");
						}
						$(this).addClass("active");
						if (isKategori == "home3" || isKategori == "home4" || isKategori == "home5" || isKategori == "home6") {
							$(".app-kategori").addClass("active");
						}
					}
				});
			},
			render          : function (_isUsingCache, _autoloadFragment) {
				if (_isUsingCache != true) {
					_isUsingCache = false;
				}

				var that  = this;
				var _data = [];

				this.limit = (typeof this.limit == "undefined" ? 6 : this.limit);

				if (_isUsingCache == true && that._articleList != null && (JSON.parse(that._articleList)).length > 0) {
					_data = JSON.parse(that._articleList);
				}
				else {
					_data = this.collection.toJSON();
				}

				if ($("#app-header-beranda").length > 0 || that.type == "search") {

				}
				else {
					$("#app-toolbar")
						.empty()
						.append((_.template(headerLayout))());
				}

				if (typeof that.type == "undefined") {
					if (that.cacheSource.getItem(Backbone.history.getFragment() + "/page") >= 10 && 1 == 2) {
						window.sessionStorage.setItem(Backbone.history.getFragment() + "/isLastPage", true);

						if (that.type != "search") {
							window.localStorage.setItem(Backbone.history.getFragment() + "/isLastPage", true);
						}
						$(".app-loader").remove();
					}
				}

				if (_data.length == 0) {
					window.sessionStorage.removeItem(Backbone.history.getFragment() + "/lastArticle");
				}
				else {
					if (_data.length < this.limit && that.type == "search") {
						window.sessionStorage.setItem(Backbone.history.getFragment() + "/isLastPage", true);

						if (that.type != "search") {
							window.localStorage.setItem(Backbone.history.getFragment() + "/isLastPage", true);
						}

						window.sessionStorage.removeItem(Backbone.history.getFragment() + "/lastArticle");
					}

					if (that._articleList != null && typeof _autoloadFragment != "undefined") {
						_buff = JSON.parse(that._articleList);
					}

					if (typeof _autoloadFragment == "undefined" || _autoloadFragment == "retry") {
						_data[ 0 ].isFirst = true;
					}

					$.each(_data, function (key, val) {
						if (_isUsingCache == false && that._articleList != null && typeof _autoloadFragment != "undefined") {
							_buff.push(val);
						}
					});

					cache = function (_data) {
						that._articleList = JSON.stringify(_data);

						function cache(_data) {
							if (typeof _autoloadFragment == "undefined" || (typeof _autoloadFragment != "undefined" && _autoloadFragment == Backbone.history.getFragment())) {
								var isValid = true;

								if (typeof _autoloadFragment != "undefined") {
									_oldData = JSON.parse(window.sessionStorage.getItem(Backbone.history.getFragment()));

									if (_oldData != null && _oldData.length > 0 && (_oldData[ 0 ] != null && _data[ 0 ] != null) && _oldData[ 0 ].id != _data[ 0 ].id) {
										isValid = false;
									}
								}

								if (isValid) {
									window.sessionStorage.setItem(Backbone.history.getFragment(),
										JSON.stringify(_data));

									if (that.type != "search") {
										window.localStorage.setItem(Backbone.history.getFragment(),
											JSON.stringify(_data));
									}
								}
							}
						}

						cache(_data);
					}

					if (that._articleList != null && typeof _autoloadFragment != "undefined") {
						cache(_buff);
					}
					else {
						cache(_data);
					}
				}

				if (_data.length > 0) {
					if (typeof _data[ 0 ].id == "undefined") {
						function removeCache() {
							window.sessionStorage.removeItem(Backbone.history.getFragment());
							window.sessionStorage.removeItem(Backbone.history.getFragment() + "/page");
							window.sessionStorage.removeItem(Backbone.history.getFragment() + "/scrollTop");
							window.sessionStorage.removeItem(Backbone.history.getFragment() + "/isLastPage");

							if (that.type != "search") {
								window.localStorage.removeItem(Backbone.history.getFragment());
								window.localStorage.removeItem(Backbone.history.getFragment() + "/page");
								window.localStorage.removeItem(Backbone.history.getFragment() + "/scrollTop");
								window.localStorage.removeItem(Backbone.history.getFragment() + "/isLastPage");
							}

							Backbone.history.loadUrl();
						}

						removeCache();
					}
					else {
						$.each(_data, function (key, value) {
							if (typeof that.options.type == "undefined") {
								if (value.views_last_24hour >= 3100) {
									value.label = "populer";
								}
								else if (value.views_last_24hour >= 1200 && value.views_last_24hour < 3100) {
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

								value.type = 'beranda';
							}
							else {
								value.type = that.options.type;
							}
						});

						$("#app-body .app-content-container .card-placeholder").remove();

						if (typeof that.options.type != "undefined" && that.options.type == "search") {
							$("#app-body .app-content-container").append('<div class="app-toolbar-placeholder"></div>');
						}

						$("#app-body .app-content-container")
							.append(that.timelineTemplate({
								timelineArticle: _data
							}));

						if (Backbone.history.getFragment().trim() != "") {
							$(".app-content-container .app-index-card:first-child").css("margin-top", "0px");
						}

						$(".app-content-container .app-load").removeClass("loading");

						$("#app-body .app-content-container").append(
							'<div class="app-loader"><a href="javascript:void(0)" class="app-retry">Gagal memuat. Coba lagi?</a><div class="app-load"></div></div>'
						);

						$("#app-body .app-content-container").scroll(function () {
							clearTimeout($.data(this, 'scrollTimer'));
							$.data(this, 'scrollTimer', setTimeout(function () {
								that.autoload();
							}, 250));

							window.sessionStorage.setItem(Backbone.history.getFragment() + "/scrollTop",
								$(".app-content-container").scrollTop());

							if (that.type != "search") {
								window.localStorage.setItem(Backbone.history.getFragment() + "/scrollTop",
									$(".app-content-container").scrollTop());
							}
						});

						$("#app-body .app-content-container").on("touchend", function () {
							that.autoload();
						});

						$(".app-retry").on("click touchend", function () {
							that.isConnected = true;

							$(".app-loader").removeClass("showbtn");

							that.autoload("retry");
						});
					}
				}
				else if (_isUsingCache == true) {
					function removeCache() {
						window.sessionStorage.removeItem(Backbone.history.getFragment());
						window.sessionStorage.removeItem(Backbone.history.getFragment() + "/page");
						window.sessionStorage.removeItem(Backbone.history.getFragment() + "/scrollTop");
						window.sessionStorage.removeItem(Backbone.history.getFragment() + "/isLastPage");
						window.sessionStorage.removeItem(Backbone.history.getFragment() + "/lastArticle");

						if (that.type != "search") {
							window.localStorage.removeItem(Backbone.history.getFragment());
							window.localStorage.removeItem(Backbone.history.getFragment() + "/page");
							window.localStorage.removeItem(Backbone.history.getFragment() + "/scrollTop");
							window.localStorage.removeItem(Backbone.history.getFragment() + "/isLastPage");
						}

						Backbone.history.loadUrl();
					}

					removeCache();
				}
				else {
					$("#app-body .app-content-container .card-placeholder").remove();
				}

				if (that.cacheSource.getItem(Backbone.history.getFragment() + "/isLastPage") != null) {
					$(".app-content-container .app-loader").remove();
				}

				if (window.localStorage.getItem("show_splash") === "true") {
					$(".no-splash").hide();

					if ($(".splash").length >= 1) {
						setTimeout(function () {
							$(".splash").fadeOut("fast", function () {
								$(this).remove();
								that.showUpdate();
							})
						}, 2000);
					}
					else {
						that.showUpdate();
					}
				}
				else {
					$(".splash").fadeOut(350, function () {
						$(this).remove();
					});
					$(".no-splash").fadeOut(350, function () {
						$(this).remove();
					});

					setTimeout(function () {
						that.showUpdate();
					}, 500);
				}

				if (that.cacheSource.getItem(Backbone.history.getFragment() + "/scrollTop") != null) {
					$(".app-content-container")
						.scrollTop(parseInt(that.cacheSource.getItem(Backbone.history.getFragment() + "/scrollTop")));
				}

				that.loadImages();

				this.collection.reset();
			},
			showUpdate      : function () {
				if (window.sessionStorage.getItem("showed_update_alert") != "true" && Backbone.history.getFragment() == "") {
					window.sessionStorage.setItem("showed_update_alert", "true");

					jt.log("Check current version");

					$.getJSON(_config.jtAPI + "live/jtApp", function (data) {
						if (typeof data.response != "undefined" && typeof data.response.version != "undefined") {
							cordova.getAppVersion.getVersionNumber(function (version) {
								if (version != data.response.version) {
									navigator.notification.confirm(
										"Versi Baru Telah Tersedia!",
										function (confirmation) {
											if (confirmation == 2) {
												cordova.plugins.market.open('com.jalantikus.app');
											}
										},
										"UPDATE",
										[ "Nanti Saja", "Update Sekarang" ]
									);
								}
							});
						}
					});
				}
			},
			autoload        : function (_autoloadFragment) {
				var that = this;

				if ($(".app-content-container .app-load").is(":in-viewport") && !$(".app-content-container .app-load")
						.hasClass("loading") && !jt.isOffline()) {
					$(".app-content-container .app-load").addClass("loading");

					if (!jt.isOffline()) {
						this.collection = new Timeline({
							order   : typeof this.order != "undefined" ? this.order : "",
							orderBy : typeof this.orderBy != "undefined" ? this.orderBy : "",
							category: typeof this.category != "undefined" ? this.category : "",
							search  : typeof this.search != "undefined" ? this.search : "",
							filter  : typeof this.filter != "undefined" ? this.filter : "",
							limit   : typeof this.limit != "undefined" ? this.limit : "",
							cache   : typeof this.cache != "undefined" ? this.cache : "",
							where   : typeof this.where != "undefined" ? this.where : "",
							page    : this.page + 1,
						});
					}

					if (!jt.isOffline()) {
						this.collection.fetch({
							timeout: 10000,
							success: function () {
								$(".header-refresh").show();
								$(".app-content-container .app-loader").remove();

								that.render(null, typeof _autoloadFragment != "undefined" ? _autoloadFragment : Backbone.history.getFragment());

								that.page = that.page + 1;

								window.sessionStorage.setItem(Backbone.history.getFragment() + "/page", that.page);

								if (that.type != "search") {
									window.localStorage.setItem(Backbone.history.getFragment() + "/page", that.page);
								}

								isUnlimited = true
								if (typeof that.options.type == "undefined" && (that.cacheSource.getItem(Backbone.history.getFragment() + "/page") >= 10 && 1 == 2)) {
									window.sessionStorage.setItem(Backbone.history.getFragment() + "/isLastPage", true);

									if (that.type != "search") {
										window.localStorage.setItem(Backbone.history.getFragment() + "/isLastPage",
											true);
									}
								}

								that.isConnected = true;
							},
							error  : function () {
								$(".app-content-container .app-load").removeClass("loading");

								$(".app-loader").addClass("showbtn");
							}
						});
					}
				}
				else if ($(".app-content-container .app-load").is(":in-viewport") && jt.isOffline()) {
					setTimeout(function () {
						$(".app-loader").addClass("showbtn");

						if (!$(".app-refreshed").hasClass("active")) {
							$(".app-refreshed").html("Tidak ada jaringan").addClass("active").fadeIn();
							setTimeout(function () {
								$(".app-refreshed").removeClass("active").fadeOut();
							}, 2000);

							that.isConnected = false;
						}
					}, 2000);
				}
			},
			offlineMode     : function () {
				/*
				 Mode Offline
				 */

				var those = that = this;

				$("#app-toolbar").addClass("disukai");
				if (Backbone.history.getFragment() == "") {
					$("#app-toolbar").addClass("beranda");
				}
				jtCache.listItem("data", function (_data) {
					var _buff = [];

					$.each(_data, function (key, val) {
						if (val != null && typeof val.value != "undefined") {
							_buff.push(val);
						}
					});

					if (_buff.length > 0) {
						key = 0;
						Promise.all(_buff.map(function (val) {
							article = JSON.parse(val.value);

							if (typeof article != "object") {
								article = JSON.parse(article);
							}

							_buff[ key ]       = article;
							_buff[ key ].type  = "favorite";
							_buff[ key ].label = "offline";

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
								$(".app-content-container .app-index-card:first-child")
										.css("margin-top", "0px");
							}

							finishedRendering();
						});
					}
					else {
						$("#app-body .app-content-container").empty().append(
								'<div class="favorite-empty">' +
								'<img class="emoji" src="assets/images/afraid-icon.png">' +
								'Maaf, Belum Ada Artikel yang Kamu Simpan' +
								'<img src="assets/images/simpan-offline.png">' +
								'</div>'
						);

						finishedRendering();
					}

					function finishedRendering() {
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
							$(".splash").fadeOut(350, function () {
								$(this).remove();
							});
							$(".no-splash").fadeOut(350, function () {
								$(this).remove();
							});
						}

						if (that.cacheSource.getItem(Backbone.history.getFragment() + "/scrollTop") != null) {
							$(".app-content-container").scrollTop(parseInt(that.cacheSource.getItem(Backbone.history.getFragment() + "/scrollTop")));
						}

						// $(".app-toggle-refresh").remove();

						$("#app-body .app-content-container").scroll(function () {
							window.sessionStorage.setItem(Backbone.history.getFragment() + "/scrollTop",
									$(".app-content-container").scrollTop());

							if (that.type != "search") {
								window.localStorage.setItem(Backbone.history.getFragment() + "/scrollTop",
										$(".app-content-container").scrollTop());
							}
						});

						that.loadImages();
					}
				}, window.PERSISTENT, "offline.article.");
			},
			loadImages      : function () {
				$("img:not(.rendered)").each(function (key, val) {
					if (typeof $(val).attr("src") != "undefined" && $(val).attr("src").indexOf("http") >= 0) {
						if (typeof $(val).data("src") == "undefined") {
							$(val).data("src", $(val).attr("src"));
						}

						$(val).attr("alt", "");

						var img = new Image();

						$(img).on("load", function () {
							$(val).attr("src", $(img).attr("src")).addClass("rendered");
						});

						if (typeof window.resolveLocalFileSystemURL == "function") {
							window.resolveLocalFileSystemURL("filesystem:" + window.location.origin + "/persistent/data/image.article." + $(val).data("slug") + "." + btoa($(val).data("src")) + ".", function (entry) {
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
			}
		});

		return homeView;
	}
);