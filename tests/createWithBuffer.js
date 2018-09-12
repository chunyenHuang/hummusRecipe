const path = require('path');
const fs = require('fs');
const HummusRecipe = require('../lib');

describe('Modify', () => {
  it('Create Writer With buffer', done => {
    const src = path.join(__dirname, 'materials/test.pdf');
    const myCats = path.join(__dirname, 'materials/myCats.jpg');
    const buffer = fs.readFileSync(src);
    const recipe = new HummusRecipe(buffer);
    recipe
      .editPage(1)
      .image(myCats, 'center', 'center', {
        width: 300,
        height: 300,
        keepAspectRatio: false,
        opacity: 0.4,
        align: 'center center'
      })
      .endPage()
      .endPDF((outBuffer) => {
        assert(outBuffer instanceof Buffer);
        fs.writeFileSync(path.join(__dirname, 'output/createWithBuffer.pdf'), outBuffer);
        done();
      });
  });
});
