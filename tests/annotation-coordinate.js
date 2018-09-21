const path = require('path');
const HummusRecipe = require('../lib');

describe('Annotation: Coordinate', () => {
    const rotations = [0, 90, 180, 270];

    rotations.forEach(rotation => {
        it(`${rotation} degree rotation.`, (done) => {
            const src = path.join(__dirname, `materials/test-L-${rotation}.pdf`);
            const output = path.join(__dirname, `output/annotation-rotation-${rotation}.pdf`);
            const recipe = new HummusRecipe(src, output);
            recipe
                .editPage(1)
                .text('Should be printed horizontally', 'center', 'center', {
                    size: 30,
                    color: '#ff0000'
                })
                .annot('center', 'center', 'Square', {
                    text: 'Should be printed horizontally on the top of the text',
                    width: 600,
                    height: 100,
                    border: 10,
                    color: [255, 128, 128],
                    followOriginalPageRotation: false // if set to true, the annotation will follow the original rotation
                })
                .endPage()
                .endPDF(done);
        });
    });
});
