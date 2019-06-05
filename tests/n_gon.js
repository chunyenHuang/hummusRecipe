const path = require('path');
const HummusRecipe = require('../lib');

describe('N-gon', () => {
    it('Add N sided regular polygons', (done) => {
        const output = path.join(__dirname, 'output/Add N-gons.pdf');
        const recipe = new HummusRecipe('new', output);
        const rota = {stroke: "#ff0000", opacity:.3,  rotation:45, debug:1}
        const nops = {stroke: "#ff0000", opacity:.3,  rotation:0, debug:1}
        recipe
            .createPage('letter-size')
            .n_gon(200, 100, 50,  3, nops)
            .n_gon(200, 100, 50,  3, rota)
            .n_gon(300, 100, 50,  4, nops)
            .n_gon(300, 100, 50,  4, rota)
            .n_gon(400, 100, 50,  5, nops)
            .n_gon(400, 100, 50,  5, rota)
            .n_gon(200, 220, 50,  6, nops)
            .n_gon(200, 220, 50,  6, {opacity:.3,  rotation:30, debug:1})
            .n_gon(300, 220, 50,  7, nops)
            .n_gon(300, 220, 50,  7, rota)
            .n_gon(400, 220, 50,  8, nops)
            .n_gon(400, 220, 50,  8, rota)
            .n_gon(200, 340, 50, 50, nops)  // basically a circle at this point
            .n_gon(200, 340, 50, 50, rota)
            .text('All polygon vertices should be inside reference circle.', 150, 650)
            .endPage()
            .endPDF(done);
    });

    it('Add N pointed stars', (done) => {
        const input = path.join(__dirname, 'output/Add N-gons.pdf');
        const output = input
        const recipe = new HummusRecipe(input, output);
        recipe
            .editPage(1)
            .star(300, 340, 50,     {fill: "#0000ff", })
            .star(400, 340, 50,  6, {fill: "#0000ff",  opacity:.3, rotation:30})
            .star(200, 450, 50,  7)
            .star(300, 450, 50,  8, {fill: "#0000ff",  opacity:.3})
            .star(400, 450, 50,  9, {fill: "#0000ff",  opacity:.3})
            .star(200, 560, 50, 10, {fill: "#0000ff",  opacity:.3})
            .star(300, 560, 50, 11, {fill: "#0000ff",  opacity:.3})
            .star(400, 560, 50, 40)
            .endPage()
            .endPDF(done);
    });
});
