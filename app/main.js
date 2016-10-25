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

                require(
                    [ 'controllers/app' ],
                    function (App) {
                        new App();
                    }
                );
            },

            home: function () {
                //statusbar.backgroundColorByHexString("#B71C1C");

                require(
                    [ 'controllers/home' ],
                    function (Home) {
                        new Home();
                    }
                );
            },

            articleDetail: function (_articleSlug) {
                //statusbar.backgroundColorByHexString("#00C000");

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