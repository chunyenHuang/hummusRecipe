const path = require('path');
const fs = require('fs');
const HummusRecipe = require('../lib');

describe('Slice', () => {
    it('Slice PDF', (done) => {
        const src = path.join(__dirname, 'materials/compressed.tracemonkey-pldi-09.pdf');
        const output = path.join(__dirname, `output/${path.basename(src)}.1.pdf`);

        const bufferSrc = fs.readFileSync(src);

        const recipe = new HummusRecipe(bufferSrc);
        return recipe
            .slice(0, 1)
            .endPDF((buffer) => {
              fs.writeFileSync(output, buffer);
              done();
            });
    });
});
