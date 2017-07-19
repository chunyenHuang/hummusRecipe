const path = require('path');
const HummusRecipe = require('../bin');

describe('Recipe', () => {
    it('Add something to an existing pdf', (done) => {
        const src = path.join(__dirname, 'materials/test.pdf')
        const output = path.join(__dirname, `output/Add something to an existing.pdf`);
        const recipe = new HummusRecipe(src, output);
        recipe
            .editPage(1)
            .text('Add some texts to an existing pdf file', 150, 300)
            .rectangle(20, 20, 40, 100)
            .rectangle(25, 25, 40, 100)
            .rectangle(30, 30, 40, 100)
            .comment('Add 1st comment annotaion', 200, 300)
            .endPage()
        recipe
            .editPage(2)
            .comment('Add 2nd comment annotaion', 200, 100)
            .endPage()
            .endPDF(done);
    });
});
