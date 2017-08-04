const hummus = require('hummus');

/**
 * Append pages from the other pdf to the current pdf
 * @name appendPage
 * @function
 * @memberof Recipe
 * @param {string} pdfSrc - The path for the other pdf.
 * @param {number|number[]} pages - The page number or the array of page numbers to be appended.
 */
exports.appendPage = function appendPage(pdfSrc, pages = []) {
    if (!Array.isArray(pages) && !isNaN(pages)) {
        pages = [pages];
    }
    const pdfReader = hummus.createReader(pdfSrc);
    const pageCount = pdfReader.getPagesCount();
    // prevent unmatched pagenumber
    const transformPageNumber = (pageNum) => {
        pageNum = (pageNum > pageCount) ? pageCount : pageNum;
        pageNum = (pageNum < 1) ? 1 : pageNum;
        return (pageNum - 1);
    };
    pages = pages.map((element) => {
        if (Array.isArray(element)) {
            return [
                transformPageNumber(element[0]),
                transformPageNumber(element[1])
            ]
        } else {
            return [
                transformPageNumber(element),
                transformPageNumber(element)
            ];
        }
    });
    if (pages.length > 0) {
        this.writer.appendPDFPagesFromPDF(pdfSrc, {
            type: hummus.eRangeTypeSpecific,
            specificRanges: pages
        });
    } else {
        this.writer.appendPDFPagesFromPDF(pdfSrc);
    }
    return this;
}
