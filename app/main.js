define(
    [
        'underscore',
        'backbone',
        'jquery'
    ],
    function (_, Backbone, $) {
        var Router = Backbone.Router.extend({
            routes: {
                '': 'home',
            },

            initialize: function () {
                jt.log("App Initialized");
            },

            home: function () {
                require(
                    [ 'controllers/home' ],
                    function (Home) {
                        new Home();
                    }
                );
            },
        });

        return Router;
    }
);