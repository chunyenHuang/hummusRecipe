const xObjectForm = require('./xObjectForm');

/**
 * Overlay a pdf to the current pdf
 * @name overlay
 * @function
 * @memberof Recipe
 * @param {string} pdfSrc - The path for the overlay pdf
 * @param {number} x - The coordinate x
 * @param {number} y - The coordinate y
 * @param {number} [options.scale] - Scale the overlay pdf, default is 1
 * @param {boolean} [options.keepAspectRatio] - To keep the aspect ratio when scaling, default is true
 * @param {boolean} [options.fitWidth] - To set the width to 100% (use with keepAspectRatio=true)
 * @param {boolean} [options.fitHeight] - To set the height to 100% (use with keepAspectRatio=true)
 */
exports.overlay = function overlay(pdfSrc, x = 0, y = 0, options = {}) {
    // allow to have only 2 arguments input
    if (arguments.length == 2) {
        options = x || {};
        x = 0;
        y = 0;
    }
    // const pathOptions = this._getPathOptions(options);
    // const gsId = this._getPathOptions(options).fillGsId;

    const { keepAspectRatio, fitWidth, fitHeight } = options;
    const scale = options.scale || 1;

    const { width: pageWidth, height: pageHeight } = this.metadata[this.pageNumber];

    const inMetadata = this.read(pdfSrc);
    // for now only handle the first page.
    const { width, height } = inMetadata[1];

    this.pauseContext();
    const xObject = new xObjectForm(this.writer, width, height);
    xObject.getContentContext()
        .q()
        .drawImage(0, 0, pdfSrc)
        .Q();
    xObject.end();
    this.resumeContext();

    const context = this.pageContext;
    let scaleX = 1 * scale;
    let scaleY = 1 * scale;

    if (fitWidth) {
        scaleX = pageWidth / width;
        if (keepAspectRatio) {
            scaleY = scaleX;
        }
    }
    if (fitHeight) {
        scaleY = pageHeight / height;
        if (keepAspectRatio) {
            scaleX = scaleY;
        }
    }

    const posX = x;
    const posY = pageHeight - height * scaleY - y;

    context
        .q()
        .cm(scaleX, 0, 0, scaleY, posX, posY)
        .doXObject(xObject)
        .Q();

    return this;
};
