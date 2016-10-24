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
                return _config.jtAPI + (_config.environment == "dev" ? "live/" : null) + "getArticle/" + this.slug + "/detail/title,image,user,published,description";
            },
            parse     : function (result) {
                return result.response;
            }
        });

        return Article;
    }
)