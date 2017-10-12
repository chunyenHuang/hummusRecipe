const path = require('path');
const HummusRecipe = require('../lib');

describe('Vector', () => {
    it('Add vectors', (done) => {
        const src = path.join(__dirname, 'materials/test.pdf')
        const output = path.join(__dirname, `output/Add vectors.pdf`);
        const recipe = new HummusRecipe(src, output);
        recipe
            .editPage(1)
            .text('Add vectors', 'center', 100)
            .circle('center', 100, 60, { stroke: '#3b7721', fill: '#0e0e0e', opacity: 0.4 })
            .circle('center', 100, 30, { stroke: '#0032FF' })
            .rectangle(50, 50, 50, 50, {
                color: [255, 0, 255],
                opacity: 0.2
            })
            .rectangle(150, 50, 50, 50, {
                color: [255, 0, 255],
                opacity: 0.4
            })
            .rectangle(250, 50, 50, 50, {
                color: [255, 0, 255],
                opacity: 0.6
            })
            .polygon([
                [0, 300],
                [300, 300],
                [300, 0]
            ], {
                fill: '#00ff00',
                stroke: '#00ff00',
                opacity: 0.2
            })
            .polygon([
                [100, 100],
                [300, 300],
                [300, 100]
            ], {
                fill: '#ff0000',
                stroke: '#ff0000',
                opacity: 0.5
            })
            .polygon([
                [60, 60],
                [60, 300],
                [300, 100]
            ], {
                fill: '#0000ff',
                stroke: '#0000ff',                
                opacity: 0.75
            })
            .comment('Add 1st comment annotaion', 200, 300)
            .endPage()
        recipe
            .editPage(2)
            .comment('Add 2nd comment annotaion', 200, 100)
            .endPage()
            .endPDF(done);
    });
});
