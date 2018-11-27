# jQuery.Thumb

Process thumbnails in-browser.

This plugin generates thumbnails automatically for `input` items, cropping the images on-the-fly to show a preview right into the client. No upload required.

[Live demo and documentation](https://biohzrdmx.github.io/jQuery.Thumb/)

## Installing

Just download `jquery.thumb.js` then add it to your HTML file:

```html
<script type="text/javascript" src="js/jquery.thumb.js"></script>
```

You may instead use the minified version if you like.

## Basic usage

You'll need an `input` with a `type="file"` attribute:

```html
<input type="file" name="file" id="file" class="js-thumb">
```

Also you'll need a preview area, it may have a placeholder image if you want:

```html
<div class="js-preview">
  <img src="https://via.placeholder.com/150" alt="">
</div>
```

Then just call the plugin this way:

```html
$('.js-thumb').thumb({
  width: 150,
  height: 150,
  center: true,
  preview: '.js-preview'
});
```

You may pass the following options:

- `width` - The width of the generated thumbnail
- `height` - The height of the generated thumbnail
- `center` - Whether to center the image before cropping the thumbnail or not
- `preview` - Selector of the preview area (an `img` will be created inside)
- `fitMode` - The fit mode, `$.thumb.FitModes.FitLong` fits the long side and `$.thumb.FitModes.FitShort` fits the short one
- `keepRatio` - Whether to keep the aspect ratio or not
- `pixelPerfect` - Whether to turn off image smoothing or not
- `callbacks` - A `callbacks` object, check **Advanced usage**

## Advanced usage

You may modify the default behavior by overriding the `callbacks` option. The supported callbacks are explained below.

### onLoad

Receives two parameters: the original image as `image` and the options hash as `options`.

By default, this callback checks for EXIF data to read the orientation flag (checking if the [exif.js](https://github.com/exif-js/exif-js) library is available) and calls `$.thumb.api.resize(image, options);`. If there is no EXIF data or support, the orientation is set to -1.

```javascript
onLoad: function(image, options) {
  if (typeof EXIF !== 'undefined') {
    EXIF.getData(image, function() {
      options.orientation = EXIF.getTag(this, 'Orientation');
      $.thumb.api.resize(image, options);
    });
  } else {
    options.orientation = -1;
    $.thumb.api.resize(image, options);
  }
}
```

### onResize

This is called after the image has been processed; receives three parameters: the preview element as `preview`, the thumbnail image as `image` and the options hash as `options`.

By default appends or replaces an `img` element inside the preview element.

```javascript
onResize: function(preview, image, options) {
  var target = preview.find('img');
  if (target.length) {
    target.replaceWith(image);
  } else {
    preview.append(image);
  }
}
```

## Requirements

- jQuery 1.8+
- A recent/decent web browser (Firefox, Chrome or Opera suggested; **IE/Edge NOT TESTED/DON'T CARE**)

## Licensing

MIT Licensed

## Contributing

Fork the repo, add an interesting feature or fix a bug and send a pull request.

## Troubleshooting

Open an issue and provide a clear description of the error, how to reproduce it and your test environment specs (browser, jQuery version, etc.)

## Credits

Lead coder: biohzrdmx (github.com/biohzrdmx)
