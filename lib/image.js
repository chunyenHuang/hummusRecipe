const xObjectForm = require('./xObjectForm');
/**
 * Draw Image
 * TODO: imageXObject, rotation, Reusable forms
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
    const { nx, ny } = this._calibrateCoorinate(x, y, offsetX, offsetY);

    const gsId = this._getPathOptions(options).fillGsId;

    let xObject = this.xObjects.find((element) => {
        return element.get('name') == imgSrc;
    });
    if (!xObject) {
        this.pauseContext();
        xObject = new xObjectForm(this.writer, width, height);
        xObject.getContentContext()
            .q()
            .gs(xObject.getGsName(gsId))
            .drawImage(0, 0, imgSrc, imgOptions)
            .Q();
        xObject.end();
        xObject.set('type', 'image');
        xObject.set('name', imgSrc);
        xObject.set('width', width);
        xObject.set('height', height);
        this.xObjects.push(xObject);
        this.resumeContext();
    }

    const context = this.pageContext;
    const ratioX = width / xObject.get('width');
    const ratioY = height / xObject.get('height');
    context.q()
        .cm(ratioX, 0, 0, ratioY, nx, ny)
        .doXObject(xObject)
        .Q();

    // context.drawImage(nx, ny, imgSrc, imgOptions);
    return this;
}

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
}
