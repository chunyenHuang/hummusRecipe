exports._setParameters = function _setParameters(options = {}) {
    this.debug = false;
    this.metadata = {
        pageCount: 0
    };
    // letter size
    this.default = {
        pageWidth: 612,
        pageHeght: 792,
        paperSizeTypes: {
            'letter-size': {
                pageWidth: 612,
                pageHeght: 792
            },
            'A4': {
                pageWidth: 595,
                pageHeght: 842
            }
        }
    };

    this._position = { x: 0, y: 0 };

    // Object.assign(this, options);
}
