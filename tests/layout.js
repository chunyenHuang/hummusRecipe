const path = require('path');
const HummusRecipe = require('../lib');

describe('Layout', () => {

    it(`Flow text into column layouts (OS:${process.platform})`, (done) => {
        const output = path.join(__dirname, 'output/paper.pdf');
        const times = 'times';
        const courier = 'courier new';
        let fontDir = '',
            timesPlain, timesBold, timesItalic, timesBoldItalic;

        // Note, if font not found, default library font (Helvetica) will be used.
        // The Times Roman font will fill one page. The Helvetica font will overflow onto second page.
        switch (process.platform) {
            case 'win32':
                fontDir = '/Windows/Fonts';
                timesPlain = 'times.ttf';
                timesBold = 'timesbd.ttf';
                timesItalic = 'timesi.ttf';
                timesBoldItalic = 'timesbi.ttf';
                break;

            case 'darwin':
            default:
                fontDir = '/Library/Fonts';
                timesPlain = 'Times New Roman.ttf';
                timesBold = 'Times New Roman Bold.ttf';
                timesItalic = 'Times New Roman Italic.ttf';
                timesBoldItalic = 'Times New Roman Bold Italic.ttf';
                break;
        }

        const fontHome = (fontDir) ? { fontSrcPath: [fontDir] } : undefined;
        const recipe = new HummusRecipe('new', output, fontHome);

        recipe.registerFont(times, path.join(fontDir, timesPlain));
        recipe.registerFont(times, path.join(fontDir, timesBold), 'b');
        recipe.registerFont(times, path.join(fontDir, timesItalic), 'i');
        recipe.registerFont(times, path.join(fontDir, timesBoldItalic), 'bi');

        const title = 'Trace-based Just-in-Time Type Specialization for Dynamic Languages';
        const authors = 'Andreas Gal*+, Brendan Eich*, Mike Shaver*, David Anderson*, David Mandelin*,\n' +
            'Mohammad R. Haghighat$, Blake Kaplan*, Graydon Hoare*, Boris Zbarsky*, Jason Orendorff*,\n' +
            'Jesse Ruderman*, Edwin Smith#, Rick Reitmaier#, Michael Bebenita+, Mason Chang+#, Michael Franz+';
        const emails = [{
            org: 'Mozilla Corporation*',
            address: '{gal,brendan,shaver,danderson,dmandelin,mrbkap,graydon,bz,jorendorff,jruderman}@mozilla.com'
        }, {
            org: 'Adobe Corporation#',
            address: '{edwsmith,rreitmai}@adobe.com'
        }, {
            org: 'Intel Corporation$',
            address: '{mohammad.r.haghighat}@intel.com',
        }, {
            org: 'University of California, Irvine+',
            address: '{mbebenit,changm,franz}@uci.edu'
        }];

        const abstract = 'Dynamic languages such as JavaScript are more difficult to compile \
than statically typed ones. Since no concrete type information \
is available, traditional compilers need to emit generic code that can \
handle all possible type combinations at runtime.We present an alternative \
compilation technique for dynamically-typed languages \
that identifies frequently executed loop traces at run-time and then \
generates machine code on the fly that is specialized for the actual \
dynamic types occurring on each path through the loop. Our \
method provides cheap inter-procedural type specialization, and an \
elegant and efficient way of incrementally compiling lazily discovered \
alternative paths through nested loops. We have implemented \
a dynamic compiler for JavaScript based on our technique and we \
have measured speedups of 10x and more for certain benchmark programs.';

        const article = 'such as JavaScript, Python, and Ruby, are popular \
since they are expressive, accessible to non-experts, and make \
deployment as easy as distributing a source file. They are used for \
small scripts as well as for complex applications. JavaScript, for \
example, is the de facto standard for client-side web programming \
and is used for the application logic of browser-based productivity \
applications such as Google Mail, Google Docs and Zimbra Collaboration \
Suite. In this domain, in order to provide a fluid user \
experience and enable a new generation of applications, virtual machines \
must provide a low startup time and high performance.\n\
    Compilers for statically typed languages rely on type information \
to generate efficient machine code. In a dynamically typed programming \
language such as JavaScript, the types of expressions \
may vary at runtime. This means that the compiler can no longer \
easily transform operations into machine instructions that operate \
on one specific type. Without exact type information, the compiler \
must emit slower generalized machine code that can deal with all \
potential type combinations. While compile-time static type inference \
might be able to gather type information to generate optimized \
machine code, traditional static analysis is very expensive \
and hence not well suited for the highly interactive environment of \
a web browser.\n\
    We present a trace-based compilation technique for dynamic \
languages that reconciles speed of compilation with excellent performance \
of the generated machine code. Our system uses a mixedmode \
execution approach: the system starts running JavaScript in a \
fast-starting bytecode interpreter. As the program runs, the system \
identifies hot (frequently executed) bytecode sequences, records \
them, and compiles them to fast native code. We call such a sequence \
of instructions a trace.\n\
    Unlike method-based dynamic compilers, our dynamic compiler \
operates at the granularity of individual loops. This design \
choice is based on the expectation that programs spend most of \
their time in hot loops. Even in dynamically typed languages, we \
expect hot loops to be mostly type-stable, meaning that the types of \
values are invariant. (12) For example, we would expect loop counters \
that start as integers to remain integers for all iterations. When \
both of these expectations hold, a trace-based compiler can cover \
the program execution with a small number of type-specialized, efficiently \
compiled traces.\n\
    Each compiled trace covers one path through the program with \
one mapping of values to types. When the VM executes a compiled \
trace, it cannot guarantee that the same path will be followed \
or that the same types will occur in subsequent loop iterations. \
';

        const footnote = 'Permission to make digital or hard copies of all or part of this work for personal or \
classroom use is granted without fee provided that copies are not made or distributed \
for profit or commercial advantage and that copies bear this notice and the full citation \
on the first page. To copy otherwise, to republish, to post on servers or to redistribute \
to lists, requires prior specific permission and/or a fee.';

        const copyright = 'PLDI’09, June 15–20, 2009, Dublin, Ireland.\nCopyright c 2009 ACM 978-1-60558-392-1/09/06. . . $5.00';

        // let x = 72;
        let y = 75;
        // let box = {style:{width: .5}}
        let box = {};

        const nextPage = (self) => {
            self.endPage();
            self.createPage('letter', 0, { left: 55, right: 55 });
            self.layout('page', 0, 0, 0, 0, { reset: true, columns: 2, gap: 20 });

            return { layout: 'page' };
        };

        recipe
            .chroma('black', '#000000', 'rgb')
            .createPage('letter', 0, { left: 55, right: 55, bottom: 55 })
            .text(title, 55, y, { color: 'black', size: 18, font: times, bold: true, flow: true, textBox: { textAlign: 'center' } })
            .movedown(3)
            .text(authors, { size: 11, bold: false, textBox: { lineHeight: 14 } })
            .movedown(1);

        for (const email of emails) {
            recipe
                .text(email.org, { size: 9, font: times, textBox: { lineHeight: 10 } })
                .movedown()
                .text(email.address, { size: 8, font: courier, textBox: { lineHeight: 10 } })
                .movedown(1.5);
        }
        recipe.text('', { flow: false, textBox: { box } });

        recipe
            .text(footnote, 55, 668, { flow: true, color: 'black', font: times, size: 7, textBox: { textAlign: 'justify', width: 245, lineHeight: 8 } })
            .movedown(1.2)
            .text(copyright, { textBox: { textAlign: 'left' } })
            .text('', { flow: false, textBox: { box } });

        recipe
            .layout(1, 55, 330, 245, 320)
            .layout(1, 320, 330)
            .text('Abstract', { layout: 1, size: 12, color: 'black', font: times, bold: true, textBox: { lineHeight: 13 } })
            .movedown(1.5)
            .text(abstract, { size: 9, bold: false, textBox: { textAlign: 'justify', lineHeight: 11 } })
            .movedown(1.5)
            .text('Categories and Subject Descriptors ', { size: 8, bold: true, italic: true, textBox: { textAlign: 'left' } })
            .text('D.3.4 [Programming Languages]: Processors — Incremental compilers, code generation.', { bold: false })
            .movedown(1.5)
            .text('General Terms ', { bold: true, italic: true })
            .text('Design, Experimentation, Measurement, Performance.', { bold: false, italic: false })
            .movedown(1.5)
            .text('Keywords ', { bold: true, italic: true })
            .text('JavaScript, just-in-time compilation, trace trees.', { font: times, bold: false, italic: false })
            .movedown(2)
            .text('1.  Introduction', { font: times, bold: true, italic: false, size: 12 })
            .movedown(1.5)
            .text('Dynamic languages ', { bold: false, italic: true, size: 9 })
            .text(article, { italic: false, overflow: nextPage, textBox: { textAlign: 'justify', lineHeight: 10 } })
            .text('', { flow: false, textBox: { box } });

        recipe.endPage();
        recipe.endPDF(done);
    });
});
