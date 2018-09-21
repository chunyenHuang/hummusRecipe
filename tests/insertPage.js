const path = require('path');
const HummusRecipe = require('../lib');

describe('Insert Pages', () => {
    // https://github.com/galkahana/HummusJS/blob/d4aec0ea9200f702ccea9fcada5a3e955feef65e/src/PDFWriterDriver.cpp#L861
    // https://github.com/galkahana/HummusJS/blob/5d6537c8ab5f1e607efccba49016e56a15e9399b/src/deps/PDFWriter/PDFDocumentHandler.cpp#L664
    it('Insert page from other pdf', (done) => {
        const src = path.join(__dirname, 'materials/test.pdf');
        const longPDF = path.join(__dirname, 'materials/compressed.tracemonkey-pldi-09.pdf');
        const output = path.join(__dirname, 'output/Insert page from other pdf.pdf');
        const recipe = new HummusRecipe(src, output);
        recipe
            .insertPage(0, longPDF, 3)
            .insertPage(2, longPDF, 3)
            .insertPage(1, longPDF, 10)
            .insertPage(1, longPDF, 4)
            .insertPage(1, longPDF, 2)
            .insertPage(1, longPDF, 2)
            .endPDF(done);
    });

    it('Insert page from other pdf (revert)', (done) => {
        const primary = path.join(__dirname, 'materials/compressed.tracemonkey-pldi-09.pdf');
        const insertSrc = path.join(__dirname, 'materials/test.pdf');
        const output = path.join(__dirname, 'output/Insert page from other pdf (revert).pdf');
        const recipe = new HummusRecipe(primary, output);
        for (let page = 1; page <= 14; page++) {
            recipe.insertPage(page, insertSrc, 2);
        }
        recipe.insertPage(14, insertSrc, 1);
        recipe.insertPage(2, insertSrc, 2);
        recipe.endPDF(done);
    });
});
