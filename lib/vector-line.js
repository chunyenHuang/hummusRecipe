/**
 * move the current position to target position
 * @name moveTo
 * @function
 * @memberof Recipe
 * @param {number} x - The coordinate x
 * @param {number} y - The coordinate y
 */
exports.moveTo = function moveTo(x, y) {
    const { nx, ny } = this._calibrateCoordinate(x, y);
    this._position = {
        x: nx,
        y: ny
    };
    return this;
};

/**
 * Draw a line from current position
 * @name lineTo
 * @function
 * @memberof Recipe
 * @param {number} x - The coordinate x
 * @param {number} y - The coordinate y
 * @param {Object} [options] - The options
 * @param {string|number[]} [options.color] - HexColor or DecimalColor
 * @param {string|number[]} [options.stroke] - HexColor or DecimalColor
 * @param {string|number[]} [options.fill] - HexColor or DecimalColor
 * @param {number} [options.lineWidth] - The line width
 * @param {number} [options.opacity] - The opacity
 * @param {number[]} [options.dash] - The dash style [number, number]
 */
exports.lineTo = function lineTo(x, y, options = {}) {
    const fromX = this._position.x;
    const fromY = this._position.y;
    const { nx, ny } = this._calibrateCoordinate(x, y);
    const context = this.pageContext;
    const pathOptions = this._getPathOptions(options);
    pathOptions.type = 'stroke';

    if (pathOptions.stroke !== undefined) {
        pathOptions.color = pathOptions.stroke;
        pathOptions.colorspace = pathOptions.strokeModel.colorspace;
    }

    context
        .q()
        .J(1)
        .j(1)
        .d(pathOptions.dash, pathOptions.dashPhase)
        .drawPath(fromX, fromY, nx, ny, pathOptions)
        .Q();
    this.moveTo(x, y);
    return this;
};

/**
 * Draw a line
 * @name line
 * @function
 * @memberof Recipe
 * @param {number[]} coordinates - The array of coordinate [[x,y], [m,n]]
 * @param {Object} [options] - The options
 * @param {string|number[]} [options.color] - HexColor or DecimalColor
 * @param {string|number[]} [options.stroke] - HexColor or DecimalColor
 * @param {number} [options.lineWidth] - The line width
 * @param {number[]} [options.dash] - The dash style [number, number]
 */
exports.line = function line(coordinates = [], options = {}) {
    coordinates.forEach((coordinate, index) => {
        if (index === 0) {
            this.moveTo(coordinate[0], coordinate[1]);
        } else {
            this.lineTo(coordinate[0], coordinate[1], options);
        }
    });
    return this;
};
