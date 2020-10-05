const path = require('path');
const HummusRecipe = require('../lib');

describe('Text - Columns', () => {

    it('Text columns', (done) => {
        const output = path.join(__dirname, 'output/column-text.pdf');
        const recipe = new HummusRecipe('new', output);
        const lorem = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. \
Etiam in suscipit purus. Vestibulum ante ipsum primis in faucibus orci luctus \
et ultrices posuere cubilia Curae; Vivamus nec hendrerit felis. Morbi aliquam \
facilisis risus eu lacinia. Sed eu leo in turpis fringilla hendrerit. \
Ut nec accumsan nisl. Suspendisse rhoncus nisl posuere tortor tempus et dapibus \
elit porta. Cras leo neque, elementum a rhoncus ut, vestibulum non nibh. \
Phasellus pretium justo turpis. Etiam vulputate, odio vitae tincidunt ultricies, \
eros odio dapibus nisi, ut tincidunt lacus arcu eu elit. Aenean velit erat, vehicula \
eget lacinia ut, dignissim non tellus. Aliquam nec lacus mi, sed vestibulum nunc. \
Suspendisse potenti. Curabitur vitae sem turpis. Vestibulum sed neque eget dolor dapibus \
porttitor at sit amet sem. Fusce a turpis lorem. Vestibulum ante ipsum primis in \
faucibus orci luctus et ultrices posuere cubilia Curae;';

        const stop = () => { return true; };
        const nextPage = (self) => {
            self.endPage();
            self.createPage('letter');
            return { layout: 'page' };
        };

        let x = 72;
        let y = 52;
        let id = 1;
        recipe
            .createPage('letter')
            .text('Multiple columns with auto text fill using single "layout".', x, y - 20, { color: 'red' })
            .layout(id, x, y, 500, 200, { columns: 3, gap: 10 })
            .text(lorem, {
                layout: id,
                overflow: stop,
                flow: false,
                textBox: { padding: 2, textAlign: 'justify', style: { width: .5 } }
            })
            .text('Multiple layouts with auto text fill.', 100, 280, { color: 'red' })
            .layout(2, 100, 300, 150, 100)
            .layout(2, 200, 420, 150, 100)
            .layout(2, 370, 420, 150, 100)
            .text(lorem, {
                layout: 2,
                overflow: stop,
                flow: false,
                textBox: { textAlign: 'justify', style: { width: .5 } }
            })
            .layout(id, 100, 600, 300, 150, { reset: true, columns: 2, gap: 10 })
            .layout('page', x, y + 50, 500, 150, { columns: 3, gap: 10 })
            .text('... continuing onto\n   next page...', 420, 710, { color: 'red' })
            .text('Starting on this page with this layout...', 101, 580, { color: 'red' })
            .text(lorem, 101, 600, { layout: 1, flow: false, overflow: nextPage, textBox: { padding: 2, style: { width: .5 } } })
            .text('... finishing here with new layout', x, y, { color: 'red' });

        recipe.endPage();
        recipe.endPDF(done);
    });
});
