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
                    url: _config.jtAPI + "getArticles/limit/10/page/" + _page + "/order/published/detail/id,title,slug,image,user,published",
                    dataType: "json",
                    async: false,
                    success: function (result) {
                        ajaxResult = result.response;

                        _.each(ajaxResult, function (value) {
                            that.add(value);
                        });
                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown) {
                        jt.log("Ajax home error", errorThrown, _config.jtAPI + "getArticles/limit/10/page/" + _page + "/order/published/detail/id,title,slug,image,user,published");
                    }
                });
            },
        });

        return homeCollection;
    }
)