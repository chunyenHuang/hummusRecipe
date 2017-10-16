const fs = require('fs');
const path = require('path');
const LineBreaker = require('linebreak');
const { Word, Line } = require('./text.helper');
const { htmlToTextObjects } = require('./htmlToTextObjects');

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
 * @param {number} [options.textBox.width] - Text Box width
 * @param {number} [options.textBox.height] - Text Box fixed height
 * @param {number} [options.textBox.minHeight] - Text Box minimum height
 * @param {number|number[]} [options.textBox.padding] - Text Box padding, [top, right, bottom, left]
 * @param {number} [options.textBox.lineHeight] - Text Box line height
 * @param {Object} [options.textBox.style] - Text Box styles
 * @param {number} [options.textBox.style.lineWidth] - Text Box border width
 * @param {string|number[]} [options.textBox.style.stroke] - Text Box border color
 * @param {number[]} [options.textBox.style.dash] - Text Box border border dash style [number, number]
 * @param {string|number[]} [options.textBox.style.fill] - Text Box border background color
 * @param {number} [options.textBox.style.opacity] - Text Box border background opacity
 */
exports.text = function text(text = '', x, y, options = {}) {
    if (!this.pageContext) return this;
    const pathOptions = this._getPathOptions(options);
    const { width: pageWidth, height: pageHeight } = this.metadata[this.pageNumber];

    const textObjects = (options.html) ? htmlToTextObjects(text) : [{
        value: text,
        tag: null,
        isBold: options.bold,
        isItalic: options.italic,
        attributes: [],
        styles: {},
        needsLineBreaker: false,
        size: pathOptions.size,
        sizeRatio: 1,
        sizeRatios: [1],
        link: null,
        childs: []
    }];
    const textBox = (!options.textBox) ? {
        // use page width with padding and margin
        isSimpleText: true,
        width: null,
        lineHeight: 14,
        padding: 0,
        minHeight: 0
    } : {
        width: options.textBox.width || 100,
        lineHeight: options.textBox.lineHeight,
        height: options.textBox.height,
        padding: (options.textBox.padding || 0),
        minHeight: options.textBox.minHeight || 0,
        style: options.textBox.style
    };

    textBox.padding = (Array.isArray(textBox.padding)) ? textBox.padding : [textBox.padding];
    Object.assign(textBox, {
        paddingTop: textBox.padding[0],
        paddingRight: textBox.padding[1] || textBox.padding[0],
        paddingBottom: textBox.padding[2] || textBox.padding[0],
        paddingLeft: textBox.padding[2] || textBox.padding[1] || textBox.padding[0],
    });
    let firstLineHeight;
    let lastLineHeight;

    let totalHeight = 0;
    let toWriteTextObjects = [];

    const writeValue = (textObject) => {
        textObject.lineID = textObject.lineID || Date.now() * Math.random();
        textObject.lineID = (textObject.needsLineBreaker) ? Date.now() * Math.random() : textObject.lineID;
        if (textObject.value) {
            textObject.styles.color = (textObject.styles.color) ?
                this._transformColor(textObject.styles.color) : pathOptions.color;
            const { toWriteTextObjects: newToWriteObjects, paragraphHeight } = getToWriteTextObjects(textObject, pathOptions, textBox);
            toWriteTextObjects = [...toWriteTextObjects, ...newToWriteObjects];
            if (!firstLineHeight) {
                firstLineHeight = toWriteTextObjects[0].lineHeight
            }
            totalHeight += paragraphHeight; // textObject.size;
        }
        if (textObject.tag && textObject.childs.length) {
            if (!textObject.size) {
                textObject.size = pathOptions.size * textObject.sizeRatio;
                textObject.sizeRatios = [textObject.sizeRatio];
            }
            textObject.childs.forEach((child, index) => {
                if (textObject.tag == 'ul') {
                    child.prependValue = '    * ';
                }
                if (textObject.tag == 'ol') {
                    child.prependValue = `    ${(index+1).toString()}. `;
                }
                if (textObject.prependValue) {
                    child.prependValue = textObject.prependValue;
                }
                if (textObject.size) {
                    child.size = textObject.size * child.sizeRatio;
                    child.sizeRatios = [...textObject.sizeRatios, child.sizeRatio];
                }
                child.styles = Object.assign(child.styles, textObject.styles);

                child.isBold = (textObject.isBold) ? textObject.isBold : child.isBold;
                child.isItalic = (textObject.isItalic) ? textObject.isItalic : child.isItalic;
                child.underline = (textObject.underline) ? textObject.underline : child.underline;

                child.lineID = textObject.lineID;
                writeValue(child);
            })
        }
    }
    textObjects.forEach((textObject) => {
        writeValue(textObject);
    });

    const calculatedHeight = totalHeight + textBox.paddingTop + textBox.paddingBottom;

    if (!textBox.height) {
        textBox.height = calculatedHeight;
        textBox.height = (textBox.minHeight && textBox.minHeight >= textBox.height) ? textBox.minHeight : textBox.height;
    }
    if (!textBox.width) {
        textBox.width = toWriteTextObjects[0].lineWidth;
    }
    textBox.firstLineHeight = firstLineHeight;
    textBox.lastLineHeight = toWriteTextObjects[toWriteTextObjects.length - 1].lineHeight;

    const { offsetX, offsetY } = this._getTextBoxOffset(textBox, pathOptions);
    const { nx, ny } = this._calibrateCoorinate(x, y, offsetX, offsetY);

    if (textBox.style) {
        this.rectangle(
            nx,
            ny - textBox.height + textBox.firstLineHeight,
            textBox.width, textBox.height, Object.assign(textBox.style, {
                dontTranslate: true
            })
        );
    }
    const context = this.pageContext;
    const space = 8;
    currentY = ny - textBox.paddingTop;
    let currentLineID;
    let currentLineWidth = 0;
    toWriteTextObjects.forEach((toWriteTextObject, index) => {
        const { text, lineHeight, lineWidth, lineID, spaceWidth, writeOptions } = toWriteTextObject;
        currentLineID = currentLineID || lineID;
        const isContinued = (currentLineID == lineID) ? true : false;

        if (!isContinued) {
            currentLineID = lineID;
            currentLineWidth = 0;
            currentY -= lineHeight;
        }
        const startX = nx + textBox.paddingLeft + currentLineWidth;
        if (text != '[@@DONOT_RENDER_THIS@@]') {
            context.writeText(text, startX, currentY, writeOptions);
        }
        currentLineWidth = currentLineWidth + lineWidth + spaceWidth; // space * writeOptions.size / 14;
    });

    return this;
}

function getToWriteTextObjects(textObject = {}, pathOptions, textBox = {}) {
    const toWriteTextObjects = [];
    let text = ((textObject.prependValue) ? textObject.prependValue : '') +
        textObject.value +
        ((textObject.appendValue) ? textObject.appendValue : '');

    const textHeight = pathOptions.font.calculateTextDimensions(
        text, textObject.size
    ).height;
    const size = textObject.size || pathOptions.size;
    const breaker = new LineBreaker(text);
    const lines = [];
    const lineMaxWidth = (textBox.width) ? textBox.width - textBox.paddingLeft - textBox.paddingRight : null;
    let newLine = new Line(lineMaxWidth, textBox.lineHeight, size, pathOptions);
    let last = 0;
    let bk;

    while (bk = breaker.nextBreak()) {
        const word = new Word(text.slice(last, bk.position), pathOptions);
        if (newLine.canFit(word)) {
            newLine.addWord(word);
        } else {
            lines.push(newLine);
            newLine = new Line(lineMaxWidth, textBox.lineHeight, size, pathOptions);
            newLine.addWord(word);
        }
        // if (bk.required) {
        //     console.log('\n\n');
        // }
        last = bk.position;
    }
    lines.push(newLine);

    const lineHeightMargin = 5;
    let lineHeight = (textHeight + lineHeightMargin >= textBox.lineHeight) ? textHeight + lineHeightMargin : textBox.lineHeight;
    // const linesHeight = lines.length * lineHeight + textBox.paddingTop + textBox.paddingBottom;
    // if (!textBox.height) {
    //     textBox.height =
    //         (textBox.minHeight && (textBox.minHeight > linesHeight)) ? textBox.minHeight : linesHeight;
    // }

    const writeOptions = Object.assign({}, pathOptions, {
        color: textObject.styles.color,
        opacity: textObject.styles.opacity || pathOptions.opacity || 1,
        underline: textObject.underline || pathOptions.underline,
        size: textObject.size,
        font: (textObject.isBold && textObject.isItalic) ? pathOptions.fonts.boldItalic :
            (textObject.isItalic) ? pathOptions.fonts.italic :
            (textObject.isBold) ? pathOptions.fonts.bold : pathOptions.font
    });
    let paragraphHeight = 0;
    lines.forEach((line, index) => {
        lineHeight = (lineHeight >= line.height) ? lineHeight : line.height;

        toWriteTextObjects.push({
            text: line.value,
            lineID: (index == 0) ? textObject.lineID : Date.now() * Math.random(),
            // @todo: handle line height to mimic html tag
            lineHeight,
            lineWidth: line.currentWidth,
            spaceWidth: line.spaceWidth,
            writeOptions
        });
        paragraphHeight += lineHeight;
    });
    return { toWriteTextObjects, paragraphHeight };
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

/**
 * @todo handle page margin and padding
 */
exports._getTextBoxOffset = function _getTextBoxOffset(textBox, options = {}) {
    let offsetX = 0;
    let offsetY = -textBox.firstLineHeight;
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
                    offsetY = (textBox.isSimpleText) ?
                        -textBox.firstLineHeight / 2 :
                        height / 2 + offsetY;
                    break;
                case 'bottom':
                    offsetY = height + offsetY;
                    break;
                default:
            }
        }
    }

    return { offsetX, offsetY };
}
