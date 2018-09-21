const path = require('path');
const HummusRecipe = require('../lib');

describe('Rotation', () => {
    const pdfs = [{
        title: 'Portrait 270',
        filename: 'test-P-270.pdf'
    }, {
        title: 'Portrait 180',
        filename: 'test-P-180.pdf'
    }, {
        title: 'Portrait 90',
        filename: 'test-P-90.pdf'
    }, {
        title: 'Portrait 0',
        filename: 'test-P-0.pdf'
    }, {
        title: 'Landscape 270',
        filename: 'test-L-270.pdf'
    }, {
        title: 'Landscape 180',
        filename: 'test-L-180.pdf'
    }, {
        title: 'Landscape 90',
        filename: 'test-L-90.pdf'
    }, {
        title: 'Landscape 0',
        filename: 'test-L-0.pdf'
    }];
    pdfs.forEach((pdf) => {
        it(pdf.title, (done) => {
            const src = path.join(__dirname, `materials/${pdf.filename}`);
            const output = path.join(__dirname, `output/${pdf.filename}`);
            const recipe = new HummusRecipe(src, output);
            const {
                width,
                height
            } = recipe.pageInfo(1);
            recipe
                .editPage(1)
                .text('[0,0] is Here.', 0, 0, {
                    color: '066099',
                    fontSize: 100,
                    bold: true,
                    font: 'Helvatica'
                })
                .comment('add comment', 0, 0)
                .rectangle(0, 0, width / 2, height / 2, {
                    stroke: '#ff0000',
                    fill: '#000000',
                    opacity: 0.2
                })
                .circle(300, 300, 300, {
                    color: '#0000ff',
                    opacity: 0.1
                })
                .comment('2', 'center', 100)
                .comment('3', 'center', 300)
                .comment('3', 300, 400)
                .comment('3', 400, 500)
                .comment('3', 500, 600)
                .endPage()
                .endPDF(done);
        });
    });

});
