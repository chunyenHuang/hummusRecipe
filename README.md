# Hummus Recipe

[![npm version](https://badge.fury.io/js/hummus-recipe.svg)](https://badge.fury.io/js/hummus-recipe)
[![Build Status](https://travis-ci.org/chunyenHuang/hummusRecipe.svg?branch=master)](https://travis-ci.org/chunyenHuang/hummusRecipe)

This is an easy recipe for [HummusJS](https://github.com/galkahana/HummusJS) with a high level class.

I hope this repo will bring more attentions from the community to help [HummusJS](https://github.com/galkahana/HummusJS) to grow faster. 

Feel free to open issues to help us!

## Features

* Javascript with C++ library.
* High performance creation, modification and parsing of PDF files and streams.
* Easy to create and modify PDF files.
* Reusable components.

## Documentation

* [Hummus Recipe Documentation](https://chunyenhuang.github.io/hummusRecipe/Recipe.html)

## Instructions

* [GetStarted](#getstarted)
* [Coordinate System](#coordinate-system)
* [Create a new PDF](#create-a-new-pdf)
* [Modify an existing PDF](#modify-an-existing-pdf)
* [Append PDF](#append-pdf)
* [Insert PDF](#insert-pdf)
* [Overlay PDF](#overlay-pdf)
* [Encryption](#encryption)

## GetStarted

```bash
npm i hummus-recipe --save
```

## Coordinate System

In order to make things easier, I use `Left-Top` as center `[0,0]` instead of `Left-Bottom`.
You may write and edit the pdf like you write things on papers from the left top corner.
It is similar to the [Html Canvas](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage)

```
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
        font: 'Courier New',
        align: 'center center'
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
    .image('/path/to/image.jpg', {width: 300, keepAspectRatio: true})
    .endPage()
    // edit 2nd page
    .editPage(2)
    .comment('Add 2nd comment annotaion', 200, 100)
    .endPage()
    // end and save
    .endPDF();
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