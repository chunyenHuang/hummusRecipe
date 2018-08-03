exports._getPathOptions = function _getPathOptions(options = {}, originX, originY) {
    const defaultFont = this.writer.getFontForFile(this.fonts['helvetica']);

    const pathOptions = {
        originX,
        originY,
        font: defaultFont,
        fonts: {
            bold: this.writer.getFontForFile(this.fonts['helvetica-bold']),
            regular: defaultFont,
            italic: this.writer.getFontForFile(this.fonts['helvetica-italic']),
            boldItalic: this.writer.getFontForFile(this.fonts['helvetica-bold-italic'])
        },
        size: 14,
        underline: false,
        color: transformColor(), //0xFF000000,
        colorspace: 'rgb', // gray rgb cmyk
        colorRGB: [],
        width: 2,
        align: options.align
    };
    if (options.font) {
        const matchedFont = this.fonts[options.font.toLowerCase()];
        if (matchedFont) {
            pathOptions.font = this.writer.getFontForFile(matchedFont);
        }
    }
    if (options.opacity == void(0) || isNaN(options.opacity)) {
        options.opacity = 1;
    } else {
        options.opacity = (options.opacity < 0) ? 0 :
            (options.opacity > 1) ? 1 : options.opacity;
    }
    pathOptions.opacity = options.opacity;
    const extGStates = this._createExtGStates(options.opacity);
    pathOptions.strokeGsId = extGStates.stroke;
    pathOptions.fillGsId = extGStates.fill;

    if (options.size || options.fontSize) {
        const size = options.size || options.fontSize;
        if (!isNaN(size)) {
            pathOptions.size = (size <= 0) ? 1 : size;
        }
    }
    if (options.width || options.lineWidth) {
        const width = options.width || options.lineWidth;
        if (!isNaN(width)) {
            pathOptions.width = (width <= 0) ? 1 : width;
        }
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

    pathOptions.colorRGB = transformColorToRGB((options.color || options.colour || '#000000'));

    // rotation
    if (options.rotation !== void(0)) {
        const rotation = parseFloat(options.rotation);
        pathOptions.rotation = rotation;
        pathOptions.rotationOrigin = options.rotationOrigin || null;
    }

    // Page 127
    pathOptions.dash = (Array.isArray(options.dash)) ? options.dash : [];
    pathOptions.dashPhase = (!isNaN(options.dashPhase)) ? options.dashPhase : 0;
    if (pathOptions.dash[0] == 0 && pathOptions.dash[1] == 0) {
        pathOptions.dash = [];
        pathOptions.dashPhase = 0;
    }
    return pathOptions;
}

exports._createExtGStates = function _createExtGStates(value) {
    this.extGStates = this.extGStates || {};
    if (this.extGStates[value]) return this.extGStates[value];

    const write = (key, value) => {
        this.pauseContext();
        const objCxt = this.writer.getObjectsContext();
        const gsId = objCxt.startNewIndirectObject();
        const dict = objCxt.startDictionary()
        dict.writeKey('type');
        dict.writeNameValue('ExtGState');
        dict.writeKey(key);
        objCxt.writeNumber(value);
        objCxt.endLine();
        objCxt.endDictionary(dict);
        this.resumeContext();
        return gsId;
    }
    this.extGStates[value] = {
        stroke: write('CA', value),
        fill: write('ca', value)
    };
    return this.extGStates[value];
}

exports._transformColor = transformColor;

function transformColorToRGB(code) {
    return (Array.isArray(code)) ? code : hexToRgb(code);
}

function transformColor(code = '') {
    const defaultColor = '1777d1';
    // 0x1777d1
    if (Array.isArray(code)) {
        code = rgbToHexCode(code);
    } else {
        code = code.replace('#', '');
    }
    if (code.toString().length != 6) {
        code = defaultColor;
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

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

exports._colorNumberToRGB = function(bigint) {
    if (!bigint) return { r: 0, g: 0, b: 0 };
    return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255
    }
}

exports._getDistance = function _getDistance(coordA, coordB) {
    const disX = Math.abs(coordB[0] - coordA[0]);
    const disY = Math.abs(coordB[1] - coordB[1]);
    const distance = Math.sqrt(((disX * disX) + (disY * disY)))

    return distance;
}

exports._getTransformParams = function _getTransformParams(inAngle, x, y, offsetX, offsetY) {
    const theta = 2 * Math.PI * ((inAngle % 360) / 360);
    const cosTheta = Math.cos(theta);
    const sinTheta = Math.sin(theta);
    const nx = (cosTheta * -offsetX) + (sinTheta * -offsetY);
    const ny = (cosTheta * -offsetY) - (sinTheta * -offsetX);
    return [cosTheta, -sinTheta, sinTheta, cosTheta, x - nx, y - ny];
}
