const muhammara = require('muhammara');
const path = require('path');
const hummusUtils = require('./utils');

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
    for (let i = 0; i < this.metadata.pageCount; i++) {
        const newPdf = path.join(outputDir, `${prefix}-${i+1}.pdf`);
        const pdfWriter = muhammara.createWriter(newPdf);
        hummusUtils.appendPDFPageFromPDFWithAnnotations(pdfWriter, this.pdfReader, i);
        pdfWriter.end();
    }
    return this;
};
