const path = require('path');
const HummusRecipe = require('../lib');

describe('Text - Centering', () => {

    it('should horizontally center the text correctly with multiple font sizes', (done) => {
        const output = path.join(__dirname, 'output/Center Text.pdf');
        const recipe = new HummusRecipe('new', output);

        recipe
            .createPage('letter-size')
            .circle(30,220,2,{stroke:'red'})
            .text('Crusty', 30, 220, {
                color: '#000000',
                font: 'Arial',
                size: 12,
                textBox: {
                    width: 300,
                    textAlign: 'center',
                    padding: 0,
                    style: {
                        stroke: '#000000',
                        lineWidth:.5,
                        fill:'#ffffff'
                    }
                },
            })

            .circle(30,50,2,{stroke:'red'})
            .text('Dusty', 30, 50, {
                color: '#000000',
                font: 'Arial',
                size: 30,
                textBox: {
                    width: 300,
                    textAlign: 'center',
                    padding: 0,
                    style: {
                        stroke: '#000000',
                        lineWidth:.5,
                        fill:'#ffffff'
                    }
                },
            })

            .circle(30,120,2,{stroke:'red'})
            .text('{o}', 30, 120, {
                color: '#000000',
                font: 'Arial',
                size: 70,
                opacity: .6,
                textBox: {
                    width: 300,
                    textAlign: 'center',
                    padding: [0,0,0,0],
                    style: {
                        stroke: '#000000',
                        lineWidth:.5,
                        fill:'#ffff00'
                    }
                },

            })

            .circle(30,260,2,{stroke:'red'})
            .text('A\nAAA\nOOO\nVVV\n{0}', 30, 260, {
                color: '#000000',
                font: 'Arial',
                size: 20,
                textBox: {
                    width: 300,
                    textAlign: 'center',
                    padding: 0,
                    style: {
                        fill:'#ffff00'
                    }
                },
            });

        let fs = 20;
        recipe
            .text('<-- Note, using padding of 2\n      puts marker dots inside fill.', 340, 455)
            .text('<-- Text with line height applied\n            (1.16% font size).', 340, 490)
            .text('A\nAAA\nOOO\nVVV\n|', 30, 400, {
                color: '#000000',
                font: 'Arial',
                size: fs,
                textBox: {
                    width: 300,
                    textAlign: 'center',
                    padding: 2,
                    lineHeight: 1.16*fs, // percentage of font size
                    style: {
                        fill:'default'
                    }
                },
            })
            .circle(30,400,2,{stroke:'red'})
            .circle(330,400,2,{stroke:'red'})

            .line([[180,25],[180,425]],{stroke:'#ff00ff',lineWidth:.5});

        let x = 450;
        let y = 100;
        let w, h, p;

        recipe.text('Rotation should occur\naround red dot below.', 400, 50);
        recipe.circle(x,y,2,{stroke:'red'});

        for (let angle = 5; angle <= 45; angle+=5) {
            recipe.text('{o}', x,y, {
                color: '#000000',
                font: 'Arial',
                size: 70,
                opacity: .6,
                rotation: angle,
                textBox: {
                    width: 140,
                    textAlign: 'center',
                    padding: [0,0,0,0],
                    style: {
                        stroke: '#000000',
                        lineWidth:1,
                        fill:'#ffff00'
                    }
                },
            });
        }

        x = 450;
        y = 280;
        w = 70;
        p = 8;
        h = 28;
        recipe
            .text(`[${p},0,0,0]`, x+10, y-25)
            .text(`TOP\nPad ${p}`, x, y, {
                color: '#000000',
                textBox: {
                    width: w,
                    textAlign: 'center',
                    padding: [p,0,0,0],
                    style: {
                        stroke: '#000000',
                        lineWidth:.5,
                        fill: '#ffff00'
                    }
                }
            })
            .line([[x-5,y+p],[x+w+5,y+p]], {lineWidth: .5, stroke: 'red', lineCap: 'butt'})
            .circle(x,y,2,{stroke:'red'});

        y = 400;
        recipe
            .text(`[0,0,${p},0]`, x+10, y-17)
            .text(`BOTTOM Pad ${p}`, x, y, {
                color: '#000000',
                textBox: {
                    width: w,
                    textAlign: 'center bottom',
                    padding: [0,0,p,0],
                    style: {
                        stroke: '#000000',
                        lineWidth:.5,
                        fill: '#ffff00'
                    }
                }
            })
            .line([[x-5,y+h],[x+w+5,y+h]], {lineWidth: .5, stroke: 'red', lineCap: 'butt'})
            .circle(x,y,2,{stroke:'red'});

        x = 500;
        y = 340;
        recipe
            .text(`[0,${p},0,0]`, x+10, y-17)
            .text(`RIGHT Pad ${p}`, x, y, {
                color: '#000000',
                textBox: {
                    width: w,
                    textAlign: 'right',
                    padding: [0,p,0,0],
                    style: {
                        stroke: '#000000',
                        lineWidth:.5,
                        fill: '#ffff00'
                    }
                }
            })
            .line([[x+w-p,y-5],[x+w-p,y+h+5]], {lineWidth: .5, stroke: 'red', lineCap: 'butt'})
            .circle(x,y,2,{stroke:'red'});

        x = 400;
        recipe
            .text(`[0,0,0,${p}]`, x+10, y-17)
            .text(`LEFT\nPad ${p}`, x, y, {
                color: '#000000',
                textBox: {
                    width: w,
                    textAlign: 'left',
                    padding: [0,0,0,p],
                    style: {
                        stroke: '#000000',
                        lineWidth:.5,
                        fill: '#ffff00'
                    }
                }
            })
            .line([[x+p,y-5],[x+p,y+h+5]], {lineWidth: .5, stroke: 'red', lineCap: 'butt'})
            .circle(x,y,2,{stroke:'red'});

        recipe
            .text('Using horizontal "justify" setting with default "top" vertical setting, no height.', 40, 535, {
                color: '#000000',
                textBox: {
                    width: 130,
                    textAlign: 'justify',
                    style: {
                        stroke: '#ffff00',
                        lineWidth:.5,
                    }
                }
            })

            .text('... now with "justify center" setting and specific height', 180, 535, {
                textBox: {
                    width: 130,
                    height: 70,
                    textAlign: 'justify center',
                    style: {
                        stroke: '#ff0000',
                        lineWidth:.5,
                    }
                }
            })

            .text('... finally, using "justify bottom" setting with specific height', 320, 535, {
                color: 'blue',
                textBox: {
                    width: 140,
                    height: 70,
                    textAlign: 'justify bottom',
                    style: {
                        stroke: '#ff00ff',
                        lineWidth:.5,
                    }
                }
            })

            .text('Oh, wait a minute. How about a justification view without any box drawn. It gives you the sense of an old fashioned newspaper column.', 470, 535, {
                color: '#000000',
                size: 10,
                textBox: {
                    width: 120,
                    height: 70,
                    textAlign: 'justify',
                }
            });

        h = 70;
        recipe
            .circle(40,625,2,{stroke:'red'})
            .text('text box without\nheight or\nminHeight\n setting\nauto fits text', 40, 625, {
                color: '#000000',
                textBox: {
                    width: 100,
                    textAlign: 'center',
                    style: {
                        stroke: '#000000',
                        lineWidth:.5,
                    }
                }
            })
            .circle(150,625,2,{stroke:'red'})
            .circle(150,625+h,2,{stroke:'red'})
            .text(`minHeight: ${h}\nBox will not collapse when not enough text to fill it. It will auto grow when text exceeds minHeight.`, 150, 625, {
                color: '#000000',
                size: 9,
                textBox: {
                    width: 100,
                    minHeight: h,
                    style: {
                        stroke: '#000000',
                        lineWidth:.5,
                    }
                }
            })
            .text('text at\ncenter center', 265, 625,{
                color: '#000000',
                textBox: {
                    width: 100,
                    minHeight: h,
                    textAlign: 'center center',
                    style: {
                        stroke: '#000000',
                        lineWidth:.5,
                    }
                }
            })
            .text('text at\ncenter bottom', 380, 625,{
                color: '#000000',
                textBox: {
                    width: 100,
                    minHeight: h,
                    textAlign: 'center bottom',
                    style: {
                        stroke: '#000000',
                        lineWidth:.5,
                    }
                }
            })
            .text('text at\nright bottom', 500, 625,{
                color: '#000000',
                textBox: {
                    width: 100,
                    minHeight: h,
                    textAlign: 'right bottom',
                    style: {
                        stroke: '#000000',
                        lineWidth:.5,
                    }
                }
            })
            .text('This is what happens when you use "height" and have too much text', 40, 725,{
                color: '#000000',
                textBox: {
                    width: 125,
                    height: 40,
                    // textAlign: 'right bottom',
                    // textAlign: 'justify',
                    style: {
                        stroke: '#000000',
                        lineWidth:.5,
                    }
                }
            })
            .text('Using height and supplying textAlign: center center', 180, 725,{
                color: '#000000',
                textBox: {
                    width: 120,
                    height: 40,
                    textAlign: 'center center',
                    style: {
                        stroke: '#000000',
                        lineWidth:.5,
                    }
                }
            })
            .text('Using "height" and supplying textAlign: right bottom', 310, 725,{
                color: '#000000',
                textBox: {
                    width: 100,
                    height: 40,
                    textAlign: 'right bottom',
                    style: {
                        stroke: '#000000',
                        lineWidth:.5,
                    }
                }
            })
            .text('Showing text with\nellipsis when wrap\ndisabled on the last line', 440, 725, {
                color: '#000000',
                size: 10,
                textBox: {
                    width: 100,
                    height: 40,
                    wrap: 'ellipsis',
                    style: {
                        stroke: '#000000',
                        lineWidth:.5,
                    }
                }
            });

        recipe.endPage();
        recipe.endPDF(done);
    });

});
