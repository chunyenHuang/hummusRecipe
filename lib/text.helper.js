// Have to set up word as a constant, then export it below
// so that Line can see it. Otherwise, an error is thrown.

const Word = class Word {
    constructor(word, pathOptions) {
        this._value = word;
        this._pathOptions = pathOptions;
        this._last = false;
        this._text = (word === ' ') ? 'o' : word;  // allows space to get an actual dimension
    }

    get value() {
        return this._value;
    }

    get dimensions() {
        if (this._dimensions) {
            return this._dimensions;
        }
        this._dimensions = this._pathOptions.font.calculateTextDimensions(
            this._text, this._pathOptions.size
        );
        return this._dimensions;
    }

    get last() {
        return this._last;
    }

    lastWord(value=true) {  // indicate last word in line (for justification)
        this._last = value;
        if (this._last) {
            this._value = this._value.trim(); // wack any trailing space
            this._text = this._value;
            this._dimensions = this._pathOptions.font.calculateTextDimensions(
                this._text, this._pathOptions.size
            );
        }
    }
};

exports.Word = Word;  // ... now export Word to the rest of the library.

exports.Line = class Line {
    constructor(width, height, size, pathOptions) {
        this._width = width || 999999999;
        this._height = height;
        this._pathOptions = pathOptions;
        this.size = size || pathOptions.size;
        this._lineID = Date.now() * Math.random();
        this.wordObjects = [];
    }

    set lineID(id) {
        if (id) {
            this._lineID = id;
        }
    }

    get lineID() {
        return this._lineID;
    }

    addWord(wordObject) {
        this.wordObjects.push(wordObject);
    }

    indent(amount) {
        for (let i = 0; i < amount; i++) {
            this.addWord(new Word(' ', this._pathOptions));
        }
    }

    markLastWord() {
        if (this.wordObjects.length > 0) {
            this.wordObjects[this.wordObjects.length-1].lastWord();
        }
    }

    get lastWord() {
        return this.wordObjects[this.wordObjects.length-1];
    }

    canFit(wordObject) {
        const tempValue = this.value + wordObject.value;
        const toWidth = this._pathOptions.font.calculateTextDimensions(
            tempValue, this.size
        ).xMax;
        return (toWidth <= this.width);
    }

    replaceLastWord(wordObject) {
        if (typeof wordObject === 'string') {
            wordObject = new Word(wordObject, this._pathOptions);
        }
        this.wordObjects.pop();
        this.addWord(wordObject);
        wordObject.lastWord();
    }

    get words() {
        return this.wordObjects;
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
            width += word.dimensions.xMax;
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

/**
 * @todo handle page margin and padding
 */
exports._getTextBoxOffset = function _getTextBoxOffset(textBox, options = {}) {
    let offsetX = 0;
    let offsetY = -textBox.firstLineHeight;
    let { width, height, textHeight } = textBox;
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
            height = height || textHeight;
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
