const path = require('path');
const HummusRecipe = require('../bin');

describe('Create', () => {
    it('blank pdf', (done) => {
        const output = path.join(__dirname, 'output/blank.pdf');
        const recipe = new HummusRecipe('new', output);
        recipe
            .createPage()
            .endPage()
            .createPage()
            .endPage()
            .endPDF(done);
    });
    it('new pdf', (done) => {
        const output = path.join(__dirname, 'output/new.pdf');
        const recipe = new HummusRecipe('new', output);
        recipe
            .createPage()
            .text('asdjflkasdjfl;ads', 100, 100, {
                color: 'f29902',
                fontSize: 50
            })
            .rectangle(50, 50, 50, 50, {
                color: [255, 0, 255]
            })
            .rectangle(120, 50, 50, 50, {
                stroke: [0, 0, 140],
                width: 6
            })
            .rectangle(50, 120, 50, 50, {
                fill: [255, 0, 0]
            })
            .rectangle(120, 120, 50, 50, {
                stroke: '#3b7721',
                fill: '#eee000'
            })
            .moveTo(300, 300)
            .lineTo(400, 450)
            .lineTo(400, 600)
            .polygon([
                [31, 31],
                [31, 532],
                [45, 780],
                [90, 300],
                [31, 31]
            ], {
                color: '#3b7721',
                lineWidth: 5
            })
            .circle(150, 300, 50, { stroke: '#3b7721', fill: '#eee000', lineWidth: 3 })
            .circle(0, 0, 300)
            .comment('yoyoyo', 50, 50)
            .endPage()
            // 2nd page
            .createPage(600, 300)
            .circle(150, 150, 300)
            .endPage()
            .endPDF(done);
    });
});
