const hummus = require('hummus');
const fs = require('fs');

/**
 * Encrypt the pdf
 * @name encrypt
 * @function
 * @memberof Recipe
 * @param {Object} options - The options
 * @param {string} [options.password] - The password for viewing.
 * @param {string} [options.ownerPassword] - The password for editing.
 * @param {number} [options.userProtectionFlag] - The flag for the security level.
 */
exports.encrypt = function encrypt(options = {}) {
    this.needToEncrypt = true;
    this.encryption_ = {
        userProtectionFlag: 4
    };
    const password = options.password || options.ownerPassword;
    if (password) {
        this.encryption_.password = password;
        this.encryption_.ownerPassword = password;
    }
    if (options.userPassword) {
        this.encryption_.userPassword = options.userPassword;
    }
    if (options.userProtectionFlag) {
        this.encryption_.userProtectionFlag = options.userProtectionFlag;
    }

    return this;
};

// http://pdfhummus.com/post/147451287581/hummus-1058-and-pdf-writer-updates-encryption
exports._encrypt = function _encrypt() {
    if (!this.encryption_) {
        return;
    }
    if (!this.encryption_.userPassword) {
        this.encryption_.userPassword = '';
    }
    const tmp = this.output + '.tmp.pdf';
    fs.renameSync(this.output, tmp);
    hummus.recrypt(tmp, this.output, this.encryption_);
    fs.unlinkSync(tmp);
};
