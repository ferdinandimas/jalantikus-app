define(
    [
        "underscore",
        "backbone",
        "jquery",
        "models/article",
        "text!views/article_layout.html",
        "text!views/header_detail_layout.html"
    ],
    function (_, Backbone, $, Article, articleLayout, headerLayout) {
        var homeView = Backbone.View.extend({
            layout: _.template(articleLayout),
            model : new Article(),
            initialize: function (_articleSlug) {
                var that = this;

                $("#app-toolbar").empty().append((_.template(headerLayout))())
                $("#app-body .app-content-container").empty().append(
                    '<div class="app-loader"><a href="javascript:void(0)" class="app-retry">Gagal memuat. Coba lagi?</a><div class="app-load"></div></div>'
                );

                this.model = new Article({
                    slug: _articleSlug
                });

                this.fetch();
            },
            fetch: function (options) {
                var that = this;

                if (!jt.isOffline()) {
                    this.model.fetch({
                        timeout: typeof options != "undefined" && typeof options.timeout != "undefined" ? options.timeout : 5000,
                        success: function () {
                            that.render();
                        },
                        error  : function () {
                            $(".app-load").css("display", "none");
                            $(".app-retry").css("display", "block");
                        }
                    });
                }
                else {
                    setTimeout(function () {
                        $(".app-load").css("display", "none");
                        $(".app-retry").css("display", "block");
                    }, 2000);
                }
            },
            render: function () {
                $("#app-toolbar").addClass("detail");
                $(".app-content-container .app-loader").remove();

                $("#app-body").empty().append(this.layout({
                    detail: this.model.toJSON()
                }));

                $(".app-detail-container").on("scroll touchmove", function () {
                    if ($(this).scrollTop() > 60) {
                        $("#app-toolbar").removeClass("detail");
                    }
                    else {
                        $("#app-toolbar").addClass("detail");
                    }
                });

                $("a").each(function (key, val) {
                    regExp = /https?\:\/\/app\.jalantikus\.com\/(gadgets|tips|news|gokil)\/(.*?)(\/|$|\?)/gim;
                    value  = $(val).attr("href");

                    if (value.match(regExp)) {
                        var matches = regExp.exec(value);

                        $(this).attr("href", "#article/" + matches[ 2 ]);
                    }
                });

                $(".app-retry").on("touchend click", function () {
                    $(".app-load").css("display", "block");
                    $(".app-retry").css("display", "none");

                    that.fetch({ timeout: 10000 });
                });
            }
        });

        return homeView;
    }
);