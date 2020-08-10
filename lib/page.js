const muhammara = require('muhammara');

/**
 * Create a new page, specifying either actual width and height, or the name
 * of a supported page size (eg. 'letter', )
 * @name createPage
 * @function
 * @memberof Recipe
 * @param {number|string} [pageWidth_or_pageSizeName='letter'] - The page width, or name of medium size.
 * Known named medium sizes: executive, folio, legal, letter, ledger, tabloid, a0-a10, b0-b10, c0-c10, ra0-ra4, sra0-ara4
 * @param {number} [pageHeight_or_rotation] - The page height, or rotation (90) when when page size name given.
 * @param {object} [margins] - page margin definitions.
 * @param {number} [margins.left] - Left margin.
 * @param {number} [margins.right] - Right margin.
 * @param {number} [margins.top] - Top margin.
 * @param {number} [margins.bottom] - Bottom margin.
 */
exports.createPage = function createPage(pageWidth, pageHeight, margins) {

    if (!pageWidth && !pageHeight) {
        [pageWidth, pageHeight] = this.default.pageSize;

    } else if (pageWidth && !isNaN(pageWidth) && pageHeight && !isNaN(pageHeight)) {
        pageWidth  = pageWidth  || this.default.pageSize[0];
        pageHeight = pageHeight || this.default.pageSize[1];

    } else if (typeof pageWidth === 'string') {
        const rotate   = pageHeight;
        const pageType = pageWidth.toLowerCase().replace('-size','');
        const pageSize = this.default.mediumSizes[pageType];

        if (pageSize) {
            [pageWidth, pageHeight] = pageSize;
        } else {
            [pageWidth, pageHeight] = this.default.pageSize;
        }

        if (rotate && !isNaN(rotate)) {
            if (rotate % 180 != 0) {
                // swap width and height
                [pageWidth, pageHeight] = [pageHeight, pageWidth];
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
    this.editingPage = false;

    if (margins) {
        this.margins(margins);
    }

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
    const pageModifier = new muhammara.PDFPageModifier(pdfWriter, pageIndex, true);
    this.page = pageModifier;
    this.pageNumber = pageNumber;
    this.pageContext = pageModifier.startContext().getContext();
    this.editingPage = true;

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
    this.page.mediaBox = [startX, startY, width, height];

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

/**
 * Set/Get current page margins.
 * @name margins
 * @function
 * @memberof Recipe
 * @param {number|object} [left] - Left margin width or an object holding margin properties to be set.
 * Valid margin property names are: left, right, top, bottom.
 * @param {number} [right] - Right margin width.
 * @param {number} [top] - Top margin height.
 * @param {number} [bottom] - Bottom margin height.
 * @returns {object} When parameters are given, the value returned is the recipe handle. When no
 * parameters given, the return value is the current page margin object.
 */
exports.margins = function margins(left, right, top, bottom)
{
    let marginSet = false;

    if (typeof left === 'object') {
        const margins = left;
        left   = margins.left;
        right  = margins.right;
        top    = margins.top;
        bottom = margins.bottom;
    }

    if (left !== undefined) {
        this._margin.left = left;
        marginSet = true;
    }

    if (right !== undefined) {
        this._margin.right = right;
        marginSet = true;
    }

    if (top !== undefined) {
        this._margin.top = top;
        marginSet = true;
    }

    if (bottom !== undefined) {
        this._margin.bottom = bottom;
        marginSet = true;
    }

    // When no parameters given, send back current margins.
    if (!marginSet) {
        return this._margin;
    }

    return this;
};
