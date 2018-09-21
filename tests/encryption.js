const path = require('path');
const HummusRecipe = require('../lib');

describe('Encryption', () => {
    const taskAVP = 'Add view password';
    it(taskAVP, (done) => {
        const src = path.join(__dirname, 'materials/test2.pdf');
        const output = path.join(__dirname, `output/${taskAVP}.pdf`);
        const recipe = new HummusRecipe(src, output);
        recipe
            .encrypt({
                userPassword: '123'
            })
            .endPDF(done);
    });

    const taskAEP = 'Add edit password';
    it(taskAEP, (done) => {
        const src = path.join(__dirname, 'materials/test2.pdf');
        // const overlayPDF = path.join(__dirname, 'materials/test3.pdf');
        const output = path.join(__dirname, `output/${taskAEP}.pdf`);

        const recipe = new HummusRecipe(src, output);
        recipe
            .encrypt({
                ownerPassword: '123'
            })
            .endPDF(done);
    });

});
