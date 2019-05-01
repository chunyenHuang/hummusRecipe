# Hummus Recipe
[![All Contributors](https://img.shields.io/badge/all_contributors-9-orange.svg?style=flat-square)](#contributors)

[![npm version](https://badge.fury.io/js/hummus-recipe.svg)](https://badge.fury.io/js/hummus-recipe)
[![Build Status](https://travis-ci.org/chunyenHuang/hummusRecipe.svg?branch=master)](https://travis-ci.org/chunyenHuang/hummusRecipe)
[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=VKYRPLFE2PT7L&source=url)

This is an easy recipe for [HummusJS](https://github.com/galkahana/HummusJS) with a high level class.

I hope this repo will bring more attentions from the community to help [HummusJS](https://github.com/galkahana/HummusJS) to grow faster. 

Feel free to open issues to help us!

## Features

* Javascript with C++ library.
* High performance creation, modification and parsing of PDF files and streams.
* Easy to create and modify PDF files.
* Reusable components.
* Support Basic HTML elements to text

## Documentation

* [Hummus Recipe Documentation](https://chunyenhuang.github.io/hummusRecipe/Recipe.html)

## Instructions

* [GetStarted](#getstarted)
* [Coordinate System](#coordinate-system)
* [Create a new PDF](#create-a-new-pdf)
* [Modify an existing PDF](#modify-an-existing-pdf)
* [PDF Pages/Info/Structure](#page-info)
* [Append PDF](#append-pdf)
* [Insert PDF](#insert-pdf)
* [Overlay PDF](#overlay-pdf)
* [Split PDF](#split-pdf)
* [Encryption](#encryption)

## GetStarted

```bash
npm i hummus-recipe --save
```

## Coordinate System

In order to make things easier, I use `Left-Top` as center `[0,0]` instead of `Left-Bottom`.
You may write and edit the pdf like you write things on papers from the left top corner.
It is similar to the [Html Canvas](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage)

```javascript
pdfDoc
    .text('start from here', 0, 0)
    .text('next line', 0, 20)
    .text('some other texts', 100, 100)
    ...
```

## Create a new PDF

```javascript
const HummusRecipe = require('hummus-recipe');
const pdfDoc = new HummusRecipe('new', '/output.pdf',{
    version: 1.6,
    author: 'John Doe',
    title: 'Hummus Recipe',
    subject: 'A brand new PDF'
});

pdfDoc
    .createPage('letter-size')
    .endPage()
    .endPDF();
```

```javascript
const HummusRecipe = require('hummus-recipe');
const pdfDoc = new HummusRecipe('new', 'output.pdf');
pdfDoc
    // 1st Page
    .createPage('letter-size')
    .circle('center', 100, 30, { stroke: '#3b7721', fill: '#eee000' })
    .polygon([ [50, 250], [100, 200], [512, 200], [562, 250], [512, 300], [100, 300], [50, 250] ], {
        color: [153, 143, 32],
        stroke: [0, 0, 140],
        fill: [153, 143, 32],
        lineWidth: 5
    })
    .rectangle(240, 400, 50, 50, {
        stroke: '#3b7721',
        fill: '#eee000',
        lineWidth: 6,
        opacity: 0.3
    })
    .moveTo(200, 600)
    .lineTo('center', 650)
    .lineTo(412, 600)
    .text('Welcome to Hummus-Recipe', 'center', 250, {
        color: '066099',
        fontSize: 30,
        bold: true,
        font: 'Helvatica',
        align: 'center center',
        opacity: 0.8,
        rotation: 180
    })
    .text('some text box', 450, 400, {
        color: '066099',
        fontSize: 20,
        font: 'Courier New',
        strikeOut: true,
        highlight: {
            color: [255, 0, 0]
        },
        textBox: {
            width: 150,
            lineHeight: 16,
            padding: [5, 15],
            style: {
                lineWidth: 1,
                stroke: '#00ff00',
                fill: '#ff0000',
                dash: [20, 20],
                opacity: 0.1
            }
        }
    })
    .comment('Feel free to open issues to help us!', 'center', 100)
    .endPage()
    // 2nd page
    .createPage('A4', 90)
    .circle(150, 150, 300)
    .endPage()
    // end and save
    .endPDF(()=>{ /* done! */ });
```

## Modify an existing PDF

```javascript
const HummusRecipe = require('hummus-recipe');
const pdfDoc = new HummusRecipe('input.pdf', 'output.pdf');
pdfDoc
    // edit 1st page
    .editPage(1)
    .text('Add some texts to an existing pdf file', 150, 300)
    .rectangle(20, 20, 40, 100)
    .comment('Add 1st comment annotaion', 200, 300)
    .image('/path/to/image.jpg', 20, 100, {width: 300, keepAspectRatio: true})
    .endPage()
    // edit 2nd page
    .editPage(2)
    .comment('Add 2nd comment annotaion', 200, 100)
    .endPage()
    // end and save
    .endPDF();
```

## Page Info

```javascript
const pdfDoc = new HummusRecipe('input.pdf', 'output.pdf');
console.log(pdfDoc.metadata);
```

### Print the pdf structure

```javascript
const pdfDoc = new HummusRecipe('input.pdf', 'output.pdf');
recipe
    .structure('pdf-structure.txt')
    .endPDF(done);
```

## Append PDF

```javascript
const HummusRecipe = require('hummus-recipe');
const pdfDoc = new HummusRecipe('input.pdf', 'output.pdf');
const longPDF = '/longPDF.pdf';
pdfDoc
    // just page 10
    .appendPage(longPDF, 10)
    // page 4 and page 6
    .appendPage(longPDF, [4, 6])
    // page 1-3 and 6-20
    .appendPage(longPDF, [[1, 3], [6, 20]])
    // all pages
    .appendPage(longPDF)
    .endPDF();
```

## Insert PDF

```javascript
const HummusRecipe = require('hummus-recipe');
const pdfDoc = new HummusRecipe('input.pdf', 'output.pdf');

pdfDoc
    // insert page3 from longPDF to current page 2
    .insertPage(2, '/longPDF.pdf', 3)
    .endPDF();
```

## Overlay PDF

```javascript
const HummusRecipe = require('hummus-recipe');
const pdfDoc = new HummusRecipe('input.pdf', 'output.pdf');

pdfDoc
    .overlay('/overlayPDF.pdf')
    .endPDF();
```

## Split PDF

```javascript
const HummusRecipe = require('hummus-recipe');
const pdfDoc = new HummusRecipe('input.pdf');
const outputDir = path.join(__dirname, 'output');

pdfDoc
    .split(outputDir, 'prefix')
    .endPDF();
```

## Encryption

```javascript
const HummusRecipe = require('hummus-recipe');
const pdfDoc = new HummusRecipe('input.pdf', 'output.pdf');

pdfDoc
    .encrypt({
        userPassword: '123',
        ownerPassword: '123',
        userProtectionFlag: 4
    })
    .endPDF();
```

## Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
<table><tr><td align="center"><a href="https://github.com/thebenlamm"><img src="https://avatars2.githubusercontent.com/u/5175102?v=4" width="100px;" alt="thebenlamm"/><br /><sub><b>thebenlamm</b></sub></a><br /><a href="https://github.com/chunyenHuang/hummusRecipe/commits?author=thebenlamm" title="Code">💻</a></td><td align="center"><a href="https://www.bitfactory.io"><img src="https://avatars1.githubusercontent.com/u/510180?v=4" width="100px;" alt="Matthias Nagel"/><br /><sub><b>Matthias Nagel</b></sub></a><br /><a href="https://github.com/chunyenHuang/hummusRecipe/commits?author=matthiasnagel" title="Code">💻</a></td><td align="center"><a href="https://github.com/gios"><img src="https://avatars0.githubusercontent.com/u/6967294?v=4" width="100px;" alt="Pavlo Blazhchuk"/><br /><sub><b>Pavlo Blazhchuk</b></sub></a><br /><a href="https://github.com/chunyenHuang/hummusRecipe/commits?author=gios" title="Code">💻</a></td><td align="center"><a href="https://github.com/shaehn"><img src="https://avatars3.githubusercontent.com/u/13596544?v=4" width="100px;" alt="shaehn"/><br /><sub><b>shaehn</b></sub></a><br /><a href="https://github.com/chunyenHuang/hummusRecipe/commits?author=shaehn" title="Code">💻</a></td><td align="center"><a href="https://www.linkedin.com/in/johnhuangguo/"><img src="https://avatars1.githubusercontent.com/u/12788155?v=4" width="100px;" alt="John Huang"/><br /><sub><b>John Huang</b></sub></a><br /><a href="https://github.com/chunyenHuang/hummusRecipe/commits?author=chunyenHuang" title="Code">💻</a></td><td align="center"><a href="http://andrejsykora.com"><img src="https://avatars0.githubusercontent.com/u/821336?v=4" width="100px;" alt="Andrej Sýkora"/><br /><sub><b>Andrej Sýkora</b></sub></a><br /><a href="https://github.com/chunyenHuang/hummusRecipe/commits?author=neonerd" title="Code">💻</a></td><td align="center"><a href="http://soeyi.me"><img src="https://avatars1.githubusercontent.com/u/38489160?v=4" width="100px;" alt="soeyi"/><br /><sub><b>soeyi</b></sub></a><br /><a href="https://github.com/chunyenHuang/hummusRecipe/commits?author=soeyi" title="Code">💻</a></td></tr><tr><td align="center"><a href="https://dan.halliday.work/technology/"><img src="https://avatars3.githubusercontent.com/u/1068575?v=4" width="100px;" alt="Dan Halliday"/><br /><sub><b>Dan Halliday</b></sub></a><br /><a href="https://github.com/chunyenHuang/hummusRecipe/commits?author=danhalliday" title="Code">💻</a></td><td align="center"><a href="http://www.nikhilpi.com"><img src="https://avatars0.githubusercontent.com/u/5175964?v=4" width="100px;" alt="Nikhil Pai"/><br /><sub><b>Nikhil Pai</b></sub></a><br /><a href="https://github.com/chunyenHuang/hummusRecipe/commits?author=nikhilpi" title="Code">💻</a></td></tr></table>

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!