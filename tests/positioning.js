const path = require('path');
const HummusRecipe = require('../lib');
const hummus = require('hummus');

function frame(recipe, left, top, width, height) {
    const cut = 8;
    const options = {color:"#00ff00",width:1};
    const bottom = top+height;
    const right = left+width;
    recipe.line([[left-cut,top],[right+cut, top]],options);         // top 
    recipe.line([[left-cut,bottom],[right+cut, bottom]],options);   // bottom 
    recipe.line([[left,top-cut],[left,bottom+cut]],options);        // left 
    recipe.line([[right,top-cut],[right,bottom+cut]],options);      // right 
}

function markOrigin(recipe, cx, cy) {
    recipe.circle(cx, cy, 5, {stroke:"#ff0000", width:1})
}

describe('Graphic Object Positioning', () => {
    
    // Tests the explicit setting of the global default RGB colorspace

    it('Location, location...', (done) => {
        const output = path.join(__dirname, 'output/positioning.pdf');
        const recipe = new HummusRecipe('new', output, {
            colorspace: 'rgb'
        });
        const col = [0,90,205,320,435]
        const row = [0,90,205,320,435,550 ]
        const wid = [80,195]
        const hgt = [80]
        const triangle = (col,row) => { return [
            [ col+wid[0]/2, row ],
            [ col+wid[0], row+hgt[0] ],
            [ col, row+hgt[0] ]]
        };

        recipe.createPage('letter-size');
        
        for (let i = 1; i <= 4; i++) {
            frame(recipe,col[1],row[i],wid[0],hgt[0]);
            frame(recipe,col[2],row[i],wid[0],hgt[0]);
            frame(recipe,col[3],row[i],wid[0],hgt[0]);  
            frame(recipe,col[4],row[i],wid[0],hgt[0]);            
        }

        frame(recipe,col[1],row[5],wid[1],hgt[0]);
        frame(recipe,col[3],row[5],wid[1],hgt[0]);

        recipe
        .rectangle(col[1],row[1],wid[0],hgt[0], {width:1})
        .rectangle(col[2],row[1],wid[0],hgt[0], {width:2})
        .rectangle(col[3],row[1],wid[0],hgt[0], {width:3})
        .rectangle(col[4],row[1],wid[0],hgt[0], {width:5})

        .circle(col[1]+wid[0]/2, row[2]+hgt[0]/2, wid[0]/2, {width:1})
        .circle(col[2]+wid[0]/2, row[2]+hgt[0]/2, wid[0]/2, {width:2})
        .circle(col[3]+wid[0]/2, row[2]+hgt[0]/2, wid[0]/2, {width:3})
        .circle(col[4]+wid[0]/2, row[2]+hgt[0]/2, wid[0]/2, {width:5})

        .polygon(triangle(col[1], row[3]), {width:1})
        .polygon(triangle(col[2], row[3]), {width:2})
        .polygon(triangle(col[3], row[3]), {width:3})
        .polygon(triangle(col[4], row[3]), {width:5})

        .line([ [ col[1], row[4] ], [ col[1]+wid[0], row[4]+hgt[0] ] ], {width:1})
        .line([ [ col[2], row[4] ], [ col[2]+wid[0], row[4]+hgt[0] ] ], {width:2})
        .line([ [ col[3], row[4] ], [ col[3]+wid[0], row[4]+hgt[0] ] ], {width:3})
        .line([ [ col[4], row[4] ], [ col[4]+wid[0], row[4]+hgt[0] ] ], {width:5})

        .ellipse(col[1]+wid[1]/2, row[5]+hgt[0]/2, wid[1]/2, hgt[0]/2, {width:1})
        .ellipse(col[3]+wid[1]/2, row[5]+hgt[0]/2, wid[1]/2, hgt[0]/2, {width:5})

        .text('Note, object growth outside cut frames with increasing line widths', 100, 40)
        .text( '*', 80, 50, {color:"ff0000", fontSize:32})

        .text( '*', col[1]-20, row[3]+hgt[0]/2, {color:"ff0000", fontSize:32})
        .text( '*', col[1]-20, row[4]+hgt[0]/2, {color:"ff0000", fontSize:32})
       
        .endPage()
        .endPDF(done);
    });

    it('Rotation', (done) => {
        const output = path.join(__dirname, 'output/objectRotation.pdf');
        const recipe = new HummusRecipe('new', output, {
            colorspace: 'rgb'
        });
        const defOrigColor = "#ff00ff";
        const col = [0,90,205,320,435]
        const row = [0,90,205,320,435,550 ]
        const wid = [80,195]
        const hgt = [80]
        const triangle = (col,row) => { return [
            [ col+wid[0]/2, row ],
            [ col+wid[0], row+hgt[0] ],
            [ col, row+hgt[0] ]]
        };

        recipe.createPage('letter-size');
        
        for (let i = 1; i <= 2; i++) {
            frame(recipe,col[1],row[i],wid[0],hgt[0]);
            frame(recipe,col[2],row[i],wid[0],hgt[0]);
            frame(recipe,col[3],row[i],wid[0],hgt[0]);  
            frame(recipe,col[4],row[i],wid[0],hgt[0]);            
        }

        for (let i = 3; i <= 5; i++) {
            frame(recipe,col[1],row[i],wid[1],hgt[0]);
            frame(recipe,col[3],row[i],wid[1],hgt[0]);
        }

        top = (r) => {return r}
        lft = (c) => {return c}
        rht = (c,w=wid[0]) => {return c+w}
        btm = (r) => {return r+hgt[0]}

        recipe
            .rectangle(col[1],row[1],wid[0],hgt[0], {width:1, rotation:10, stroke: defOrigColor})
            .rectangle(col[2],row[1],wid[0],hgt[0], {width:1, rotation:10, rotationOrigin:[lft(col[2]), top(row[1])] })
            .rectangle(col[3],row[1],wid[0],hgt[0], {width:1, rotation:10, rotationOrigin:[rht(col[3]), top(row[1])] })
            .rectangle(col[4],row[1],wid[0],hgt[0], {width:1, rotation:10, rotationOrigin:[rht(col[4]), btm(row[1])] });
        
        markOrigin(recipe, lft(col[1]), btm(row[1]));
        markOrigin(recipe, lft(col[2]), top(row[1]));
        markOrigin(recipe, rht(col[3]), top(row[1]));
        markOrigin(recipe, rht(col[4]), btm(row[1]));
        
        recipe
            .polygon(triangle(col[1], row[2]), {width:1, rotation:10, stroke: defOrigColor})
            .polygon(triangle(col[2], row[2]), {width:1, rotation:10, rotationOrigin:[lft(col[2]), btm(row[2])] })
            .polygon(triangle(col[3], row[2]), {width:1, rotation:10, rotationOrigin:[lft(col[3])+wid[0]/2, top(row[2])] })
            .polygon(triangle(col[4], row[2]), {width:1, rotation:10, rotationOrigin:[rht(col[4]), btm(row[2])] });

        markOrigin(recipe, lft(col[1])+wid[0]/2, top(row[2]+hgt[0]/2));
        markOrigin(recipe, lft(col[2]), btm(row[2]));
        markOrigin(recipe, lft(col[3])+wid[0]/2, top(row[2]));
        markOrigin(recipe, rht(col[4]), btm(row[2]));

        recipe
        
            .ellipse(col[1]+wid[1]/2, row[3]+hgt[0]/2, wid[1]/2, hgt[0]/2, {width:1, rotation:10, stroke: defOrigColor})
            .ellipse(col[3]+wid[1]/2, row[3]+hgt[0]/2, wid[1]/2, hgt[0]/2, {width:1, rotation:10, rotationOrigin:[lft(col[3]), btm(row[3])]})
            .ellipse(col[1]+wid[1]/2, row[4]+hgt[0]/2, wid[1]/2, hgt[0]/2, {width:1, rotation:10, rotationOrigin:[rht(col[1],wid[1]), top(row[4])]})
            .ellipse(col[3]+wid[1]/2, row[4]+hgt[0]/2, wid[1]/2, hgt[0]/2, {width:1, rotation:10, rotationOrigin:[lft(col[3]), top(row[4])]})
            .ellipse(col[1]+wid[1]/2, row[5]+hgt[0]/2, wid[1]/2, hgt[0]/2, {width:1, rotation:10, rotationOrigin:[rht(col[1],wid[1]), btm(row[5])]})

        markOrigin(recipe, col[1]+wid[1]/2, row[3]+hgt[0]/2);
        markOrigin(recipe, lft(col[3]), btm(row[3]));
        markOrigin(recipe, rht(col[1],wid[1]), top(row[4]));
        markOrigin(recipe, lft(col[3]), top(row[4]));
        markOrigin(recipe, rht(col[1],wid[1]), btm(row[5]));

        markOrigin(recipe,50,40);

        recipe
            .text('Marks rotation origin.', 60, 45)
            .text('This color marks object with default rotation origin.', 200, 45, {color: defOrigColor})
            .endPage()
            .endPDF(done);
    });
});
