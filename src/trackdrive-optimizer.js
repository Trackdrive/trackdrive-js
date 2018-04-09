/*
 * Trackdrive Optimizer
 * https://github.com/Trackdrive/trackdrive-optimizer
 *
 */
(function (context) {
    var Optimizer = function (offer_key, options) {
        var self = this;

        if (typeof(options) === 'undefined') {
            options = {}
        }

        if (typeof(options.context) === 'undefined') {
            options.context = jQuery('body');
        }

        var selectors = {
            number: '.trackdrive-number'
        };

        var endpoints = {
            numbers: 'https://api.trackdrive.net/api/v1/numbers.json'

        };

        var ajax_requests = {};

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

                // Get additional optional tokens from the DOM element.
                //
                // For example, give the following HTML:
                //      <strong class="trackdrive-number" data-tokens='{"interest":"loans"}'>
                //
                // The resulting optional tokens would be:
                //      {"interest":"loans"}
                //
                var optional_tokens = $number.data('tokens');

                // The number format that will be outputted. Either 'human' or 'plain'
                var format = $number.data('format');
                if (typeof(format) === 'undefined') {
                    format = 'human';
                }
                // Request the number
                var promise = request_trackdrive_number(optional_tokens);
                // Wait for the server to respond
                promise.done(function (data) {
                    if (typeof(data) !== 'undefined' && typeof(data.number) !== 'undefined' && typeof(data.number.human_number) !== 'undefined') {
                        // update the DOM with the number
                        if (format === 'human') {
                            $number.html(data.number.human_number);
                        } else {
                            $number.html(data.number.plain_number);
                        }
                    }
                });
            });
        }

        function request_trackdrive_number(optional_tokens) {
            if (typeof(optional_tokens) === 'undefined') {
                optional_tokens = {};
            }

            var referrer_url = Trackdrive.Base64.encode(window.location.href.toString());
            var referrer_tokens = Trackdrive.Base64.encode(jQuery.param(optional_tokens));

            var unique_key = offer_key + referrer_url + referrer_tokens;

            if (typeof(ajax_requests[unique_key]) === 'undefined') {
                // add POST data
                var data = {
                    offer_key: offer_key,
                    referrer_url: referrer_url,
                    referrer_tokens: referrer_tokens,
                    td_js_v: Trackdrive.Optimizer.version
                };

                ajax_requests[unique_key] = jQuery.ajax({
                    url: endpoints.numbers,
                    data: data
                })
            }

            return ajax_requests[unique_key];
        }

        function find(key) {
            return options.context.find(selectors[key]);
        }

        initialize();
    };
    Optimizer.replace_numbers = function (offer_key, options) {
        new Trackdrive.Optimizer(offer_key, options);
    };
    Optimizer.version = '0.1.0';
    context.Optimizer = Optimizer;
})(window.Trackdrive);
