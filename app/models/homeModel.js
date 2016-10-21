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
                    url: _config.jtAPI + "live/getArticles/limit/11/page/" + _page + "/order/published/detail/id,title,slug,image,user,published,description_images",
                    dataType: "json",
                    async: false,
                    success: function (result) {
                        ajaxResult = result.response;

                        var _buff = 0;
                        var reservedSlot = false;
                        _.each(ajaxResult, function (value) {
                            _buff++;

                            if (_buff >= 3 || (_buff == 2 && reservedSlot == false && _page == 1)) {
                                _buff = 0;

                                if (value.description_images.length >= 2) {
                                    value.multiple_images = true;
                                }

                                reservedSlot = true;
                            }

                            that.add(value);
                        });
                    },
                    timeout: 10000,
                    error: function(XMLHttpRequest, textStatus, errorThrown) {
                        jt.log("Ajax home error", errorThrown, _config.jtAPI + "live/getArticles/limit/10/page/" + _page + "/order/published/detail/id,title,slug,image,user,published");

                        $(".app-load").css("display", "none");
                        $(".app-retry").css("display", "block");
                    }
                });
            },
        });

        return homeCollection;
    }
)