define(
    [
        'backbone'
    ],
    function (Backbone) {
        var Article = Backbone.Model.extend({
            initialize: function (options, model) {
                this.details = (typeof options != "undefined" && typeof options.details != "undefined" ? options.details : "title,image,user,links,published,description");
                this.slug    = (typeof options != "undefined" && typeof options.slug != "undefined" ? options.slug : 1);
            },
            url       : function () {
                return _config.jtAPI + (_config.environment == "dev" ? "live/" : "") + "getArticle/" + this.slug + "/detail/" + this.details;
            },
            parse     : function (result) {
                return result.response;
            }
        });

        return Article;
    }
)