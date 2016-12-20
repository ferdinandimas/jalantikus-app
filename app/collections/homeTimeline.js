define(
    [
        "backbone",
        "models/timeline"
    ],
    function (Backbone, Timeline) {
        var Timeline = Backbone.Collection.extend({
            initialize: function (options, model) {
                this.category = (typeof options != "undefined" && typeof options.category != "undefined" && options.category != "" ? options.category : "");
                this.page     = (typeof options != "undefined" && typeof options.page != "undefined" && options.page != "" ? options.page : 1);
                this.order    = (typeof options != "undefined" && typeof options.order != "undefined" && options.order != "" ? options.order : "published");
                this.search   = (typeof options != "undefined" && typeof options.search != "undefined" && options.search != "" ? options.search : "");
                this.limit    = (typeof options != "undefined" && typeof options.limit != "undefined" && options.limit != "" ? options.limit : 6);
            },
            model     : Timeline,
            urlRoot   : _config.jtAPI + (_config.environment == "dev" ? "live/" : "") + "getArticles/detail/id,title,slug,image,user,published,description_images" + _config.urlPostfix,
            url       : function () {
                return this.urlRoot + "/limit/" + this.limit + "/page/" + this.page + "/order/" + this.order + (this.category != "" ? "/category/" + this.category : "") + (this.search != "" ? "/search/" + this.search : "");
            },
            parse     : function (result) {
                var reservedSlot = false;
                var buffResult   = [];
                var _buff        = 0;
                var that         = this;

                var _n = 1;
                _.each(result.response, function (value) {
                    _buff++;
                    _test = _buff;
                    _test2 = false;

                    if (window.sessionStorage.getItem(Backbone.history.getFragment() + "/lastArticle") == null || (window.sessionStorage.getItem(Backbone.history.getFragment() + "/lastArticle") != null) && window.sessionStorage.getItem(Backbone.history.getFragment() + "/lastArticle") != value.slug) {
                        if (_buff >= 3 || (_buff == 2 && reservedSlot == false)) {
                            if (_buff == 2) {
                                reservedSlot = true;
                            }

                            if (value.description_images.length >= 2) {
                                value.multiple_images = true;
                            }

                            _test2 = true;

                            _buff = 0;
                        }

                        if (!value.image.baseUrl.match(/https?\:\/\/assets\.jalantikus\.com\/.*/g)) {
                            value.image.baseUrl = "https://assets.jalantikus.com/" + value.image.baseUrl;
                        }

                        var img = new Image();
                        img.src = value.image.baseUrl + "9/3" + value.image.file;

                        buffResult.push(value);
                    }

                    if (_n++ >= result.response.length) {
                        console.log("LAST", value.slug);

                        window.sessionStorage.setItem(Backbone.history.getFragment() + "/lastArticle", value.slug);
                    }
                });

                return buffResult;
            }
        });

        return Timeline;
    }
)