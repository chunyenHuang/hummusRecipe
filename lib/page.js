const hummus = require('hummus');

/**
 * Create a new page
 * @name createPage
 * @function
 * @memberof Recipe
 * @param {number} pageWidth - The page width.
 * @param {number} pageHeight - The page height.
 */
exports.createPage = function createPage(pageWidth, pageHeight) {
    if (!pageWidth && !pageHeight) {
        pageWidth = pageWidth || this.default.pageWidth;
        pageHeight = pageHeight || this.default.pageHeight;
    } else
    if (pageWidth && !isNaN(pageWidth) && pageHeight && !isNaN(pageHeight)) {
        pageWidth = pageWidth || this.default.pageWidth;
        pageHeight = pageHeight || this.default.pageHeight;
    } else
    if (pageWidth && typeof (pageWidth) == 'string') {
        // const type = pageWidth;
        const rotate = pageHeight;
        let pageType = this.default.paperSizeTypes[pageWidth];

        if (pageType) {
            pageWidth = pageType.pageWidth;
            pageHeight = pageType.pageHeight;
        } else {
            // use default
            pageWidth = this.default.pageWidth;
            pageHeight = this.default.pageHeight;
        }
        if (rotate && !isNaN(rotate)) {
            if (rotate % 180 != 0) {
                let temp = pageHeight;
                pageHeight = pageWidth;
                pageWidth = temp;
            }
        }
    }
    // from 0
    this.metadata.pageCount += 1;
    const pageNumber = this.metadata.pageCount;
    const dimensions = [0, 0, pageWidth, pageHeight];
    const layout = (pageWidth > pageHeight) ? 'landscape' : 'portrait';
    this.metadata[pageNumber] = {
        pageNumber,
        mediaBox: dimensions,
        layout,
        rotate: 0,
        width: pageWidth,
        height: pageHeight
    };

    const page = this.writer.createPage();
    page.mediaBox = [0, 0, pageWidth, pageHeight];

    this.page = page;
    this.pageNumber = pageNumber;
    this.pageContext = this.writer.startPageContentContext(this.page);

    this.moveTo(0, 0);
    return this;
};

/**
 * Finish a page
 * @name endPage
 * @function
 * @memberof Recipe
 */
exports.endPage = function endPage() {
    if (!this.page) {
        return this;
    }

    if (this.page.endContext) {
        this.page.endContext();
        this.page.writePage();
    } else {
        this.writer.writePage(this.page);
    }
    // this.page = null;
    // this.pageContext = null;
    // this.pageNumber = 0;

    return this;
};

/**
 * Start editing a page
 * @name editPage
 * @function
 * @memberof Recipe
 * @param {number} pageNumber - The page number to be edited.
 */
exports.editPage = function editPage(pageNumber) {
    const pdfWriter = this.writer;
    const pageIndex = pageNumber - 1;
    const pageModifier = new hummus.PDFPageModifier(pdfWriter, pageIndex, true);
    this.page = pageModifier;
    this.pageNumber = pageNumber;
    this.pageContext = pageModifier.startContext().getContext();

    this._resumePageRotation(pageNumber);

    if (this.debug) {
        const context = this.pageContext;
        const {
            width,
            height,
            mediaBox
        } = this.metadata[pageNumber];
        const startX = mediaBox[0];
        const startY = mediaBox[1];
        const textOptions = {
            font: this.writer.getFontForFile(this.fonts['helvetica-bold']),
            size: 50,
            colorspace: 'gray',
            color: 0x00
        };
        context.writeText(`[${startX}, ${startY}] is HERE`, startX, startY, textOptions);
        context.writeText(`[${startX}, width/2] is HERE`, startX, width / 2, textOptions);
        context.writeText(`[${startX}, height/2] is HERE`, startX, height / 2, textOptions);
        context.writeText(`[width/2, ${startY}] is HERE`, width / 2, startY, textOptions);
        context.writeText(`[height/2, ${startY}] is HERE`, height / 2, startY, textOptions);
    }
    return this;
};

exports._resumePageRotation = function _resumePageRotation(pageNumber, context) {
    pageNumber = pageNumber || this.pageNumber;
    const {
        // layout,
        rotate,
        width,
        height,
        mediaBox
    } = this.metadata[pageNumber];
    context = context || this.pageContext;
    const startX = mediaBox[0];
    const startY = mediaBox[1];

    switch (rotate) {
        case 90:
            context.cm(0, 1, -1, 0, height - startX, startY);
            break;
        case 180:
            context.cm(-1, 0, 0, -1, width, height);
            break;
        case 270:
            context.cm(0, -1, 1, 0, startX, width - startY);
            break;

        default:
    }
    return this;
};

/**
 * Get page information
 * @name pageInfo
 * @function
 * @memberof Recipe
 * @param {number} pageNumber - The page number.
 */
exports.pageInfo = function pageInfo(pageNumber) {
    const pageInfo = this.metadata[pageNumber];
    return {
        width: pageInfo.width,
        height: pageInfo.height,
        rotate: pageInfo.rotate,
        pageNumber
    };
};

exports.pauseContext = function pauseContext() {
    if (this.page && this.page.endContext) {
        this.page.endContext();
        // this.writer.pausePageContentContext(this.pageContext);
    } else
    if (this.pageContext) {
        this.writer.pausePageContentContext(this.pageContext);
    }
};

exports.resumeContext = function resumeContext() {
    if (!this.isNewPDF && this.page) {
        this.pageContext = this.page.startContext().getContext();
        this._resumePageRotation();
    }
};

exports.getPageInfo = function getPageInfo() {
    const info = this.writer.getDocumentContext().getInfoDictionary();
    return info;
};
