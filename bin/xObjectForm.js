module.exports = class xObjectForm {
    constructor(pdfWriter, width = 100, height = 100) {
        const xObject = pdfWriter.createFormXObject(0, 0, width, height);
        xObject.pdfWriter = pdfWriter;
        xObject.getGsName = this.getGsName;
        xObject.end = this.end;
        return xObject;
    }

    getGsName(gsId) {
        const resourcesDict = this.getResourcesDictinary();
        const gsName = resourcesDict.addExtGStateMapping(gsId);
        return gsName;
    }

    end() {
        this.pdfWriter.endFormXObject(this);
    }
}