const path = require('path');
const HummusRecipe = require('../lib');

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function toRadians(angle) {return angle * (Math.PI / 180);}

function endPoint(x, y, l, angle) {
    const radians = toRadians(angle);
    return [(x + l * Math.cos(radians)), (y + l * Math.sin(radians))];
}

function pie(x, y, radius, chart) {
    let sectorColors = [];
    let startAt = -90;
    let sectorLineColor = '#00';
    let sectorOpacity = 1;
    let sectorRay = false;
    let sectorOffset = 0;
    let sectorLimit = 10;
    let sectorPcntColor = '#ffffff';
    let sectorPcntSize = 8;
    let total = 0;
    let defaultFontSize = 14;
    let labelOpts = {size: defaultFontSize};
    const pie = chart.data;

    for (let index = 0; index < pie.length; index++) {
        const slice = pie[index];
        total += slice.value;

        sectorColors.push((slice.fill) ? slice.fill : getRandomColor());
    }

    if (chart.sector) {
        if ( chart.sector.stroke       ) {sectorLineColor = chart.sector.stroke;}
        if ( chart.sector.opacity      ) {sectorOpacity   = chart.sector.opacity;}
        if ( chart.sector.ray          ) {sectorRay       = chart.sector.ray;}
        if ( chart.sector.offset       ) {sectorOffset    = chart.sector.offset;}
        if ( chart.sector.percentColor ) {sectorPcntColor = chart.sector.percentColor;}
        if ( chart.sector.percentSize  ) {sectorPcntSize  = chart.sector.percentSize;}
        if ( chart.sector.percentLimit ) {sectorLimit     = chart.sector.percentLimit;}
    }

    if (chart.label) {
        Object.assign(labelOpts, chart.label);
    }

    let options = {stroke: sectorLineColor, width: 1, sector:true, opacity: sectorOpacity};
    let smallestY = y - radius -20;

    for (let i=0; i < pie.length; i++) {
        const sectorSize = Math.round(pie[i].value / total * 100);
        const halfWay    = sectorSize / 2;
        const endAt      = startAt + sectorSize * 3.6;
        const midArcAng  = startAt + halfWay * 3.6;
        const raySize    = (sectorRay) ? 15 : 5;
        const offdist    = sectorOffset || 5;
        const rayStart   = (pie[i].offset) ? offdist : 0;
        const rayPt1     = endPoint(x, y, radius+rayStart, midArcAng);
        const rayPt2     = endPoint(x, y, radius+rayStart+raySize, midArcAng);
        let [ox, oy]     = [x, y];
        let needPercent  = false;
        const sectorOpts = {fill: sectorColors[i]};

        if ( pie[i].stroke ) {sectorOpts.stroke  = pie[i].stroke;}
        if ( pie[i].width )  {sectorOpts.width   = pie[i].width;}
        if ( pie[i].opacity) {sectorOpts.opacity = pie[i].opacity;}

        if (pie[i].offset) {
            [ox, oy] = endPoint(x, y, offdist, midArcAng);
        }

        this.arc(ox, oy, radius, startAt, endAt, Object.assign({}, options, sectorOpts));

        // Implant percentages inside sectors where possible
        if (sectorSize < sectorLimit) {
            needPercent = true;
        } else {
            let percent = `${sectorSize}%`;
            let pcntSize = sectorPcntSize;
            let psz = this.textDimensions(percent, {size:pcntSize});
            let prcntDist = radius / 2;
            let tx=0, ty=0;

            if (midArcAng > 180) {
                tx = - psz.width / 2;
                ty = - psz.height;
            } else if (midArcAng > 90) {
                tx = - psz.width / 2;
            } else if (midArcAng < 0) {
                ty = - psz.height;
            }

            if (pie[i].offset) {
                prcntDist += offdist;
            }

            let [px, py] = endPoint(x, y, prcntDist, midArcAng);
            this.text(percent, px+tx, py+ty, {color:sectorPcntColor, size: pcntSize});
        }

        // Add labels when present
        if (pie[i].label) {
            const opts = Object.assign({}, labelOpts, pie[i], {opacity:1});
            if (!opts.color) {opts.color = sectorColors[i];}
            let xOffset = 5;
            let yOffset = opts.size / 2;
            const label = (needPercent) ?`${pie[i].label} (${sectorSize}%)` : pie[i].label;

            if (sectorRay) {
                this.line([rayPt1, rayPt2], {stroke: sectorColors[i], width: .5});
            }

            if ( midArcAng > -90 && midArcAng < -45) {
                let td = this.textDimensions(label, opts);
                yOffset = td.height * 1.5;
                xOffset = - td.width/2;
            }
            else if (midArcAng > 45 && midArcAng <= 90) {
                let td = this.textDimensions(label, opts);
                yOffset = -5;
                xOffset = - td.width/2;
            }
            else if (midArcAng > 90 && midArcAng <= 220) {
                let td = this.textDimensions(label, opts);
                xOffset = -td.width-5;
                if (midArcAng < 180) {
                    yOffset = 0;
                }
            }
            else if (midArcAng > 220) {
                let td = this.textDimensions(label, opts);
                xOffset = -td.width / 2;
                yOffset = opts.size;
            }

            let ry = rayPt2[1]-yOffset;
            this.text(label, rayPt2[0]+xOffset, ry, opts);

            if (ry < smallestY) {
                smallestY = ry;
            }
        }

        startAt = endAt;
    }

    if (chart.title && chart.title.text) {
        let td = this.textDimensions(chart.title.text, chart.title);
        let tx = x - (td.width / 2);
        let ty = smallestY -labelOpts.size - td.height*1.5;
        this.text(chart.title.text, tx, ty, chart.title);
    }

    return this;
}

describe('Arc test', () => {
    it('Simple Arcs', (done) => {

        const output = path.join(__dirname, 'output/arcs.pdf');
        const recipe = new HummusRecipe('new', output);
        let x = 120;
        let y = 120;
        let r = 50;
        let txtOps = {color:'#000000', size: 10};

        recipe
            .createPage('letter')
            .text('Arcs of Circles', 230, 27, {size:20, bold:true})
            .arc(x, y, r, 0, 90)
            .text('0°', x+r+5, y,txtOps).text('90°', x, y+r+5,txtOps)
            .arc(x, y, r, -90, -180)
            .text('-90°', x-15, y-r-13,txtOps).text('-180°', x-r-30, y-10,txtOps)
            .circle(x, y, 2, {color:'red', width:.5})
            .arc(x+120, y, r, 90, -90)
            .arc(x+240, y, r, -90, 90, {rotation:-60})
            .arc(x+360, y, r, 45, -270)
            .arc(x+363, y+7, r, 45, 90);
        y+=160;
        recipe
            .text('Sectors of Circles', 220, y-r-30, {size:20, bold:true})
            .arc(x, y, r, 0, 90, {rotation:0, sector:true})
            .arc(x, y, r, -90, -180, {rotation:0, fill:'red', sector:true})
            .text('showing sector & fill', x-r,y+r+21,txtOps)
            .arc(x+120, y, r, 90, -90, {rotation:0})
            .arc(x+120, y, r, 90, 270, {rotation:0, fill:'green', stroke:'default'})
            .text('fill and nofill', x+120-r/2,y+r+21,txtOps)
            .arc(x+240, y, r, -140, 120, {sector:true, stroke:'default'})
            .text('sector: true\ncloses arc\nto centerpoint',x+215,y+r+21,txtOps)
            .arc(x+360, y, r, 45, -270, {rotation:0, fill:'def', sector:true})
            .arc(x+363, y+7, r, 45, 90, {rotation:0, fill:'red', sector:true})
            .text('PIZZA anyone?', x+360-20, y+r+21,txtOps)
            .endPage()
            .endPDF(done);
    });

    it('Pie Charts', (done) => {
        const output = path.join(__dirname, 'output/arcs.pdf');
        const recipe = new HummusRecipe(output, output);

        const movies = [
            { label: 'Comedy',  value: 8, fill: 'red' },
            { label: 'Action',  value: 5, fill: '#d62e00' },
            { label: 'Romance', value: 6, fill: '347d24' },
            { label: 'Drama',   value: 1, fill: 'blue'},
            { label: 'SciFi',   value: 4, fill: '#a425ff' }
        ];

        const grades = [
            {label: 'A', value: 4,  fill: '#c4861b' },
            {label: 'B', value: 14, fill: '#1f750e' },
            {label: 'C', value: 9,  fill: '#125878' },
            {label: 'D', value: 2,  fill: 'red' , offset:true},
        ];

        const chart = {
            title: {
                text: 'Favorite Type of Movie',
                size: 16,
                color: '#ff621f',
                italic: true,
                bold: true,
                underline: {color: '#ff621f'}
            },
            data: movies,
            sector: {
                // opacity: .5,
                stroke: '#ff',
                offset: 16,
                ray: true,
                // percentColor: "#00",
                percentLimit: 6,
                percentSize: 8
            },
            label: {
                size: 10,
                // color: '#000000',
                bold: true,
                italic: true
            }
        };

        let x = 200;
        let y = 550;
        let r = 80;
        recipe.register(pie);
        recipe
            .editPage(1)
            .pie(x,y, r, chart);

        x = 420;
        chart.data = grades;
        chart.sector.ray = false;
        chart.title.text = 'Student Grades';
        chart.title.color = '#000000';
        delete chart.title['underline'];
        chart.title.underline = {color: chart.title.color};
        recipe
            .pie(x,y, r, chart)
            .endPage()
            .endPDF(done);
    });
});
