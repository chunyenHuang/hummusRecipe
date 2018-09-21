const path = require('path');
const HummusRecipe = require('../lib');

describe('PDF Generator', () => {
    const pdf = {
        filename: 'My pdf - by pdf generator',
        info: {
            version: 1.7,
            author: 'someone',
            title: 'No title',
            subject: 'Blank PDF',
            keywords: ['hummus', 'js', 'is', 'our', 'friend']
        },
        pages: [{
            width: 500,
            height: 700,
            background: {
                value: [25, 23, 255],
                opacity: 0.1
            },
            waterMark: 'MY WATERMARK',
            footer: true
        }, {
            width: 612,
            height: 792,
            background: {
                value: [255, 50, 155],
                opacity: 0.5
            },
            waterMark: null,
            footer: true
        }]
    };

    it('Create a pdf', (done) => {
        const output = path.join(__dirname, `output/${pdf.filename}.pdf`);
        const recipe = new HummusRecipe('new', output);
        recipe.info(pdf.info);

        pdf.pages.forEach((page, index) => {
            const { width, height } = page;
            const pageNumber = index + 1;
            recipe.createPage(width, height);
            if (page.background) {
                recipe.rectangle(0, 0, width, height, {
                    color: page.background.value,
                    opacity: page.background.opacity || 0.1
                });
            }
            if (page.waterMark) {
                recipe.text(page.waterMark, 'center', 'center', {
                    bold: true,
                    size: 50,
                    color: '#0000ff',
                    align: 'center center',
                    opacity: 0.3
                });
            }
            if (page.footer) {
                const message = `Page ${pageNumber}`;
                recipe.text(message, 'center', (height - 30), {
                    size: 10,
                    color: '#000000',
                    align: 'center center'
                });
            }
            recipe.endPage();
        });
        recipe.endPDF(done);
    });
});
