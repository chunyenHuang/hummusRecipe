const hummus = require('hummus');
const fs = require('fs');
const path = require('path');
const streams = require('memory-streams');
/**
 * @name Recipe
 * @desc Create a pdfDoc
 * @namespace
 * @constructor
 * @param {string} src - The path of the src file.
 * @param {string} output - The path of the output file.
 * @param {Object} [options] - The options for pdfDoc
 * @param {number} [options.version] - The pdf version
 * @param {string} [options.author] - The author
 * @param {string} [options.title] - The title
 * @param {string} [options.subject] - The subject
 * @param {string[]} [options.keywords] - The array of keywords
 */
class Recipe {
    constructor(src, output, options = {}) {
        this.src = src;
        this.output = output || src;
        this.options = options;

        // detect the src is Buffer or not
        this.isBufferSrc = this.src instanceof Buffer;

        if (this.src && !this.isBufferSrc) {
            this.filename = this.src.split('/').pop();
        }

        if (this.isBufferSrc) {
            this.outStream = new streams.WritableStream();
        }
        this.hummus = hummus;
        this.logFile = 'hummus-error.log';

        this.textMarkupAnnotations = [
            'Highlight', 'Underline', 'StrikeOut', 'Squiggly'
        ];

        this.annotationsToWrite = [];
        this.annotations = [];
        this.vectorsToWrite = [];

        this.xObjects = [];

        this.needToEncrypt = false;

        this.needToInsertPages = false;

        this._setParameters(options);
        this._loadFonts(path.join(__dirname, '../fonts'));
        if (options.fontSrcPath) {
            this._loadFonts(options.fontSrcPath);
        }
        this._createWriter();
    }

    _createWriter() {
        if (!this.isBufferSrc && this.src.toLowerCase() == 'new') {
            this.isNewPDF = true;
            this.writer = hummus.createWriter(this.output, {
                version: this._getVersion(this.options.version)
            });
        } else {
            this.isNewPDF = false;
            this.read();
            try {
                if (this.isBufferSrc) {
                    this.writer = hummus.createWriterToModify(
                        new hummus.PDFRStreamForBuffer(this.src),
                        new hummus.PDFStreamForResponse(this.outStream),
                        {
                            log: this.logFile
                        }
                    );
                } else {
                    this.writer = hummus.createWriterToModify(this.src, {
                        modifiedFilePath: this.output,
                        log: this.logFile
                    });
                }
            } catch (err) {
                throw new Error(err);
            }
        }

        this.info(this.options);
    }

    _getVersion(version) {
        const supportedVersions = [
            1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7
        ];
        if (!supportedVersions.includes(version)) {
            version = 1.7;
        }
        version = hummus[`ePDFVersion${version * 10}`];

        return version;
    }

    get position() {
        const { ox, oy } = this._reverseCoordinate(this._position.x, this._position.y);
        return { x: ox, y: oy };
    }

    read(inSrc) {
        const isForExternal = (inSrc) ? true : false;
        try {
            let src = (isForExternal) ? inSrc : this.src;
            if (this.isBufferSrc) src = new hummus.PDFRStreamForBuffer(this.src);
            const pdfReader = hummus.createReader(src);
            const pages = pdfReader.getPagesCount();
            if (pages == 0) {
                // broken or modify password protected
                throw 'HummusJS: Unable to read/edit PDF file (pages=0)';
            }
            const metadata = {
                pages
            };
            for (var i = 0; i < pages; i++) {
                const info = pdfReader.parsePage(i);
                const dimensions = info.getMediaBox();
                const rotate = info.getRotate();

                let layout,
                    width,
                    height,
                    pageSize,
                    maxLength;
                let side1 = Math.abs(dimensions[2] - dimensions[0]);
                let side2 = Math.abs(dimensions[3] - dimensions[1]);
                if (side1 > side2 && rotate % 180 === 0) {
                    layout = 'landscape';
                } else
                    if (side1 < side2 && rotate % 180 !== 0) {
                        layout = 'landscape';
                    } else {
                        layout = 'portrait';
                    }

                if (layout === 'landscape') {
                    width = (side1 > side2) ? side1 : side2;
                    height = (side1 > side2) ? side2 : side1;
                    maxLength = width;
                } else {
                    width = (side1 > side2) ? side2 : side1;
                    height = (side1 > side2) ? side1 : side2;
                    maxLength = height;
                }

                pageSize = [width, height].sort((a, b) => {
                    return (a > b) ? 1 : -1;
                });

                const page = {
                    pageNumber: i + 1,
                    mediaBox: dimensions,
                    layout,
                    rotate,
                    width,
                    height,
                    // usually 0
                    offsetX: dimensions[0],
                    offsetY: dimensions[1]
                };
                metadata[page.pageNumber] = page;
            }
            if (!isForExternal) {
                this.pdfReader = pdfReader;
                this.metadata = metadata;
            }
            return metadata;
        } catch (err) {
            throw new Error(err);
        }
    }

    /**
     * End the pdfDoc
     * @function
     * @memberof Recipe
     * @param {function} callback - The callback function.
     */
    endPDF(callback) {
        this._writeInfo();
        this.writer.end();
        // This is a temporary work around for copying context will overwrite the current one
        // write annotations at the end.
        if (
            (this.annotations && this.annotations.length > 0) ||
            (this.annotationsToWrite && this.annotationsToWrite.length > 0)
        ) {
            if (this.isBufferSrc) {
                this.writer = hummus.createWriterToModify(
                    new hummus.PDFRStreamForBuffer(this.src),
                    new hummus.PDFStreamForResponse(this.outStream),
                    {
                        // modifiedFilePath: this.output,
                        log: this.logFile
                    }
                );
            } else {
                this.writer = hummus.createWriterToModify(this.output, {
                    modifiedFilePath: this.output,
                    log: this.logFile
                });
            }

            this._writeAnnotations();
            this._writeInfo();
            this.writer.end();
        }
        if (this.needToInsertPages) {
            this._insertPages();
        }
        if (this.needToEncrypt) {
            this._encrypt();
        }

        if (callback) {
            const result = (this.isBufferSrc) ? this.outStream.toBuffer() : '';
            callback(result);
        }
    }
}

module.exports = Recipe;
