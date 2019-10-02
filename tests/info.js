const path = require('path');
const HummusRecipe = require('../lib');
const assert = require('chai').assert;

describe('Modify', () => {
    it('Change info pdf', (done) => {
        const src = path.join(__dirname, 'materials/blank.pdf');
        const output = path.join(__dirname, 'output/change info.pdf');
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
    it('Read document title', (done) => {
        const src = path.join(__dirname, 'output/change info.pdf');
        const recipe = new HummusRecipe(src);
        const info = recipe.info();
        assert.equal(info.title, 'Hello World');   // This test depends on output from above.
        recipe.endPDF(done);
    });
    it('Change info pdf', (done) => {
        const src = path.join(__dirname, 'materials/test-info.pdf');
        const output = path.join(__dirname, 'output/change info with IndirectObjectReference.pdf');
        const recipe = new HummusRecipe(src, output);
        recipe
            .info({
                author: 'Me'
            })
            .endPDF(done);
    });
    it('print pdf structure', (done) => {
        const file = 'test3';
        const src = path.join(__dirname, `materials/${file}.pdf`);
        const output = path.join(__dirname, `output/${file}.pdf`);
        const recipe = new HummusRecipe(src, output);
        recipe
            .structure(path.join(__dirname, `output/${file}.txt`))
            .endPDF(done);
    });
});
