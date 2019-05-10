module.exports = class xObjectForm {
    constructor(pdfWriter, width = 100, height = 100) {
        const xObject = pdfWriter.createFormXObject(0, 0, width, height);
        xObject.pdfWriter = pdfWriter;
        xObject.getGsName = this.getGsName;
        xObject.end = this.end;
        xObject.get = this.get;
        xObject.set = this.set;
        xObject.fill = this.fill;
        xObject.stroke = this.stroke;
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

    fill(colorModel) {
        const ctx = this.getContentContext();
        switch (colorModel.colorspace) {
            case 'rgb':
                ctx.rg(colorModel.r, colorModel.g, colorModel.b);
                break;
        
            case 'cmyk':
                ctx.k(colorModel.c, colorModel.m, colorModel.y, colorModel.k);
                break;
            
            case 'gray':
                ctx.g(colorModel.gray);
                break;
        }
        return this;
    }
    
    stroke(colorModel) {
        const ctx = this.getContentContext();
        switch (colorModel.colorspace) {
            case 'rgb':
                ctx.RG(colorModel.r, colorModel.g, colorModel.b);
                break;
        
            case 'cmyk':
                ctx.K(colorModel.c, colorModel.m, colorModel.y, colorModel.k);
                break;
            
            case 'gray':
                ctx.G(colorModel.gray);
                break;
        }
        return this;
    }
};
