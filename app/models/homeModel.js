define(
    [
        'backbone',
        'jquery'
    ],
    function (Backbone, $) {
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

                        console.log('HERE 1', ajaxResult);

                        _.each(ajaxResult, function (value) {
                            console.log('HERE', value);
                            that.add(value);
                        });
                    }
                });
            },
        });

        return homeCollection;
    }
)