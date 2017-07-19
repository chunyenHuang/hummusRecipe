const path = require('path');
const HummusRecipe = require('../bin');

describe('Recipe', () => {
    it('Add images', (done) => {
        const src = path.join(__dirname, 'materials/test.pdf')
        const output = path.join(__dirname, `output/Add images.pdf`);
        const myCats = path.join(__dirname, 'materials/myCats.jpg');

        const recipe = new HummusRecipe(src, output);
        recipe
            .editPage(1)
            .image(myCats, 'center', 'center', {
                width: 300,
                height: 300,
                keepAspectRatio: false,
                align: 'center center'
            })
            .image(myCats, 'center', 100, {
                scale: 0.1,
                align: 'center center'
            })
            .endPage()
            .endPDF(done);
    });
});
