define(
    [
        "underscore",
        "backbone",
        "jquery",
        "models/article",
        "models/app",
        "text!views/article_layout.html",
        "text!views/header_detail_layout.html",
        "prettify"
    ],
    function (_, Backbone, $, Article, App, articleLayout, headerLayout) {
        var homeView = Backbone.View.extend({
            layout     : _.template(articleLayout),
            model : new Article(),
            initialize: function (_articleSlug) {
                var that = this;

                $("#app-toolbar").addClass("detail").removeClass("scroll").empty().append((_.template(headerLayout))());

                setTimeout(function() {
                    if (typeof window.StatusBar != "undefined") {
                        window.StatusBar.backgroundColorByHexString("#045f04");
                    }
                    alert("1");
                }, 45);

                $("#app-body").empty().append(
                    '<div class="app-detail-container"><div class="app-toolbar-placeholder"></div><div class="app-loader"><a href="javascript:void(0)" class="app-retry">Gagal memuat. Coba lagi?</a><div class="app-load"></div></div></div>'
                );

                $(".app-home").on("click", function (e) {
                    window.stop();

                    if (jt.isOffline()) {
                        e.preventDefault();

                        that.showOffline();
                    }
                });

                this.model = new Article({
                    slug: _articleSlug
                });

                this.fetch();

                if ($(".splash").length >= 1) {
                    setTimeout(function () {
                        $(".splash").fadeOut("fast", function () {
                            $(this).remove();
                        })
                    }, 2500);
                }
            },
            fetch     : function (options) {
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

                            $(".app-retry").on("touchend click", function () {
                                $(".app-load").css("display", "block");
                                $(".app-retry").css("display", "none");

                                that.fetch({ timeout: 10000 });
                            });
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
            render    : function () {
                var that    = this;
                var tooltip = false;

                $(".app-content-container .app-loader").remove();

                $("#app-body").empty().append(this.layout({
                    detail: this.model.toJSON()
                }));

                $("#app-toolbar").addClass("detail").addClass("scroll");

                if ($("#app-body .app-refreshed").length == 0) {
                    $("#app-body").append(
                        '<div class="app-refreshed"></div>'
                    );
                }

                $(".jt-not-view.appsinner").remove();
                $(".jt-not-view.artikelmenarik").remove();
                $(".partner-banner-aftc-artikel-menarik").remove();

                $(".app-detail-container").on("scroll touchmove", function () {
                    if ($(this).scrollTop() > 60) {
                        $("#app-toolbar").removeClass("scroll");
                    }
                    else {
                        $("#app-toolbar").addClass("scroll");
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

                $("a").each(function (key, val) {
                    $(val)
                        .attr("href",
                            $(val)
                                .attr("href")
                                .replace("https://app.jalantikus.com", "https://jalantikus.com")
                                .replace("http://app.jalantikus.com", "https://jalantikus.com"));
                });

                $(".apps-detail.horizontal").each(function (key, val) {
                    var _appDetail = $(this).find(".click-target").attr("href");
                    var _that      = this;
                    var _appSlug;

                    $(this).find("a").attr("href", "javascript:void()").click(function (e) {
                        e.preventDefault()
                    });
                    $(this)
                        .find(".info-container .info h3")
                        .replaceWith(
                            $('<h3><div class="title text-link-container">' + $(this)
                                    .find(".info-container .title.text-link-container")
                                    .html() + '</div></h3>')
                        );

                    regExp      = /https?:\/\/(app\.)?jalantikus\.com\/(apps|games)\/(.*?)(\/|$)/gi;
                    var matches = regExp.exec(_appDetail);

                    _appSlug = matches[ 3 ];

                    _appDetail = new App({
                        slug: _appSlug
                    });

                    _appDetail.fetch({
                        timeout: 5000,
                        success: function () {
                            _appDetail = _appDetail.toJSON();

                            $(_that)
                                .find(".action-btn.download-btn")
                                .attr("href",
                                    _config.jtFiles + _appDetail.id + "/" + _appDetail.version.id + "/" + _appDetail.version.uri)
                                .off();

                            if (typeof _appDetail.version.external_url != "undefined" && _appDetail.version.external_url != "") {
                                $(_that)
                                    .find(".action-btn.googleplay-btn")
                                    .attr("href", _appDetail.version.external_url)
                                    .off();
                            }
                            else {
                                $(_that).find(".action-btn.googleplay-btn").remove();
                            }
                        },
                        error  : function () {
                            $(_that).parent().parent().remove();
                        }
                    });
                });

                setTimeout(function () {
                    if (_config.environment == "live") {
                        $("#iframe-jalantikus").prop("src", $("#iframe-jalantikus").data("src"));
                    }
                }, 2000);

                /*
                Preaload Banner Image
                 */
                if ($(".app-detail-header .header-image img").length > 0) {
                    var img = new Image();
                    img.src = $(".app-detail-header .header-image img").data("src");
                    $(img).on("load", img, function() {
                        console.log("loaded");

                        $(".app-detail-header .header-image img").prop("src", $(".app-detail-header .header-image img").data("src"));
                    });
                }

                $("a").on("click", function (e) {
                    if (jt.isOffline()) {
                        e.preventDefault();

                        that.showOffline();
                    }
                });

                $(".app-retry").on("touchend click", function () {
                    $(".app-load").css("display", "block");
                    $(".app-retry").css("display", "none");

                    that.fetch({ timeout: 10000 });
                });
                $(".prettify-copy-selected").on("touchend click", function (e) {
                    document.execCommand('copy');
                    validateTooltip(e)
                });

                $(".prettify-copy-all").on("touchend click", function (e) {
                    _el     = $(this).parent().parent();
                    _result = "";
                    $(_el).find("li").each(function (obj, val) {
                        _result += $(val).text() + "\n";
                    });

                    var dummy = document.createElement("textarea");
                    document.body.appendChild(dummy);
                    dummy.setAttribute("id", "dummy_id");
                    document.getElementById("dummy_id").value = _result;
                    $(dummy).select();
                    document.execCommand("copy");
                    document.body.removeChild(dummy);
                    validateTooltip(e)
                });

                function validateTooltip(e) {
                    if (!tooltip) {
                        tooltip  = true;
                        var q   = "<div class='prettify-tooltip'>Berhasil disalin</div>"
                        var posX = e.target.clientX;
                        var posY = e.target.clientY;
                        $(e.target).append(q);
                        $('.prettify-tooltip').slideDown(300);
                        var w  = $(e.target).innerWidth();
                        var fw = (100 - w) / 2
                        if (fw > 0) {
                            $('.prettify-tooltip').css('left', (fw * -1));
                        }
                        else {
                            $('.prettify-tooltip').css('left', fw);
                        }
                        var td = setInterval(function () {
                            tooltip = false;
                            clearInterval(td);
                            $('.prettify-tooltip').slideUp(300, function () {
                                $(this).remove();
                            })
                        }, 2000)
                    }
                }

                function decodeHtml(html) {
                    var txt       = document.createElement("textarea");
                    txt.innerHTML = html;
                    return txt.value;
                }

                $(".prettyprint").each(function (key, value) {
                    $(this).text(decodeHtml($(this).text()));
                })

                PR.prettyPrint();
            },
            showOffline: function () {
                $(".app-refreshed").html("Tidak ada jaringan").fadeIn();
                setTimeout(function () {
                    $(".app-refreshed").fadeOut();
                }, 2000);
            }
        });

        return homeView;
    }
);