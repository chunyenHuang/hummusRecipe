const fs = require('fs');
const path = require('path');
const HummusRecipe = require('../lib');
const htmlCodes = fs.readFileSync(path.join(__dirname, './materials/text.html'), 'utf8');

describe('Font', () => {
    it('Add text with custom fonts', (done) => {
        const output = path.join(__dirname, `output/Add text with custom fonts.pdf`);
        const recipe = new HummusRecipe('new', output, {
            fontSrcPath: path.join(__dirname, 'materials/fonts')
        });
        recipe
            .createPage('letter-size')
            .text('Hello World', 'center', 80, {
                font: 'chinese1'                
            })
            .text('Hello World', 'center', 100, {
                font: 'handwritten1'                
            })
            .text('世界你好', 'center', 150, {
                font: 'chinese1'
            })
            .text('asdfghjkl;', 'center', 200, {
                font: 'chinese1'
            })
            .endPage()
            .endPDF(done);
    });
});
