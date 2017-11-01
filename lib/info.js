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
        if (oldInfo.Author) {
            infoDictionary.author = oldInfo.Author.toText();
        }
        if (oldInfo.Title) {
            infoDictionary.title = oldInfo.Title.toText();
        }
        if (oldInfo.Subject) {
            infoDictionary.subject = oldInfo.Subject.toText();
        }
        if (oldInfo.Keywords) {
            infoDictionary.keywords = oldInfo.Keywords.toText();
        }
        if (oldInfo.Trapped) {
            infoDictionary.trapped = oldInfo.Trapped.value;
        }
        Object.getOwnPropertyNames(oldInfo).forEach((key) => {
            if (!oldInfo[key]) return;
            if (key == 'CreationDate') {
                infoDictionary.setCreationDate(oldInfo[key].value);
            } else
            if (key == 'ModDate') {
                infoDictionary.addAdditionalInfoEntry(`source-${key}`, oldInfo[key].value);
            } else
            if (ignores.includes(key)) {
                infoDictionary.addAdditionalInfoEntry(`source-${key}`, oldInfo[key].toText());
            } else
            if (!fields.find(item => item.key == key.toLowerCase())) {
                infoDictionary.addAdditionalInfoEntry(key, oldInfo[key].toText());
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
