const path = require('path');
const HummusRecipe = require('../lib');

describe('Text - Centering', () => {

    it('should horizontally center the text correctly with multiple font sizes', (done) => {
        const src = path.join(__dirname, 'materials/blank.pdf');
        const output = path.join(__dirname, 'output/Center Text.pdf');
        const recipe = new HummusRecipe(src, output);

        recipe
            .editPage(1)
            .text('Test', 30, 240, {
                color: '#000000',
                font: 'Arial',
                size: 12,
                textBox: {
                    width: 300,
                    minHeight: 100,
                    textAlign: 'center',
                    padding: [0, 0, 0, 0],
                    style: {
                        stroke: '#000000'
                    }
                },

            })
            .text('Test', 30, 20, {
                color: '#000000',
                font: 'Arial',
                size: 30,
                textBox: {
                    width: 300,
                    minHeight: 100,
                    textAlign: 'center',
                    padding: [0, 0, 0, 0],
                    style: {
                        stroke: '#000000'
                    }
                },

            })
            .text('Test', 30, 130, {
                color: '#000000',
                font: 'Arial',
                size: 56,
                textBox: {
                    width: 300,
                    minHeight: 100,
                    textAlign: 'center',
                    padding: [0, 0, 0, 0],
                    style: {
                        stroke: '#000000'
                    }
                },

            })
            .endPage();


        recipe.endPDF(done);
    });

});
