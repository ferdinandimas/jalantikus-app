define(
    [
        "underscore",
        'backbone',
        'jquery'
    ],
    function (_, Backbone, $) {
        var homeCollection = Backbone.Collection.extend({
            renderTimeline: function (_page) {
                this.reset();

                var that = this;

                $.ajax({
                    url: _config.jtAPI + "live/getArticles/limit/9/page/" + _page + "/order/published/detail/id,title,slug,image,user,published,description_images",
                    dataType: "json",
                    async: false,
                    success: function (result) {
                        ajaxResult = result.response;

                        var _buff = 0;
                        _.each(ajaxResult, function (value) {
                            _buff++;

                            console.log(value.title, value.description_images.length, _buff);
                            if (_buff >= 3) {
                                _buff = 0;

                                if (value.description_images.length >= 3) {
                                    value.multiple_images = true;
                                }
                            }

                            console.log(value);

                            that.add(value);
                        });
                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown) {
                        jt.log("Ajax home error", errorThrown, _config.jtAPI + "live/getArticles/limit/10/page/" + _page + "/order/published/detail/id,title,slug,image,user,published,description_images");
                    }
                });
            },
        });

        return homeCollection;
    }
)