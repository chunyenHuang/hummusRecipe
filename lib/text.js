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
 * @param {Object|Boolean} [options.highlight] - Text markup annotation.
 * @param {Object|Boolean} [options.underline] - Text markup annotation.
 * @param {Object|Boolean} [options.strikeOut] - Text markup annotation.
 * @param {Object} [options.textBox] - Text Box to fit in.
 * @param {number} [options.textBox.width] - Text Box width
 * @param {number} [options.textBox.height] - Text Box fixed height
 * @param {number} [options.textBox.minHeight] - Text Box minimum height
 * @param {number|number[]} [options.textBox.padding] - Text Box padding, [top, right, bottom, left]
 * @param {number} [options.textBox.lineHeight] - Text Box line height
 * @param {string} [options.textBox.textAlign] - Text alignment inside text box
 * @param {Object} [options.textBox.style] - Text Box styles
 * @param {number} [options.textBox.style.lineWidth] - Text Box border width
 * @param {string|number[]} [options.textBox.style.stroke] - Text Box border color
 * @param {number[]} [options.textBox.style.dash] - Text Box border border dash style [number, number]
 * @param {string|number[]} [options.textBox.style.fill] - Text Box border background color
 * @param {number} [options.textBox.style.opacity] - Text Box border background opacity
 */
exports.text = function text(text = '', x, y, options = {}) {
    if (!this.pageContext) return this;
    const targetAnnotations = options
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
        lineHeight: 0,
        padding: 0,
        minHeight: 0
    } : {
        width: options.textBox.width || 100,
        lineHeight: options.textBox.lineHeight,
        height: options.textBox.height,
        padding: (options.textBox.padding || 0),
        minHeight: options.textBox.minHeight || 0,
        style: options.textBox.style,
        textAlign: options.textBox.textAlign
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
    let toWriteContents = [];

    toWriteTextObjects.forEach((toWriteTextObject, index) => {
        const { text, lineHeight, lineWidth, lineID, spaceWidth, writeOptions } = toWriteTextObject;
        currentLineID = currentLineID || lineID;
        const isContinued = (currentLineID == lineID) ? true : false;
        const getStartX = (startX, currentWriteOptions) => {
            let x = startX;
            let offsetX = 0;
            if (currentWriteOptions.align == 'center') {
                offsetX = (textBox.width - currentLineWidth) / 2;
            } else
            if (currentWriteOptions.align == 'right') {
                offsetX = (textBox.width - textBox.paddingRight - currentLineWidth);
            } else {
                offsetX = textBox.paddingLeft;
            }
            return x + offsetX;
        };
        const writeText = (context, text, x, y, options, annotations = {}) => {
            // write to page
            context.writeText(text, x, y, options);

            const { textHeight } = options;
            for (let key in targetAnnotations) {
                const subtype = this._getTextMarkupAnnotationSubtype(key);
                if (subtype) {
                    const markupOption = (typeof(targetAnnotations[key]) != 'object') ? {} : targetAnnotations[key];
                    Object.assign(markupOption, {
                        height: textHeight * 1.4,
                        width: currentLineWidth,
                        text: markupOption.text || '',
                        _textHeight: textHeight
                    });
                    const { ox, oy } = this._reverseCoorinate(x, y - textHeight * 0.2)
                    this.annot(ox, oy, subtype, markupOption);
                }
            }
        }
        if (!isContinued) {
            toWriteContents.forEach((content) => {
                const x = getStartX(content.startX, content.writeOptions);
                const y = currentY;
                writeText(context, content.text, x, y, content.writeOptions, true);
            });
            toWriteContents = [];
            currentLineID = lineID;
            currentLineWidth = 0;
            currentY -= lineHeight;
        }
        const startX = nx + currentLineWidth;
        if (text != '[@@DONOT_RENDER_THIS@@]') {
            toWriteContents.push({
                startX,
                text,
                writeOptions
            })
        }
        currentLineWidth = currentLineWidth + lineWidth + spaceWidth; // space * writeOptions.size / 14;

        if (index == toWriteTextObjects.length - 1) {
            toWriteContents.forEach((content) => {
                const x = getStartX(content.startX, content.writeOptions);
                const y = currentY;
                writeText(context, content.text, x, y, content.writeOptions);
            });
        }
    });

    return this;
}

function getToWriteTextObjects(textObject = {}, pathOptions, textBox = {}) {
    const toWriteTextObjects = [];
    let text = ((textObject.prependValue) ? textObject.prependValue : '') +
        textObject.value +
        ((textObject.appendValue) ? textObject.appendValue : '');

    const size = textObject.size || pathOptions.size;
    // Use the same string to get the same height for each string with the same font.
    const textHeight = pathOptions.font.calculateTextDimensions(
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ', size
    ).height;

    pathOptions.textHeight = textHeight;
    textBox.lineHeight = textBox.lineHeight || textHeight;

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

    const lineHeightMargin = 0;
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
        align: textBox.textAlign,
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
