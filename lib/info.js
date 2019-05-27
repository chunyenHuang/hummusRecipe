const fs = require('fs');
const hummus = require('hummus');
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
};

exports._writeInfo = function _writeInfo() {
    const options = this.toWriteInfo_ || {};
    let oldInfo;
    /*
        #41, #48
        This issue is due to the unhandled process exit from HummusJS.
        I have to disable this part before it gets fixed in HummusJS.
    */
    if (!this.isNewPDF) {
        // reuse copyCtx?
        const copyFrom = this.isBufferSrc ? new hummus.PDFRStreamForBuffer(this.src) : this.src;
        const copyCtx = this.writer.createPDFCopyingContext(copyFrom, options);
        const infoDict = copyCtx.getSourceDocumentParser().queryDictionaryObject(
            copyCtx.getSourceDocumentParser().getTrailer(), 'Info'
        );
        oldInfo = (infoDict && infoDict.toJSObject) ? infoDict.toJSObject() : null;
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
    // const ignores = [
    //     'CreationDate', 'Creator', 'ModDate', 'Producer'
    // ];

    if (oldInfo) {
        Object.getOwnPropertyNames(oldInfo).forEach((key) => {
            if (!oldInfo[key]) {
                return;
            }
            const oldInforSrc = this._parseObjectByType(oldInfo[key]);
            if (!oldInforSrc) {
                return;
            }
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
                    if (oldInforSrc && oldInforSrc.toText) {
                        infoDictionary[key.toLowerCase()] = oldInforSrc.toText();
                    }
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
        let value = options[item.key];
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
};

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
};

exports.structure = function structure(output) {
    // PDF file format http://lotabout.me/orgwiki/pdf.html
    // const outputFileType = path.extname(output);
    const outputFile = fs.openSync(output, 'w');
    const hummus = this.hummus;
    const pdfReader = this.pdfReader;

    const tabWidth = '  ';
    const structures = [
        'Info',
        'Root', // catalog
        'Size',
        'Prev',
        'ID',
        // 'Encrypt',
        // 'XRefStm'
    ];

    const write = (item) => {
        const mIteratedObjectIDs = {};
        let mTabLevel = 0;

        const addTabs = () => {
            let output = '';
            for (let i = 0; i < mTabLevel; ++i) {
                output += tabWidth;
            }
            return output;
        };

        const logToFile = (inString) => {
            fs.writeSync(outputFile, addTabs() + inString + '\r\n');
        };

        const iterateObjectTypes = (inObject) => {
            const type = inObject.getType();
            const label = hummus.getTypeLabel(type);
            let output = '';
            let objectID, jsArray, aDictionary, keys;

            switch (type) {
                case hummus.ePDFObjectIndirectObjectReference:
                    ++mTabLevel;
                    objectID = inObject.toPDFIndirectObjectReference().getObjectID();
                    output += `Indirect object reference (${objectID}): `;
                    logToFile(output);
                    if (!mIteratedObjectIDs.hasOwnProperty(objectID)) {
                        mIteratedObjectIDs[objectID] = true;
                        iterateObjectTypes(pdfReader.parseNewObject(objectID));
                    }
                    for (var i = 0; i < mTabLevel; ++i) {
                        output += ' ';
                    }
                    --mTabLevel;
                    return;
                case hummus.ePDFObjectArray:
                    jsArray = inObject.toPDFArray().toJSArray();
                    output += `- ${label} [${jsArray.length}]`;
                    logToFile(output);
                    ++mTabLevel;
                    jsArray.forEach((element) => {
                        iterateObjectTypes(element);
                    });
                    --mTabLevel;
                    break;
                case hummus.ePDFObjectDictionary:
                    aDictionary = inObject.toPDFDictionary().toJSObject();
                    keys = Object.getOwnPropertyNames(aDictionary).join(', ');
                    output += `- ${label} {${keys}}`;
                    logToFile(output);
                    ++mTabLevel;
                    Object.getOwnPropertyNames(aDictionary).forEach((element) => {
                        logToFile(element + ' *');
                        iterateObjectTypes(aDictionary[element]);
                    });
                    --mTabLevel;
                    break;
                case hummus.ePDFObjectStream:
                    output += 'Stream . iterating stream dictionary:';
                    logToFile(output);
                    iterateObjectTypes(inObject.toPDFStream().getDictionary());
                    break;
                default:
                    output += `${tabWidth}${label}: ${inObject}`;
                    logToFile(output);
            }
        };

        const itemTrailer = pdfReader.queryDictionaryObject(pdfReader.getTrailer(), item);
        logToFile(item);
        iterateObjectTypes(itemTrailer);
    };

    structures.forEach((item) => {
        write(item);
    });

    fs.closeSync(outputFile);
    return this;
};

exports._parseObjectByType = function _parseObjectByType(inObject) {
    if (!inObject) {
        return;
    }
    const hummus = this.hummus;
    const pdfReader = this.pdfReader;
    const type = inObject.getType();
    const label = hummus.getTypeLabel(type);
    const saveToObject = this.pdfStructure || {};
    let objectID, parsed, dictionaryObject, dictionary;
    switch (type) {
        case hummus.ePDFObjectIndirectObjectReference:
            objectID = inObject.toPDFIndirectObjectReference().getObjectID();
            parsed = pdfReader.parseNewObject(objectID);
            return this._parseObjectByType(parsed);
        case hummus.ePDFObjectArray:
            inObject.toPDFArray().toJSArray().forEach((element) => {
                this._parseObjectByType(element);
            });
            break;
        case hummus.ePDFObjectDictionary:
            dictionaryObject = inObject.toPDFDictionary().toJSObject();
            Object.getOwnPropertyNames(dictionaryObject).forEach((element) => {
                this._parseObjectByType(dictionaryObject[element]);
            });
            break;
        case hummus.ePDFObjectStream:
            dictionary = inObject.toPDFStream().getDictionary();
            return this._parseObjectByType(dictionary);
        default:
            saveToObject[`${label}-${Date.now()*Math.random()}`] = inObject;
            return inObject;
    }
};
