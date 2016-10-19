define(
    [
        "underscore",
        "backbone",
        "jquery",
        "text!app/views/timeline_template.html",
        "app/models/homeModel"
    ],
    function (_, Backbone, $, timelineTemplate, homeCollection) {
        var homeView = Backbone.View.extend({
            template: _.template(timelineTemplate),
            model   : new homeCollection(),
            initialize: function () {
                this.model.renderTimeline();

                _data = this.model.toJSON();

                $("#app-body .app-content-container").empty();
                $("#app-body .app-content-container").append(this.template({
                    timelineArticle: _data
                })).append('<div class="app-loader"><div class="app-load"></div></div>');
            }
        });

        return homeView;
    }
);