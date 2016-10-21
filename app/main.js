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
                alert(3);
                require(
                    [ 'controllers/home' ],
                    function (Home) {
                        alert(4);
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