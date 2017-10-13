const fs = require('fs');
const path = require('path');
const LineBreaker = require('linebreak');
const { Word, Line } = require('./text.helper');

/**
 * Write texts
 * @name text
 * @function
 * @todo support break words
 * @memberof Recipe
 * @param {string} text - The text content
 * @param {number} x - The coordinate x
 * @param {number} y - The coordinate y
 * @param {Object} [options] - The options
 * @param {string|number[]} [options.color] - HexColor or RGB
 * @param {string} [options.font] - The font. 'Arial', 'Helvetica'...
 * @param {number} [options.size] - The line width
 * @param {string} [options.align] - The alignment. 'center center'... 
 * @param {Object} [options.textBox] - Text Box to fit in.
 */
exports.text = function text(text = '', x, y, options = {}) {
    if (!this.pageContext) return this;
    const pathOptions = this._getPathOptions(options);

    if (!options.textBox) {
        const context = this.pageContext;
        const { offsetX, offsetY } = this._getTextOffset(text, pathOptions);
        const { nx, ny } = this._calibrateCoorinate(x, y, offsetX, offsetY);
        context.writeText(text, nx, ny, pathOptions);
        return this;
    }

    const textBox = {
        width: options.textBox.width || 100,
        lineHeight: options.textBox.lineHeight || options.size || 14,
        height: options.textBox.height,
        padding: options.textBox.padding || 0,
        minHeight: options.textBox.minHeight || 0,
        style: options.textBox.style
    }
    const breaker = new LineBreaker(text);
    const lines = [];
    let newLine = new Line(textBox.width - textBox.padding * 2, textBox.lineHeight, pathOptions);
    let last = 0;
    let bk;

    while (bk = breaker.nextBreak()) {
        const word = new Word(text.slice(last, bk.position), pathOptions);
        if (newLine.canFit(word)) {
            newLine.addWord(word);
        } else {
            lines.push(newLine);
            newLine = new Line(textBox.width - textBox.padding * 2, textBox.lineHeight, pathOptions);
            newLine.addWord(word);
        }
        // if (bk.required) {
        //     console.log('\n\n');
        // }
        last = bk.position;
    }
    lines.push(newLine);

    const linesHeight = lines.length * textBox.lineHeight + textBox.padding * 2;
    if (!textBox.height) {
        textBox.height =
            (textBox.minHeight && (textBox.minHeight > linesHeight)) ? textBox.minHeight : linesHeight;
    }
    
    const { offsetX, offsetY } = this._getTextBoxOffset(textBox, pathOptions);
    const { nx, ny } = this._calibrateCoorinate(x, y, offsetX, offsetY);
    if (textBox.style) {
        this.rectangle(
            nx,
            ny - textBox.height + textBox.lineHeight,
            textBox.width, textBox.height, Object.assign(textBox.style, {
                dontTranslate: true
            })
        );
    }

    const context = this.pageContext;
    let currentY = ny - textBox.padding;
    lines.forEach((line) => {
        context.writeText(line.value, nx + textBox.padding, currentY, pathOptions);
        currentY -= textBox.lineHeight;
    });
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

exports._getTextBoxOffset = function _getTextBoxOffset(textBox, options = {}) {
    let offsetX = 0;
    let offsetY = -textBox.lineHeight;
    const { width, height } = textBox;
    if (options.align) {
        const alignments = options.align.split(' ');
        if (alignments[0]) {
            switch (alignments[0]) {
                case 'center':
                    offsetX = -1 * width / 2;
                    break;
                case 'right':
                    offsetX = -width;
                    break;
                default:
            }
        }
        if (alignments[1]) {
            switch (alignments[1]) {
                case 'center':
                    offsetY = height / 2 - textBox.lineHeight;
                    break;
                case 'bottom':
                    offsetY = height - textBox.lineHeight;
                    break;
                default:
            }
        }
    }
    return { offsetX, offsetY };
}
