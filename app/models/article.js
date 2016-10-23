define(
    [
        'backbone'
    ],
    function (Backbone) {
        var Article = Backbone.Model.extend({
            initialize: function (options, model) {
                this.slug = (typeof options != "undefined" && typeof options.slug != "undefined" ? options.slug : 1);
            },
            url       : function () {
                return _config.jtAPI + "getArticle/" + this.slug;
            },
            parse     : function (result) {
                return result.response;
            }
        });

        return Article;
    }
)