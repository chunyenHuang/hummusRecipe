//  Table indicating how to specify coloration of elements
//  -------------------------------------------------------------------
// |Color | HexColor   | DecimalColor                   | PercentColor |
// |Space | (string)   | (array)                        | (string)     |
// |------+------------+--------------------------------+--------------|
// | Gray | #GG        | [gray]                         | %G           |
// |  RGB | #rrggbb    | [red, green, blue]             | %r,g,b       |
// | CMYK | #ccmmyykk  | [cyan, magenta, yellow, black] | %c,m,y,k     |
//  -------------------------------------------------------------------
//
//   HexColor component values (two hex digits) range from 00 to FF.
//   DecimalColor component values range from 0 to 255.
//   PercentColor component values range from 1 to 100.

/**
 * Draw a circle
 * @name circle
 * @function
 * @memberof Recipe
 * @param {number} x - The coordinate x
 * @param {number} y - The coordinate y
 * @param {number} radius - The radius
 * @param {Object} [options] - The options
 * @param {string|number[]} [options.color] - HexColor, PercentColor or DecimalColor
 * @param {string|number[]} [options.stroke] - HexColor, PercentColor or DecimalColor
 * @param {string|number[]}[ options.fill] - HexColor, PercentColor or DecimalColor
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
                .drawCircle(radius, radius, radius, pathOptions);
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
                .drawCircle(radius, radius, radius - pathOptions.width / 2, pathOptions);

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
 * @param {string|number[]} [options.color] - HexColor, PercentColor or DecimalColor
 * @param {string|number[]} [options.stroke] - HexColor, PercentColor or DecimalColor
 * @param {string|number[]} [options.fill] - HexColor, PercentColor or DecimalColor
 * @param {number} [options.lineWidth] - The line width
 * @param {number} [options.opacity] - The opacity
 * @param {number[]} [options.dash] - The dash style [number, number]
 * @param {number} [options.rotation] - Accept: +/- 0 through 360. Default: 0
 * @param {number[]} [options.rotationOrigin] - [originX, originY] Default: x, y
 * @param {number|number[]} [options.borderRadius] - radius size for rounded corners.Error
 * When a one to four number array can be used to give specific sizees to each corner.
 * The numbering starts from the top, left corner, and goes clockwise around the text box.
 * Missing values in the array are filled in by opposite corner values.
 */
exports.rectangle = function rectangle(x, y, width, height, options = {}) {
    const { nx, ny } = (options.useGivenCoords) ? { nx: x, ny: y } : this._calibrateCoordinate(x, y, 0, -height);

    const pathOptions = this._getPathOptions(options, nx, ny);
    let colorModel = pathOptions.colorModel;
    pathOptions.useGivenCoords = options.useGivenCoords;

    if (options.fill) {
        pathOptions.type = 'fill';

        if (pathOptions.fill !== undefined) {
            pathOptions.color = pathOptions.fill;
            pathOptions.colorspace = pathOptions.fillModel.colorspace;
            colorModel = pathOptions.fillModel;
        }

        this._drawObject(this, nx, ny, width, height, pathOptions, (ctx, xObject) => {
            ctx.gs(xObject.getGsName(pathOptions.fillGsId));
            xObject.fill(colorModel);

            if (options.borderRadius) {
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
            xObject.stroke(colorModel);

            if (options.borderRadius) {
                ctx
                    .w(pathOptions.width)
                    .d(pathOptions.dash, pathOptions.dashPhase);

                drawRoundedRectangle(ctx, margin / 2, margin / 2, width - margin, height - margin, options.borderRadius);
                ctx.S();
            } else {
                ctx
                    .d(pathOptions.dash, pathOptions.dashPhase)
                    .drawRectangle(margin / 2, margin / 2, width - margin, height - margin, pathOptions);
            }
        });
    }

    return this;
};

function drawRoundedRectangle(ctx, left, bottom, width, height, radii) {
    let radius = [];

    // populate radius array accordingly.
    // Missing element value comes from opposite corner.
    if (typeof radii === 'number') {
        radius = new Array(4).fill(radii);
    } else if (Array.isArray(radii)) {
        switch (radii.length) {
            case 1:
                radius = new Array(4).fill(radii[0]);
                break;
            case 2:
                radius = radii.slice(0);
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
    const right = left + width;
    const top = bottom + height;
    ctx
        .m(left, top - radius[0]) // top-left
        .c(left, top - radius[0] * (1 - K), left + radius[0] * (1 - K), top, left + radius[0], top)

        .l(right - radius[1], top) // top-right
        .c(right - radius[1] * (1 - K), top, right, top - radius[1] * (1 - K), right, top - radius[1])

        .l(right, bottom + radius[2]) // bottom-right
        .c(right, bottom + radius[2] * (1 - K), right - radius[2] * (1 - K), bottom, right - radius[2], bottom)

        .l(left + radius[3], bottom) // bottom-left
        .c(left + radius[3] * (1 - K), bottom, left, bottom + radius[3] * (1 - K), left, bottom + radius[3])

        .l(left, top - radius[0]); // back to top-left
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
 * @param {string|number[]} [options.color] - HexColor, PercentColor or DecimalColor
 * @param {string|number[]} [options.stroke] - HexColor, PercentColor or DecimalColor
 * @param {string|number[]}[ options.fill] - HexColor, PercentColor or DecimalColor
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

    const pathOptions = this._getPathOptions(options, nx, ny);
    let colorModel = pathOptions.colorModel;

    const width = rx * 2;
    const height = ry * 2;

    const drawEllipse = (ctx, x, y, w, h) => {
        const magic = 0.551784; // from https://www.tinaja.com/glib/ellipse4.pdf
        const ox = rx * magic; // control point offset horizontal
        const oy = ry * magic; // control point offset horizontal
        const xe = x + w; // x-end, opposite corner from origin
        const ye = y + h; // y-end, opposite corner from origin
        const xm = rx; // x-middle of enclosing rectangle
        const ym = ry; // y-middle of enclosing rectangle

        ctx
            .m(x, ym)
            .c(x, ym - oy, xm - ox, y, xm, y)
            .c(xm + ox, y, xe, ym - oy, xe, ym)
            .c(xe, ym + oy, xm + ox, ye, xm, ye)
            .c(xm - ox, ye, x, ym + oy, x, ym);
    };

    if (options.fill) {

        if (pathOptions.fill !== undefined) {
            colorModel = pathOptions.fillModel;
        }


        this._drawObject(this, nx - rx, ny - ry, width, height, pathOptions, (ctx, xObject) => {
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

        this._drawObject(this, nx - rx, ny - ry, width, height, pathOptions, (ctx, xObject) => {
            const margin = pathOptions.width / 2;
            xObject.stroke(colorModel);
            ctx
                .w(pathOptions.width)
                .d(pathOptions.dash, pathOptions.dashPhase);

            // ... requires adjusting the internal drawing to accomodate line thickness.
            drawEllipse(ctx, margin, margin, width - pathOptions.width, height - pathOptions.width);
            ctx.S();
        });
    }
    return this;
};

function drawArc(ctx, x, y, radius, startAngle, endAngle, fromCenter=false) {

    const TWO_PI  = 2.0 * Math.PI;
    const HALF_PI = 0.5 * Math.PI;
    const magic = 0.551784; // from https://www.tinaja.com/glib/ellipse4.pdf
    let deltaAng;

    deltaAng = endAngle - startAngle;

    // Limit the drawing to no more than one complete circle
    if (Math.abs(deltaAng) > TWO_PI) {
        deltaAng = TWO_PI;
    }

    const numSegs = Math.ceil(Math.abs(deltaAng) / HALF_PI);
    const segAng = deltaAng / numSegs;
    const handleLen = (segAng / HALF_PI) * magic * radius;
    let curAng = startAngle;

    // distances between anchor point and control point
    let deltaCx = -Math.sin(curAng) * handleLen;
    let deltaCy =  Math.cos(curAng) * handleLen;

    // anchor point
    let ax = x + Math.cos(curAng) * radius;
    let ay = y + Math.sin(curAng) * radius;

    // draw sector lines?
    if (!fromCenter) {
        ctx.m(ax, ay);
    } else {
        ctx.m(x,y).l(ax, ay);
    }

    // generate segments of overall arc

    for (let segIdx = 0; segIdx < numSegs; segIdx++) {
        // starting control point
        const cp1x = ax + deltaCx;
        const cp1y = ay + deltaCy;

        // next angle
        curAng += segAng;

        // next control point difference
        deltaCx = -Math.sin(curAng) * handleLen;
        deltaCy =  Math.cos(curAng) * handleLen;

        // next anchor point
        ax = x + Math.cos(curAng) * radius;
        ay = y + Math.sin(curAng) * radius;

        // ending control point
        const cp2x = ax - deltaCx;
        const cp2y = ay - deltaCy;

        // produce segment
        ctx.c(cp1x, cp1y, cp2x, cp2y, ax, ay);
    }
}

/**
 * Draw an arc of a circle.
 * @name arc
 * @function
 * @memberof Recipe
 * @param {number} x - the x coordinate of the arc center point
 * @param {number} y - the y coordinate of the arc center point
 * @param {number} radius - the distance from the given x,y coordinates from which to produce the arc
 * @param {number} [startAngle=0] - the start of the arc in degree units +/- 0 through 360. Positive values go clockwise, Negative values, counterclockwise.
 * @param {number} [endAngle=360] - the end of the arc in degree units +/- 0 through 360. Positive values go clockwise, Negative values, counterclockwise.
 * @param {Object} [options]
 * @param {string|number[]} [options.color] - HexColor, PercentColor or DecimalColor
 * @param {string|number[]} [options.stroke] - HexColor, PercentColor or DecimalColor
 * @param {string|number[]}[ options.fill] - HexColor, PercentColor or DecimalColor
 * @param {number} [options.lineWidth] - The line width
 * @param {number} [options.opacity] - The opacity
 * @param {number[]} [options.dash] - The dash style [number, number]
 * @param {number} [options.rotation=0] - Accept: +/- 0 through 360.
 * @param {number[]} [options.rotationOrigin] - [originX, originY] Default: x, y
 */
exports.arc = function arc(x, y, radius, startAngle=0, endAngle=360, options = {}) {

    const { nx, ny } = this._calibrateCoordinate(x, y);
    const diameter = radius * 2;
    const pathOptions = this._getPathOptions(options, nx, ny);
    let colorModel = pathOptions.colorModel;
    const toRadians = (angle) => {return angle * (Math.PI / 180);};
    const sAng = - toRadians(startAngle);
    const eAng = - toRadians(endAngle);
    const sector = options.sector;

    if (options.fill) {
        if (pathOptions.fill !== undefined) {
            colorModel = pathOptions.fillModel;
        }

        this._drawObject(this, nx - radius, ny - radius, diameter, diameter, pathOptions, (ctx, xObject) => {
            ctx.gs(xObject.getGsName(pathOptions.fillGsId));
            xObject.fill(colorModel);

            drawArc(ctx, radius, radius, radius, sAng, eAng, sector);
            ctx.f();
        });
    }

    if (options.stroke || options.color || !options.fill) {

        if (pathOptions.stroke !== undefined) {
            colorModel = pathOptions.strokeModel;
        }

        // To honor the given width and height of the enclosing rectangle ...

        this._drawObject(this, nx - radius, ny - radius, diameter, diameter, pathOptions, (ctx, xObject) => {

            const margin = pathOptions.width / 2;
            xObject.stroke(colorModel);
            ctx
                .w(pathOptions.width)
                .d(pathOptions.dash, pathOptions.dashPhase);

            // ... requires adjusting the internal drawing to accomodate line thickness.
            drawArc(ctx, radius, radius, radius-margin, sAng, eAng, sector);
            if (sector) { ctx.h(); } // close off path to create a circle sector.
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
