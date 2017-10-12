const path = require('path');
const HummusRecipe = require('../lib');

describe('Annotation', () => {
    it('Add annotations', (done) => {
        const output = path.join(__dirname, 'output/Add annotations.pdf');
        const recipe = new HummusRecipe('new', output);
        recipe
            // 1st Page
            .createPage('letter-size')
            .comment('Feel free to open issues to help us!', 'center', 100 , {
                flag:'locked'
            })
            .endPage()
            .endPDF(done);
    });
});
