const path = require('path');
const HummusRecipe = require('../lib');

describe('Modify', () => {
    const taskAI = 'Add images';
    it(taskAI, (done) => {
        const src = path.join(__dirname, 'materials/test.pdf')
        const output = path.join(__dirname, `output/${taskAI}.pdf`);
        const myCats = path.join(__dirname, 'materials/myCats.jpg');

        const recipe = new HummusRecipe(src, output);
        recipe
            .editPage(1)
            .image(myCats, 'center', 'center', {
                width: 300,
                height: 300,
                opacity: 0.5,
                keepAspectRatio: false,
                align: 'center center'
            })
            .image(myCats, 'center', 100, {
                scale: 0.1,
                align: 'center center'
            })
            .endPage()
            .endPDF(done);
    });

    // const taskATP = 'Add transparent png';
    // it(taskATP, (done) => {
    //     const src = path.join(__dirname, 'materials/test.pdf')
    //     const output = path.join(__dirname, `output/${taskATP}.pdf`);
    //     const wikiPng = path.join(__dirname, 'materials/wiki.png');

    //     const recipe = new HummusRecipe(src, output);
    //     recipe
    //         .editPage(1)
    //         .image(wikiPng, 'center', 'center', {
    //             width: 300,
    //             height: 300,
    //             align: 'center center'
    //         })
    //         .endPage()
    //         .endPDF(done);
    // });
});
