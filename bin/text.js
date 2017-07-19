exports.text = function text(text = '', x, y, options = {}) {
    if (!this.pageContext) return this;
    const { nx, ny } = this._calibrateCoorinate(x, y);
    const pathOptions = this._getPathOptions(options);
    const context = this.pageContext;
    context.writeText(text, nx, ny, pathOptions);
    return this;
}
