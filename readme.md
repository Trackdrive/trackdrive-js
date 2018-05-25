# trackdrive-optimizer.js

Track visitors to your landing pages with unique telephone numbers from https://trackdrive.net/

- [Basic Usage](https://github.com/Trackdrive/trackdrive-js/#basic-usage)
- [Google Analytics](https://github.com/Trackdrive/trackdrive-js/#google-analytics)
- [Advanced Usage](https://github.com/Trackdrive/trackdrive-js/#advanced-usage)


## Basic Usage

#### 1. Include the trackdrive optimizer library on your page.

``` html
<script src="https://trackdrive.net/assets/trackdrive-optimizer.js"></script>
```

#### 2. Put some numbers on your page

``` html

<h1>(855) 654 2938</h1>

<p>Click this number to call now: <a href="tel:+18556542938">+18556542938</a></p>

```

#### 3. Call the library with your optimizer token.

Your token can be obtained from one of your offers: https://trackdrive.net/offers

[View Example Page](https://github.com/Trackdrive/trackdrive-js/blob/master/examples/1-basic_example.html)

``` html
<script>
    var options = {
        // Your token from https://trackdrive.net/offers
        offer_token: 'xyz'
    };

    // Each occurrence of (855) 654 2938 and +18556542938 on your HTML page will be replaced with a Trackdrive tracking number.
    Trackdrive.Optimizer.replace_all(options, [
      ['(855) 654 2938', 'human_number'],
      ['+18556542938', 'plain_number']
    ]);
</script>
```

#### Success! Your default telephone number will now be replaced with dynamic tracking numbers from https://trackdrive.net/



## Google Analytics

Automatically track the google analytics clientId by setting `track_ga_client_id: true`. For example:

``` html
<script>
    TrackdrivejQuery(function () {
        Trackdrive.Optimizer.replace_numbers({
          offer_token: 'f47c910d0b3429902ee69290009e36a4',
          track_ga_client_id: true
        });
    });
</script>
```



## Advanced Usage

The options available to `Trackdrive.Optimizer.replace_numbers(options)` and `new Trackdrive.Optimizer(options)`

parameter | type | example | description
--- | --- | --- | ---
offer_token | String | '770a968e44ef341b3611c4d67619dae8' | The 32 character offer token.
default_number | Hash | {plain_number: "+18886024660", human_number: "(888) 602-4660"} | The default number that will be used if tracking is unavailable
tokens | Hash | {lp: "loan1"} | Tokens that will be tracked.
track_ga_client_id | Boolean | true | Enable automatically tracking the Google Analytics ClientID.
context | jQuery | $('#container') | Number replacement will be limited to the contents of this jQuery element.
cookies | Boolean | false | Enable/disable storing retrieved numbers in visitor's cookies.
cookies_expires | Integer | 1 | The number of days number cookies will persist before expiring. Default: 1
done | function | function($number, data){ console.log($number, data); } | Callback function called after each number is drawn.
selectors | Hash | {number: '.number'} | CSS selectors used by the plugin to select DOM elements.
endpoints | Hash | {numbers: 'https://custom-domain.com/api/v1/numbers.json'} | HTTP endpoints used by the plugin when making API requests.


### Trackdrive.Optimizer#request_number

Request a number getting back JSON, using the optimizer javascript api.

``` javascript

// requesting a number returning JSON
var api = new Trackdrive.Optimizer({
  track_ga_client_id: true,
  default_number: {
    plain_number: "+18886024660",
    human_number: "(888) 602-4660"
  }
});

// optional tokens that will be tracked by your numbers
// these values are tracked in addition to whatever url params you have defined on your offer.
var optional_tokens = {
  s1: 'kittens'
};

// get back a promise
var promise = api.request_number(offer_token, optional_tokens);

// once the trackdrive api responds, this promise will fire
promise.always(function(data){

  // assign the human number to a variable. EG: "(866) 230-0823"
  var human_number = data.number.human_number;

  // assign the plain number to a variable. EG: "+18662300823"
  var plain_number = data.number.plain_number;

  // Write the number to the page into a element with the class trackdrive-custom-number
  TrackdrivejQuery('.trackdrive-custom-number').html(number);

});

```

### Trackdrive.Optimizer#request_number Example API Response

``` json
{
  "number": {
    "id": 11270,
    "plain_number": "+18662222644",
    "extension": null,
    "checksum": "e86aa058616b3b94157c4d5ac304c880",
    "human_number": "(866) 222-2644"
  }
}
```
