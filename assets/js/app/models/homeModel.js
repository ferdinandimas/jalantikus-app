define(
    [
        'underscore',
        'backbone',
        'jquery'
    ],
    function (_, Backbone, $) {
        var homeCollection = Backbone.Collection.extend({
            renderTimeline: function (_page = 1) {
                var that = this;

                $.ajax({
                    url     : _config.jtAPI + "getArticles/limit/10/page/" + _page + "/order/latest/detail/id,title,image,user,published",
                    dataType: "json",
                    async   : false,
                    success : function (result) {
                        ajaxResult = result.response;

                        that.reset();

                        _.each(ajaxResult, function (value) {
                            that.add(value);
                        });
                    }
                });
            },
        });

        return homeCollection;
    }
)