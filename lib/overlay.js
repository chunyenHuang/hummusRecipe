/**
 * Overlay a pdf to the current pdf
 * @name overlay
 * @function
 * @memberof Recipe
 * @param {string} pdfSrc - The path for the overlay pdf
 * @param {number} x - The coordinate x
 * @param {number} y - The coordinate y
 */
exports.overlay = function overlay(pdfSrc, x, y, options = {}) {
    const { nx, ny } = this._calibrateCoorinate(x, y);
    const context = this.pageContext;
    context.drawImage(nx, ny, pdfSrc);
    return this;
}
