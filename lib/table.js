function clone(object) {
    return JSON.parse(JSON.stringify(object));
}

function getCellOptions(options, cell = 'cell') {
    const cellOptions = clone(options);

    if (cellOptions[cell]) { // convert cell options to textBox options
        cellOptions.textBox = cellOptions[cell];
        delete cellOptions[cell];
    }
    return cellOptions;
}

function getCellHeight(self, text, column, options) {
    let colOptions = self._merge(options, { textBox: { width: column.width } });
    const originCoord = self._calibrateCoordinate(column.x, column.y, 0, 0, self.pageNumber);
    const pathOptions = self._getPathOptions(colOptions, originCoord.nx, originCoord.ny);
    const textObjects = self._makeTextObject(text, pathOptions.size, colOptions);
    const textBox = self._makeTextBox(colOptions);
    const { textHeight } = self._layoutText(textObjects, textBox, pathOptions);

    return textHeight;
}

function drawTableBorder(self, x, y, width, height, rowLines, options) {
    if (options.border) {
        let borderOptions = (options.border === true) ? {} : options.border;

        if (!borderOptions.width) {
            borderOptions = Object.assign({}, borderOptions, { width: .5 });
        }

        self.rectangle(x, y, width, height, borderOptions);
        const columns = self._layouts['_table_'];

        // Draw verticles
        for (let index = 0; index < columns.length - 1; index++) {
            const column = columns[index];
            self.line([
                [column.x + column.width, y],
                [column.x + column.width, y + height]
            ], borderOptions);
        }
        // Draw horizontals
        for (let index = 0; index < rowLines.length - 1; index++) {
            const yPos = rowLines[index];
            self.line([
                [x, yPos],
                [x + width, yPos]
            ], borderOptions);
        }
    }
}

/**
 * Display text data in tabular form
 * @name table
 * @function
 * @memberof Recipe
 * @param {number} x - The coordinate x used to position table on page
 * @param {number} y - The coordinate y used to position table on page
 * @param {object[]} contents - the data to be placed into the table
 * @param {object} [options] - The options
 * @param {number} [options.height] - The height designation of the table
 * @param {string|string[]} [options.order] - Defines the order of the named columns in the table.
 * It can also be used to choose a subset of the actual data found in the given contents.
 * @param {object[]} [options.columns] - Holds the defining options for columns in the table.
 * @param {string} [options.columns[].name] - The name of the content data field to be associated with the column.
 * This field is mandatory when supplying column options.
 * @param {string} [options.columns[].text] - The title to be applied to the column header.
 * When missing, the data field name is used.
 * @param {number} [options.columns[].width=100] - The width of table column.
 * @param {object} [options.columns[].cell] - Holds the options to be applied to a column table cell.
 * All textBox options from the 'text' interface can be used here.
 * @param {string|number[]} [options.columns[].color] - Text color (HexColor, PercentColor or DecimalColor)
 * @param {number} [options.columns[].opacity=1] - opacity
 * @param {string} [options.columns[].font=Helvetica] - The font. 'Arial', 'Helvetica'...
 * @param {number} [options.columns[].size=14] - The font size
 * @param {function} [options.columns[].renderer] - function to be called which can be used to modify the text options for a particular
 * table cell. The function is called with the parameters (text, data), where 'text' is the text to be written in the cell and
 * 'data' is an object holding all the text elements in the table row. The function returns an object with the text attributes that
 * are to be modified for the table cell.
 * @param {object|boolean} [options.header=false] - When true, the column name associated with a column will
 * appear at the top of the column. When presented as an object it is the set of unique options to be applied to column headers.
 * All 'text' interface options can be used.
 * @param {object} [options.header.cell] - All textBox options from the 'text' interface can be used here.
 * @param {object} [options.border] - Used to define table and cell border characteristics
 * @param {number} [options.border.width=.5] - thickness of lines used in border.Array
 * @param {string|number[]} [options.border.stroke] - line color (HexColor, PercentColor or DecimalColor)
 * @param {function} [options.overflow] - Called when the next table entry is going to expand the table
 * beyond the given height or page boundary. Its parameters are (self, row) where 'self' is the recipe handle so
 * that other recipe interfaces can be called, and the row number of the data which caused the data overflow.
 * The return value can be 'true' which indicates that data processing should stop, or 'false' which indicates that
 * the data should continue being processed with the original [x,y] coordinates, or it can be an object containing
 * a 'position' property indicating the [x,y] coordinates where the next table for the remaining data should start.
 * @param {object} [options.row] - text properties to be applied to all cells in a table row.
 * @param {object} [options.row.cell] - All textBox options from the 'text' interface can be used here.
 * @param {string} [options.row.nth] - 'even|odd', indicating that the properties should be applied only to
 * 'even' or 'odd' rows.
 */
exports.table = function table(x, y, contents, options = {}) {

    let tableBottom = (options.height) ? y + options.height : 0;
    let fields = Object.keys(contents[0]);
    let order = options.order || [];
    let columns = [];

    if (order.length !== 0) {
        if (typeof options.order === 'string') {
            order = options.order.split(',');
        }
    } else {
        if (!options.columns || options.columns.length !== fields.length) {
            order = fields; // all fields emitted, columns in order of first record
        } else {
            // columns in order found in options
            for (const column of options.columns) {
                order.push(column.name);
            }
        }
    }

    for (const field of order) {
        if (fields.includes(field)) {
            let found = false;
            if (options.columns) {
                for (const column of options.columns) {
                    if (column.name && column.name === field) {
                        columns.push(column);
                        found = true;
                        break;
                    }
                }
            }

            if (!found) {
                columns.push({ text: field, name: field });
            }
        }
    }
    this.layout('_table_', x, y, 0, 0, { columns: columns, reset: true });

    const tableWidth =
        this._layouts['_table_'].reduce((width, column) => {
            width += column.width;
            return width;
        }, 0);

    let tableHeight = 0;
    let headerHeight = 0;
    let rowLines = [];
    let currentY = y;
    this._previousTextObjects = [];
    let nth;
    let rowOptions = {};

    if (options.header) {
        // Wade through columns to determine minimum header height
        for (const column of this._layouts['_table_']) {
            let colOptions = clone(column.options.header);
            if (typeof options.header === 'object') {
                const cellOptions = getCellOptions(options.header);
                colOptions = this._merge(colOptions, cellOptions);
            }

            const cellHeight = getCellHeight(this, column.text, column, colOptions);
            headerHeight = Math.max(headerHeight, cellHeight);
        }
    }

    if (options.overflow) {
        this._tableFullNotifier = options.overflow;

        const pageBottom = this.pageInfo(this.pageNumber).height - this._margin.bottom;
        if (tableBottom === 0 || tableBottom > pageBottom) {
            tableBottom = pageBottom;
        }
    }

    if (options.border) {
        options.border.lineCap = 'butt'; // keep borders from extending outside of enclosing box.
    }

    if (options.row) {
        rowOptions = getCellOptions(options.row);

        switch (options.row.nth) {
            case 'even':
                nth = (row) => { return (row % 2 === 0); };
                break;
            case 'odd':
                nth = (row) => { return (row % 2 !== 0); };
                break;
            default:
                nth = () => { return 1; }; // apply to all rows
                break;
        }
    }

    let firstTime = true;
    let row = 0;

    for (const record of contents) {
        let rowHeight = 0;
        row++;

        // Wade through row data to determine row height
        for (const column of this._layouts['_table_']) {
            const field = column.field;
            const text = record[field];
            if (text !== undefined) {
                let colOptions = clone(options);
                colOptions = this._merge(colOptions, clone(column.options));
                if (nth && nth(row)) {
                    colOptions = this._merge(colOptions, clone(rowOptions));
                }
                const cellHeight = getCellHeight(this, text, column, colOptions);
                rowHeight = Math.max(rowHeight, cellHeight);
            }
        }

        // When table gets 'full', let user know when overflow callback provided.
        // They can choose to bail out of table filling loop, or keep on going with
        // appropriate variables reset to initial values. This gives the user the
        // opportunity to change to a new page to continue table production with
        // remaining rows of data.
        if (currentY + rowHeight > tableBottom && this._tableFullNotifier) {
            drawTableBorder(this, x, y, tableWidth, tableHeight, rowLines, options);

            const orders = this._tableFullNotifier(this, row);

            if (orders === true) { return this; } // stop processing table data
            if (orders.position) {
                [x, y] = orders.position;
                let xx = x;
                // Make sure x position adjusted in all columns
                for (const column of this._layouts['_table_']) {
                    column.x = xx;
                    xx += column.width;
                }
            }

            firstTime = true;
            currentY = y;
            tableHeight = 0;
            rowLines = [];
        }

        if (firstTime && options.header) {
            // Display table header
            for (const column of this._layouts['_table_']) {
                let colOptions = clone(column.options.header);
                if (typeof options.header === 'object') {
                    const cellOptions = getCellOptions(options.header);
                    colOptions = this._merge(colOptions, clone(cellOptions));
                }

                // Have header alignment match data alignment?
                if (options.header.alignToData && column.options.textBox.textAlign) {
                    colOptions.textBox.textAlign = column.options.textBox.textAlign;
                }

                // Is there a specific header cell override in this column?
                if (column.options.hcell) {
                    const cellOptions = getCellOptions(column.options, 'hcell');
                    colOptions.textBox = this._merge(colOptions.textBox, clone(cellOptions.textBox));
                }

                colOptions = this._merge(colOptions, { textBox: { minHeight: headerHeight, width: column.width } });
                this.text(column.text, column.x, currentY, colOptions);
            }

            currentY += headerHeight;
            tableHeight += headerHeight;
            rowLines.push(y + tableHeight);
        }

        firstTime = false;

        // Now write out table cells for current record
        for (const column of this._layouts['_table_']) {
            const field = column.field;
            let text = record[field];
            if (text === undefined) { text = ''; }
            let colOptions = clone(options);
            colOptions = this._merge(colOptions, clone(column.options));
            if (nth && nth(row)) {
                colOptions = this._merge(colOptions, clone(rowOptions));
            }
            if (column.options.renderer) {
                let renderOptions = column.options.renderer(text, record, field, row);
                if (renderOptions) {
                    colOptions = this._merge(colOptions, renderOptions);
                }
            }
            colOptions = this._merge(colOptions, { textBox: { minHeight: rowHeight, width: column.width } });
            this.text(text, column.x, currentY, colOptions);
        }

        currentY += rowHeight;
        tableHeight += rowHeight;
        rowLines.push(y + tableHeight);
    }

    drawTableBorder(this, x, y, tableWidth, tableHeight, rowLines, options);

    return this;
};
