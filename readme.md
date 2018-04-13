# trackdrive-optimizer.js

Track visitors to your landing pages with unique telephone numbers from https://trackdrive.net/


## Usage

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



## Advanced Options

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
``` html <span class="trackdrive-number" data-hyperlink="true" data-text="Click To Call">(855) 654 2938</span>` | `<div class="trackdrive-number" ><a href="tel:+18558797917">Click To Call</a></div>`
`<div class="trackdrive-number" data-text="<a href='tel:[plain_number]'>Click here to call [human_number]</a>">(855) 654 2938</div>` | `<div class="trackdrive-number" ><a href="tel:+18558797917">Click here to call (855) 879-7917</a></div>`

## Javascript Options

The options available to `Trackdrive.Optimizer.replace_numbers(options)`

``` javascript

var options = {
  offer_token: offer_token,
  done: done
};

Trackdrive.Optimizer.replace_numbers(options);

```

parameter | type | example | description
--- | --- | --- | ---
offer_token | String | '770a968e44ef341b3611c4d67619dae8' | The 32 character offer token.
context | jQuery | $('#container') | Number replacement will be limited to the contents of this jQuery element.
done | function | function($number, data){ console.log($number, data); } | Callback function called after each number is drawn.
selectors | Hash | {number: '.number'} | CSS selectors used by the plugin to select DOM elements.
endpoints | Hash | {numbers: 'https://custom-domain.com/api/v1/numbers.json'} | HTTP endpoints used by the plugin when making API requests.
