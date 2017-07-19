/**
 * Overlay PDF
 * TODO: 
 */
exports.overlay = function overlay(pdfSrc, x, y, options = {}) {
    const context = this.pageContext;
    const { nx, ny } = this._calibrateCoorinate(x, y);
    context.drawImage(nx, ny, pdfSrc);
    return this;
}
