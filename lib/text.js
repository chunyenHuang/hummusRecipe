const LineBreaker = require('linebreak');
const {
    Word,
    Line
} = require('./text.helper');
const {
    htmlToTextObjects
} = require('./htmlToTextObjects');
const xObjectForm = require('./xObjectForm');

//  Table indicating how to specify coloration of elements
//  -------------------------------------------------------------------
// |Color | HexColor   | DecimalColor                   | PercentColor |
// |Space | (string)   | (array)                        | (string)     |
// |------+------------+--------------------------------+--------------|
// | Gray | #GG        | [gray]                         | %G           |
// |  RGB | #rrggbb    | [red, green, blue]             | %G           |
// | CMYK | #ccmmyykk  | [cyan, magenta, yellow, black] | %c,m,y,k     |
//  -------------------------------------------------------------------
//
//   HexColor component values (two hex digits) range from 00 to FF.
//   DecimalColor component values range from 0 to 255.
//   PercentColor component values range from 1 to 100.

/**
 * Write text elements
 * @name text
 * @function
 * @todo support break words
 * @memberof Recipe
 * @param {string} text - The text content
 * @param {number} x - The coordinate x
 * @param {number} y - The coordinate y
 * @param {Object} [options] - The options
 * @param {string|number[]} [options.color] - Text color (HexColor, PercentColor or DecimalColor)
 * @param {number} [options.opacity=1] - opacity
 * @param {number} [options.rotation=0] - Accept: +/- 0 through 360.
 * @param {number[]} [options.rotationOrigin=[x,y]] - [originX, originY]
 * @param {string} [options.font=Helvetica] - The font. 'Arial', 'Helvetica'...
 * @param {number} [options.size=14] - The font size
 * @param {string} [options.align='left top'] - The alignment. 'center center'...
 * @param {Object|Boolean} [options.highlight] - Text markup annotation.
 * @param {Object|Boolean} [options.underline] - Text markup annotation.
 * @param {Object|Boolean} [options.strikeOut] - Text markup annotation.
 * @param {Object} [options.textBox] - Text Box to fit in.
 * @param {number} [options.textBox.width=100] - Text Box width
 * @param {number} [options.textBox.height] - Text Box fixed height
 * @param {number} [options.textBox.minHeight=0] - Text Box minimum height
 * @param {number|number[]} [options.textBox.padding=0] - Text Box padding, [top, right, bottom, left]
 * @param {number} [options.textBox.lineHeight=0] - Text Box line height
 * @param {string|Boolean} [options.textBox.wrap='auto'] - Text wrapping mechanism, may be true, false, 
 * 'auto', 'clip', 'trim', 'ellipsis'. All the option values that are not equivalent to 'auto' dictate
 *  how the text which does not fit on a line is to be truncated. True is equivalent to 'auto'. False is equivalent to 'ellipsis'.
 * @param {string} [options.textBox.textAlign='left top'] - Alignment inside text box, specified as 'horizontal vertical',
 * where horizontal is one of: 'left', 'center', 'right', 'justify' and veritical is one of: 'top', 'center', 'bottom'.
 * @param {Object} [options.textBox.style] - Text Box styles
 * @param {number} [options.textBox.style.lineWidth=2] - Text Box border width
 * @param {string|number[]} [options.textBox.style.stroke] - Text Box border color  (HexColor, PercentColor or DecimalColor)
 * @param {number[]} [options.textBox.style.dash=[]] - Text Box border border dash style [number, number]
 * @param {string|number[]} [options.textBox.style.fill] - Text Box border background color (HexColor, PercentColor or DecimalColor)
 * @param {number} [options.textBox.style.opacity=1] - Text Box border background opacity
 */
exports.text = function text(text = '', x, y, options = {}) {
    if (!this.pageContext) {
        return this;
    }
    const targetAnnotations = options;
    const originCoord = this._calibrateCoordinate(x, y, 0, 0, this.pageNumber);
    const pathOptions = this._getPathOptions(options, originCoord.nx, originCoord.ny);
    pathOptions.html = options.html;
    // const { width: pageWidth, height: pageHeight } = this.metadata[this.pageNumber];

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
        minHeight: 0,
        wrap: 'auto'
    } : {
        width: options.textBox.width || 100,
        lineHeight: options.textBox.lineHeight,
        height: options.textBox.height,
        padding: (options.textBox.padding || 0),
        minHeight: options.textBox.minHeight || 0,
        style: options.textBox.style,
        textAlign: options.textBox.textAlign,
        wrap: (options.textBox.wrap !== undefined) ? options.textBox.wrap : 'auto'
    };

    // allow user to treat wrap as boolean
    if (textBox.wrap === true) {
        textBox.wrap = 'auto';
    } else if (textBox.wrap === false) {
        textBox.wrap = 'ellipsis'
    }

    // Allows user to enter a single number which will be used for all text box sides,
    // or an array of values [top, right, bottom, left] with any combination of missing sides.
    // Default value for a missing side is the value of the text box's opposite side (see below).
    //
    //               padding[0]
    //   padding[3]              padding[1]
    //               padding[2]

    textBox.padding = (Array.isArray(textBox.padding)) ? textBox.padding : [textBox.padding];

    Object.assign(textBox, {
        paddingTop:     textBox.padding[0],
        paddingRight:  (textBox.padding[1] !== undefined) ? textBox.padding[1] : textBox.padding[0],
        paddingBottom: (textBox.padding[2] !== undefined) ? textBox.padding[2] : textBox.padding[0],
        paddingLeft:   (textBox.padding[3] !== undefined) ? textBox.padding[3] :
                       (textBox.padding[1] !== undefined) ? textBox.padding[1] : textBox.padding[0]
    });

    let firstLineHeight;
    let totalHeight = 0;
    let toWriteTextObjects = [];

    const writeValue = (textObject) => {
        textObject.lineID = textObject.lineID || Date.now() * Math.random();
        textObject.lineID = (textObject.needsLineBreaker) ? Date.now() * Math.random() : textObject.lineID;
        if (textObject.value) {
            textObject.styles.color = (textObject.styles.color) ?
                this._transformColor(textObject.styles.color) : pathOptions.color;
            const {
                toWriteTextObjects: newToWriteObjects,
                paragraphHeight
            } = getToWriteTextObjects(textObject, pathOptions, textBox);
            toWriteTextObjects = [...toWriteTextObjects, ...newToWriteObjects];
            if (!firstLineHeight) {
                firstLineHeight = toWriteTextObjects[0].lineHeight;
            }
            totalHeight += paragraphHeight; // textObject.size;
        }
        if (textObject.tag && textObject.childs.length) {
            // console.log(textObject);
            if (!textObject.size) {
                textObject.size = pathOptions.size * textObject.sizeRatio;
                textObject.sizeRatios = [textObject.sizeRatio];
            }
            textObject.layer = textObject.layer || 0;
            textObject.layer++;

            textObject.currentIndex = 0;

            textObject.childs.forEach((child) => {
                if (textObject.tag == 'ul') {
                    child.prependValue = '* ';
                    child.layer = textObject.layer + 1;
                    // child.indent = 4 * child.layer;
                }
                if (textObject.tag == 'ol') {
                    if (child.tag != 'ol') {
                        textObject.currentIndex++;
                        child.prependValue = `${(textObject.currentIndex).toString()}. `;
                    }
                    child.layer = textObject.layer + 1;
                    // child.indent = 4 * child.layer;
                }
                if (textObject.tag == 'li') {
                    if (child.tag == 'ol' || child.tag == 'ul') {
                        child.layer = textObject.layer - 1;
                    }
                }
                if (textObject.prependValue) {
                    child.prependValue = (!['ol', 'ul'].includes(textObject.tag)) ?
                        textObject.prependValue : child.prependValue;
                    textObject.indent = 2 * textObject.layer;
                }
                if (textObject.indent) {
                    child.indent = child.indent || textObject.indent;
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
            });
        }
    };
    textObjects.forEach((textObject) => {
        writeValue(textObject);
    });

    if (!textBox.width) {
        textBox.width = toWriteTextObjects[0].lineWidth;
    }
    textBox.firstLineHeight = firstLineHeight;
    textBox.lastLineHeight  = pathOptions.textHeight;

    const {
        offsetX,
        offsetY
    } = this._getTextBoxOffset(textBox, pathOptions);
    const {
        nx,
        ny
    } = this._calibrateCoordinate(x, y, offsetX, offsetY);

    let textYpos = ny;

    if (textBox.style) {
        const textBoxWidth  = textBox.width + textBox.paddingLeft + textBox.paddingRight;
        const actualTextHeight = textBox.firstLineHeight * (toWriteTextObjects.length-1) + textBox.lastLineHeight

        if (!textBox.height) {
            textBox.height = actualTextHeight + textBox.paddingTop + textBox.paddingBottom;
            
            if (textBox.minHeight && textBox.minHeight > textBox.height) {
                textBox.height = textBox.minHeight;
            }
        }

        this.rectangle(
            nx - textBox.paddingLeft, 
            ny - textBox.height + textBox.firstLineHeight + textBox.paddingTop,
            textBoxWidth, textBox.height, Object.assign(textBox.style, {
                useGivenCoords: true,
                rotation: pathOptions.rotation,
                rotationOrigin: [pathOptions.originX,pathOptions.originY],
            })
        );
         
        // Determine vertical starting position of text within textBox
        switch (toWriteTextObjects[0].writeOptions.alignVertical) {
            case 'center':
                textYpos -= (textBox.height - actualTextHeight) / 2;
                break;
            case 'bottom':
                textYpos -= (textBox.height - actualTextHeight);
                break;
        }
    }
    
    const context = this.pageContext;
    // const space = 8;
    let currentY = textYpos;
    let currentLineID;
    let currentLineWidth = 0;
    let toWriteContents = [];

    toWriteTextObjects.forEach((toWriteTextObject, index) => {
        const {
            text,
            lineHeight,
            lineWidth,
            lineID,
            spaceWidth
        } = toWriteTextObject;

        currentLineID = currentLineID || lineID;
        const isContinued = (currentLineID == lineID) ? true : false;

        const getStartX = (startX, currentWriteOptions) => {
            let offsetX = textBox.paddingLeft;

            switch (currentWriteOptions.alignHorizontal) {
                case 'center':
                    offsetX = (textBox.width - currentLineWidth) / 2;
                    break;
                case 'right':
                    offsetX = (textBox.width - textBox.paddingRight - currentLineWidth);
                    break;
            }
            
            return startX + offsetX;
        };

        const writeText = (context, x, y, wto) => {
            const options = wto.writeOptions;
            const {lineHeight, text, baseline, wordsInLine, textWidth} = wto;

            // write directly to page when not dealing with opacity, rotation and special colorspace.
            if (options.opacity  === 1 && options.colorspace !== 'separation' &&
               (options.rotation === 0 || options.rotation === undefined)) {
                
                // Note that the last line of a text box ignores justification.
                if (options.alignHorizontal !== 'justify' || wto.lastLine) {
                    if (textBox.wrap !== 'auto') {  // This applies a clipping region around the text
                        this.pageContext.q();
                        this.pageContext
                            .m(nx,y+lineHeight)
                            .l(nx+textBox.width,y+lineHeight)
                            .l(nx+textBox.width,y)
                            .l(nx,y)
                            .h().W().n();
                    }
                    
                    context.writeText(text, x, y+baseline, options);

                    if (textBox.wrap !== 'auto') {
                        this.pageContext.Q();
                    }
                } else {
                    justify(x, wordsInLine, textBox, textWidth, (word, xx) => {
                        context.writeText(word, xx, y+baseline, options);
                    });
                }            
            } else {
                this.pauseContext();

                // https://github.com/galkahana/HummusJS/wiki/Use-the-pdf-drawing-operators
                const xObject = new xObjectForm(this.writer, textBox.width, lineHeight);
                const xObjectCtx = xObject.getContentContext();
                // Build form object
                xObjectCtx
                    .q()
                    .gs(xObject.getGsName(options.fillGsId))  // set graphic state (here opacity)
                    .BT();                                    // begin text context
                xObjectCtx.Tf(options.font, options.size);    // set font
                xObject.fill(options.colorModel);             // set color

                if (options.alignHorizontal !== 'justify' || wto.lastLine) {
                    xObjectCtx
                        .Tm(1, 0, 0, 1, 0, baseline)          // set position in object
                        .Tj(text);                            // write text
                } else {
                    justify(0, wordsInLine, textBox, textWidth, (word, xx) => {
                        xObjectCtx
                        .Tm(1, 0, 0, 1, xx, baseline)         // set position in object
                        .Tj(word);                            // write word
                    });
                }

                xObjectCtx
                    .ET()                                     // end text context
                    .Q();
                xObject.end();

                this.resumeContext();

                this.pageContext.q();
                this._setRotationContext(this.pageContext, x, y, options);
                this.pageContext
                    .doXObject(xObject)
                    .Q();
            }

            const { textHeight } = options;

            for (let key in targetAnnotations) {
                const subtype = this._getTextMarkupAnnotationSubtype(key);
                if (subtype) {
                    const markupOption = (typeof (targetAnnotations[key]) != 'object') ? {} : targetAnnotations[key];
                    Object.assign(markupOption, {
                        height: textHeight * 1.4,
                        width: currentLineWidth,
                        text: markupOption.text || '',
                        _textHeight: textHeight
                    });
                    const {
                        ox,
                        oy
                    } = this._reverseCoordinate(x, y - textHeight * 0.2);
                    this.annot(ox, oy, subtype, markupOption);
                }
            }
        };

        if (!isContinued) {
            toWriteContents.forEach((content) => {
                const x = getStartX(content.startX, content.wto.writeOptions);
                const y = currentY;
                writeText(context, x, y, content.wto);
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
                wto: toWriteTextObject
            });
        }

        currentLineWidth = currentLineWidth + lineWidth + spaceWidth;

        // Processing last line?
        if (index == toWriteTextObjects.length - 1) {
            toWriteContents.forEach((content) => {
                const x = getStartX(content.startX, content.wto.writeOptions);
                const y = currentY;
                writeText(context, x, y, content.wto);
            });
        }
    });

    return this;
};

function justify (x, wordsInLine, textBox, textWidth, callback) {
    // For some reason, textWidth is smaller than lineWidth. My suspicions lie in the fact
    // that spacing computations appear different depending on where the space is located.
    // What is noted though that if lineWidth is used in the calculations for text 
    // justitification, the text goes passed the right boundary. Due to the vagary in space
    // computation, the final wrinkle to make sure the last word in the line smacks up against
    // the right side boundary is to perform a special computation on the last word positioning
    // relative to that right side bounds.
    const spaceCount = wordsInLine.length-1;
    const spaceBetweenWords = ( wordsInLine.length > 1) ? (textBox.width - textWidth) / (spaceCount) : 0;
    const lineStart = x;

    for (let index = 0; index < wordsInLine.length; index++) {
        const word = wordsInLine[index];
        
        callback(word.value, x)
        // Ready to compute last word spacing?
        if (index+1 === spaceCount) {
            x = lineStart + textBox.width - textBox.paddingRight - wordsInLine[index+1].dimensions.xMax;
        } else {
            x += word.dimensions.width + spaceBetweenWords;
        }
    }
}

function nextWord (text, brk, previousPosition, pathOptions) {
    let nextWord = text.slice(previousPosition, brk.position);
    
    if (brk.required) {  // effectively saw a '\n' in text.
        nextWord = nextWord.trim();
    }

    return new Word(nextWord, pathOptions);
}

function elideNonFittingText(textBox, line, word, pathOptions) {
    if (textBox.wrap === 'clip') {
        line.addWord(word);
    } else if (textBox.wrap === 'ellipsis') {
        // This is more complicated than the other no-wrap options.
        // It makes an initial attempt to take the word that was
        // too big and make it shrink in size until it and the 
        // ellipsis character fit. If that doesn't work, one more
        // attempt is taken by trying to shrink the previous word
        // that fit on the line.
        const ellipsis = '…';
        let usingPreviousWord = false;
        let tooBig = new Word(word.value.slice(0,-2)+ellipsis, pathOptions);

        while ( !line.canFit(tooBig)) {
            
            if (tooBig.value.length > 1) {
                tooBig = new Word(tooBig.value.slice(0,-2)+ellipsis, pathOptions);

            // Try last word that fit in box?
            } else if (!usingPreviousWord) {
                tooBig = new Word(line.words.pop().value.slice(0,-1) + ellipsis, pathOptions);
                usingPreviousWord = true;

            } else {
                break;  // give up, only get 2 shots at this.
            }
        }

        line.addWord(tooBig);
    }
}

function getToWriteTextObjects(textObject = {}, pathOptions, textBox = {}) {
    const toWriteTextObjects = [];
    let text = ((textObject.prependValue) ? textObject.prependValue : '') +
        textObject.value +
        ((textObject.appendValue) ? textObject.appendValue : '');

    const size = textObject.size || pathOptions.size;
    // Use the same string to get the same height for each string with the same font.
    // Need lowercase 'gjpqy' so descenders are included in text height.
    // Need special characters '|}' because they have ascenders that go beyond upper case letters.
    const textDimensions = pathOptions.font.calculateTextDimensions(
        'ABCDEFGHIJKLMNOPQRSTUVWXYZgjpqy|}', size
    );
    const textHeight = textDimensions.height;

    pathOptions.textHeight = textHeight;
    textBox.lineHeight = textBox.lineHeight || textHeight;
    textBox.baselineHeight = textDimensions.yMax;

    const breaker = new LineBreaker(text);
    const lines = [];
    const indent = (textObject.indent || 0);
    // const indentWidth = indent * size;
    const lineMaxWidth = (textBox.width) ? textBox.width - textBox.paddingLeft - textBox.paddingRight - indent : null;
    let newLine = new Line(lineMaxWidth, textBox.lineHeight, size, pathOptions);
    let last = 0;
    let bk = breaker.nextBreak();
    let previousWord;
    let flushLine = false;

    for (let i = 0; i < indent; i++) {
        newLine.addWord(new Word(' ', pathOptions));
    }

    while (bk) {
        let word = nextWord(text, bk, last, pathOptions);

        if (newLine.canFit(word)) {
            newLine.addWord(word);
        } else {
            // remove any trailing space on previous word so right justification works appropriately
            if ( previousWord && textBox.wrap === 'auto') {
                newLine.replaceLastWord(new Word(previousWord.value.trim(), pathOptions));
            }
            lines.push(newLine);

            // now deal with text line wrap (what happens to text that doesn't fit in line)
            if (textBox.wrap !== 'auto') {
                flushLine = true;
                elideNonFittingText(textBox, newLine, word, pathOptions);

            } else {
                // this is the auto wrap section
                newLine = new Line(lineMaxWidth, textBox.lineHeight, size, pathOptions);
                for (let i = 0; i < indent; i++) {
                    newLine.addWord(new Word(' ', pathOptions));
                }
                if (textObject.prependValue) {
                    const space = Array(textObject.prependValue.length + 1).fill(' ').join('');
                    newLine.addWord(new Word(space, pathOptions));
                }
                newLine.addWord(word);
            }
        }

        if (flushLine) {
            while (bk) {
                if (bk.required) {
                    flushLine = false;
                    newLine = new Line(lineMaxWidth, textBox.lineHeight, size, pathOptions);
                    word = null;
                    break;
                }
                bk = breaker.nextBreak();
            }
        } else {
            /**
             * Author: silverma (Marc Silverman)
             * #29 Is it possible to add multi-line text?
             * https://github.com/chunyenHuang/hummusRecipe/issues/29
             */
            if (bk.required) {
                lines.push(newLine);
                newLine = new Line(lineMaxWidth, textBox.lineHeight, size, pathOptions);
            }
        }
       
        if (bk) {
            previousWord = word;
            last = bk.position;
            bk = breaker.nextBreak();
        }
    }

    if (!flushLine) {
        lines.push(newLine);
    }

    const lineHeightMargin = 0;
    let lineHeight = (textHeight + lineHeightMargin >= textBox.lineHeight) ? textHeight + lineHeightMargin : textBox.lineHeight;
    let [alignHorizontal, alignVertical] = (textBox.textAlign) ? textBox.textAlign.split(' ') : [];
    const writeOptions = Object.assign({}, pathOptions, {
        color: textObject.styles.color,
        opacity: parseFloat(textObject.styles.opacity || pathOptions.opacity || 1),
        underline: textObject.underline || pathOptions.underline,
        size: textObject.size,
        alignHorizontal: alignHorizontal,
        alignVertical: alignVertical,
        font: pathOptions.font
    });
    let paragraphHeight = 0;
    lines.forEach((line, index) => {
        lineHeight = (lineHeight >= line.height) ? lineHeight : line.height;

        // Space width only gets applied for HTML elements.
        // Otherwise, normal text alignments (center,right) are shifted left by a space.
        toWriteTextObjects.push({
            text: line.value,
            lineID: (index == 0) ? textObject.lineID : Date.now() * Math.random(),
            // @todo: handle line height to mimic html tag
            lineHeight,
            baseline: lineHeight - textBox.baselineHeight,
            lineWidth: line.currentWidth,
            textWidth: line.textWidth,  // for justification
            spaceWidth: (pathOptions.html) ? line.spaceWidth : 0,
            wordsInLine: line.words,
            lastLine: (index === lines.length-1),
            writeOptions
        });
        paragraphHeight += lineHeight;
    });
    return {
        toWriteTextObjects,
        paragraphHeight
    };
}
