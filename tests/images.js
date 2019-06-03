const path = require('path');
const HummusRecipe = require('../lib');

describe('Modify', () => {
    const taskAI = 'Add images';
    it(taskAI, (done) => {
        const src = path.join(__dirname, 'materials/test.pdf');
        const output = path.join(__dirname, `output/${taskAI}.pdf`);
        const myCats = path.join(__dirname, 'materials/myCats.jpg');
        const wiki = path.join(__dirname, 'materials/wiki.png');

        const recipe = new HummusRecipe(src, output);
        recipe
            .editPage(1)
            .image(myCats, 'center', 'center', {
                width: 300,
                height: 300,
                keepAspectRatio: false,
                opacity: 1,
                align: 'center center'
            })
            .image(myCats, 500, 210, {
                scale: 0.1,
                rotation: -90
            })
            .rectangle(500, 210, 73, 97, {
                rotation: -90,
                color: '#ff0000'
            })
            .image(myCats, 'center', 600, {
                scale: 0.1,
                align: 'center center',
                rotation: 45,
                rotationOrigin: [270, 550],
                skewY: 10
            })
            .rectangle(270, 550, 73, 97, {
                rotation: 45,
                rotationOrigin: [270, 550],
                skewY: 10
            })
            .image(wiki, 0, 0,{
                width: 300,
                height: 300,
                opacity: 0.7
            })
            .endPage()
            .editPage(2)
            .rectangle(0, 0, 800, 800, {
                color: [22, 48, 9]
            })
            .image(wiki, 'center', 'center',{
                width: 300,
                height: 300,
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
