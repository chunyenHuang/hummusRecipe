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
    const context = this.pageContext;
    if (options.stroke || options.color) {
        const pathOptions = this._getPathOptions(options);
        pathOptions.type = 'stroke';
        pathOptions.color = pathOptions.stroke || pathOptions.color;
        context.drawCircle(nx, ny, radius, pathOptions);
    }
    if (options.fill || options.color) {
        const pathOptions = this._getPathOptions(options);
        pathOptions.type = 'fill';
        pathOptions.color = pathOptions.fill || pathOptions.color;
        context.drawCircle(nx, ny, radius, pathOptions);
    }
    return this;
}

/**
 * Draw a rectangle
 */
exports.rectangle = function rectangle(x, y, width, height, options = {}) {
    const { nx, ny } = this._calibrateCoorinate(x, y, 0, -height);
    const context = this.pageContext;
    if (options.stroke || options.color) {
        const pathOptions = this._getPathOptions(options);
        pathOptions.type = 'stroke';
        pathOptions.color = pathOptions.stroke || pathOptions.color;
        context.drawRectangle(nx, ny, width, height, pathOptions);
    }
    if (options.fill || options.color) {
        const pathOptions = this._getPathOptions(options);
        pathOptions.type = 'fill';
        pathOptions.color = pathOptions.fill || pathOptions.color;
        context.drawRectangle(nx, ny, width, height, pathOptions);
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

/**
 * get options for drawings
 */
exports._getPathOptions = function _getPathOptions(options = {}) {
    const defaultFont = this.writer.getFontForFile(this.fonts['arial']);

    const pathOptions = {
        font: defaultFont,
        size: 14,
        underline: false,
        color: transformColor(), //0xFF000000,
        colorspace: 'rgb', // gray rgb cmyk
        width: 4,
        align: options.align
    };
    if (options.font) {
        const matchedFont = this.fonts[options.font.toLowerCase()];
        if (matchedFont) {
            pathOptions.font = this.writer.getFontForFile(matchedFont);
        }
    }

    if (options.size || options.fontSize) {
        pathOptions.size = options.size || options.fontSize;
    }
    if (options.width || options.lineWidth) {
        pathOptions.width = options.width || options.lineWidth;
    }
    if (options.stroke) {
        pathOptions.stroke = transformColor(options.stroke);
    }
    if (options.fill) {
        pathOptions.fill = transformColor((options.fill));
    }
    if (options.color || options.colour) {
        // DarkMagenta
        // transform color from rgb hex to 0x
        pathOptions.color = transformColor((options.color || options.colour));
    }
    return pathOptions;
}

function transformColor(code = '1777d1') {
    // 0x1777d1
    if (Array.isArray(code)) {
        code = rgbToHexCode(code);
    } else {
        code = code.replace('#', '');
    }
    code = `0x${code.toUpperCase()}`;
    const number = parseInt(code, 16);
    return number;
}

function rgbToHexCode(rgb = []) {
    let code = '';
    rgb.forEach((item) => {
        let hex = item.toString(16);
        hex = (hex.length == 1) ? '0' + hex : hex;
        code += hex;
    });
    return code;
}
