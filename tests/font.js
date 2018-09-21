const fs = require('fs-extra');
const path = require('path');
const HummusRecipe = require('../lib');

describe('Font', () => {
    before(() => {
        fs.ensureDirSync(path.join(__dirname, 'materials/fonts'));
    });
    it('Add text with custom fonts', (done) => {
        const output = path.join(__dirname, 'output/Add text with custom fonts.pdf');
        const recipe = new HummusRecipe('new', output, {
            fontSrcPath: path.join(__dirname, 'materials/fonts')
        });
        recipe
            .createPage('letter-size')
            // http://www.fontpalace.com/font-details/PMingLiU/
            .text('世界你好 繁體字', 'center', 80, {
                font: 'PMingLiU'
            })
            .text('世界你好 简体字', 'center', 100, {
                font: 'PMingLiU'
            })
            // http://fonts.gstatic.com/ea/cwtexkai/v3/download.zip
            .text('世界你好楷體', 'center', 225, {
                font: 'cwTeXKai-zhonly'
            })
            .endPage()
            .endPDF(done);
    });
});
