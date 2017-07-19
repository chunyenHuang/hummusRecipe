exports._writeAnnotations = function _writeAnnotations() {
    this.annotationsToWrite.forEach((annot) => {
        this._annot(annot.subtype, annot.args, annot.pageNumber);
    });
    this.annotations.forEach((pageAnnots, index) => {
        this._writeAnnotation(index);
    });
}

exports._writeAnnotation = function _writeAnnotation(pageIndex) {
    const pdfWriter = this.writer;
    const copyingContext = pdfWriter.createPDFCopyingContextForModifiedFile();
    const pageID = copyingContext.getSourceDocumentParser().getPageObjectID(pageIndex);
    const pageObject = copyingContext.getSourceDocumentParser().parsePage(pageIndex).getDictionary().toJSObject();
    const objectsContext = pdfWriter.getObjectsContext();
    objectsContext.startModifiedIndirectObject(pageID);
    const modifiedPageObject = pdfWriter.getObjectsContext().startDictionary();
    Object.getOwnPropertyNames(pageObject).forEach((element) => {
        const ignore = ['Annots'];
        if (ignore) {
            modifiedPageObject.writeKey(element);
            copyingContext.copyDirectObjectAsIs(pageObject[element]);
        }
    });

    modifiedPageObject.writeKey('Annots');
    objectsContext.startArray();
    if (pageObject['Annots'] && pageObject['Annots'].toJSArray) {
        pageObject['Annots'].toJSArray().forEach((annot) => {
            objectsContext.writeIndirectObjectReference(annot.getObjectID());
        });
    }
    this.annotations[pageIndex].forEach((item) => {
        objectsContext.writeIndirectObjectReference(item);
    });

    objectsContext
        .endArray()
        .endLine()
        .endDictionary(modifiedPageObject)
        .endIndirectObject();
}

exports._startDictionary = function _startDictionary(pageNumber) {
    this.objectsContext = this.writer.getObjectsContext();
    this.dictionaryObject = this.objectsContext.startNewIndirectObject();
    this.dictionaryContext = this.objectsContext.startDictionary();
}

exports._endDictionary = function _endDictionary(pageNumber) {
    this.objectsContext
        .endDictionary(this.dictionaryContext)
        .endIndirectObject();
    const pageIndex = pageNumber - 1;
    this.annotations[pageIndex] = this.annotations[pageIndex] || [];
    this.annotations[pageIndex].push(this.dictionaryObject);
}

exports.comment = function comment(text = '', x, y, options = {}) {
    this.annotationsToWrite.push({
        subtype: 'Text',
        pageNumber: this.pageNumber,
        args: { text, x, y, options: Object.assign({ icon: 'Comment' }, options) }
    });
    return this;
}

exports._annot = function _annot(subtype, args = {}, pageNumber) {
    this._startDictionary(pageNumber);
    const { x, y, text, options } = args;
    const { nx, ny } = this._calibrateCoorinate(x, y, 0, 0, pageNumber);
    const params = Object.assign({
        title: '',
        date: new Date(),
        open: false,
        flag: 'readonly'
    }, options);

    // TODO: support for rich texst
    const textContent = this.writer.createPDFTextString(text).toBytesArray();
    const position = [nx, ny, nx, ny];

    this.dictionaryContext
        .writeKey('Type')
        .writeNameValue('Annot')
        .writeKey('Subtype')
        .writeNameValue(subtype)
        .writeKey('L')
        .writeBooleanValue(true)
        .writeKey('Rect')
        .writeRectangleValue(position)
        .writeKey('Contents')
        .writeLiteralStringValue(textContent)
        .writeKey('T')
        .writeLiteralStringValue(this.writer.createPDFTextString(params.title).toBytesArray())
        .writeKey('M')
        .writeLiteralStringValue(this.writer.createPDFDate(params.date).toString())
        .writeKey('Open')
        .writeBooleanValue(params.open)
    // .writeKey('F')
    // .writeIntegerValue(getFlagBitNumberByName(params.flag))
    // Comment, Key, Note, Help, NewParagraph, Paragraph, Insert       
    if (params.icon) {
        this.dictionaryContext
            .writeKey('Name')
            .writeNameValue(params.icon);
    }
    this._endDictionary(pageNumber);
}

function getFlagBitNumberByName(name) {
    // 12.5.3 Annotation Flags
    switch (name.toLowerCase()) {
        case 'invisible':
            return 1;
        case 'hidden':
            return 2;
        case 'print':
            return 4;
        case 'nozoom':
            return 8;
        case 'norotate':
            return 16;
        case 'noview':
            return 32;
        case 'readonly':
            return 64;
        case 'locked':
            return 128;
        case 'togglenoview':
            return 256;
            // 1.7+
            // case 'lockedcontents':
            //     return 512;
        default:
            return 0;
    }
}
