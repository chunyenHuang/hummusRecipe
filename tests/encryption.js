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

    const taskAPP = 'Add permission password';
    it(taskAPP, (done) => {
        const src = path.join(__dirname, 'materials/test2.pdf');
        // const overlayPDF = path.join(__dirname, 'materials/test3.pdf');
        const output = path.join(__dirname, `output/${taskAPP}.pdf`);

        const recipe = new HummusRecipe(src, output);
        recipe
            .encrypt({
                password: '123',
            })
            .endPDF(done);
    });

    const taskCPF = 'New file with view password';
    it(taskCPF, (done) => {
        const output = path.join(__dirname, `output/${taskCPF}.pdf`);
        const recipe = new HummusRecipe('new', output, {userPassword: '123'});
        recipe
            .createPage('letter-size')
            .text('When creating file, the viewing password (userPassword)', 150, 300)
            .text('is required for file encryption to occur.', 150, 350)
            .endPage()
            .endPDF(done);
    });

    const taskCPP = 'New file with permission password';
    it(taskCPP, (done) => {
        const output = path.join(__dirname, `output/${taskCPP}.pdf`);
        const recipe = new HummusRecipe('new', output, {password: '123'});
        recipe
            .createPage('letter-size')
            .text('When creating file, an empty viewing password (userPassword)', 150, 300)
            .text('is required for file encryption to occur.', 150, 350)
            .endPage()
            .endPDF(done);
    });

    const taskCPE = 'New file with edit password';
    it(taskCPE, (done) => {
        const output = path.join(__dirname, `output/${taskCPE}.pdf`);
        const a=3900
        const recipe = new HummusRecipe('new', output, {ownerPassword: '123', userProtectionFlag:3900});
        recipe
            .createPage('letter-size')
            .text('When creating file, an empty viewing password (userPassword)', 150, 300)
            .text('is required for file encryption to occur.', 150, 350)
            .endPage()
            .endPDF(done);
    });

    const taskMPF = 'Modify file with view password';
    it(taskMPF, (done) => {
        const input  = path.join(__dirname, `output/${taskCPF}.pdf`);
        const output = path.join(__dirname, `output/${taskMPF}.pdf`);
        const recipe = new HummusRecipe(input, output, {userPassword: '123'});

        recipe
            .editPage(1)
            .text('The userPassword is also required to modify the file.', 150, 400)
            .endPage()
            .endPDF(done);
    });

});
