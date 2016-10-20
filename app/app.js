require.config({
    baseUrl: 'app',
    paths  : {
        app                   : './',
        lib                   : '../assets/js/lib',
        underscore            : '../assets/js/lib/underscore-min',
        backbone              : '../assets/js/lib/backbone-min',
        jquery                : '../assets/js/lib/jquery-2.x.min',
        "jquery.mobile-config": './config/jquery.mobile',
        "jquery.mobile"       : '../assets/js/lib/jquery.mobile-1.4.5.min',
        isInViewport          : '../assets/js/lib/isInViewport.min',
        fastclick             : '../assets/js/lib/fastclick-min',
        "jt-config"           : './config/jt',
        jt                    : '../assets/js/lib/jt-lib',
        text                  : '../assets/js/lib/require/text',
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
        isInViewport          : [ "jquery" ],
        fastclick          : [ "jquery" ],
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
    [ "main", "backbone", "jquery", "jquery.mobile", "isInViewport", "fastclick" ],
    function (Router) {
        $(function () {
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

            var attachFastClick = Origami.fastclick;
            attachFastClick(document.body);
        });
    }
);