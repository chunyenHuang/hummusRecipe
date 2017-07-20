const path = require('path');
const HummusRecipe = require('../bin');

describe('Modify', () => {
    it('Add Overlay from other PDF', (done) => {
        const src = path.join(__dirname, 'materials/test2.pdf')
        const overlayPDF = path.join(__dirname, 'materials/test3.pdf');
        const output = path.join(__dirname, `output/Add overlay.pdf`);

        const recipe = new HummusRecipe(src, output);
        recipe
            .editPage(1)
            .overlay(overlayPDF)
            .endPage()
            .endPDF(done);
    });
});
