const path = require('path');
const HummusRecipe = require('../lib');

describe('Triangles', () => {
    it('SSS, SAS, ASA', (done) => {
        const output = path.join(__dirname, 'output/Add triangles.pdf');
        const recipe = new HummusRecipe('new', output);
        let x = 50;
        let y = 100;
        let txtOps = {color:'#000000', size: 10};
        recipe
            .createPage('letter')
            .line([[50,y],[550,y]],{color:'#aa',width:.5, opacity:.5})
            .line([[x,50],[x,700]],{color:'#aa',width:.5, opacity:.5})

            .triangle(x, y, [90,60,80], {width:.5, color:'blue', debug:true})
            .text('"SSS", (a,b,c)', x+15, y+21, txtOps)

            .triangle(x+200, y, [90,60,80], {width:.5,position:'b', flipY:true, color:'blue', debug:true})
            .text('flipY', x+140, y+21, txtOps)
            .triangle(x+250, y, [90,60,80], {width:.5,position:'b', color:'blue', debug:true, rotation:-20})
            .text('rotation: -20', x+260, y+21, {color:'#000000', size:10})
            .triangle(x+380, y, [90,60,80], {width:.5,position:'b', fill:'blue', debug:true});

        y = 250;
        let sas = [90,90,90];
        recipe
            .line([[50,y],[550,y]],{color:'#aa',width:.5, opacity:.5})
            .triangle(x, y, sas, {traitID:'sas', width:.5, color:'blue', debug:true})
            .text(`"SAS", (${sas[0]}, ${sas[1]}, ${sas[2]})`, x+15, y+21, txtOps )
            .text('(a,  <C,  b)',x+50, y+38, txtOps)
            .triangle(x+200, y, [50,90,50], {traitID:'sas', position:'b', rotation:-90, width:.5, color:'blue', debug:true})
            .text('rotation: -90', x+165, y+21, txtOps)
            .triangle(x+300, y, [50,20,60], {traitID:'sas', position:'b', width:.5, color:'blue', debug:true})
            .triangle(x+380, y, [50,20,60], {traitID:'sas', position:'b', width:.5, color:'blue', flipX: true, debug:true})
            .text('flipX', x+380, y-30, txtOps);
        y = 400;
        let asa = [90, 150, 20];
        recipe
            .line([[50,y],[550,y]],{color:'#aa',width:.5, opacity:.5})
            .triangle(x, y, asa, {traitID:'asa', width:.5, color:'blue', debug:true})
            .text(`"ASA", (${asa[0]}, ${asa[1]}, ${asa[2]})`, x+15, y+21, txtOps)
            .text('(<B,  c,  <A)', x+50, y+38, txtOps)
            .triangle(x+200, y, [40,80,50], {traitID:'asa', width:.5, color:'blue', debug:true})
            .triangle(x+350, y, [40,80,50], {traitID:'asa', width:.5, position:'c', flipX:true, color:'blue', debug:true})
            .text('position: "C"\nand flipX', x+340, y+21, txtOps)
            .triangle(x+450, y, [40,80,50], {traitID:'asa', width:.5, position:'c', flipX:true, rotation:45, color:'blue', debug:true})
            .text('position: "C"\nand flipX\nrotation: 45', x+450, y+21, txtOps);

        y = 550;
        recipe
            .line([[50,y],[550,y]],{color:'#aa',width:.5, opacity:.5})
            .triangle(x, y, [40,40,40], {traitID: 'sas', position: 'a', width:.5, color:'blue', debug:true})
            .text('position: "A"', x+20, y-63, txtOps)
            .arrow(x+34, y-48, {head:[10,5], shaft: [40,.5], fill: '#000000', rotation: 125, at:'tail'})
            .triangle(x+100, y, [40,60,40], {traitID: 'sas', position: 'centroid', width:.5, color:'blue', debug:true})
            .text('position:\n"centroid"', x+80, y+35, txtOps)
            .triangle(x+200, y, [70,60,50], {traitID: 'sas', position: 'circumcenter', width:.5, color:'blue', debug:true})
            .text('position:\n"circumcenter"', x+175, y+45, txtOps)
            .triangle(x+320, y, [70,60,50], {traitID: 'sas', position: 'incenter', width:.5, color:'blue', debug:true})
            .text('position:\n"incenter"', x+295, y+45, txtOps)
            .triangle(x+420, y, [70,60,50], {traitID: 'sas', position: 'incenter', rotation:30, width:.5, color:'blue', debug:true})
            .text('position:\n"incenter"\nrotation:30', x+395, y+45, txtOps);

        y = 700;
        recipe
            .line([[50,y],[550,y]],{color:'#aa',width:.5, opacity:.5})
            .rectangle(x, y-59, 51,59, {width: 1, rotation:15, color:'green', dash:[3], rotationOrigin:[x+24.5,y-29.5]})
            .circle(x+24.5,y-29.5, 2, {fill: 'green',width:1})
            .circle(x, y, 2, {color: 'red', width:.5})
            .triangle(x, y, [70,60,50], {traitID: 'sss', rotation:15, width:.5, color:'blue'})
            .text('NOTE: When no position point specified\nrotation occurs around bounding box center,\nnot at the given x,y coordinate.', x+80, y-50, {color:'red'})
            .text('rotation: 15', x, y+21, txtOps)
            .endPage()
            .endPDF(done);
    });
});
