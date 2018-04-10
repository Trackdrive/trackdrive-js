/*
 * Trackdrive Optimizer
 * https://github.com/Trackdrive/trackdrive-optimizer
 *
 */
(function (context) {
    /* Possible options:
     *
     *	context:        jQuery element to scope the number replacement to this context. EG: $('#container-1')
     *
     */
    var Optimizer = function (offer_key, options) {
        var $ = TrackdrivejQuery;
        var self = this;

        if (typeof(options) === 'undefined') {
            options = {}
        }

        if (typeof(options.context) === 'undefined') {
            options.context = $('body');
        }

        var selectors = {
            number: '.trackdrive-number'
        };

        var endpoints = {
            numbers: 'https://api.trackdrive.net/api/v1/numbers.json'

        };

        function initialize() {
            if (typeof(offer_key) !== 'undefined' && offer_key.length === 32) {
                show_trackdrive_numbers();
            } else {
                console.error('Trackdrive.Optimizer The offer_key you entered is not valid! Expected to receive a 32 character string.');
            }
        }

        function show_trackdrive_numbers() {
            find('number').each(function () {
                // the .trackdrive-number DOM element
                var $number = $(this);
                $number.hide();
                // Get additional optional tokens from the DOM element.
                //
                // For example, give the following HTML:
                //      <strong class="trackdrive-number" data-tokens='{"interest":"loans"}'>
                //
                // The resulting optional tokens would be:
                //      {"interest":"loans"}
                //
                var optional_tokens = $number.data('tokens');
                // Request the number
                var promise = request_trackdrive_number(optional_tokens);
                // Wait for the server to respond
                promise.always(function () {
                    $number.show();
                });
                promise.done(function (data) {
                    draw_number($number, data);
                });
                // always show the number after 5 seconds in case something goes wrong
                setTimeout(function () {
                    $number.show();
                }, 5000);
            });
        }

        function draw_number($number, data) {
            var link = $number.data('hyperlink');
            // The number format that will be outputted. Either 'human' or 'plain'
            var format = $number.data('format');
            if (typeof(format) === 'undefined') {
                format = 'human';
            }
            if (typeof(data) !== 'undefined' && typeof(data.number) !== 'undefined' && typeof(data.number.human_number) !== 'undefined') {
                var number = data.number;
                // update the DOM with the number
                var html = '';
                if (format === 'human') {
                    html = number.human_number;
                } else {
                    html = number.plain_number;
                }
                if (link) {
                    if ($number.is('a')) {
                        $number.attr('href', 'tel:' + number.plain_number.toString());
                    } else {
                        html = '<a href="tel:' + number.plain_number + '">' + html + '</a>';
                    }
                }
                $number.html(html);
            }
        }

        function request_trackdrive_number(optional_tokens) {
            if (typeof(optional_tokens) === 'undefined') {
                optional_tokens = {};
            }

            var referrer_url = Trackdrive.Base64.encode(window.location.href.toString());
            var referrer_tokens = Trackdrive.Base64.encode(TrackdrivejQuery.param(optional_tokens));

            var unique_key = offer_key + referrer_url + referrer_tokens;

            if (typeof(Optimizer.ajax_requests[unique_key]) === 'undefined') {
                // add POST data
                var data = {
                    offer_key: offer_key,
                    referrer_url: referrer_url,
                    referrer_tokens: referrer_tokens,
                    td_js_v: Trackdrive.Optimizer.version
                };

                Optimizer.ajax_requests[unique_key] = TrackdrivejQuery.ajax({
                    url: endpoints.numbers,
                    data: data
                })
            }

            return Optimizer.ajax_requests[unique_key];
        }

        function find(key) {
            return options.context.find(selectors[key]);
        }

        initialize();
    };
    // global ajax requests
    Optimizer.ajax_requests = {};
    Optimizer.replace_numbers = function (offer_key, options) {
        new Trackdrive.Optimizer(offer_key, options);
    };
    Optimizer.version = '0.1.0';
    context.Optimizer = Optimizer;
})(window.Trackdrive);
