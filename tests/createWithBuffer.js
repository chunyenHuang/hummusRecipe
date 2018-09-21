const path = require('path');
const fs = require('fs');
const assert = require('chai').assert;
const HummusRecipe = require('../lib');

describe('Modify', () => {
    it('Create Writer With buffer', done => {
        const src = path.join(__dirname, 'materials/test.pdf');
        const myCats = path.join(__dirname, 'materials/myCats.jpg');
        const buffer = fs.readFileSync(src);
        const recipe = new HummusRecipe(buffer);
        recipe
            .editPage(1)
            .image(myCats, 'center', 'center', {
                width: 300,
                height: 300,
                keepAspectRatio: false,
                opacity: 0.4,
                align: 'center center'
            })
            .annot('center', 'center', 'Square', {
                text: 'yo, I am a square',
                width: 200,
                height: 100,
                border: 10,
                color: [128, 31, 80]
            })
            .endPage()
            .endPDF((outBuffer) => {
                assert(outBuffer instanceof Buffer);
                fs.writeFileSync(path.join(__dirname, 'output/createWithBuffer.pdf'), outBuffer);
                done();
            });
    });

    it('Create Writer With buffer and file output', done => {
        const src = path.join(__dirname, 'materials/test.pdf');
        const output = path.join(__dirname, 'output/createWithBufferAndFileOutput.pdf');
        const myCats = path.join(__dirname, 'materials/myCats.jpg');
        const buffer = fs.readFileSync(src);
        const recipe = new HummusRecipe(buffer, output);
        recipe
            .editPage(1)
            .image(myCats, 'center', 'center', {
                width: 300,
                height: 300,
                keepAspectRatio: false,
                opacity: 0.4,
                align: 'center center'
            })
            .annot('center', 'center', 'Square', {
                text: 'yo, I am a square',
                width: 200,
                height: 100,
                border: 10,
                color: [128, 31, 80]
            })
            .endPage()
            .endPDF((result) => {
                assert.equal(output, result);
                assert.equal(fs.existsSync(output), true);
                done();
            });
    });
});
