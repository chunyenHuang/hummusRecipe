const hummus = require('hummus');
const fs = require('fs');
const path = require('path');

/**
 * Split the pdf
 * @name encrypt
 * @function
 * @memberof Recipe
 * @param {Object} options - The options
 * @param {string} [options.password] - The password for viewing.
 * @param {string} [options.ownerPassword] - The password for editing.
 * @param {number} [options.userProtectionFlag] - The flag for the security level.
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
