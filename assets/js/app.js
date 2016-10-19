require.config({
    baseUrl: 'assets/js',
    paths  : {
        app                   : './app',
        lib                   : './lib',
        underscore            : './lib/underscore-min',
        backbone              : './lib/backbone-min',
        jquery                : './lib/jquery-2.x.min',
        "jquery.mobile-config": './app/config/jquery.mobile',
        "jquery.mobile"       : './lib/jquery.mobile-1.4.5.min',
        "jquery.mobile"       : './lib/jquery.mobile-1.4.5.min',
        jt                    : './lib/jt-lib',
        "jt-config"           : './app/config/jt',
        text                  : './lib/require/text',
    },
    shim   : {
        jt                    : [ "jt-config" ],
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
        backbone              : {
            deps   : [ "jt", "underscore", "jquery" ],
            exports: "Backbone"
        },
        "app/main"            : [ "backbone", "jquery", "jquery.mobile", "jquery.mobile" ],
    },

    // Disable script caching on development mode
    urlArgs: "develop=" + (new Date()).getTime()
});

require(
    [ "app/main", "backbone", "jquery", "jquery.mobile", "lib/isInViewport.min" ],
    function (Router) {
        $(function() {
            window.BackboneRouter = new Router();
            Backbone.history.start({ pushState: false });

            $.mobile.loading().hide();

            $(".app-toggle-searchpanel").on("click", function (e) {
                var focus = setTimeout(function () {
                    $(".searchbar").focus();
                }, 100)
            });

            $(".usermenu-item").on("click", function (e) {
                var currUI = $(this);
                if (!currUI.hasClass("active")) {
                    $('.usermenu-item').not(currUI).removeClass("active");
                    currUI.addClass("active");
                }
            });

            $(document).on("click", ".card-link", function (e) {
                var currItem = $(this);
                var ripple   = $(currItem.children()[ 0 ]);
                var rX       = e.offsetX - 225, rY = e.offsetY - 225;
                if (!currItem.hasClass("active")) {
                    ripple.css('top', rY);
                    ripple.css('left', rX);
                    currItem.addClass("active");
                    var fdCurr = setTimeout(function () {
                        currItem.removeClass("active");
                        clearTimeout(fdCurr);
                    }, 500)
                }
            });


        });
    }
);