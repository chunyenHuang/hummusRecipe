const path = require('path');
const HummusRecipe = require('../lib');
const fs = require('fs');

function compare(a, b) {
    // Use toUpperCase() to ignore character casing
    const nameA = a.last_name.toUpperCase();
    const nameB = b.last_name.toUpperCase();

    let comparison = 0;
    if (nameA > nameB) {
        comparison = 1;
    } else if (nameA < nameB) {
        comparison = -1;
    }
    return comparison;
}

function hilight(text, record) {
    if (record.gender.toLowerCase() === 'female') {
        return { color: '#ff1493' };
    }
}

describe('Text - Columns', () => {

    it('Table', (done) => {
        const output = path.join(__dirname, 'output/table.pdf');
        const pplFile = path.join(__dirname, 'materials/people.json');
        const recipe = new HummusRecipe('new', output);
        const peeps = fs.readFileSync(pplFile, 'utf8');
        const people = JSON.parse(peeps);

        const contents = [{
            name: 'Steven Haehn',
            address: '257 Banana Ave.',
            city: 'Colorado Springs',
            state: 'Colorado',
            job: 'computer programmer'
        }, {
            name: 'Yunjin Kim',
            address: '123 Laurel Blvd.',
            city: 'Phoenix',
            state: 'Arizona',
            job: 'musical director, teacher'
        }, {
            name: 'Chunyen Huang',
            address: '34178 Sunset Lane',
            city: 'Los Angles',
            state: 'California',
            job: 'computer analyst'
        }, {
            name: 'Iris Johansen',
            address: '341 Washington Ave.',
            city: 'Atlanta',
            state: 'Georgia',
            job: 'author'
        }, {
            name: 'Terry Brooks',
            address: '1523 Bernard Blvd.',
            // city: "Seattle",
            state: 'Oregon',
            job: 'author'
        }, {
            name: 'Joy Merchand',
            address: '46 Medulla Lane',
            city: 'San Jose',
            state: 'California',
            job: 'psycologist'
        }];


        const pcols = [{
            name: 'email',
            width: 170
        }, {
            name: 'ip_address',
            width: 110
        }, {
            name: 'first_name',
            renderer: hilight,
            width: 80
        }, {
            name: 'last_name',
            renderer: hilight,
            width: 80
        }];

        const columns = [{
            text: 'Name',
            name: 'name',
            width: 110,
            // cell: {textAlign:'center'}
        }, {
            text: 'Address',
            name: 'address',
            width: 130
        }, {
            text: 'City/Town',
            name: 'city',
            width: 100
        }, {
            text: 'State',
            name: 'state',
            width: 80
        }, {
            text: 'Occupation',
            name: 'job',
            width: 100,
            color: 'red',
            size: 10
        }];

        // const stop = () => { return true; };

        const newPage = (self) => {
            self.endPage();
            self.createPage('letter');
            return { position: [30, 52] };
        };

        let nextTable = 30;
        const samePage = () => {
            nextTable += 170;
            if (nextTable > 500) {
                return true;
            }
            return { position: [nextTable, 302] };
        };

        let x = 50;
        let y = 52;
        recipe
            .createPage('letter')
            .text('Table with alternating row properties', 230, 30, { color: '#000000' })
            .table(x, y, contents, {
                columns: columns,
                header: { cell: { padding: [8, 2, 8, 2], textAlign: 'left' } },
                border: { stroke: '#dddddd' },
                row: { nth: 'odd', cell: { style: { fill: '#dddddd' } } }
            })
            .text('Tables showing new position when "overflow" encountered.', 80, y + 200, { color: '#000000' })
            .text('Note data driven property (color) assignment', 130, y + 220, { size: 12, color: '#000000' })
            .table(x - 20, y + 250, people.sort(compare), {
                columns: pcols,
                border: true,
                header: { cell: { textAlign: 'left' } },
                row: { size: 10 },
                overflow: samePage,
                order: 'first_name,last_name'
            })
            .endPage()
            .createPage('letter')
            .text('Table continued onto subsequent pages (overflow encountered)', x, y - 30, { color: '#000000' })
            .table(x - 20, y, people.sort(compare), {
                columns: pcols,
                border: true,
                header: true,
                row: { size: 10 },
                overflow: newPage,
                order: 'first_name,last_name,email'
            });

        recipe.endPage();
        recipe.endPDF(done);
    });
});
