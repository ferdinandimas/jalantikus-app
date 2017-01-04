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
        ripple   : function (t, e, sp) {
            e.preventDefault();
            var _speed = [300, 100];
            var _currItem = t;
            var _href     = t.attr("href");
            var _ripple   = $(_currItem.children()[ 0 ]);
            var rX        = e.offsetX - 225, rY = e.offsetY - 225;
            if(typeof sp != "undefined")
            {
                switch(sp){
                    case "slow":
                        _speed[0] = 600;
                        _speed[1] = 200;
                        break;
                    default:
                        _speed[0] = 300;
                        _speed[1] = 100;
                        break;
                }
            }
            if (!_currItem.hasClass("fadedin") && !_currItem.hasClass("fadedout")) {
                _ripple.css('top', rY);
                _ripple.css('left', rX);
                _currItem.addClass("fadedin");
                var fdCurr = setTimeout(function () {
                    _currItem.addClass("fadedout");
                    clearTimeout(fdCurr);
                    var fdFd = setTimeout(function () {
                        _currItem.removeClass("fadedin");
                        _currItem.removeClass("fadedout");
                        clearTimeout(fdFd);
                        $(_currItem).data("complete", true);
                        window.stop();
                        window.location.href = _config.baseURL + _href;

                    }, _speed[1])
                }, _speed[0])
            }
        },
        isOffline: function () {
            return 'onLine' in navigator && !navigator.onLine;
        },
        timeSince: function (date, type) {
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

                    if (type == "fullMonth") {
                        month[ 0 ]  = "Januari";
                        month[ 1 ]  = "Februari";
                        month[ 2 ]  = "Maret";
                        month[ 3 ]  = "April";
                        month[ 4 ]  = "Mei";
                        month[ 5 ]  = "Juni";
                        month[ 6 ]  = "Juli";
                        month[ 7 ]  = "Agustus";
                        month[ 8 ]  = "September";
                        month[ 9 ]  = "Oktober";
                        month[ 10 ] = "November";
                        month[ 11 ] = "Desember";
                    }
                    else {
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
                    }

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