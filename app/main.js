define(
    [
        'backbone'
    ],
    function (Backbone) {
        var Router = Backbone.Router.extend({
            routes: {
                '': 'home',
                'article/:id': 'articleDetail',
            },

            initialize: function () {
                jt.log("App Initialized");
            },

            home: function () {
                window.StatusBar.backgroundColorByHexString("#B71C1C");

                require(
                    [ 'controllers/home' ],
                    function (Home) {
                        new Home();
                    }
                );
            },

            articleDetail: function (_articleSlug) {
                window.StatusBar.backgroundColorByHexString("#00C000");

                require(
                    [ 'controllers/articleDetail' ],
                    function (ArticleDetail) {
                        new ArticleDetail(_articleSlug);
                    }
                );
            },
        });

        return Router;
    }
);