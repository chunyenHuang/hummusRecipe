//  Table indicating how to specify coloration of elements
//  -------------------------------------------------------------------
// |Color | HexColor   | DecimalColor                   | PercentColor |
// |Space | (string)   | (array)                        | (string)     |
// |------+------------+--------------------------------+--------------|
// | Gray | #GG        | [gray]                         | %G           |
// |  RGB | #rrggbb    | [red, green, blue]             | %r,g,b       |
// | CMYK | #ccmmyykk  | [cyan, magenta, yellow, black] | %c,m,y,k     |
//  -------------------------------------------------------------------
//
//   HexColor component values (two hex digits) range from 00 to FF.
//   DecimalColor component values range from 0 to 255.
//   PercentColor component values range from 1 to 100.

/**
 * Draw a polygon
 * @name polygon
 * @function
 * @memberof Recipe
 * @param {number[]} coordinates - The array of coordinate [[x,y], [m,n]]
 * @param {Object} [options] - The options
 * @param {string|number[]} [options.color] - HexColor, PercentColor or DecimalColor
 * @param {string|number[]} [options.stroke] - HexColor, PercentColor or DecimalColor
 * @param {string|number[]} [options.fill] - HexColor, PercentColor or DecimalColor
 * @param {number} [options.lineWidth] - The line width
 * @param {number} [options.opacity] - The opacity
 * @param {number[]} [options.dash] - The dash style [number, number]
 * @param {number} [options.rotation] - Accept: +/- 0 through 360. Default: 0
 * @param {number[]} [options.rotationOrigin] - [originX, originY] Default: x, y
 */
exports.polygon = function polygon(coordinates = [], options = {}) {
    // close polygon
    if (this._getDistance(coordinates[0], coordinates[coordinates.length - 1]) != 0) {
        coordinates.push(coordinates[0]);
    }
    let boundBox = [ /*minX, minY, maxX, maxY*/ ];
    coordinates.forEach((coord, index) => {
        if (index === 0) {
            boundBox = [coord[0], coord[1], coord[0], coord[1]];
        }
        boundBox[0] = (boundBox[0] > coord[0]) ? coord[0] : boundBox[0];
        boundBox[1] = (boundBox[1] > coord[1]) ? coord[1] : boundBox[1];
        boundBox[2] = (boundBox[2] < coord[0]) ? coord[0] : boundBox[2];
        boundBox[3] = (boundBox[3] < coord[1]) ? coord[1] : boundBox[3];
    });

    if(options.deltaYY) {
        boundBox[3] += options.deltaYY
        delete options['deltaYY'];  // keeps other calls to here safe
    }

    const pathOptions = this._getPathOptions(options);
    let colorModel = pathOptions.colorModel;
    const margin = pathOptions.width * 2;
    const width  = Math.abs(boundBox[2] - boundBox[0]) + margin * 2;
    const height = Math.abs(boundBox[3] - boundBox[1]) + margin * 2;
    const startX = boundBox[0] - margin;
    const startY = boundBox[1] + height - margin;
    const { nx, ny } = this._calibrateCoordinate(startX, startY);

    const drawPolygon = (context, coordinates) => {
        coordinates.forEach((coord, index) => {
            let nx = coord[0];
            let ny = coord[1];
            if (index === 0) {
                context.m(nx - startX,  startY -ny );
            } else {
                context.l(nx - startX,  startY -ny);
            }
        });
    };

    const setPathOptions = (context) => {
        context
            .J(1)
            .j(1)
            .d(pathOptions.dash, pathOptions.dashPhase)
            .M(1.414);
    };

    pathOptions.originX = nx + width/2;  // default rotation point
    pathOptions.originY = ny + height/2;

    if (options.fill) {

        if (pathOptions.fill !== undefined) {
            colorModel = pathOptions.fillModel;
        }

        this._drawObject(this, nx, ny, width, height, pathOptions, (ctx, xObject) => {
            ctx.gs(xObject.getGsName(pathOptions.fillGsId)),
            setPathOptions(ctx);
            xObject.fill(colorModel);
            drawPolygon(ctx, coordinates);
            ctx.f();
        });
    }

    if (options.stroke || options.color || !options.fill) {

        if (pathOptions.stroke !== undefined) {
            colorModel = pathOptions.strokeModel;
        }

        this._drawObject(this, nx, ny, width, height, pathOptions, (ctx, xObject) => {
            ctx.w(pathOptions.width);
            setPathOptions(ctx);
            xObject.stroke(colorModel);
            drawPolygon(ctx, coordinates);
            ctx.s();
        });
    }

    return this;
};

/*  N-Gon border box for odd numbered side shapes used to deal with object rotation.

  --------------------------------------------------------------  =========
 | m  ---------------------------o----------------------------  |        |
 | |  -------------------------- | -------------------------  | |        |
 | | |                           |                          | | |        |
 | | |                           |                          | | |        |
 | | |                           |                          | | |        |
 | | |                           |                          | | |        |
 | | |                           |                          | | |        |
 | | |                           |                          | | |        |
 | | |                  radius   |                          | | |        |
 | | |                           |                          | | |        |
 | | |                           |                          | | |        |
 | | |                           |                          | | |        
 | | |                           |                          | | |      height
 | | |                           |                          | | |        
 | | |                           |                          | | |        |
 | | |                           |                          | | |        |
 | | |                        -- o --  n-gon center         | | |        |
 | | |                           |                          | | |        |
 | | |                           |                          | | |        |
 | | |                           |                          | | |        |
 | | |                           |                          | | |        |
 | |  -------------------------- | -------------------------  | | ====   |
 |  --------o------------------- | -------------------------- M |  lw    |
 | -------- | ------------------ | -----------------------------  ====   |
 | | |      |                    |                          | | |        |
 | | |      |                    |                          | | |        |
 | | |      |                    |                          | | |        |
 | | |      |  deltaYY           |                          | | |        |
 | | |      |                    |                          | | |        |
 | | |      |                    |                          | | |        |
 | | |      |                    |                          | | |        |
 | |  ----- | ------------------ | -------------------------  | |        |
 |  --------o--------------------o----------------------------  |        |
 S -------------------------------------------------------------  =========
 
 |============================ width ===========================|

   Legend:
      m   minimum x, y of original border box (minX, minY)
      M   maximum x, y of original border box (maxX, maxY)
      S   starting origin of final border box
      lw  line width

The even number sided polygons have no trouble rotating due to the fact that
their border box coincides with the n-gon center point. That is not the case
for odd number sided polygons. In this case a deltaYY value must be computed
to produce a final border box with a center that coincides with n-gon center. 

      deltaYY = minY + radius * 2 - maxY

*/

function odd(n) {return (n % 2 !== 0)}

function _n_gon(sides, cx, cy, radius, options={}) {
    
    let lineWidth = 0;
    const toRadians = (angle) => {
        return angle * (Math.PI / 180);
    };

    const endPoint = (x, y, l, angle) => {
        const radians = toRadians(angle)
        return {x: x + l * Math.cos(radians), y: y + l * Math.sin(radians)}
    };

    if (options.stroke || options.color || !options.fill) {
        lineWidth = (options.lineWidth) ? options.lineWidth 
                  : (options.width)     ? options.width 
                  : 2;
    }
    
    let ngon = [];
    let angle = 360 / sides;
    let startingAngle = (odd(sides)) ? 270 : 270 - (angle/2);
    let n_radius = radius - lineWidth/2;

    for (let i = 0; i < sides; i++) {
        const {x,y} = endPoint(cx, cy, n_radius, startingAngle+ angle*i);
        ngon.push([x,y]);
    }

    options.deltaYY = 0;  // used in polygon to deal with ngon rotation
    
    if (options.rotation !== undefined && odd(sides)) {
        let boundBox = [ /*minX, minY, maxX, maxY*/ ];
        ngon.forEach((coord, index) => {
            if (index === 0) {
                boundBox = [coord[0], coord[1], coord[0], coord[1]];
            }
            boundBox[0] = (boundBox[0] > coord[0]) ? coord[0] : boundBox[0];
            boundBox[1] = (boundBox[1] > coord[1]) ? coord[1] : boundBox[1];
            boundBox[2] = (boundBox[2] < coord[0]) ? coord[0] : boundBox[2];
            boundBox[3] = (boundBox[3] < coord[1]) ? coord[1] : boundBox[3];
        });

        options.deltaYY = boundBox[1] + n_radius*2 - boundBox[3];
    }
 
    if (options.rotationVertice) {
        options.rotationOrigin = ngon[(options.rotationVertice-1)%(sides)]
    }

    return ngon;
}

/**
 * Draw an N-sided regular polygon
 * @name n_gon
 * @function
 * @memberof Recipe
 * @param {number} cx x-coordinate of center point of regular polygon
 * @param {number} cy y-coordinate of center point of regular polygon
 * @param {number} radius - The radius, distance from the center of the polygon to a vertice.
 * @param {number} [sides] - the number of sides of the regular polygon (default is 3)
 * @param {Object} [options] - The options
 * @param {string|number[]} [options.color] - HexColor or DecimalColor
 * @param {string|number[]} [options.stroke] - HexColor or DecimalColor
 * @param {string|number[]} [options.fill] - HexColor or DecimalColor
 * @param {number} [options.lineWidth] - The line width
 * @param {number} [options.opacity] - The opacity
 * @param {number[]} [options.dash] - The dash style [number, number]
 * @param {number} [options.rotation] - Accept: +/- 0 through 360. Default: 0
 * @param {number[]} [options.rotationOrigin] - [originX, originY] Default: x, y
 * @param {number} [options.rotationVertice] - the number of the vertice to be used as rotation origin
 * @param {number} [options.skewX] - the angle skew off the x-axis
 * @param {number} [options.skewY] - the angle skew off the y-axis.
 */
exports.n_gon = function n_gon(cx, cy, radius, sides=3, options={}) {

    const MIN_SIDES = 3;

    // Handle optional 'sides' event when options present.
    if (typeof sides === 'object') {
        options = sides;
        sides = MIN_SIDES;
    }

    if (sides < MIN_SIDES) {
        sides = MIN_SIDES;
    }

    const ngon = _n_gon(sides, cx, cy, radius, options);

    this.polygon(ngon, options);

    if (options.rotationVertice) {
        delete options['rotationOrigin'];  // cleanup n-gon generated point
    }

    if (options.debug) {
        this.circle(cx,cy,radius,{width:1, stroke:"#00ff00"})
        this.circle(cx,cy,2,{fill:"#ff0000"});
    }

    return this;
}

function _oddStar(ngon) {
    let starPath = [];
    let points = ngon.length;
    let interval = Math.floor(points/2);

    for (let i = 0; i < points; i++) {
        starPath.push( ngon[i*interval % points]);
    }

    return starPath;
}

/**
 * Draw an N pointed star
 * @name n_gon
 * @function
 * @memberof Recipe
 * @param {number} cx x-coordinate of center point of regular polygon
 * @param {number} cy y-coordinate of center point of regular polygon
 * @param {number} [points] - number of points on star (default 5)
 * @param {Object} [options] - The options
 * @param {string|number[]} [options.color] - HexColor or DecimalColor
 * @param {string|number[]} [options.stroke] - HexColor or DecimalColor
 * @param {string|number[]} [options.fill] - HexColor or DecimalColor
 * @param {number} [options.lineWidth] - The line width
 * @param {number} [options.opacity] - The opacity
 * @param {number[]} [options.dash] - The dash style [number, number]
 * @param {number} [options.rotation] - Accept: +/- 0 through 360. Default: 0
 * @param {number[]} [options.rotationOrigin] - [originX, originY] Default: x, y
 * @param {number} [options.skewX] - the angle skew off the x-axis
 * @param {number} [options.skewY] - the angle skew off the y-axis.
 */
exports.star = function star(cx, cy, radius, points=5, options={}) {
    let starPath = [];
    let ngon;

    const MIN_POINTS = 5;

    // Handle optional 'points' event when options present.
    if (typeof points === 'object') {
        options = points;
        points = MIN_POINTS;
    }

    if (points < MIN_POINTS) {
        points = MIN_POINTS;
    }

    const starOptions = Object.assign({}, options);
    
    if (odd(points)) {
        starPath = _oddStar(_n_gon(points, cx, cy, radius, options));
    } else {
        let offset = -1;
        let halfPoints = points / 2;
        let interval = halfPoints - 1;

        let userRotation = (options.rotation) ? options.rotation : 0;

        if (odd(halfPoints)) {
            starOptions.rotation = 0 + userRotation;
            ngon = _n_gon(halfPoints, cx, cy, radius, starOptions);
            let deltaY = starOptions.deltaYY;
            
            if (halfPoints === 3) {
                starPath = ngon;
            } else {
                starPath = _oddStar(ngon)
            }

            this.polygon(starPath, starOptions);
            starOptions.rotation += (360 / points);
            starOptions.deltaYY = deltaY;

        } else {
            // Want a point of star to be top-most
            starOptions.rotation = (360 / points / 2) + userRotation;
            ngon = _n_gon(points, cx, cy, radius);

            for (let i = 0; i < points; i++) {
                let j = i * interval % points;
                if(j === 0) {
                    offset++;
                    if ( offset > 0) {
                        this.polygon(starPath, starOptions);
                        starPath = []
                    }
                }
                starPath.push(ngon[j+offset])
            }
        }
    }

    this.polygon(starPath, starOptions);

    if (options.debug) {
        this.circle(cx,cy,radius,{width:1, stroke:"#00ff00"})
        this.circle(cx,cy,2,{fill:"#ff0000"});
    }

    return this;
}
