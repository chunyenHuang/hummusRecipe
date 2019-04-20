const ANNOTATION_PREFIX = 'Annots';

/**
 * Append PDF Page with annotations.
 *
 * @param {any} pdfWriter - Hummus writer.
 * @param {string|any} sourcePDFPath - The path for the output pdfs or Reader stream.
 * @param {number} pageNumber - page number.
 * @param {any} [options={}] - appendPDFPageFromPDF options
 */
function appendPDFPageFromPDFWithAnnotations(pdfWriter, sourcePDFPath, pageNumber) {
    const cpyCxt = pdfWriter.createPDFCopyingContext(sourcePDFPath);
    const cpyCxtParser = cpyCxt.getSourceDocumentParser();
    const pageDictionary = cpyCxtParser.parsePageDictionary(pageNumber);

    if (!pageDictionary.exists(ANNOTATION_PREFIX)) {
        cpyCxt.appendPDFPageFromPDF(pageNumber);
    } else {
        let reffedObjects;
        pdfWriter.getEvents().once('OnPageWrite', params => {
            params.pageDictionaryContext.writeKey(ANNOTATION_PREFIX);
            reffedObjects = cpyCxt.copyDirectObjectWithDeepCopy(pageDictionary.queryObject(ANNOTATION_PREFIX));
        });

        cpyCxt.appendPDFPageFromPDF(pageNumber);

        if (reffedObjects && reffedObjects.length > 0) {
            cpyCxt.copyNewObjectsForDirectObject(reffedObjects);
        }
    }
}

/**
 * Append PDF Pages with annotations.
 *
 * @param {any} pdfWriter - Hummus writer.
 * @param {string|any} sourcePDFPath - The path for the output pdfs or Reader stream.
 * @param {any} [options={}] - appendPDFPagesFromPDF options
 */
function appendPDFPagesFromPDFWithAnnotations(pdfWriter, sourcePDFPath, options = {}) {
    const cpyCxt = pdfWriter.createPDFCopyingContext(sourcePDFPath);
    const cpyCxtParser = cpyCxt.getSourceDocumentParser();

    if (options.specificRanges && options.specificRanges.length) {
        for (const [start, end] of options.specificRanges) {
            for (let i = start; i <= end; ++i) {
                appendPDFPageFromPDFWithAnnotations(pdfWriter, sourcePDFPath, i);
            }
        }
    } else {
        for (let i = 0; i < cpyCxtParser.getPagesCount(); ++i) {
            appendPDFPageFromPDFWithAnnotations(pdfWriter, sourcePDFPath, i);
        }
    }
}

exports.ANNOTATION_PREFIX = ANNOTATION_PREFIX;
exports.appendPDFPageFromPDFWithAnnotations = appendPDFPageFromPDFWithAnnotations;
exports.appendPDFPagesFromPDFWithAnnotations = appendPDFPagesFromPDFWithAnnotations;
