
const Color = class Color {
    constructor() {}

    static fill(ctx, colorModel) {
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
    }

    static stroke(ctx, colorModel) {
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
    }
};

exports.Color = Color;

exports.xObjectForm = class xObjectForm {
    constructor(pdfWriter, width = 100, height = 100) {
        const xObject = pdfWriter.createFormXObject(0, 0, width, height);
        xObject.pdfWriter = pdfWriter;
        xObject.getGsName = this.getGsName;
        xObject.getCsName = this.getCsName;
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

    getCsName(csId) {
        const resourcesDict = this.getResourcesDictinary();
        const csName = resourcesDict.addColorSpaceMapping(csId);
        return csName;
    }

    end() {
        this.pdfWriter.endFormXObject(this);
    }

    fill(colorModel) {
        const ctx = this.getContentContext();
        switch (colorModel.colorspace) {

            default:
                Color.fill(ctx, colorModel);
                break;

            case 'separation':
                ctx.cs(this.getCsName(colorModel.colorspaceId));
                ctx.scn(1);
                break;
        }
        return this;
    }

    stroke(colorModel) {
        const ctx = this.getContentContext();
        switch (colorModel.colorspace) {

            default:
                Color.stroke(ctx, colorModel);
                break;

            case 'separation':
                ctx.CS(this.getCsName(colorModel.colorspaceId));
                ctx.SCN(1);
                break;
        }
        return this;
    }
};
