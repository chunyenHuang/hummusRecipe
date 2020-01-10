const hummus = require('hummus');
const hummusUtils = require('./utils');

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
    // Using stream so it can be closed to release reader resource (Issue #61)
    const instream  = new hummus.PDFRStreamForFile(pdfSrc);
    const pdfReader = hummus.createReader(instream);
    const pageCount = pdfReader.getPagesCount();
    instream.close();

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
            ];
        } else {
            return [
                transformPageNumber(element),
                transformPageNumber(element)
            ];
        }
    });
    if (pages.length > 0) {
        hummusUtils.appendPDFPagesFromPDFWithAnnotations(this.writer, pdfSrc, {
            specificRanges: pages
        });
    } else {
        hummusUtils.appendPDFPagesFromPDFWithAnnotations(this.writer, pdfSrc);
    }
    return this;
};
