const path = require('path');
const HummusRecipe = require('../lib');

describe('Modify', () => {
    it('Change info pdf', (done) => {
        const src = path.join(__dirname, 'materials/blank.pdf')
        const output = path.join(__dirname, `output/change info.pdf`);
        const recipe = new HummusRecipe(src, output);
		recipe
            .info({
				author: 'yo man' + (new Date()).toString(),
				title: 'Hello World'
			})
			.custom('some', 'thing?')
            .endPage()
            .endPDF(done);
    });
});
