define(
    [
        "underscore",
        "backbone",
        "jquery",
        "text!views/app_layout.html"
    ],
    function (_, Backbone, $, appLayout) {
        var app = Backbone.View.extend({
            initialize: function () {
                $("#app-root").empty().append((_.template(appLayout))());
            }
        });

        return app;
    }
);