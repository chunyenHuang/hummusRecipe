const path = require('path');
const HummusRecipe = require('../lib');

describe('Modify', () => {
    it('Add many images', (done) => {
        const src = path.join(__dirname, 'materials/test.pdf');
        const output = path.join(__dirname, 'output/Add many images.pdf');
        const myCats = path.join(__dirname, 'materials/myCats.jpg');

        const recipe = new HummusRecipe(src, output);
        recipe.editPage(1);
        const repeats = 300;
        for (let i = 0; i < repeats; i++) {
            recipe
                .image(myCats, 'center', 'center', {
                    width: 300 * Math.random() * 10,
                    opacity: 0.5,
                    align: 'center center'
                    // align: 'center center'
                });
        }
        recipe.endPage().endPDF(done);
    });
});
