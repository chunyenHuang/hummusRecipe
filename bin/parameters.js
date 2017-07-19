exports._setParameters = function _setParameters(options={}) {
    this.debug = false;
    this.metadata = {
        pageCount: 0
    };
    this.default = {
        pageWidth: 595,
        pageHeght: 842
    };
    this._position = { x: 0, y: 0 };

    Object.assign(this, options);
}
