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
                    ripple($(this), e)
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

                function ripple(t, e)
                {
                    var currItem = t;
                    var ripple   = $(currItem.children()[ 0 ]);
                    var rX       = e.offsetX - 225, rY = e.offsetY - 225;
                    if (!currItem.hasClass("active") && !currItem.hasClass("faded")) {
                        ripple.css('top', rY);
                        ripple.css('left', rX);
                        currItem.addClass("active");
                        var fdCurr = setTimeout(function () {
                            currItem.addClass("faded");
                            clearTimeout(fdCurr);
                            var fdFd = setTimeout(function () {
                                currItem.removeClass("active");
                                currItem.removeClass("faded");
                                clearTimeout(fdFd);
                            }, 100)
                        }, 300)
                    }
                }

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