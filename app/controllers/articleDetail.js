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

                $(document).on("touchend click", ".app-retry", function () {
                    $(".app-load").css("display", "block");
                    $(".app-retry").css("display", "none");

                    that.fetch();
                });

                this.fetch();
            },
            fetch: function() {
                var that = this;

                this.model.fetch({
                    timeout: 5000,
                    success: function () {
                        that.render();
                    },
                    error  : function () {
                        $(".app-load").css("display", "none");
                        $(".app-retry").css("display", "block");
                    }
                });
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
            }
        });

        return homeView;
    }
);