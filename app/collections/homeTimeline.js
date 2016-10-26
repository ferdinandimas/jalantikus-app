define(
    [
        "backbone",
        "models/timeline"
    ],
    function (Backbone, Timeline) {
        var Timeline = Backbone.Collection.extend({
            initialize: function (options, model) {
                this.page = (typeof options != "undefined" && typeof options.page != "undefined" ? options.page : 1);
            },
            model     : Timeline,
            urlRoot   : _config.jtAPI + (_config.environment == "dev" ? "live/" : "") + "getArticles/order/published/detail/id,title,slug,image,user,published,description_images",
            url       : function () {
                return this.urlRoot + "/limit/" + (this.page == 1 ? 11 : 9) + "/page/" + this.page;
            },
            parse     : function (result) {
                var reservedSlot = false;
                var buffResult   = [];
                var _buff        = 0;
                var that         = this;

                _.each(result.response, function (value) {
                    _buff++;
                    _test = _buff;
                    _test2 = false;
                    if (_buff >= 3 || (_buff == 2 && reservedSlot == false && that.page == 1)) {
                        if (_buff == 2) {
                            reservedSlot = true;
                        }

                        if (value.description_images.length >= 2) {
                            value.multiple_images = true;
                        }

                        _test2 = true;

                        _buff = 0;
                    }

                    var img = new Image();
                    img.src = value.image.baseUrl + "9/3" + value.image.file;

                    buffResult.push(value);
                });

                return buffResult;
            }
        });

        return Timeline;
    }
)