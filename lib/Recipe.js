const hummus = require('hummus');
const fs = require('fs');
const path = require('path');
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
        this.output = output;
        this.options = options;

        if(this.src){
            this.filename = this.src.split('/').pop();
        }

        this.logFile = 'hummus-error.log';

        this.annotationsToWrite = [];
        this.annotations = [];
        this.vectorsToWrite = [];

        this.xObjects = [];

        this.needToEncrypt = false;

        this.needToInsertPages = false;

        this._setParameters(options = {});
        const fontSrcPath = options.fontSrcPath || path.join(__dirname, '../fonts');
        this._loadFonts(fontSrcPath);
        this._createWriter();
    }

    _createWriter() {
        if (this.src.toLowerCase() == 'new') {
            this.isNewPDF = true;

            this.writer = hummus.createWriter(this.output, {
                version: this._getVerion(this.options.version)
            });
            this.info(this.options);
        } else {
            this.isNewPDF = false;

            this.read();
            try {
                this.writer = hummus.createWriterToModify(
                    this.src, {
                        modifiedFilePath: this.output,
                        log: this.logFile

                    }
                );
            } catch (err) {
                throw new Error(err);
            }
        }
    }

    _getVerion(version) {
        const supportedVersions = [
            1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7
        ];
        if (!supportedVersions.includes(version)) {
            version = 1.7;
        }
        version = hummus[`ePDFVersion${version*10}`];

        return version;
    }

    get position() {
        const { ox, oy } = this._reverseCoorinate(this._position.x, this._position.y);
        return { x: ox, y: oy };
    }

    read(src) {
        try {
            src = src || this.src;
            const pdfReader = hummus.createReader(src);
            this.pdfReader = pdfReader;
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
            this.metadata = metadata;
        } catch (err) {
            throw new Error(err);
        };
    }

    /**
     * End the pdfDoc
     * @function
     * @memberof Recipe
     * @param {function} callback - The callback function.
     */
    endPDF(callback) {
        this.writer.end();
        // This is a temporary work around for copying context will overwrite the current one
        // write annotations at the end.
        if (this.annotations && this.annotations.length > 0) {
            this.writer = hummus.createWriterToModify(
                this.output, {
                    modifiedFilePath: this.output,
                    log: this.logFile
                }
            );
            this._writeAnnotations();
            this.writer.end();
        }
        if (this.needToInsertPages) {
            this._insertPages();
        }
        if (this.needToEncrypt) {
            this._encrypt();
        }

        if (callback) {
            return callback();
        }
    }
}

module.exports = Recipe;
