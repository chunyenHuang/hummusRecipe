const hummus = require('hummus');

exports.createPage = function createPage(pageWidth, pageHeight) {
    this.pages = this.pages || [];
    pageWidth = pageWidth || this.default.pageWidth;
    pageHeight = pageHeight || this.default.pageHeght;
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

    const page = this.writer.createPage(0, 0, pageWidth, pageHeight);
    this.page = page;
    this.pageNumber = pageNumber;
    this.pageContext = this.writer.startPageContentContext(this.page);
    this.moveTo(0, 0);
    return this;
};

exports.endPage = function endPage(pageNumber) {
    if (!this.page) return this;
    
    if (this.page.endContext) {
        this.page.endContext();
        this.page.writePage();
    } else {
        this.writer.writePage(this.page);
    }
    this.page = null;
    this.pageContext = null;
    // this.pageNumber = 0;

    return this;
}

exports.editPage = function editPage(pageNumber) {
    const pdfWriter = this.writer;
    const pageIndex = pageNumber - 1;
    const pageModifier = new hummus.PDFPageModifier(pdfWriter, pageIndex, true);
    this.page = pageModifier;
    this.pageNumber = pageNumber;
    this.pageContext = pageModifier.startContext().getContext();
    const { layout, rotate, width, height, offsetX, offsetY } = this.metadata[pageNumber];

    switch (rotate) {
        case 90:
            context.cm(0, 1, -1, 0, height, 0);
            break;
        case 270:
            context.cm(0, -1, 1, 0, 0, width);
            break;
        case 180:
            context.cm(-1, 0, 0, -1, width, height);
            break;
        default:
    }
    return this;
}
