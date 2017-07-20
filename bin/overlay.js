/**
 * Overlay PDF
 * TODO: 
 */
exports.overlay = function overlay(pdfSrc, x, y, options = {}) {
    const { nx, ny } = this._calibrateCoorinate(x, y);
    const context = this.pageContext;
    context.drawImage(nx, ny, pdfSrc);
    return this;
}
