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
     *	done:           [function]  Callback function called after each number is drawn. EG: done: function($number, data){ console.log($number, data); }
     *
     *  selectors:      [Hash]      CSS selectors used by the plugin to select DOM elements.
     *  endpoints:      [Hash]      HTTP endpoints used by the plugin when making API requests.
     *
     */
    var Optimizer = function (options) {
        var $ = TrackdrivejQuery;
        var self = this;

        var ga_tracker;

        var default_options = {
            context: $('body'),
            track_ga_client_id: false,
            cookies: false, // whether to store numbers in cookies
            cookies_expires: 1/240, // numbers stored in cookies expire after 6 minutes
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

        self.request_number = function(offer_token, optional_tokens) {
            var promise = request_trackdrive_number(offer_token, optional_tokens);
            return promise;
        };

        self.replace = function ($number) {
            // get 32 digit token
            var not_replaced = !$number.data('replaced');
            var offer_token = get_offer_token($number);
            // onwards
            if (offer_token && not_replaced) {
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

                    if (typeof(options.done) === 'function') {
                        options.done($number, data);
                    }
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
            if (offer_token === null || typeof(offer_token) === 'undefined') {
                offer_token = default_token;
            }
            if (offer_token === null || typeof(offer_token) === 'undefined') {
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
            var output;

            if (typeof(optional_tokens) === 'undefined') {
                optional_tokens = {};
            }

            if (options.track_ga_client_id && typeof(ga_tracker) !== 'undefined' && ga_tracker !== null){
                optional_tokens.ga_client_id = ga_tracker.get('clientId');
            }

            var referrer_url = Trackdrive.Base64.encode(window.location.href.toString());
            var referrer_tokens = Trackdrive.Base64.encode(TrackdrivejQuery.param(optional_tokens));


            var unique_key = offer_token + referrer_url + referrer_tokens;
            // if cookies are enabled, try to get a matching number from the visitor's cookies
            if (options.cookies){
                output = get_local_trackdrive_number(unique_key);
            }
            // fallback to making a server request
            if (typeof(output) === 'undefined' || output === false){
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
                    });

                    // write the data to a cookie
                    Optimizer.ajax_requests[unique_key].done(function(data) {
                        set_local_trackdrive_number(unique_key, data);
                    });

                }
                output = Optimizer.ajax_requests[unique_key];
            }
            return output;
        }

        function get_local_trackdrive_number(unique_key) {
            var unique_key_md5 = Crypto.MD5(unique_key);
            var raw_data = Cookies.get(unique_key_md5);
            var output = false;
            if (typeof(raw_data) !== 'undefined'){
                var data = $.parseJSON(raw_data);
                // ensure the data is valid
                if (data !== null && typeof(data) !== 'undefined' && typeof(data.number) !== 'undefined' && typeof(data.number.human_number) !== 'undefined') {
                    var dfd = $.Deferred();
                    // resolve the promise in 10ms
                    setTimeout(function() {
                        dfd.resolve(data);
                    }, 10);
                    // return the promise that exposes done
                    output = dfd.promise();
                }
            } 
            return output;
        }

        function set_local_trackdrive_number(unique_key, data) {
            var unique_key_md5 = Crypto.MD5(unique_key);
            var json_data = $.toJSON(data);
            // write the cookie
            Cookies.set(unique_key_md5, json_data, {expires: options.cookies_expires});
        }

        function find(key) {
            return options.context.find(selectors[key]);
        }

        // are we integrating with GA?
        if (options.track_ga_client_id && typeof(ga) === 'function'){
            // then delay initializing until GA has loaded
            ga(function(tracker) {
                // grab a reference to the GA tracker
                ga_tracker = tracker;
                // onwards
                initialize();
            });
        } else {
            // load normally
            initialize();
        }
        
    };
    // global ajax requests
    Optimizer.ajax_requests = {};
    Optimizer.replace_numbers = function (options) {
        new Trackdrive.Optimizer(options);
    };
    Optimizer.version = '0.3.4';
    context.Optimizer = Optimizer;
})(window.Trackdrive);
