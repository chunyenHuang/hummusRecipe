const path = require('path');
const HummusRecipe = require('../lib');

describe('Split', () => {
    it('Split PDF', (done) => {
        const src = path.join(__dirname, 'materials/compressed.tracemonkey-pldi-09.pdf');
        const outputDir = path.join(__dirname, 'output');
        const recipe = new HummusRecipe(src);
        return recipe
            .split(outputDir)
            .endPDF(done);
    });
});
