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
