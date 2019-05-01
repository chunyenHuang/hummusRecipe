const path = require('path');
const HummusRecipe = require('../lib');
const hummus = require('hummus');

describe('Color', () => {
    it('basic', (done) => {
        const output = path.join(__dirname, 'output/hummus-new.pdf');
        const pdfWriter = hummus.createWriter(output);
        const page = pdfWriter.createPage(0, 0, 595, 842);
        const pageContext = pdfWriter.startPageContentContext(page);
        pageContext.drawPath(75, 640, 149, 800, 225, 640, { color: 0xFF000000, colorspace: 'cmyk', type: 'fill' });
        pdfWriter.writePage(page);
        pdfWriter.end();
        done();
    });
    it('RGB', (done) => {
        const output = path.join(__dirname, 'output/color-rgb.pdf');
        const recipe = new HummusRecipe('new', output, {
            colorspace: 'rgb'
        });
        recipe
            .createPage('letter-size')
            .text('WATERMARK', 'center', 'center', {
                bold: true,
                size: 60,
                color: '#f442ee',
                align: 'center center',
                opacity: 0.3
            })
            .rectangle(0, 0, 300, 500, {
                color: [50, 255, 50],
                opacity: 0.5
            })
            .endPage()
            .endPDF(done);
    });

    it('CMYK', (done) => {
        const output = path.join(__dirname, 'output/color-cmyk.pdf');
        const recipe = new HummusRecipe('new', output, {
            colorspace: 'cmyk'
        });
        recipe
            .createPage('letter-size')
            .text('WATERMARK', 'center', 'center', {
                bold: true,
                size: 60,
                color: '#f442ee52',
                align: 'center center',
                opacity: 0.3
            })
            .rectangle(0, 0, 300, 500, {
                color: [0, 255, 50, 10],
                opacity: 0.5
            })
            .endPage()
            .endPDF(done);
    });

    it('Gray', (done) => {
        const output = path.join(__dirname, 'output/color-gray.pdf');
        const recipe = new HummusRecipe('new', output, {
            colorspace: 'gray'
        });
        recipe
            .createPage('letter-size')
            .text('WATERMARK', 'center', 'center', {
                bold: true,
                size: 60,
                color: '#00',
                align: 'center center',
                opacity: 0.3
            })
            .rectangle(0, 0, 300, 500, {
                color: [100],
                opacity: 0.5
            })
            .endPage()
            .endPDF(done);
    });
});
