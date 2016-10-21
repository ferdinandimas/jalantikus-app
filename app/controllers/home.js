define(
    [
        "underscore",
        "backbone",
        "jquery",
        "text!views/home_layout.html",
        "text!views/header_layout.html",
        "text!views/template/timeline.html",
        "models/homeModel"
    ],
    function (_, Backbone, $, homeLayout, headerLayout, timelineTemplate, homeCollection) {
        var homeView = Backbone.View.extend({
            timelineTemplate: _.template(timelineTemplate),
            layout          : _.template(homeLayout),
            model           : new homeCollection(),
            page            : 1,
            initialize      : function () {
                alert(5);
                $("#app-toolbar").removeClass("detail").empty().append((_.template(headerLayout))());

                this.model.renderTimeline(this.page);

                var that = this;
                _data    = this.model.toJSON();

                $("#app-body").empty().append(this.layout());

                $("#app-body .app-content-container").empty();
                $("#app-body .app-content-container").append(this.timelineTemplate({
                    timelineArticle: _data
                })).append('<div class="app-loader"><div class="app-load"></div></div>');

                alert(6);

                var _movement = 0;
                $("#app-body .app-content-container").scroll(function () {
                    clearTimeout($.data(this, 'scrollTimer'));
                    $.data(this, 'scrollTimer', setTimeout(function () {
                        _movement = 0;
                        autoload();
                    }, 250));
                });
                $(document).on("touchmove", "#app-body .app-content-container", function () {
                    if (_movement++ >= 50) {
                        _movement = 0;
                        autoload();
                    }
                });
                $(document).on("touchend", "#app-body .app-content-container", function () {
                    _movement = 0;
                    autoload();
                });

                function autoload() {
                    if ($(".app-content-container .app-loader").is(":in-viewport")) {
                        that.page = that.page + 1;
                        that.model.renderTimeline(that.page);

                        _data = that.model.toJSON();

                        $(".app-content-container .app-loader").remove();
                        $("#app-body .app-content-container").append(that.timelineTemplate({
                            timelineArticle: _data
                        })).append('<div class="app-loader"><div class="app-load"></div></div>');
                    }
                }
            }
        });

        return homeView;
    }
);