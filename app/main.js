define(
    [
        'backbone'
    ],
    function (Backbone) {
        /*
            Prevent Controller hitted twice
         */
        var isFirstInit = true;

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
                if (!isFirstInit) {
                    require(
                        [ 'controllers/home' ],
                        function (Home) {
                            alert("HOME MAIN");

                            new Home();
                        }
                    );
                }

                isFirstInit = false;
            },

            index: function (_options) {
                if (!isFirstInit) {
                    require(
                        [ 'controllers/home' ],
                        function (Home) {
                            _options = { type: _options };
                            new Home(_options);
                        }
                    );
                }

                isFirstInit = false;
            },

            search: function (_options) {
                if (!isFirstInit) {
                    require(
                        [ 'controllers/home' ],
                        function (Home) {
                            _options = { type: "search", search: _options };
                            new Home(_options);
                        }
                    );
                }

                isFirstInit = false;
            },

            articleDetail: function (_articleSlug) {
                if (!isFirstInit) {
                    require(
                        [ 'controllers/articleDetail' ],
                        function (ArticleDetail) {
                            new ArticleDetail(_articleSlug);
                        }
                    );
                }

                isFirstInit = false;
            },

            browser: function (_url) {
                if (!isFirstInit) {
                    require(
                        [ 'controllers/browser' ],
                        function (browserView) {
                            new browserView(_url);
                        }
                    );
                }

                isFirstInit = false;
            },
        });

        return Router;
    }
);