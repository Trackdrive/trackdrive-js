# trackdrive-optimizer.js

Track visitors to your landing pages with unique telephone numbers from https://trackdrive.net/

- [Basic Usage](https://github.com/Trackdrive/trackdrive-js/#basic-usage)
- [Basic Options](https://github.com/Trackdrive/trackdrive-js/#basic-options)
- [Google Analytics](https://github.com/Trackdrive/trackdrive-js/#google-analytics)
- [Advanced Usage](https://github.com/Trackdrive/trackdrive-js/#advanced-usage)


## Basic Usage

#### 1. Include the trackdrive optimizer library on your page.

``` html
<script src="https://trackdrive.net/assets/trackdrive-optimizer.js"></script>
```

#### 2. Wrap your telephone number with the `.trackdrive-number` css class.

``` html
<span class="trackdrive-number">(855) 654 2938</span>
```

#### 3. Call the library with your optimizer token.

Your token can be obtained from one of your offers: https://trackdrive.net/offers

``` html
<script>
    TrackdrivejQuery(function () {
        Trackdrive.Optimizer.replace_numbers({offer_token: 'f47c910d0b3429902ee69290009e36a4'});
    });
</script>
```

#### Success! Your default telephone number will now be replaced with dynamic tracking numbers from https://trackdrive.net/



## Basic Options

### data-offer-token

The offer token can be set on each individual number. This allows you to track many different offers on the same page.


``` html
<span class="trackdrive-number" data-offer-token='770a968e44ef341b3611c4d67619dae8'>(855) 654 2938</span>
```


### data-tokens

Additional tokens can be passed by setting the html attribute `data-tokens` with JSON data.


``` html
<span class="trackdrive-number" data-tokens='{"interest":"loans"}'>(855) 654 2938</span>
```



### data-format

The format for the displayed number can be changed by setting `data-format`

value | example
--- | ---
plain | +18001231234
human | (800) 123-1234


``` html
<span class="trackdrive-number" data-format="human">(800) 123-1234</span>
<span class="trackdrive-number" data-format="plain">+18556542938</span>
```


### data-hyperlink

The resulting number can be displayed as a link by setting `data-hyperlink="true"`


``` html
<span class="trackdrive-number" data-hyperlink="true">
    <a href="tel:+18001231234">(800) 123-1234</a>
</span>
```



### data-text

Output specific text instead of a number.


input | output
--- | ---
`data-text="Click To Call" data-hyperlink="true"` | `<a href="tel:+18558797917">Click To Call</a>`
`data-text="<button>Click here to call [human_number]</button>"` | `<button>Click here to call (855) 879-7917</button>`


## Google Analytics

Automatically track the google analytics clientId by setting `track_ga_client_id: true`. For example:

``` html
<script>
    TrackdrivejQuery(function () {
        Trackdrive.Optimizer.replace_numbers({
          offer_token: 'f47c910d0b3429902ee69290009e36a4',
          track_ga_client_id: true,
          default: {
            plain_number: "+18886024660",
            human_number: "(888) 602-4660"
          }
        });
    });
</script>
```



## Advanced Usage

The options available to `Trackdrive.Optimizer.replace_numbers(options)` and `new Trackdrive.Optimizer(options)`

parameter | type | example | description
--- | --- | --- | ---
offer_token | String | '770a968e44ef341b3611c4d67619dae8' | The 32 character offer token.
default | Hash | {plain_number: "+18886024660", human_number: "(888) 602-4660"} | The default number that will be used if tracking is unavailable
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
  default: {
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
promise.done(function(data){

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
