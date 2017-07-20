const fs = require('fs');
const path = require('path');
const Recipe = require('./Recipe');
loadPrototypes();
module.exports = Recipe;

function loadPrototypes() {
    const ignores = ['Recipe.js', 'index.js', 'xObjectForm.js'];
    fs.readdirSync(__dirname)
        .filter((file) => {
            return file[0] != '.' && !ignores.includes(file);
        })
        .forEach((file) => {
            const module = require(path.join(__dirname, file));
            for (let key in module){
                if(Recipe.prototype[key]){
                    throw `Found conflict prototypes=${key} in ${file}.`;
                }
                Recipe.prototype[key] = module[key];
            }
        });
}
