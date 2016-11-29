require.config({
    baseUrl: 'app',
    paths  : {
        app                   : './',
        lib                   : './lib',
        underscore            : './lib/underscore-min',
        backbone              : './lib/backbone-min',
        jquery                : './lib/jquery-2.x.min',
        "jquery.mobile-config": './config/jquery.mobile',
        "jquery.mobile"       : './lib/jquery.mobile-1.4.5.min',
        "jquery.mobile"       : './lib/jquery.mobile-1.4.5.min',
        isInViewport          : './lib/isInViewport.min',
        fastclick             : './lib/fastclick-min',
        prettify              : './lib/prettify',
        jt                    : './lib/jt-lib',
        text                  : './lib/require/text',
    },
    shim   : {
        jt                    : {
            exports: "jt",
        },
        underscore            : {
            deps   : [ "jt" ],
            exports: "_",
        },
        jquery                : {
            deps   : [ "jt" ],
            exports: "$",
        },
        "jquery.mobile-config": [ "jt", "jquery" ],
        "jquery.mobile"       : [ "jt", "jquery", "jquery.mobile-config" ],
        isInViewport          : [ "jquery" ],
        fastclick             : [ "jquery" ],
        prettify              : [ "jquery" ],
        backbone              : {
            deps   : [ "jt", "underscore", "jquery" ],
            exports: "Backbone"
        },
        "app/main"            : [ "backbone", "jquery", "jquery.mobile", "jquery.mobile" ],
    },

    // Disable script caching on development mode
    urlArgs: "version=" + (_config.environment == "dev" ? (new Date()).getTime() : "161028")
});

require(
    [ "main", "backbone", "jquery", "jquery.mobile", "isInViewport" ],
    function (Router) {
        $(function () {
            $.mobile.loading().hide();

            if (typeof window.StatusBar != "undefined") {
                window.StatusBar.backgroundColorByHexString("#8F1F1F");
            }

            if ($("#app-body .app-refreshed").length == 0) {
                $("#app-body").append(
                    '<div class="app-refreshed"></div>'
                );
            }

            window.BackboneRouter = new Router();
            Backbone.history.start({ pushState: false });

            document.addEventListener('deviceready', function () {
                // Enable to debug issues.
                window.plugins.OneSignal.setLogLevel({logLevel: 4, visualLevel: 4});

                var notificationOpenedCallback = function(jsonData) {
                    //jsonData = JSON.parse(jsonData);
                    alert('notificationOpenedCallback: ' + jsonData);
                    alert('notificationOpenedCallback: ' + jsonData.notification.payload.additionalData.article);
                };

                window.plugins.OneSignal
                    .startInit("a92950f8-7bf1-462a-9157-e480802c2ae5", "975487375429")
                    .handleNotificationOpened(notificationOpenedCallback)
                    .endInit();
            }, false);

            $("#search-form").on("submit", function (e) {
                e.preventDefault();

                window.location = "#search/" + $("#search-form [name='search']").val();
                Backbone.history.loadUrl();

                $("#app-searchpanel").panel("close");
            });

            $(document).on("click", ".app-toggle-searchpanel", function (e) {
                if (!jt.isOffline()) {

                    var _this = $(this);
                    _this.addClass("active");

                    var _searchpanel = setTimeout(function () {
                        _this.removeClass("active");
                    }, 300)

                    var _focus = setTimeout(function () {
                        $(".searchbar").focus();
                    }, 500)
                }
                else {
                    e.preventDefault();
                    showOffline();
                    return false;
                }
            });

            $(document).on("click", ".usermenu-item", function (e) {
                if (!jt.isOffline()) {
                    var _currUI = $(this);
                    if (!_currUI.hasClass("active") && !_currUI.hasClass("app-rate") && !_currUI.hasClass("app-share")) {
                        $('.usermenu-item').not(_currUI).removeClass("active");
                        _currUI.addClass("active");

                        $(".app-header .header-description").html($(this).find(".usermenu-item-detail").html());
                    }
                }
                else {
                    e.preventDefault();
                    showOffline();
                }
            });

            $(document).on("click", ".app-header .app-toggle-back", function (e) {
                if (!jt.isOffline()) {
                    window.stop();

                    e.preventDefault();

                    $(this).addClass("active");
                    var _history = setTimeout(function () {
                        window.history.back();
                    }, 250)
                }
                else {
                    e.preventDefault();
                    showOffline();
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
                        if ($.mobile.activePage.jqmData("panel") !== "open" && !$(".app-toolbar").hasClass("detail")) {
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
                if (!jt.isOffline()) {
                    var _this = $(this);
                    _this.addClass("active");
                    var _searchpanel = setTimeout(function () {
                        _this.removeClass("active");
                    }, 300)
                }
                else {
                    e.preventDefault();
                    showOffline();
                }
            });

            var _displayRate = [
                "Dari lubuk hati kami yang terdalam, kami minta maaf :'(",
                "Mohon maaf atas ketidaknyamanannya, akan segera kami perbaiki :)",
                "Berikan kami kesempatan lagi untuk membuat aplikasi ini lebih baik.",
                "Terima kasih, segala kritik dan saran akan sangat membantu :)",
                "Terima Kasih, Kami akan terus berusaha membuatnya lebih baik :)"
            ]
            $(document).on("click", ".rate-star", function(){
                var rate = $(this).data("rate");
                switch(rate)
                {
                    case 1:
                        $(".app-rating-subtitle").html(_displayRate[0]);
                        break;
                    case 2:
                        $(".app-rating-subtitle").html(_displayRate[1]);
                        break;
                    case 3:
                        $(".app-rating-subtitle").html(_displayRate[2]);
                        break;
                    case 4:
                        $(".app-rating-subtitle").html(_displayRate[3]);
                        break;
                    case 5:
                        $(".app-rating-subtitle").html(_displayRate[4]);
                        break;
                    default:
                        console.log("ERROR");
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
            })
            $(document).on("click", ".rating-close", function () {
                $(".app-rating").fadeOut();
            })

            $(document).on("click", ".app-rating-submit .rating-link", function (e) {
                setTimeout(function () {
                    $(".app-rating").fadeOut(300);
                    window.open("https://play.google.com/store/apps/details?id=com.jalantikus.app", "_blank");
                }, 500);

                if (!jt.isOffline()) {
                    jt.ripple($(this), e, "slow")
                }
                else {
                    e.preventDefault();
                    showOffline();
                }
            });

            $(document).on("click", ".usermenu-item", function (e) {
                if (!jt.isOffline()) {
                    jt.ripple($(this), e);
                    setTimeout(function () {
                        $('#app-userpanel').panel('close')
                    }, 150);
                }
                else {
                    e.preventDefault();
                    showOffline();
                }
            })

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
                        "scrollTop": _pos}
                    ,300);
                    _scrollInterval = setInterval(function () {
                        _pos = $(".app-detail-container").scrollTop() + _velocity;
                        if (_scrolling == true) {
                            $(".app-detail-container").animate({
                                "scrollTop": _pos}
                                ,300);
                        }
                        else {
                            clearInterval(_scrollInterval);
                        }
                    }, 750)
                }
            })

            $(document).on("touchend", ".scroll-button", function (e) {
                _scrolling = false;
                $(".scroll-button").removeClass("active")
                _velocity = 0;
                clearInterval(_scrollInterval);
            })

            $(document).on("click", ".app-header .app-toggle-userpanel", function (e) {
                if (!jt.isOffline()) {
                    var _this = $(this);
                    _this.addClass("active");
                    var _userpanel = setTimeout(function () {
                        _this.removeClass("active");
                    }, 300)
                }
                else {
                    e.preventDefault();
                    showOffline();
                }
            });

            $(document).on("click", ".card-link", function (e) {
                if (!jt.isOffline()) {
                    jt.ripple($(this), e)
                }
                else {
                    e.preventDefault();
                    showOffline();
                }
            });

            $(document).on("click", ".app-goto", function (e) {
                if (!jt.isOffline()) {
                    jt.ripple($(this), e)
                }
                else {
                    e.preventDefault();
                    showOffline();
                }
            });

            $(document).on("touchend click", ".app-index-card a.disabled", function (e) {
                e.preventDefault();
            });

            document.addEventListener("deviceready", function () {
                document.addEventListener("backbutton", function (e) {
                    window.stop();

                    if (Backbone.history.getFragment() == "") {
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
                    else {
                        navigator.app.backHistory()
                    }
                });
            });

            var trivia    = [
                [
                    "\"Sukses adalah guru yang buruk. Itu hanya membuat orang pintar menjadi berpikir bahwa mereka tidak akan pernah gagal.\"",
                    "-- Bill Gates"
                ],
                [ "\"Hidup memang tidak adil, jadi biasakanlah.\"", "-- Bill Gates" ],
                [
                    "\"DNA manusia itu seperti program komputer, tapi jauh lebih maju daripada software apapun yang pernah dibuat.\"",
                    "-- Bill Gates"
                ],
                [
                    "\"Jika kau terlahir miskin, itu bukan salahmu. Tapi jika kau mati dalam keadaan miskin, itu adalah kesalahanmu.\"",
                    "-- Bill Gates"
                ],
                [ "\"Lakukan apa yang kamu suka dan jadikan itu sebagai pekerjaanmu.\"", "-- Bill Gates" ],
                [
                    "\"Merayakan kesuksesan adalah hal yang baik, tapi lebih penting lagi jika dapat mengambil pelajaran dari kegagalan.\"",
                    "-- Bill Gates"
                ],
                [
                    "\"Harapan adalah kenyataan yang paling nyata. Jika kau percaya, harapan itu akan menjadi nyata.\"",
                    "-- Bill Gates"
                ],
                [
                    "\"Kualitas itu lebih penting daripada kuantitas. Satu home run jauh lebih baik daripada dua doubles.\"",
                    "-- Steve Jobs"
                ],
                [
                    "\"Jika Saya mencoba yang terbaik dan saya gagal, yah, setidaknya saya sudah mencoba yang terbaik.\"",
                    "-- Steve Jobs"
                ],
                [ "\"Stay Hungry, Stay Foolish.\"", "-- Steve Jobs" ],

                [ "\"Inovasi lah yang membedakan seorang pemimpin dan seorang pengikut.\"", "-- Steve Jobs" ],

                [ "\"Kamu bebas memilih. Tapi kamu tidak akan terbebas dari konsekuensi dari apa yang kamu pilih.\"", 
                    "-- Epi Kusnara (Writer)"],

                [ "\"Keluarlah dari zona nyamanmu. Maka kamu akan mengetahui arti dari sebuah kehidupan.\"", 
                    "-- Panji Galih (Videographer)"],

                [ "\"Kita tidaklah kalah dari sebuah permainan, kita hanya kehabisan waktu.\"", 
                    "-- Em Yopik (Writer)"],  

                [ "\"Key to a successful relationship is to clear your Internet browser history.\"", 
                    "-- Malano (Content Specialist)"],

                [ "\"Jika tidak ada yang membencimu, maka kamu telah melakukan hal yang salah.\"", 
                    "-- House"],

                [ "\"Hidup itu sederhana, tapi kita yang membuat hidup menjadi rumit.\"", 
                    "-- Confucius"],

                [ "\"Tidak ada kata GAGAL, Gagal adalah ketika kita berhenti berusaha.\"", 
                    "-- Amrillah (Writer)"],

                [ "\"Hasil dari Ilmu adalah TINDAKAN, bukan PENGETAHUAN.\"", 
                    "-- Lukman Azis (Writer)"],

                [ "\"Life has no CTRL+Z.\"", 
                    "-- Anonymous"],
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

            function showOffline() {
                $(".app-refreshed").html("Tidak ada jaringan").fadeIn();
                setTimeout(function () {
                    $(".app-refreshed").fadeOut();
                }, 2000);
            }

            shuffle(trivia);
            slowType();

            $(".jalantikus-copyright span").html(new Date().getFullYear());

            var isOnline, lastFragment;
            setInterval(function () {
                if (isOnline != !jt.isOffline()) {
                    isOnline = !jt.isOffline();

                    if (jt.isOffline()) {
                        $(".app-index-card img").css("filter", "grayscale(100%)");
                        $(".app-index-card .ripple")
                            .removeClass("ripple")
                            .addClass("ripple-disabled")
                            .parent()
                            .addClass("disabled");
                        $(".app-toolbar").removeClass("online").addClass("offline");

                        if ($(".splash").length < 1 && typeof window.StatusBar != "undefined") {
                            window.StatusBar.backgroundColorByHexString("#474747");
                        }

                        lastFragment = Backbone.history.getFragment();

                        $("#app-userpanel").panel("close");
                        $('#app-userpanel').panel({ disabled: true });
                        $("#app-searchpanel").panel("close");
                        $('#app-searchpanel').panel({ disabled: true });
                    }
                    else {
                        $(".app-index-card img").css("filter", "none");
                        $(".app-index-card .ripple-disabled")
                            .removeClass("ripple-disabled")
                            .addClass("ripple")
                            .parent()
                            .removeClass("disabled");
                        $(".app-toolbar").addClass("online").removeClass("offline");

                        if (typeof window.StatusBar != "undefined") {
                            //if ($(".app-toolbar").hasClass("detail")) {
                            //    window.StatusBar.backgroundColorByHexString("#045f04");
                            //}
                            //else {
                            //    window.StatusBar.backgroundColorByHexString("#8f1f1f");
                            //}

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
        });
    }
);