define(
    [
        'backbone'
    ],
    function (Backbone) {
        var route = {};
        var Router = Backbone.Router.extend({
            routes: {
                ''           : 'home',
                'index/:id'  : 'index',
                'search/:id' : 'search',
                'article/:id': 'articleDetail',
                'browser/:id': 'browser',
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

            index: function (_options) {
                require(
                    [ 'controllers/home' ],
                    function (Home) {
                        _options = { type: _options };
                        new Home(_options);
                    }
                );
            },

            search: function (_options) {
                require(
                    [ 'controllers/home' ],
                    function (Home) {
                        _options = { type: "search", search: _options };
                        new Home(_options);
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

            browser: function (_url) {
                require(
                    [ 'controllers/browser' ],
                    function (browserView) {
                        new browserView(_url);
                    }
                );
            },
        });

        return Router;
    }
);