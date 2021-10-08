const muhammara = require('muhammara');
const tmp = require('tmp');
const fs = require('fs');
const streams = require('memory-streams');
const hummusUtils = require('./utils');

/**
 * Slice the pdf
 * @name slice
 * @function
 * @memberof Recipe
 * @param {string} start - Start page index
 * @param {string} end - End page index
 */
exports.slice = function slice(start = 0, end) {
    const tmpobj = tmp.fileSync();

    const pdfWriter = muhammara.createWriter(tmpobj.name);
    for (let i = start; i < (end || this.metadata.pages); i++) {
        hummusUtils.appendPDFPageFromPDFWithAnnotations(pdfWriter, this.pdfReader, i);
    }
    pdfWriter.end();

    const buffer = fs.readFileSync(tmpobj.name);

    if (this.isBufferSrc) {
        this.src = buffer;
        this.outStream = new streams.WritableStream();
        this.writer = muhammara.createWriterToModify(
            new muhammara.PDFRStreamForBuffer(this.src),
            new muhammara.PDFStreamForResponse(this.outStream),
            Object.assign( {}, this.encryptOptions, {
                log: this.logFile
            })
        );
    } else if (fs.existsSync(this.src)) {
        fs.writeFileSync(this.src, buffer)
    }

    return this;
};
