const xObjectForm = require('./xObjectForm');

/**
 * move the current position to target position
 * @name moveTo
 * @function
 * @memberof Recipe
 * @param {number} x - The coordinate x
 * @param {number} y - The coordinate y
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
 * @name lineTo
 * @function
 * @memberof Recipe
 * @param {number} x - The coordinate x
 * @param {number} y - The coordinate y
 * @param {Object} [options] - The options
 * @param {string|number[]} [options.color] - HexColor or RGB
 * @param {string|number[]} [options.stroke] - HexColor or RGB
 * @param {string|number[]} [options.fill] - HexColor or RGB
 * @param {number} [options.lineWidth] - The line width
 * @param {number} [options.opacity] - The opacity
 */
exports.lineTo = function lineTo(x, y, options = {}) {
    const fromX = this._position.x;
    const fromY = this._position.y;
    const { nx, ny } = this._calibrateCoorinate(x, y);
    const context = this.pageContext;
    const pathOptions = this._getPathOptions(options);
    pathOptions.type = 'stroke';
    pathOptions.color = pathOptions.stroke || pathOptions.color;
    context.q();
    context.d(pathOptions.dash, pathOptions.dashPhase)            
    context.drawPath(fromX, fromY, nx, ny, pathOptions);
    context.Q();
    this.moveTo(x, y);
    return this;
}

/**
 * Draw a line 
 * @name line
 * @function
 * @memberof Recipe
 * @param {number[]} coordinates - The array of coordinate [[x,y], [m,n]]
 * @param {Object} [options] - The options
 * @param {string|number[]} [options.color] - HexColor or RGB
 * @param {string|number[]} [options.stroke] - HexColor or RGB
 * @param {number} [options.lineWidth] - The line width
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
}

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
 */
exports.polygon = function polygon(coordinates = [], options = {}) {
    if (this._getDistance(coordinates[0], coordinates[coordinates.length - 1]) != 0) {
        coordinates.push(coordinates[0]);
    }
    let boundBox = [ /*minX, minY, maxX, maxY*/ ];
    coordinates.forEach((coord, index) => {
        if (index === 0) {
            boundBox = [coord[0], coord[1], coord[0], coord[1]]
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
    // const { nx, ny } = this._calibrateCoorinate(startX, startY + height);

    const xObject = new xObjectForm(this.writer, width, height);
    const xObjectCtx = xObject.getContentContext();

    const colorInRGB = this._colorNumberToRGB(pathOptions.color);
    const strokeInRGB = this._colorNumberToRGB(pathOptions.stroke);
    const fillInRGB = this._colorNumberToRGB(pathOptions.fill);

    function draw(context, coordinates) {
        coordinates.forEach((coord, index) => {
            if (index === 0) {
                context.m(coord[0] - startX, coord[1] - startY);
            } else {
                context.l(coord[0] - startX, coord[1] - startY);
            }
        });
    }
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

    const { nx, ny } = this._calibrateCoorinate(startX, startY + height);
    const context = this.pageContext;
    context.q()
        .cm(-1, 0, 0, -1, nx + width, ny + height)
        .doXObject(xObject)
        .Q();

    return this;
}

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
 */
exports.circle = function circle(x, y, radius, options = {}) {
    const { nx, ny } = this._calibrateCoorinate(x, y);

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
 */
exports.rectangle = function rectangle(x, y, width, height, options = {}) {
    const { nx, ny } = this._calibrateCoorinate(x, y, 0, -height);

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
