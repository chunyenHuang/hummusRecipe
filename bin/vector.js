const xObjectForm = require('./xObjectForm');
/**
 * move the current position to target position
 */
exports.moveTo = function moveTo(x, y) {
    const { nx, ny } = this._calibrateCoorinate(x, y);
    this._position = {
        x: nx,
        y: ny
    };
    return this;
}

/**
 * Draw a line from current position
 */
exports.lineTo = function lineTo(x, y, options = {}) {
    const fromX = this._position.x;
    const fromY = this._position.y;
    const { nx, ny } = this._calibrateCoorinate(x, y);
    const context = this.pageContext;
    const pathOptions = this._getPathOptions(options);
    context.drawPath(fromX, fromY, nx, ny, pathOptions);
    this.moveTo(x, y);
    return this;
}

/**
 * Draw a polygon
 * TODO: fill polygon
 */
exports.polygon = function polygon(coordinates = [], options = {}) {
    coordinates.forEach((coord, index) => {
        if (index === 0) {
            this.moveTo(coord[0], coord[1], options);
        } else {
            this.lineTo(coord[0], coord[1], options);
        }
    });
    return this;
}

/**
 * Draw a circle
 */
exports.circle = function circle(x, y, radius, options = {}) {
    const { nx, ny } = this._calibrateCoorinate(x, y);
    if (options.stroke || options.color) {
        const pathOptions = this._getPathOptions(options);
        pathOptions.type = 'stroke';
        pathOptions.color = pathOptions.stroke || pathOptions.color;
        const context = this.pageContext;
        context.drawCircle(nx, ny, radius, pathOptions);
    }
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
    return this;
}

/**
 * Draw a rectangle
 */
exports.rectangle = function rectangle(x, y, width, height, options = {}) {
    const { nx, ny } = this._calibrateCoorinate(x, y, 0, -height);

    if (options.stroke) {
        const pathOptions = this._getPathOptions(options);
        pathOptions.type = 'stroke';
        pathOptions.color = pathOptions.stroke || pathOptions.color;
        const context = this.pageContext;
        context.q();
        // context.gs(options.strokeGsName);
        context.drawRectangle(nx, ny, width, height, pathOptions);
        context.Q();
    }
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

    return this;
}

/**
 * set the default width for the following drawings
 */
exports.lineWidth = function lineWidth(width = 1) {
    return this;
}

/**
 * set the default opacity for the following drawings
 */
exports.fillOpacity = function fillOpacity(opacity = 1) {
    return this;
}

/**
 * set the default fill color for the following drawings
 */
exports.fill = function fill(color) {
    return this;
}

/**
 * set the default stroke color for the following drawings
 */
exports.stroke = function stroke(color) {
    return this;
}

/**
 * set the default fill and stroke color for the following drawings
 */
exports.fillAndStroke = function fillAndStroke(color) {
    return this;
}