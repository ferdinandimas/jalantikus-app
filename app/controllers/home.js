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
			initialize      : function (_options) {
				var that = this;

				alert("HERE 1");

				$("#app-toolbar")
					.removeClass("detail")
					.removeClass("scroll")
					.empty()
					.append((_.template(headerLayout))());

				//var statusBarChanged = 0;
				//while (statusBarChanged != 1) {
				//    if (typeof window.StatusBar != "undefined" && !$("#app-toolbar").hasClass("detail")) {
				//        window.StatusBar.backgroundColorByHexString("#8f1f1f");
				//
				//        statusBarChanged = 1;
				//    }
				//    else if (!$("#app-toolbar").hasClass("detail")) {
				//        statusBarChanged = 1;
				//    }
				//}

				$("#app-body").empty().append(this.layout());

				if ($("#app-body .app-refreshed").length == 0) {
					$("#app-body").append(
						'<div class="app-refreshed"></div>'
					);
				}

				if (typeof _options != "undefined" && typeof _options.type != "undefined") {
					this.type = _options.type;

					if (_options.type == "home1") {
						this.order = "7day";
					}
					else if (_options.type == "home2") {
						this.category = "tips";
					}
					else if (_options.type == "home3") {
						this.category = "gokil";
					}
					else if (_options.type == "search") {
						this.search = _options.search;

						$("#app-toolbar")
							.removeClass("detail")
							.removeClass("scroll")
							.empty()
							.append((_.template(headerDetailLayout))());

						$("#search-form [name='search']").val(_options.search);
						$("#app-toolbar .header-description").html("Hasil Pencarian");
					}

					this.collection = new Timeline({
						order   : typeof this.order != "undefined" ? this.order : "",
						category: typeof this.category != "undefined" ? this.category : "",
						search  : typeof this.search != "undefined" ? this.search : "",
						page    : (window.sessionStorage.getItem(Backbone.history.getFragment() + "/page") != null ? window.sessionStorage.getItem(
							Backbone.history.getFragment() + "/page") : 1),
					});
				}
				else {
					$("#search-form [name='search']").val("");
				}

				if (this.type == "search") {
					$("#app-body .app-content-container").empty().append(
						'<div class="app-search">' +
						'<span class="app-search-result">Hasil pencarian dari: </span>' +
						'<span class="app-search-keyword">"' + this.search + '"</span>' +
						'</div>'
					);
				}

				$("a.usermenu-item").removeClass("active").each(function () {
					if ($(this).attr("href") == "#" + Backbone.history.getFragment()) {
						// $("#app-toolbar .header-description").html($(this).find(".usermenu-item-detail").html());
						if ($(this).find(".usermenu-item-detail").html().trim() != "Beranda") {
							$(".app-header .header-description").html($(this).find(".usermenu-item-detail").html());
							$(".app-logo").hide();
						}
						else {
							$(".app-logo").show();
							$(".app-toolbar").addClass("on-top");
						}
						$(this).addClass("active");
					}
				});

				if (window.sessionStorage.getItem(Backbone.history.getFragment() + "/page") != null) {
					this.page = parseInt(window.sessionStorage.getItem(Backbone.history.getFragment() + "/page"));
				}
				else {
					this.page = 1;

					window.sessionStorage.setItem(Backbone.history.getFragment() + "/page", this.page);
					window.sessionStorage.setItem(Backbone.history.getFragment() + "/scrollTop",
						$(".app-content-container").scrollTop());
				}

				alert("HERE 2");

				if (window.sessionStorage.getItem(Backbone.history.getFragment()) != null) {
					alert("HERE 4");
					window.sessionStorage.setItem(Backbone.history.getFragment() + "/page", this.page);

					$(".header-refresh").show();

					if (that.type != "search") {
						$("#app-body .app-content-container").empty();
					}
					$("#app-body .app-content-container")
							.append('<div class="app-toolbar-placeholder"></div>')

					that.render(true);
				}
				else {
					alert("HERE 3");
					function offlineHandler() {

						alert("HERE 6");
						$("#app-body .app-content-container").empty().append(
								'<div class="app-loader"><a href="javascript:void(0)" class="app-retry">Gagal memuat. Coba lagi?</a><div class="app-load"></div></div>'
						);
						$(".header-refresh").hide();

						$(".app-load").css("display", "none");
						$(".app-retry").css("display", "block");

						$(".app-retry").on("click touchend", function () {
							that.isConnected = true;

							$(".app-load").css("display", "block");
							$(".app-retry").css("display", "none");
							that.autoload();
						});

						if ($(".no-splash").length >= 1) {
							$(".splash").show().find(".splash-content").fadeIn();
							$(".no-splash").fadeOut();
						}

						if ($(".splash").length >= 1) {
							if (that.isConnected) {
								$(".splash .app-refreshed").html("Tidak ada jaringan.").fadeIn();
								setTimeout(function () {
									$(".splash .app-refreshed").fadeOut();
								}, 2000);

								that.isConnected = false;
							}

							$(".splash-content .app-loader").fadeIn();

							$(".splash-quote").remove();
							$(".splash-speaker").remove();
							$(".splash-loading").hide();
						}
					}

					if (!jt.isOffline()) {
						this.collection.fetch({
							timeout: 5000,
							success: function () {
								$(".header-refresh").show();

								if (that.type != "search") {
									$("#app-body .app-content-container").empty();
								}
								$("#app-body .app-content-container")
										.append('<div class="app-toolbar-placeholder"></div>')

								that.render();
							},
							error  : function () {
								alert("HERE 5");
								offlineHandler();
							}
						});
					}
					else {
						alert("OFFLINE NIH");

						setTimeout(function () {
							offlineHandler();
						}, 5000);
					}
				}

				$(".header-refresh").on("click", function () {
					if (!jt.isOffline()) {
						if (!$(".header-refresh").hasClass("active")) {
							$(".header-refresh").addClass("active");
							setTimeout(function () {
								$(".header-refresh").removeClass("active");

								if (!jt.isOffline()) {
									$(".app-refreshed").html("Refresh selesai.").fadeIn();
									setTimeout(function () {
										$(".app-refreshed").fadeOut();
									}, 2000);
								}
							}, 1500);
						}
					}
					else {
						if (that.isConnected) {
							$(".app-refreshed").html("Tidak ada jaringan.").fadeIn();
							setTimeout(function () {
								$(".app-refreshed").fadeOut();
							}, 2000);

							that.isConnected = false;
						}
					}

					if (!jt.isOffline()) {
						window.sessionStorage.removeItem(Backbone.history.getFragment());
						window.sessionStorage.removeItem(Backbone.history.getFragment() + "/page");
						window.sessionStorage.removeItem(Backbone.history.getFragment() + "/scrollTop");
						window.sessionStorage.removeItem(Backbone.history.getFragment() + "/isLastPage");

						$(".app-content-container").scrollTop(0);

						that.page = 1;

						that.collection = new Timeline({
							order   : typeof that.order != "undefined" ? that.order : "",
							category: typeof that.category != "undefined" ? that.category : "",
							search  : typeof that.search != "undefined" ? that.search : "",
							page    : that.page,
						});

						that.collection.fetch({
							timeout: 10000,
							success: function () {
								$("#app-body .app-content-container").empty();
								$("#app-body .app-content-container")
									.append('<div class="app-toolbar-placeholder"></div>')
								that.render();
							}
						});
					}
				});
			},
			render          : function (_isUsingCache) {
				var that  = this;
				var _data = this.collection.toJSON();

				if (_isUsingCache && window.sessionStorage.getItem(Backbone.history.getFragment()) != null) {
					_data = JSON.parse(window.sessionStorage.getItem(Backbone.history.getFragment()));
				}
				else if (_data.length == 0) {
					that.page = that.page - 1;

					window.sessionStorage.setItem(Backbone.history.getFragment() + "/page", that.page);
					window.sessionStorage.setItem(Backbone.history.getFragment() + "/isLastPage", true);
				}
				else {
					var _cachedArticle;

					if (window.sessionStorage.getItem("cachedArticle") != null) {
						_cachedArticle = window.sessionStorage.getItem("cachedArticle");
						_cachedArticle = _cachedArticle.split(",");
					}

					if (_cachedArticle == null) {
						_cachedArticle = [];
					}

					if (window.sessionStorage.getItem(Backbone.history.getFragment()) != null && this.page > 1) {
						_buff = JSON.parse(window.sessionStorage.getItem(Backbone.history.getFragment()));

						$.each(_data, function (key, val) {
							_buff.push(val);

							if (window.sessionStorage.getItem("article/" + val.slug) == null) {
								_cachedArticle.push("article/" + val.slug);

								if (_cachedArticle.length > 60) {
									window.sessionStorage.removeItem(_cachedArticle.shift());
								}

								window.sessionStorage.setItem("cachedArticle", _cachedArticle);

								this.articleModel = new Article({
									slug: val.slug
								});

								this.articleModel.fetch({
									timeout: 5000,
									success: function (_data) {
										window.sessionStorage.setItem("article/" + val.slug, JSON.stringify(_data));
									}
								});
							}
						});

						window.sessionStorage.setItem(Backbone.history.getFragment(), JSON.stringify(_buff));
					}
					else {
						$.each(_data, function (key, val) {
							if (window.sessionStorage.getItem("article/" + val.slug) == null) {
								_cachedArticle.push("article/" + val.slug);

								if (_cachedArticle.length > 60) {
									window.sessionStorage.removeItem(_cachedArticle.shift());
								}

								window.sessionStorage.setItem("cachedArticle", _cachedArticle);

								this.articleModel = new Article({
									slug: val.slug
								});

								this.articleModel.fetch({
									timeout: 5000,
									success: function (_data) {
										window.sessionStorage.setItem("article/" + val.slug, JSON.stringify(_data));
									}
								});
							}
						});

						window.sessionStorage.setItem(Backbone.history.getFragment(), JSON.stringify(_data));
					}
				}

				if (_data.length > 0) {
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

						window.sessionStorage.setItem(Backbone.history.getFragment() + "/scrollTop",
							$(".app-content-container").scrollTop());
					});

					$("#app-body .app-content-container").on("touchend", function () {
						that.autoload();
					});

					$(".app-retry").on("click touchend", function () {
						that.isConnected = true;

						$(".app-load").css("display", "block");
						$(".app-retry").css("display", "none");
						that.autoload();
					});
				}

				if (window.sessionStorage.getItem(Backbone.history.getFragment() + "/isLastPage") != null) {
					$(".app-content-container .app-loader").remove();
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

				if (window.sessionStorage.getItem(Backbone.history.getFragment() + "/scrollTop") != null) {
					$(".app-content-container")
							.scrollTop(parseInt(window.sessionStorage.getItem(Backbone.history.getFragment() + "/scrollTop")));
				}

				this.collection.reset();
			},
			autoload        : function () {
				var that = this;

				if ($(".app-content-container .app-load").is(":in-viewport") && !$(".app-content-container .app-load")
						.hasClass("loading") && !jt.isOffline()) {
					$(".app-content-container .app-load").addClass("loading");

					window.sessionStorage.setItem(Backbone.history.getFragment() + "/page", this.page + 1);

					this.collection = new Timeline({
						order   : typeof this.order != "undefined" ? this.order : "",
						category: typeof this.category != "undefined" ? this.category : "",
						search  : typeof this.search != "undefined" ? this.search : "",
						page    : this.page + 1,
					});

					this.collection.fetch({
						timeout: 10000,
						success: function () {
							that.page = that.page + 1;

							$(".header-refresh").show();
							$(".app-content-container .app-loader").remove();

							that.render();
						},
						error  : function () {
							$(".app-load").css("display", "none");
							$(".app-retry").css("display", "block");
						}
					});
				}
				else if (jt.isOffline()) {
					setTimeout(function () {
						$(".app-load").css("display", "none");
						$(".app-retry").css("display", "block");

						if (that.isConnected) {
							$(".app-refreshed").html("Tidak ada jaringan.").fadeIn();
							setTimeout(function () {
								$(".app-refreshed").fadeOut();
							}, 2000);

							that.isConnected = false;
						}
					}, 2000);
				}
			}
		});

		return homeView;
	}
);