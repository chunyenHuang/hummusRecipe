const path = require('path');
const HummusRecipe = require('../lib');

describe('Modify', () => {
    it('Change info pdf', (done) => {
        const src = path.join(__dirname, 'materials/blank.pdf')
        const output = path.join(__dirname, `output/change info.pdf`);
        const recipe = new HummusRecipe(src, output);
        recipe
            .info({
                author: 'yo man' + (new Date()).toString(),
                title: 'Hello World'
            })
            .custom('some', 'thing?')
            .editPage(1)
            .comment('Feel free to open issues to help us!', 'center', 100, {
                flag: 'locked'
            })
            .endPage()
            .endPDF(done);
    });
    it('Change info pdf', (done) => {
        const src = path.join(__dirname, 'materials/test-info.pdf')
        const output = path.join(__dirname, `output/change info with IndirectObjectReference.pdf`);
        const recipe = new HummusRecipe(src, output);
        recipe
            .info({
                author: 'Me'
            })
            .editPage(1)
            .rectangle(100, 100, 200, 200)
            .endPage()
            .endPDF(done);
    });
});
