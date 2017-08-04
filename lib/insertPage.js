const hummus = require('hummus');
const fs = require('fs');
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
    if (!afterPageNumber || isNaN(afterPageNumber)) return;
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
}

exports._insertPages = function _insertPages() {
    if (!this.insertInformation) {
        return;
    }
    let pagesForInsert = Object.keys(this.insertInformation).sort((a, b) => {
        return (a > b) ? 1 : -1;
    }).map((num) => parseInt(num));
    const unlinkList = [];
    const tmp = this.output + '.tmp.pdf';
    unlinkList.push(tmp);
    fs.renameSync(this.output, tmp);

    const pdfWriter = hummus.createWriter(this.output);
    let totalPages = 0;
    let lastInsertedOriginal = 0;
    pagesForInsert.forEach((pageNumber) => {
        const specificRanges = [
            [lastInsertedOriginal, pageNumber - 1]
        ];
        pdfWriter.appendPDFPagesFromPDF(tmp, {
            type: hummus.eRangeTypeSpecific,
            specificRanges
        });
        lastInsertedOriginal = pageNumber;
        totalPages++;

        const toInserts = this.insertInformation[pageNumber];
        toInserts.forEach((info) => {
            const specificRanges = [
                [info.srcPageNumber - 1, info.srcPageNumber - 1]
            ];
            pdfWriter.appendPDFPagesFromPDF(info.pdfSrc, {
                type: hummus.eRangeTypeSpecific,
                specificRanges
            });
            totalPages++;
        });
    });
    pdfWriter.end();

    unlinkList.forEach((item) => {
        if (fs.existsSync(item)) {
            fs.unlinkSync(item);
        }
    });
    return this;
}
