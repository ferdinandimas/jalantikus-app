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
                $("#app-toolbar").removeClass("detail").empty().append((_.template(headerLayout))());

                this.model.renderTimeline(this.page);

                var that = this;
                _data    = this.model.toJSON();

                $("#app-body").empty().append(this.layout());

                $("#app-body .app-content-container").empty();
                $("#app-body .app-content-container")
                    .append(this.timelineTemplate({
                        timelineArticle: _data
                    }))
                    .append(
                        '<div class="app-loader"><a href="javascript:void(0)" class="app-retry">Gagal memuat. Coba lagi?</a><div class="app-load"></div></div>');

                var _movement = 0;
                var _top = 0;
                var _nTop = 0;
                var _flag = 0;
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
                        // autoload();
                    }
                    _top = $(this).scrollTop();
                    if(_flag == 0)
                    {
                        if(_top > _nTop + 10)
                        {
                            if(!$("#app-toolbar").hasClass("scroll"))
                            {
                                _flag = 1;
                                $("#app-toolbar").addClass("scroll")
                            };
                        }
                    }
                    else if (_flag == 1)
                    {
                        if(_top <= _nTop - 10)
                        {
                            if($("#app-toolbar").hasClass("scroll"))
                            {
                                $("#app-toolbar").removeClass("scroll")
                                _flag = 0;
                            };
                        }
                    }
                    _nTop = _top;
                });
                $(document).on("touchend", "#app-body .app-content-container", function () {
                    _movement = 0;
                    autoload();
                });

                $(document).on("touchend", ".app-retry", function () {
                    $(".app-load").css("display", "block");
                    $(".app-retry").css("display", "none");
                    autoload();
                })
                $(document).on("click", ".app-retry", function () {
                    $(".app-load").css("display", "block");
                    $(".app-retry").css("display", "none");
                    autoload();
                })

                function autoload() {
                    if ($(".app-content-container .app-load").is(":in-viewport")) {
                        that.page = that.page + 1;
                        that.model.renderTimeline(that.page);

                        _data = that.model.toJSON();

                        if (_data.length > 0) {
                            $(".app-content-container .app-loader").remove();
                            $("#app-body .app-content-container")
                                .append(that.timelineTemplate({
                                    timelineArticle: _data
                                }))
                                .append(
                                    '<div class="app-loader"><a href="javascript:void(0)" class="app-retry">Gagal memuat. Coba lagi?</a><div class="app-load"></div></div>');
                        }
                    }
                }
            }
        });

        return homeView;
    }
);