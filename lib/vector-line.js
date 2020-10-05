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
 * @param {string|number[]} [options.color] - HexColor, PercentColor or DecimalColor
 * @param {string|number[]} [options.stroke] - HexColor, PercentColor or DecimalColor
 * @param {number} [options.lineWidth] - The line width
 * @param {number} [options.opacity] - how transparent should line be, from 0: invisible to 1: opaque
 * @param {number[]} [options.dash] - The dash pattern [dashSize, gapSize] or [dashAndGapSize]
 * @param {number} [options.dashPhase] - distance into dash pattern at which to start dash (default: 0, immediately)
 * @param {string} [options.lineCap] -  open line end style, 'butt', 'round', or 'square' (default: 'round')
 * @param {string} [options.lineJoin] - joined line end style, 'miter', 'round', or 'bevel' (default: 'round')
 * @param {number} [options.miterLimit] - limit at which 'miter' joins are forced to 'bevel' (default: 1.414)
 *
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
        .J(pathOptions.lineCap)
        .j(pathOptions.lineJoin)
        .d(pathOptions.dash, pathOptions.dashPhase)
        .M(pathOptions.miterLimit)
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
 * @param {string|number[]} [options.color] - HexColor, PercentColor or DecimalColor
 * @param {string|number[]} [options.stroke] - HexColor, PercentColor or DecimalColor
 * @param {number} [options.lineWidth] - The line width
 * @param {number} [options.opacity] - how transparent should line be, from 0: invisible to 1: opaque
 * @param {number[]} [options.dash] - The dash pattern [dashSize, gapSize] or [dashAndGapSize]
 * @param {number} [options.dashPhase] - distance into dash pattern at which to start dash (default: 0, immediately)
 * @param {string} [options.lineCap] -  open line end style, 'butt', 'round', or 'square' (default: 'round')
 * @param {string} [options.lineJoin] - joined line end style, 'miter', 'round', or 'bevel' (default: 'round')
 * @param {number} [options.miterLimit] - limit at which 'miter' joins are forced to 'bevel' (default: 1.414)*/
exports.line = function line(coordinates = [], options = {}) {
    coordinates.forEach((coordinate, index) => {
        if (index === 0) {
            this.moveTo(coordinate[0], coordinate[1]);
            if (this.editingPage) {  // hack to force out first line when editing page
                this.lineTo(coordinate[0], coordinate[1], options);
            }
        } else {
            this.lineTo(coordinate[0], coordinate[1], options);
        }
    });
    return this;
};
