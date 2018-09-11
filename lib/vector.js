const xObjectForm = require('./xObjectForm');

/**
 * Draw a circle
 * @name circle
 * @function
 * @memberof Recipe
 * @param {number} x - The coordinate x
 * @param {number} y - The coordinate y
 * @param {number} radius - The radius
 * @param {Object} [options] - The options
 * @param {string|number[]} [options.color] - HexColor or RGB
 * @param {string|number[]} [options.stroke] - HexColor or RGB
 * @param {string|number[]}[ options.fill] - HexColor or RGB
 * @param {number} [options.lineWidth] - The line width
 * @param {number} [options.opacity] - The opacity
 * @param {number[]} [options.dash] - The dash style [number, number]
 */
exports.circle = function circle(x, y, radius, options = {}) {
    const { nx, ny } = this._calibrateCoordinate(x, y);

    if (options.fill || options.color) {
        const pathOptions = this._getPathOptions(options);
        pathOptions.type = 'fill';
        pathOptions.color = pathOptions.fill || pathOptions.color;

        this.pauseContext();
        const xObject = new xObjectForm(this.writer, radius * 2, radius * 2);
        xObject.getContentContext()
            .q()
            .gs(xObject.getGsName(pathOptions.fillGsId))
            .drawCircle(radius, radius, radius, pathOptions)
            .Q();
        xObject.end();
        this.resumeContext();
        const context = this.pageContext;
        context.q()
            .cm(1, 0, 0, 1, nx - radius, ny - radius)
            .doXObject(xObject)
            .Q();
        // context.drawCircle(nx, ny, radius, pathOptions);
    }
    if (options.stroke || options.color) {
        const pathOptions = this._getPathOptions(options);
        pathOptions.type = 'stroke';
        pathOptions.color = pathOptions.stroke || pathOptions.color;
        const context = this.pageContext;
        context.q();
        context.d(pathOptions.dash, pathOptions.dashPhase)
        context.drawCircle(nx, ny, radius, pathOptions);
        context.Q();
    }
    return this;
}

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
 * @param {string|number[]} [options.color] - HexColor or RGB
 * @param {string|number[]} [options.stroke] - HexColor or RGB
 * @param {string|number[]} [options.fill] - HexColor or RGB
 * @param {number} [options.lineWidth] - The line width
 * @param {number} [options.opacity] - The opacity
 * @param {number[]} [options.dash] - The dash style [number, number]
 */
exports.rectangle = function rectangle(x, y, width, height, options = {}) {
    const { nx, ny } = (!options.dontTranslate) ? this._calibrateCoordinate(x, y, 0, -height): { nx: x, ny: y };
    if (options.fill || options.color) {
        const pathOptions = this._getPathOptions(options);
        pathOptions.type = 'fill';
        pathOptions.color = pathOptions.fill || pathOptions.color;

        this.pauseContext();
        const xObject = new xObjectForm(this.writer, width, height);
        xObject.getContentContext()
            .q()
            .gs(xObject.getGsName(pathOptions.fillGsId))
            .drawRectangle(0, 0, width, height, pathOptions)
            .Q();
        xObject.end();
        this.resumeContext();

        const context = this.pageContext;
        context.q()
            .cm(1, 0, 0, 1, nx, ny)
            .doXObject(xObject)
            .Q();
    }

    if (options.stroke) {
        const pathOptions = this._getPathOptions(options);
        pathOptions.type = 'stroke';
        pathOptions.color = pathOptions.stroke || pathOptions.color;
        const context = this.pageContext;
        context.q();
        context.d(pathOptions.dash, pathOptions.dashPhase)
        context.drawRectangle(nx, ny, width, height, pathOptions);
        context.Q();
    }

    return this;
}

exports.lineWidth = function lineWidth(width = 1) {
    return this;
}

exports.fillOpacity = function fillOpacity(opacity = 1) {
    return this;
}

exports.fill = function fill(color) {
    return this;
}

exports.stroke = function stroke(color) {
    return this;
}

exports.fillAndStroke = function fillAndStroke(color) {
    return this;
}
