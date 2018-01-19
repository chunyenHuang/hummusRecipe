const path = require('path');
const HummusRecipe = require('../lib');

describe('Annotation: Square', () => {
    it('Add a simple square.', (done) => {
        const output = path.join(__dirname, 'output/annotation-square.pdf');
        const recipe = new HummusRecipe('new', output);
        recipe
            .createPage('letter-size')
            .annot('center', 'center', 'Square', {
                text: 'yo, I am a square',
                width: 200,
                height: 100,
                border: 10,
                color: [128, 31, 80]
            })
            .endPage()
            .endPDF(done);
    });
});
