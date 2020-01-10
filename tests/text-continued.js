const path = require('path');
const HummusRecipe = require('../lib');

describe('Text - Continued', () => {

    it('Simple text segmentation', (done) => {
        const output = path.join(__dirname, 'output/continued-text.pdf');
        const recipe = new HummusRecipe('new', output);
        const lorem = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. \
Etiam in suscipit purus. Vestibulum ante ipsum primis in faucibus orci luctus \
et ultrices posuere cubilia Curae; Vivamus nec hendrerit felis. Morbi aliquam \
facilisis risus eu lacinia. Sed eu leo in turpis fringilla hendrerit. \
Ut nec accumsan nisl. Suspendisse rhoncus nisl posuere tortor tempus et dapibus \
elit porta. Cras leo neque, elementum a rhoncus ut, vestibulum non nibh. \
Phasellus pretium justo turpis. Etiam vulputate, odio vitae tincidunt ultricies, \
eros odio dapibus nisi, ut tincidunt lacus arcu eu elit. Aenean velit erat, vehicula \
eget lacinia ut, dignissim non tellus. Aliquam nec lacus mi, sed vestibulum nunc. \
Suspendisse potenti. Curabitur vitae sem turpis. Vestibulum sed neque eget dolor dapibus \
porttitor at sit amet sem. Fusce a turpis lorem. Vestibulum ante ipsum primis in \
faucibus orci luctus et ultrices posuere cubilia Curae;';

        let x = 72;
        let y = 52;
        recipe
            .createPage('letter')
            .line([[540,10],[540,300]],{lineWidth:.5})
            .line([[72,72],[560,72]],{lineWidth:.5})
            .text(lorem.slice(0, 500),{rotation:0,opacity:1,textBox:{textAlign:'justify'}})
            .text(lorem.slice(500,510),{color:'red', hilite:true})
            .text(lorem.slice(510),{color:'green',hilite:false})
            .text('',{flow:false})
            .text('Simple Text Flow, 3 segments, showing color change and hilite',x,y,{color:'#000000'});

        x = 72;
        y = 300;
        let w = 200;
        let p = 4;
        recipe
            .text(`This is a text box with a padding of ${p}, `, x,y,
                {flow:true, hilite:true, textBox:{padding:p ,width: w, textAlign:'center'}})
            .text('with round box corners (standard radius is 5) ',
                {color:'red', hilite:false})
            .movedown(2)
            .text('Did a movedown(2) to get ', {color:'blue', hilite:true})
            .text('text to this spot in box. Notice the text hiliting, which is different from "fill" for the text box. ',
                {color:'green', size:14})
            .text('It can have different colors, with yellow being the default at opacity .5. See blue higlight below')
            .movedown(2)
            .text('Box was constructed with multiple text statements without specifying any x,y coordinates. ',
                {color:'blue', hilite:{color:'#81e6ff'}})
            .movedown()
            .text('Notice, here is a change in font size. ', {size:20,color:'#ff00ff',hilite:false})
            .text('',{flow:false, textBox:{style:{lineWidth:1, stroke:'red', borderRadius:true}}});

        recipe
            .text('We can still handle rotation along',350, y+75,
                {hilite:{opacity:.9}, rotation:-30, flow:true,
                    textBox:{padding:5,width:100, textAlign:'center',
                        style:{stroke:'black', fill:'#9de3f2', borderRadius:true}}})
            .text('with text background fill coloring, and text centering.', {hilite:false})
            .text('', {flow:false});

        recipe.endPage();
        recipe.endPDF(done);
    });
});
