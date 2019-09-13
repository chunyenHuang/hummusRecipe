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
            .text('http://www.fontpalace.com/font-details/PMingLiU/', 20, 60)
            .text('世界你好 繁體字', 'center', 80, {
                font: 'PMingLiU',
                textBox: {style: {fill: '%0,28,100,6'}}
            })
            .text('世界你好 简体字', 'center', 100, {
                font: 'PMingLiU',
                textBox: {style: {fill: '%0,28,100,0'}}
            })
            .text('http://fonts.gstatic.com/ea/cwtexkai/v3/download.zip', 20, 200)
            .text('世界你好楷體', 'center', 220, {
                font: 'cwTeXKai-zhonly',
                textBox: {style: {fill: '%0,40,100,0'}}
            })
            .text('Gold boxes will be empty when fonts unavailable.', 50, 350, {color: 'red'})
            .endPage()
            .endPDF(done);
    });
});
