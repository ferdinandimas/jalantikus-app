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
        var articleDetailView = Backbone.View.extend({
            layout     : _.template(articleLayout),
            model : new Article(),
            initialize: function (_articleSlug) {
                var that = this;

                console.log("DETAIL 1");

                $("#app-toolbar")
                    .addClass("detail")
                    .removeClass("scroll")
                    .removeClass("on-top")
                    .empty()
                    .append((_.template(headerLayout))());

                //var statusBarChanged = 0;
                //while (statusBarChanged != 1) {
                //    if (typeof window.StatusBar != "undefined" && $("#app-toolbar").hasClass("detail")) {
                //        window.StatusBar.backgroundColorByHexString("#045f04");
                //
                //        statusBarChanged = 1;
                //    }
                //    else if ($("#app-toolbar").hasClass("detail")) {
                //        statusBarChanged = 1;
                //    }
                //}

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

                if (window.sessionStorage.getItem(Backbone.history.getFragment()) == null) {
                    window.sessionStorage.setItem(Backbone.history.getFragment() + "/scrollTop",
                        $(".app-detail-container").scrollTop());
                }

                this.model = new Article({
                    slug: _articleSlug
                });

                this.fetch();

                $("#app-body .app-detail-container").scroll(function () {
                    window.sessionStorage.setItem(Backbone.history.getFragment() + "/scrollTop",
                        $(".app-detail-container").scrollTop());
                });

	            if ($(".splash").length >= 1) {
		            if (typeof navigator.splashscreen != "undefined") {
			            navigator.splashscreen.hide();
		            }

		            setTimeout(function () {
			            $(".splash").fadeOut("fast", function () {
				            $(this).remove();
			            })
		            }, 2000);
	            }
            },
            fetch     : function (options) {
                var that = this;

                console.log("DETAIL 2");

                if (!jt.isOffline()) {
                    console.log("DETAIL 3");
                    if (window.sessionStorage.getItem(Backbone.history.getFragment()) != null) {
                        console.log("DETAIL 3A");
                        that.render();
                    }
                    else {
                        this.model.fetch({
                            timeout: typeof options != "undefined" && typeof options.timeout != "undefined" ? options.timeout : 5000,
                            success: function () {
                                console.log("DETAIL 3B");
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

                console.log("DETAIL 4");

                $(".app-detail-container .app-loader").remove();

                if (window.sessionStorage.getItem(Backbone.history.getFragment()) != null) {
                    console.log("DETAIL 4A");
                    _buff = JSON.parse(window.sessionStorage.getItem(Backbone.history.getFragment()));
                }
                else {
                    console.log("DETAIL 4B");
                    window.sessionStorage.setItem(Backbone.history.getFragment(), JSON.stringify(this.model.toJSON()));

                    _buff = this.model.toJSON();
                }

                console.log("DETAIL 5");

                $("#app-body").empty().append(this.layout({
                    detail: _buff
                }));

                $(".app-detail-body img").each(function (key, val) {
                    regExp = /(https?\:\/\/(.*?\.)?(jalantikus\.com|babe\.news)\/assets\/cache\/)(.*?\/.*?)(\/.*?)$/g;
                    value  = $(val).attr("src");

                    if (value.match(regExp)) {
                        var matches = regExp.exec(value);

                        _images      = matches[ 1 ] + $(".app-detail-body").width() + "/0" + matches[ 5 ];
                        _placeholder = matches[ 1 ] + Math.ceil($(".app-detail-body")
                                    .width() / 100) + "/0" + matches[ 5 ];

                        $(val).data("src", _images);
                        $(val).prop("src", _placeholder);
                    }
                });

                console.log("DETAIL 6");

                $(".app-detail-body img").each(function (key, val) {
                    var img = new Image();
                    img.src = $(val).data("src");
                    $(img).on("load", img, function () {
                        $(val).prop("src", $(val).data("src"));
                    });
                });

                $("#app-toolbar").addClass("detail").addClass("scroll");

                if ($("#app-body .app-refreshed").length == 0) {
                    $("#app-body").append(
                        '<div class="app-refreshed"></div>'
                    );
                }

                $(".jt-not-view.appsinner").remove();
                $(".jt-not-view.artikelmenarik").remove();
                $(".partner-banner-aftc-artikel-menarik").remove();

                console.log("DETAIL 7");

                $(".app-detail-container").on("scroll touchmove", function () {
                    if ($(this).scrollTop() > 60) {
                        $("#app-toolbar").removeClass("scroll");
                    }
                    else {
                        $("#app-toolbar").addClass("scroll");
                    }
                    if ($(this).scrollTop() <= 0) {
                        if ($(".scroll-up").css("display") != "none") {
                            $(".scroll-up").css("display", "none");
                        }
                    }
                    else if ($(".app-detail-end").is(":in-viewport")) {
                        if ($(".scroll-down").css("display") != "none") {
                            $(".scroll-down").css("display", "none");
                        }
                    }
                    else {
                        if ($(".scroll-up").css("display") == "none") {
                            $(".scroll-up").css("display", "block");
                        }
                        if ($(".scroll-down").css("display") == "none") {
                            $(".scroll-down").css("display", "block");
                        }
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

                console.log("DETAIL 8");

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

                    if (matches != null) {
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
                    }
                });

                $("#app-body .app-detail-container a").each(function (key, val) {
                    regExp = /(https?\:\/\/app\.jalantikus\.com\/(gadgets|tips|news|gokil)\/(.*?)(\/|$|\?)|\#)/gim;
                    value  = $(val).attr("href");

                    if (!value.match(regExp) && !$(this).hasClass("share") && !$(this).hasClass("scroll-button") && !$(this).hasClass("download-btn") && !$(this).hasClass("googleplay-btn")) {
                        $(this).attr("href", "#browser/" + encodeURIComponent(value));
                    }
                });

                setTimeout(function () {
                    if (_config.environment == "live") {
                        $("#iframe-jalantikus").prop("src", $("#iframe-jalantikus").data("src"));
                    }
                }, 2000);

                console.log("DETAIL 9");

                $("#iframe-jalantikus").on("load", function () {
                    $(".app-scroll-button").fadeIn();
                })

                /*
                 Preaload Banner Image
                 */
                if ($(".app-detail-header .header-image img").length > 0) {
                    var img = new Image();
                    img.src = $(".app-detail-header .header-image img").data("src");
                    $(img).on("load", img, function () {
                        $(".app-detail-header .header-image img")
                            .prop("src", $(".app-detail-header .header-image img").data("src"));
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

                $(".link-share a").on("click", function (e) {
                    e.preventDefault();
                    document.querySelector("#share-link").select();
                    document.execCommand('copy');

                    $(".app-refreshed").html("Link berhasil disalin").fadeIn();
                    setTimeout(function () {
                        $(".app-refreshed").fadeOut();
                    }, 2000);
                });

                $(".addon-gadgets .action-container").remove();
                $(".addon-gadgets a").on("click", function (e) {
                    e.preventDefault();
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

                if (window.sessionStorage.getItem(Backbone.history.getFragment() + "/scrollTop") != null) {
                    $(".app-detail-container")
                        .scrollTop(parseInt(window.sessionStorage.getItem(Backbone.history.getFragment() + "/scrollTop")));
                }

                console.log("DETAIL 10");
            },
            showOffline: function () {
                $(".app-refreshed").html("Tidak ada jaringan").fadeIn();
                setTimeout(function () {
                    $(".app-refreshed").fadeOut();
                }, 2000);
            },
            cleanup: function() {
                this.undelegateEvents();
            }
        });

        return articleDetailView;
    }
);