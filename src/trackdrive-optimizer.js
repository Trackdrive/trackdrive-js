/*
 * Trackdrive Optimizer
 * https://github.com/Trackdrive/trackdrive-optimizer
 *
 */
(function (context) {
    /* Possible options:
     *
     *  offer_token:    [String]    The 32 character offer token.
     *	context:        [jQuery]    Number replacement will be limited to the contents of this jQuery element. EG: $('#container-1')
     *
     *  selectors:      [Hash]      CSS selectors used by the plugin to select DOM elements.
     *  endpoints:      [Hash]      HTTP endpoints used by the plugin when making API requests.
     *
     */
    var Optimizer = function (options) {
        var $ = TrackdrivejQuery;
        var self = this;

        var default_options = {
            context: $('body'),
            selectors: {
                number: '.trackdrive-number'
            },
            endpoints: {
                numbers: 'https://api.trackdrive.net/api/v1/numbers.json'
            }
        };

        options = TrackdrivejQuery.extend(default_options, options);

        var selectors = options['selectors'];
        var endpoints = options['endpoints'];
        var default_token = options['offer_token'];

        function initialize() {
            replace_all();
        }

        self.replace = function ($number) {
            // get 32 digit token
            var not_replaced = !$number.data('replaced');
            var offer_token = get_offer_token($number);
            // onwards
            if (offer_token && not_replaced) {
                // hide the default number
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
                var promise = request_trackdrive_number(offer_token, optional_tokens);
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
                // only replace this number once
                $number.data('replaced', true);
            }
        };

        function replace_all() {
            find('number').each(function () {
                self.replace($(this));
            });
        }

        function get_offer_token($number) {
            var offer_token = $number.data('offerToken');
            // fallback to default token if this number does not have a token defined
            if (offer_token === null || typeof(offer_token) === 'undefined' || offer_token.length !== 32) {
                offer_token = default_token;
            }
            if (offer_token === null || typeof(offer_token) === 'undefined' || offer_token.length !== 32) {
                offer_token = false;
            }
            return offer_token;
        }

        function draw_number($number, data) {
            var link = $number.data('hyperlink');
            var text = $number.data('text');
            var format = $number.data('format'); // Format: human, plain
            // default format is human
            if (typeof(format) === 'undefined') {
                format = 'human';
            }
            // ensure a valid response was returned
            if (typeof(data) !== 'undefined' && typeof(data.number) !== 'undefined' && typeof(data.number.human_number) !== 'undefined') {
                var number = data.number;
                number.number = number.human_number;
                // update the DOM with the number
                var html = '';
                // output custom text if given
                if (text !== null && typeof(text) !== 'undefined' && text.length > 0) {
                    html = text;

                    // replace [number] with 800 123 1234
                    for (var key in number) {
                        var value = number[key];
                        console.log("[" + key + "]");
                        html = html.replace("[" + key + "]", value);
                    }
                } else if (format === 'human') {
                    html = number.human_number;
                } else {
                    html = number.plain_number;
                }
                // wrap in link?
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

        function request_trackdrive_number(offer_token, optional_tokens) {
            if (typeof(optional_tokens) === 'undefined') {
                optional_tokens = {};
            }

            var referrer_url = Trackdrive.Base64.encode(window.location.href.toString());
            var referrer_tokens = Trackdrive.Base64.encode(TrackdrivejQuery.param(optional_tokens));

            var unique_key = offer_token + referrer_url + referrer_tokens;

            if (typeof(Optimizer.ajax_requests[unique_key]) === 'undefined') {
                // add POST data
                var data = {
                    offer_key: offer_token,
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
    Optimizer.replace_numbers = function (options) {
        new Trackdrive.Optimizer(options);
    };
    Optimizer.version = '0.2.0';
    context.Optimizer = Optimizer;
})(window.Trackdrive);
