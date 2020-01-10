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
 * Draw a polygon
 * @name polygon
 * @function
 * @memberof Recipe
 * @param {number[]} coordinates - The array of coordinate [[x,y], ... [m,n]]
 * @param {Object} [options] - The options
 * @param {string|number[]} [options.color] - HexColor, PercentColor or DecimalColor
 * @param {string|number[]} [options.stroke] - HexColor, PercentColor or DecimalColor
 * @param {string|number[]} [options.fill] - HexColor, PercentColor or DecimalColor
 * @param {number} [options.lineWidth] - The line width
 * @param {number} [options.opacity] - The opacity
 * @param {number[]} [options.dash] - The dash pattern [dashSize, gapSize] or [dashAndGapSize]
 * @param {number} [options.dashPhase] - distance into dash pattern at which to start dash (default: 0, immediately)
 * @param {number} [options.rotation] - Accept: +/- 0 through 360. Default: 0
 * @param {number[]} [options.rotationOrigin] - [originX, originY] Default: x, y
 * @param {string} [options.lineCap] -  open line end style, 'butt', 'round', or 'square' (default: 'round')
 * @param {string} [options.lineJoin] - joined line end style, 'miter', 'round', or 'bevel' (default: 'round')
 * @param {number} [options.miterLimit] - limit at which 'miter' joins are forced to 'bevel' (default: 1.414) */
exports.polygon = function polygon(coordinates = [], options = {}) {
    // close polygon
    if (this._getDistance(coordinates[0], coordinates[coordinates.length - 1]) != 0) {
        coordinates.push(coordinates[0]);
    }
    let boundBox = [ /*minX, minY, maxX, maxY*/ ];
    coordinates.forEach((coord, index) => {
        if (index === 0) {
            boundBox = [coord[0], coord[1], coord[0], coord[1]];
        }
        boundBox[0] = (boundBox[0] > coord[0]) ? coord[0] : boundBox[0];
        boundBox[1] = (boundBox[1] > coord[1]) ? coord[1] : boundBox[1];
        boundBox[2] = (boundBox[2] < coord[0]) ? coord[0] : boundBox[2];
        boundBox[3] = (boundBox[3] < coord[1]) ? coord[1] : boundBox[3];
    });

    if(options.deltaYY) {
        boundBox[3] += options.deltaYY;
        delete options['deltaYY'];  // keeps other calls to here safe
    }

    const pathOptions = this._getPathOptions(options);
    let colorModel = pathOptions.colorModel;
    const margin = pathOptions.width * 2;
    const width  = Math.abs(boundBox[2] - boundBox[0]) + margin * 2;
    const height = Math.abs(boundBox[3] - boundBox[1]) + margin * 2;
    const startX = boundBox[0] - margin;
    const startY = boundBox[1] + height - margin;
    const { nx, ny } = this._calibrateCoordinate(startX, startY);

    const drawPolygon = (context, coordinates) => {
        coordinates.forEach((coord, index) => {
            let nx = coord[0];
            let ny = coord[1];
            if (index === 0) {
                context.m(nx - startX,  startY -ny );
            } else {
                context.l(nx - startX,  startY -ny);
            }
        });
    };

    const setPathOptions = (context) => {
        context
            .J(pathOptions.lineCap)
            .j(pathOptions.lineJoin)
            .d(pathOptions.dash, pathOptions.dashPhase)
            .M(pathOptions.miterLimit);
    };

    pathOptions.originX = nx + width/2;  // default rotation point
    pathOptions.originY = ny + height/2;

    if (options.fill) {

        if (pathOptions.fill !== undefined) {
            colorModel = pathOptions.fillModel;
        }

        this._drawObject(this, nx, ny, width, height, pathOptions, (ctx, xObject) => {
            ctx.gs(xObject.getGsName(pathOptions.fillGsId)),
            setPathOptions(ctx);
            xObject.fill(colorModel);
            drawPolygon(ctx, coordinates);
            ctx.f();
        });
    }

    if (options.stroke || options.color || !options.fill) {

        if (pathOptions.stroke !== undefined) {
            colorModel = pathOptions.strokeModel;
        }

        this._drawObject(this, nx, ny, width, height, pathOptions, (ctx, xObject) => {
            ctx.w(pathOptions.width);
            setPathOptions(ctx);
            xObject.stroke(colorModel);
            drawPolygon(ctx, coordinates);
            ctx.s();
        });
    }

    return this;
};
