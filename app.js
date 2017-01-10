/*
 http://locutus.io/php/
 */
function date(n,t){var e,r,u=["Sun","Mon","Tues","Wednes","Thurs","Fri","Satur","January","February","March","April","May","June","July","August","September","October","November","December"],o=/\\?(.?)/gi,i=function(n,t){return r[n]?r[n]():t},c=function(n,t){for(n=String(n);n.length<t;)n="0"+n;return n};r={d:function(){return c(r.j(),2)},D:function(){return r.l().slice(0,3)},j:function(){return e.getDate()},l:function(){return u[r.w()]+"day"},N:function(){return r.w()||7},S:function(){var n=r.j(),t=n%10;return 3>=t&&1===parseInt(n%100/10,10)&&(t=0),["st","nd","rd"][t-1]||"th"},w:function(){return e.getDay()},z:function(){var n=new Date(r.Y(),r.n()-1,r.j()),t=new Date(r.Y(),0,1);return Math.round((n-t)/864e5)},W:function(){var n=new Date(r.Y(),r.n()-1,r.j()-r.N()+3),t=new Date(n.getFullYear(),0,4);return c(1+Math.round((n-t)/864e5/7),2)},F:function(){return u[6+r.n()]},m:function(){return c(r.n(),2)},M:function(){return r.F().slice(0,3)},n:function(){return e.getMonth()+1},t:function(){return new Date(r.Y(),r.n(),0).getDate()},L:function(){var n=r.Y();return n%4===0&n%100!==0|n%400===0},o:function(){var n=r.n(),t=r.W(),e=r.Y();return e+(12===n&&9>t?1:1===n&&t>9?-1:0)},Y:function(){return e.getFullYear()},y:function(){return r.Y().toString().slice(-2)},a:function(){return e.getHours()>11?"pm":"am"},A:function(){return r.a().toUpperCase()},B:function(){var n=3600*e.getUTCHours(),t=60*e.getUTCMinutes(),r=e.getUTCSeconds();return c(Math.floor((n+t+r+3600)/86.4)%1e3,3)},g:function(){return r.G()%12||12},G:function(){return e.getHours()},h:function(){return c(r.g(),2)},H:function(){return c(r.G(),2)},i:function(){return c(e.getMinutes(),2)},s:function(){return c(e.getSeconds(),2)},u:function(){return c(1e3*e.getMilliseconds(),6)},e:function(){var n="Not supported (see source code of date() for timezone on how to add support)";throw new Error(n)},I:function(){var n=new Date(r.Y(),0),t=Date.UTC(r.Y(),0),e=new Date(r.Y(),6),u=Date.UTC(r.Y(),6);return n-t!==e-u?1:0},O:function(){var n=e.getTimezoneOffset(),t=Math.abs(n);return(n>0?"-":"+")+c(100*Math.floor(t/60)+t%60,4)},P:function(){var n=r.O();return n.substr(0,3)+":"+n.substr(3,2)},T:function(){return"UTC"},Z:function(){return 60*-e.getTimezoneOffset()},c:function(){return"Y-m-d\\TH:i:sP".replace(o,i)},r:function(){return"D, d M Y H:i:s O".replace(o,i)},U:function(){return e/1e3|0}};var a=function(n,t){return e=void 0===t?new Date:t instanceof Date?new Date(t):new Date(1e3*t),n.replace(o,i)};return a(n,t)}
function time(){return Math.floor((new Date).getTime()/1e3)}

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
					window.stop();

					if (Backbone.history.getFragment() == "") {
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
					else {
						navigator.app.backHistory()
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
						$(".header-refresh").hide();

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
							$(".splash .app-refreshed").html("Tidak ada jaringan.").fadeIn();
							setTimeout(function () {
								$(".splash .app-refreshed").fadeOut();
							}, 2000);

							$(".splash-content .app-loader").fadeIn();

							$(".splash-quote").remove();
							$(".splash-speaker").remove();
							$(".splash-loading").hide();
						}
					}, 5000);
				}
			}
			else if (!jt.isOffline()) {
				window.localStorage.removeItem(Backbone.history.getFragment());
				window.localStorage.removeItem(Backbone.history.getFragment() + "/page");
				window.localStorage.removeItem(Backbone.history.getFragment() + "/scrollTop");
				window.localStorage.removeItem(Backbone.history.getFragment() + "/isLastPage");
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

			$(document).on("click", ".app-toggle-searchpanel", function (e) {
				if (jt.isOffline()) {
					e.preventDefault();

					$(".app-refreshed").html("Tidak ada jaringan.").fadeIn();
					setTimeout(function () {
						$(".app-refreshed").fadeOut();
					}, 2000);
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
			});

			$(document).on("click", ".app-header .app-toggle-back", function (e) {
				window.stop();

				e.preventDefault();

				$(this).addClass("active");
				var _history = setTimeout(function () {
					window.history.back();
				}, 250);
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
						console.log("Error Rate");
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
				}, 150);
			});

			$(document).on("click", ".app-setting", function (e) {
				setTimeout(function () {
					$(".app-settings").fadeIn();
					$("#app-userpanel").panel("close");
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
			});
			$(document).on("click", ".userpanel-close", function () {
				$(".popup-userpanel").removeClass("active")
				$(".popup-userpanel-container").fadeOut();
			});

			$(document).on("click", ".app-rating-submit .rating-link", function (e) {
				setTimeout(function () {
					$(".app-rating").fadeOut(300);
					window.open("https://play.google.com/store/apps/details?id=com.jalantikus.app", "_blank");
				}, 500);

				jt.ripple($(this), e, "slow");
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
										$(".app-refreshed").html("Notifikasi berhasil dimatikan").fadeIn();
										setTimeout(function () {
											$(".app-refreshed").fadeOut();
										}, 2000);
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
			});

			$(document).on("click", ".card-link", function (e) {
				jt.ripple($(this), e);
			});

			$(document).on("click", ".app-goto", function (e) {
				jt.ripple($(this), e);
			});

			$(document).on("click", ".app-addtofavorite", function (e) {
				var that = this;

				if (!$(that).hasClass("active")) {
					jtCache.getItem("favorite.list", function(_data) {
						var _articles = [];

						if (_data != null) {
							_articles = JSON.parse(_data.value);
						}

						jtCache.getItem(Backbone.history.getFragment(), function(_data) {
							if (_data != null) {
								_buff = JSON.parse(_data.value);

								delete _buff.description;
								delete _buff.related;
								delete _buff.keywords;

								_buff.file = "favorite/" + Backbone.history.getFragment();
								_buff.file = _buff.file.replace(/\//g, ".");

								_articles.push(_buff);

								jtCache.setItem("favorite.list", JSON.stringify(_articles), window.PERSISTENT, null, function () {
									jtCache.setItem("favorite/" + Backbone.history.getFragment(), JSON.stringify(_data), window.PERSISTENT);
								});

								$(that).addClass("active");
								$(".app-refreshed").html("Anda menyukai artikel ini").fadeIn();
								setTimeout(function () {
									$(".app-refreshed").fadeOut();
								}, 2000);
							}
							else {
								$(".app-refreshed").html("Artikel tidak berhasil disukai").fadeIn();
								setTimeout(function () {
									$(".app-refreshed").fadeOut();
								}, 2000);
							}
						});
					}, window.PERSISTENT);
				}
				else {
					jtCache.getItem("favorite.list", function(_data) {
						var _articles = [];

						if (_data != null) {
							_articles = JSON.parse(_data.value);
						}

						_buff = "favorite/" + Backbone.history.getFragment();
						_buff = _buff.replace(/\//g, ".");

						$.each(_articles, function (key, value) {
							if (typeof value != "undefined" && typeof value.file != "undefined" && value.file == _buff) {
								_articles.splice(key, 1);
							}
						});

						jtCache.removeItem("favorite/" + Backbone.history.getFragment(), window.PERSISTENT, function () {
							if (_articles.length > 0) {
								jtCache.removeItem("favorite.list", window.PERSISTENT, function () {
									jtCache.setItem("favorite.list", JSON.stringify(_articles), window.PERSISTENT);
								});
							}
							else {
								jtCache.removeItem("favorite.list", window.PERSISTENT);
							}
						});

						$(that).removeClass("active");
					}, window.PERSISTENT);
				}
			});

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
					isOnline = !jt.isOffline();

					if (jt.isOffline()) {
						//$(".app-index-card img").css("filter", "grayscale(100%)");
						//$(".app-index-card .ripple")
						//		.removeClass("ripple")
						//		.addClass("ripple-disabled")
						//		.parent()
						//		.addClass("disabled");
						//$(".app-toolbar").removeClass("online").addClass("offline");
						//
						//if ($(".splash").length < 1 && typeof window.StatusBar != "undefined") {
						//	window.StatusBar.backgroundColorByHexString("#474747");
						//}

						lastFragment = Backbone.history.getFragment();

						$("#app-searchpanel").panel({
							disabled: true
						});
						$(".app-toggle-searchpanel").attr("href", "javascript:void(0)");

						//$("#app-userpanel").panel("close");
						//$('#app-userpanel').panel({ disabled: true });
						//$("#app-searchpanel").panel("close");
						//$('#app-searchpanel').panel({ disabled: true });
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

						if (lastFragment != Backbone.history.getFragment()) {
							Backbone.history.loadUrl();
						}

						$('#app-userpanel').panel({ disabled: false });
						$('#app-searchpanel').panel({ disabled: false });
					}
				}
			}, 250);

			setInterval(function () {
				$(".app-toolbar").removeClass("on-top");
			}, 50);

			if ($(window).height() < 620) {
				$(".userpanel-body").innerHeight($(window).height() - 120);
			}
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
		});
	}
);