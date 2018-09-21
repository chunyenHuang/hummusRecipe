const path = require('path');
const HummusRecipe = require('../lib');

describe('Modify', () => {
    it('Add something to an existing pdf', (done) => {
        const src = path.join(__dirname, 'materials/test.pdf');
        const output = path.join(__dirname, 'output/Add something to an existing.pdf');
        const recipe = new HummusRecipe(src, output);
        recipe
            .info({
                author: 'wahaha'
            })
            .editPage(1)
            .text('Add some texts to an existing pdf file', 150, 300)
            .circle('center', 100, 60, {
                stroke: '#3b7721',
                fill: '#0e0e0e',
                opacity: 0.4
            })
            .circle('center', 100, 30, {
                stroke: '#0032FF'
            })
            .rectangle('center', 'center', 450, 450, {
                color: [255, 0, 255],
                opacity: 0.2
            })
            .comment('Add 1st comment annotaion', 200, 300)
            .endPage();
        recipe
            .editPage(2)
            .comment('Add 2nd comment annotaion', 200, 100)
            .endPage()
            .endPDF(done);
    });

    it('Add something to an existing pdf', (done) => {
        const src = path.join(__dirname, 'materials/test2.pdf');
        const output = path.join(__dirname, 'output/Add something to an existing (with annots).pdf');
        const recipe = new HummusRecipe(src, output);
        recipe
            .info({
                author: 'wahaha'
            })
            .editPage(1)
            .text('Add some texts to an existing pdf file', 150, 300)
            .circle('center', 100, 60, {
                stroke: '#3b7721',
                fill: '#0e0e0e',
                opacity: 0.4
            })
            .circle('center', 100, 30, {
                stroke: '#0032FF'
            })
            .rectangle('center', 'center', 450, 450, {
                color: [255, 0, 255],
                opacity: 0.2
            })
            .comment('Add 1st comment annotaion', 200, 300)
            .endPage();
        recipe
            .editPage(2)
            .comment('Add 2nd comment annotaion', 200, 100)
            .endPage()
            .endPDF(done);
    });
});
