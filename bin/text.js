const fs = require('fs');
const path = require('path');

exports._loadFonts = function _loadFonts(fontSrcPath) {
    const fonts = {};
    fs.readdirSync(fontSrcPath).forEach((file) => {
        const fontName = file.replace('.ttf', '');
        fonts[fontName] = path.join(fontSrcPath, file);
    });

    this.fonts = fonts;
};

exports.text = function text(text = '', x, y, options = {}) {
    if (!this.pageContext) return this;
    const pathOptions = this._getPathOptions(options);
    const { offsetX, offsetY } = this._getTextOffset(text, pathOptions);
    const { nx, ny } = this._calibrateCoorinate(x, y, offsetX, offsetY);
    const context = this.pageContext;
    context.writeText(text, nx, ny, pathOptions);
    return this;
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
