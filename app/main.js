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

                window.StatusBar.backgroundColorByHexString("#8F1F1F");
            },

            home: function () {
                require(
                    [ 'controllers/home' ],
                    function (Home) {
                        new Home();
                    }
                );
            },

            articleDetail: function (_articleSlug) {
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