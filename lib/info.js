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
exports.info = function _writeInfo(options = {}) {
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
        // }, {
        //     key: 'createdAt',
        //     type: 'date',
        //     func: 'setCreationDate'
        // }, {
        //     key: 'modifiedAt',
        //     type: 'date',
        //     func: 'setModDate'
    }];

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

exports.custom = function custom(key, value) {
    const infoDictionary = this.writer.getDocumentContext().getInfoDictionary();
    infoDictionary.addAdditionalInfoEntry(key.toString(), value.toString());
    return this;
}
