const xObjectForm = require('./xObjectForm');

/**
 * Draw a polygon
 * @name polygon
 * @function
 * @memberof Recipe
 * @param {number[]} coordinates - The array of coordinate [[x,y], [m,n]]
 * @param {Object} [options] - The options
 * @param {string|number[]} [options.color] - HexColor or RGB
 * @param {string|number[]} [options.stroke] - HexColor or RGB
 * @param {string|number[]} [options.fill] - HexColor or RGB
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
    const width = Math.abs(boundBox[2] - boundBox[0]) + margin * 2;
    const height = Math.abs(boundBox[3] - boundBox[1]) + margin * 2;
    const startX = boundBox[0] - margin;
    const startY = boundBox[1] - margin;
    // const { nx, ny } = this._calibrateCoordinate(startX, startY + height);

    const xObject = new xObjectForm(this.writer, width, height);
    const xObjectCtx = xObject.getContentContext();

    const colorInRGB = this._colorNumberToRGB(pathOptions.color);
    const strokeInRGB = this._colorNumberToRGB(pathOptions.stroke);
    const fillInRGB = this._colorNumberToRGB(pathOptions.fill);

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

    if (fillInRGB) {
        xObjectCtx.rg(fillInRGB.r / 255, fillInRGB.g / 255, fillInRGB.b / 255);
        draw(xObjectCtx, coordinates);
        xObjectCtx.f();
    }
    if (pathOptions.width) {
        xObjectCtx.w(pathOptions.width);
    }
    if (strokeInRGB) {
        xObjectCtx.RG(strokeInRGB.r / 255, strokeInRGB.g / 255, strokeInRGB.b / 255);
        draw(xObjectCtx, coordinates);
        xObjectCtx.s();
    } else
    if (colorInRGB) {
        xObjectCtx.RG(colorInRGB.r / 255, colorInRGB.g / 255, colorInRGB.b / 255);
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
