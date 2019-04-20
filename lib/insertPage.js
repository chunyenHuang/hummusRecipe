const hummus = require('hummus');
const fs = require('fs');
const hummusUtils = require('./utils');
/**
 * Insert a page from the other pdf
 * @name insertPage
 * @function
 * @memberof Recipe
 * @param {number} afterPageNumber - The page number for insertion.
 * @param {string} pdfSrc - The path for the other pdf
 * @param {number} srcPageNumber - The page number to be insterted from the other pdf.
 */
exports.insertPage = function insertPage(afterPageNumber, pdfSrc, srcPageNumber) {
    if (isNaN(afterPageNumber)) {
        throw new Error('The afterPageNumber is inValid.');
    }
    this.needToInsertPages = true;
    if (pdfSrc && srcPageNumber) {
        this.insertInformation = this.insertInformation || {};
        this.insertInformation[afterPageNumber] = this.insertInformation[afterPageNumber] || [];
        this.insertInformation[afterPageNumber].push({
            afterPageNumber,
            pdfSrc,
            srcPageNumber
        });
    }
    return this;
};

exports._insertPages = function _insertPages() {
    if (!this.insertInformation) {
        throw new Error('No insertInformation');
    }
    const pagesForInsert = [0, ...Object.keys(this.metadata)
        .filter(item => !isNaN(item))
        .map(item => parseInt(item))
    ];
    const unlinkList = [];
    const tmp = this.output + '.tmp.pdf';
    unlinkList.push(tmp);
    fs.renameSync(this.output, tmp);

    const pdfWriter = hummus.createWriter(this.output);
    let lastInsertedOriginal = 0;
    pagesForInsert.forEach((pageNumber) => {
        const toAppendPage = pageNumber - 1;
        if (toAppendPage >= 0) {
            const specificRanges = [
                [lastInsertedOriginal, toAppendPage]
            ];
            hummusUtils.appendPDFPagesFromPDFWithAnnotations(pdfWriter, tmp, {
                specificRanges
            });
        }
        lastInsertedOriginal = pageNumber;

        const toInserts = this.insertInformation[pageNumber];
        if (toInserts) {
            toInserts.forEach((info) => {
                const specificRanges = [
                    [info.srcPageNumber - 1, info.srcPageNumber - 1]
                ];
                hummusUtils.appendPDFPagesFromPDFWithAnnotations(pdfWriter, info.pdfSrc, { specificRanges });
            });
        }
    });
    pdfWriter.end();

    unlinkList.forEach((item) => {
        setTimeout(() => {
            if (fs.existsSync(item)) {
                fs.unlinkSync(item);
            }
        });
    });
    return this;
};
