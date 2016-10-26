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
    urlArgs: "version=" + (_config.environment == "dev" ? (new Date()).getTime() : "161025.1")
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
                    if (!_currUI.hasClass("active")) {
                        $('.usermenu-item').not(_currUI).removeClass("active");
                        _currUI.addClass("active");
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

            $(document).on("swiperight", "#app-body", function (e) {
                if ($.mobile.activePage.jqmData("panel") !== "open" && !$(".app-toolbar").hasClass("detail")) {
                    if (e.type === "swiperight") {
                        $("#app-userpanel").panel("open");
                    }
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

            var _scrolling = false, _direction, _pos, _velocity = 0;
            $(document).on("touchstart", ".scroll-button", function(e)
            {
                e.preventDefault();
                if(!_scrolling)
                {   
                    _scrolling = true
                    _direction = $(this).data("direction");
                    $(this).addClass("active")
                    if(_velocity != 0)
                    {
                        _velocity = 0;
                    }
                    var _scrollInterval = setInterval(function(){
                        _pos = $(".app-detail-container").scrollTop() + _velocity;
                        if(_scrolling == true)
                        {
                            $(".app-detail-container").scrollTop(_pos);
                        }
                        else
                        {
                            clearInterval(_scrollInterval);
                        }

                        if(_direction == "up" && _velocity > -2)
                        {
                            _velocity -=0.2;
                        }
                        else if(_direction == "down" && _velocity < 2)
                        {
                            _velocity +=0.2;
                        }
                    }, 20)
                }
            })

            $(document).on("touchend", ".scroll-button", function(e)
            {
                _scrolling = false;
                $(".scroll-button").removeClass("active")
                _velocity = 0;
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

            $(document).on("touchend click", ".app-index-card a.disabled", function (e) {
                e.preventDefault();
            });

            document.addEventListener("deviceready", function () {
                document.addEventListener("backbutton", function (e) {
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
                if ($(".splash").length >= 1) {
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

                        if (typeof window.StatusBar != "undefined") {
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
                            if ($(".app-toolbar").hasClass("detail")) {
                                window.StatusBar.backgroundColorByHexString("#045f04");
                            }
                            else {
                                window.StatusBar.backgroundColorByHexString("#8f1f1f");
                            }
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