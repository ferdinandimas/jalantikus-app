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
            initialize      : function () {
                var that = this;

                $("#app-toolbar").removeClass("detail").empty().append((_.template(headerLayout))());
                $("#app-body").empty().append(this.layout());

                this.collection.fetch({
                    timeout: 5000,
                    success: function () {
                        that.page = that.page + 1;

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
            render          : function () {
                var that = this;
                var _data = this.collection.toJSON();

                if (_data.length > 0) {
                    $("#app-body .app-content-container")
                        .append(this.timelineTemplate({
                            timelineArticle: _data
                        }));
                }

                $("#app-body .app-content-container").append(
                    '<div class="app-loader"><a href="javascript:void(0)" class="app-retry">Gagal memuat. Coba lagi?</a><div class="app-load"></div></div>'
                );

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
                // $("#app-body .app-content-container").on("touchmove", function () {
                //     if (_movement++ >= 50) {
                //         _movement = 0;
                //         //that.autoload();
                //     }

                //     _top = $(this).scrollTop();

                //     if (_flag == 0) {
                //         if (_top > _nTop + 10) {
                //             if (!$("#app-toolbar").hasClass("scroll")) {
                //                 _flag = 1;
                //                 $("#app-toolbar").addClass("scroll")
                //             }
                //             ;
                //         }
                //     }
                //     else if (_flag == 1) {
                //         if (_top <= _nTop - 10) {
                //             if ($("#app-toolbar").hasClass("scroll")) {
                //                 $("#app-toolbar").removeClass("scroll")
                //                 _flag = 0;
                //             }
                //             ;
                //         }
                //     }

                //     _nTop = _top;
                // });
                $("#app-body .app-content-container").on("touchend", function () {
                    _movement = 0;
                    that.autoload();
                });
                $(".app-retry").on("click touchend", function () {
                    $(".app-load").css("display", "block");
                    $(".app-retry").css("display", "none");
                    that.autoload();
                });
            },
            autoload        : function () {
                var that = this;

                if ($(".app-content-container .app-load").is(":in-viewport") && !jt.isOffline()) {
                    this.collection = new Timeline({
                        page: this.page
                    });

                    this.collection.fetch({
                        timeout: 10000,
                        success: function () {
                            that.page = that.page + 1;

                            $(".app-content-container .app-loader").remove();

                            that.render();
                        },
                        error  : function () {
                            $(".app-load").css("display", "none");
                            $(".app-retry").css("display", "block");
                        }
                    });
                }
                else if (jt.isOffline()) {
                    setTimeout(function () {
                        $(".app-load").css("display", "none");
                        $(".app-retry").css("display", "block");
                    }, 2000);
                }
            }
        });

        return homeView;
    }
);