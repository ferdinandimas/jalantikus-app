/*
 jt-lib.js for storing global level functions
 */
var jt = function () {
    return {
        log      : function (_text) {
            if (_config.environment == 'dev') {
                console.log(_text);
            }
        },
        ripple   : function (t, e) {
            var currItem = t;
            var ripple   = $(currItem.children()[ 0 ]);
            var rX       = e.offsetX - 225, rY = e.offsetY - 225;
            if (!currItem.hasClass("active") && !currItem.hasClass("faded")) {
                ripple.css('top', rY);
                ripple.css('left', rX);
                currItem.addClass("active");
                var fdCurr = setTimeout(function () {
                    currItem.addClass("faded");
                    clearTimeout(fdCurr);
                    var fdFd = setTimeout(function () {
                        currItem.removeClass("active");
                        currItem.removeClass("faded");
                        clearTimeout(fdFd);
                    }, 100)
                }, 300)
            }
        },
        isOffline : function () {
            //return 'onLine' in navigator && !navigator.onLine;
            return false;
        },
        timeSince: function (date) {
            if (typeof date !== 'object') {
                date = new Date(date);
            }

            var seconds = Math.floor((new Date() - date) / 1000);
            var intervalType, realDate;

            var interval = Math.floor(seconds / 31536000);
            if (interval >= 1) {
                intervalType = 'tahun';
            }
            else {
                interval = Math.floor(seconds / 2592000);
                if (interval >= 1) {
                    var month   = new Array();
                    month[ 0 ]  = "Jan";
                    month[ 1 ]  = "Feb";
                    month[ 2 ]  = "Mar";
                    month[ 3 ]  = "Apr";
                    month[ 4 ]  = "Mei";
                    month[ 5 ]  = "Jun";
                    month[ 6 ]  = "Jul";
                    month[ 7 ]  = "Agu";
                    month[ 8 ]  = "Sept";
                    month[ 9 ]  = "Okt";
                    month[ 10 ] = "Nov";
                    month[ 11 ] = "Des";

                    realDate = (new Date(date));
                    realDate = realDate.getDate() + " " + month[ (realDate.getMonth()) ] + " " + realDate.getFullYear();
                }
                else {
                    interval = Math.floor(seconds / 86400);
                    if (interval >= 1) {
                        intervalType = 'hari';
                    }
                    else {
                        interval = Math.floor(seconds / 3600);
                        if (interval >= 1) {
                            intervalType = "jam";
                        }
                        else {
                            interval = Math.floor(seconds / 60);
                            if (interval >= 1) {
                                intervalType = "menit";
                            }
                            else {
                                interval     = seconds;
                                intervalType = "detik";
                            }
                        }
                    }
                }
            }

            if (realDate != null) {
                return realDate;
            }
            else {
                return interval + " " + intervalType + " yang lalu";
            }
        }
    }
}
var jt = jt();