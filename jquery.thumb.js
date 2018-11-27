/**
 * jQuery.Thumb
 * @version   1.0
 * @author    biohzrdmx <github.com/biohzrdmx>
 * @requires  jQuery 1.8+
 * @license   MIT
 * @copyright Copyright © 2018 biohzrdmx. All rights reserved.
 */
;(function($) {
	$.thumb = {
		api: {
			fromInput: function(input, options) {
				if (typeof window.FileReader !== 'undefined') {
					if (input.files && input.files[0]) {
						if ( input.files[0].type.match(/^image\/(jpe?g|png|gif|webp|svg)/) ) {
							var reader = new FileReader();
							reader.onload = function (e) {
								$.thumb.api.fromDataURL(e.target.result, options);
							};
							reader.readAsDataURL(input.files[0]);
						}
					}
				}
			},
			fromDataURL: function(dataURL, options) {
				var image = new Image();
				image.onload = function(e) {
					options.callbacks.onLoad(image, options);
				};
				image.src = dataURL;
			},
			resize: function(image, options) {
				var canvasSrc, canvasDst, ctxSrc, ctxDst, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight, ratio, scaleX, scaleY, rotation, result;
				// Create both canvas elements
				canvasSrc = document.createElement('canvas');
				canvasDst = document.createElement('canvas');
				// Check orientation
				rotation = 0;
				switch (options.orientation) {
					case 3:
					case 4:
						rotation = 180;
						break;
					case 5:
					case 6:
						rotation = 90;
						break;
					case 7:
					case 8:
						rotation = 270;
						break;
				}
				// Set canvas dimensions
				canvasSrc.width = (rotation == 90 || rotation == 270) ? image.height : image.width;
				canvasSrc.height = (rotation == 90 || rotation == 270) ? image.width : image.height;
				canvasDst.width = options.width;
				canvasDst.height = options.height;
				// Get drawing contexts
				ctxSrc = canvasSrc.getContext('2d');
				ctxDst = canvasDst.getContext('2d');
				// Calculate draw parameters
				srcX = 0;
				srcY = 0;
				srcWidth = canvasSrc.width;
				srcHeight = canvasSrc.height;
				//
				switch (options.fitMode) {
					case $.thumb.FitModes.FitLong:
						ratio = Math.min(canvasDst.width / srcWidth, canvasDst.height / srcHeight)
					break;
					case $.thumb.FitModes.FitShort:
					default:
						ratio = Math.max(canvasDst.width / srcWidth, canvasDst.height / srcHeight);
					break;
				}
				dstX = 0;
				dstY = 0;
				dstWidth = options.keepRatio ? (srcWidth * ratio) : canvasDst.width;
				dstHeight = options.keepRatio ? (srcHeight * ratio) : canvasDst.height;
				// Center image?
				if (options.center) {
					scaleX = srcWidth / dstWidth;
					scaleY = srcHeight / dstHeight;
					srcX = (srcWidth - (canvasDst.width * scaleX)) / 2;
					srcY = (srcHeight - (canvasDst.height * scaleY)) / 2;
				}
				// Set smoothing mode
				ctxDst.imageSmoothingQuality       = "high"
				ctxDst.mozImageSmoothingEnabled    = !options.pixelPerfect
				ctxDst.webkitImageSmoothingEnabled = !options.pixelPerfect
				ctxDst.msImageSmoothingEnabled     = !options.pixelPerfect
				ctxDst.imageSmoothingEnabled       = !options.pixelPerfect
				// Draw to source canvas (rotate if required)
				if (rotation != 0) {
					ctxSrc.save();
					if(rotation == 90 || rotation == 270) {
						ctxSrc.translate(image.height / 2, image.width / 2);
					} else {
						ctxSrc.translate(image.width / 2, image.height / 2);
					}
					ctxSrc.rotate(rotation * Math.PI / 180);
					ctxSrc.drawImage(image, -image.width / 2, -image.height / 2);
					ctxSrc.restore();
				} else {
					ctxSrc.drawImage(image, 0, 0);
				}
				// Draw to destination canvas
				ctxDst.drawImage(canvasSrc, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight);
				// Create result image
				result = new Image();
				result.onload = function(e) {
					var preview = typeof options.preview === 'string' ? $(options.preview) : options.preview;
					options.callbacks.onResize(preview, result, options);
				};
				result.src = canvasDst.toDataURL();
			}
		},
		defaults: {
			width: 180,
			height: 180,
			center: false,
			preview: null,
			fitMode: 1,
			keepRatio: true,
			pixelPerfect: false,
			orientation: 0,
			callbacks: {
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
				},
				onResize: function(preview, image, options) {
					var target = preview.find('img');
					if (target.length) {
						target.replaceWith(image);
					} else {
						preview.append(image);
					}
				}
			}
		}
	};
	$.thumb.FitModes = {
		FitLong: 0,
		FitShort: 1
	};
	$.fn.thumb = function(options) {
		if (!this.length) { return this; }
		var opts = $.extend(true, {}, $.thumb.defaults, options);
		this.each(function() {
			var el = $(this);
			el.on('change', function() {
				$.thumb.api.fromInput(el.get(0), opts);
			});
		});
		return this;
	};
})(jQuery);