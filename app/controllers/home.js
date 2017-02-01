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
			isFromFile      : false,
			initialize      : function (_options) {
				if (jt.isOffline() && this.type != "search") {
					this.cacheSource = window.localStorage;
				}

				if (typeof _options != "undefined") {
					this.options = _options;
				}

				var those = that = this;

				var _articleList = function (_data) {
					var dfd = jQuery.Deferred();
					if (that.isFromFile) {
						jtCache.getItem("list.article" + (Backbone.history.getFragment() != "" ? "." : "") + Backbone.history.getFragment(), function (result) {
							if (result != null && typeof result.value != "undefined") {
								dfd.resolve(result.value);
							}
							else {
								dfd.resolve(null);
							}
						});
					}
					else {
						dfd.resolve(that.cacheSource.getItem(Backbone.history.getFragment()));
					}
					return dfd.promise();
				}

				$.when(_articleList()).then(function (_result) {
					that._articleList = _result;

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
						$("#app-toolbar").addClass("disukai");
						
						jtCache.listItem("data", function(_data) {
							if (_data.length > 0) {
								var _buff = [];

								$.each(_data, function (key, val) {
									_buff.push(val);
								});

								key = 0;
								Promise.all(_buff.map(function (val) {
									if (typeof val != "undefined" && val != null) {
										article = JSON.parse(val.value);

										if (typeof article != "object") {
											article = JSON.parse(article);
										}

										if ((val.expired == "true" && !jt.isOffline() && typeof article.slug != "undefined") || 1 == 1) {
											updateFavoriteArticle (article.slug);
										}

										_buff[ key ] = article;
										_buff[ key ].type = "favorite";

										key++;
									}
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

									finishedRendering();
								});

								function updateFavoriteArticle (_slug) {
									var dfd = jQuery.Deferred();

									jtCache.getItem("article." + _slug, function (_data) {
										if (_data == null || _data.expired == "true") {
											that.articleModel = new Article({
												slug: _slug
											});

											that.articleModel.fetch({
												timeout: 5000,
												success: function (_data) {
													jtCache.setItem("article." + _slug, JSON.stringify(_data), null, null, function () {
														jtCache.setItem("favorite/article." + _slug, JSON.stringify(_data), window.PERSISTENT, null, function () {
															dfd.resolve();
														});
													});
												},
												error  : function () {
													$(".app-content-container .app-load").removeClass("loading");

													dfd.resolve();
												}
											});
										}
										else {
											jtCache.setItem("favorite/article." + _slug, _data.value, window.PERSISTENT, null, function () {
												dfd.resolve();
											});
										}
									});

									return dfd.promise();
								}
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
										order: "24hour",
										limit: 10,
										where: "views_last_24hour>=4000&&published>=" + date('Y-m-d H:00:00', strtotime('-1 month')),
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

											function cache(_data) {
												window.sessionStorage.setItem(Backbone.history.getFragment(),
														JSON.stringify(_data));

												if (that.type != "search") {
													window.localStorage.setItem(Backbone.history.getFragment(),
															JSON.stringify(_data));
												}

												that.loadImages();
											}

											that._articleList = JSON.stringify(_data);
											if (that.isFromFile) {
												jtCache.setItem("list.article" + (Backbone.history.getFragment() != "" ? "." : "") + Backbone.history.getFragment(), JSON.stringify(_data), null, null, function () {
													cache(_data);
												});
											}
											else {
												cache(_data);
											}
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
									}
									else {
										$(".recommended-articles").fadeOut();
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
							that.filter  = "shuffle";
							that.order   = "6hour";
							that.limit   = 12;
							that.cache   = 300;
							//this.where   = "published>=" + date('Y-m-d H:00:00', strtotime('-1 month'));

							$("#search-form [name='search']").val("");

							if (that.cacheSource.getItem(Backbone.history.getFragment() + "/page") >= 5) {
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
								page    : (that.cacheSource.getItem(Backbone.history.getFragment() + "/page") != null ? that.cacheSource.getItem(Backbone.history.getFragment() + "/page") : 1),
							});
						}

						if (that.cacheSource.getItem(Backbone.history.getFragment() + "/page") != null) {
							that.page = parseInt(that.cacheSource.getItem(Backbone.history.getFragment() + "/page"));
						}
						else {
							that.page = 1;

							window.sessionStorage.setItem(Backbone.history.getFragment() + "/page", that.page);
							window.sessionStorage.setItem(Backbone.history.getFragment() + "/scrollTop", $(".app-content-container").scrollTop());

							if (that.type != "search") {
								window.localStorage.setItem(Backbone.history.getFragment() + "/page", that.page);
								window.localStorage.setItem(Backbone.history.getFragment() + "/scrollTop", $(".app-content-container").scrollTop());
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
							console.log('null')
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
									$("#app-body .app-content-container").empty().append(
											'<div class="app-loader"><a href="javascript:void(0)" class="app-retry">Gagal memuat. Coba lagi?</a><div class="app-load"></div></div>'
									);
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
											where: "views_last_24hour>=4000&&published>=" + date('Y-m-d H:00:00', strtotime('-1 month')),
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
								}

								// $(".app-load").css("display", "none");
								// $(".app-retry").css("display", "block");
								$(".app-loader").addClass("showbtn");

								if ($(".no-splash").length >= 1) {
									$(".splash").show().find(".splash-content").fadeIn();
									$(".no-splash").fadeOut();

									if (!$(".splash .app-refreshed").hasClass("active")) {
										$(".splash .app-refreshed").html("Tidak ada jaringan").addClass("active").fadeIn();
										setTimeout(function () {
											$(".splash .app-refreshed").removeClass("active").fadeOut();
										}, 2000);

										that.isConnected = false;
									}

									$(".splash-content .app-loader").fadeIn();

									// $(".app-load").css("display", "none");
									$(".app-loader").addClass("showbtn");

									$(".splash-quote").remove();
									$(".splash-speaker").remove();
									$(".splash-loading").hide();
								}

								$(".app-retry").on("click touchend", function () {
									that.isConnected = true;

									// $(".app-load").css("display", "block");
									// $(".app-retry").css("display", "none");

									$(".app-loader").removeClass("showbtn");

									that.autoload();
								});
							}

							if (!jt.isOffline()) {
								that.collection.fetch({
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
								if (that._articleList == null) {
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
						
						var currentFragment = "";

						$(".header-refresh").on("click", function () {
							currentFragment = Backbone.history.getFragment();
							
							if (!$(".app-content-container .app-load").hasClass("loading") && !$(this).hasClass("active")) {
								if (!jt.isOffline()) {
									$(".header-refresh").addClass("active");

									$(".app-content-container .app-loader").fadeOut();

									function refresh() {
										that.collection = new Timeline({
											order: typeof that.order != "undefined" ? that.order : "",
											orderBy: typeof that.orderBy != "undefined" ? that.orderBy : "",
											category: typeof that.category != "undefined" ? that.category : "",
											search: typeof that.search != "undefined" ? that.search : "",
											filter: typeof that.filter != "undefined" ? that.filter : "",
											limit: typeof that.limit != "undefined" ? that.limit : "",
											cache: typeof that.cache != "undefined" ? that.cache : "",
											where: typeof that.where != "undefined" ? that.where : "",
											page: 1,
										});

										setTimeout(function() {
											that.collection.fetch({
												timeout: 10000,
												success: function () {
													$(".header-refresh").one('animationiteration webkitAnimationIteration', function() {
														$(".header-refresh").off("animationiteration webkitAnimationIteration");
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

															$(".app-refreshed").html("Refresh selesai").fadeIn();

															$("#app-body .app-content-container").empty();
															$("#app-body .app-content-container").append('<div class="app-toolbar-placeholder"></div>');

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
												error: function() {
													$(".app-content-container .app-load").removeClass("loading");
													$(".header-refresh").one('animationiteration webkitAnimationIteration', function() {
														$(".header-refresh").off("animationiteration webkitAnimationIteration");
														$(".header-refresh").removeClass("active");
													});
													$(".app-content-container .app-loader").fadeIn();
												}
											});
										}, 250);
									}

									if (that.isFromFile) {
										jtCache.removeItem("list.article" + (currentFragment != "" ? "." : "") + currentFragment, null, function () {
											refresh();
										});
									}
									else {
										refresh();
									}
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
				});
			},
			render          : function (_isUsingCache, _autoloadFragment) {
				if (_isUsingCache != true) {
					_isUsingCache = false;
				}

				var that = this;
				var _data = [];

				this.limit = (typeof this.limit == "undefined" ? 6 : this.limit);

				if (_isUsingCache == true && that._articleList != null && (JSON.parse(that._articleList)).length > 0) {
					_data = JSON.parse(that._articleList);
				}
				else {
					_data = this.collection.toJSON();
				}

				if (typeof that.type == "undefined") {
					if (that.cacheSource.getItem(Backbone.history.getFragment() + "/page") >= 5) {
						window.sessionStorage.setItem(Backbone.history.getFragment() + "/isLastPage", true);

						if (that.type != "search") {
							window.localStorage.setItem(Backbone.history.getFragment() + "/isLastPage", true);
						}
						$(".app-loader").remove();
					}
				}

				if (_data.length == 0) {
					//window.sessionStorage.setItem(Backbone.history.getFragment() + "/isLastPage", true);

					if (that.type != "search") {
						//window.localStorage.setItem(Backbone.history.getFragment() + "/isLastPage", true);
					}

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

					if (typeof _autoloadFragment == "undefined") {
						_data[ 0 ].isFirst = true;
					}

					$.each(_data, function (key, val) {
						if (_isUsingCache == false && that._articleList != null && typeof _autoloadFragment != "undefined") {
							_buff.push(val);
						}

						if (_isUsingCache == false) {
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
						}
					});

					cache = function (_data) {
						that._articleList = JSON.stringify(_data);

						function cache(_data) {
							if (typeof _autoloadFragment == "undefined" || (typeof _autoloadFragment != "undefined" && _autoloadFragment == Backbone.history.getFragment())) {
								var isValid = true;

								if (typeof _autoloadFragment != "undefined") {
									_oldData = JSON.parse(window.sessionStorage.getItem(Backbone.history.getFragment()));

									if (_oldData.length > 0 && (_oldData[0] != null && _data[0] != null) && _oldData[0].id != _data[0].id) {
										isValid = false;
									}
								}

								if (isValid) {
									window.sessionStorage.setItem(Backbone.history.getFragment(), JSON.stringify(_data));

									if (that.type != "search") {
										window.localStorage.setItem(Backbone.history.getFragment(), JSON.stringify(_data));
									}
								}
							}
						}

						if (that.isFromFile) {
							var dfd = jQuery.Deferred();
							that._articleList = JSON.stringify(_data);
							jtCache.setItem("list.article" + (Backbone.history.getFragment() != "" ? "." : "") + Backbone.history.getFragment(), JSON.stringify(_data), null, null, function () {
								cache(_data);

								dfd.resolve();
							});
							return dfd.promise();
						}
						else {
							cache(_data);
						}
					}

					if (that._articleList != null && typeof _autoloadFragment != "undefined") {
						cache(_buff);
					}
					else{
						cache(_data);
					}
				}

				if (_data.length > 0) {
					if (typeof _data[0].id == "undefined") {
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

						if (that.isFromFile) {
							jtCache.removeItem("list.article" + (Backbone.history.getFragment() != "" ? "." : "") + Backbone.history.getFragment(), null, function () {
								removeCache();
							});
						}
						else {
							removeCache();
						}
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
							$("#app-body .app-content-container")
									.append('<div class="app-toolbar-placeholder"></div>');
						}

						$("#app-body .app-content-container")
								.append(that.timelineTemplate({
									timelineArticle: _data
								}));

						if (Backbone.history.getFragment().trim() != "") {
							$(".app-toolbar").removeClass("on-top");
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

							window.sessionStorage.setItem(Backbone.history.getFragment() + "/scrollTop", $(".app-content-container").scrollTop());

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

							that.autoload();
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

					if (that.isFromFile) {
						jtCache.removeItem("list.article" + (Backbone.history.getFragment() != "" ? "." : "") + Backbone.history.getFragment(), null, function () {
							removeCache();
						});
					}
					else {
						removeCache();
					}
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
					$(".splash").fadeOut(350, function() {
						$(this).remove();
					});
					$(".no-splash").fadeOut(350, function() {
						$(this).remove();
					});

					setTimeout(function () {
						that.showUpdate();
					}, 500);
				}

				if (that.cacheSource.getItem(Backbone.history.getFragment() + "/scrollTop") != null) {
					$(".app-content-container").scrollTop(parseInt(that.cacheSource.getItem(Backbone.history.getFragment() + "/scrollTop")));
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
			autoload        : function () {
				var that = this;

				if ($(".app-content-container .app-load").is(":in-viewport") && !$(".app-content-container .app-load").hasClass("loading") && !jt.isOffline()) {
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

								that.render(null, Backbone.history.getFragment(), that);

								that.page = that.page + 1;

								window.sessionStorage.setItem(Backbone.history.getFragment() + "/page", that.page);

								if (that.type != "search") {
									window.localStorage.setItem(Backbone.history.getFragment() + "/page", that.page);
								}

								if (typeof that.options.type == "undefined" && that.cacheSource.getItem(Backbone.history.getFragment() + "/page") >= 5) {
									//window.sessionStorage.setItem(Backbone.history.getFragment() + "/isLastPage",
									// true);

									if (that.type != "search") {
										//window.localStorage.setItem(Backbone.history.getFragment() + "/isLastPage",
										// true);
									}
								}

								that.isConnected = true;
							},
							error  : function () {
								$(".app-content-container .app-load").removeClass("loading");

								// $(".app-load").css("display", "none");
								// $(".app-retry").css("display", "block");
								$(".app-loader").addClass("showbtn");
							}
						});
					}
				}
				else if ($(".app-content-container .app-load").is(":in-viewport") && jt.isOffline()) {
					setTimeout(function () {
						// $(".app-load").css("display", "none");
						// $(".app-retry").css("display", "block");
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
			loadImages: function () {
				$("img:not(.rendered)").each(function (key, val) {
					if (typeof $(val).data("src") != "undefined") {
						_nativePath = "filesystem:" + window.location.origin + "/temporary/data/image.article." + btoa($(val).data("src")) + ".";
						$(val).data("native", _nativePath);

						if (typeof window.resolveLocalFileSystemURL == "function") {
							window.resolveLocalFileSystemURL($(val).data("native"), function(_file) {
								$(val).attr("src", $(val).data("native")).addClass("rendered");
							}, function () {
								$(val).attr("src", $(val).data("src")).addClass("rendered");
							});
						}
						else {
							$(val).attr("src", $(val).data("native")).addClass("rendered");
						}

						$(val).error(function () {
							if ($(this).attr("src") != $(this).data("src")) {
								$(this).attr("src", $(this).data("src"));
							}
							else {
								$(this).hide();
							}
						});
					}

					$(val).load(function () {
						if ($(this).attr("src").indexOf("filesystem") < 0) {
							var that = this;
							var xhr  = new XMLHttpRequest();
							xhr.onreadystatechange = function(){
								if (this.readyState == 4 && this.status == 200){
									var cacheKey = "image.article.";
									var url      = $(that).attr("src");
									url          = btoa(url);

									cache(this);

									function cache(xhr) {
										//var dfd = jQuery.Deferred();

										jtCache.getItem(cacheKey + url, function(_data) {
											if (_data == null) {
												jtCache.setItem(cacheKey + url, {
													"type"     : "blob",
													"value"    : xhr.response,
													"extension": "",
													"fileType" : xhr.response.type
												}, window.TEMPORARY, null, function () {
													//dfd.resolve();
												});
											}
											else {
												//dfd.resolve();
											}
										}, window.TEMPORARY);

										//return dfd.promise();
									}
								}
							}
							xhr.open('GET', $(this).attr("src"));
							xhr.responseType = 'blob';
							xhr.send();
						}

						if (!$(this).hasClass("hidden")) {
							$(this).show();
						}
					});
				});
			}
		});

		return homeView;
	}
);