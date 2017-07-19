[![NPM version](http://img.shields.io/npm/v/hummus.svg?style=flat)](https://www.npmjs.org/package/hummus-recipe)
[![Build Status](https://travis-ci.org/chunyenHuang/hummusRecipe.svg?branch=master)](https://travis-ci.org/chunyenHuang/hummusRecipe)
# Hummus Recipe

This is an easy recipe for [HummusJS](https://github.com/galkahana/HummusJS) with a high level class.

I hope this repo will bring more attentions from the community to help [HummusJS](https://github.com/galkahana/HummusJS) to grow faster. 

This repo is still under construction. Feel free to open issues in here or in [HummusJS](https://github.com/galkahana/HummusJS).

## GetStarted

```bash
npm i hummus-recipe --save
```

### Create a new PDF

```javascript
const HummusRecipe = require('hummus-recipe');
const pdfDoc = new HummusRecipe('new', 'output.pdf');
pdfDoc
    // 1st Page
    .createPage('letter-size')
    .circle('center', 100, 30, { stroke: '#3b7721', fill: '#eee000' })
    .polygon([
        [50, 250],
        [100, 200],
        [512, 200],
        [562, 250],
        [512, 300],
        [100, 300],
        [50, 250]
    ], {
        color: [153, 143, 32],
        lineWidth: 5
    })
    .rectangle(240, 400, 50, 50, {
        color: [255, 0, 255]
    })
    .rectangle(322, 400, 50, 50, {
        stroke: [0, 0, 140],
        width: 6
    })
    .rectangle(240, 476, 50, 50, {
        fill: [255, 0, 0]
    })
    .rectangle(322, 476, 50, 50, {
        stroke: '#3b7721',
        fill: '#eee000'
    })
    .moveTo(200, 600)
    .lineTo('center', 650)
    .lineTo(412, 600)
    .text('Welcome to Hummus-Recipe', 'center', 250, {
        color: '066099',
        fontSize: 30,
        align: 'center center'
    })
    .comment('Feel free to open issues to help us!', 'center', 100)
    .endPage()
    // 2nd page
    .createPage('A4', 90)
    .circle(150, 150, 300)
    .endPage()
    .endPDF(done);
```

### Modify an existing PDF

```javascript
const HummusRecipe = require('hummus-recipe');
const pdfDoc = new HummusRecipe('input.pdf', 'output.pdf');
pdfDoc
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

### Options

#### Vector Options

```bash
    color: HexColor or RGB
    storke: HexColor or RGB
    fill: HexColor or RGB

    width: Integer # stroke width
    opacity: # coming soon
```

NOTE: stroke or fill will overwrite the color properties.

#### Text Options

```bash
    color: HexColor or RGB
    size: Integer
    font: # coming soon
    align: 'center center' # 'x y' - center, right, bottom
```

#### Annotation Options

```bash
    title: String
    date: Date
    open: Boolean
    flag: String # 'readonly', 'norotate' ...
    richText: # coming soon
```
