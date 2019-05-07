const path = require('path');
const HummusRecipe = require('../lib');
const hummus = require('hummus');

describe('Color', () => {
    it('basic', (done) => {
        // Showing hummus colorspace (Gray, RGB, CMYK) ability upon which hummus-recipe is built
        const output = path.join(__dirname, 'output/hummus-new.pdf');
        const pdfWriter = hummus.createWriter(output);
        const page = pdfWriter.createPage(0, 0, 595, 842);
        const pageContext = pdfWriter.startPageContentContext(page);
        pageContext.drawCircle(149, 640, 40, {color: 0x0000FF00, colorspace: 'cmyk', type: 'fill' });
        pageContext.drawCircle(149, 640, 40, {color: 0xFF00FF00, colorspace: 'cmyk', type: 'stroke' });
        pageContext.drawPath(75, 640, 149, 800, 225, 640, { color: 0xFF000000, colorspace: 'cmyk', type: 'fill' });
        pageContext.drawPath(75, 700, 149, 750, 225, 700, { color: 0xbb, colorspace: 'gray', type: 'stroke', width: 5 });
        pageContext.drawCircle(149, 590, 50, {color: 0xFF0000, colorspace: 'rgb', type: 'fill' });
        pdfWriter.writePage(page);
        pdfWriter.end();
        done();
    });

    // Tests the explicit setting of the global default RGB colorspace

    it('RGB explicit, global setting', (done) => {
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
            .text('translucent light green filled rectangle', 40, 550)
            .rectangle(0, 0, 300, 500, {
                fill: [50, 255, 50],
                opacity: 0.5
            })
            .endPage()
            .endPDF(done);
    });

    // Tests the implicit setting of the RGB colorspace via size of color specification

    it('RGB implicit', (done) => {
        const input = path.join(__dirname, 'output/color-rgb.pdf');
        const recipe = new HummusRecipe(input);
        recipe
            .editPage(1)
            .text('blue circle, red lines in center', 400, 200)
            .circle(500, 100, 50, {stroke: [0,0,255], lineWidth: 10})
            .line([[490, 100], [510, 100]], {stroke: [200,0,0], lineWidth: 5})
            .line([[500, 90],  [500, 110]], {stroke: [200,0,0], lineWidth: 5})
            .text('3 corner yellow polygon, outline red', 360, 630)
            .polygon([[500,500], [550,600], [450,600]], {fill: [255,255,0], stroke:[255,0,0]})
            .text('ellipse with red dash border, violet fill', 40, 675)
            .ellipse(150, 625, 75, 25, {stroke:[255,0,0], fill:[60,0,255], opacity: .4, dash:[5,2]})
            .endPage()
            .endPDF(done);
    });

    // Tests the explicit setting of the global default CMYK colorspace

    it('CMYK explicit, global setting', (done) => {
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
            .text('translucent rose filled rectangle', 40, 550)
            .rectangle(0, 0, 300, 500, {
                fill: [0, 255, 50, 10],
                opacity: 0.5
            })
            .endPage()
            .endPDF(done);
    });

    // Tests the implicit setting of the CMYK colorspace via size of color specification

    it('CMYK implicit', (done) => {
        const input = path.join(__dirname, 'output/color-cmyk.pdf');
        const recipe = new HummusRecipe(input);
        recipe
            .editPage(1)
            .text('cyan circle, green lines in center', 400, 200)
            .circle(500, 100, 50, {stroke: [255,0,0,0], lineWidth: 10})
            .line([[490, 100], [510, 100]], {stroke: [255,0,255,0], lineWidth: 5})
            .line([[500, 90],  [500, 110]], {stroke: [255,0,255,0], lineWidth: 5})
            .text('3 corner yellow polygon, outline black', 360, 630)
            .polygon([[500,500], [550,600], [450,600]], {fill: [0,0,255,0], stroke:[0,0,0,255]})
            .text('ellipse with cyan dash border, pale green fill', 40, 675)
            .ellipse(150, 625, 75, 25, {stroke:[255,0,0,0], fill:[60,0,255,0], opacity: .4, dash:[5,2]})
            .endPage()
            .endPDF(done);
    });

    // Tests the explicit setting of the global default Gray colorspace

    it('Gray explicit, global setting', (done) => {
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
            .text('translucent gray filled rectangle', 40, 550)
            .rectangle(0, 0, 300, 500, {
                fill: [100],
                opacity: 0.5
            })
            .endPage()
            .endPDF(done);
    });
    
    // Tests the implicit setting of the Gray colorspace via size of color specification

    it('Gray implicit', (done) => {
        const input = path.join(__dirname, 'output/color-gray.pdf');
        const recipe = new HummusRecipe(input);
        recipe
            .editPage(1)
            .text('black circle, fill gray,', 450, 200, {color: [0]})
            .text('white lines in center', 450, 220, {color: [0]})
            .circle(500, 100, 50, {fill: [200], stroke: [0], lineWidth: 10})
            .line([[490, 100], [510, 100]], {stroke: [255], lineWidth: 5})
            .line([[500, 90],  [500, 110]], {stroke: [255], lineWidth: 5})
            .text('3 corner gray polygon, outline black', 360, 630, {color: [0]})
            .polygon([[500,500], [550,600], [450,600]], {fill: [235], stroke:[0]})
            .text('ellipse with black dash border, gray fill', 40, 675, {color: [0]})
            .ellipse(150, 625, 75, 25, {stroke:[0], fill:[100], opacity: .4, dash:[5,2]})
            .endPage()
            .endPDF(done);
    });

    it('All color spaces', (done) => {
        const output = path.join(__dirname, 'output/color-all.pdf');
        const recipe = new HummusRecipe('new', output);
        let font = 'Courier New';
        let title= 30;
        let ts = 190;
        let gsize = ts + 16*4 + 15;
        let cwid = 24;
        let col  = 20;
        let indent = 20;
        let para = col+indent;
        let icon = para - 10;
        let line = (i) => {return i*20};
        let i = 2;
        recipe
            .createPage('letter-size')
            .text("Gray,", ts,            line(i), {size: title, color: "00"})
            .text('R', gsize,             line(i), {size: title, color:[255,0,0]})
            .text('G', gsize+cwid-1,      line(i), {size: title, color:[0,255,0]})
            .text('B', gsize+(cwid*2),    line(i), {size: title, color:[0,0,255]})
            .text(', ', gsize+(cwid*3),   line(i), {size: title, color:"00"})
            .text('C', gsize+(cwid*4)-10, line(i), {size: title, color:[255,0,0,0]})
            .text('M', gsize+(cwid*5)-10, line(i), {size: title, color:[0,255,0,0]})
            .text('Y', gsize+(cwid*6)-6,  line(i), {size: title, color:[0,0,255,0]})
            .text('K', gsize+(cwid*7)-10, line(i), {size: title, color:[0,0,0,255]});
        i += 1;
        recipe
            .text('IMPLICIT Colorspace (via input color specification)', col, line(++i))
            
            .text('Gray, DecimalColor: [200]',       para, line(++i), {color: [200]})
            .text('Gray, HexColor: #55',             para, line(++i), {color: '#55'})
            .text('RGB,  DecimalColor: [0,0,255]',   para, line(++i), {color: [0,0,255]})
            .text('RGB,  HexColor: #FF0000',         para, line(++i), {color: '#FF0000'})
            .text('CMYK, DecimalColor: [255,0,0,0]', para, line(++i), {color: [255,0,0,0]})
            .text('CMYK, HexColor: #FF000088',       para, line(++i), {color: '#FF000088'});
        i += 1;
        recipe
            .text('Colorspace Defaults', col, line(++i))
            .circle(icon, line(i+1)-5, 5, { colorspace: 'gray', fill: "#ffff"})
            .text('Gray', para, line(++i), {colorspace:'gray'})
            .circle(icon, line(i+1)-5, 5, { colorspace: 'rgb', fill: "#00"})
            .text('RGB',  para, line(++i), {colorspace:'rgb'})
            .circle(icon, line(i+1)-5, 5, { colorspace: 'cmyk', fill: "#00"})
            .text('CMYK', para, line(++i), {colorspace:'cmyk'});
        i += 1;
        recipe
            .text('Bad "color" value results in colorspace defaults', col, line(++i))
            .circle(icon, line(i+1)-5, 5, { colorspace: 'gray', fill: "#ffff"})
            .text('Gray, #ffff',   para, line(++i), {colorspace:'gray', color: '#ffff'})
            .circle(icon, line(i+1)-5, 5, { colorspace: 'rgb', fill: "#00"})
            .text('RGB,  #00',     para, line(++i), {colorspace:'rgb',  color: '#00'})
            .circle(icon, line(i+1)-5, 5, { colorspace: 'cmyk', fill: "#00"})
            .text('CMYK, #abcdef', para, line(++i), {colorspace:'cmyk', color: '#abcdef'});
        i += 1;
        recipe
            .text('Legal Color Specifications', col, line(++i))
            .text(' -----------------------------------------------------' , para, line(++i), {font: font})
            .text('| Color | HexColor   | DecimalColor                   |', para, line(++i), {font: font})
            .text('| Space | (string)   | (array)                        |', para, line(++i), {font: font})
            .text('|-------+------------+--------------------------------|', para, line(++i), {font: font})
            .text('| Gray  | #GG        | [gray]                         |', para, line(++i), {font: font})
            .text('|  RGB  | #rrggbb    | [red, green, blue]             |', para, line(++i), {font: font})
            .text('| CMYK  | #ccmmyykk  | [cyan, magenta, yellow, black] |', para, line(++i), {font: font})
            .text(' -----------------------------------------------------' , para, line(++i), {font: font});
        i += 1;
        recipe
        .text('HexColor component values (two hex digits) range from 00 to FF.', para, line(++i))
        .text('DecimalColor component values range from 0 to 255.', para, line(++i))

        // testing simple drawing of shapes with no color specifications.
        .text('Shapes using default RGB', 360, 160)
        .circle(400, 200, 20)
        .ellipse(475, 200, 30, 20)
        .rectangle(445, 240, 60, 40)
        .polygon([[400, 240],[420,280],[380,280]])
        .endPage()
            .endPDF(done);
    });
});
