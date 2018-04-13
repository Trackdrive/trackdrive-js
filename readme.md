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
        Trackdrive.Optimizer.replace_numbers({token: 'f47c910d0b3429902ee69290009e36a4'});
    });
</script>
```

#### Success! Your default telephone number will now be replaced with dynamic tracking numbers from https://trackdrive.net/



## Advanced Options

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


``` html
<span class="trackdrive-number" data-hyperlink="true" data-text="Click To Call">
    <a href="tel:+18001231234">Click To Call</a>
</span>
```
