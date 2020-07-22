const LineBreaker = require('linebreak');
const { Word, Line, Column } = require('./text.helper');
const { htmlToTextObjects } = require('./htmlToTextObjects');
const { Color, xObjectForm } = require('./xObjectForm');

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

// function merge (target, source) {
//     // Iterate through `source` properties and if an `Object` set property to merge of `target` and `source` properties
//     for (const key of Object.keys(source)) {
//         if (Array.isArray(source[key])) {
//             target[key] = source[key];  // don't want to merge elements, just accept new values.
//         } else if (source[key] instanceof Object && key in target) {
//             Object.assign(source[key], merge(target[key], source[key]));
//         }
//     }

//     // Join `target` and modified `source`
//     // Forcing non-object to become one. This allows
//     // things like hilite:true become hilite:{color:'red'}
//     if (! (target instanceof Object)) {
//         target = {};
//     }
//     Object.assign(target, source)
//     return target
// }

exports._merge = function merge(target, source) {
    // Iterate through `source` properties and if an `Object` set property to merge of `target` and `source` properties
    for (const key of Object.keys(source)) {
        if (Array.isArray(source[key])) {
            target[key] = source[key]; // don't want to merge elements, just accept new values.
        } else if (source[key] instanceof Object && target instanceof Object && key in target) {
            Object.assign(source[key], merge(target[key], source[key]));
        }
    }

    // Join `target` and modified `source`
    // Forcing non-object to become one. This allows
    // things like hilite:true become hilite:{color:'red'}
    if (!(target instanceof Object)) {
        target = {};
    }
    return Object.assign({}, target, source);
};


function _initOptions(self, x = {}, y, options = {}) {
    // This allows user to skip providing x/y coordinates
    if (typeof x === 'object') {
        options = x;
        self._textOptions = self._textOptions || { textBox: {} };
        self._flow = (options.flow === undefined) ? true : options.flow;

        if (options.layout) {
            self._columns = self._layouts[options.layout];
            self.x = self._columns[0].x;
            self.y = self._columns[0].y;
            self.box = { x: self.x, y: self.y };
            self._firstLineHeight = 0;
        }

        // The following only happens when 'text' is called
        // for the first time without any position coordinates.
        if (self.box === undefined) {
            if (!options.layout) {
                self.x = self._margin.left;
                self.y = self._margin.top;
            }

            self.box = { x: self.x, y: self.y };
            self._firstLineHeight = 0;
        }

    } else {
        // Update the current position, when provided.
        [x, y] = self._centrify(x, y);
        self.x = x;
        self.y = y;
        self.box = { x, y };
        self._firstLineHeight = 0; // indicates not set yet, determined later.
        self._textOptions = { textBox: {} };
        self._previousTextObjects = [];
        self._flow = options.flow || false;

        if (options.layout) {

            self._columns = self._layouts[options.layout];

            // Only tinker with the column coordinates when the incoming
            // [x,y] coordinates differ from the first layout element.

            if (x !== self._columns[0].x || y !== self._columns[0].y) {
                // Override layout values.
                adjustcolumnPosition(self._columns, x, y);
            }
        }
    }

    self._previousTextObjects = self._previousTextObjects || [];

    // Merge any previous options with new options
    const mergedOpts = self._merge(self._textOptions, options);

    if (self._flow && mergedOpts.textBox.width === undefined) {
        mergedOpts.textBox.width = Math.max(0, self.metadata[self.pageNumber].width - self.x - self._margin.right);
    }

    if (options.layout) {
        self._columns = self._layouts[options.layout];
        mergedOpts.textBox.width = self._columns[0].width;
        mergedOpts.textBox.height = self._columns[0].height;
    }

    if (options.overflow) {
        self._overflowNotifier = options.overflow;
    }

    return mergedOpts;
}

function isEmpty(obj) {
    return !obj || Object.keys(obj).length === 0 && obj.constructor === Object;
}

exports._makeTextObject = function _makeTextObject(text, size, options) {
    return [{
        value: text,
        tag: null,
        font: options.font,
        isBold: options.bold,
        isItalic: options.italic,
        attributes: [],
        styles: {},
        needsLineBreaker: false,
        size: size,
        sizeRatio: 1,
        sizeRatios: [1],
        link: null,
        childs: []
    }];
};

exports._makeTextBox = function _makeTextBox(options) {
    return (isEmpty(options.textBox)) ? {
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
};

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
 * @param {number} [options.charSpace=0] - space to be added between characters, units in points.
 * @param {string} [options.align='left top'] - This is the alignment of the text in relationship to its position
 * coordinates, specified as 'horizontal vertical', where horizontal is either 'left', 'center' or 'right
 * and vertical is either 'top', 'center' or bottom.
 * @param {Object|Boolean} [options.highlight] - Text markup annotation.
 * @param {Object|Boolean} [options.underline] - Text markup annotation.
 * @param {Object|Boolean} [options.strikeOut] - Text markup annotation.
 * @param {Boolean} [options.flow=false] - Used to activate/deactivate text flow which is the
 * ability to use multiple calls to 'text' to create an overall text box.
 * @param {number|string} [options.layout] - An identifier of the layout to be associated with given text.
 * @param {function} [options.overflow] - Called when the text is going to exceed the area
 * of the given text object. Intended for column layouts. Its parameter is (self) where 'self' is the recipe handle so
 * that other recipe interfaces can be called. The return value can be 'true' which indicates that text processing
 * should stop, or 'false' which indicates that the text should continue being processed with the original [x,y]
 * coordinates, or it can be an object containing a 'column' property indicating either a layout column index
 * or a set of [x,y] coordinates where the next set of layout columns should be positioned for the remaining text.
 * @param {Boolean|Object} [options.hilite=false] - Used to hilite given text.
 * @param {string|number[]} [options.hilite.color=yellow] - text hilite color (HexColor, PercentColor or DecimalColor)
 * @param {number} [options.hilite.opacity=.5] - text hilite color opacity
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
 * @param {boolean|number|number[]} [options.textBox.style.borderRadius=0] - Border radius to apply to get rounded corners.
 * When true is given, the default radius size for all corners is 5. A four number array may be used to give specific sizees to each
 * corner. The numbering starts from the top, left corner, and goes clockwise around the text box.
 */
exports.text = function text(text = '', x, y, options = {}) {
    if (!this.pageContext) {
        return this;
    }
    options = _initOptions(this, x, y, options);

    const targetAnnotations = options;
    const originCoord = this._calibrateCoordinate(this.x, this.y, 0, 0, this.pageNumber);
    const pathOptions = this._getPathOptions(options, originCoord.nx, originCoord.ny);
    pathOptions.html = options.html;
    pathOptions.hilite = options.hilite;

    // save text state for continued text?
    this._textOptions = (this._flow) ? options : { textBox: {} };

    const textObjects = (options.html) ? htmlToTextObjects(text) : this._makeTextObject(text, pathOptions.size, options);
    const textBox = this._makeTextBox(options);

    let { toWriteTextObjects } = this._layoutText(textObjects, textBox, pathOptions);

    if (!textBox.width) {
        textBox.width = toWriteTextObjects[0].lineWidth;
    }

    textBox.firstLineHeight = this._firstLineHeight;

    // need to collect all the text that is 'flowing' before processing.
    if (this._flow) {
        this._previousTextObjects = [...toWriteTextObjects];
    } else {
        textBox.textHeight = getTextBoxHeight(toWriteTextObjects);
        let [nx, ny] = getTextBoxPosition(this, textBox, pathOptions);
        let textYpos = ny;

        // Need to determine textBox.height option before
        // actually drawing any text box, or determining
        // vertical positioning of text.
        if (!textBox.height) {
            textBox.height = textBox.textHeight + textBox.paddingTop + textBox.paddingBottom;
    
            if (textBox.minHeight && textBox.minHeight > textBox.height) {
                textBox.height = textBox.minHeight;
            }
        }
        
        if (textBox.style) {
            drawTextBox(this, nx, ny, textBox, pathOptions);
        }

        // Determine vertical starting position of text within textBox
        switch (toWriteTextObjects[0].writeOptions.alignVertical) {
            case 'center':
                textYpos -= (textBox.height - textBox.textHeight) / 2 - textBox.paddingTop;
                break;
            case 'bottom':
                textYpos -= (textBox.height - textBox.textHeight - textBox.paddingBottom);
                break;
        }

        let context = this.pageContext;
        let currentY = textYpos - textBox.paddingTop;
        let boxTop = currentY;
        let currentLineID;
        let currentLineWidth = 0;
        let toWriteContents = [];
        let columnIndex = 1;

        toWriteTextObjects.some((toWriteTextObject, index) => {
            const isHTML = toWriteTextObject.writeOptions.html;
            const {
                text,
                lineHeight,
                lineWidth,
                lineID,
                spaceWidth
            } = toWriteTextObject;

            currentLineID = currentLineID || lineID;
            const isContinued = (currentLineID == lineID) ? true : false;

            const getStartX = (startX, content) => {
                let spaceWidth = content.text.endsWith(' ') ? content.spaceWidth : 0;
                let offsetX;
                switch (content.writeOptions.alignHorizontal) {
                    case 'center':
                        offsetX = (textBox.width - currentLineWidth) / 2;
                        break;
                    case 'right':
                        offsetX = (textBox.width - textBox.paddingRight - currentLineWidth) + spaceWidth;
                        break;
                    default:
                        offsetX = textBox.paddingLeft;
                        break;
                }

                return startX + offsetX;
            };

            const addUnderline = (x, y, ctx, options) => {
                // underline implementation
                if (options.underline) {
                    // console.log(textWidth, lineWidth, currentLineWidth)
                    const underlineY = y - options.textHeight * 0.1;
                    //  TODO: fix the line with calculation
                    const width = currentLineWidth - ((isHTML || toWriteTextObject.text.endsWith(' ')) ? spaceWidth : 0);
                    ctx
                        .q()
                        .drawPath(x, underlineY, x + width, underlineY, options)
                        .Q();
                }
            };

            const addTextTraits = (ctx, options) => {
                ctx.Tf(options.font, options.size);
                ctx.Tc(options.charSpace);
                if (options.colorModel.xObject) {
                    options.colorModel.xObject.fill(options.colorModel);
                } else {
                    Color.fill(ctx, options.colorModel);
                }
            };

            const emitText = (word, x, y, ctx) => {
                ctx.Tm(1, 0, 0, 1, x, y);
                ctx.Tj(word);
            };

            const emitTextObject = (text, x, y, ctx, options) => {
                ctx.BT();
                addTextTraits(ctx, options);
                emitText(text, x, y, ctx);
                ctx.ET();

                addUnderline(x, y, ctx, options);
            };

            const justifyText = (left, x, wto, textBox, ctx, options, callback) => {
                ctx.BT();
                addTextTraits(ctx, options);
                let next_x = justify(left, x, wto, textBox, callback);
                ctx.ET();
                return next_x;
            };

            const updateTextBox = (columns) => {
                textBox.width = columns.width; // in case user changed column layout
                textBox.height = columns.height;
                [nx, ny] = getTextBoxPosition(this, textBox, pathOptions);
                boxTop = currentY = ny;
                if (textBox.style) {
                    drawTextBox(this, nx, currentY, textBox, pathOptions);
                }
            };

            const writeText = (context, x, y, wto) => {
                const options = wto.writeOptions;
                const { lineHeight, text, baseline } = wto;
                let next_x = 0;

                if (text === '') { // nothing to write, so simply escape.
                    return next_x;
                }

                // Produce a hilite under words?
                if (options.hilite) {
                    const bgColor = options.hilite.color || '#ffff00';
                    const bgOpacity = options.hilite.opacity || .5;
                    let bxWidth = wto.lineWidth;

                    // The hiliting rectangle cannot use the text box line
                    // width when justification is activated because the
                    // spaces between words is calculated dynamically.
                    if (options.alignHorizontal === 'justify') {
                        bxWidth = justify(nx, x, wto, textBox) - x;

                        // Except for 'right' alignment cases, have to consider
                        // text on line ending with spaces to tweak box width.
                    } else if (options.alignHorizontal !== 'right') {
                        if (text.endsWith(' ')) {
                            bxWidth += wto.spaceWidth;
                        }
                    }

                    this.rectangle(x, y, bxWidth, options.textHeight, {
                        useGivenCoords: true,
                        rotation: pathOptions.rotation,
                        rotationOrigin: [pathOptions.originX, pathOptions.originY],
                        fill: bgColor,
                        opacity: bgOpacity
                    });
                }

                // Note that the last line of a text box ignores justification.
                const _justify = options.alignHorizontal === 'justify' && !wto.lastLine;

                // write directly to page when not dealing with opacity, rotation and special colorspace.
                if (options.opacity === 1 && options.colorspace !== 'separation' &&
                    (options.rotation === 0 || options.rotation === undefined)) {

                    context.q();

                    if (_justify) {
                        next_x =
                            justifyText(nx, x, wto, textBox, context, options, (word, xx) => {
                                emitText(word.value, xx, y + baseline, context);
                            });
                    } else {
                        if (textBox.wrap !== 'auto') { // This applies a clipping region around the text
                            context
                                .m(nx, y + lineHeight)
                                .l(nx + textBox.width, y + lineHeight)
                                .l(nx + textBox.width, y)
                                .l(nx, y)
                                .h().W().n();
                        }

                        emitTextObject(text, x, y + baseline, context, options);
                    }

                    context.Q();
                } else {

                    this.pauseContext();

                    // https://github.com/galkahana/HummusJS/wiki/Use-the-pdf-drawing-operators
                    const xObject = new xObjectForm(this.writer, textBox.width, lineHeight);
                    const xObjectCtx = xObject.getContentContext();
                    if (options.colorModel) {
                        options.colorModel.xObject = xObject;
                    }

                    xObjectCtx.q();
                    xObjectCtx.gs(xObject.getGsName(options.fillGsId)); // set graphic state (here opacity)

                    if (_justify) {
                        next_x =
                            justifyText(nx, x, wto, textBox, xObjectCtx, options, (word, xx) => {
                                emitText(word.value, xx - nx, baseline, xObjectCtx, options);
                            });
                    } else {
                        emitTextObject(text, x - nx, baseline, xObjectCtx, options);
                    }

                    xObjectCtx.Q();
                    xObject.end();

                    // To get proper alignment, reset back to textbox
                    // coordinate in case text segment encountered.
                    x = nx;

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
                        const markupOption = (typeof(targetAnnotations[key]) != 'object') ? {} : targetAnnotations[key];
                        Object.assign(markupOption, {
                            height: textHeight * 1.4,
                            width: currentLineWidth,
                            text: markupOption.text || '',
                            _textHeight: textHeight
                        });
                        const { ox, oy } = this._reverseCoordinate(x, y - textHeight * 0.2);
                        this.annot(ox, oy, subtype, markupOption);
                    }
                }

                return next_x;
            };

            if (!isContinued) { // flush out current line before processing next one
                let next_x = 0;
                toWriteContents.forEach((content) => {
                    const x = next_x || getStartX(content.startX, content);
                    const y = currentY;
                    next_x = writeText(context, x, y, content);
                });
                // The line offset from the last line in the
                // group determines Y positioning for next line.
                let lineOffset = (toWriteContents.length) ? toWriteContents[toWriteContents.length - 1].lineOffset : 1;
                let yDiff = lineHeight * lineOffset;
                let overflow = false;
                let updateVertical = true;
                toWriteContents = [];
                currentLineID = lineID;
                currentLineWidth = 0;

                if (this._columns) {
                    const boxHeight = boxTop - currentY + yDiff;
                    if (boxHeight > textBox.height - lineHeight) {
                        if (columnIndex >= this._columns.length) {
                            overflow = true;
                        } else {
                            [this.x, this.y] = this._columns[columnIndex].position;
                            updateTextBox(this._columns[columnIndex]);
                            columnIndex++;
                            updateVertical = false;
                        }
                    }
                }

                if (overflow && this._overflowNotifier) {
                    let orders = this._overflowNotifier(this);
                    if (orders === true) {
                        return true; // stop processing remaining text.
                    }
                    if (orders.layout !== undefined) {
                        this._columns = this._layouts[orders.layout];
                        if (!this._columns) {
                            throw new Error(`Layout '${orders.layout}' is undefined.`);
                        }
                        if (!orders.column) {
                            orders.column = 0;
                        }
                    }

                    if (orders.column !== undefined) {
                        if (Array.isArray(orders.column)) {
                            let [xx, yy] = orders.column;
                            [this.x, this.y] = orders.column;
                            adjustcolumnPosition(this._columns, xx, yy);
                            columnIndex = 1;
                        } else {
                            columnIndex = orders.column;
                            [this.x, this.y] = this._columns[columnIndex++].position;
                        }
                        updateTextBox(this._columns[columnIndex - 1]);
                        updateVertical = false;
                    }
                    context = this.pageContext; // in case user changed page
                }

                if (updateVertical) {
                    currentY -= yDiff;
                    this.y += yDiff;
                }

                this._previousTextObjects.shift();
            }

            const startX = nx + currentLineWidth;

            // This text will only ever have this strange tag when the
            // HTML option is being used and an explicit linebreak encountered.
            if (text != '[@@DONOT_RENDER_THIS@@]') {
                toWriteTextObject.startX = toWriteTextObject.startX || startX;
                toWriteContents.push(toWriteTextObject);
            }

            // To handle text that has been split in middle of word,
            // need to decide if current text ends with a space.
            currentLineWidth += lineWidth + ((isHTML || toWriteTextObject.text.endsWith(' ')) ? spaceWidth : 0);

            // Processing last text object?
            if (index === toWriteTextObjects.length - 1) {
                if (this._flow) {
                    if (toWriteTextObject.lineComplete) {
                        this._previousTextObjects = [];
                    } else {
                        this._previousTextObjects = [...toWriteContents];
                        toWriteContents = [];
                    }
                }

                let next_x = 0;
                for (let ii = 0; ii < toWriteContents.length; ii++) {
                    const content = toWriteContents[ii];
                    const x = next_x || getStartX(content.startX, content);
                    const y = currentY;
                    next_x = writeText(context, x, y, content);
                }

                // Flush any left over text objects.
                if (!this._flow) {
                    this._previousTextObjects = [];
                }
            }
        });
    }

    return this;
};

exports._layoutText = function _layoutText(textObjects, textBox, pathOptions) {
    let totalHeight = 0;
    // allow user to treat wrap as boolean
    if (textBox.wrap === true) {
        textBox.wrap = 'auto';
    } else if (textBox.wrap === false) {
        textBox.wrap = 'ellipsis';
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
        paddingTop: textBox.padding[0],
        paddingRight: (textBox.padding[1] !== undefined) ? textBox.padding[1] : textBox.padding[0],
        paddingBottom: (textBox.padding[2] !== undefined) ? textBox.padding[2] : textBox.padding[0],
        paddingLeft: (textBox.padding[3] !== undefined) ? textBox.padding[3] : (textBox.padding[1] !== undefined) ? textBox.padding[1] : textBox.padding[0]
    });

    let firstLineHeight;
    let toWriteTextObjects = [];

    const writeValue = (textObject) => {
        textObject.lineID = textObject.lineID || Date.now() * Math.random();
        textObject.lineID = (textObject.needsLineBreaker) ? Date.now() * Math.random() : textObject.lineID;
        // Want to allow empty string to pass through. Undefined and null elements, stay out!
        if (textObject.value !== undefined && textObject.value !== null) {
            textObject.styles.color = (textObject.styles.color) ?
                this._transformColor(textObject.styles.color) : pathOptions.color;
            const {
                toWriteTextObjects: newToWriteObjects,
                paragraphHeight
            } = makeTextObjects(this, textObject, pathOptions, textBox);

            toWriteTextObjects = [...toWriteTextObjects, ...newToWriteObjects];

            if (!firstLineHeight) {
                this._lineHeight = firstLineHeight = toWriteTextObjects[0].lineHeight;
                if (!this._firstLineHeight) {
                    this._firstLineHeight = this._lineHeight; // used in textbox coordinate computation
                }
            }
            totalHeight += paragraphHeight;
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

    return { toWriteTextObjects: toWriteTextObjects, textHeight: totalHeight };
};

function getTextBoxHeight(textObjs) {
    let previousLineID;
    let height = 0;

    // The summation of each text line height determines text box height.
    // The last segment of a line holds the correct offset (influenced by moveDown)
    // so must traverse the list in reverse order.

    for (let index = textObjs.length - 1; index >= 0; index--) {
        const segment = textObjs[index];
        const { lineHeight, lineID } = segment;

        // Keep line segments from same line influencing box height
        if (previousLineID !== lineID) {
            let lineOffset = segment.lineOffset;
            height += (lineHeight * lineOffset);
            previousLineID = lineID;
        }
    }

    return height;
}

function getTextBoxPosition(self, textBox, pathOptions) {

    const { offsetX, offsetY } = self._getTextBoxOffset(textBox, pathOptions);
    const { nx, ny } = self._calibrateCoordinate(self.x, self.y, offsetX, offsetY);
    return [nx, ny];
}

function drawTextBox(self, nx, ny, textBox, pathOptions) {

    const textBoxWidth = textBox.width; //+ textBox.paddingLeft + textBox.paddingRight;
    let borderRadius = (textBox.style) ? textBox.style.borderRadius : 0;
    if (borderRadius === true) { borderRadius = 5; }

    self.rectangle(
        nx,
        ny - textBox.height + self._firstLineHeight,
        textBoxWidth, textBox.height, Object.assign(textBox.style, {
            useGivenCoords: true,
            rotation: pathOptions.rotation,
            rotationOrigin: [pathOptions.originX, pathOptions.originY],
            borderRadius: borderRadius
        })
    );
}

/**
 * Justify text in a line.
 * @param {number} left is position of left hand side of text box
 * @param {number} x is starting position for text placement
 * @param {Object[]} wto is a write object
 * @param {Object} textBox holds text box properties
 * @param {Function} [position] used to place given word at a postion on the line
 */
function justify(left, x, wto, textBox, position) {
    // For some reason, textWidth is smaller than lineWidth. My suspicions lie in the fact
    // that spacing computations appear different depending on where the space is located.
    // What is noted though that if lineWidth is used in the calculations for text
    // justitification, the text goes passed the right boundary. Due to the vagary in space
    // computation, the final wrinkle to make sure the last word in the line smacks up against
    // the right side boundary is to perform a special computation on the last word positioning
    // relative to that right side bounds.
    const wordsInLine = wto.wordsInLine;
    const textWidth = (wto.totalTextWidth) ? wto.totalTextWidth : wto.textWidth;
    const spaceCount = (wto.wordCount) ? wto.wordCount - 1 : wordsInLine.length - 1;
    const spaceBetweenWords = (spaceCount > 0) ? (textBox.width - textBox.paddingLeft - textBox.paddingRight - textWidth) / (spaceCount) : 0;
    const boxEdge = left;
    const lineStart = left + textBox.paddingLeft;
    let word;

    const lastWordPosition = (word) => {
        return boxEdge + textBox.width - textBox.paddingRight - word.dimensions.xMax;
    };

    // There is the possibility that only one word left on segmented line.
    if (wordsInLine.length === 1 && wordsInLine[0].last && x !== lineStart) {
        x = lastWordPosition(wordsInLine[0]);
    }

    for (let index = 0; index < wordsInLine.length; index++) {
        const nextWord = wordsInLine[index + 1];

        word = wordsInLine[index];
        position && position(word, x);

        // Ready to compute last word spacing?
        if (nextWord && nextWord.last) {
            x = lastWordPosition(nextWord);
        } else {
            x += word.dimensions.xMax + spaceBetweenWords;
        }
    }

    // Supply caller with next available line position.
    // Checking to see if last word ended with a space or not
    // to compensate for text fragments that have not been
    // split on whitespace boundaries.
    return word.value.endsWith(' ') ? x : x - spaceBetweenWords;
}

function nextWord(text, brk, previousPosition, pathOptions) {
    let nextWord = text.slice(previousPosition, brk.position);

    if (brk.required) { // effectively saw a '\n' in text.
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
        let tooBig = new Word(word.value.slice(0, -2) + ellipsis, pathOptions);

        while (!line.canFit(tooBig)) {

            if (tooBig.value.length > 1) {
                tooBig = new Word(tooBig.value.slice(0, -2) + ellipsis, pathOptions);

                // Try last word that fit in box?
            } else if (!usingPreviousWord) {
                tooBig = new Word(line.words.pop().value.slice(0, -1) + ellipsis, pathOptions);
                usingPreviousWord = true;

            } else {
                break; // give up, only get 2 shots at this.
            }
        }

        line.addWord(tooBig);
    }
}

function makeTextObject(lines, line, lineID, textBox, options = {}) {

    const lineHeight = line.height;
    const spaceSz = (options.lastLine && line.lastWord && line.lastWord.value.endsWith(' ')) ? line.spaceWidth / 2 : 0;
    let lid;

    if (!options.html) {
        lid = line.lineID;
    } else {
        // Use given lineID for very first line.
        // It helps to tie HTML lines together.
        lid = (lines.length) ? line.lineID : lineID;
    }

    lines.push(line);

    return {
        text: line.value,
        lineID: lid,
        lineHeight: lineHeight,
        lineOffset: 1,
        baseline: lineHeight - textBox.baselineHeight,
        lineWidth: line.currentWidth + spaceSz,
        textWidth: line.textWidth, // for justification
        spaceWidth: line.spaceWidth,
        wordsInLine: line.words,
        wordCount: options.wordCount || 0, // for justification
        totalTextWidth: options.totalTextWidth || 0,
        lastLine: (options.lastLine === true),
        writeOptions: options.writeOptions,
        lineComplete: (options.lineComplete === true)
    };
}

function bindTextToLine(line, textObjects, wordCount, totalTextWidth) {
    // Apply justification information to previous text objects.
    if (wordCount > 0) {
        line.markLastWord();
        wordCount += line.words.length;
        totalTextWidth += line.textWidth;

        // If the previous text does not end with a space and
        // the text on the line does not start with a space then
        // assuming that the input was split across the word so
        // we want to decrement the number of words in the line
        // for the proper space calculation when justifying text.
        // For example, 'justif' --- 'ying'.
        const previousLine = textObjects[textObjects.length - 1];

        if (!previousLine.text.endsWith(' ') &&
            line.words[0] && !line.words[0].value.startsWith(' ')) {
            wordCount--;
        }

        line.lineID = previousLine.lineID; // associate this line with previous one

        for (let i = textObjects.length - 1; i >= 0; i--) {
            let textObj = textObjects[i];
            if (textObj.lineID !== line.lineID) { break; }
            textObj.wordCount = wordCount;
            textObj.totalTextWidth = totalTextWidth;
        }
    }
    return [wordCount, totalTextWidth];
}

function makeTextObjects(self, textObject = {}, pathOptions, textBox = {}) {
    const toWriteTextObjects = [...self._previousTextObjects];
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

    const [alignHorizontal, alignVertical] = (textBox.textAlign) ? textBox.textAlign.split(' '): [];
    const writeOptions = Object.assign({}, pathOptions, {
        color: textObject.styles.color,
        opacity: parseFloat(textObject.styles.opacity || pathOptions.opacity || 1),
        underline: textObject.underline || pathOptions.underline,
        size: textObject.size,
        alignHorizontal: alignHorizontal,
        alignVertical: alignVertical,
        font: self._getFont(textObject)
    });

    const lineOpts = {
        html: pathOptions.html,
        writeOptions: writeOptions,
        more: self._flow
    };

    const breaker = new LineBreaker(text);
    const lines = [];
    const indent = (textObject.indent || 0);

    const lineMaxWidth = (textBox.width) ? textBox.width - textBox.paddingLeft - textBox.paddingRight - indent : null;
    let remainderWidth = lineMaxWidth;
    let newLine;
    let last = 0;
    let bk = breaker.nextBreak();
    let previousWord;
    let flushLine = false;
    let wordCount = 0; // for justification
    let totalTextWidth = 0; // for justification
    let textLine = '';
    let lineID = textObject.lineID;
    let lineHeight = (textHeight > textBox.lineHeight) ? textHeight : textBox.lineHeight;

    // When text flow is involved, there may be lines that are
    // incomplete. So need to determine previous line word count
    // and remove last line marks because more text is being processed.
    if (toWriteTextObjects.length > 0) {
        let lineWidth = 0;
        let spaceSz = 0;
        const end = toWriteTextObjects.length - 1;
        const previousLine = toWriteTextObjects[end];
        let lineComplete, fini;

        if (text === '' && !self._flow) { // turning off flow with empty text so
            previousLine.lastLine = true; // need to make previous line, the last.
        }

        for (let i = end; i >= 0; i--) {
            let textObj = toWriteTextObjects[i];

            // only collect data while lineID's match.
            if (textObj.lineID !== previousLine.lineID) { break; }
            spaceSz = textObj.spaceWidth;
            textLine = textObj.text + textLine;
            totalTextWidth += textObj.textWidth;
            lineWidth += textObj.lineWidth;
            if (i === end) {
                fini = lineComplete = textObj.lineComplete;
            } else {
                fini = textObj.lineComplete;
            }
            textObj.wordsInLine[textObj.wordsInLine.length - 1].lastWord(fini);
        }

        if (lineComplete) {
            totalTextWidth = 0;
        } else if (textLine) {
            wordCount = textLine.trim().split(/\s+/).length;
            if (!textLine.endsWith(' ')) { spaceSz = 0; }
            remainderWidth = lineMaxWidth - lineWidth - spaceSz;
        }
    }

    newLine = new Line(remainderWidth, lineHeight, size, pathOptions);
    newLine.indent(indent);

    while (bk) {
        let word = nextWord(text, bk, last, pathOptions);

        if (newLine.canFit(word)) {
            newLine.addWord(word);
        } else {
            // Protect against line width being too small to accept any
            // word, which may also happen during text justification.
            if (newLine.words.length === 0) {
                // self.movedown(); // start at front of next line.
                if (wordCount > 0) {
                    // no words applied to previous segment, so drop word count
                    // and mark last word of previous line in case justifying.
                    wordCount = 0;
                    totalTextWidth = 0;
                    markLineComplete(toWriteTextObjects);
                }
            } else {
                // remove any trailing space on previous word so right justification works appropriately
                if (previousWord && textBox.wrap === 'auto') {
                    newLine.replaceLastWord(previousWord.value.trim());
                }

                [wordCount, totalTextWidth] =
                bindTextToLine(newLine, toWriteTextObjects, wordCount, totalTextWidth);

                toWriteTextObjects.push(
                    makeTextObject(lines, newLine, lineID, textBox,
                        Object.assign({}, lineOpts, {
                            wordCount: wordCount,
                            totalTextWidth: totalTextWidth,
                            lineComplete: true
                        })
                    )
                );
                wordCount = 0;
                totalTextWidth = 0;
            }

            // now deal with text line wrap (what happens to text that doesn't fit in line)
            if (textBox.wrap !== 'auto') {
                flushLine = true;
                elideNonFittingText(textBox, newLine, word, pathOptions);

                if (toWriteTextObjects.length > 0) {
                    toWriteTextObjects[toWriteTextObjects.length - 1].text = newLine.value;
                } else {
                    // this is the first line in the box (no other line yet emitted) ...
                    toWriteTextObjects.push(
                        makeTextObject(lines, newLine, lineID, textBox,
                            Object.assign({}, lineOpts, {
                                lineComplete: true
                            })
                        )
                    );
                }

            } else {
                // this is the auto wrap section
                newLine = new Line(lineMaxWidth, lineHeight, size, pathOptions);
                newLine.indent(indent);

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
                    newLine = new Line(lineMaxWidth, lineHeight, size, pathOptions);
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
                toWriteTextObjects.push(
                    makeTextObject(lines, newLine, lineID, textBox, Object.assign({ lineComplete: true, lastLine: true }, lineOpts)));
                markLineComplete(toWriteTextObjects);
                newLine = new Line(lineMaxWidth, lineHeight, size, pathOptions);
            }
        }

        if (bk) {
            previousWord = word;
            last = bk.position;
            bk = breaker.nextBreak();
        }
    }

    let isLastLine = (alignHorizontal === 'justify' && !self._flow);

    if (!flushLine) {
        [wordCount, totalTextWidth] =
        bindTextToLine(newLine, toWriteTextObjects, wordCount, totalTextWidth);

        toWriteTextObjects.push(
            makeTextObject(lines, newLine, lineID, textBox,
                Object.assign({}, lineOpts, {
                    wordCount: wordCount,
                    totalTextWidth: totalTextWidth,
                    lastLine: isLastLine
                })));
    } else {
        toWriteTextObjects[toWriteTextObjects.length - 1].lastLine = isLastLine;
    }

    let paragraphHeight = lineHeight * lines.length + textBox.paddingTop + textBox.paddingBottom;

    return {
        toWriteTextObjects,
        paragraphHeight
    };
}

function markLineComplete(toWriteTextObjects, lines = null) {
    // Get last element in text objects and mark it.
    const textObj = toWriteTextObjects[toWriteTextObjects.length - 1];
    const lastWordIdx = textObj.wordsInLine.length - 1;

    textObj.wordsInLine[lastWordIdx].lastWord();
    textObj.text = textObj.text.trim();
    textObj.lineComplete = true;

    if (lines) {
        textObj.lineOffset = lines;
    }
}

/** Move text positioning down N lines in text box
 * @name movedown
 * @function
 * @memberof Recipe
 * @param {number} [lines=1] - the number of lines to reposition x and y coordinates
 * @param {Boolean} [returnCoords=false] - indicate whether or not to return [x,y] coordinates
 * @returns {Object|number[]} - when returnCoord false, the recipe object, when true, the new [x,y] coordinates.
 */
exports.movedown = function movedown(lines = 1, returnCoords = false) {

    if (!this._flow || this._previousTextObjects.length === 0) {
        this._previousTextObjects = [];
        this.y += this._lineHeight * lines;
        this.x = this.box.x;
    } else {
        // This handles continuous text positioning
        markLineComplete(this._previousTextObjects, lines);
        this._previousTextObjects[this._previousTextObjects.length - 1].lastLine = true;
    }

    return (returnCoords) ? [this.x, this.y] : this;
};

function adjustcolumnPosition(columns, x, y) {
    const ydiff = y - columns[0].y;
    for (const column of columns) {
        column.position = [x, column.y + ydiff];
        x += column.width + column.gap;
    }
}

/**
 * Define text column layout
 * @name layout
 * @function
 * @memberof Recipe
 * @param {number|string} id - The identifier to be associated with the layout. (See 'text' layout option)
 * @param {number} x - The coordinate x used to position text columns on page. When zero, left margin used.
 * @param {number} y - The coordinate y used to position text columns on page. When zero, top margin used.
 * @param {number} width - The width of a text column. When zero, space between left and right margin used.
 * @param {number} height - The height of a text column. When zero, space between top and bottom margin used.
 * @param {object} [options] - The options.
 * @param {number} [options.columns] - Represents the number of columns in which to divide the given width.
 * @param {number} [options.gap=18] - Defines the separation between layout columns, units in points.
 * @param {boolean} [options.reset] - True indicates that the a new layout should be produced for the given
 * layout id, so any previous layout associated with the given id will be lost.
 */
exports.layout = function layout(id, x, y, width, height, options = {}) {
    this._layouts = this._layouts || {};
    this._layouts[id] = this._layouts[id] || [];

    if (options.reset) {
        this._layouts[id] = [];
    }

    if (!x) {
        x = this._margin.left;
    }
    if (!y) {
        y = this._margin.top;
    }
    if (!width) {
        width = this.page.mediaBox[2] - x - this._margin.right;
    }
    if (!height) {
        height = this.page.mediaBox[3] - y - this._margin.bottom;
    }

    if (!options.columns) {
        this._layouts[id].push(new Column(x, y, width, height));

        // columns as a simple number drives the text multiple columns feature
    } else if (typeof options.columns === 'number') {
        const columns = options.columns;
        const gap = options.gap || 18;
        width = width / columns - (gap / 2);

        for (let i = 0; i < options.columns; i++) {
            const column = new Column(x, y, width, height);
            column.gap = gap;
            this._layouts[id].push(column);
            x += width + gap;
        }
        // columns as an array drives the table feature (internal not documented for user)
    } else if (Array.isArray(options.columns)) {
        for (let i = 0; i < options.columns.length; i++) {
            let element = options.columns[i];
            width = element.width || 100;
            const column = new Column(x, y, width, height, element.text, element.name, element);
            this._layouts[id].push(column);
            x += width;
        }
    }

    return this;
};
