define(
    [
        "underscore",
        "backbone",
        "jquery",
        "models/article",
        "text!views/article_layout.html",
        "text!views/header_detail_layout.html",
        "prettify"
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
                var tooltip=false;

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
                $(".prettify-copy-selected").on("touchend click", function(e) {
                    document.execCommand('copy');
                    validateTooltip(e)
                })

                $(".prettify-copy-all").on("touchend click", function(e) {
                    _el     = $(this).parent().parent();
                    _result = "";
                    $(_el).find("li").each(function(obj, val) {
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
                })

                function validateTooltip(e)
                {
                    if(!tooltip)
                    {
                        tooltip=true;
                        var q = "<div class='prettify-tooltip'>Berhasil disalin</div>"
                        var posX = e.clientX;
                        var posY = e.clientY;
                        $(e.target).append(q);
                        $('.prettify-tooltip').slideDown(300,function(){});
                        var w = $(e.target).innerWidth();
                        var fw = (100-w)/2
                        if(fw>0)
                        {
                            $('.prettify-tooltip').css('left',(fw*-1));
                        }
                        else
                        {
                            $('.prettify-tooltip').css('left',fw);
                        }
                        var td = setInterval(function(){
                            tooltip=false;
                            clearInterval(td);
                            $('.prettify-tooltip').slideUp(300,function(){
                                $(this).remove();
                            })
                        }, 2000)
                    }
                }

                function decodeHtml(html) {
                    var txt = document.createElement("textarea");
                    txt.innerHTML = html;
                    return txt.value;
                }
                
                $(".prettyprint").each(function(key, value)
                {
                    $(this).text(decodeHtml($(this).text()));
                })

                PR.prettyPrint();
            }
        });

        return homeView;
    }
);