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

        var default_options = {
            context: $('body'),
            track_ga_client_id: false,
            cookies: false, // whether to store numbers in cookies
            cookies_expires: 1 / 240, // numbers stored in cookies expire after 6 minutes
            selectors: {
                number: '.trackdrive-number'
            },
            endpoints: {
                numbers: 'https://api.trackdrive.net/api/v1/numbers.json'
            },
            tokens: {}
        };

        options = TrackdrivejQuery.extend(default_options, options);

        var selectors = options['selectors'];
        var endpoints = options['endpoints'];
        var default_token = options['offer_token'];

        self.replace_numbers = function () {
            if (find('number').length <= 0) {
                console.warn('Trackdrive Optimizer did not find any DOM elements matching: ' + selectors.number);
            } else {
                find('number').each(function () {
                    self.replace($(this));
                });
            }
        };

        self.request_number = function (offer_token, optional_tokens) {
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
                promise.always(function (data) {
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

            // use server response if present
            if (typeof(data) !== 'undefined' && typeof(data.number) !== 'undefined' && typeof(data.number.human_number) !== 'undefined') {
                var number = data.number;
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

        function request_trackdrive_number(offer_token, more_tokens) {
            var output;

            var optional_tokens = $.extend({}, options.tokens);

            if (typeof(more_tokens) !== 'undefined') {
                optional_tokens = $.extend(optional_tokens, more_tokens);
            }

            if (typeof(options.ga_tracker) !== 'undefined') {
                optional_tokens.ga_client_id = options.ga_tracker.get('clientId');
            }

            var referrer_url = Trackdrive.Base64.encode(window.location.href.toString());
            var referrer_tokens = Trackdrive.Base64.encode(TrackdrivejQuery.param(optional_tokens));

            var unique_key = offer_token + referrer_url + referrer_tokens;
            // if cookies are enabled, try to get a matching number from the visitor's cookies
            if (options.cookies) {
                output = get_local_trackdrive_number(unique_key);
            }
            // fallback to making a server request
            if (typeof(output) === 'undefined' || output === false) {
                if (typeof(Optimizer.ajax_requests[unique_key]) === 'undefined') {

                    var default_number;

                    if (typeof(options.default_number) !== 'undefined') {
                        if (typeof(options.default_number.plain_number) !== 'undefined') {
                            default_number = options.default_number.plain_number;
                        } else if (typeof(options.default_number.human_number) !== 'undefined') {
                            default_number = options.default_number.human_number;
                        }
                    }
                    // add POST data
                    var data = {
                        offer_key: offer_token,
                        referrer_url: referrer_url,
                        referrer_tokens: referrer_tokens,
                        td_js_v: Trackdrive.Optimizer.version,
                        default_number: default_number
                    };

                    var request_handler = TrackdrivejQuery.ajax({
                        url: endpoints.numbers,
                        data: data,
                        timeout: 3000,
                        xhrFields: { withCredentials: true }
                    });

                    var deferred_handler = $.Deferred();

                    request_handler.always(function (data) {
                        // invalid response?
                        if (typeof(data) === 'undefined' || typeof(data.number) === 'undefined' || typeof(data.number.human_number) === 'undefined') {
                            // inject the default if present and missing in server response
                            if (typeof(options.default_number) !== 'undefined') {
                                data = {number: options.default_number};
                            }
                        }
                        data.number.dashed_number = Trackdrive.reformat_number(data.number.plain_number, 'dashed');
                        // pass it up the chain
                        deferred_handler.resolve(data);
                    });

                    // return the callback
                    Optimizer.ajax_requests[unique_key] = deferred_handler.promise();

                    // write the data to a cookie
                    Optimizer.ajax_requests[unique_key].done(function (data) {
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
            if (typeof(raw_data) !== 'undefined') {
                var data = $.parseJSON(raw_data);
                // ensure the data is valid
                if (data !== null && typeof(data) !== 'undefined' && typeof(data.number) !== 'undefined' && typeof(data.number.human_number) !== 'undefined') {
                    var deferred_handler = $.Deferred();
                    // resolve the promise in 5ms
                    setTimeout(function () {
                        deferred_handler.resolve(data);
                    }, 5);
                    // return the promise that exposes done
                    output = deferred_handler.promise();
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

    };

    Optimizer.ajax_requests = {};

    Optimizer.ready = function (options, callback) {
        TrackdrivejQuery(function () {
            if (options.track_ga_client_id && typeof(window.ga) === 'function') {
                // then delay initializing until GA has loaded
                ga(function (tracker) {
                    options.ga_tracker = tracker;
                    callback();
                });
            } else {
                callback();
            }
        });
    };

    Optimizer.replace_all = function (options, replacements) {
        Trackdrive.Optimizer.ready(options, function () {
            var api = new Trackdrive.Optimizer(options);
            var promise = api.request_number(options.offer_token);
            promise.always(function (data) {

                for (var i = 0; i < replacements.length; i++) {
                    var replacement = replacements[i];

                    var raw_search = replacement[0];
                    var method_name = replacement[1];

                    var search = Trackdrive.escapeRegExp(raw_search);
                    Trackdrive.replace_text(search, data.number[method_name]);
                    Trackdrive.replace_hrefs(search, data.number[method_name]);
                }
            });
        });
    };

    Optimizer.quick_replace = function (options, number) {
        Trackdrive.Optimizer.ready(options, function () {
            // Request tracking
            var api = new Trackdrive.Optimizer(options);
            var promise = api.request_number(options.offer_token);
            promise.always(function (data) {
                var plain = Trackdrive.reformat_number(number, 'plain');

                if (plain.length === 12) {
                    // replace each known number format
                    var formats = {
                        plain_number: Trackdrive.reformat_number(number, 'plain'),
                        dashed_number: Trackdrive.reformat_number(number, 'dashed'),
                        human_number: plain
                    };
                }

                for (var method_name in formats) {
                    var format = formats[method_name];
                    var search_string = Trackdrive.escapeRegExp(format);

                    Trackdrive.replace_text(search_string, data.number[method_name]);
                    Trackdrive.replace_hrefs(search_string, data.number[method_name]);
                }

                // replace what they originally sent in
                var search = Trackdrive.escapeRegExp(number);
                Trackdrive.replace_text(search, data.number['human_number']);
                Trackdrive.replace_hrefs(search, data.number['human_number']);
            });
        });
    };

    Optimizer.replace_numbers = function (options) {
        Trackdrive.Optimizer.ready(options, function () {
            var api = new Trackdrive.Optimizer(options);
            api.replace_numbers();
        });
    };
    Optimizer.version = '0.3.6';
    context.Optimizer = Optimizer;
})(window.Trackdrive);
