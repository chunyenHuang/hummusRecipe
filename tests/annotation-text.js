const path = require('path');
const HummusRecipe = require('../lib');

describe('Annotation: Text Annotations', () => {
    it('Add a simple hightlight with text.', (done) => {
        const output = path.join(__dirname, 'output/annotation-text.pdf');
        const recipe = new HummusRecipe('new', output);
        recipe
            .createPage('letter-size')
            .annot(50, 50, 'Highlight', {
                text: 'Yo! I am a lonely Highlight',
                width: 100,
                height: 30,
                border: 10,
                color: [255, 128, 128]
            })
            .text('This text should be highlighted.', 50, 100)
            .annot(50, 100, 'Highlight', {
                text: 'Yes, it is.',
                width: 200,
                height: 18
            })
            .circle(50, 150, 2, { stroke: '#3b7721' })
            .text('This text should be highlighted as well.', 50, 150, {
                highlight: true,
                size: 8
            })
            .text('This text should be highlighted with custom value.', 50, 200, {
                highlight: {
                    color: [12, 200, 128],
                    text: 'Is this a green highlight?'
                },
                size: 20
            })
            .text('This text should be underlined with custom value.', 50, 250, {
                underline: {
                    color: [255, 0, 128],
                    text: 'Underline!'
                },
                size: 30
            })
            .text('This text should be Squiggly underlined with custom value.', 50, 300, {
                underline: {
                    color: [100, 0, 255],
                    text: 'Squiggly!'
                }
            })
            .text('This text should be striked out with custom value.', 50, 350, {
                strikeOut: {
                    color: [77, 77, 77],
                    text: 'StriketOut!'
                }
            })
            .text('This text should be striked out and highlighted.', 50, 400, {
                strikeOut: {
                    color: [77, 77, 77],
                    text: 'StriketOut!'
                },
                highlight: {
                    color: [255, 0, 0]
                },
                size: 25
            })
            .endPage()
            .endPDF(done);
    });


    it('Add a hightlight with text box.', (done) => {
        const output = path.join(__dirname, 'output/annotation-with-textbox.pdf');
        const recipe = new HummusRecipe('new', output);
        const textContent =
            `${Date.now()} Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. ` +
            'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using \'Content here, content here\', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for \'lorem ipsum\' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).';
        recipe
            .createPage('letter-size')
            .text(textContent, 'center', 'center', {
                textBox: {
                    width: 500,
                    lineHeight: 30,
                    minHeight: 300,
                    textAlign: 'center',
                    padding: [15, 30, 30],
                    style: {
                        lineWidth: 5,
                        stroke: '#ff0000',
                        opacity: 0.3
                    }
                },
                font: 'Helvetica',
                color: '#813b00',
                align: 'center center',
                highlight: {
                    text: 'highlight this paragraph'
                }
            })
            .endPage()
            .endPDF(done);
    });
});
