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
                size: 30,
                textBox: {
                    width: 300,
                    textAlign: 'center',
                    padding: 0,
                    style: {
                        fill:'#ffff00'
                    }
                },
            })

            .text('<-- Note, using padding of\n      2 puts dots inside fill.', 340, 475)
            .text('<-- Text with line height applied\n            (1.16% font size).', 340, 525)
            .text('A\nAAA\nOOO\nVVV\n|', 30, 425, {
                color: '#000000',
                font: 'Arial',
                size: 30,
                textBox: {
                    width: 300,
                    textAlign: 'center',
                    padding: 2,
                    lineHeight: 1.16*30, // percentage of font size
                    style: {
                        fill:'default'
                    }
                },
            })
            .circle(30,425,2,{stroke:'red'})
            .circle(330,425,2,{stroke:'red'})

            .line([[180,25],[180,425]],{stroke:'#ff00ff',lineWidth:.5});

        let x = 450;
        let y = 100;
        let w, h, p;

        recipe.text('Rotation should occur\naround red dot below.', 400, 50)
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
                        fill: "#ffff00"
                    }
                }
            })
            .line([[x-5,y],[x+w+5,y]], {lineWidth: .5, stroke: 'red'})
            .circle(x,y,2,{stroke:'red'});

        y = 400;
        recipe
            .text(`[0,0,${p},0]`, x+10, y-17)
            .text(`BOTTOM Pad ${p}`, x, y, {
                color: '#000000',
                textBox: {
                    width: w,
                    textAlign: 'center',
                    padding: [0,0,p,0],
                    style: {
                        stroke: '#000000',
                        lineWidth:.5,
                        fill: "#ffff00"
                    }
                }
            })
            .line([[x-5,y+h],[x+w+5,y+h]], {lineWidth: .5, stroke: "#ff0000"})
            .circle(x,y,2,{stroke:'red'});

        x = 500;
        y = 340
        recipe
            .text(`[0,${p},0,0]`, x+10, y-17)
            .text(`RIGHT Pad ${p}`, x, y, {
                    color: '#000000',
                    textBox: {
                        width: w,
                        textAlign: 'center',
                        padding: [0,p,0,0],
                        style: {
                            stroke: '#000000',
                            lineWidth:.5,
                            fill: "#ffff00"
                        }
                    }
                })
            .line([[x+w,y-5],[x+w,y+h+5]], {lineWidth: .5, stroke: 'red'})
            .circle(x,y,2,{stroke:'red'});

        x = 400;
        recipe
            .text(`[0,0,0,${p}]`, x+10, y-17)
            .text(`LEFT\nPad ${p}`, x, y, {
                color: '#000000',
                textBox: {
                    width: w,
                    textAlign: 'center',
                    padding: [0,0,0,p],
                    style: {
                        stroke: '#000000',
                        lineWidth:.5,
                        fill: "#ffff00"
                    }
                }
            })
            .line([[x,y-5],[x,y+h+5]], {lineWidth: .5, stroke: 'red'})
            .circle(x,y,2,{stroke:'red'});
        

        h = 70;
        recipe
            .circle(40,625,2,{stroke:'red'})
            .text(`text box without\nminHeight\n setting`, 40, 625, {
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
            .text(`minHeight: ${h}`, 150, 625, {
                color: '#000000',
                textBox: {
                    width: 100,
                    minHeight: h,
                    textAlign: 'center',
                    style: {
                        stroke: '#000000',
                        lineWidth:.5,
                    }
                }
            })

        recipe.endPage();
        recipe.endPDF(done);
    });

});
