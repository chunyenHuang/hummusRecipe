const fs = require('fs');
const path = require('path');
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
};

exports._loadFonts = function _loadFonts(fontSrcPath) {
    const fontTypes = ['.ttf', '.ttc', '.otf'];
    fs
        .readdirSync(fontSrcPath)
        .filter((file) => {
            return fontTypes.includes(path.extname(file).toLowerCase());
        })
        .forEach((file) => {
            const fontName = path.basename(file, path.extname(file));
            return this._registerFont(fontName, path.join(fontSrcPath, file));
        });
};

exports._registerFont = function _registerFont(fontName, fontSrcPath) {
    this.fonts = this.fonts || {};
    // check fontSrcPath
    this.fonts[fontName.toLowerCase()] = fontSrcPath;
};
