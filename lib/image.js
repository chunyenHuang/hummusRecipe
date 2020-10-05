/**
 * Place images to pdf
 * @name image
 * @function
 * @memberof Recipe
 * @param {string} imgSrc - The path for the image. [JPEG, PNG, TIFF]
 * @param {number} x - The coordinate x
 * @param {number} y - The coordinate y
 * @param {Object} [options] - The options
 * @param {number} [options.width] - The new width
 * @param {number} [options.height] - The new height
 * @param {number} [options.scale] - Scale the image from the original width and height.
 * @param {boolean} [options.keepAspectRatio=true] - Keep the aspect ratio.
 * @param {number} [options.opacity] - The opacity.
 * @param {string} [options.align] - 'center center'...
 */
exports.image = function image(imgSrc, x, y, options = {}) {
    const { width, height, offsetX, offsetY } = this._getImgOffset(imgSrc, options);
    const imgOptions = {
        transformation: {
            fit: 'always',
            // proportional: true,
            width,
            height
        }
    };
    const { nx, ny } = this._calibrateCoordinate(x, y, offsetX, offsetY);

    const _options = this._getPathOptions(options, nx, ny);
    const gsId = _options.fillGsId;
    const xObjectKeyName = `${imgSrc}__${gsId}`;

    // See if this image has been seen already, so as to not duplicate it.
    let xObject = this.xObjects.find((element) => {
        return element.get('name') == xObjectKeyName;
    });

    if (xObject) {
        _options.xObject = xObject;
        _options.ratio = [width / xObject.get('width'), height / xObject.get('height')];
    }

    this._drawObject(this, nx, ny, width, height, _options, (ctx, xObject) => {
        // Only new images visit here
        xObject.set('type', 'image');
        xObject.set('name', xObjectKeyName);
        xObject.set('width', width);
        xObject.set('height', height);

        this.xObjects.push(xObject);
        ctx
            .gs(xObject.getGsName(gsId))
            .drawImage(0, 0, imgSrc, imgOptions);
    });

    return this;
};

exports._getImgOffset = function _getImgOffset(imgSrc = '', options = {}) {
    // set default to true
    options.keepAspectRatio = (options.keepAspectRatio == void 0) ?
        true : options.keepAspectRatio;
    const dimensions = this.writer.getImageDimensions(imgSrc);
    const ratio = dimensions.width / dimensions.height;

    let width = dimensions.width;
    let height = dimensions.height;
    if (options.scale) {
        width = width * options.scale;
        height = height * options.scale;
    } else
    if (options.width && !options.height) {
        width = options.width;
        height = options.width / ratio;
    } else
    if (!options.width && options.height) {
        width = options.height * ratio;
        height = options.height;
    } else
    if (options.width && options.height) {
        if (!options.keepAspectRatio) {
            width = options.width;
            height = options.height;
        } else {
            // fit to the smaller
            if (options.width / ratio <= options.height) {
                width = options.width;
                height = options.width / ratio;
            } else {
                width = options.height * ratio;
                height = options.height;
            }
        }
    }
    let offsetX = 0;
    let offsetY = -height;

    if (options.align) {
        const alignments = options.align.split(' ');
        if (alignments[0]) {
            switch (alignments[0]) {
                case 'center':
                    offsetX = -1 * width / 2;
                    break;
                case 'right':
                    offsetX = width / 2;
                    break;
                default:
            }
        }
        if (alignments[1]) {
            switch (alignments[1]) {
                case 'center':
                    offsetY = -1 * height / 2;
                    break;
                case 'bottom':
                    offsetY = height / 2;
                    break;
                default:
            }
        }
    }
    return { width, height, offsetX, offsetY };
};
