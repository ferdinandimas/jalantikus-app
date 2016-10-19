define(
    [
        "underscore",
        "backbone",
        "jquery",
        "text!app/views/timeline_template.html",
        "app/models/homeModel"
    ],
    function (_, Backbone, $, timelineTemplate, homeCollection) {
        var homeView = Backbone.View.extend({
            template: _.template(timelineTemplate),
            model   : new homeCollection(),
            initialize: function () {
                this.model.renderTimeline();

                _data = this.model.toJSON();

                $("#app-body .app-content-container").empty();
                $("#app-body .app-content-container").append(this.template({
                    timelineArticle: _data
                })).append('<div class="app-loader"><div class="app-load"></div></div>');

                $(document).on("click", ".card-link", function (e) {
                    var currItem = $(this);
                    var ripple   = $(currItem.children()[ 0 ]);
                    var rX       = e.offsetX - 225, rY = e.offsetY - 225;
                    if (!currItem.hasClass("active")) {
                        ripple.css('top', rY);
                        ripple.css('left', rX);
                        currItem.addClass("active");
                        var fdCurr = setTimeout(function () {
                            currItem.removeClass("active");
                            clearTimeout(fdCurr);
                        }, 500)
                    }
                });

                var _movement = 0;
                $("#app-body .app-content-container").scroll(function() {
                    _movement = 0;
                    autoload();
                });
                $(document).on("touchmove", "#app-body .app-content-container", function() {
                    if (_movement++ >= 50) {
                        _movement = 0;
                        autoload();
                    }
                });
                $(document).on("touchend", "#app-body .app-content-container", function() {
                    _movement = 0;
                    autoload();
                });

                function autoload() {
                    if ($(".app-content-container .app-loader").is(":in-viewport")) {
                        console.log("HERE");
                    }
                }
            }
        });

        return homeView;
    }
);