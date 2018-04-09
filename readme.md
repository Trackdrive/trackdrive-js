# trackdrive-optimizer.js

Track visitors to your landing pages with unique telephone numbers from https://trackdrive.net/


## Usage

#### 1. Include the trackdrive optimizer library on your page.

``` html
<script src="https://trackdrive.net/assets/trackdrive-optimizer.js"></script>
```

#### 2. Wrap your telephone number with the `.trackdrive-number` css class.

```
<span class="trackdrive-number">(855) 654 2938</span>
```

#### 3. Call the library with your optimizer token.

Your token can be obtained from one of your offers: https://trackdrive.net/offers

``` html
<script>
    jQuery(function () {
        Trackdrive.Optimizer.replace_numbers('f47c910d0b3429902ee69290009e36a4');
    });
</script>
```

#### Success! Your default telephone number will now be replaced with dynamic tracking numbers from https://trackdrive.net/



## Advanced Options

### Additional Tracking Tokens

Additional tokens can be passed by setting the html attribute `data-tokens`


``` html
<span class="trackdrive-number" data-tokens='{"interest":"loans"}'>(855) 654 2938</span>
```


### Number Format

The format for the displayed number can be changed by setting `data-format`

**plain**  +18001231234

**human**  (800) 123-1234


``` html
<span class="trackdrive-number" data-format="plain">+18556542938</span>
```

