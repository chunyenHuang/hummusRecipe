/**
 * Transform coordinate from left-top center to left-bottom center
 * @param {float} x 
 * @param {float} y 
 */
exports._calibrateCoorinate = function _calibrateCoorinate(x, y, offsetX = 0, offsetY = 0, pageNumber) {
    pageNumber = pageNumber || this.pageNumber;
    const { width, height } = this.metadata[pageNumber];
    const nx = x + offsetX;
    const ny = height - y + offsetY;
    return {
        nx,
        ny
    };
};

exports._reverseCoorinate = function _reverseCoorinate(x, y, offsetX = 0, offsetY = 0) {
    pageNumber = pageNumber || this.pageNumber;
    const { width, height } = this.metadata[pageNumber];
    const ox = x - offsetX;
    const oy = y - height - offsetY;
    return {
        ox,
        oy
    };
};
