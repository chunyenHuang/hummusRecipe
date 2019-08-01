exports.Word = class Word {
    constructor(word, pathOptions) {
        this._value = word;
        this._pathOptions = pathOptions;
    }

    get value() {
        return this._value;
    }

    get dimensions() {
        if (this._dimensions) {
            return this._dimensions;
        }
        this._dimensions = this._pathOptions.font.calculateTextDimensions(
            this._value, this._pathOptions.size
        );
        return this._dimensions;
    }
};

exports.Line = class Line {
    constructor(width, height, size, pathOptions) {
        this._width = width || 999999999;
        this._height = height;
        this._pathOptions = pathOptions;
        this.size = size || pathOptions.size;
        this.wordObjects = [];
    }

    addWord(wordObject) {
        this.wordObjects.push(wordObject);
    }

    canFit(wordObject) {
        const tempValue = this.value + wordObject.value;
        const toWidth = this._pathOptions.font.calculateTextDimensions(
            tempValue, this.size
        ).width;
        return (toWidth <= this.width);
    }

    replaceLastWord(wordObject) {
        this.wordObjects.pop();
        this.addWord(wordObject);
    }

    get spaceWidth() {
        return this._pathOptions.font.calculateTextDimensions(
            'o', this.size
        ).width;
    }

    get value() {
        const value = this.wordObjects.reduce((string, word) => {
            string += word.value;
            return string;
        }, '');
        return value;
    }

    get currentWidth() {
        return this._pathOptions.font.calculateTextDimensions(
            this.value, this.size
        ).xMax;
    }

    get textWidth() {
        return this.wordObjects.reduce((width, word) => {
            width += word.dimensions.width;
            return width;
        }, 0);
    }

    get width() {
        return this._width;
    }

    // dynamic adjust height based on word height?
    get height() {
        if (this._height) {
            return this._height;
        }
        const toHeight = this._pathOptions.font.calculateTextDimensions(
            this.value, this.size
        ).height; // ymax
        return toHeight + 20;
    }
};

exports._getTextOffset = function _getTextOffset(text = '', options = {}) {
    if (!options.size || !options.font) {
        return;
    }
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
    return {
        offsetX,
        offsetY
    };
};

/**
 * @todo handle page margin and padding
 */
exports._getTextBoxOffset = function _getTextBoxOffset(textBox, options = {}) {
    let offsetX = 0;
    let offsetY = -textBox.firstLineHeight;
    const {
        width,
        height
    } = textBox;
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

    return {
        offsetX,
        offsetY
    };
};
