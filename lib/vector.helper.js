const xObjectForm = require('./xObjectForm');

exports._getPathOptions = function _getPathOptions(options = {}, originX, originY) {
    const colorspace = options.colorspace || this.options.colorspace;
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
        color: transformColor(options.color, colorspace),
        colorspace,
        colorArray: [],
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
        pathOptions.strokeModel = transformColor(options.stroke, colorspace, true);
        pathOptions.stroke = pathOptions.strokeModel.color;
    }

    if (options.fill) {
        pathOptions.fillModel = transformColor(options.fill, colorspace, true);
        pathOptions.fill = pathOptions.fillModel.color;
    }

    pathOptions.colorModel = transformColor((options.color || options.colour), colorspace, true);
    pathOptions.color = pathOptions.colorModel.color;
    pathOptions.colorspace = pathOptions.colorModel.colorspace;

    // rotation
    if (options.rotation !== void(0)) {
        const rotation = parseFloat(options.rotation);
        pathOptions.rotation = rotation;
        pathOptions.rotationOrigin = options.rotationOrigin || null;
    }

    // skew
    if (options.skewX !== void(0)) {
        pathOptions.skewX = options.skewX;
    }

    if (options.skewY != void(0)) {
        pathOptions.skewY = options.skewY;
    }

    // Page 127
    pathOptions.dash = (Array.isArray(options.dash)) ? options.dash : [];
    pathOptions.dashPhase = (!isNaN(options.dashPhase)) ? options.dashPhase : 0;
    if (pathOptions.dash[0] == 0 && pathOptions.dash[1] == 0) {
        pathOptions.dash = [];
        pathOptions.dashPhase = 0;
    }
    return pathOptions;
};

exports._createExtGStates = function _createExtGStates(value) {
    this.extGStates = this.extGStates || {};
    if (this.extGStates[value]) {
        return this.extGStates[value];
    }

    const write = (key, value) => {
        this.pauseContext();
        const objCxt = this.writer.getObjectsContext();
        const gsId = objCxt.startNewIndirectObject();
        const dict = objCxt.startDictionary();
        dict.writeKey('type');
        dict.writeNameValue('ExtGState');
        dict.writeKey(key);
        objCxt.writeNumber(value);
        objCxt.endLine();
        objCxt.endDictionary(dict);
        this.resumeContext();
        return gsId;
    };
    this.extGStates[value] = {
        stroke: write('CA', value),
        fill: write('ca', value)
    };
    return this.extGStates[value];
};

function _defaultColor(colorspace='rgb') {
    let defaultColor;
    switch (colorspace) {
    case 'cmyk':
        defaultColor = 'FF000000';
        break;
    case 'gray':
        defaultColor = '00';
        break;
    case 'rgb':
    default:
        defaultColor = '1777d1';
        break;
    }

    return defaultColor;
}

/**
 * Convert given color code int color model object
 * 
 * ColorModel consists of: {
 *   color: number, 
 *   colorspace: string {'rgb', 'cmyk', 'gray'}, 
 *   (colorspace == 'rgb')  r, g, b
 *   (colorspace == 'cmyk') c, m, y, k
 *   (colorspace == 'gray') gray
 * }
 * 
 * where r,g,b,c,m,y,k,gray are all numbers between 0 and 1
 * 
 * @param {string} code the color encoding as HexColor
 * @returns {any} the color model
 */
function toColorModel(code) {
    const cmodel = {};
    const color = hexToArray(code);    

    cmodel.color = parseInt(code, 16);
    
    // The ultimate decider of color space is length of input
    
    switch (color.length) {
        default:
            color = hexToArray(_defaultColor('rgb'));
            // purposely want to fall through to 'rgb' case below.
        case 3:
            cmodel.colorspace = 'rgb';
            cmodel.r = color[0];
            cmodel.g = color[1];
            cmodel.b = color[2];
            break;
    
        case 4:
            cmodel.colorspace = 'cmyk';
            cmodel.c = color[0];
            cmodel.m = color[1];
            cmodel.y = color[2];
            cmodel.k = color[3];
            break;
        
        case 1:
            cmodel.colorspace = 'gray';
            cmodel.gray = color[0];
            break;
    }

    return cmodel;
}

exports._transformColor = transformColor;

function transformColor(code = '', colorspace='', wantColorModel = false) {
    let defaultColor = _defaultColor(colorspace);
    let transformation;

    if (Array.isArray(code)) {
        code = arrayToHex(code);
    } else {
        code = code.replace('#', '');
    }

    // Suppply default color:
    //  when colorspace is given and given color code does not have appropriate length, or
    //  when colorspace is missing, verify allowable hex value sizes for gray, rgb, or cmyk
    if ( colorspace !== '' && code.length != defaultColor.length || 
         ! [2,6,8].includes(code.toString().length)) {
        code = defaultColor;
    }

    if (wantColorModel) {
        transformation = toColorModel(code);
    } else {
        transformation = parseInt(`0x${code.toUpperCase()}`, 16);
    }

    return transformation;
}

function arrayToHex(color = []) {
    let code = '';
    color.forEach((item) => {
        let hex = item.toString(16);
        hex = (hex.length == 1) ? '0' + hex : hex;
        code += hex;
    });
    return code;
}

function hexToArray(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})?([a-f\d]{2})?([a-f\d]{2})?$/i.exec(hex);
    return result
        .reduce((array, item, index) => {
            if (index >= 1 && index <= (hex.length / 2)) {
                array.push(parseInt(item, 16) / 255);
            }
            return array;
        }, []);
}

exports._colorNumberToRGB = (bigint) => {
    if (!bigint) {
        return {
            r: 0,
            g: 0,
            b: 0
        };
    } else {
        return {
            r: (bigint >> 16) & 255,
            g: (bigint >> 8) & 255,
            b: bigint & 255
        };
    }
};

exports._getDistance = function _getDistance(coordA, coordB) {
    const disX = Math.abs(coordB[0] - coordA[0]);
    const disY = Math.abs(coordB[1] - coordB[1]);
    const distance = Math.sqrt(((disX * disX) + (disY * disY)));

    return distance;
};

exports._getTransformParams = getTransformParams;

function getTransformParams(inAngle, x, y, offsetX, offsetY) {
    const theta = toRadians(inAngle);
    const cosTheta = Math.cos(theta);
    const sinTheta = Math.sin(theta);
    const nx = (cosTheta * -offsetX) + (sinTheta * -offsetY);
    const ny = (cosTheta * -offsetY) - (sinTheta * -offsetX);
    return [cosTheta, -sinTheta, sinTheta, cosTheta, x - nx, y - ny];
};

exports._setRotationContext = function _setRotationTransform(context, x, y, options) {
    if (options.rotation === void(0)) {
        context.cm(1, 0, 0, 1, x, y); // no rotation
    } else {
        const rotationOrigin = (
            options.rotationOrigin &&
            Array.isArray(options.rotationOrigin) &&
            options.rotationOrigin.length == 2
        ) ? options.rotationOrigin : [options.originX, options.originY];

        const deltaY = (options.deltaY) ? options.deltaY : 0;

        const rm = getTransformParams( // rotation matrix
            options.rotation, rotationOrigin[0], rotationOrigin[1],
            x - rotationOrigin[0], y - rotationOrigin[1] - deltaY
        );

        context.cm(rm[0], rm[1], rm[2], rm[3], rm[4], rm[5]);
    }
};

function toRadians(angle) {
    return 2 * Math.PI * ((angle % 360) / 360);
}

function getSkewTransform(skewXAngle= 0 , skewYAngle = 0) {
    const alpha = toRadians(skewXAngle);
    const beta  = toRadians(skewYAngle);
    const tanAlpha = Math.tan(alpha);
    const tanBeta  = Math.tan(beta);

    return [1, tanAlpha, tanBeta, 1, 0, 0];
}

exports._setSkewContext = function _setSkewTransform(context, options) {
    if (options.skewX || options.skewY) {
        const sm = getSkewTransform(options.skewX, options.skewY);

        context.cm(sm[0], sm[1], sm[2], sm[3], sm[4], sm[5]);
    }
};

exports._drawObject = function _drawObject(self, x, y, width, height, options, callback) {

    self.pauseContext();

    const xObject = new xObjectForm(self.writer, width, height);
    const xObjectCtx = xObject.getContentContext();

    xObjectCtx.q();
    callback(xObjectCtx, xObject);
    xObjectCtx.Q();
    xObject.end();

    self.resumeContext();

    const context = self.pageContext;
    context.q();
    self._setRotationContext(context, x, y, options);
    self._setSkewContext(context, options);
    context
        .doXObject(xObject)
        .Q();

};
