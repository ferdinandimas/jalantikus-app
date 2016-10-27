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
            initialize      : function (_type) {
                var that = this;

                $("#app-toolbar")
                    .removeClass("detail")
                    .removeClass("scroll")
                    .empty()
                    .append((_.template(headerLayout))());

                var statusBarChanged = 0;
                while (statusBarChanged != 1) {
                    if (typeof window.StatusBar != "undefined" && !$("#app-toolbar").hasClass("detail")) {
                        window.StatusBar.backgroundColorByHexString("#8f1f1f");

                        statusBarChanged = 1;
                    }
                    else if (!$("#app-toolbar").hasClass("detail")) {
                        statusBarChanged = 1;
                    }
                }

                $("#app-body").empty().append(this.layout());

                if ($("#app-body .app-refreshed").length == 0) {
                    $("#app-body").append(
                        '<div class="app-refreshed"></div>'
                    );
                }

                if (typeof _type != "undefined") {
                    console.log(_type);

                    var _order, _search, _category;

                    if (_type == "most-read") {
                        _order = "3day";
                    }
                    else if (_type == "hacking-tips") {
                        _order    = "3day";
                        _category = "tips";
                        _search   = "hack";
                    }
                    else if (_type == "games-tips") {
                        _order    = "3day";
                        _category = "tips";
                        _search   = "game";
                    }

                    this.collection = new Timeline({
                        order   : typeof _order != "undefined" ? _order : "",
                        category: typeof _category != "undefined" ? _category : "",
                        search  : typeof _search != "undefined" ? _search : "",
                    });
                }

                this.collection.fetch({
                    timeout: 5000,
                    success: function () {
                        that.page = that.page + 1;

                        $(".header-refresh").show();
                        $("#app-body .app-content-container").empty();

                        that.render();

                        if ($(".splash").length >= 1) {
                            setTimeout(function () {
                                $(".splash").fadeOut("fast", function () {
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
                    if (!jt.isOffline()) {
                        if (!$(".header-refresh").hasClass("active")) {
                            $(".header-refresh").addClass("active");
                            setTimeout(function () {
                                $(".header-refresh").removeClass("active");

                                if (!jt.isOffline()) {
                                    $(".app-refreshed").html("Refresh selesai.").fadeIn();
                                    setTimeout(function () {
                                        $(".app-refreshed").fadeOut();
                                    }, 2000);
                                }
                            }, 1500);
                        }
                    }
                    else {
                        $(".app-refreshed").html("Tidak ada jaringan.").fadeIn();
                        setTimeout(function () {
                            $(".app-refreshed").fadeOut();
                        }, 2000);
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
                            }
                        });
                    }
                });
            },
            render          : function () {
                var that  = this;
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

                        $(".app-refreshed").html("Tidak ada jaringan.").fadeIn();
                        setTimeout(function () {
                            $(".app-refreshed").fadeOut();
                        }, 2000);
                    }, 2000);
                }
            }
        });

        return homeView;
    }
);