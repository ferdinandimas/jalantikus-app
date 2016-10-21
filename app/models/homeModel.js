define(
    [
        "underscore",
        'backbone',
        'jquery'
    ],
    function (_, Backbone, $) {
        var homeCollection = Backbone.Collection.extend({
            renderTimeline: function (_page) {
                alert(7);
                this.reset();

                var that = this;

                $.ajax({
                    url: _config.jtAPI + "getArticles/limit/10/page/" + _page + "/order/published/detail/id,title,slug,image,user,published",
                    dataType: "json",
                    async: false,
                    success: function (result) {
                        alert(8);
                        ajaxResult = result.response;

                        _.each(ajaxResult, function (value) {
                            alert(value);
                            that.add(value);
                        });
                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown) {
                        alert(textStatus);
                        alert(errorThrown);
                    }
                });
            },
        });

        return homeCollection;
    }
)