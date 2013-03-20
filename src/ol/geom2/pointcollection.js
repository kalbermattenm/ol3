goog.provide('ol.geom2.Point');
goog.provide('ol.geom2.PointCollection');

goog.require('ol.Extent');
goog.require('ol.structs.Buffer');


/**
 * @typedef {Array.<number>}
 */
ol.geom2.Point;



/**
 * @constructor
 * @param {ol.structs.Buffer} buf Buffer.
 * @param {number=} opt_dim Dimension.
 */
ol.geom2.PointCollection = function(buf, opt_dim) {

  /**
   * @type {ol.structs.Buffer}
   */
  this.buf = buf;

  /**
   * @type {number}
   */
  this.dim = goog.isDef(opt_dim) ? opt_dim : 2;

};


/**
 * @param {Array.<ol.geom2.Point>} unpackedPoints Unpacked points.
 * @param {number=} opt_capacity Capacity.
 * @param {number=} opt_dim Dimension.
 * @return {ol.geom2.PointCollection} Point collection.
 */
ol.geom2.PointCollection.pack =
    function(unpackedPoints, opt_capacity, opt_dim) {
  var n = unpackedPoints.length;
  var dim = goog.isDef(opt_dim) ? opt_dim :
      n > 0 ? unpackedPoints[0].length : 2;
  var capacity = goog.isDef(opt_capacity) ? opt_capacity : n * dim;
  goog.asserts.assert(capacity >= n * dim);
  var arr = new Array(capacity);
  var arrIndex = 0;
  var i, j, point;
  for (i = 0; i < n; ++i) {
    point = unpackedPoints[i];
    goog.asserts.assert(point.length == dim);
    for (j = 0; j < dim; ++j) {
      arr[arrIndex++] = point[j];
    }
  }
  goog.asserts.assert(arrIndex == n * dim);
  var buf = new ol.structs.Buffer(arr, n * dim);
  return new ol.geom2.PointCollection(buf, dim);
};


/**
 * @param {ol.geom2.Point} point Point.
 * @return {number} Offset.
 */
ol.geom2.PointCollection.prototype.add = function(point) {
  goog.asserts.assert(point.length == this.dim);
  return this.buf.add(point);
};


/**
 * @param {number} offset Offset.
 * @return {ol.geom2.Point} Point.
 */
ol.geom2.PointCollection.prototype.get = function(offset) {
  var arr = this.buf.getArray();
  var dim = this.dim;
  goog.asserts.assert(0 <= offset && offset + dim < arr.length);
  goog.asserts.assert(offset % dim === 0);
  return arr.slice(offset, offset + dim);
};


/**
 * @return {ol.Extent} Extent.
 */
ol.geom2.PointCollection.prototype.getExtent = function() {
  var dim = this.dim;
  goog.asserts.assert(dim >= 2);
  var bufArr = this.buf.getArray();
  var extent = ol.Extent.createEmptyExtent();
  this.buf.forEachRange(function(start, stop) {
    var i;
    for (i = start; i < stop; i += dim) {
      extent.extendXY(bufArr[i], bufArr[i + 1]);
    }
  });
  return extent;
};


/**
 * @param {number} offset Offset.
 */
ol.geom2.PointCollection.prototype.remove = function(offset) {
  this.buf.remove(this.dim, offset);
};


/**
 * @param {number} offset Offset.
 * @param {ol.geom2.Point} point Point.
 */
ol.geom2.PointCollection.prototype.set = function(offset, point) {
  this.buf.set(point, offset);
};


/**
 * @return {Array.<ol.geom2.Point>} Points.
 */
ol.geom2.PointCollection.prototype.unpack = function() {
  var dim = this.dim;
  var n = this.buf.getCount() / dim;
  var points = new Array(n);
  var pointsIndex = 0;
  var bufArr = this.buf.getArray();
  this.buf.forEachRange(function(start, stop) {
    var i;
    for (i = start; i < stop; i += dim) {
      points[pointsIndex++] = bufArr.slice(i, i + dim);
    }
  });
  goog.asserts.assert(pointsIndex == n);
  return points;
};
