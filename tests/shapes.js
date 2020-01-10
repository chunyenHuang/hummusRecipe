const path = require('path');
const HummusRecipe = require('../lib');


describe('Regular Polygons, Stars, Arrows', () => {
    it('Add N sided regular polygons', (done) => {
        const output = path.join(__dirname, 'output/Add N-gons.pdf');
        const recipe = new HummusRecipe('new', output);
        const rota = { stroke: '#ff0000', opacity: .3, rotation: 45, debug: 1 };
        const nops = { stroke: '#ff0000', opacity: .3, rotation: 0, debug: 1 };
        recipe
            .createPage('letter-size')
            .n_gon(200, 100, 50, 3, nops)
            .n_gon(200, 100, 50, 3, rota)
            .n_gon(300, 100, 50, 4, nops)
            .n_gon(300, 100, 50, 4, rota)
            .n_gon(400, 100, 50, 5, nops)
            .n_gon(400, 100, 50, 5, rota)
            .n_gon(200, 220, 50, 6, nops)
            .n_gon(200, 220, 50, 6, { opacity: .3, rotation: 30, debug: 1 })
            .n_gon(300, 220, 50, 7, nops)
            .n_gon(300, 220, 50, 7, rota)
            .n_gon(400, 220, 50, 8, nops)
            .n_gon(400, 220, 50, 8, rota)
            .n_gon(200, 340, 50, 50, nops) // basically a circle at this point
            .n_gon(200, 340, 50, 50, rota)
            .text('All polygon vertices should be inside reference circle.', 150, 650)
            .endPage()
            .endPDF(done);
    });

    it('Add N pointed stars', (done) => {
        const input = path.join(__dirname, 'output/Add N-gons.pdf');
        const output = input;
        const recipe = new HummusRecipe(input, output);
        recipe
            .editPage(1)
            .star(300, 340, 50, { fill: '#0000ff', })
            .star(400, 340, 50, 6, { fill: '#0000ff', opacity: .3, rotation: 30 })
            .star(200, 450, 50, 7)
            .star(300, 450, 50, 8, { fill: '#0000ff', opacity: .3 })
            .star(400, 450, 50, 9, { fill: '#0000ff', opacity: .3 })
            .star(200, 560, 50, 10, { fill: '#0000ff', opacity: .3 })
            .star(300, 560, 50, 11, { fill: '#0000ff', opacity: .3 })
            .star(400, 560, 50, 40)
            .endPage()
            .endPDF(done);
    });

    it('Add arrows', (done) => {
        const output = path.join(__dirname, 'output/arrowAnatomy.pdf');
        const recipe = new HummusRecipe('new', output);

        recipe
            .createPage('letter-size')
            .text('Anatomy of an Arrow', 250, 20, { size: 20, bold: true })
            .arrow(72, 100)
            .text('arrow( x, y )', 54, 60, { color: '#000000', bold: true })
            .text('Default arrow', 100, 95);
        let center = [390, 200];
        let [cx, cy] = center;
        let sw = 100;
        let hw = 100;
        let sl = 100;
        let hl = 100;
        recipe
            .circle(cx, cy, hw, { color: 'green', width: .5 })
            .arrow(cx, cy, { shaft: sw, head: hw })
            .text('(x,y)', cx - 22, cy - 15, { size: 9, color: '#000000', bold: true })
            .line([
                [cx - sl + 5, cy],
                [cx, cy]
            ], { color: 'red', width: 1, dash: [10, 3] })
            .line([
                [cx, cy - (sw / 2)],
                [cx, cy + (sw / 2)]
            ], { color: 'red', width: 1, dash: [10, 3] })
            .line([
                [cx - 5, cy],
                [cx + 5, cy]
            ], { width: 1.5, lineCap: 'butt', color: '#000000' })
            .line([
                [cx, cy - 5],
                [cx, cy + 5]
            ], { width: 1.5, lineCap: 'butt', color: '#000000' })
            .text('shaft', cx - 60, cy - (sw / 2) - 15, { color: '#ff00ff' })
            .text('arrowhead', cx + 15, cy - 5)
            .text('width', cx - 175, cy - 5)
            .line([
                [cx - 120, cy - 50],
                [cx - 125, cy - 50],
                [cx - 125, cy + 50],
                [cx - 120, cy + 50]
            ], { width: .5, lineCap: 'butt', color: '#ff00ff' })

            .line([
                [cx - 120, cy - sw],
                [cx - 130, cy - sw],
                [cx - 130, cy + sw],
                [cx - 120, cy + sw]
            ], { width: .5, lineCap: 'butt' })
            .line([
                [cx - 115, cy - sw],
                [cx - 5, cy - sw]
            ], { width: .5, lineCap: 'butt', dash: [4], dashPhase: 6 })

            // length description
            .text('length', cx - 15, cy + sw + 30)
            .line([
                [cx - sl, cy + sw + 10],
                [cx - sl, cy + sw + 20],
                [cx, cy + sw + 20],
                [cx, cy + sw + 10]
            ], { width: .5, lineCap: 'butt', color: '#ff00ff' })
            .line([
                [cx, cy + sw + 20],
                [cx + sl, cy + sw + 20],
                [cx + sl, cy + sw + 10]
            ], { width: .5, lineCap: 'butt' })

            // tail marker
            .line([
                [cx - sw, cy - 5],
                [cx - sw, cy + 5]
            ], { width: 2, lineCap: 'butt', color: '#ffffff' })
            .circle(cx - sw, cy, 3, { color: 'red' })
            .arrow(cx - sw - 4, cy + 5, { shaft: [50, .5], head: [10, 4], fill: '#000000', at: 'head', rotation: -45 })
            .text('"tail"', cx - 175, cy + 50, { color: '#000000' })

            // head marker
            .arrow(cx + hl + 3, cy, { shaft: [15, .5], head: [10, 4], fill: '#000000', at: 'head', rotation: 180 })
            .text('"head"', cx + sl + 35, cy - 5, { color: '#000000' });

        let uh = 360;
        let ux = 72;
        let uop = { size: 10, color: '#000000', textBox: { width: 500 } };
        recipe
            .text('Usage: recipe.arrow( x, y, [options] );', ux, uh, { bold: true, size: 10, color: '#000000' })
            .text('{number} x - x coordinate at center of the arrow which is also its rotation point', ux + 10, uh + 15, uop)
            .text('{number} y - y coordinate at center of the arrow which is also its rotation point', ux + 10, uh + 30, uop)
            .text('{number|number[ ]} [options.head=[10,10,0] - length, width and baseoffset of head of arrow.', ux + 10, uh + 45, uop)
            .text('{number|number[ ]} [options.shaft=10] - length & width of shaft of arrow.', ux + 10, uh + 60, uop)
            .text('{string} [options.at] - position and/or rotate at "head" or "tail" of arrow', ux + 10, uh + 75, uop)
            .text('{boolean} [options.double=false] - indicate double headed arrow production', ux + 10, uh + 90, uop)
            .text('Note that the circumscribed circle is for illustrative purposes and only naturally occurs when the shaft length is equal to arrowhead length, which is a property of the default arrow.',
                ux + 100, uh + 115, { color: '#961d17', textBox: { width: 300, textAlign: 'justify' } })

            // Examples
            .text('Examples:', 54, 135, { color: '#000000', bold: true })
            .arrow(72, 180, { head: 20, fill: 'def' })
            .arrow(110, 180, { head: 20, shaft: 0, fill: 'def' }) // arrow head only, no shaft
            .arrow(140, 180, { fill: 'red' })
            .arrow(160, 180, { fill: 'red', rotation: 180 })
            .arrow(160, 205, { head: [10, 10], type: 'dart', shaft: [20, 2], fill: '#000000' })
            .arrow(160, 215, { head: [10, 10, -5], shaft: [20, 2], fill: '#000000', rotation: 180, at: 'tail' })

            .text('position\nand rotate\nat "tail"', 40, 270, { size: 9, textBox: { width: 50, textAlign: 'center' } })
            .text('position\nand rotate\nat "head"', 135, 250, { size: 9, textBox: { width: 50, textAlign: 'center' } })

            .arrow(54, 220, { head: [10, 4], shaft: [20, .5], fill: '#000000', rotation: 0, at: 'tail' })
            .arrow(54, 220, { head: [10, 4], shaft: [30, .5], fill: '#ff0000', rotation: 22.5, at: 'tail' })
            .arrow(54, 220, { head: [10, 4], shaft: [20, .5], fill: '#000000', rotation: 45, at: 'tail' })
            .arrow(54, 220, { head: [10, 4], shaft: [30, .5], fill: '#ff0000', rotation: 67.5, at: 'tail' })
            .arrow(54, 220, { head: [10, 4], shaft: [20, .5], fill: '#000000', rotation: 90, at: 'tail' })

            .arrow(130, 240, { head: [10, 4], shaft: [20, .5], fill: '#000000', rotation: -90, at: 'head', debug: true })
            .arrow(130, 240, { head: [10, 4], shaft: [20, .5], fill: '#000000', rotation: -180, at: 'head' })
            .arrow(130, 240, { head: [10, 4], shaft: [20, .5], fill: '#000000', rotation: 45, at: 'head' })

            .arrow(130, 310, { head: [10, 3], shaft: [30, .5], double: true, fill: '#000000', rotation: 45 })
            .arrow(130, 310, { head: [10, 3], shaft: [30, .5], double: true, fill: '#000000', rotation: -45 })
            .text('double: true', 140, 305, { size: 9 });

        let x = 100;
        let y = 600;
        recipe
            .arrow(x, y - 20, { head: [10, 3], shaft: [100, .5], fill: '#000000', double: true, debug: true })
            .arrow(x + 5, y, { head: [10, 3], shaft: [100, .5], fill: '#000000', debug: true })
            .line([
                [x - 50, y - 3],
                [x - 50, y - 16]
            ], { width: .3, color: 'red' })
            .line([
                [x + 50, y - 3],
                [x + 50, y - 16]
            ], { width: .3, color: 'red' })
            .text('center differs between single & double headed arrows', 50, y - 60, { size: 9, textBox: { width: 100, textAlign: 'center' } });

        x = 306;
        y = 600;
        recipe
            .arrow(x, y - 40, { head: [10, 3], shaft: [100, .5], fill: '#000000', debug: true, at: 'head' })
            .arrow(x, y - 20, { head: [10, 3], shaft: [100, .5], fill: '#000000', debug: true })
            .arrow(x, y, { head: [10, 3], shaft: [100, .5], fill: '#000000', debug: true, at: 'tail' })
            .arrow(x, y + 10, { head: [10, 3], shaft: [100, .5], fill: '#000000', debug: true, at: 'tail', double: true })
            .text('@ "head"', x + 10, y - 45, { size: 10 })
            .text('@ center (default)', x + 65, y - 25, { size: 10 })
            .text('@ "tail"', x + 120, y - 5, { size: 10 })

            .endPage()
            .endPDF(done);
    });
});
