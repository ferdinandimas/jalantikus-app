define(
    [
        'backbone'
    ],
    function (Backbone) {
        var Router = Backbone.Router.extend({
            routes: {
                ''           : 'home',
                'index/:id'  : 'index',
                'article/:id': 'articleDetail',
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

            index: function (_type) {
                require(
                    [ 'controllers/home' ],
                    function (Home) {
                        new Home(_type);
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