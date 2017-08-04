exports._getPathOptions = function _getPathOptions(options = {}) {
    const defaultFont = this.writer.getFontForFile(this.fonts['arial']);

    const pathOptions = {
        font: defaultFont,
        size: 14,
        underline: false,
        color: transformColor(), //0xFF000000,
        colorspace: 'rgb', // gray rgb cmyk
        width: 2,
        align: options.align
    };
    if (options.font) {
        const matchedFont = this.fonts[options.font.toLowerCase()];
        if (matchedFont) {
            pathOptions.font = this.writer.getFontForFile(matchedFont);
        }
    }

    if (!options.opacity || isNaN(options.opacity)) {
        options.opacity = 1;
    } else {
        options.opacity = (options.opacity < 0) ? 0 :
            (options.opacity > 1) ? 1 : options.opacity;
    }
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
    if (!bigint) return;
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
