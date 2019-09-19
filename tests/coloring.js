const path = require('path');
const HummusRecipe = require('../lib');

describe('Coloring', () => {
    it('Using Names', (done) => {
        const output = path.join(__dirname, 'output/color-special.pdf');
        const recipe = new HummusRecipe('new', output, {
            colorspace: 'rgb'
        });
        recipe
            .createPage('letter-size')
            .chroma('magenta', [0,255,0,0], 'separation')
            .text('Separation color magenta', 100, 430, {bold: true, size: 20, color: 'magenta', colorspace: 'separation'})
            .line([[80,430],[100,430]],{lineWidth: .5})
            .endPage()
            .endPDF(done);
    });

    it('Adding Names', (done) => {
        const output = path.join(__dirname, 'output/color-special.pdf');
        const rgbColors = path.join(__dirname, 'materials/rgb-colors.json');
        const lineOpt = {lineWidth: .5};
        const recipe = new HummusRecipe(output, output, {
            colorspace: 'rgb'
        });
        recipe
            .chroma('purple', [255,0,255])
            .chroma('yellow', [255,255,0])
            .chroma('fucia', '#990066')
            .editPage(1)
            .circle(60, 375, 20, {fill: 'yellow', stroke: 'fucia'})
            .text('White',   100, 70,  {bold: true, size: 20, color: 'white', colorspace:'gray', textBox:{style:{fill:'#00', colorspace:'gray'}}})
            .line([[80,70],[100,70]],lineOpt)
            .text('Purple',  100, 100, {bold: true, size: 20, color: 'purple'})
            .line([[80,100],[100,100]],lineOpt)
            .text('Yellow',  100, 130, {bold: true, size: 20, color: 'yellow'})
            .line([[80,130],[100,130]],lineOpt)
            .text('Fucia',   100, 160, {bold: true, size: 20, color: 'fucia'})
            .line([[80,160],[100,160]],lineOpt)
            .text('Magenta', 100, 190, {bold: true, size: 20, color: 'magenta', colorspace:'cmyk'})
            .line([[80,190],[100,190]],lineOpt)
            .text('Defining Gold Here', 100, 220, {bold: true, size: 20, color: '#ff9900', colorName: 'gold'})
            .line([[80,220],[100,220]],lineOpt)
            .text('Using Gold Here', 100, 250, {bold: true, size: 20, color: 'gold'})
            .line([[80,250],[100,250]],lineOpt)
            .text('Undefined color returns default color', 100, 280, {bold: true, size: 20, color: 'undefinedColorGivesDefault'})
            .line([[80,280],[100,280]],lineOpt)
            .chroma('!load', rgbColors)
            .text('Burlywood from file load', 100, 310, {bold: true, size: 20, color: 'burlywood'} )
            .line([[80,310],[100,310]],lineOpt)
            .endPage()
            .endPDF(done);
    });

    it('Special Color Space Names', (done) => {
        const output = path.join(__dirname, 'output/color-special.pdf');
        const lineOpt = {lineWidth: .5};
        const recipe = new HummusRecipe(output, output, {
            colorspace: 'separation'
        });
        recipe
            .editPage(1)
            .chroma('purple', [255,0,255], 'separation')
            .text('Separation color purple', 100, 460, {bold: true, size: 20, color: 'purple'})
            .line([[80,460],[100,460]],lineOpt)
            .text('Separation color orange', 100, 490, {bold: true, size: 20, color: [255,69,0], colorName: 'orange'})
            .line([[80,490],[100,490]],lineOpt)
            .text('Pantone 1505 C, RGB', 100, 520,  {bold: true, size: 20, color: [255,105,0], colorName: 'PANTONE 1505 C'} )
            .line([[80,520],[100,520]],lineOpt)
            .text('Pantone 1505 C, CMYK', 100, 550,  {bold: true, size: 20, color: '%0,56,90,0', colorName: 'PANTONE 1505 C'} )
            .line([[80,550],[100,550]],lineOpt)
            .text('CMYK Direct', 100, 580,  {bold: true, size: 20, color: '%0,56,90,0', colorspace: 'cmyk'} )
            .line([[80,580],[100,580]],lineOpt)
            .text('Nan, a great PDF collaborator!', 100, 360, {bold: true, size: 30, color: 'nans'})
            .endPage()
            .endPDF(done);
    });
});
