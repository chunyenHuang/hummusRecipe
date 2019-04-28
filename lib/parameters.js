exports._setParameters = function _setParameters() {
    this.debug = false;
    this.metadata = {
        pageCount: 0
    };
    // letter size
    this.default = {
        pageWidth: 612,
        pageHeight: 792,
        // pagePadding: 0,
        // pageMargin: 0,
        paperSizeTypes: {
            'letter-size': {
                pageWidth: 612,
                pageHeight: 792
            },
            A4: {
                pageWidth: 595,
                pageHeight: 842
            }
        }
    };

    this._position = {
        x: 0,
        y: 0
    };

    // Object.assign(this, options);
};
