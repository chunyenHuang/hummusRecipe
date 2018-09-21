const path = require('path');
const HummusRecipe = require('../lib');

describe('Annotation: Comment', () => {
    it('Add comment', (done) => {
        const output = path.join(__dirname, 'output/Add comment.pdf');
        const recipe = new HummusRecipe('new', output);
        recipe
            // 1st Page
            .createPage('letter-size')
            .comment('Feel free to open issues to help us!', 'center', 100, {
                flag: 'locked'
            })
            .endPage()
            .endPDF(done);
    });
    it('Add rich text comment', (done) => {
        const src = path.join(__dirname, 'materials/test.pdf');
        const output = path.join(__dirname, 'output/Add comment with rich text.pdf');
        const recipe = new HummusRecipe(src, output);
        const textContent = [
            '<p style="text-align: center">Align Center</p>',
            '<span style="font-family: Helvetica">Plain Text</span>',
            '<b>Bold</b>',
            '<i>Italic</i>',
            '<span style="color: #0000ff">Blue</span>',
            '<span style="font-style: italic">Italic by font-style</span>',
            '<span style="font-size: 18pt">18pt</span>',
            '<span style="font-size: 30%">30%</span>',
            '<span style="font-weight: 800">Weight 800</span>',
            // '<span style="font-stretch: condensed">Condensed</span>',
            // '<span style="font-stretch: expanded">Expanded</span>',
            // '<span style="text-decoration: line-through">Line-Through</span>',
            '<span style="text-decoration: underline">Underline</span>'
        ].join('<br/>');
        recipe
            .editPage(1)
            .comment(textContent, 'center', 100, {
                richText: true,
                open: true,
                align: 'center center'
            })
            .endPage()
            .endPDF(done);
    });
    it('Add FreeText', (done) => {
        const output = path.join(__dirname, 'output/Add FreeText.pdf');
        const recipe = new HummusRecipe('new', output);
        recipe
            // 1st Page
            .createPage('letter-size')
            .annot(300, 300, 'FreeText', {
                text: 'Yo yo yo'
            })
            .annot('center', 'center', 'FreeText', {
                text: 'Do you have Free Style yo?',
                width: 200,
                height: 50
            })
            .endPage()
            .endPDF(done);
    });
    // Ticket #20, need to link annotation to text
    it('Add highlight', (done) => {
        const output = path.join(__dirname, 'output/Add highlight.pdf');
        const recipe = new HummusRecipe('new', output);
        recipe
            // 1st Page
            .createPage('letter-size')
            .text('Trace-based Just-in-Time Type Specialization for Dynamic Languages', 'center', 'center')
            .annot('center', 'center', 'Highlight', {
                text: 'Oh~la',
                width: 200,
                height: 50
            })
            .endPage()
            .endPDF(done);
    });
});
