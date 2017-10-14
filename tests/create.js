const path = require('path');
const HummusRecipe = require('../lib');

describe('Create', () => {
    it('blank pdf', (done) => {
        const output = path.join(__dirname, 'output/blank.pdf');
        const recipe = new HummusRecipe('new', output, {
            version: 1.6,
            author: 'someone',
            title: 'No title',
            subject: 'Blank PDF',
            keywords: ['hummus', 'js', '??', '234']
        });
        recipe
            .custom('myValue', 123)
            .createPage()
            .endPage()
            .createPage()
            .endPage()
            .endPDF(done);
    });

    it('new pdf', (done) => {
        const output = path.join(__dirname, 'output/new.pdf');
        const recipe = new HummusRecipe('new', output);
        const myCats = path.join(__dirname, 'materials/myCats.jpg');
        recipe
            // 1st Page
            .createPage('letter-size')
            .circle('center', 100, 30, { stroke: '#3b7721', fill: '#eee000' })
            .polygon([
                [50, 250],
                [100, 200],
                [512, 200],
                [562, 250],
                [512, 300],
                [100, 300],
                [50, 250]
            ], {
                lineWidth: 5,
                stroke: [0, 0, 140],
                fill: [153, 143, 32],
                opacity: 0.2
            })
            .image(myCats, 'center', 450, {
                width: 250,
                height: 250,
                opacity: 0.5,
                align: 'center center'
            })
            .rectangle(240, 400, 50, 50, {
                color: [255, 0, 255],
                opacity: 0.2
            })
            .rectangle(322, 400, 50, 50, {
                stroke: [0, 0, 140],
                width: 6
            })
            .rectangle(240, 476, 50, 50, {
                fill: [255, 0, 0]
            })
            .rectangle(322, 476, 50, 50, {
                stroke: '#3b7721',
                fill: '#eee000',
                opacity: 0.2
            })
            .moveTo(200, 600)
            .lineTo('center', 650)
            .lineTo(412, 600)
            .text('Welcome to Hummus-Recipe', 'center', 250, {
                color: '066099',
                fontSize: 30,
                bold: true,
                font: 'Helvatica',
                align: 'center center'
            })
            .text('some text box', 450, 400, {
                color: '066099',
                fontSize: 20,
                font: 'Courier New',
                textBox: {
                    width: 150,
                    lineHeight: 16,
                    padding: [5, 15],
                    style: {
                        lineWidth: 1,
                        stroke: '#00ff00',
                        fill: '#ff0000',
                        dash: [20, 20],
                        opacity: 0.1
                    }
                }
            })
            .comment('Feel free to open issues to help us!', 'center', 100 , {
                flag:'locked'
            })
            .endPage()
            // 2nd page
            .createPage('A4', 90)
            .circle(150, 150, 300, { fill: '#bbbbbb' })
            .rectangle(240, 400, 50, 50, {
                color: [255, 0, 255],
                opacity: 0.2
            })
            .endPage()
            .endPDF(done);
    });
});
