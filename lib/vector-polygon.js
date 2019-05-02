const xObjectForm = require('./xObjectForm');

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
 * Draw a polygon
 * @name polygon
 * @function
 * @memberof Recipe
 * @param {number[]} coordinates - The array of coordinate [[x,y], [m,n]]
 * @param {Object} [options] - The options
 * @param {string|number[]} [options.color] - HexColor or DecimalColor
 * @param {string|number[]} [options.stroke] - HexColor or DecimalColor
 * @param {string|number[]} [options.fill] - HexColor or DecimalColor
 * @param {number} [options.lineWidth] - The line width
 * @param {number} [options.opacity] - The opacity
 * @param {number[]} [options.dash] - The dash style [number, number]
 */
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

    const pathOptions = this._getPathOptions(options);
    this.pauseContext();
    const margin = pathOptions.width * 2;
    const width  = Math.abs(boundBox[2] - boundBox[0]) + margin * 2;
    const height = Math.abs(boundBox[3] - boundBox[1]) + margin * 2;
    const startX = boundBox[0] - margin;
    const startY = boundBox[1] - margin;
    // const { nx, ny } = this._calibrateCoordinate(startX, startY + height);

    const xObject = new xObjectForm(this.writer, width, height);
    const xObjectCtx = xObject.getContentContext();

    const draw = (context, coordinates) => {
        coordinates.forEach((coord, index) => {
            let nx = coord[0];
            let ny = coord[1];
            nx = width - coord[0] - margin * 2 + boundBox[0] * 2;
            if (index === 0) {
                context.m(nx - startX, ny - startY);
            } else {
                context.l(nx - startX, ny - startY);
            }
        });
    };

    xObjectCtx
        .q()
        .gs(xObject.getGsName(pathOptions.fillGsId))
        .J(1)
        .j(1)
        .d(pathOptions.dash, pathOptions.dashPhase)
        .M(1.414);

    if (pathOptions.fill !== undefined) {
        xObject.fill(pathOptions.fillModel);
        draw(xObjectCtx, coordinates);
        xObjectCtx.f();
    }

    if (pathOptions.width) {
        xObjectCtx.w(pathOptions.width);
    }

    if (pathOptions.stroke !== undefined) {
        xObject.stroke(pathOptions.strokeModel);
        draw(xObjectCtx, coordinates);
        xObjectCtx.s();

    } else if (pathOptions.color !== undefined) {
        xObject.stroke(pathOptions.colorModel);
        draw(xObjectCtx, coordinates);
        xObjectCtx.s();
    }
    xObjectCtx.Q();
    xObject.end();
    this.resumeContext();

    const { nx, ny } = this._calibrateCoordinate(startX, startY + height);
    const context = this.pageContext;
    context.q()
        .cm(-1, 0, 0, -1, nx + width, ny + height)
        .doXObject(xObject)
        .Q();

    return this;
};
