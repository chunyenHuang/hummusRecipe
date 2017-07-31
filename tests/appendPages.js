const path = require('path');
const HummusRecipe = require('../lib');

describe('Append Pages', () => {
    const taskAP = 'Append pages from other pdf';
    it(taskAP, (done) => {
        const src = path.join(__dirname, 'materials/test.pdf');
        const longPDF = path.join(__dirname, 'materials/compressed.tracemonkey-pldi-09.pdf');
        const output = path.join(__dirname, `output/${taskAP}.pdf`);
        const recipe = new HummusRecipe(src, output);
        recipe
            .appendPage(longPDF, 10)
            .appendPage(longPDF, [4, 6])
            .appendPage(longPDF, [[1, 3], [6, 20]])
            .appendPage(longPDF)
            .endPDF(done);
    });
});
