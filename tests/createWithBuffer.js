const path = require('path');
const fs = require('fs');
const HummusRecipe = require('../lib');

describe('Modify', () => {
  it('Create Writer With buffer', done => {
    const src = path.join(__dirname, 'materials/test.pdf');
    const buffer = fs.readFileSync(src);
    const myCats = path.join(__dirname, 'materials/myCats.jpg');
    const recipe = new HummusRecipe(buffer, '', { createWithBuffer: true });
    const result = recipe
      .editPage(1)
      .image(myCats, 'center', 'center', {
        width: 300,
        height: 300,
        keepAspectRatio: false,
        opacity: 0.4,
        align: 'center center'
      })
      .endPage()
      .endPDF(done);
    fs.writeFileSync(path.resolve('./tests/materials/createWithBuffer.pdf'), result)
    assert(result instanceof Buffer);
  });
});
