define(
    [
        "underscore",
        "backbone",
        "jquery",
        "collections/homeTimeline",
        "text!views/home_layout.html",
        "text!views/header_layout.html",
        "text!views/template/timeline.html"
    ],
    function (_, Backbone, $, Timeline, homeLayout, headerLayout, timelineTemplate) {
        var homeView = Backbone.View.extend({
            timelineTemplate: _.template(timelineTemplate),
            layout          : _.template(homeLayout),
            collection      : new Timeline(),
            page            : 1,
            initialize: function () {
                var that = this;

                $("#app-toolbar").removeClass("detail").empty().append((_.template(headerLayout))());
                $("#app-body").empty().append(this.layout());

                var _movement = 0;
                var _top      = 0;
                var _nTop     = 0;
                var _flag     = 0;
                $("#app-body .app-content-container").scroll(function () {
                    clearTimeout($.data(this, 'scrollTimer'));
                    $.data(this, 'scrollTimer', setTimeout(function () {
                        _movement = 0;
                        that.autoload();
                    }, 250));
                });
                $(document).on("touchmove", "#app-body .app-content-container", function () {
                    if (_movement++ >= 50) {
                        _movement = 0;
                        //that.autoload();
                    }

                    _top = $(this).scrollTop();

                    if (_flag == 0) {
                        if (_top > _nTop + 10) {
                            if (!$("#app-toolbar").hasClass("scroll")) {
                                _flag = 1;
                                $("#app-toolbar").addClass("scroll")
                            }
                            ;
                        }
                    }
                    else if (_flag == 1) {
                        if (_top <= _nTop - 10) {
                            if ($("#app-toolbar").hasClass("scroll")) {
                                $("#app-toolbar").removeClass("scroll")
                                _flag = 0;
                            }
                            ;
                        }
                    }

                    _nTop = _top;
                });
                $(document).on("touchend", "#app-body .app-content-container", function () {
                    _movement = 0;
                    that.autoload();
                });
                $(document).on("touchend click", ".app-retry", function () {
                    $(".app-load").css("display", "block");
                    $(".app-retry").css("display", "none");
                    that.autoload();
                });

                this.collection.fetch({
                    timeout: 5000,
                    success: function () {
                        $("#app-body .app-content-container").empty();

                        that.render();
                    },
                    error  : function () {
                        $("#app-body .app-content-container").empty().append(
                            '<div class="app-loader"><a href="javascript:void(0)" class="app-retry">Gagal memuat. Coba lagi?</a><div class="app-load"></div></div>'
                        );

                        $(".app-load").css("display", "none");
                        $(".app-retry").css("display", "block");
                    }
                });
            },
            render: function () {
                _data = this.collection.toJSON();

                if (_data.length > 0) {
                    $("#app-body .app-content-container")
                        .append(this.timelineTemplate({
                            timelineArticle: _data
                        }));
                }

                $("#app-body .app-content-container").append(
                    '<div class="app-loader"><a href="javascript:void(0)" class="app-retry">Gagal memuat. Coba lagi?</a><div class="app-load"></div></div>'
                );
            },
            autoload: function () {
                var that = this;

                if ($(".app-content-container .app-load").is(":in-viewport")) {
                    this.page = this.page + 1;

                    this.collection = new Timeline({
                        page: this.page
                    });

                    this.collection.fetch({
                        timeout: 5000,
                        success: function () {
                            $(".app-content-container .app-loader").remove();

                            that.render();
                        },
                        error  : function () {
                            $(".app-load").css("display", "none");
                            $(".app-retry").css("display", "block");
                        }
                    });
                }
            }
        });

        return homeView;
    }
);