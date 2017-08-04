exports._calibrateCoorinate = function _calibrateCoorinate(x, y, offsetX = 0, offsetY = 0, pageNumber) {
    pageNumber = pageNumber || this.pageNumber;
    const { width, height } = this.metadata[pageNumber];

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
