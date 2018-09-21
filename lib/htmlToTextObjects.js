const DOMParser = require('xmldom').DOMParser;

exports.htmlToTextObjects = function(htmlCodes) {
    htmlCodes = htmlCodes
        .replace(/<br\/?>/g, '<p>[@@DONOT_RENDER_THIS@@]</p>');

    const nodes = new DOMParser().parseFromString(htmlCodes);
    const textObjects = parseNode(nodes).childs;
    return textObjects;
};

function getFontSizeRatio(tagName = '') {
    const fontSizeRatio = {
        p: 1, // 14px
        h1: 2.57, // 36px
        h2: 2.14, // 30px
        h3: 1.71, // 24px
        small: 0.7
        // h4: 1.12,
        // h5: 0.83,
        // h6: 0.75
    };
    const matched = fontSizeRatio[tagName.toLowerCase()];
    return (matched) ? matched : 1;
}

function needsLineBreaker(tagName = '') {
    const lineBreakers = [
        'p', 'li', 'h1', 'h2', 'h3'
    ];
    return lineBreakers.includes(tagName);
}

function isBoldTag(tagName = '') {
    const boldTags = ['b', 'strong', 'em'];
    return boldTags.includes(tagName);
}

function parseNode(node) {
    const attributes = [];
    const styles = {};
    for (let i in node.attributes) {
        if (!isNaN(i)) {
            attributes.push({
                name: node.attributes[i].nodeName,
                value: node.attributes[i].nodeValue
            });
            if (node.attributes[i].nodeName == 'style') {
                const styleValues = node.attributes[i].nodeValue.split(';');
                styleValues.forEach((element) => {
                    if (element && element != '') {
                        element = element.split(':');
                        const key = element[0];
                        let value = element[1].replace(/ /g, '');
                        if (key == 'color') {
                            if (value.search('rgb') > -1) {
                                value = value
                                    .replace(/rgba?\(/, '')
                                    .replace(/\)/, '')
                                    .split(',')
                                    .map(item => parseFloat(item));
                                if (value.length > 3) {
                                    styles['opacity'] = value.pop();
                                }
                            }
                        }
                        styles[key] = value;
                    }
                });
            }
        }
    }
    let value = (node.data) ? node.data.replace(/^\s*/gm, '') : null;
    if (value && value.charCodeAt(0) == 8203) { // zero width space
        value = value.substring(1);
    }
    const parsedData = {
        value,
        tag: node.tagName,
        isBold: isBoldTag(node.tagName),
        isItalic: (node.tagName == 'i'),
        underline: (node.tagName == 'u'),
        attributes,
        styles,
        needsLineBreaker: needsLineBreaker(node.tagName),
        sizeRatio: getFontSizeRatio(node.tagName),
        link: (node.tagName == 'a') ? node.attributes[0].value : null,
        childs: []
    };
    for (let num in node.childNodes) {
        parsedData.childs.push(
            parseNode(node.childNodes[num])
        );
    }
    const ignoreValue = [
        '\n', '\n\n'
    ];
    parsedData.childs = parsedData.childs.filter(item => {
        return item.tag ||
            (item.value && !ignoreValue.includes(item.value.replace(/ /g, '')));
    });
    return parsedData;
}
