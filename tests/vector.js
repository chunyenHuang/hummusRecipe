const path = require('path');
const HummusRecipe = require('../lib');

describe('Vector', () => {
    it('Add vectors', (done) => {
        const src = path.join(__dirname, 'materials/test.pdf')
        const output = path.join(__dirname, `output/Add vectors.pdf`);
        const recipe = new HummusRecipe(src, output);
        recipe
            .editPage(1)
            .circle('center', 100, 60, { stroke: '#3b7721', fill: '#0e0e0e', opacity: 0.4 })
            .circle('center', 100, 30, { stroke: '#0032FF', dash: [5, 5] })
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
                opacity: 0.75,
                dash: [12, 12]
            })
            .polygon([
                [300, 300],
                [450, 600],
                [150, 600]
            ], {
                fill: '#0000ff',
                stroke: '#0000ff',
                opacity: 0.75
            })
            .rectangle(150, 600, 300, 300, {
                color: '#3252d3',
                stroke: '#084323',
                lineWidth: 10,
                dash: [5, 5]
            })
            .line([
                [0, 500],
                [20, 400],
                [1234, 13],
                [125, 800],
                [28, 10]
            ], {
                stroke: '#ff0000',
                dash: [3, 3]
            })
            .endPage()
            .endPDF(done);
    });
});
