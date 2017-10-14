const fs = require('fs');
const path = require('path');
const { htmlToTextObjects } = require('../lib/htmlToTextObjects');
const htmlCodes = fs.readFileSync(path.join(__dirname, './materials/text.html'), 'utf8');
describe('HTML to TextObjects', () => {
    it('parse HTML', (done) => {
        const textObjects = htmlToTextObjects(htmlCodes);
        done();
    });
});
