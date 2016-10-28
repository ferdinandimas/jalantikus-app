define(
    [
        "underscore",
        "backbone",
        "jquery",
        "collections/homeTimeline",
        "text!views/home_layout.html",
        "text!views/header_layout.html",
        "text!views/template/timeline.html",
        "text!views/header_detail_layout.html",
    ],
    function (_, Backbone, $, Timeline, homeLayout, headerLayout, timelineTemplate, headerDetailLayout) {
        var homeView = Backbone.View.extend({
            timelineTemplate: _.template(timelineTemplate),
            layout          : _.template(homeLayout),
            collection      : new Timeline(),
            page            : 1,
            initialize      : function (_options) {
                this.page = 1;

                var that = this;

                $("#app-toolbar")
                    .removeClass("detail")
                    .removeClass("scroll")
                    .empty()
                    .append((_.template(headerLayout))());

                //var statusBarChanged = 0;
                //while (statusBarChanged != 1) {
                //    if (typeof window.StatusBar != "undefined" && !$("#app-toolbar").hasClass("detail")) {
                //        window.StatusBar.backgroundColorByHexString("#8f1f1f");
                //
                //        statusBarChanged = 1;
                //    }
                //    else if (!$("#app-toolbar").hasClass("detail")) {
                //        statusBarChanged = 1;
                //    }
                //}

                $("#app-body").empty().append(this.layout());

                if ($("#app-body .app-refreshed").length == 0) {
                    $("#app-body").append(
                        '<div class="app-refreshed"></div>'
                    );
                }

                if (typeof _options != "undefined" && typeof _options.type != "undefined") {
                    this.type = _options.type;

                    if (_options.type == "most-read") {
                        this.order = "14day";
                    }
                    else if (_options.type == "android-tips") {
                        this.order    = "14day";
                        this.category = "tips";
                    }
                    else if (_options.type == "games-tips") {
                        this.order    = "14day";
                        this.category = "tips";
                        this.search   = "game";
                    }
                    else if (_options.type == "search") {
                        this.search = _options.search;

                        $("#app-toolbar")
                            .removeClass("detail")
                            .removeClass("scroll")
                            .empty()
                            .append((_.template(headerDetailLayout))());

                        $("#search-form [name='search']").val(_options.search);
                        $("#app-toolbar .header-description").html("Hasil Pencarian");
                    }

                    this.collection = new Timeline({
                        order   : typeof this.order != "undefined" ? this.order : "",
                        category: typeof this.category != "undefined" ? this.category : "",
                        search  : typeof this.search != "undefined" ? this.search : "",
                    });
                }
                else {
                    $("#search-form [name='search']").val("");
                }

                $("a.usermenu-item").removeClass("active").each(function () {
                    if ($(this).attr("href") == "#" + Backbone.history.getFragment()) {
                        $("#app-toolbar .header-description").html($(this).find(".usermenu-item-detail").html());
                        $(this).addClass("active");
                    }
                });

                this.collection.fetch({
                    timeout: 5000,
                    success: function () {
                        that.page = that.page + 1;

                        $(".header-refresh").show();
                        $("#app-body .app-content-container").empty();

                        that.render();
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

                        if ($(".splash").length >= 1) {
                            $(".app-refreshed").html("Tidak ada jaringan.").fadeIn();
                            setTimeout(function () {
                                $(".app-refreshed").fadeOut();
                            }, 2000);

                            $(".splash-content .app-loader").fadeIn();

                            $(".splash-quote").remove();
                            $(".splash-speaker").remove();
                            $(".splash-loading").hide();
                        }
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
                            order   : typeof that.order != "undefined" ? that.order : "",
                            category: typeof that.category != "undefined" ? that.category : "",
                            search  : typeof that.search != "undefined" ? that.search : "",
                            page    : that.page,
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
                    if (this.type == "search") {
                        $("#app-body .app-content-container").empty().append(
                            '<div class="app-search">' +
                            '<span class="app-search-result">Hasil pencarian dari: </span>' +
                            '<span class="app-search-keyword">"' + this.search + '"</span>' +
                            '</div>'
                        );
                    }

                    $("#app-body .app-content-container")
                        .append(this.timelineTemplate({
                            timelineArticle: _data
                        }));

                    if (_data.length > 5) {
                        $("#app-body .app-content-container").append(
                            '<div class="app-loader"><a href="javascript:void(0)" class="app-retry">Gagal memuat. Coba lagi?</a><div class="app-load"></div></div>'
                        );
                    }

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
                }
                else {
                    if (this.type == "search") {
                        $("#app-body .app-content-container").empty().append(
                            '<div class="app-search">' +
                            '<span class="app-search-result">Tidak ditemukan artikel yang sesuai</span>' +
                            '</div>'
                        );
                    }
                }

                if ($(".splash").length >= 1) {
                    setTimeout(function () {
                        $(".splash").fadeOut("fast", function () {
                            $(this).remove();
                        })
                    }, 2000);
                }
            },
            autoload        : function () {
                var that = this;

                if ($(".app-content-container .app-load").is(":in-viewport") && !$(".app-content-container .app-load").hasClass("loading") && !jt.isOffline()) {
                    $(".app-content-container .app-load").addClass("loading");

                    this.collection = new Timeline({
                        order   : typeof this.order != "undefined" ? this.order : "",
                        category: typeof this.category != "undefined" ? this.category : "",
                        search  : typeof this.search != "undefined" ? this.search : "",
                        page    : this.page,
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