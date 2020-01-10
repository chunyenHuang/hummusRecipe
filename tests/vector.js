const path = require('path');
const HummusRecipe = require('../lib');

describe('Vector', () => {
    it('Add vectors', (done) => {
        const src = path.join(__dirname, 'materials/test.pdf');
        const output = path.join(__dirname, 'output/Add vectors.pdf');
        const recipe = new HummusRecipe(src, output);
        const {
            width,
            height
        } = recipe.pageInfo(1);
        recipe
            .editPage(1)
            .rectangle(0, 0, width, height, {
                color: [255, 0, 0],
                opacity: 0.1
            })
            .rectangle(500, 50, 50, 50, {
                fill: [255, 0, 0],
                skewY: -20
            })
            .rectangle(500, 50, 50, 50, {
                color: [255, 0, 255],
                opacity: 0.2
            })
            .rectangle(500, 150, 50, 50, {
                color: [255, 0, 255],
                opacity: 0.4
            })
            .rectangle(500, 250, 50, 50, {
                fill: [255, 0, 255],
                opacity: 0.6,
                skewX: 10
            })
            .rectangle(500, 250, 50, 50, {
                color: [255, 0, 255],
                opacity: 0.6
            })
            .rectangle(500, 350, 50, 50, {
                color: '#3252d3',
                stroke: '#084323',
                lineWidth: 10,
                dash: [5, 5]
            })
            .rectangle(500, 450, 50, 50, {
                color: [255, 0, 255],
                opacity: 0.6
            })
            .rectangle(475, 475, 50, 50, {
                opacity: 0.3,
                fill: [255, 0, 0],
                stroke: [255, 0, 255]
            })
            .rectangle(475, 475, 50, 50, {
                opacity: 0.3,
                lineWidth: 5,
                fill: [255, 255, 255],
                stroke: [255, 0, 255]
            })
            .rectangle(525, 475, 50, 50, {
                opacity: 0.8,
                lineWidth: 3,
                stroke: [255, 0, 255],
                dash: [5, 5]
            })
            .circle('center', 150, 60, {
                stroke: '#3b7721',
                fill: '#0e0e0e',
                opacity: 0.4
            })
            .circle('center', 150, 30, {
                stroke: '#0032FF',
                dash: [5, 5]
            })
            .circle(400, 250, 20, {color:'#00ff00'})
            .circle(400, 250, 20, {skewX:30})
            .circle(400, 250, 20, {skewY:-20})
            .ellipse(100, 650, 30, 10)
            .ellipse(100, 650, 30, 10, {skewY: 30, fill:'#00ff00', opacity:.2, stroke:'#ff0000', width:1})
            .rectangle(10, 320, 80, 100, {borderRadius:5})
            .rectangle(15, 325, 70, 90, {borderRadius:[5,10], stroke:'#00ff00'})
            .rectangle(20, 330, 60, 80, {borderRadius:[20,10,5], fill:'#ff00ff'})
            .polygon([
                [0, 0],
                [0, 300],
                [200, 300]
            ], {
                fill: '#000000',
                stroke: '#00ff00',
                opacity: 0.2
            })
            .polygon([
                [100, 300],
                [200, 300],
                [100, 100]
            ], {
                fill: '#ff0000',
                stroke: '#ff0000',
                opacity: 0.5
            })
            .polygon([
                [60, 60],
                [60, 300],
                [200, 300]
            ], {
                fill: '#00d2ff',
                stroke: '#033002',
                opacity: 0.35,
                dash: [12, 12]
            })
            .polygon([
                [300, 300],
                [450, 600],
                [150, 600]
            ], {
                fill: '#0000ff',
                stroke: '#0000ff',
                opacity: 0
            })
            .polygon([
                [300, 300],
                [450, 600],
                [150, 600]
            ], {
                stroke: '#ff0000',
                skewY: 20
            })
            .polygon([
                [250, 650],
                [350, 680],
                [300, 700],
                [550, 700],
                [580, 750],
                [250, 750],
            ], {
                fill: '#0000ff',
                stroke: '#0000ff',
                opacity: 0.75
            })
            .line([
                [20, 20],
                [60, 20],
                [60, 40],
                [80, 60],
                [0, 60],
                [20, 40]
            ], {
                lineWidth: 10,
                dash: [0, 0]
            });
        let x = 175;
        let y = 11;
        let h = 20;
        recipe
            .text('lineCaps:', 100, 5+h)
            .line([[x,y], [x+20,y]], {lineWidth: 10, lineCap:'butt'})
            .text('butt', x+30, 5, {color:'red'})
            .line([[x,y+20], [x+20,y+20]], {lineWidth: 10, lineCap:'round'})  // default
            .text('round',x+30, 5+h, {color:'green'})
            .line([[x,y+40], [x+20,y+40]], {lineWidth: 10, lineCap:'square'})
            .text('square', x+30, 5+2*h, {color:'red'});

        x=300;
        y=10;
        recipe
            .polygon([[x,y+10],   [x+20,y+30], [x, y+50]], {lineWidth: 8, lineJoin:'miter', miterLimit:3})
            .text('miter', x-3,70,{rotation:-45, color:'red' })
            .polygon([[x+40,y+10],[x+60,y+30], [x+40, y+50]], {lineWidth: 8, lineJoin:'round'})  // default
            .text('round', x+37,70,{rotation:-45, color:'green' })
            .polygon([[x+80,y+10],[x+100,y+30], [x+80, y+50]], {lineWidth: 8, lineJoin: 'bevel'})
            .text('bevel', x+77,70,{rotation:-45, color:'red' })
            .text(':lineJoins', 415, 33)
            .endPage()
            .endPDF(done);
    });
});
