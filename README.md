# Hummus Recipe

[![Greenkeeper badge](https://badges.greenkeeper.io/chunyenHuang/hummusRecipe.svg)](https://greenkeeper.io/)

This is an easy recipe for [HummusJS](https://github.com/galkahana/HummusJS) with a high level class.

I hope this repo will bring more attentions from the community to help [HummusJS](https://github.com/galkahana/HummusJS) to grow faster. Please visit and fork [HummusJS](https://github.com/galkahana/HummusJS).

## GetStarted

### Create a new PDF

```javascript
const HummusRecipe = require('hummus-recipe');
const pdf = new HummusRecipe('new', 'output.pdf');
pdf
    // create the 1st page with width and height
    .createPage(1920, 1080)
    // draw a rectangle
    .rectangle(20, 20, 40, 100, { color: '#d23421', lineWidth: 5})
    // draw a polygon
    .polygon([ [31, 31], [31, 532], [45, 780], [90, 300], [31,31] ])
    // draw a circle
    .circle(150, 300, 20, { stroke: '#3b7721', fill: '#eee000', lineWidth:3 })
    // draw lines
    .moveTo(300, 300)
    .lineTo(400, 450)
    .lineTo(400, 600)
    // write a text
    .text('asdjflkasdjfl;ads', 100, 100, {size: 14, underline: true})
    // write a comment annotation
    .comment('yoyoyo', 50, 50)
    .endPage()

    // create a 2nd page
    .createPage(600, 300)
    .circle(150, 150, 300)
    .endPage()
    // write to disk
    .endPDF(()=>{
        // done!
    });
```

### Modify an existing PDF

```javascript
const HummusRecipe = require('hummus-recipe');
const pdf = new HummusRecipe('input.pdf', 'output.pdf');
pdf
    .editPage(1)
    .text('Add some texts to an existing pdf file', 150, 300)
    .rectangle(20, 20, 40, 100)
    .comment('Add 1st comment annotaion', 200, 300)
    .endPage()

    .editPage(2)
    .comment('Add 2nd comment annotaion', 200, 100)
    .endPage()

    .endPDF(()=>{
        // done!
    });
```