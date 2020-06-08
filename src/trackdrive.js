if (typeof(window.Trackdrive) === 'undefined') {
    window.Trackdrive = {

        replace_text: function (search_string, replace_string, context) {
            if (!context) {
                context = document.body;
            }
            TrackdrivejQuery(context).contents().each(function () {
                if (this.nodeType === Node.TEXT_NODE) {
                    var r = new RegExp(search_string, 'gi');

                    if (this.textContent.match(r)) {
                        this.textContent = this.textContent.replace(r, replace_string);
                    }

                } else {
                    Trackdrive.replace_text(search_string, replace_string, this);
                }
            });

        },

        replace_hrefs: function (search_string, replace_string, context) {
            if (!context) {
                context = document.body;
            }
            TrackdrivejQuery(context).find('a').each(function () {
                var href = TrackdrivejQuery(this).attr('href');
                if (typeof(href) !== 'undefined') {
                    var r = new RegExp(search_string, 'gi');
                    href = href.replace(r, replace_string);
                    TrackdrivejQuery(this).attr('href', href);
                }
            });
        },

        escapeRegExp: function (text) {
            return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
        },

        reformat_number: function (number, format) {
            var output = number;
            var d = number.replace(/\D/g, '').split('');

            if (format === 'dashed') {
                if (d[0] === '1') {
                    d.shift();
                }
                output = d[0] + d[1] + d[2] + '-' + d[3] + d[4] + d[5] + '-' + d[6] + d[7] + d[8] + d[9];

            } else if (format === 'dotted') {
                if (d[0] === '1') {
                    d.shift();
                }
                output = d[0] + d[1] + d[2] + '.' + d[3] + d[4] + d[5] + '.' + d[6] + d[7] + d[8] + d[9];

            }  else if (format === 'human') {
                if (d[0] === '1') {
                    d.shift();
                }
                output = '(' + d[0] + d[1] + d[2] + ') ' + d[3] + d[4] + d[5] + '-' + d[6] + d[7] + d[8] + d[9];

            } else {
                if (d[0] !== '1') {
                    d.unshift('1');
                }

                output = '+' + d.join('');
            }
            return output;
        }

    };
}