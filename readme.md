# trackdrive-optimizer.js

Track visitors to your landing pages with unique telephone numbers from https://trackdrive.net/.


## Usage

1. Include the trackdrive optimizer library on your page.

``` html
<script src="https://trackdrive.net/assets/trackdrive-optimizer.js"></script>
```

2. Wrap your telephone number with the `.trackdrive-number` css class.

```
<p>General Inquiries: <strong class="trackdrive-number">(855) 654 2938</strong></p>
```

3. Call the library with your optimizer token.

Your token can be obtained from one of your offers: https://trackdrive.net/offers

``` html
<script>
    jQuery(function () {
        Trackdrive.Optimizer.replace_numbers('f47c910d0b3429902ee69290009e36a4');
    });
</script>
```

Success! Your default telephone number will now be replaced with dynamic tracking numbers from Trackdrive.


