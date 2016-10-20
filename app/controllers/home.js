define(
    [
        "underscore",
        "backbone",
        "jquery",
        "text!views/home_layout.html",
        "text!views/header_layout.html",
        "text!views/template/timeline.html",
        "models/homeModel",
        "fastclick"
    ],
    function (_, Backbone, $, homeLayout, headerLayout, timelineTemplate, homeCollection) {
        var attachFastClick = Origami.fastclick;
        var homeView        = Backbone.View.extend({
            timelineTemplate: _.template(timelineTemplate),
            layout          : _.template(homeLayout),
            model           : new homeCollection(),
            page            : 1,
            initialize      : function () {
                $("#app-toolbar").removeClass("detail").empty().append((_.template(headerLayout))());

                this.model.renderTimeline(this.page);

                var that = this;
                _data    = this.model.toJSON();

                console.log('here 2', _data);

                $("#app-body").empty().append(this.layout());

                $("#app-body .app-content-container").empty();
                $("#app-body .app-content-container").append(this.timelineTemplate({
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
                        attachFastClick($('.card-link'));
                    }
                }
            }
        });

        return homeView;
    }
);