module.exports = class xObjectForm {
    constructor(pdfWriter, width = 100, height = 100) {
        const xObject = pdfWriter.createFormXObject(0, 0, width, height);
        xObject.pdfWriter = pdfWriter;
        xObject.getGsName = this.getGsName;
        xObject.end = this.end;
        xObject.get = this.get;
        xObject.set = this.set;
        return xObject;
    }

    set(key, value) {
        this._values = this._values || {};
        this._values[key] = value;
    }

    get(key) {
        this._values = this._values || {};
        return this._values[key];
    }

    getGsName(gsId) {
        const resourcesDict = this.getResourcesDictinary();
        const gsName = resourcesDict.addExtGStateMapping(gsId);
        return gsName;
    }

    end() {
        this.pdfWriter.endFormXObject(this);
    }
};
