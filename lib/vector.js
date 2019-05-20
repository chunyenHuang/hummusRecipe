//  Table indicating how to specify coloration of elements
//  ----------------------------------------------------
// |Color | HexColor   | DecimalColor                   |
// |Space | (string)   | (array)                        |
// |------+------------+--------------------------------|
// | Gray | #GG        | [gray]                         |
// |  RGB | #rrggbb    | [red, green, blue]             |
// | CMYK | #ccmmyykk  | [cyan, magenta, yellow, black] |
//  ----------------------------------------------------
//
//   HexColor component values (two hex digits) range from 00 to FF.
//   DecimalColor component values range from 0 to 255.
  
/**
 * Draw a circle
 * @name circle
 * @function
 * @memberof Recipe
 * @param {number} x - The coordinate x
 * @param {number} y - The coordinate y
 * @param {number} radius - The radius
 * @param {Object} [options] - The options
 * @param {string|number[]} [options.color] - HexColor or DecimalColor
 * @param {string|number[]} [options.stroke] - HexColor or DecimalColor
 * @param {string|number[]}[ options.fill] - HexColor or DecimalColor
 * @param {number} [options.lineWidth] - The line width
 * @param {number} [options.opacity] - The opacity
 * @param {number[]} [options.dash] - The dash style [number, number]
 */
exports.circle = function circle(x, y, radius, options = {}) {
    const {
        nx,
        ny
    } = this._calibrateCoordinate(x, y);
    const diameter = radius * 2;

    if (options.fill) {
        const pathOptions = this._getPathOptions(options, nx, ny);
        pathOptions.type = 'fill';

        if (pathOptions.fill !== undefined) {
            pathOptions.color = pathOptions.fill;
            pathOptions.colorspace = pathOptions.fillModel.colorspace;
        }

        this._drawObject(this, nx - radius, ny - radius, diameter, diameter, pathOptions, (ctx, xObject) => {
            ctx
                .gs(xObject.getGsName(pathOptions.fillGsId))
                .drawCircle(radius, radius, radius, pathOptions)
        });
    }
    if (options.stroke || options.color || !options.fill) {
        const pathOptions = this._getPathOptions(options);
        pathOptions.type = 'stroke';

        if (pathOptions.stroke !== undefined) {
            pathOptions.color = pathOptions.stroke;
            pathOptions.colorspace = pathOptions.strokeModel.colorspace;
        }

        // To honor the given width and height of the enclosing square ...

        this._drawObject(this, nx - radius, ny - radius, diameter, diameter, pathOptions, (ctx) => {
            ctx
               .d(pathOptions.dash, pathOptions.dashPhase)
               .drawCircle(radius, radius, radius - pathOptions.width/2, pathOptions);

                // ... requires adjusting the internal drawing to accomodate line thickness.
        });
    }
    return this;
};

/**
 * Draw a rectangle
 * @name rectangle
 * @function
 * @memberof Recipe
 * @param {number} x - The coordinate x
 * @param {number} y - The coordinate y
 * @param {number} width - The width
 * @param {number} height - The height
 * @param {Object} [options] - The options
 * @param {string|number[]} [options.color] - HexColor or DecimalColor
 * @param {string|number[]} [options.stroke] - HexColor or DecimalColor
 * @param {string|number[]} [options.fill] - HexColor or DecimalColor
 * @param {number} [options.lineWidth] - The line width
 * @param {number} [options.opacity] - The opacity
 * @param {number[]} [options.dash] - The dash style [number, number]
 * @param {number} [options.rotation] - Accept: +/- 0 through 360. Default: 0
 * @param {number[]} [options.rotationOrigin] - [originX, originY] Default: x, y
*/
exports.rectangle = function rectangle(x, y, width, height, options = {}) {
    const { nx, ny } = (options.useGivenCoords) 
                     ? { nx: x, ny: y } 
                     : this._calibrateCoordinate(x, y, 0, -height);

    // override default rotation origin?
    if (!options.useGivenCoords && options.rotationOrigin) {
        const orig = this._calibrateCoordinate(options.rotationOrigin[0], options.rotationOrigin[1]);
        options.rotationOrigin = [orig.nx, orig.ny];
    }

    const pathOptions = this._getPathOptions(options, nx, ny);

    if (options.fill) {
        pathOptions.type = 'fill';

        if (pathOptions.fill !== undefined) {
            pathOptions.color = pathOptions.fill;
            pathOptions.colorspace = pathOptions.fillModel.colorspace;
        }

        this._drawObject(this, nx, ny, width, height, pathOptions, (ctx, xObject) => {
            ctx
                .gs(xObject.getGsName(pathOptions.fillGsId))
                .drawRectangle(0, 0, width, height, pathOptions);
        });
    }

    if (options.stroke || options.color || !options.fill) {
        pathOptions.type = 'stroke';

        if (pathOptions.stroke !== undefined) {
            pathOptions.color = pathOptions.stroke;
            pathOptions.colorspace = pathOptions.strokeModel.colorspace;
        }

        // To honor the given width and height of the rectangle ...

        this._drawObject(this, nx, ny, width, height, pathOptions, (ctx) => {
            const margin = pathOptions.width;
            ctx
                .d(pathOptions.dash, pathOptions.dashPhase)
                .drawRectangle(margin/2, margin/2, width-margin, height-margin, pathOptions);

                // ... requires adjusting the internal drawing to accomodate line thickness.
        });
    }

    return this;
};

/**
 * Draw an ellipse
 * @name ellipse
 * @function
 * @memberof Recipe
 * @param {number} cx x-coordinate of center point of ellipse
 * @param {number} cy y-coordinate of center point of ellipse
 * @param {number} rx radius length from the center point along x-axis
 * @param {number} ry radius length from the center point along y-axis
 * @param {Object} options
 * @param {string|number[]} [options.color] - HexColor or DecimalColor
 * @param {string|number[]} [options.stroke] - HexColor or DecimalColor
 * @param {string|number[]}[ options.fill] - HexColor or DecimalColor
 * @param {number} [options.lineWidth] - The line width
 * @param {number} [options.opacity] - The opacity
 * @param {number[]} [options.dash] - The dash style [number, number]
 * @param {number} [options.rotation] - Accept: +/- 0 through 360. Default: 0
 * @param {number[]} [options.rotationOrigin] - [originX, originY] Default: x, y
 */
exports.ellipse = function ellipse(cx, cy, rx, ry, options = {}) {
    const {
        nx,
        ny
    } = this._calibrateCoordinate(cx, cy);
    
    if (options.rotationOrigin) {
        const orig = this._calibrateCoordinate(options.rotationOrigin[0], options.rotationOrigin[1]);
        options.rotationOrigin = [orig.nx, orig.ny];
    }

    const pathOptions = this._getPathOptions(options, nx, ny);
    let colorModel = pathOptions.colorModel;

    // Algorithm has to account for thickness of line to keep
    // ellipse within the confines of the enclosing rectangle
    // so that there is no viewed clipping of the drawn path.

    const magic = 0.551784;  // from https://www.tinaja.com/glib/ellipse4.pdf
    const ox = rx * magic;   // control point offset horizontal
    const oy = ry * magic;   // control point offset horizontal
    const w  = rx * 2;       // width of enclosing rectangle
    const h  = ry * 2;       // height of enclosing rectangle
    const x = 0;             // x coordinate of origin
    const y = 0;             // y coordinate of origin
    const xe = x + w;        // x-end, opposite corner from origin
    const ye = y + h;        // y-end, opposite corner from origin
    const xm = rx;           // x-middle of enclosing rectangle
    const ym = ry;           // y-middle of enclosing rectangle

    const drawEllipse = (ctx, x, y, xe, ye) => {
        ctx
            .m(x, ym)
            .c(x, ym - oy, xm - ox, y, xm, y)
            .c(xm + ox, y, xe, ym - oy, xe, ym)
            .c(xe, ym + oy, xm + ox, ye, xm, ye)
            .c(xm - ox, ye, x, ym + oy, x, ym)
    }

    if (options.fill) {

        if (pathOptions.fill !== undefined) {
            colorModel = pathOptions.fillModel;
        }

        this._drawObject(this, nx-rx, ny-ry, w, h, pathOptions, (ctx, xObject) => {
            
            ctx.gs(xObject.getGsName(pathOptions.fillGsId));
            xObject.fill(colorModel);
            drawEllipse(ctx, x, y, xe, ye);
            ctx.f();
        });
    }

    if (options.stroke || options.color || !options.fill) {

        if (pathOptions.stroke !== undefined) {
            colorModel = pathOptions.strokeModel;
        }

        // To honor the given width and height of the enclosing rectangle ...

        this._drawObject(this, nx-rx, ny-ry, w, h, pathOptions, (ctx, xObject) => {
            const margin = pathOptions.width/2;
            xObject.stroke(colorModel);
            ctx
                .w(pathOptions.width)
                .d(pathOptions.dash, pathOptions.dashPhase)

            // ... requires adjusting the internal drawing to accomodate line thickness.
            drawEllipse(ctx, margin, margin, xe-margin, ye-margin);
            ctx.S();
        });
    }
    return this;
};

exports.lineWidth = function lineWidth() {
    return this;
};

exports.fillOpacity = function fillOpacity() {
    return this;
};

exports.fill = function fill() {
    return this;
};

exports.stroke = function stroke() {
    return this;
};

exports.fillAndStroke = function fillAndStroke() {
    return this;
};
