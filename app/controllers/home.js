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

                        $(".header-refresh").show();
                        $("#app-body .app-content-container").empty();

                        that.render();
                        if($(".splash").length >= 1)
                        {
                            setTimeout(function(){
                                $(".splash").fadeOut("fast", function(){
                                    $(this).remove();
                                })
                            }, 2500);
                        }
                        
                    },
                    error  : function () {
                        $("#app-body .app-content-container").empty().append(
                            '<div class="app-loader"><a href="javascript:void(0)" class="app-retry">Gagal memuat. Coba lagi?</a><div class="app-load"></div></div>'
                        );
                        $(".header-refresh").hide();

                        $(".app-load").css("display", "none");
                        $(".app-retry").css("display", "block");

                        $(".app-retry").on("click touchend", function () {
                            $(".app-load").css("display", "block");
                            $(".app-retry").css("display", "none");
                            that.autoload();
                        });
                    }
                });

                $(".header-refresh").on("click", function () {
                    if(!$(".header-refresh").hasClass("active"))
                    {
                        $(".header-refresh").addClass("active");
                        setTimeout(function(){
                            $(".header-refresh").removeClass("active");
                        }, 1500);
                    }

                    if (!jt.isOffline()) {
                        this.page = 1;

                        this.collection = new Timeline({
                            page: this.page
                        });

                        this.collection.fetch({
                            timeout: 10000,
                            success: function () {
                                that.page = that.page + 1;

                                $("#app-body .app-content-container").empty();
                                that.render();
                                $(".app-refreshed").fadeIn();
                                setTimeout(function () {
                                    $(".app-refreshed").fadeOut();
                                }, 2000);
                            }
                        });
                    }
                    else {
                        setTimeout(function () {
                            $(".header-refresh").removeClass("active");
                        }, 2000);
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

                $("#app-body").append(
                    '<div class="app-refreshed">Refresh selesai</div>'
                );

                $("#app-body .app-content-container").scroll(function () {
                    clearTimeout($.data(this, 'scrollTimer'));
                    $.data(this, 'scrollTimer', setTimeout(function () {
                        that.autoload();
                    }, 250));
                });

                $("#app-body .app-content-container").on("touchend", function () {
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

                            $(".header-refresh").show();
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