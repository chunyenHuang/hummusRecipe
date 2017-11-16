/**
 * @name info
 * @desc Add information to pdf
 * @memberof Recipe
 * @function
 * @param {Object} [options] - The options
 * @param {number} [options.version] - The pdf version
 * @param {string} [options.author] - The author
 * @param {string} [options.title] - The title 
 * @param {string} [options.subject] - The subject
 * @param {string[]} [options.keywords] - The array of keywords
 */
exports.info = function info(options = {}) {
    this.toWriteInfo_ = this.toWriteInfo_ || {};
    Object.assign(this.toWriteInfo_, options);
    return this;
}

exports._writeInfo = function _writeInfo() {
    const options = this.toWriteInfo_ || {};
    let oldInfo;
    if (!this.isNewPDF) {
        // reuse copyCtx?
        const copyCtx = this.writer.createPDFCopyingContext(this.src);
        oldInfo = copyCtx.getSourceDocumentParser().queryDictionaryObject(
            copyCtx.getSourceDocumentParser().getTrailer(), "Info"
        ).toJSObject();
    }
    const infoDictionary = this.writer.getDocumentContext().getInfoDictionary();
    const fields = [{
        key: 'author',
        type: 'string'
    }, {
        key: 'title',
        type: 'string'
    }, {
        key: 'subject',
        type: 'string'
    }, {
        key: 'keywords',
        type: 'array'
    }];
    const ignores = [
        'CreationDate', 'Creator', 'ModDate', 'Producer'
    ];

    if (oldInfo) {
        Object.getOwnPropertyNames(oldInfo).forEach((key) => {
            if (!oldInfo[key]) return;
            const oldInforSrc = this._parseObjectByType(oldInfo[key]);
            if (!oldInforSrc) return;
            switch (key) {
                case 'Trapped':
                    if (oldInforSrc && oldInforSrc.value) {
                        infoDictionary.trapped = oldInforSrc.value;
                    }
                    break;
                case 'CreationDate':
                    if (oldInforSrc && oldInforSrc.value) {
                        infoDictionary.setCreationDate(oldInforSrc.value);
                    }
                    break;
                case 'ModDate':
                    if (oldInforSrc && oldInforSrc.value) {
                        infoDictionary.addAdditionalInfoEntry(`source-${key}`, oldInforSrc.value);
                    }
                    break;
                case 'Creator':
                    if (oldInforSrc && oldInforSrc.toText) {
                        infoDictionary.addAdditionalInfoEntry(`source-${key}`, oldInforSrc.toText());
                    }
                    break;
                case 'Producer':
                    if (oldInforSrc && oldInforSrc.toText) {
                        infoDictionary.addAdditionalInfoEntry(`source-${key}`, oldInforSrc.toText());
                    }
                    break;
                default:
                    infoDictionary[key.toLowerCase()] = oldInforSrc.toText();
            }
        });
    }

    if (this.isNewPDF) {
        infoDictionary.setCreationDate(new Date());
    }
    infoDictionary.setModDate(new Date());
    infoDictionary.producer = 'PDFHummus (https://github.com/galkahana/HummusJS)';
    infoDictionary.creator = 'Hummus-Recipe (https://github.com/chunyenHuang/hummusRecipe)';

    fields.forEach((item) => {
        value = options[item.key];
        if (!value) {
            return;
        } else {
            switch (item.type) {
                case 'string':
                    value = value.toString();
                    break;
                case 'date':
                    value = new Date(value);
                    break;
                case 'array':
                    value = (Array.isArray(value)) ? value : [value];
                    break;
                default:
            }
        }
        if (item.func) {
            infoDictionary[item.func](value);
        } else {
            infoDictionary[item.key] = value;
        }
    });
    return this;
}

/**
 * @name custom
 * @desc Add custom information to pdf
 * @memberof Recipe
 * @function
 * @param {string} [key] - The key
 * @param {string} [value] - The value 
 */
exports.custom = function custom(key, value) {
    const infoDictionary = this.writer.getDocumentContext().getInfoDictionary();
    infoDictionary.addAdditionalInfoEntry(key.toString(), value.toString());
    return this;
}

exports._parseObjectByType = function _parseObjectByType(inObject) {
    const hummus = this.hummus;
    const pdfReader = this.pdfReader;
    switch (inObject.getType()) {
        case hummus.ePDFObjectIndirectObjectReference:
            const objectID = inObject.toPDFIndirectObjectReference().getObjectID();
            const parsed = pdfReader.parseNewObject(objectID);
            return this._parseObjectByType(parsed);
        case hummus.ePDFObjectArray:
            break;
        case hummus.ePDFObjectDictionary:
            break;
        case hummus.ePDFObjectStream:
            break;
        default:
            return inObject;
    }
}
