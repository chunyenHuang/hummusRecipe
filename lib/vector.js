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
    let colorModel = pathOptions.colorModel;

    if (options.fill) {
        pathOptions.type = 'fill';

        if (pathOptions.fill !== undefined) {
            pathOptions.color = pathOptions.fill;
            pathOptions.colorspace = pathOptions.fillModel.colorspace;
            colorModel = pathOptions.fillModel;
        }

        this._drawObject(this, nx, ny, width, height, pathOptions, (ctx, xObject) => {
            ctx.gs(xObject.getGsName(pathOptions.fillGsId));

            if (options.borderRadius) {
                xObject.fill(colorModel);
                drawRoundedRectangle(ctx, 0, 0, width, height, options.borderRadius);
                ctx.f();
            } else {
                ctx.drawRectangle(0, 0, width, height, pathOptions);
            }
        });
    }

    if (options.stroke || options.color || !options.fill) {
        pathOptions.type = 'stroke';

        if (pathOptions.stroke !== undefined) {
            pathOptions.color = pathOptions.stroke;
            pathOptions.colorspace = pathOptions.strokeModel.colorspace;
            colorModel = pathOptions.strokeModel;
        }

        // To honor the given width and height of the rectangle ...

        this._drawObject(this, nx, ny, width, height, pathOptions, (ctx, xObject) => {

            // ... requires adjusting the internal drawing to accomodate line thickness.
            const margin = pathOptions.width;

            if (options.borderRadius) {
                xObject.stroke(colorModel);
                ctx
                    .w(pathOptions.width)
                    .d(pathOptions.dash, pathOptions.dashPhase)
    
                drawRoundedRectangle(ctx, margin/2, margin/2, width-margin, height-margin, options.borderRadius);
                ctx.S();
            } else {
                ctx
                    .d(pathOptions.dash, pathOptions.dashPhase)
                    .drawRectangle(margin/2, margin/2, width-margin, height-margin, pathOptions);
            }
        });
    }

    return this;
};

function drawRoundedRectangle( ctx, left, bottom, width, height, radii) {
    let radius = [];

    // populate radius array accordingly.
    // Missing element value comes from opposite corner.
    if (typeof radii === 'number') {
        radius = new Array(4).fill(radii);
    } else if (Array.isArray(radii)) {
        switch(radii.length) {
            case 1:
                radius = new Array(4).fill(radii[0]);
                break;
            case 2:
                radius    = radii.slice(0);
                radius[2] = radii[0];
                radius[3] = radii[1];
                break;
            case 3:
                radius = radii.slice(0);
                radius[3] = radii[1];
                break;
            case 4:
                radius = radii;
                break;
        }
    }
    const K = 0.551784;
    const right=left+width;
    const top=bottom+height;
    ctx
        .m(left, top-radius[0])       // top-left
        .c(left, top-radius[0]*(1-K), left+radius[0]*(1-K), top, left+radius[0], top)

        .l(right-radius[1], top)      // top-right
        .c(right-radius[1]*(1-K), top, right, top-radius[1]*(1-K), right, top-radius[1])

        .l(right,bottom+radius[2])    // bottom-right
        .c(right,bottom+radius[2]*(1-K), right-radius[2]*(1-K), bottom, right-radius[2], bottom)

        .l(left+radius[3], bottom)   // bottom-left
        .c(left+radius[3]*(1-K), bottom, left, bottom+radius[3]*(1-K),left,bottom+radius[3])

        .l(left, top-radius[0])      // back to top-left     
}

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

    const width  = rx*2;
    const height = ry*2;
    const pathOptions = this._getPathOptions(options, nx, ny);
    let colorModel = pathOptions.colorModel;
    
    const drawEllipse = (ctx, x, y, w, h) => {

        const magic = 0.551784;  // from https://www.tinaja.com/glib/ellipse4.pdf
        const ox = rx * magic;   // control point offset horizontal
        const oy = ry * magic;   // control point offset horizontal
        const xe = x + w;        // x-end, opposite corner from origin
        const ye = y + h;        // y-end, opposite corner from origin
        const xm = rx;           // x-middle of enclosing rectangle
        const ym = ry;           // y-middle of enclosing rectangle

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

        this._drawObject(this, nx-rx, ny-ry, width, height, pathOptions, (ctx, xObject) => {
            
            ctx.gs(xObject.getGsName(pathOptions.fillGsId));
            xObject.fill(colorModel);
            drawEllipse(ctx, 0, 0, width, height);
            ctx.f();
        });
    }

    if (options.stroke || options.color || !options.fill) {

        if (pathOptions.stroke !== undefined) {
            colorModel = pathOptions.strokeModel;
        }

        // To honor the given width and height of the enclosing rectangle ...

        this._drawObject(this, nx-rx, ny-ry, width, height, pathOptions, (ctx, xObject) => {
            const margin = pathOptions.width/2;
            xObject.stroke(colorModel);
            ctx
                .w(pathOptions.width)
                .d(pathOptions.dash, pathOptions.dashPhase)

            // ... requires adjusting the internal drawing to accomodate line thickness.
            drawEllipse(ctx, margin, margin, width-pathOptions.width, height-pathOptions.width);
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
