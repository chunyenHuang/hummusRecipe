const path = require('path');
const HummusRecipe = require('../lib');

describe('Modify', () => {
    it('Add Overlay from other PDF', (done) => {
        const src = path.join(__dirname, 'materials/test2.pdf');
        const overlayPDF = path.join(__dirname, 'materials/test3.pdf');
        const output = path.join(__dirname, 'output/Add overlay.pdf');

        const recipe = new HummusRecipe(src, output);
        recipe
            .editPage(1)
            .overlay(overlayPDF)
            .endPage()
            .endPDF(done);
    });

    it('Add Overlay from other PDF - position', (done) => {
        const src = path.join(__dirname, 'materials/issue-28-input.pdf');
        const overlayPDF = path.join(__dirname, 'materials/test2.pdf');
        const output = path.join(__dirname, 'output/Add overlay (#28) - position.pdf');

        const recipe = new HummusRecipe(src, output);
        const options = {};
        recipe
            .editPage(1)
            .overlay(overlayPDF, 500, 300, options)
            .endPage()
            .endPDF(done);
    });

    it('Add Overlay from other PDF - scale', (done) => {
        const src = path.join(__dirname, 'materials/issue-28-input.pdf');
        const overlayPDF = path.join(__dirname, 'materials/test2.pdf');
        const output = path.join(__dirname, 'output/Add overlay (#28) - scale.pdf');

        const recipe = new HummusRecipe(src, output);
        const options = {
            keepAspectRatio: true,
            scale: 3
        };
        recipe
            .editPage(1)
            .overlay(overlayPDF, options)
            .endPage()
            .endPDF(done);
    });

    it('Add Overlay from other PDF - fitWidth', (done) => {
        const src = path.join(__dirname, 'materials/issue-28-input.pdf');
        const overlayPDF = path.join(__dirname, 'materials/test2.pdf');
        const output = path.join(__dirname, 'output/Add overlay (#28) - fitWidth.pdf');

        const recipe = new HummusRecipe(src, output);
        const options = {
            keepAspectRatio: true,
            fitWidth: true
        };
        recipe
            .editPage(1)
            .overlay(overlayPDF, options)
            .endPage()
            .endPDF(done);
    });

    it('Add Overlay from other PDF - fitHeight', (done) => {
        const src = path.join(__dirname, 'materials/issue-28-input.pdf');
        const overlayPDF = path.join(__dirname, 'materials/test2.pdf');
        const output = path.join(__dirname, 'output/Add overlay (#28) - fitHeight.pdf');

        const recipe = new HummusRecipe(src, output);
        const options = {
            keepAspectRatio: true,
            fitHeight: true
        };
        recipe
            .editPage(1)
            .overlay(overlayPDF, options)
            .endPage()
            .endPDF(done);
    });

    it('Add Overlay from other PDF - stretch to fit', (done) => {
        const src = path.join(__dirname, 'materials/issue-28-input.pdf');
        const overlayPDF = path.join(__dirname, 'materials/test2.pdf');
        const output = path.join(__dirname, 'output/Add overlay (#28) - stretch.pdf');

        const recipe = new HummusRecipe(src, output);
        const options = {
            fitHeight: true,
            fitWidth: true
        };
        recipe
            .editPage(1)
            .overlay(overlayPDF, options)
            .endPage()
            .endPDF(done);
    });


    it('Add Overlay from other PDF w/ page_index', (done) => {
        const src = path.join(__dirname, 'materials/test2.pdf');
        const overlayPDF = path.join(__dirname, 'materials/test3.pdf');
        const output = path.join(__dirname, 'output/Add overlay with page.pdf');

        const recipe = new HummusRecipe(src, output);
        recipe
            .editPage(1)
            .overlay(overlayPDF, { page: 1 })
            .endPage()
            .endPDF(done);
    });

    it('Add Overlay from other PDF - position w/ page_index', (done) => {
        const src = path.join(__dirname, 'materials/issue-28-input.pdf');
        const overlayPDF = path.join(__dirname, 'materials/test2.pdf');
        const output = path.join(__dirname, 'output/Add overlay (#28) with page - position.pdf');

        const recipe = new HummusRecipe(src, output);
        const options = { page: 1 };
        recipe
            .editPage(1)
            .overlay(overlayPDF, 500, 300, options)
            .endPage()
            .endPDF(done);
    });

    it('Add Overlay from other PDF - scale w/ page_index', (done) => {
        const src = path.join(__dirname, 'materials/issue-28-input.pdf');
        const overlayPDF = path.join(__dirname, 'materials/test2.pdf');
        const output = path.join(__dirname, 'output/Add overlay (#28) with page - scale.pdf');

        const recipe = new HummusRecipe(src, output);
        const options = {
            keepAspectRatio: true,
            scale: 3,
            page: 2
        };
        recipe
            .editPage(1)
            .overlay(overlayPDF, options)
            .endPage()
            .endPDF(done);
    });

    it('Add Overlay from other PDF - fitWidth w/ page_index', (done) => {
        const src = path.join(__dirname, 'materials/issue-28-input.pdf');
        const overlayPDF = path.join(__dirname, 'materials/test2.pdf');
        const output = path.join(__dirname, 'output/Add overlay (#28) with page - fitWidth.pdf');

        const recipe = new HummusRecipe(src, output);
        const options = {
            keepAspectRatio: true,
            fitWidth: true,
            page: 2
        };
        recipe
            .editPage(1)
            .overlay(overlayPDF, options)
            .endPage()
            .endPDF(done);
    });

    it('Add Overlay from other PDF - fitHeight w/ page_index', (done) => {
        const src = path.join(__dirname, 'materials/issue-28-input.pdf');
        const overlayPDF = path.join(__dirname, 'materials/test2.pdf');
        const output = path.join(__dirname, 'output/Add overlay (#28) with page - fitHeight.pdf');

        const recipe = new HummusRecipe(src, output);
        const options = {
            keepAspectRatio: true,
            fitHeight: true,
            page: 1
        };
        recipe
            .editPage(1)
            .overlay(overlayPDF, options)
            .endPage()
            .endPDF(done);
    });

    it('Add Overlay from other PDF - stretch to fit  w/ page_index', (done) => {
        const src = path.join(__dirname, 'materials/issue-28-input.pdf');
        const overlayPDF = path.join(__dirname, 'materials/test2.pdf');
        const output = path.join(__dirname, 'output/Add overlay (#28) with page - stretch.pdf');

        const recipe = new HummusRecipe(src, output);
        const options = {
            fitHeight: true,
            fitWidth: true,
            page: 2
        };
        recipe
            .editPage(1)
            .overlay(overlayPDF, options)
            .endPage()
            .endPDF(done);
    });
});
