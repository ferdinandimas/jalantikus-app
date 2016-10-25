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
    urlArgs: "version=" + (_config.environment == "dev" ? (new Date()).getTime() : "161024")
});

require(
    [ "main", "backbone", "jquery", "jquery.mobile", "isInViewport" ],
    function (Router) {
        $(function () {
            $.mobile.loading().hide();

            window.BackboneRouter = new Router();
            Backbone.history.start({ pushState: false });

            $(document).on("click", ".app-toggle-searchpanel", function (e) {
                var _focus = setTimeout(function () {
                    $(".searchbar").focus();
                }, 500)
            });

            $(document).on("click", ".usermenu-item", function (e) {
                var _currUI = $(this);
                if (!_currUI.hasClass("active")) {
                    $('.usermenu-item').not(_currUI).removeClass("active");
                    _currUI.addClass("active");
                }
            });

            $(document).on("click", ".app-header .app-toggle-back", function (e) {
                e.preventDefault();
                $(this).addClass("active");
                var _history = setTimeout(function () {
                    window.history.back(); 
                }, 250)
            });

            $(document).on("click", ".app-header .app-toggle-searchpanel", function (e) {
                var _this = $(this);
                _this.addClass("active");
                var _searchpanel = setTimeout(function () {
                    _this.removeClass("active");
                }, 300)
            });

            $(document).on("click", ".app-header .app-toggle-userpanel", function (e) {
                var _this = $(this);
                _this.addClass("active");
                var _userpanel = setTimeout(function () {
                    _this.removeClass("active");
                }, 300)
            });

            $(document).on("click", ".card-link", function (e) {
                if (!jt.isOffline()) {
                    jt.ripple($(this), e)
                }
            });

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

                        lastFragment = Backbone.history.getFragment();
                    }
                    else {
                        $(".app-index-card img").css("filter", "none");
                        $(".app-index-card .ripple-disabled")
                            .removeClass("ripple-disabled")
                            .addClass("ripple")
                            .parent()
                            .removeClass("disabled");

                        if (lastFragment != Backbone.history.getFragment()) {
                            Backbone.history.loadUrl();
                        }
                    }
                }
            }, 250);

            $(document).on("touchend click", ".app-index-card a.disabled", function (e) {
                e.preventDefault();
            });
        });
    }
);