const hummus = require('hummus');
const fs = require('fs');
const path = require('path');

/**
 * Split the pdf
 * @name split
 * @function
 * @memberof Recipe
 * @param {string} outputDir - The path for the output pdfs.
 * @param {string} prefix - `${prefix}-${i+1}.pdf`.
 */
exports.split = function split(outputDir = '', prefix) {
    prefix = prefix || this.filename;
    for (let i = 0; i < this.metadata.pages; i++) {
        const newPdf = path.join(outputDir, `${prefix}-${i+1}.pdf`);
        const pdfWriter = hummus.createWriter(newPdf);
        pdfWriter.createPDFCopyingContext(this.pdfReader).appendPDFPageFromPDF(i);
        pdfWriter.end();
    }
    return this;
}
