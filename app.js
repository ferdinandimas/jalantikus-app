require.config({
	baseUrl: 'app',
	paths  : {
		app                   : '',
		lib                   : 'lib',
		underscore            : 'lib/underscore-min',
		backbone              : 'lib/backbone-min',
		jquery                : 'lib/jquery-2.x.min',
		"jquery.mobile-config": 'config/jquery.mobile',
		"jquery.mobile"       : 'lib/jquery.mobile-1.4.5.min',
		"jquery.mobile"       : 'lib/jquery.mobile-1.4.5.min',
		isInViewport          : 'lib/isInViewport.min',
		fastclick             : 'lib/fastclick-min',
		prettify              : 'lib/prettify',
		jt                    : 'lib/jt-lib',
		jtCache               : 'lib/jt-cache-lib',
		oneSignal             : 'lib/oneSignal-lib',
		text                  : 'lib/require/text',
	},
	shim   : {
		jt                    : {
			exports: "jt",
		},
		jtCache               : {
			exports: "jtCache",
		},
		underscore            : {
			deps   : [ "jt", "jtCache" ],
			exports: "_",
		},
		jquery                : {
			deps   : [ "jt", "jtCache" ],
			exports: "$",
		},
		"jquery.mobile-config": [ "jt", "jtCache", "jquery" ],
		"jquery.mobile"       : [ "jt", "jtCache", "jquery", "jquery.mobile-config" ],
		isInViewport          : [ "jquery" ],
		fastclick             : [ "jquery" ],
		prettify              : [ "jquery" ],
		backbone              : {
			deps   : [ "jt", "jtCache", "underscore", "jquery" ],
			exports: "Backbone"
		},
		oneSignal             : {
			deps   : [ "jt", "jtCache" ],
			exports: "oneSignal",
		},
	},

	// Disable script caching on development mode
	urlArgs: "version=" + (_config.environment == "dev" ? (new Date()).getTime() : _config.timestamp)
});

require(
	[ "main", "backbone", "jquery", "jquery.mobile", "isInViewport", "oneSignal" ],
	function (Router) {
		window.BackboneRouter = new Router();

		$.xhrPool = [];
		$.xhrPool.abortAll = function() {
			$(this).each(function(idx, jqXHR) {
				jqXHR.abort();
			});
			$.xhrPool.length = 0
		};

		$.ajaxSetup({
			beforeSend: function(jqXHR) {
				$.xhrPool.push(jqXHR);
			},
			complete: function(jqXHR) {
				var index = $.xhrPool.indexOf(jqXHR);
				if (index > -1) {
					$.xhrPool.splice(index, 1);
				}
			}
		});

		$(function () {
			if (typeof MobileAccessibility != "undefined") {
				MobileAccessibility.usePreferredTextZoom(false);
			}

			document.addEventListener("deviceready", function () {
				jt.log("Device Ready");

				if (typeof window.StatusBar != "undefined") {
					window.StatusBar.backgroundColorByHexString("#8F1F1F");
				}

				if (typeof navigator.splashscreen != "undefined") {
					navigator.splashscreen.hide();
				}

				if (_config.environment != "dev") {
					oneSignal.init();
					oneSignal.isSubscribed();
				}

				document.addEventListener("backbutton", function (e) {
					$.xhrPool.abortAll();
					fragment = Backbone.history.getFragment();
					if ($(".app-kategori-overlay").hasClass("active")) {
						$(".kategori-close").click()
					}
					else if ($(".popup-userpanel").hasClass("active")) {
						$(".userpanel-close").click()
					}
					else {
						if ((fragment == "" || fragment.indexOf("index/") == 0) || window.history.length == 1) {
							if (fragment.indexOf("index/") == 0) {
								window.location.href = "#";
							}
							else {
								if (typeof navigator.notification != "undefined") {
									navigator.notification.confirm(
											"Tutup JalanTikus?",
											function (confirmation) {
												if (confirmation == 1) {
													navigator.app.exitApp();
												}
											},
											"Keluar",
											[ "Ya", "Tidak" ]
									);
								}
							}
						}
						else {
							window.history.back();
						}
					}
				});

				$.each(Object.keys(localStorage), function(key, val) {
					if (val.indexOf("favorite/") != -1) {
						if (window.localStorage.getItem(val) != null) {
							jtCache.setItem(val, window.localStorage.getItem(val), window.PERSISTENT, null, function () {
								window.localStorage.removeItem(val);
							});
						}
					}
				});
			});

			$.mobile.loading().hide();

			if (window.localStorage.getItem("show_splash") == null) {
				window.localStorage.setItem("show_splash", true);
			}

			if (window.localStorage.getItem("show_splash") === "true") {
				$(".no-splash").remove();

				$("#mutiara").prop("checked", true);
				$(".splash-content").fadeIn();
			}
			else {
				$(".splash").fadeOut("fast");
			}

			if (jt.isOffline()) {
				if (window.localStorage.getItem(Backbone.history.getFragment()) == null) {
					setTimeout(function () {
						$("#app-body .app-content-container").empty().append(
								'<div class="app-loader"><a href="javascript:void(0)" class="app-retry">Gagal memuat. Coba lagi?</a><div class="app-load"></div></div>'
						);
						// $(".header-refresh").hide();

						$(".app-load").css("display", "none");
						$(".splash .app-loader").addClass("showbtn");

						if ($(".no-splash").length >= 1) {
							$(".splash").show().find(".splash-content").fadeIn();
							$(".no-splash").fadeOut();
						}

						$(".app-retry").on("click touchend", function () {
							$(".app-load").css("display", "block");
							$(".splash .app-loader").removeClass("showbtn");

							Backbone.history.loadUrl();
						});

						if ($(".splash").length >= 1) {
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
					}, 5000);
				}
			}

			if ($("#app-body .app-refreshed").length == 0) {
				$("#app-body").append(
						'<div class="app-refreshed"></div>'
				);
			}

			$("#search-form").on("submit", function (e) {
				e.preventDefault();

				window.BackboneRouter.navigate("search/" + $("#search-form [name='search']").val(), { trigger: true });

				$("#app-searchpanel").panel("close");
			});

			$(document).on("submit", "#quick-search-form", function (e) {
				e.preventDefault();
				window.BackboneRouter.navigate("search/" + $("#quick-search-form [name='quick-search']").val(), { trigger: true });
			});

			$(document).on("click", ".app-logo .card-link", function () {
				$(".app-content-container").animate({ scrollTop: 0 }, "slow");
			});

			$(document).on("click", ".image-refresh.not-support .card-link", function(e)
			{
				e.preventDefault();
				window.open($(this).data("href"), '_system');
			})

			$(document).on("click", ".app-toggle-searchpanel", function (e) {
				if (jt.isOffline()) {
					e.preventDefault();

					if (!$(".app-refreshed").hasClass("active")) {
						$(".app-refreshed").html("Tidak ada jaringan").addClass("active").fadeIn();
						setTimeout(function () {
							$(".app-refreshed").removeClass("active").fadeOut();
						}, 2000);
					}
				}
				else {
					var _this = $(this);
					_this.addClass("active");

					var _searchpanel = setTimeout(function () {
						_this.removeClass("active");
					}, 300);

					var _focus = setTimeout(function () {
						$(".searchbar").focus();
					}, 500);
				}
			});

			$(document).on("click", ".usermenu-item", function (e) {
				var _currUI = $(this);
				if (!_currUI.hasClass("active") &&
						!_currUI.hasClass("app-rate") &&
						!_currUI.hasClass("app-setting") &&
						!_currUI.hasClass("app-share") &&
						!_currUI.hasClass("item-pass")) {
					$('.usermenu-item').not(_currUI).not(".item-kategori").removeClass("active");
					_currUI.addClass("active");
				}
				else if(_currUI.hasClass("active") && !_currUI.hasClass("app-kategori"))
				{
					$(".app-content-container").animate({ scrollTop: 0 }, "slow");
				}
			});

			$(document).on("click", ".app-header .app-toggle-back", function (e) {
				$.xhrPool.abortAll();

				e.preventDefault();

				$(this).addClass("active");
				var _history = setTimeout(function () {
					window.history.back();
				}, 250);
			});

			$(document).on("click", "a", function (e) {
				if (!$(this).hasClass("image-refresh-link")) {
					if (!$(this).hasClass("app-retry")) {
						$.xhrPool.abortAll();
					}
				}
			});

			var _slideSt, _slideCur, _slideFlag = false, _slideVt, _slideVtCur;
			$(document).on("touchstart", "#app-body", function (e) {
				_slideSt = e.originalEvent.touches[ 0 ].pageX;
				_slideVt = e.originalEvent.touches[ 0 ].pageY;
			});

			$(document).on("touchmove", "#app-body", function (e) {
				_slideCur   = e.originalEvent.touches[ 0 ].pageX;
				_slideVtCur = e.originalEvent.touches[ 0 ].pageY;
				if (_slideFlag == false) {
					if (_slideCur - _slideSt > 30 && Math.abs(_slideVtCur - _slideVt) < 30) {
						if ($.mobile.activePage.jqmData("panel") !== "open" && !$(".app-toolbar")
										.hasClass("detail")) {
							_slideFlag = true;
							smoothSlide();
							$(".app-content-container").css("overflow-y", "hidden")
							$("#app-userpanel").addClass("ui-panel-open").removeClass("ui-panel-closed");
						}
					}
				}
			});

			function smoothSlide(e) {
				var _slide = setInterval(function (e) {
					if (_slideFlag) {
						$("#app-userpanel").animate({
							left: _slideCur - 290
						}, 0, "linear");
						if (parseInt($("#app-userpanel").css("left")) > 0) {
							$("#app-userpanel").css("left", (0));
						}
					}
					else {
						clearInterval(_slide);
					}
				}, 20)
			}

			$(document).on("touchend", "#app-body", function (e) {
				if (_slideFlag) {
					$(".app-content-container").css("overflow-y", "scroll")
					if (parseInt($("#app-userpanel").css("left")) > -280) {
						$("#app-userpanel").animate({
							left: 0
						}, 100, function () {
							$("#app-userpanel").panel("open");
						});
					}
					else {
						$("#app-userpanel").animate({
							left: -290
						}, 100, function () {
							$("#app-userpanel").removeClass("ui-panel-open").addClass("ui-panel-closed");
							$("#app-userpanel").panel("close");
							$("#app-userpanel").css("left", 0);
						});
					}
					_slideFlag = false;
				}
			});

			$(document).on("click", ".app-header .app-home", function (e) {
				var _this = $(this);
				_this.addClass("active");
				var _searchpanel = setTimeout(function () {
					_this.removeClass("active");
				}, 300);
			});

			$(document).on("focus", ".quick-search", function (e) {
				$(".quick-search-dismiss").addClass("active");
				$(".quick-search-container").addClass("active");
			});
			$(document).on("click", ".quick-search-dismiss", function (e) {
				$(".quick-search-dismiss").removeClass("active");
				$(".quick-search-container").removeClass("active");
			});
			var _displayRate = [
				"Dari lubuk hati kami yang terdalam, kami minta maaf :'(",
				"Mohon maaf atas ketidaknyamanannya, akan segera kami perbaiki :)",
				"Berikan kami kesempatan lagi untuk membuat aplikasi ini lebih baik.",
				"Terima kasih, segala kritik dan saran akan sangat membantu :)",
				"Terima Kasih, Kami akan terus berusaha membuatnya lebih baik :)"
			];
			$(document).on("click", ".rate-star", function () {
				var rate = $(this).data("rate");
				switch (rate) {
					case 1:
						$(".app-rating-subtitle").html(_displayRate[ 0 ]);
						break;
					case 2:
						$(".app-rating-subtitle").html(_displayRate[ 1 ]);
						break;
					case 3:
						$(".app-rating-subtitle").html(_displayRate[ 2 ]);
						break;
					case 4:
						$(".app-rating-subtitle").html(_displayRate[ 3 ]);
						break;
					case 5:
						$(".app-rating-subtitle").html(_displayRate[ 4 ]);
						break;
					default:
						jt.log("Error Rate");
						break;
				}
				stars(rate);
			});

			function stars(e) {
				$(".rate-star").removeClass("active");
				for (var q = 1; q <= e; q++) {
					$(".rate-" + q).addClass("active");
				}
			}

			$(document).on("click", ".app-rate", function (e) {
				setTimeout(function () {
					$(".app-rating").fadeIn();
					$("#app-userpanel").panel("close");
					$(".popup-userpanel").removeClass("active")
					$(".popup-userpanel-container").fadeOut();
				}, 150);
			});

			$(document).on("click", ".app-setting", function (e) {
				setTimeout(function () {
					$(".app-settings").fadeIn();
					$("#app-userpanel").panel("close");
					$(".popup-userpanel").removeClass("active")
					$(".popup-userpanel-container").fadeOut();
				}, 150);
			});

			$(document).on("click", ".rating-close", function () {
				$(".app-rating").fadeOut();
			});
			$(document).on("click", ".settings-close", function () {
				$(".app-settings").fadeOut();
			});
			$(document).on("click", ".kategori-close", function () {
				$(".app-kategori-overlay").removeClass("active")
				$(".app-kategori-overlay").fadeOut(200);
				$(".app-kategori").removeClass("active")
				if (Backbone.history.getFragment().trim() != "") {
					$("a[href='#"+Backbone.history.getFragment()+"']").addClass("active")
				}
				else
				{
					$(".terbaik").closest("a").addClass("active")
				}
			});
			$(document).on("click", ".userpanel-close", function () {
				$(".popup-userpanel").removeClass("active")
				$(".popup-userpanel-container").fadeOut();
			});

			$(document).on("click", ".app-rating-submit .rating-link", function (e) {
				setTimeout(function () {
					$(".app-rating").fadeOut(300);
					cordova.plugins.market.open('com.jalantikus.app')
				}, 500);

				jt.ripple($(this), e, "slow");
			});

			$(document).on("click", ".image-refresh .card-link", function(e){
				jt.ripple($(this), e, "", "");
			});

			$(document).on("click", ".item-kategori", function (e) {
				var _this = $(this);
				if(!_this.hasClass("active"))
				{
					$(".item-kategori").removeClass("active");
					_this.addClass("active");
				}
				setTimeout(function(){
					$(".app-kategori-overlay").removeClass("active");
					$(".app-kategori-overlay").fadeOut(200);
				}, 200)

			})

			$(document).on("click", ".usermenu-item", function (e) {
				if(!jt.isOffline())
				{
					if (!$(this).hasClass("item-pass")) {
						jt.ripple($(this), e, "instant", "s");
					}
					else {
						jt.ripple($(this), e, "", "");
					}
					if (!$(this).hasClass("app-kategori") && !$(this).hasClass("item-kategori") && $(".app-kategori-overlay").hasClass("active")) {
						$(".item-kategori").removeClass("active");
						$(".app-kategori-overlay").removeClass("active");
						$(".app-kategori-overlay").fadeOut(200);
					}
				}
				else
				{
					if($(this).find(".terbaik").length > 0 || $(this).find(".favorit").length > 0)
					{
						jt.ripple($(this), e, "instant", "s");
					}
					else if($(this).hasClass("item-pass"))
					{
						jt.ripple($(this), e, "", "");
					}
					else
					{
						e.preventDefault();
						$(".usermenu-item").removeClass("active");
						$("a[href='#"+Backbone.history.getFragment()+"']").addClass("active")
						if (!$(".app-refreshed").hasClass("active")) {
							$(".app-refreshed").html("Tidak ada jaringan").addClass("active").fadeIn();
							setTimeout(function () {
								$(".app-refreshed").removeClass("active").fadeOut();
							}, 2000);
						}
					}
				}
			});

			$(document).on("change", "#notification", function () {
				if (typeof navigator.notification != "undefined") {
					if (!$(this).is(":checked")) {
						navigator.notification.confirm(
								"Ingin mematikan notifikasi?",
								function (confirmation) {
									if (confirmation != 1) {
										$("#notification").prop("checked", true);
									}
									else if (confirmation == 1) {
										if (typeof oneSignal == "object") {
											oneSignal.setSubscription(false);
										}

										$("#app-userpanel").panel("close");
										if (!$(".app-refreshed").hasClass("active")) {
											$(".app-refreshed").html("Notifikasi berhasil dimatikan").fadeIn();
											setTimeout(function () {
												$(".app-refreshed").fadeOut();
											}, 2000);
										}
									}
								},
								"",
								[ "Ya", "Tidak" ]
						);
					}
					else {
						if (typeof oneSignal == "object") {
							oneSignal.setSubscription(true);
						}
					}
				}
				else {
					if (typeof oneSignal == "object") {
						if (!$(this).is(":checked")) {
							oneSignal.setSubscription(false);
						}
						else {
							oneSignal.setSubscription(true);
						}
					}
				}
			});

			$(document).on("change", "#mutiara", function () {
				if (!$(this).is(":checked")) {
					window.localStorage.setItem("show_splash", false);
				}
				else {
					window.localStorage.setItem("show_splash", true);
				}
			});

			var _scrolling = false, _direction, _pos, _velocity = 0, _scrollInterval;
			$(document).on("touchstart", ".scroll-button", function (e) {
				if (!_scrolling && !$(".app-detail-container").is(':animated')) {
					_scrolling = true
					_direction = $(this).data("direction");
					$(this).addClass("active")
					if (_direction == "up") {
						_velocity = -260;
					}
					else if (_direction == "down") {
						_velocity = 260;
					}
					_pos = $(".app-detail-container").scrollTop() + _velocity;
					$(".app-detail-container").animate({
								"scrollTop": _pos
							}
							, 300);
					_scrollInterval = setInterval(function () {
						_pos = $(".app-detail-container").scrollTop() + _velocity;
						if (_scrolling == true) {
							$(".app-detail-container").animate({
										"scrollTop": _pos
									}
									, 300);
						}
						else {
							clearInterval(_scrollInterval);
						}
					}, 750)
				}
			});

			$(document).on("touchend", ".scroll-button", function (e) {
				_scrolling = false;
				$(".scroll-button").removeClass("active")
				_velocity = 0;
				clearInterval(_scrollInterval);
			});

			$(document).on("click", ".app-header .app-toggle-userpanel", function (e) {
				var _this = $(this);
				if (!$(".popup-userpanel").hasClass("active")) {
					$(".popup-userpanel-container").fadeIn(0, function () {
						$(".popup-userpanel").addClass("active")
					})
				}
				else {
					$(".popup-userpanel-container").fadeOut();
					$(".popup-userpanel").removeClass("active")
				}
				_this.addClass("active");
				var _userpanel = setTimeout(function () {
					_this.removeClass("active");
				}, 300);
			});

			$(document).on("click", ".app-kategori", function (e) {
				if(!jt.isOffline())
				{
					var _this = $(this);
					if (!$(".app-kategori-overlay").hasClass("active")) {
						$(".app-kategori-overlay").show(0, function () {
							$(".app-kategori-overlay").addClass("active")
						})
						_this.addClass("active");
					}
					else {
						$(".app-kategori-overlay").removeClass("active");
						$(".app-kategori-overlay").fadeOut(200);
					}
				}
			});

			$(document).on("click", ".card-link", function (e) {
				jt.ripple($(this), e);
			});

			$(document).on("click", ".app-goto", function (e) {
				jt.ripple($(this), e);
			});

			$(document).on("click", ".app-addtofavorite", function (e) {
				var that = this;

				if (!$(that).hasClass("processing")) {
					$(that).addClass("processing");

					if (!$(that).hasClass("active")) {
						if (window.sessionStorage.getItem("currentArticle") != null) {
							$(that).addClass("active");

							if (!$(".app-refreshed").hasClass("active")) {
								$(".app-refreshed").html("Anda menyukai artikel ini").fadeIn();
								setTimeout(function () {
									$(".app-refreshed").fadeOut();
								}, 2000);
							}

							jtCache.setItem("favorite/" + Backbone.history.getFragment(), window.sessionStorage.getItem("currentArticle"), window.PERSISTENT, null, function () {
								setTimeout(function() {
									cacheImage();

									$(that).removeClass("processing");
								}, 500);
							});
						}
						else {
							if (!$(".app-refreshed").hasClass("active")) {
								$(".app-refreshed").html("Artikel tidak berhasil disukai").fadeIn();
								setTimeout(function () {
									$(".app-refreshed").fadeOut();
								}, 2000);
							}
						}
					}
					else {
						$(that).removeClass("active");

						jtCache.removeItem("favorite/" + Backbone.history.getFragment(), window.PERSISTENT, function () {
							jtCache.getItem("offline/" + Backbone.history.getFragment(), function (_data) {
								if (_data == null) {
									jtCache.listItem("data", function (_list) {
										if (_list.length > 0) {
											$.each(_list, function (key, val) {
												jtCache.removeItem(val.name, window.PERSISTENT);
											});
										}

										$(that).removeClass("processing");
									}, window.PERSISTENT, "image." + Backbone.history.getFragment().replace("/", "."), true);
								}
								else {
									$(that).removeClass("processing");
								}
							}, window.PERSISTENT);
						});
					}
				}
			});

			$(document).on("click", ".app-addtooffline", function (e) {
				var that = this;

				if (!$(that).hasClass("processing")) {
					$(that).addClass("processing");

					if (!$(that).hasClass("active")) {
						if (window.sessionStorage.getItem("currentArticle") != null) {
							$(that).addClass("active");

							if (!$(".app-refreshed").hasClass("active")) {
								$(".app-refreshed").html("Artikel berhasil disimpan").fadeIn();
								setTimeout(function () {
									$(".app-refreshed").fadeOut();
								}, 2000);
							}

							jtCache.setItem("offline/" + Backbone.history.getFragment(), window.sessionStorage.getItem("currentArticle"), window.PERSISTENT, null, function () {
								setTimeout(function() {
									cacheImage();

									$(that).removeClass("processing");
								}, 500);
							});
						}
						else {
							if (!$(".app-refreshed").hasClass("active")) {
								$(".app-refreshed").html("Artikel tidak berhasil disimpan").fadeIn();
								setTimeout(function () {
									$(".app-refreshed").fadeOut();
								}, 2000);
							}
						}
					}
					else {
						$(that).removeClass("active");

						jtCache.removeItem("offline/" + Backbone.history.getFragment(), window.PERSISTENT, function () {
							jtCache.getItem("favorite/" + Backbone.history.getFragment(), function (_data) {
								if (_data == null) {
									jtCache.listItem("data", function (_list) {
										if (_list.length > 0) {
											$.each(_list, function (key, val) {
												jtCache.removeItem(val.name, window.PERSISTENT);
											});
										}

										$(that).removeClass("processing");
									}, window.PERSISTENT, "image." + Backbone.history.getFragment().replace("/", "."), true);
								}
								else {
									$(that).removeClass("processing");
								}
							}, window.PERSISTENT);
						});
					}
				}
			});

			function cacheImage() {
				$("img").each(function (key, val) {
					if (typeof $(val).data("src") == "undefined") {
						$(val).data("src", $(val).attr("src"));
					}

					if (typeof window.resolveLocalFileSystemURL == "function" && $(val).data("src").indexOf("http") >= 0 && $(val).data("src").indexOf("filesystem:") < 0) {
						window.resolveLocalFileSystemURL("filesystem:" + window.location.origin + "/persistent/data/image." + Backbone.history.getFragment().replace("/", ".") + "." + btoa($(val).data("src")) + ".", function () {

						}, function () {
							setTimeout(function () {
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
							}, 500);
						});
					}
				});
			}

			$(document).on("touchend click", ".app-index-card a.disabled", function (e) {
				e.preventDefault();
			});

			var trivia    = [
				["\"Sukses adalah guru yang buruk. Itu hanya membuat orang pintar menjadi berpikir bahwa mereka tidak akan pernah gagal.\"", "-- Bill Gates"],
				["\"Hidup memang tidak adil, jadi biasakanlah.\"", "-- Bill Gates" ],
				["\"DNA manusia itu seperti program komputer, tapi jauh lebih maju daripada software apapun yang pernah dibuat.\"", "-- Bill Gates"],
				["\"Jika kau terlahir miskin, itu bukan salahmu. Tapi jika kau mati dalam keadaan miskin, itu adalah kesalahanmu.\"", "-- Bill Gates"],
				["\"Lakukan apa yang kamu suka dan jadikan itu sebagai pekerjaanmu.\"", "-- Bill Gates" ],
				["\"Merayakan kesuksesan adalah hal yang baik, tapi lebih penting lagi jika dapat mengambil pelajaran dari kegagalan.\"", "-- Bill Gates"],
				["\"Harapan adalah kenyataan yang paling nyata. Jika kau percaya, harapan itu akan menjadi nyata.\"", "-- Bill Gates"],
				["\"Kualitas itu lebih penting daripada kuantitas. Satu home run jauh lebih baik daripada dua doubles.\"", "-- Steve Jobs"],
				["\"Jika Saya mencoba yang terbaik dan saya gagal, yah, setidaknya saya sudah mencoba yang terbaik.\"", "-- Steve Jobs"],
				["\"Stay Hungry, Stay Foolish.\"", "-- Steve Jobs" ],
				["\"Inovasi lah yang membedakan seorang pemimpin dan seorang pengikut.\"", "-- Steve Jobs" ],
				["\"Kamu bebas memilih. Tapi kamu tidak akan terbebas dari konsekuensi dari apa yang kamu pilih.\"", "-- Epi Kusnara (Writer)"],
				["\"Keluarlah dari zona nyamanmu. Maka kamu akan mengetahui arti dari sebuah kehidupan.\"", "-- Panji Galih (Videographer)"],
				["\"Kita tidaklah kalah dari sebuah permainan, kita hanya kehabisan waktu.\"", "-- Em Yopik (Writer)"],
				["\"Key to a successful relationship is to clear your Internet browser history.\"", "-- Malano (Content Specialist)"],
				["\"Jika tidak ada yang membencimu, maka kamu telah melakukan hal yang salah.\"", "-- House"],
				["\"Hidup itu sangat sederhana, tapi kita yang membuat hidup menjadi rumit.\"", "-- Confucius"],
				["\"Tidak ada kata GAGAL, Gagal adalah ketika kita berhenti berusaha.\"", "-- Amrillah (Writer)"],
				["\"Hasil dari Ilmu adalah TINDAKAN, bukan PENGETAHUAN.\"", "-- Lukman Azis (Writer)"],
				["\"Life has no CTRL+Z.\"", "-- Anonymous"],
				["\"Persiapkan hari ini untuk keinginan hari esok.\"", "-- Aesop"],
				["\"Kesenangan dalam sebuah pekerjaan membuat kesempurnaan pada hasil yang dicapai.\"", "-- Aristoteles"],
				["\"Yang membuatku terus berkembang adalah tujuan-tujuan hidupku.\"", "-- Muhammad Ali"],
				["\"Saya tidak berbicara dengan kata mungkin.\"", "-- Gusdur"],
				["\"Orang sukses akan mengambil keuntungan dari kesalahan dan mencoba lagi dengan cara yang berbeda.\"", "-- Dale Carnegie"],
				["\"Aku tidak suka mengulangi kesuksesan yang ada, aku lebih suka untuk mencari hal lain.\"", "-- Walt Disney"],
				["\"Jangan menunggu setrika panas baru anda menyetrika; Tapi, buatlah setrika itu panas dengan menyetrika.\"", "-- W.B Yeats"],
				["\"Ada sebuah cara untuk melakukannya lebih baik – temukanlah!\"", "-- Thomas A. Edison"],
				["\"Satu-satunya sumber pengetahuan adalah pengalaman.\"", "-- Albert Einstein"],
				["\"Anda mungkin bisa menunda, tapi waktu tidak akan menunggu.\"", "-- Benjamin Franklin"],
				["\"Anda tidak akan bisa membangun sebuah reputasi dari apa yang akan anda lakukan.\"", "-- Henry Ford"],
				["\"Percayalah Anda bisa. Anda sudah setengah jalan.\"", "-- Theodore Roosevelt"],
				["\"Mulailah setiap hari dengan senyuman dan akhiri dengan senyuman.\"", "-- W. C. Field"],
				["\"Inovasi adalah pergerakan yang sangat cepat.\"", "-- Bill Gates"],
				["\"Kecemerlangan adalah melakukan hal yang biasa dengan cara yang sangat luar biasa.\"", "-- John W. Gardner"],
				["\"Usaha akan membuahkan hasil setelah seseorang tidak menyerah.\"", "-- Napoleon Hill"],
				["\"Saya tidak pernah takut untuk gagal.\"", "-- Michael Jordan"],
				["\"Usaha dan keberanian tidak cukup tanpa tujuan dan arah perencanaan.\"", "-- John F. Kennedy"],
				["\"Pamer adalah ide yang bodoh untuk sebuah kemenangan.\"", "-- Bruce Lee"],
			];
			var triviaidx = 0;

			function shuffle(array) {
				var curr = array.length, temp, rnd;
				while (0 !== curr) {
					rnd           = Math.floor(Math.random() * curr);
					curr -= 1;
					temp = array[ curr ];
					array[ curr ] = array[ rnd ];
					array[ rnd ]  = temp;
				}
				return array;
			}

			function slowType() {
				if ($(".splash").length >= 1 && $(".splash-quote").length >= 1 && $(".splash-speaker").length >= 1) {
					$(".splash-quote").html("");
					$(".splash-speaker").html("");

					var str = trivia[ triviaidx ][ 0 ];
					var wtr = trivia[ triviaidx ][ 1 ];
					$(".splash-quote").html(str);
					$(".splash-speaker").html(wtr);

					$(".splash-quote").css("opacity", 1);
					$(".splash-speaker").css("opacity", 1);
					var fadeOut = setTimeout(function () {
						clearTimeout("fadeOut")
						$(".splash-quote").css("opacity", 0);
						$(".splash-speaker").css("opacity", 0);
					}, 4500);
					var fadeIn  = setTimeout(function () {
						clearTimeout("fadeIn")
						slowType();
					}, 5000);

					triviaidx += 1;

					if (triviaidx > trivia.length - 1) {
						triviaidx = 0;
					}
				}
			}

			shuffle(trivia);
			slowType();

			$(".jalantikus-copyright span").html(new Date().getFullYear());
			var isInBeranda = true;
			var isOnline, lastFragment;

			lastFragment = Backbone.history.getFragment();

			setInterval(function () {
				if (isOnline != !jt.isOffline()) {
					if (jt.isOffline()) {
						lastFragment = Backbone.history.getFragment();

						$("#app-searchpanel").panel({
							disabled: true
						});
						$(".app-toggle-searchpanel").attr("href", "javascript:void(0)");

						$(".more-article-frame").hide();
						$(".app-gotoweb-description").hide();
						$(".app-gotohome-description").css("margin-top", "5px");

						$(".usermenu-item-detail.terbaru, .usermenu-item-detail.hot, .usermenu-item-detail.kategori").fadeTo("fast", 0.3);
						$(".usermenu-item-detail.terbaru, .usermenu-item-detail.hot, .usermenu-item-detail.kategori").addClass("disabled");

						if (Backbone.history.getFragment() == "") {
							Backbone.history.loadUrl();
						}
						else if (Backbone.history.getFragment().indexOf("index/") >= 0 && Backbone.history.getFragment().indexOf("index/favorites") < 0) {
							window.location.href = "#";
						}
					}
					else {
						$(".app-toggle-searchpanel").attr("href", "#app-searchpanel");
						$("#app-searchpanel").panel({
							disabled: false
						});

						$(".app-index-card img").css("filter", "none");
						$(".app-index-card .ripple-disabled")
								.removeClass("ripple-disabled")
								.addClass("ripple")
								.parent()
								.removeClass("disabled");
						$(".app-toolbar").addClass("online").removeClass("offline");

						if (typeof window.StatusBar != "undefined") {
							window.StatusBar.backgroundColorByHexString("#8f1f1f");
						}

						if (lastFragment != Backbone.history.getFragment() || (isOnline == jt.isOffline() && Backbone.history.getFragment() == "")) {
							Backbone.history.loadUrl();
						}

						$('#app-userpanel').panel({ disabled: false });
						$('#app-searchpanel').panel({ disabled: false });

						$(".more-article-frame").show();
						$(".app-gotoweb-description").show();
						$(".app-gotohome-description").css("margin-top", "");

						$(".usermenu-item-detail.terbaru, .usermenu-item-detail.hot, .usermenu-item-detail.kategori").fadeTo("fast", 1);
						$(".usermenu-item-detail.terbaru, .usermenu-item-detail.hot, .usermenu-item-detail.kategori").removeClass("disabled");
					}

					isOnline = !jt.isOffline();
				}
			}, 250);
			var cWidth = $(window).width();
			var cHeight = $(window).height();

			var supportsOrientationChange = "onorientationchange" in window,
			    orientationEvent          = supportsOrientationChange ? "orientationchange" : "resize";
			var orientationChanged        = false;
			$(window).on(orientationEvent, function () {
				if (!orientationChanged) {
					orientationChanged = true;
					$("#app-userpanel").panel("close");
					$("#app-searchpanel").panel("close");
					var evtHeight = $(window).height();
					var intEvt    = setInterval(function () {
						if ($(window).height() != evtHeight) {
							evtHeight = $(window).height();
						}
						else {
							$(".userpanel-body").innerHeight($(window).height() - 120);
							orientationChanged = false;
							clearInterval(intEvt);
						}
					}, 200)
				}
			});

			$(document).on("click", ".usermenu-lower .container .usermenu-item:not(.active)", function (e) {
				if (typeof $(this).attr("href") != "undefined" && !jt.isOffline()) {
					var _href = $(this).attr("href");
					_href     = _href.replace("#", "");

					window.sessionStorage.removeItem(_href);
					window.sessionStorage.removeItem(_href + "/page");
					window.sessionStorage.removeItem(_href + "/isLastPage");
					window.sessionStorage.removeItem(_href + "/lastArticle");

					if (that.type != "search") {
						window.localStorage.removeItem(_href);
						window.localStorage.removeItem(_href + "/page");
						window.localStorage.removeItem(_href + "/isLastPage");
					}

					window.sessionStorage.removeItem(_href + "/scrollTop");
					if (that.type != "search") {
						window.localStorage.removeItem(_href + "/scrollTop");
					}
				}
			});
		});
	}
);