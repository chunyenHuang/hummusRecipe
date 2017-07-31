const path = require('path');
const HummusRecipe = require('../lib');

describe('Insert Pages', () => {
    const taskIPFOP = 'Insert page from other pdf';
    it(taskIPFOP, (done) => {
        const src = path.join(__dirname, 'materials/test.pdf');
        const longPDF = path.join(__dirname, 'materials/compressed.tracemonkey-pldi-09.pdf');
        const output = path.join(__dirname, `output/${taskIPFOP}.pdf`);
        const recipe = new HummusRecipe(src, output);
        recipe
            .insertPage(2, longPDF, 3)
            .insertPage(1, longPDF, 10)
            .insertPage(1, longPDF, 4)
            .insertPage(1, longPDF, 2)
            .endPDF(done);
    });
});
