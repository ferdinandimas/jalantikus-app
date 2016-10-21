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
                    timeout: 10000,
                    error: function(XMLHttpRequest, textStatus, errorThrown) {
                        console.log("Ajax home error", errorThrown, _config.jtAPI + "getArticles/limit/10/page/" + _page + "/order/published/detail/id,title,slug,image,user,published");
                        
                        $(".app-load").css("display", "none");
                        $(".app-retry").css("display", "block");
                    }
                });
            },
        });

        return homeCollection;
    }
)