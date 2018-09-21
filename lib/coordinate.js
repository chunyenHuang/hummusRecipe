exports._calibrateCoordinate = function _calibrateCoordinate(x, y, offsetX = 0, offsetY = 0, pageNumber) {
    pageNumber = pageNumber || this.pageNumber;
    const { width, height, mediaBox } = this.metadata[pageNumber];
    const startX = mediaBox[0];
    const startY = mediaBox[1];
    switch (x) {
        case 'center':
            x = width / 2;
            break;
    }
    switch (y) {
        case 'center':
            y = height / 2;
            break;
    }
    const nx = x + offsetX + startX;
    const ny = height - y + offsetY + startY;
    return {
        nx,
        ny
    };
};

exports._calibrateCoordinateForAnnots = function _calibrateCoordinateForAnnots(x, y, offsetX = 0, offsetY = 0, pageNumber) {
    const { nx: tx, ny: ty } = this._calibrateCoordinate(x, y, offsetX, offsetY, pageNumber);
    const { width, height, rotate, mediaBox } = this.metadata[pageNumber];
    const startX = mediaBox[0];
    const startY = mediaBox[1];
    let rotateOffsetX = 0,
        rotateOffsetY = 0;
    switch (rotate) {
        case 90:
            rotateOffsetX = height - startX;
            rotateOffsetY = startY;
            break;
        case 180:
            rotateOffsetX = width;
            rotateOffsetY = height;
            break;
        case 270:
            rotateOffsetX = startX;
            rotateOffsetY = width - startY;
            break;
        default:
    }
    // return { nx: tx, ny: ty };
    const { nx, ny } = rotateCoord(0, 0, tx, ty, 360 - rotate, rotateOffsetX, rotateOffsetY);
    return {
        nx,
        ny
    };
};

exports._reverseCoordinate = function _reverseCoordinate(x, y, offsetX = 0, offsetY = 0, pageNumber) {
    pageNumber = pageNumber || this.pageNumber;
    const { height } = this.metadata[pageNumber];
    const ox = x - offsetX;
    const oy = height - y - offsetY;
    return {
        ox,
        oy
    };
};

function rotateCoord(cx, cy, x, y, angle, offsetX = 0, offsetY = 0) {
    const radians = (Math.PI / 180) * angle,
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = (cos * (x - cx)) + (sin * (y - cy)) + cx + offsetX,
        ny = (cos * (y - cy)) - (sin * (x - cx)) + cy + offsetY;

    return { nx, ny };
}
