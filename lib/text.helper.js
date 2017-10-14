exports.Word = class Word {
    constructor(word, pathOptions) {
        this._value = word;
        this._pathOptions = pathOptions;
    }

    get value() {
        return this._value;
    }

    get dimensions() {
        if (this._dimensions) return this._dimensions;
        this._dimensions = this._pathOptions.font.calculateTextDimensions(
            this._value, this._pathOptions.size
        );
        return this._dimensions;
    }
}

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

    get spaceWidth() {
        return this._pathOptions.font.calculateTextDimensions(
            'o', this.size
        ).width * 1.1;
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
        ).width;
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
        if (this._height) return this._height;
        const toHeight = this._pathOptions.font.calculateTextDimensions(
            this.value, this.size
        ).height; // ymax
        return toHeight + 20;
    }
}
