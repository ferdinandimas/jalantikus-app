define(
    [
        "underscore",
        "backbone",
        "jquery",
        "text!views/browser_layout.html",
        "text!views/header_browser_layout.html"
    ],
    function (_, Backbone, $, layout, headerLayout) {
        var browserView = Backbone.View.extend({
            layout: _.template(layout),
            initialize: function (_url) {
                _url = decodeURIComponent(_url);

                var that = this;

                $("#app-toolbar")
                    .addClass("detail")
                    .removeClass("scroll")
                    .empty()
                    .append((_.template(headerLayout))());

                $("#app-body").empty().append(this.layout({
                    url: _url
                }));

                if ($(".splash").length >= 1) {
                    setTimeout(function () {
                        $(".splash").fadeOut("fast", function () {
                            $(this).remove();
                        })
                    }, 2000);
                }
            }
        });

        return browserView;
    }
);