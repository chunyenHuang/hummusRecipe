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

function odd(n) { return (n % 2 !== 0); }

function toRadians(angle) { return angle * (Math.PI / 180); }

function toDegrees(radians) { return radians * (180 / Math.PI); }

function endPoint(x, y, l, angle) {
    const radians = toRadians(angle);
    return [(x + l * Math.cos(radians)), (y + l * Math.sin(radians))];
}

function boundingBox(coords) {
    let boundBox = [coords[0][0], coords[0][1], coords[0][0], coords[0][1]];
    for (const coord of coords) {
        boundBox[0] = (boundBox[0] > coord[0]) ? coord[0] : boundBox[0];
        boundBox[1] = (boundBox[1] > coord[1]) ? coord[1] : boundBox[1];
        boundBox[2] = (boundBox[2] < coord[0]) ? coord[0] : boundBox[2];
        boundBox[3] = (boundBox[3] < coord[1]) ? coord[1] : boundBox[3];
    }
    return boundBox;
}

function _n_gon(sides, cx, cy, radius, options = {}) {

    let lineWidth = 0;

    if (options.stroke || options.color || !options.fill) {
        lineWidth = (options.lineWidth) ? options.lineWidth :
            (options.width) ? options.width : 2;
    }

    let ngon = [];
    let angle = 360 / sides;
    let startingAngle = (odd(sides)) ? 270 : 270 - (angle / 2);
    let n_radius = radius - lineWidth / 2;

    for (let i = 0; i < sides; i++) {
        const point = endPoint(cx, cy, n_radius, startingAngle + angle * i);
        ngon.push(point);
    }

    options.deltaYY = 0; // used in polygon to deal with ngon rotation

    if (options.rotation !== undefined && odd(sides)) {
        let boundBox = boundingBox(ngon);

        options.deltaYY = boundBox[1] + n_radius * 2 - boundBox[3];
    }

    if (options.rotationVertice) {
        options.rotationOrigin = ngon[(options.rotationVertice - 1) % (sides)];
    }

    return ngon;
}

/**
 * Draw an N-sided regular polygon
 * @name n_gon
 * @function
 * @memberof Recipe
 * @param {number} cx - x-coordinate of center point of regular polygon
 * @param {number} cy - y-coordinate of center point of regular polygon
 * @param {number} radius - The radius, distance from the center of the polygon to a vertice.
 * @param {number} [sides=3] - the number of sides of the regular polygon
 * @param {Object} [options] - The options
 * @param {string|number[]} [options.color] - HexColor or DecimalColor
 * @param {string|number[]} [options.stroke] - HexColor or DecimalColor
 * @param {string|number[]} [options.fill] - HexColor or DecimalColor
 * @param {number} [options.lineWidth] - The line width
 * @param {number} [options.opacity] - The opacity
 * @param {number[]} [options.dash] - The dash style [number, number]
 * @param {number} [options.rotation=0] - Accept: +/- 0 through 360.
 * @param {number[]} [options.rotationOrigin=[cx,cy]] - [originX, originY]
 * @param {number} [options.rotationVertice] - the number of the vertice to be used as rotation origin
 * @param {number} [options.skewX] - the angle skew off the x-axis
 * @param {number} [options.skewY] - the angle skew off the y-axis.
 */
exports.n_gon = function n_gon(cx, cy, radius, sides = 3, options = {}) {

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
        delete options['rotationOrigin']; // cleanup n-gon generated point
    }

    if (options.debug) {
        this.circle(cx, cy, radius, { width: 1, stroke: '#00ff00' });
        this.circle(cx, cy, 2, { fill: '#ff0000' });
    }

    return this;
};

function _oddStar(ngon) {
    let starPath = [];
    let points = ngon.length;
    let interval = Math.floor(points / 2);

    for (let i = 0; i < points; i++) {
        starPath.push(ngon[i * interval % points]);
    }

    return starPath;
}

/**
 * Draw an N pointed star
 * @name star
 * @function
 * @memberof Recipe
 * @param {number} cx - x-coordinate of center point of regular polygon
 * @param {number} cy - y-coordinate of center point of regular polygon
 * @param {number} [points=5] - number of points on star
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
exports.star = function star(cx, cy, radius, points = 5, options = {}) {
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
                starPath = _oddStar(ngon);
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
                if (j === 0) {
                    offset++;
                    if (offset > 0) {
                        this.polygon(starPath, starOptions);
                        starPath = [];
                    }
                }
                starPath.push(ngon[j + offset]);
            }
        }
    }

    this.polygon(starPath, starOptions);

    if (options.debug) {
        this.circle(cx, cy, radius, { width: 1, stroke: '#00ff00' });
        this.circle(cx, cy, 2, { fill: '#ff0000' });
    }

    return this;
};

function rotate(ox, oy, p, q, angle) {
    let [x, y] = [ox, oy];
    angle = angle % 360; // keep angle within realistic bounds

    if (angle !== 0) {
        [x, y] = [x - p, y - q];
        let theta;
        switch (angle) {
            case 90:
            case -270:
                [x, y] = [-y + p, x + q];
                break;
            case -90:
            case 270:
                [x, y] = [y + p, -x + q];
                break;
            case -180:
            case 180:
                [x, y] = [-x + p, -y + q];
                break;
            default:
                theta = toRadians(angle);
                [x, y] = [
                    (x * Math.cos(theta)) - (y * Math.sin(theta)) + p,
                    (x * Math.sin(theta)) + (y * Math.cos(theta)) + q
                ];
        }
    }

    return [x, y];
}

function center(ngon) {
    let [minX, minY, maxX, maxY] = boundingBox(ngon);
    let width = maxX - minX;
    let height = maxY - minY;
    return [minX + width / 2, minY + height / 2];
}

function translate(dx, dy, ngon) {
    let object = ngon.slice();
    for (const coord of object) {
        coord[0] += dx;
        coord[1] += dy;
    }

    return object;
}

function flipX(y, ngon) {
    let object = ngon.slice();
    for (const coord of object) {
        coord[1] = 2 * y - coord[1];
    }

    return object;
}

function flipY(x, ngon) {
    let object = ngon.slice();
    for (const coord of object) {
        coord[0] = 2 * x - coord[0];
    }

    return object;
}

/**
 * Draw a triangle, by specifying three side lengths, two side lengths and one inclusive angle, one side length and two adjacent angles, or with a set of vertices.
 * @name triangle
 * @function
 * @memberof Recipe
 * @param {number} x - x-coordinate used to position triangle, by default associated with left vertex of triangle base.
 * @param {number} y - y-coordinate used to position triangle, by default associated with left vertex of triangle base.
 * @param {number[]} traits - the data defining the triangle. Angles are specified as degrees, sides in units of points (1/72 in.).
 * @param {Object} [options] - The options
 * @param {string} [options.traitID='sss'] - indicates what type of data is being passed in the traits parameter.
 * ('sss'- three side lengths, 'sas' - side-angle-side (sideA, <C, sideB), 'asa' - angle-side-angle (<B, sideC, <A),
 * or 'vtx' - three vertex points [x,y])
 * @param {string} [options.position='b'] - the position of the triangle to be set at the given x,y coordinates.
 * The values can be one of: 'A' - the A vertex (right vertex of triangle base), 'B' - the B vertex (left vertex of triangle base),
 * 'C' - the C vertex (apex of triangle), 'centroid', 'circumcenter', or 'incenter' of the triangle.
 * @param {Boolean} [options.flipX=false] - flip triangle up to down through rotation point.
 * @param {Boolean} [options.flipY=false] - flip triangle right to left through rotation point.
 * @param {string|number[]} [options.color] - HexColor or DecimalColor
 * @param {string|number[]} [options.stroke] - HexColor or DecimalColor
 * @param {string|number[]} [options.fill] - HexColor or DecimalColor
 * @param {number} [options.lineWidth] - The line width
 * @param {number} [options.opacity] - The opacity
 * @param {number[]} [options.dash] - The dash style [number, number]
 * @param {number} [options.rotation] - Accept: +/- 0 through 360. Default: 0
 * @param {number[]} [options.rotationOrigin] - [originX, originY] Default: x, y
 * @param {number} [options.skewX] - the angle skew off the x-axis
 * @param {number} [options.skewY] - the angle skew off the y-axis. */

exports.triangle = function triangle(x, y, traits, options = {}) {
    let traitID = options.traitID || options.traitsID || 'sss';
    let position = (options.position) ? options.position.toLowerCase() : 'default';
    let triopts = Object.assign({}, options);

    if (traits.length !== 3) {
        throw new Error('Triangle requires 3 traits (sides/angles) for definition.');
    }

    traitID = traitID.toLowerCase();

    let pt, radius, trigon;
    let triangle = new Triangle(x, y, traitID, traits);

    let cc;
    let ic;
    switch (position) {
        case 'centroid':
            pt = triangle.centroid;
            break;
        case 'circumcenter':
            cc = triangle.circumcenter;
            [pt, radius] = [cc.point, cc.radius];
            break;
        case 'incenter':
            ic = triangle.incenter;
            [pt, radius] = [ic.point, ic.radius];
            triangle.incenter = [x, y]; // have to update incenter because tranlation will change it.
            break;
        case 'a':
            pt = new Point(triangle.A);
            break;
        case 'b':
            pt = new Point(triangle.B);
            break;
        case 'c':
            pt = new Point(triangle.C);
            break;
        default:
            pt = new Point(triangle.B);
            trigon = triangle.vertices;
            break;
    }

    if (!trigon) {
        trigon = translate(x - pt.x, y - pt.y, triangle.vertices);
        if (options.rotation && options.rotation !== 0) {
            triopts.rotationOrigin = [x, y];
        }
    }

    if (options.flipX) {
        trigon = flipX(y, trigon);
    }

    if (options.flipY) {
        trigon = flipY(x, trigon);
    }

    this.polygon(trigon, triopts);

    if (options.debug) {
        let angle = triopts.rotation || 0;
        let [rx, ry] = (triopts.rotationOrigin) ? triopts.rotationOrigin: center(triangle.vertices);

        // When rotation involved, easiest to just create new triangle
        // with rotated points so that labelling will work properly.
        if (angle !== 0 || options.flipX || options.flipY) {
            let tgon = [];
            for (const vertex of trigon) {
                tgon.push(rotate(vertex[0], vertex[1], rx, ry, angle));
            }
            triangle = new Triangle(tgon[0][0], tgon[0][1], 'vtx', tgon);
        }
        this.circle(x, y, 2, { color: 'red', width: .5 });

        if (radius) {
            this.circle(x, y, radius, { color: 'green', width: .5 });
        } else if (position === 'centroid') {
            const ma_A = new Line(triangle.A, triangle.BC.midpoint);
            const mb_B = new Line(triangle.B, triangle.AC.midpoint);
            const mc_C = new Line(triangle.C, triangle.AB.midpoint);
            this.line([
                [ma_A.point(1).x, ma_A.point(1).y],
                [ma_A.point(2).x, ma_A.point(2).y]
            ], { color: 'green', width: .5 });
            this.line([
                [mb_B.point(1).x, mb_B.point(1).y],
                [mb_B.point(2).x, mb_B.point(2).y]
            ], { color: 'green', width: .5 });
            this.line([
                [mc_C.point(1).x, mc_C.point(1).y],
                [mc_C.point(2).x, mc_C.point(2).y]
            ], { color: 'green', width: .5 });
        }

        this.circle(triangle.incenter.point.x, triangle.incenter.point.y, triangle.incenter.radius, { color: 'green', width: .5 });
        let ctr_A = new Line(triangle.incenter.point, triangle.A);
        let ap = ctr_A.extend(10);
        this.text('A', ap.x - 5, ap.y - 5, { color: '#a10439', size: 12 });
        // this.circle(ap.x, ap.y,10, {color:'green', width:.5});

        let ctr_B = new Line(triangle.incenter.point, triangle.B);
        ap = ctr_B.extend(10);
        this.text('B', ap.x - 5, ap.y - 5, { color: '#a10439', size: 12 });
        // this.circle(ap.x, ap.y,10, {color:'green', width:.5});

        let ctr_C = new Line(triangle.incenter.point, triangle.C);
        ap = ctr_C.extend(10);
        this.text('C', ap.x - 5, ap.y - 5, { color: '#a10439', size: 12 });
        // this.circle(ap.x, ap.y,10, {color:'green', width:.5});

        let toSideA = new Line(triangle.A, triangle.BC.midpoint);
        let toSideB = new Line(triangle.B, triangle.AC.midpoint);
        let toSideC = new Line(triangle.C, triangle.AB.midpoint);

        ap = toSideA.extend(10);
        this.text('a', ap.x - 3, ap.y - 5, { size: 10 });
        // this.circle(ap.x, ap.y,6, {color:'red', width:.5});

        ap = toSideB.extend(10);
        this.text('b', ap.x - 3, ap.y - 5, { size: 10 });
        // this.circle(ap.x, ap.y,6, {color:'red', width:.5});

        ap = toSideC.extend(10);
        this.text('c', ap.x - 3, ap.y - 5, { size: 10 });
        // this.circle(ap.x, ap.y,6, {color:'red', width:.5});
    }

    return this;
};

//  Reference of triangle sides (a,b,c) and vertices (A,B,C)
//           C
//          / \
//       a /   \ b
//        /_____\
//       B   c   A

const Triangle = class Triangle {
    constructor(x, y, traitID, traits) {
        let a, b, c, angA, angB, angC;
        let sss, BC, AC, AB;
        switch (traitID.toLowerCase()) {
            case 'sss':
                sss = traits.slice().sort((a, b) => { return a - b; });
                if (sss[0] + sss[1] <= sss[2]) {
                    throw new Error('Not a valid triangle inequality (sum of 2 shortest sides must be greater than third side');
                }

                [a, b, c] = traits;
                break;

            case 'sas':
                [a, angC, b] = traits;
                c = Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(toRadians(angC)));
                break;

            case 'asa':
                [angB, c, angA] = traits;
                angC = 180 - angA - angB;
                if (angC <= 0) {
                    throw new Error('Not a valid triangle angle specification (sum of 2 angles must less than 180)');
                }
                a = c * Math.sin(toRadians(angA)) / Math.sin(toRadians(angC));
                b = c * Math.sin(toRadians(angB)) / Math.sin(toRadians(angC));
                break;

            case 'vtx':
                this._B = traits[0];
                this._C = traits[1];
                this._A = traits[2];
                BC = new Line(this._B, this._C);
                AC = new Line(this._A, this._C);
                AB = new Line(this._A, this._B);
                a = BC.length;
                b = AC.length;
                c = AB.length;
                break;

            default:
                throw new Error(`Unhandled trait identification ${traitID}`);
        }

        // At this point, all side lengths are known.
        if (!angA) {
            angA = toDegrees(Math.acos((b * b + c * c - a * a) / (2 * b * c)));
        }
        if (!angB) {
            angB = toDegrees(Math.acos((a * a + c * c - b * b) / (2 * a * c)));
        }
        if (!angC) {
            angC = 180 - angA - angB;
        }
        [this._x, this._y] = [x, y];
        [this._a, this._b, this._c] = [a, b, c];
        [this._angA, this._angB, this._angC] = [angA, angB, angC];

        this._perimeter = a + b + c;

        if (!this._A) {
            this._A = [x + c, y];
        }
        if (!this._B) {
            this._B = [x, y];
        }
        if (!this._C) {
            this._C = endPoint(x, y, a, -angB);
        }
    }

    get A() { return this._A; }
    get B() { return this._B; }
    get C() { return this._C; }

    get AC() {
        if (!this._AC) {
            this._AC = new Line(this._A, this._C);
        }
        return this._AC;
    }

    get AB() {
        if (!this._AB) {
            this._AB = new Line(this._A, this._B);
        }
        return this._AB;
    }

    get BC() {
        if (!this._BC) {
            this._BC = new Line(this._B, this._C);
        }
        return this._BC;
    }

    get perimeter() {
        return this._perimeter;
    }

    get area() {
        if (!this._area) {
            // Heron's formula
            let s = this.perimeter / 2; // semi-perimeter
            this._area = Math.sqrt(s * (s - this._a) * (s - this._b) * (s - this._c));
        }

        return this._area;
    }

    get vertices() {
        return [this._B, this._C, this._A];
    }

    // The centroid is the point where all three medians of the triangle
    // intersect. A median is the line running from a vertex to the midpoint
    // of the side opposite the vertex.
    get centroid() {
        if (!this._centroid) {
            let AB = new Line(this._A, this._B);
            let AC = new Line(this._A, this._C);
            let mAB = AB.midpoint;
            let mAC = AC.midpoint;
            let C_mAB = new Line(this._C, mAB);
            let B_mAC = new Line(this._B, mAC);
            this._centroid = C_mAB.intersect(B_mAC);
        }
        return this._centroid;
    }

    // The intersection of the perpendicular bisectors of
    // each side midpoint defines the circumcenter.
    get circumcenter() {
        if (!this._circumcenter) {
            // Algorithm in use is defining a circle from three noncolinear planar points
            // http://www.ambrsoft.com/TrigoCalc/Circle3D.htm
            let [x1, y1] = this._A;
            let [x2, y2] = this._B;
            let [x3, y3] = this._C;
            let x1y1_sq = x1 * x1 + y1 * y1;
            let x2y2_sq = x2 * x2 + y2 * y2;
            let x3y3_sq = x3 * x3 + y3 * y3;

            let A = x1 * (y2 - y3) - y1 * (x2 - x3) + x2 * y3 - x3 * y2;
            let B = x1y1_sq * (y3 - y2) + x2y2_sq * (y1 - y3) + x3y3_sq * (y2 - y1);
            let C = x1y1_sq * (x2 - x3) + x2y2_sq * (x3 - x1) + x3y3_sq * (x1 - x2);
            // let D = x1y1_sq*(x3*y2 - x2*y3) + x2y2_sq*(x1*y3 - x3*y1) + x3y3_sq*(x2*y1 - x1*y2);
            let a2 = 2 * A;
            let x = -(B / a2);
            let y = -(C / a2);
            let r = new Line(x, y, x1, y1);
            this._circumcenter = { point: new Point(x, y), radius: r.length };
        }
        return this._circumcenter;
    }

    set incenter(center) {
        this._incenter = { point: new Point(center[0], center[1]), radius: this._incenter.radius };
    }

    get incenter() {
        if (!this._incenter) {
            // https://www.mathopenref.com/coordincenter.html
            let x = (this._a * this._A[0] + this._b * this._B[0] + this._c * this._C[0]) / this.perimeter;
            let y = (this._a * this._A[1] + this._b * this._B[1] + this._c * this._C[1]) / this.perimeter;
            let radius = 2 * this.area / this.perimeter;
            this._incenter = { point: new Point(x, y), radius: radius };
        }
        return this._incenter;
    }
};

// /**
//  * Determine if given point is inside given polygon
//  * @param {number} x coordinate of point
//  * @param {number} y coordinate of point
//  * @param {number[]} ngon array of x,y coordinate pairs of polygon.
//  * @returns 1 when point inside polygon, 0 when outside polygon.
//  */
// function pointInPolygon(x, y, ngon) {
//     // http://alienryderflex.com/polygon/
//     let oddNodes = 0;
//     let polyCorners = ngon.length;
//     let j = polyCorners - 1;

//     for (i = 0; i < polyCorners; i++) {
//         if ((ngon[i][1] < y && y <= ngon[j][1] ||
//                 ngon[j][1] < y && y <= ngon[i][1]) &&
//             (ngon[i][0] <= x || x >= ngon[j][0])) {
//             oddNodes ^= (ngon[i][0] + (y - ngon[i][1]) / (ngon[j][1] - ngon[i][1]) * (ngon[j][0] - ngon[i][0]) < x);
//         }
//         j = i;
//     }

//     return oddNodes;
// }

/**
 * Draw an arrow
 * @name arrow
 * @function
 * @memberof Recipe
 * @param {number} x x-coordinate position
 * @param {number} y y-coordinate position
 * @param {Object} [options] arrow and polygon options
 * @param {number} [options.type=0] indicates the type of arrow head to produce. (0-'triangle', 1-'dart', 2-'kite')
 * Number or name may be used. Note, that the value of base offset in head option overrides this value.
 * @param {number|number[]} [options.head=[10,20,0]] defines the length, width and base offset of arrow head.
 * A single number can be used to assign both the length and width of arrow, giving the base offset value as zero.
 * @param {number|number[]} [options.shaft=[10,10]] defines the length and width of the arrow shaft.
 * @param {Boolean} [options.double=false] indicate double headed arrow production.
 * @param {string} [options.at] position and/or rotate at "head" or "tail" of arrow instead of at center.
 */
exports.arrow = function arrow(x, y, options = {}) {
    let defaultHeadLength = 10;
    let nock = null;
    let ox = x;
    let debug = options.debug;
    let headTypes = { 0: 0, triangle: 0, 1: .5, dart: .5, 2: -1, kite: -1 };

    let shaftLength = defaultHeadLength;
    let shaftWidth = defaultHeadLength;
    let headLength = defaultHeadLength;
    let headWidth = defaultHeadLength * 2;
    let baseOffset = 0;

    // Extract user dimensions of arrow head.
    // This will either be a simple number, or
    // 3 component array containing the data
    // elements to build a KITE shaped quadrilateral.
    if (options.head !== void(0)) {
        [headLength, headWidth, baseOffset] = (Array.isArray(options.head)) ? options.head: [options.head];
        if (headWidth === void(0)) {
            shaftWidth = shaftLength = headLength;
            headWidth = headLength * 2;
        }
        if (baseOffset === void(0)) {
            baseOffset = 0;
        }
    }

    if (headLength === void(0) || headLength === 0) {
        headLength = defaultHeadLength;
    }
    if (headWidth === void(0) || headWidth === 0) {
        headWidth = headLength * 2;
    }

    // Extract user dimensions of arrow shaft.
    if (options.shaft !== void(0)) {
        [shaftLength, shaftWidth] = (Array.isArray(options.shaft)) ? options.shaft: [options.shaft];
        if (shaftWidth === void(0)) {
            shaftWidth = shaftLength;
        }
    }

    if (shaftWidth > headWidth) {
        shaftWidth = headWidth;
    } else if (shaftWidth === 0) {
        shaftWidth = headWidth / 2;
    }

    if (baseOffset === 0 && options.type) {
        let type = headTypes[options.type];
        if (type !== void(0)) {
            baseOffset = type * headLength; // a percentage of the arrow head length.
        }
    }

    // Short cut for caller, so they don't have to specify rotation origin.
    if (options.at && options.rotation && !options.rotationOrigin) {
        options = Object.assign({}, options, { rotationOrigin: [x, y] });
    }

    // Adjust coordinates of drop point at head, tail, or middle of arrow.
    // ('default' choice represents center of arrow and default rotation point)
    if (options.double) {
        switch (options.at) {
            case 'head':
                x -= headLength;
                break;
            case 'tail':
                x += shaftLength + headLength;
                break;
            default:
                x += shaftLength / 2;
        }
        nock = new Kite(x - shaftLength, y, headLength, headWidth, baseOffset);
    } else {
        switch (options.at) {
            case 'head':
                x -= headLength;
                break;
            case 'tail':
                x += shaftLength;
                break;
            default:
                x += (shaftLength - headLength) / 2;
        }
    }

    const head = new Kite(x, y, headLength, headWidth, baseOffset);
    const arrow = new Arrow(x, y, head, shaftLength, shaftWidth, nock);

    const halfShaft = shaftWidth / 2;
    const KE = head.KE;

    // When the KE line is vertical, it means that the base offset was zero
    // Consequently, the arrow head will be a triangle, not a KITE. Note
    // that the intersection computation would also fail for vertical lines.
    if (!KE.isVertical) {
        const shaft_top = new Line(head.I[0], y - halfShaft, head.E[0], y - halfShaft);
        const ke_shaft_intercept = KE.intersect(shaft_top);
        arrow.joinShaft(ke_shaft_intercept);
    }

    if (options.double) {
        // Starting at arrow head tip (Pt I below),
        // moving clockwise to next point.
        //            K'        K
        //           /|_________|\
        //          /tl         tr\
        //      I' *               * I
        //          \bl_________br/
        //           \|         |/
        //            T'        T

        this.polygon([
            arrow.tip.I, // tip point of arrow
            arrow.tip.T,
            arrow.shaft('br'), // lower connection point to arrow tip
            arrow.shaft('bl'),

            arrow.nock.Tp, // drawing reverse arrow head at nock/tail of arrow
            arrow.nock.Ip,
            arrow.nock.Kp,

            arrow.shaft('tl'),
            arrow.shaft('tr'), // upper connection point to arrow tip
            arrow.tip.K,
            arrow.tip.I
        ], options);
    } else {
        // Starting at arrow head tip (Pt I below),
        // moving clockwise to next point.
        //                      K       _
        //       _    tl________|\       |       SW: shaftWidth
        //      |     |         tr\      |       SL: shaftLength
        //   SW-|     |            * I   |-HW    HW: headWidth
        //      |_    |_________br/      |       HL: headLength
        //            bl        |/      _|
        //                      T
        //            |_________|__|
        //                 |      |
        //                 SL     HL

        this.polygon([
            arrow.tip.I, // tip point of arrow
            arrow.tip.T,
            arrow.shaft('br'), // lower connection point to arrow tip
            arrow.shaft('bl'),
            arrow.shaft('tl'),
            arrow.shaft('tr'), // upper connection point to arrow tip
            arrow.tip.K,
            arrow.tip.I
        ], options); // back to point of arrow to close polygon
    }

    if (debug) {
        this.circle(ox, y, 2, { color: 'red' });

        if (debug === 2) { // Display Kite reference points
            const tc = 'red';
            const cc = 'red';
            const ktc = 'blue';
            const kcc = 'green';
            this.text('E', arrow.tip.E[0] - 3, arrow.tip.E[1] - 4, { size: 9, color: ktc });
            this.circle(arrow.tip.E[0], arrow.tip.E[1], 6, { color: kcc, width: .5 });
            this.text('K', arrow.tip.K[0] - 3, arrow.tip.K[1] - 10, { size: 9, color: ktc });
            this.circle(arrow.tip.K[0], arrow.tip.K[1] - 6, 6, { color: kcc, width: .5 });
            this.text('i', arrow.tip.I[0] + 5, arrow.tip.I[1] - 4, { size: 9, color: ktc });
            this.circle(arrow.tip.I[0] + 6, arrow.tip.I[1], 6, { color: kcc, width: .5 });
            this.text('T', arrow.tip.T[0] - 2, arrow.tip.T[1] + 3, { size: 9, color: ktc });
            this.circle(arrow.tip.T[0], arrow.tip.T[1] + 6, 6, { color: kcc, width: .5 });
            let br = arrow.shaft('br');
            this.text('br', br[0] - 4, br[1] - 11, { size: 9, color: tc });
            this.circle(br[0], br[1] - 8, 6, { color: cc, width: .5 });
            let bl = arrow.shaft('bl');
            this.text('bl', bl[0] + 4, bl[1] - 11, { size: 9, color: tc });
            this.circle(bl[0] + 8, bl[1] - 8, 6, { color: cc, width: .5 });
            let tl = arrow.shaft('tl');
            this.text('tl', tl[0] + 5, tl[1] + 2, { size: 9, color: tc });
            this.circle(tl[0] + 8, tl[1] + 7, 6, { color: cc, width: .5 });
            let tr = arrow.shaft('tr');
            this.text('tr', tr[0] - 3, tr[1] + 2, { size: 9, color: tc });
            this.circle(tr[0], tr[1] + 7, 6, { color: cc, width: .5 });
        }
    }

    return this;
};

// Reference points on KITE quadrangle             When a KITE becomes a Dart      ... degenerates to a Triangle
//
//                                                            K                              K
//     ------                         K                         * o                          |  o
//    |                          o    |   o                       *   o                      |     o
//                          o         |      o                      *    o                   |        o
//    w                o              |         o                     *     o                |           o
//    i           o                   |            o                    *      o             |              o
//    d       E                       |               I                  E        I          E                 I
//    t           o                   |            o                    *      o             |              o
//    h                o              |         o                     *     o                |           o
//                          o         |      o                      *    o                   |        o
//    |                          o    |   o                       *   o                      |     o
//     ------                         T                         * o                          |  o
//                                                            T                              T
//           |________________________|_______________|
//                  base offset             height

const Kite = class Kite {
    constructor(x, y, width, height, baseOffset = 0) {
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;

        // To produce Dart shapes, baseOffset can be positive
        // but it cannot exceed the height of the arrow head.
        this._baseOffset = (baseOffset >= height) ? (height - 1) : baseOffset;
        this._type = (baseOffset > 0) ? 'dart' :
            (baseOffset === 0) ? 'triangle' : 'kite';

        this._K = new Point(x, y - (height / 2));
        this._I = new Point(x + width, y);
        this._T = new Point(x, y + (height / 2));
        this._E = new Point(x + this._baseOffset, y);
    }

    get K() { return [this._K.x, this._K.y]; }
    get I() { return [this._I.x, this._I.y]; }
    get T() { return [this._T.x, this._T.y]; }
    get E() { return [this._E.x, this._E.y]; }

    // create points I&E prime (flip, 180 degrees) to change direction of Kite on X-axis
    get Ip() { return [this._I.x - (2 * this._width), this._I.y]; }
    get Ep() { return [this._E.x + (2 * this._baseOffset), this._E.y]; }

    get Kp() { return [this._K.x, this._K.y]; } // no different than K or T, just here for consistency usage
    get Tp() { return [this._T.x, this._T.y]; }

    get KE() { // line segment between points K and E
        if (!this._KE) {
            this._KE = new Line(this._K.x, this._K.y, this._E.x, this._E.y);
        }
        return this._KE;
    }

    get TE() { // line segment between points T and E
        if (!this._TE) {
            this._TE = new Line(this._T.x, this._T.y, this._E.x, this._E.y);
        }
        return this._TE;
    }

    get type() { return this._type; }

    // position(x, y) {

    // }
};

const Arrow = class Arrow {
    constructor(x, y, arrowhead, shaftLength, shaftWidth, nock) {
        this._x = x;
        this._y = y;
        this._tip = arrowhead;
        this._nock = nock; // for double headed arrows
        this._shaftLength = shaftLength;
        this._shaftWidth = shaftWidth;
        this._connectAt_tr = new Point(this._x, this._y - shaftWidth / 2); // top, right
        this._connectAt_br = new Point(this._x, this._y + shaftWidth / 2); // bottom, right
    }

    get tip() { return this._tip; }
    get nock() { return this._nock; }

    joinShaft(pointTR) {
        this._connectAt_tr.x = pointTR.x;
        this._connectAt_br.x = pointTR.x;
    }

    shaft(point) {
        switch (point) {
            case 'br':
                return [this._connectAt_br.x, this._connectAt_br.y];
            case 'bl':
                return [this._x - this._shaftLength, this._connectAt_br.y];
            case 'tl':
                return [this._x - this._shaftLength, this._connectAt_tr.y];
            case 'tr':
                return [this._connectAt_tr.x, this._connectAt_tr.y];
        }
    }
};

const Point = class Point {
    constructor(x, y) {
        if (Array.isArray(x)) {
            this._x = x[0];
            this._y = x[1];
        } else {
            this._x = x;
            this._y = y;
        }
    }
    get x() { return this._x; }
    get y() { return this._y; }
    get point() { return [this._x, this._y]; }
    set x(xx) { this._x = xx; }
    set y(yy) { this._y = yy; }
    set point(pnt) {
        [this._x, this._y] = pnt;
    }
};

const Line = class Line {
    constructor(x1, y1, x2, y2) {
        // Allow user to supply Points or Arrays instead of individual coordinates
        if ((x1 instanceof Point || Array.isArray(x1)) && !(y1 instanceof Point || Array.isArray(y1))) {
            throw new Error('2nd parameter not an instance of Point or Array');
        }

        if (typeof x1 === 'number') { // individual coordinates
            this._pt1 = new Point(x1, y1);
            this._pt2 = new Point(x2, y2);
        } else {
            if (x1 instanceof Point) {
                this._pt1 = x1;
            } else {
                this._pt1 = new Point(x1); // assuming array
            }

            if (y1 instanceof Point) {
                this._pt2 = y1;
            } else {
                this._pt2 = new Point(y1); // assuming array
            }
        }
    }

    get isVertical() {
        return this._pt1.x === this._pt2.x;
    }

    point(ep) {
        return (ep === 1) ? this._pt1 :
            (ep === 2) ? this._pt2 : null;
    }

    get midpoint() {
        if (!this._midpoint) {
            let dx = (this._pt2.x - this._pt1.x) / 2;
            let dy = (this._pt2.y - this._pt1.y) / 2;
            this._midPoint = new Point(this._pt1.x + dx, this._pt1.y + dy);
        }

        return this._midPoint;
    }

    get length() {
        if (!this._length) {
            this._length = Math.sqrt(Math.pow(this._pt2.x - this._pt1.x, 2) + Math.pow(this._pt2.y - this._pt1.y, 2));
        }

        return this._length;
    }

    get slope() {
        if (!this._slope) {
            this._slope = Math.abs(this._pt2.x - this._pt1.x) < .0001 ? Infinity : (this._pt2.y - this._pt1.y) / (this._pt2.x - this._pt1.x);
        }

        return this._slope;
    }

    get inv_slope() { // inverse slope
        return -(1 / this.slope);
    }

    extend(distance, ptNbr = 2) {
        let slope = this.slope;
        let ept = this.point(ptNbr);
        let opt = this.point((ptNbr === 1) ? 2 : 1);
        let x = ept.x,
            y = ept.y;
        let epsilon = .0001;
        let newLen, deltaX = 0,
            deltaY = 0;
        let ss;

        switch (slope) {
            case 0:
                deltaX = distance;
                newLen = Math.abs(opt.x - (x + deltaX));
                break;
            case Infinity:
                deltaY = distance;
                newLen = Math.abs(opt.y - (y + deltaY));
                break;

            default:
                ss = Math.sqrt(1 / (1 + Math.pow(slope, 2)));
                deltaX = distance * ss;
                deltaY = slope * deltaX;
                newLen = Math.sqrt(Math.pow(opt.x - (x + deltaX), 2) + Math.pow(opt.y - (y + deltaY), 2));
                break;
        }

        // Since there are 2 possible solutions, the idea is to choose the one which
        // effectively gives a distance equivalent to the length of the line plus the given distance.
        let direction = (Math.abs(newLen - (this.length + distance)) < epsilon) ? 1 : -1;
        x += direction * deltaX;
        y += direction * deltaY;

        return new Point(x, y);
    }

    // Equation to solve for intersection of two line segments
    // when given 4 sets of points representing the segments.
    // due to sign negation in program, terms don't match here.
    //
    //      (x2y1 - x1y2)(x4 - x3) - (x4y3 - x3y4)(x2 - x1)     c1(b2) - c2(b1)
    //  x = -----------------------------------------------     ---------------
    //          (x2 - x1)(y4 - y3) - (x4 - x3)(y2 - y1)         b1(a2) - b2(a1)
    //
    //      (x2y1 - x1y2)(y4 - y3) - (x4y3 - x3y4)(y2 - y1)     c1(a2) - c2(a1)
    //  y = -----------------------------------------------     ---------------
    //          (x2 - x1)(y4 - y3) - (x4 - x3)(y2 - y1)         b1(a2) - b2(a1)

    intersect(CD) {
        let A = this._pt1,
            B = this._pt2;
        let C = CD,
            D = CD;

        let x1 = A.x,
            y1 = A.y;
        let x2 = B.x,
            y2 = B.y;

        let x3 = C.point(1).x,
            y3 = C.point(1).y;
        let x4 = D.point(2).x,
            y4 = D.point(2).y;

        // Line AB represented as a1x + b1y = c1
        let a1 = y2 - y1;
        //let b1 = x2 - x1;
        let b1 = x1 - x2;
        //let c1 = b1*y1 - a1*x1;
        let c1 = b1 * y1 + a1 * x1;

        // Line CD represented as a2x + b2y = c2
        let a2 = y4 - y3;
        //let b2 = x4 - x3;
        let b2 = x3 - x4;
        //let c2 = b2*y3 - a2*x3;
        let c2 = b2 * y3 + a2 * x3;

        // If the lines are parallel their slopes will be the same
        // causing the determinantinator to be zero, so check for that first.

        //let determinant = a2*b1 - a1*b2;
        let determinant = a1 * b2 - a2 * b1;

        if (determinant === 0) { return null; }

        let x = (b2 * c1 - b1 * c2) / determinant;
        //let y = (a2*c1 - a1*c2) / determinant;
        let y = (a1 * c2 - a2 * c1) / determinant;

        return new Point(x, y);
    }
};
