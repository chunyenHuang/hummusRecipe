const hummus = require('hummus');
const fs = require('fs');

this.knownColors = {  // knownColors.colorspace.colorName = value
    rgb: {
        red    : 'ff0000',
        green  : '00ff00',
        blue   : '0000ff',
    },
    cmyk: {
        cyan   : 'ff000000',
        magenta: '00ff0000',
        yellow : '0000ff00',
        black  : '000000ff'
    },
    gray: {
        white  : 'ff',
        black  : '00'
    },
    separation : {              // meant for printing, so using cmyk values initially
        cyan   : 'ff000000',
        magenta: '00ff0000',
        yellow : '0000ff00',
        black  : '000000ff',
        nans   : '%,35,6,0'   // a great PDF collaborator!
    }
};

/**
 * Associate color values to names
 *
 * The colorspace parameter is optional. When it is missing, the colorspace
 * is automatically determined by the given color value. Note that the special
 * PDF color space called 'separation' may also be used. The color value is then
 * treated as the alternative color when the named 'separation' color is unavailable.
 *
 * If the 'name' parameter is '!load', the second parameter is the name of a JSON
 * formatted file containing a formatted list of defined colors associated with the
 * color spaces rgb, cmyk, gray, or separation (think PANTONE color definitions).
 * This file will be merged with existing set of known colors. The color values
 * must be specified as hex values.
 *
 * For example,
 *   {
 *      'rgb':  {'purple':'ff00ff', 'red':'#ff0000'},
 *      'cmyk': {'cyan':'ff000000', 'magenta':'%0,100,0,0'},
 *      'gray': {'grey':'#33'}
 *   }
 *
 * @name chroma
 * @function
 * @memberof Recipe
 * @param {string} name - the name to be associated to given color value, or '!load'
 * @param {string|number[]} value - the color value (HexColor, DecimalColor, or PercentColor), or name of '!load' file
 * @param {string} colorspace - one of the followning: 'rgb', 'cmyk', 'gray', 'separation';
 */
exports.chroma = function chroma(name, value, colorspace='') {
    if (name) {
        if (name === '!load') {
            let newColors = JSON.parse(fs.readFileSync(value));
            // Add new colors to existing colorspaces
            for (let cs in newColors) {
                if (this.knownColors[cs]) {
                    Object.assign(this.knownColors[cs], newColors[cs]);
                } else {
                    throw new Error(`Unrecognized colorspace: ${cs}`);
                }
            }
        } else {
            if (Array.isArray(value)) {
                value = arrayToHex(value);
            } else if (value.startsWith('%')) {
                value = percentToHex(value.replace('%', ''));
            } else {
                value = value.replace('#', '');
            }

            // Only deal with valid hex codes from the
            // device colorspaces gray, rgb, and cmyk.
            if (![2,6,8].includes(value.toString().length)) {
                throw new Error('Color value has incorrect size for gray, rgb, or cmyk colorspaces');
            }

            // Determine colorspace by length of given input
            // value when colorspace not provided in call.
            if (colorspace === '') {
                const colorSpaces = {2:'gray', 6:'rgb', 8:'cmyk'};
                colorspace = colorSpaces[`${value.length}`];
            } else if (!['rgb','cmyk','gray','separation'].includes(colorspace)) {
                throw new Error(`Unknown colorspace: ${colorspace}.`);
            }

            if (colorspace) {
                this.knownColors[colorspace][name] = value;
            }
        }
    }

    return this;
};

function createColorSpaces(self, colorName, color) {
    const deviceCS =  {1:'DeviceGray', 3:'DeviceRGB', 4:'DeviceCMYK'};
    const altCS = deviceCS[`${color.length}`];
    this.colorSpaces = this.colorSpaces || {};
    this.colorSpaces[altCS] = this.colorSpaces[altCS] || {};
    let colorSpaceID = this.colorSpaces[altCS][colorName];

    if (!colorSpaceID) {
        const transformFunction = tintTransform(self, color);
        self.pauseContext();
        const objCxt = self.writer.getObjectsContext();
        colorSpaceID = objCxt.startNewIndirectObject();
        objCxt
            .startArray()
            .writeName('Separation')
            .writeName(colorName)
            .writeName(altCS)
            .writeIndirectObjectReference(transformFunction)
            .endArray(hummus.eTokenSeparatorEndLine)
            .endIndirectObject();
        self.resumeContext();
        this.colorSpaces[altCS][colorName] = colorSpaceID;
    }

    return colorSpaceID;
}

function tintTransform(self, color) {
    const rangeCount = color.length;
    self.pauseContext();
    const objCxt = self.writer.getObjectsContext();
    const tintFuncID = objCxt.startNewIndirectObject();
    const dict = objCxt.startDictionary();
    dict
        .writeKey('FunctionType')
        .writeNumberValue(2)
        .writeKey('Domain');
    objCxt
        .startArray()
        .writeNumber(0.0)
        .writeNumber(1.0)
        .endArray();
    dict.writeKey('Range');
    objCxt.startArray();
    for (let index = 0; index < rangeCount; index++) {
        objCxt.writeNumber(0.0).writeNumber(1.0);
    }
    objCxt.endArray();
    dict.writeKey('N');
    dict.writeNumberValue(1);
    dict.writeKey('C0');
    objCxt.startArray();
    for (let index = 0; index < rangeCount; index++) {
        objCxt.writeNumber(0.0);
    }
    objCxt.endArray();

    dict.writeKey('C1');
    objCxt.startArray();
    for (let index = 0; index < rangeCount; index++) {
        objCxt.writeNumber(color[index]);
    }
    objCxt.endArray();
    objCxt.endDictionary(dict);
    objCxt.endIndirectObject();
    self.resumeContext();

    return tintFuncID;
}

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
        objCxt.endIndirectObject(); // new here [seh]
        this.resumeContext();
        return gsId;
    };
    this.extGStates[value] = {
        stroke: write('CA', value),
        fill:   write('ca', value)
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
 * @param {string} colorspace the name of the colorspace of given color code
 * @param {string} colorName the name to be associated with given color code
 * @returns {any} the color model
 */
function toColorModel(self, code, colorspace, colorName) {
    const cmodel = {};
    let color = hexToArray(code);

    cmodel.color = parseInt(code, 16);

    // The initial decider of color space is length of given 'code'.

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

    // When creating a separation color space,
    // use the colorspace from above as the
    // alternative color transformation when
    // the named color is unavailable.
    if (colorspace === 'separation' && colorName !== '') {
        cmodel.colorspace = colorspace;
        cmodel.colorName = colorName;
        cmodel.colorspaceId = createColorSpaces(self, colorName, color);
    }

    return cmodel;
}

/**
 * Convert percentage string into hex string (x / 100 * 255)
 *
 * @param {string} code numbers separated by commas with values ranging between 0-100.
 * @returns {string} massaged hexadecimal string that can be used as input to hexToArray.
 */
function percentToHex(code) {
    return arrayToHex(code.split(',').map( x => Math.round(x * 2.55)) );
}

/**
 * Transform color code into numeric value or colorModel
 *
 * @param code color specification in form of HexColor (string, begins with '#'),
 *             DecimalColor (1, 3, or 4 element array with values between 0-255),
 *             PercentColor (string, begins with '%' followed by values separated
 *             by commas with values between 0-100)
 */
exports._transformColor = function _transformColor(code = '', opt = {}) {
    this.knownColors   = this.knownColors || {};
    let colorspace     = opt.colorspace || 'rgb';
    let wantColorModel = opt.wantColorModel || false;
    let colorName      = opt.colorName || '';
    let defaultColor   = _defaultColor(colorspace);
    let transformation;

    if (Array.isArray(code)) {
        code = arrayToHex(code);
    } else if (code.startsWith('#')){
        code = code.replace('#', '');
    } else if (code.startsWith('%')) {
        code = percentToHex(code.replace('%', ''));
    } else if (code !== '') {
        let color = this.knownColors[colorspace][code];  // assuming code is a color name
        if (!color) {
            color = '';
            code = defaultColor;
        } else {
            colorName = code;

            // The following handles known colors in hex form,
            // with or without initial '#' and percent form.
            if (color.startsWith('#')) {
                code = color.replace('#','');
            } else if (color.startsWith('%')) {
                code = percentToHex(color.replace('%', ''));
            } else {
                code = color;
            }
        }
    }

    // When colorspace is not explicitly given,
    // use size of value to determine colorspace.
    if (!opt.colorspace) {
        colorspace = {2:'gray', 6:'rgb', 8:'cmyk'}[`${code.length}`] || 'rgb';
        defaultColor = _defaultColor(colorspace);
    }

    // Suppply default color:
    //  when colorspace is given and given color code does not have appropriate length, or
    //  when colorspace is missing, verify allowable hex value sizes for rgb, cmyk, or gray.
    if ( ['rgb','cmyk','gray'].includes(colorspace) && code.length != defaultColor.length ||
         ! [2,6,8].includes(code.toString().length)) {
        code = defaultColor;
    }

    if (wantColorModel) {
        transformation = toColorModel(this, code, colorspace, colorName);
        if ( colorName && !this.knownColors[colorspace][colorName]) {
            this.chroma(colorName, code, colorspace);
        }
    } else {
        transformation = parseInt(`0x${code.toUpperCase()}`, 16);
    }

    return transformation;
};

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
            g: (bigint >>  8) & 255,
            b: bigint & 255
        };
    }
};
