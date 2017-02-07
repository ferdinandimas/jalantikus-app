define(
    [
        'backbone'
    ],
    function (Backbone) {
        var Article = Backbone.Model.extend({
            initialize: function (options, model) {
                this.details = (typeof options != "undefined" && typeof options.details != "undefined" ? options.details : "title,image,user,links,published,description,keywords,description_images,related");
                this.slug    = (typeof options != "undefined" && typeof options.slug != "undefined" ? options.slug : 1);
            },
            url       : function () {
                return _config.jtAPI + (_config.environment == "dev" ? "live/" : "") + "getArticle/" + this.slug + "/detail/" + this.details + _config.urlPostfix;
            },
            parse     : function (result) {
                return result.response;
            }
        });

        return Article;
    }
)