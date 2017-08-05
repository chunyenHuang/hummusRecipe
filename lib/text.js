const fs = require('fs');
const path = require('path');

/**
 * Write texts
 * @name text
 * @function
 * @memberof Recipe
 * @param {string} text - The text content
 * @param {number} x - The coordinate x
 * @param {number} y - The coordinate y
 * @param {Object} [options] - The options
 * @param {string|number[]} [options.color] - HexColor or RGB
 * @param {string} [options.font] - The font. 'Arial', 'Helvetica'...
 * @param {number} [options.size] - The line width
 * @param {string} [options.align] - The alignment. 'center center'... 
 */
exports.text = function text(text = '', x, y, options = {}) {
    if (!this.pageContext) return this;
    const pathOptions = this._getPathOptions(options);
    const { offsetX, offsetY } = this._getTextOffset(text, pathOptions);
    const { nx, ny } = this._calibrateCoorinate(x, y, offsetX, offsetY);

    const context = this.pageContext;
    context.writeText(text, nx, ny, pathOptions);
    return this;
}

/**
 * Register a custom font
 * @name registerFont
 * @function
 * @memberof Recipe
 * @param {string} fontName - The font name will be used in text
 * @param {string} fontSrcPath - The path to the font file.
 */
exports.registerFont = function registerFont(fontName = '', fontSrcPath = '') {
    return this._registerFont(fontName, fontSrcPath);
}

exports._loadFonts = function _loadFonts(fontSrcPath) {
    fs.readdirSync(fontSrcPath).forEach((file) => {
        const fontName = file.replace('.ttf', '');
        return this._registerFont(fontName, path.join(fontSrcPath, file));
    });
};

exports._registerFont = function _registerFont(fontName, fontSrcPath) {
    this.fonts = this.fonts || {};
    // check fontSrcPath
    this.fonts[fontName.toLowerCase()] = fontSrcPath;
}

exports._getTextOffset = function _getTextOffset(text = '', options = {}) {
    if (!options.size || !options.font) return;
    let offsetX = 0;
    let offsetY = 0;
    const textDimensions = options.font.calculateTextDimensions(text, options.size);
    if (options.align) {
        const alignments = options.align.split(' ');
        if (alignments[0]) {
            switch (alignments[0]) {
                case 'center':
                    offsetX = -1 * textDimensions.width / 2;
                    break;
                case 'right':
                    offsetX = textDimensions.width / 2;
                    break;
                default:
            }
        }
        if (alignments[1]) {
            switch (alignments[1]) {
                case 'center':
                    offsetY = -1 * textDimensions.yMax / 2;
                    break;
                case 'bottom':
                    offsetY = textDimensions.yMax / 2;
                    break;
                default:
            }
        }
    }
    return { offsetX, offsetY };
}
