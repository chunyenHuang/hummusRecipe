const path = require('path');
const HummusRecipe = require('../lib');

describe('Text - Centering', () => {

    it('should horizontally center the text correctly with multiple font sizes', (done) => {
        const output = path.join(__dirname, 'output/Center Text.pdf');
        const recipe = new HummusRecipe('new', output);

        recipe
            .createPage('letter-size')
            .line([[180,0],[180,300]],{stroke:"#ff00ff",lineWidth:.5})
            .text('Musty', 30, 230, {
                color: '#000000',
                font: 'Arial',
                size: 12,
                textBox: {
                    width: 300,
                    // minHeight: 100,
                    textAlign: 'center',
                    padding: 0,
                    style: {
                        stroke: '#000000',
                        lineWidth:1,
                        fill:'#ffffff'
                    }
                },

            })

            .text('Dusty', 30, 50, {
                color: '#000000',
                font: 'Arial',
                size: 30,
                textBox: {
                    width: 300,
                    // minHeight: 100,
                    textAlign: 'center',
                    padding: 0,
                    style: {
                        stroke: '#000000',
                        lineWidth:1,
                        fill:'#ffffff'
                    }
                },

            })
            .text('Testy', 30, 120, {
                color: '#000000',
                font: 'Arial',
                size: 70,
                textBox: {
                    width: 300,
                    // height: 56,
                    // minHeight: 100,
                    textAlign: 'center',
                    padding: [0,0,0,0],
                    style: {
                        stroke: '#000000',
                        lineWidth:1,
                        fill:'#ffff00'
                    }
                },

            })
            .text('A\nAAA\nOOO\nVVV\nY', 30, 260, {
                color: '#000000',
                font: 'Arial',
                size: 30,
                textBox: {
                    width: 300,
                    // minHeight: 100,
                    textAlign: 'center',
                    padding: 0,
                    style: {
                        stroke: '#000000',
                        lineWidth:1,
                        fill:'#ffffff'
                    }
                },
            })
            .line([[180,0],[180,700]],{stroke:"#ff00ff",lineWidth:.5})
            .endPage();


        recipe.endPDF(done);
    });

});
