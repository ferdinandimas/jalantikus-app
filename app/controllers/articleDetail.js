define(
    [
        "underscore",
        "backbone",
        "jquery",
        "text!views/article_layout.html",
        "text!views/header_detail_layout.html"
    ],
    function (_, Backbone, $, articleLayout, headerLayout) {
        var homeView = Backbone.View.extend({
            initialize: function (_articleSlug) {
                $("#app-toolbar").addClass("detail").empty().append((_.template(headerLayout))());

                var that = this;

                $.ajax({
                    url: _config.jtAPI + "getArticle/" + _articleSlug,
                    dataType: "json",
                    async: false,
                    success: function (result) {
                        ajaxResult = result.response;

                        $("#app-body").empty().append((_.template(articleLayout))({
                            detail: ajaxResult
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
            }
        });

        return homeView;
    }
);