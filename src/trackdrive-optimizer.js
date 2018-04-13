/*
 * Trackdrive Optimizer
 * https://github.com/Trackdrive/trackdrive-optimizer
 *
 */
(function (context) {
    /* Possible options:
     *
     *  token:          [String]    The 32 character offer token.
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
        var default_token = options['token'];

        function initialize() {
            replace_all();
        }

        self.replace = function ($number) {
            // get 32 digit token
            var not_replaced = !$number.data('replaced');
            var token = get_token($number);
            // onwards
            if (token && not_replaced) {
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
                var promise = request_trackdrive_number(token, optional_tokens);
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

        function get_token($number) {
            var token = $number.data('token');
            // fallback to default token if this number does not have a token defined
            if (typeof(token) === 'undefined') {
                token = default_token;
            }
            if (typeof(token) === 'undefined' || token.length !== 32) {
                token = false;
            }
            return token;
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
                // update the DOM with the number
                var html = '';
                if (format === 'human') {
                    html = number.human_number;
                } else {
                    html = number.plain_number;
                }
                // wrap in link?
                if (link) {
                    // output custom text if given
                    if (typeof(text) !== 'undefined' && text.length > 0) {
                        html = text;
                    }
                    if ($number.is('a')) {
                        $number.attr('href', 'tel:' + number.plain_number.toString());
                    } else {
                        html = '<a href="tel:' + number.plain_number + '">' + html + '</a>';
                    }
                }
                $number.html(html);
            }
        }

        function request_trackdrive_number(token, optional_tokens) {
            if (typeof(optional_tokens) === 'undefined') {
                optional_tokens = {};
            }

            var referrer_url = Trackdrive.Base64.encode(window.location.href.toString());
            var referrer_tokens = Trackdrive.Base64.encode(TrackdrivejQuery.param(optional_tokens));

            var unique_key = token + referrer_url + referrer_tokens;

            if (typeof(Optimizer.ajax_requests[unique_key]) === 'undefined') {
                // add POST data
                var data = {
                    offer_key: token,
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
    Optimizer.version = '0.1.0';
    context.Optimizer = Optimizer;
})(window.Trackdrive);
