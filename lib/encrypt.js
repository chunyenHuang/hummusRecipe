const hummus = require('hummus');
const fs = require('fs');


/**
 * Encryption user access permissions
 * 
 * This function supplies the numeric value for the encrypt function's 'userProtectionFlag'
 * option. When no argument is given, the default 'print' value is used.
 * 
 * @name permission
 * @function
 * @memberof Recipe
 * @param {string} flags from the list print, modify, copy, edit, fillform, extract, assemble, and printbest
 * More than one may be specified by using a comma to separate the names in the input string.
 */
exports.permission = function permission(flags='print') { 

    // https://www.adobe.com/content/dam/acom/en/devnet/pdf/pdfs/PDF32000_2008.pdf

    const userAccessPermissions = {  // see table on page 61 of above document
        'print'    : 1<<2,   // allow printing
        'modify'   : 1<<3,   // allow template creation, signing, filling form fields
        'copy'     : 1<<4,   // allow content copying and copying for accessibility
        'edit'     : 1<<5,   // allow commenting
        'fillform' : 1<<8,   // allow filling of form fields
        'extract'  : 1<<9,   // allow content copying for accessibility
        'assemble' : 1<<10,  // unused
        'printbest': 1<<11   // allow high resolution printing when 'print' is allowed
    };

    const perms = flags.split(',').map((x)=>{return x.trim()});
    let access = 0;
    perms.forEach((perm) => {
        if (!userAccessPermissions[perm]) {
            throw new Error(`Unknown user access permission (${perm})`);
        }
        access += userAccessPermissions[perm];
    })

    return access;
}

exports._getEncryptOptions = function _getEncryptOptions(options, addPermissions=true) {
    const encryptOptions = {};

    const password = options.password || options.ownerPassword;
    if (password) {
        encryptOptions.password = password;
        encryptOptions.ownerPassword = password;
    }

    if (options.userPassword) {
        encryptOptions.userPassword = options.userPassword;
        if (!encryptOptions.password) {
            encryptOptions.password = options.userPassword;
        }
    }

    if (addPermissions) { 
        if (options.userProtectionFlag) {
            encryptOptions.userProtectionFlag = options.userProtectionFlag;
        }
    }

    // Only attach encryption mechanism when attributes 
    // have been explicitly given in the incoming options.
    if (Object.keys(encryptOptions) > 0 && !encryptOptions.userPassword) {
        encryptOptions.userPassword = '';
        if (!encryptOptions.userProtectionFlag) {
            encryptOptions.userProtectionFlag = this.permission();
        }
    }

    return encryptOptions;
}

/**
 * Encrypt the pdf
 * @name encrypt
 * @function
 * @memberof Recipe
 * @param {Object} options - The options
 * @param {string} [options.password] - The permission password.
 * @param {string} [options.ownerPassword] - The password for editing.
 * @param {string} [options.userPassword] - The password for viewing & encryption.
 * @param {number} [options.userProtectionFlag] - The flag for the security level.
 */
exports.encrypt = function encrypt(options = {}) {
    this.needToEncrypt = true;
    this.encryption_ = this._getEncryptOptions(options);

    return this;
};

// http://pdfhummus.com/post/147451287581/hummus-1058-and-pdf-writer-updates-encryption
exports._encrypt = function _encrypt() {
    if (!this.encryption_) {
        return;
    }
    
    const tmp = this.output + '.tmp.pdf';
    fs.renameSync(this.output, tmp);
    hummus.recrypt(tmp, this.output, this.encryption_);
    fs.unlinkSync(tmp);
};
