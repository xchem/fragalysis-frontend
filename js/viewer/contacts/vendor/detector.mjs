/* Vendored computation-only NGL 2.0.0-dev.37 contact detector. See README.md and LICENSE. */
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// signals/dist/signals.js
var require_signals = __commonJS({
  "signals/dist/signals.js"(exports, module) {
    /** @license
     * JS Signals <http://millermedeiros.github.com/js-signals/>
     * Released under the MIT license
     * Author: Miller Medeiros
     * Version: 1.0.0 - Build: 268 (2012/11/29 05:48 PM)
     */
    (function(global) {
      function SignalBinding(signal, listener, isOnce, listenerContext, priority) {
        this._listener = listener;
        this._isOnce = isOnce;
        this.context = listenerContext;
        this._signal = signal;
        this._priority = priority || 0;
      }
      SignalBinding.prototype = {
        /**
         * If binding is active and should be executed.
         * @type boolean
         */
        active: true,
        /**
         * Default parameters passed to listener during `Signal.dispatch` and `SignalBinding.execute`. (curried parameters)
         * @type Array|null
         */
        params: null,
        /**
         * Call listener passing arbitrary parameters.
         * <p>If binding was added using `Signal.addOnce()` it will be automatically removed from signal dispatch queue, this method is used internally for the signal dispatch.</p>
         * @param {Array} [paramsArr] Array of parameters that should be passed to the listener
         * @return {*} Value returned by the listener.
         */
        execute: function(paramsArr) {
          var handlerReturn, params;
          if (this.active && !!this._listener) {
            params = this.params ? this.params.concat(paramsArr) : paramsArr;
            handlerReturn = this._listener.apply(this.context, params);
            if (this._isOnce) {
              this.detach();
            }
          }
          return handlerReturn;
        },
        /**
         * Detach binding from signal.
         * - alias to: mySignal.remove(myBinding.getListener());
         * @return {Function|null} Handler function bound to the signal or `null` if binding was previously detached.
         */
        detach: function() {
          return this.isBound() ? this._signal.remove(this._listener, this.context) : null;
        },
        /**
         * @return {Boolean} `true` if binding is still bound to the signal and have a listener.
         */
        isBound: function() {
          return !!this._signal && !!this._listener;
        },
        /**
         * @return {boolean} If SignalBinding will only be executed once.
         */
        isOnce: function() {
          return this._isOnce;
        },
        /**
         * @return {Function} Handler function bound to the signal.
         */
        getListener: function() {
          return this._listener;
        },
        /**
         * @return {Signal} Signal that listener is currently bound to.
         */
        getSignal: function() {
          return this._signal;
        },
        /**
         * Delete instance properties
         * @private
         */
        _destroy: function() {
          delete this._signal;
          delete this._listener;
          delete this.context;
        },
        /**
         * @return {string} String representation of the object.
         */
        toString: function() {
          return "[SignalBinding isOnce:" + this._isOnce + ", isBound:" + this.isBound() + ", active:" + this.active + "]";
        }
      };
      function validateListener(listener, fnName) {
        if (typeof listener !== "function") {
          throw new Error("listener is a required param of {fn}() and should be a Function.".replace("{fn}", fnName));
        }
      }
      function Signal3() {
        this._bindings = [];
        this._prevParams = null;
        var self = this;
        this.dispatch = function() {
          Signal3.prototype.dispatch.apply(self, arguments);
        };
      }
      Signal3.prototype = {
        /**
         * Signals Version Number
         * @type String
         * @const
         */
        VERSION: "1.0.0",
        /**
         * If Signal should keep record of previously dispatched parameters and
         * automatically execute listener during `add()`/`addOnce()` if Signal was
         * already dispatched before.
         * @type boolean
         */
        memorize: false,
        /**
         * @type boolean
         * @private
         */
        _shouldPropagate: true,
        /**
         * If Signal is active and should broadcast events.
         * <p><strong>IMPORTANT:</strong> Setting this property during a dispatch will only affect the next dispatch, if you want to stop the propagation of a signal use `halt()` instead.</p>
         * @type boolean
         */
        active: true,
        /**
         * @param {Function} listener
         * @param {boolean} isOnce
         * @param {Object} [listenerContext]
         * @param {Number} [priority]
         * @return {SignalBinding}
         * @private
         */
        _registerListener: function(listener, isOnce, listenerContext, priority) {
          var prevIndex = this._indexOfListener(listener, listenerContext), binding;
          if (prevIndex !== -1) {
            binding = this._bindings[prevIndex];
            if (binding.isOnce() !== isOnce) {
              throw new Error("You cannot add" + (isOnce ? "" : "Once") + "() then add" + (!isOnce ? "" : "Once") + "() the same listener without removing the relationship first.");
            }
          } else {
            binding = new SignalBinding(this, listener, isOnce, listenerContext, priority);
            this._addBinding(binding);
          }
          if (this.memorize && this._prevParams) {
            binding.execute(this._prevParams);
          }
          return binding;
        },
        /**
         * @param {SignalBinding} binding
         * @private
         */
        _addBinding: function(binding) {
          var n = this._bindings.length;
          do {
            --n;
          } while (this._bindings[n] && binding._priority <= this._bindings[n]._priority);
          this._bindings.splice(n + 1, 0, binding);
        },
        /**
         * @param {Function} listener
         * @return {number}
         * @private
         */
        _indexOfListener: function(listener, context) {
          var n = this._bindings.length, cur;
          while (n--) {
            cur = this._bindings[n];
            if (cur._listener === listener && cur.context === context) {
              return n;
            }
          }
          return -1;
        },
        /**
         * Check if listener was attached to Signal.
         * @param {Function} listener
         * @param {Object} [context]
         * @return {boolean} if Signal has the specified listener.
         */
        has: function(listener, context) {
          return this._indexOfListener(listener, context) !== -1;
        },
        /**
         * Add a listener to the signal.
         * @param {Function} listener Signal handler function.
         * @param {Object} [listenerContext] Context on which listener will be executed (object that should represent the `this` variable inside listener function).
         * @param {Number} [priority] The priority level of the event listener. Listeners with higher priority will be executed before listeners with lower priority. Listeners with same priority level will be executed at the same order as they were added. (default = 0)
         * @return {SignalBinding} An Object representing the binding between the Signal and listener.
         */
        add: function(listener, listenerContext, priority) {
          validateListener(listener, "add");
          return this._registerListener(listener, false, listenerContext, priority);
        },
        /**
         * Add listener to the signal that should be removed after first execution (will be executed only once).
         * @param {Function} listener Signal handler function.
         * @param {Object} [listenerContext] Context on which listener will be executed (object that should represent the `this` variable inside listener function).
         * @param {Number} [priority] The priority level of the event listener. Listeners with higher priority will be executed before listeners with lower priority. Listeners with same priority level will be executed at the same order as they were added. (default = 0)
         * @return {SignalBinding} An Object representing the binding between the Signal and listener.
         */
        addOnce: function(listener, listenerContext, priority) {
          validateListener(listener, "addOnce");
          return this._registerListener(listener, true, listenerContext, priority);
        },
        /**
         * Remove a single listener from the dispatch queue.
         * @param {Function} listener Handler function that should be removed.
         * @param {Object} [context] Execution context (since you can add the same handler multiple times if executing in a different context).
         * @return {Function} Listener handler function.
         */
        remove: function(listener, context) {
          validateListener(listener, "remove");
          var i = this._indexOfListener(listener, context);
          if (i !== -1) {
            this._bindings[i]._destroy();
            this._bindings.splice(i, 1);
          }
          return listener;
        },
        /**
         * Remove all listeners from the Signal.
         */
        removeAll: function() {
          var n = this._bindings.length;
          while (n--) {
            this._bindings[n]._destroy();
          }
          this._bindings.length = 0;
        },
        /**
         * @return {number} Number of listeners attached to the Signal.
         */
        getNumListeners: function() {
          return this._bindings.length;
        },
        /**
         * Stop propagation of the event, blocking the dispatch to next listeners on the queue.
         * <p><strong>IMPORTANT:</strong> should be called only during signal dispatch, calling it before/after dispatch won't affect signal broadcast.</p>
         * @see Signal.prototype.disable
         */
        halt: function() {
          this._shouldPropagate = false;
        },
        /**
         * Dispatch/Broadcast Signal to all listeners added to the queue.
         * @param {...*} [params] Parameters that should be passed to each handler.
         */
        dispatch: function(params) {
          if (!this.active) {
            return;
          }
          var paramsArr = Array.prototype.slice.call(arguments), n = this._bindings.length, bindings;
          if (this.memorize) {
            this._prevParams = paramsArr;
          }
          if (!n) {
            return;
          }
          bindings = this._bindings.slice();
          this._shouldPropagate = true;
          do {
            n--;
          } while (bindings[n] && this._shouldPropagate && bindings[n].execute(paramsArr) !== false);
        },
        /**
         * Forget memorized arguments.
         * @see Signal.memorize
         */
        forget: function() {
          this._prevParams = null;
        },
        /**
         * Remove all bindings from signal and destroy any reference to external objects (destroy Signal object).
         * <p><strong>IMPORTANT:</strong> calling any method on the signal instance after calling dispose will throw errors.</p>
         */
        dispose: function() {
          this.removeAll();
          delete this._bindings;
          delete this._prevParams;
        },
        /**
         * @return {string} String representation of the object.
         */
        toString: function() {
          return "[Signal active:" + this.active + " numListeners:" + this.getNumListeners() + "]";
        }
      };
      var signals = Signal3;
      signals.Signal = Signal3;
      if (typeof define === "function" && define.amd) {
        define(function() {
          return signals;
        });
      } else if (typeof module !== "undefined" && module.exports) {
        module.exports = signals;
      } else {
        global["signals"] = signals;
      }
    })(exports);
  }
});

// src/math/Vector2.js
function Vector2(x, y) {
  this.x = x || 0;
  this.y = y || 0;
}
Object.defineProperties(Vector2.prototype, {
  "width": {
    get: function() {
      return this.x;
    },
    set: function(value) {
      this.x = value;
    }
  },
  "height": {
    get: function() {
      return this.y;
    },
    set: function(value) {
      this.y = value;
    }
  }
});
Object.assign(Vector2.prototype, {
  isVector2: true,
  set: function(x, y) {
    this.x = x;
    this.y = y;
    return this;
  },
  setScalar: function(scalar) {
    this.x = scalar;
    this.y = scalar;
    return this;
  },
  setX: function(x) {
    this.x = x;
    return this;
  },
  setY: function(y) {
    this.y = y;
    return this;
  },
  setComponent: function(index, value) {
    switch (index) {
      case 0:
        this.x = value;
        break;
      case 1:
        this.y = value;
        break;
      default:
        throw new Error("index is out of range: " + index);
    }
    return this;
  },
  getComponent: function(index) {
    switch (index) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      default:
        throw new Error("index is out of range: " + index);
    }
  },
  clone: function() {
    return new this.constructor(this.x, this.y);
  },
  copy: function(v) {
    this.x = v.x;
    this.y = v.y;
    return this;
  },
  add: function(v, w) {
    if (w !== void 0) {
      console.warn("THREE.Vector2: .add() now only accepts one argument. Use .addVectors( a, b ) instead.");
      return this.addVectors(v, w);
    }
    this.x += v.x;
    this.y += v.y;
    return this;
  },
  addScalar: function(s) {
    this.x += s;
    this.y += s;
    return this;
  },
  addVectors: function(a, b) {
    this.x = a.x + b.x;
    this.y = a.y + b.y;
    return this;
  },
  addScaledVector: function(v, s) {
    this.x += v.x * s;
    this.y += v.y * s;
    return this;
  },
  sub: function(v, w) {
    if (w !== void 0) {
      console.warn("THREE.Vector2: .sub() now only accepts one argument. Use .subVectors( a, b ) instead.");
      return this.subVectors(v, w);
    }
    this.x -= v.x;
    this.y -= v.y;
    return this;
  },
  subScalar: function(s) {
    this.x -= s;
    this.y -= s;
    return this;
  },
  subVectors: function(a, b) {
    this.x = a.x - b.x;
    this.y = a.y - b.y;
    return this;
  },
  multiply: function(v) {
    this.x *= v.x;
    this.y *= v.y;
    return this;
  },
  multiplyScalar: function(scalar) {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  },
  divide: function(v) {
    this.x /= v.x;
    this.y /= v.y;
    return this;
  },
  divideScalar: function(scalar) {
    return this.multiplyScalar(1 / scalar);
  },
  applyMatrix3: function(m) {
    var x = this.x, y = this.y;
    var e = m.elements;
    this.x = e[0] * x + e[3] * y + e[6];
    this.y = e[1] * x + e[4] * y + e[7];
    return this;
  },
  min: function(v) {
    this.x = Math.min(this.x, v.x);
    this.y = Math.min(this.y, v.y);
    return this;
  },
  max: function(v) {
    this.x = Math.max(this.x, v.x);
    this.y = Math.max(this.y, v.y);
    return this;
  },
  clamp: function(min, max) {
    this.x = Math.max(min.x, Math.min(max.x, this.x));
    this.y = Math.max(min.y, Math.min(max.y, this.y));
    return this;
  },
  clampScalar: (function() {
    var min = new Vector2();
    var max = new Vector2();
    return function clampScalar(minVal, maxVal) {
      min.set(minVal, minVal);
      max.set(maxVal, maxVal);
      return this.clamp(min, max);
    };
  })(),
  clampLength: function(min, max) {
    var length = this.length();
    return this.divideScalar(length || 1).multiplyScalar(Math.max(min, Math.min(max, length)));
  },
  floor: function() {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    return this;
  },
  ceil: function() {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);
    return this;
  },
  round: function() {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    return this;
  },
  roundToZero: function() {
    this.x = this.x < 0 ? Math.ceil(this.x) : Math.floor(this.x);
    this.y = this.y < 0 ? Math.ceil(this.y) : Math.floor(this.y);
    return this;
  },
  negate: function() {
    this.x = -this.x;
    this.y = -this.y;
    return this;
  },
  dot: function(v) {
    return this.x * v.x + this.y * v.y;
  },
  cross: function(v) {
    return this.x * v.y - this.y * v.x;
  },
  lengthSq: function() {
    return this.x * this.x + this.y * this.y;
  },
  length: function() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  },
  manhattanLength: function() {
    return Math.abs(this.x) + Math.abs(this.y);
  },
  normalize: function() {
    return this.divideScalar(this.length() || 1);
  },
  angle: function() {
    var angle = Math.atan2(this.y, this.x);
    if (angle < 0) angle += 2 * Math.PI;
    return angle;
  },
  distanceTo: function(v) {
    return Math.sqrt(this.distanceToSquared(v));
  },
  distanceToSquared: function(v) {
    var dx = this.x - v.x, dy = this.y - v.y;
    return dx * dx + dy * dy;
  },
  manhattanDistanceTo: function(v) {
    return Math.abs(this.x - v.x) + Math.abs(this.y - v.y);
  },
  setLength: function(length) {
    return this.normalize().multiplyScalar(length);
  },
  lerp: function(v, alpha) {
    this.x += (v.x - this.x) * alpha;
    this.y += (v.y - this.y) * alpha;
    return this;
  },
  lerpVectors: function(v1, v2, alpha) {
    return this.subVectors(v2, v1).multiplyScalar(alpha).add(v1);
  },
  equals: function(v) {
    return v.x === this.x && v.y === this.y;
  },
  fromArray: function(array, offset) {
    if (offset === void 0) offset = 0;
    this.x = array[offset];
    this.y = array[offset + 1];
    return this;
  },
  toArray: function(array, offset) {
    if (array === void 0) array = [];
    if (offset === void 0) offset = 0;
    array[offset] = this.x;
    array[offset + 1] = this.y;
    return array;
  },
  fromBufferAttribute: function(attribute, index, offset) {
    if (offset !== void 0) {
      console.warn("THREE.Vector2: offset has been removed from .fromBufferAttribute().");
    }
    this.x = attribute.getX(index);
    this.y = attribute.getY(index);
    return this;
  },
  rotateAround: function(center, angle) {
    var c = Math.cos(angle), s = Math.sin(angle);
    var x = this.x - center.x;
    var y = this.y - center.y;
    this.x = x * c - y * s + center.x;
    this.y = x * s + y * c + center.y;
    return this;
  }
});

// src/math/Box2.js
function Box2(min, max) {
  this.min = min !== void 0 ? min : new Vector2(Infinity, Infinity);
  this.max = max !== void 0 ? max : new Vector2(-Infinity, -Infinity);
}
Object.assign(Box2.prototype, {
  set: function(min, max) {
    this.min.copy(min);
    this.max.copy(max);
    return this;
  },
  setFromPoints: function(points) {
    this.makeEmpty();
    for (var i = 0, il = points.length; i < il; i++) {
      this.expandByPoint(points[i]);
    }
    return this;
  },
  setFromCenterAndSize: (function() {
    var v1 = new Vector2();
    return function setFromCenterAndSize(center, size) {
      var halfSize = v1.copy(size).multiplyScalar(0.5);
      this.min.copy(center).sub(halfSize);
      this.max.copy(center).add(halfSize);
      return this;
    };
  })(),
  clone: function() {
    return new this.constructor().copy(this);
  },
  copy: function(box) {
    this.min.copy(box.min);
    this.max.copy(box.max);
    return this;
  },
  makeEmpty: function() {
    this.min.x = this.min.y = Infinity;
    this.max.x = this.max.y = -Infinity;
    return this;
  },
  isEmpty: function() {
    return this.max.x < this.min.x || this.max.y < this.min.y;
  },
  getCenter: function(target) {
    if (target === void 0) {
      console.warn("THREE.Box2: .getCenter() target is now required");
      target = new Vector2();
    }
    return this.isEmpty() ? target.set(0, 0) : target.addVectors(this.min, this.max).multiplyScalar(0.5);
  },
  getSize: function(target) {
    if (target === void 0) {
      console.warn("THREE.Box2: .getSize() target is now required");
      target = new Vector2();
    }
    return this.isEmpty() ? target.set(0, 0) : target.subVectors(this.max, this.min);
  },
  expandByPoint: function(point) {
    this.min.min(point);
    this.max.max(point);
    return this;
  },
  expandByVector: function(vector) {
    this.min.sub(vector);
    this.max.add(vector);
    return this;
  },
  expandByScalar: function(scalar) {
    this.min.addScalar(-scalar);
    this.max.addScalar(scalar);
    return this;
  },
  containsPoint: function(point) {
    return point.x < this.min.x || point.x > this.max.x || point.y < this.min.y || point.y > this.max.y ? false : true;
  },
  containsBox: function(box) {
    return this.min.x <= box.min.x && box.max.x <= this.max.x && this.min.y <= box.min.y && box.max.y <= this.max.y;
  },
  getParameter: function(point, target) {
    if (target === void 0) {
      console.warn("THREE.Box2: .getParameter() target is now required");
      target = new Vector2();
    }
    return target.set(
      (point.x - this.min.x) / (this.max.x - this.min.x),
      (point.y - this.min.y) / (this.max.y - this.min.y)
    );
  },
  intersectsBox: function(box) {
    return box.max.x < this.min.x || box.min.x > this.max.x || box.max.y < this.min.y || box.min.y > this.max.y ? false : true;
  },
  clampPoint: function(point, target) {
    if (target === void 0) {
      console.warn("THREE.Box2: .clampPoint() target is now required");
      target = new Vector2();
    }
    return target.copy(point).clamp(this.min, this.max);
  },
  distanceToPoint: (function() {
    var v1 = new Vector2();
    return function distanceToPoint(point) {
      var clampedPoint = v1.copy(point).clamp(this.min, this.max);
      return clampedPoint.sub(point).length();
    };
  })(),
  intersect: function(box) {
    this.min.max(box.min);
    this.max.min(box.max);
    return this;
  },
  union: function(box) {
    this.min.min(box.min);
    this.max.max(box.max);
    return this;
  },
  translate: function(offset) {
    this.min.add(offset);
    this.max.add(offset);
    return this;
  },
  equals: function(box) {
    return box.min.equals(this.min) && box.max.equals(this.max);
  }
});

// src/math/Math.js
var _Math = {
  DEG2RAD: Math.PI / 180,
  RAD2DEG: 180 / Math.PI,
  generateUUID: (function() {
    var lut = [];
    for (var i = 0; i < 256; i++) {
      lut[i] = (i < 16 ? "0" : "") + i.toString(16);
    }
    return function generateUUID() {
      var [d0, d1, d2, d3] = crypto.getRandomValues(new Uint32Array(4));
      var uuid2 = lut[d0 & 255] + lut[d0 >> 8 & 255] + lut[d0 >> 16 & 255] + lut[d0 >> 24 & 255] + "-" + lut[d1 & 255] + lut[d1 >> 8 & 255] + "-" + lut[d1 >> 16 & 15 | 64] + lut[d1 >> 24 & 255] + "-" + lut[d2 & 63 | 128] + lut[d2 >> 8 & 255] + "-" + lut[d2 >> 16 & 255] + lut[d2 >> 24 & 255] + lut[d3 & 255] + lut[d3 >> 8 & 255] + lut[d3 >> 16 & 255] + lut[d3 >> 24 & 255];
      return uuid2.toUpperCase();
    };
  })(),
  clamp: function(value, min, max) {
    return Math.max(min, Math.min(max, value));
  },
  // compute euclidian modulo of m % n
  // https://en.wikipedia.org/wiki/Modulo_operation
  euclideanModulo: function(n, m) {
    return (n % m + m) % m;
  },
  // Linear mapping from range <a1, a2> to range <b1, b2>
  mapLinear: function(x, a1, a2, b1, b2) {
    return b1 + (x - a1) * (b2 - b1) / (a2 - a1);
  },
  // https://en.wikipedia.org/wiki/Linear_interpolation
  lerp: function(x, y, t) {
    return (1 - t) * x + t * y;
  },
  // http://en.wikipedia.org/wiki/Smoothstep
  smoothstep: function(x, min, max) {
    if (x <= min) return 0;
    if (x >= max) return 1;
    x = (x - min) / (max - min);
    return x * x * (3 - 2 * x);
  },
  smootherstep: function(x, min, max) {
    if (x <= min) return 0;
    if (x >= max) return 1;
    x = (x - min) / (max - min);
    return x * x * x * (x * (x * 6 - 15) + 10);
  },
  // Random integer from <low, high> interval
  randInt: function(low, high) {
    return low + Math.floor(Math.random() * (high - low + 1));
  },
  // Random float from <low, high> interval
  randFloat: function(low, high) {
    return low + Math.random() * (high - low);
  },
  // Random float from <-range/2, range/2> interval
  randFloatSpread: function(range) {
    return range * (0.5 - Math.random());
  },
  degToRad: function(degrees) {
    return degrees * _Math.DEG2RAD;
  },
  radToDeg: function(radians) {
    return radians * _Math.RAD2DEG;
  },
  isPowerOfTwo: function(value) {
    return (value & value - 1) === 0 && value !== 0;
  },
  ceilPowerOfTwo: function(value) {
    return Math.pow(2, Math.ceil(Math.log(value) / Math.LN2));
  },
  floorPowerOfTwo: function(value) {
    return Math.pow(2, Math.floor(Math.log(value) / Math.LN2));
  }
};

// src/math/Matrix4.js
function Matrix4() {
  this.elements = [
    1,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    1
  ];
  if (arguments.length > 0) {
    console.error("THREE.Matrix4: the constructor no longer reads arguments. use .set() instead.");
  }
}
Object.assign(Matrix4.prototype, {
  isMatrix4: true,
  set: function(n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44) {
    var te = this.elements;
    te[0] = n11;
    te[4] = n12;
    te[8] = n13;
    te[12] = n14;
    te[1] = n21;
    te[5] = n22;
    te[9] = n23;
    te[13] = n24;
    te[2] = n31;
    te[6] = n32;
    te[10] = n33;
    te[14] = n34;
    te[3] = n41;
    te[7] = n42;
    te[11] = n43;
    te[15] = n44;
    return this;
  },
  identity: function() {
    this.set(
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1
    );
    return this;
  },
  clone: function() {
    return new Matrix4().fromArray(this.elements);
  },
  copy: function(m) {
    var te = this.elements;
    var me = m.elements;
    te[0] = me[0];
    te[1] = me[1];
    te[2] = me[2];
    te[3] = me[3];
    te[4] = me[4];
    te[5] = me[5];
    te[6] = me[6];
    te[7] = me[7];
    te[8] = me[8];
    te[9] = me[9];
    te[10] = me[10];
    te[11] = me[11];
    te[12] = me[12];
    te[13] = me[13];
    te[14] = me[14];
    te[15] = me[15];
    return this;
  },
  copyPosition: function(m) {
    var te = this.elements, me = m.elements;
    te[12] = me[12];
    te[13] = me[13];
    te[14] = me[14];
    return this;
  },
  extractBasis: function(xAxis, yAxis, zAxis) {
    xAxis.setFromMatrixColumn(this, 0);
    yAxis.setFromMatrixColumn(this, 1);
    zAxis.setFromMatrixColumn(this, 2);
    return this;
  },
  makeBasis: function(xAxis, yAxis, zAxis) {
    this.set(
      xAxis.x,
      yAxis.x,
      zAxis.x,
      0,
      xAxis.y,
      yAxis.y,
      zAxis.y,
      0,
      xAxis.z,
      yAxis.z,
      zAxis.z,
      0,
      0,
      0,
      0,
      1
    );
    return this;
  },
  extractRotation: (function() {
    var v1 = new Vector3();
    return function extractRotation(m) {
      var te = this.elements;
      var me = m.elements;
      var scaleX = 1 / v1.setFromMatrixColumn(m, 0).length();
      var scaleY = 1 / v1.setFromMatrixColumn(m, 1).length();
      var scaleZ = 1 / v1.setFromMatrixColumn(m, 2).length();
      te[0] = me[0] * scaleX;
      te[1] = me[1] * scaleX;
      te[2] = me[2] * scaleX;
      te[3] = 0;
      te[4] = me[4] * scaleY;
      te[5] = me[5] * scaleY;
      te[6] = me[6] * scaleY;
      te[7] = 0;
      te[8] = me[8] * scaleZ;
      te[9] = me[9] * scaleZ;
      te[10] = me[10] * scaleZ;
      te[11] = 0;
      te[12] = 0;
      te[13] = 0;
      te[14] = 0;
      te[15] = 1;
      return this;
    };
  })(),
  makeRotationFromEuler: function(euler) {
    if (!(euler && euler.isEuler)) {
      console.error("THREE.Matrix4: .makeRotationFromEuler() now expects a Euler rotation rather than a Vector3 and order.");
    }
    var te = this.elements;
    var x = euler.x, y = euler.y, z = euler.z;
    var a = Math.cos(x), b = Math.sin(x);
    var c = Math.cos(y), d = Math.sin(y);
    var e = Math.cos(z), f = Math.sin(z);
    if (euler.order === "XYZ") {
      var ae = a * e, af = a * f, be = b * e, bf = b * f;
      te[0] = c * e;
      te[4] = -c * f;
      te[8] = d;
      te[1] = af + be * d;
      te[5] = ae - bf * d;
      te[9] = -b * c;
      te[2] = bf - ae * d;
      te[6] = be + af * d;
      te[10] = a * c;
    } else if (euler.order === "YXZ") {
      var ce = c * e, cf = c * f, de = d * e, df = d * f;
      te[0] = ce + df * b;
      te[4] = de * b - cf;
      te[8] = a * d;
      te[1] = a * f;
      te[5] = a * e;
      te[9] = -b;
      te[2] = cf * b - de;
      te[6] = df + ce * b;
      te[10] = a * c;
    } else if (euler.order === "ZXY") {
      var ce = c * e, cf = c * f, de = d * e, df = d * f;
      te[0] = ce - df * b;
      te[4] = -a * f;
      te[8] = de + cf * b;
      te[1] = cf + de * b;
      te[5] = a * e;
      te[9] = df - ce * b;
      te[2] = -a * d;
      te[6] = b;
      te[10] = a * c;
    } else if (euler.order === "ZYX") {
      var ae = a * e, af = a * f, be = b * e, bf = b * f;
      te[0] = c * e;
      te[4] = be * d - af;
      te[8] = ae * d + bf;
      te[1] = c * f;
      te[5] = bf * d + ae;
      te[9] = af * d - be;
      te[2] = -d;
      te[6] = b * c;
      te[10] = a * c;
    } else if (euler.order === "YZX") {
      var ac = a * c, ad = a * d, bc = b * c, bd = b * d;
      te[0] = c * e;
      te[4] = bd - ac * f;
      te[8] = bc * f + ad;
      te[1] = f;
      te[5] = a * e;
      te[9] = -b * e;
      te[2] = -d * e;
      te[6] = ad * f + bc;
      te[10] = ac - bd * f;
    } else if (euler.order === "XZY") {
      var ac = a * c, ad = a * d, bc = b * c, bd = b * d;
      te[0] = c * e;
      te[4] = -f;
      te[8] = d * e;
      te[1] = ac * f + bd;
      te[5] = a * e;
      te[9] = ad * f - bc;
      te[2] = bc * f - ad;
      te[6] = b * e;
      te[10] = bd * f + ac;
    }
    te[3] = 0;
    te[7] = 0;
    te[11] = 0;
    te[12] = 0;
    te[13] = 0;
    te[14] = 0;
    te[15] = 1;
    return this;
  },
  makeRotationFromQuaternion: (function() {
    var zero = new Vector3(0, 0, 0);
    var one = new Vector3(1, 1, 1);
    return function makeRotationFromQuaternion(q) {
      return this.compose(zero, q, one);
    };
  })(),
  lookAt: (function() {
    var x = new Vector3();
    var y = new Vector3();
    var z = new Vector3();
    return function lookAt(eye, target, up) {
      var te = this.elements;
      z.subVectors(eye, target);
      if (z.lengthSq() === 0) {
        z.z = 1;
      }
      z.normalize();
      x.crossVectors(up, z);
      if (x.lengthSq() === 0) {
        if (Math.abs(up.z) === 1) {
          z.x += 1e-4;
        } else {
          z.z += 1e-4;
        }
        z.normalize();
        x.crossVectors(up, z);
      }
      x.normalize();
      y.crossVectors(z, x);
      te[0] = x.x;
      te[4] = y.x;
      te[8] = z.x;
      te[1] = x.y;
      te[5] = y.y;
      te[9] = z.y;
      te[2] = x.z;
      te[6] = y.z;
      te[10] = z.z;
      return this;
    };
  })(),
  multiply: function(m, n) {
    if (n !== void 0) {
      console.warn("THREE.Matrix4: .multiply() now only accepts one argument. Use .multiplyMatrices( a, b ) instead.");
      return this.multiplyMatrices(m, n);
    }
    return this.multiplyMatrices(this, m);
  },
  premultiply: function(m) {
    return this.multiplyMatrices(m, this);
  },
  multiplyMatrices: function(a, b) {
    var ae = a.elements;
    var be = b.elements;
    var te = this.elements;
    var a11 = ae[0], a12 = ae[4], a13 = ae[8], a14 = ae[12];
    var a21 = ae[1], a22 = ae[5], a23 = ae[9], a24 = ae[13];
    var a31 = ae[2], a32 = ae[6], a33 = ae[10], a34 = ae[14];
    var a41 = ae[3], a42 = ae[7], a43 = ae[11], a44 = ae[15];
    var b11 = be[0], b12 = be[4], b13 = be[8], b14 = be[12];
    var b21 = be[1], b22 = be[5], b23 = be[9], b24 = be[13];
    var b31 = be[2], b32 = be[6], b33 = be[10], b34 = be[14];
    var b41 = be[3], b42 = be[7], b43 = be[11], b44 = be[15];
    te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
    te[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
    te[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
    te[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;
    te[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
    te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
    te[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
    te[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;
    te[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
    te[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
    te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
    te[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;
    te[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
    te[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
    te[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
    te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;
    return this;
  },
  multiplyScalar: function(s) {
    var te = this.elements;
    te[0] *= s;
    te[4] *= s;
    te[8] *= s;
    te[12] *= s;
    te[1] *= s;
    te[5] *= s;
    te[9] *= s;
    te[13] *= s;
    te[2] *= s;
    te[6] *= s;
    te[10] *= s;
    te[14] *= s;
    te[3] *= s;
    te[7] *= s;
    te[11] *= s;
    te[15] *= s;
    return this;
  },
  applyToBufferAttribute: (function() {
    var v1 = new Vector3();
    return function applyToBufferAttribute(attribute) {
      for (var i = 0, l = attribute.count; i < l; i++) {
        v1.x = attribute.getX(i);
        v1.y = attribute.getY(i);
        v1.z = attribute.getZ(i);
        v1.applyMatrix4(this);
        attribute.setXYZ(i, v1.x, v1.y, v1.z);
      }
      return attribute;
    };
  })(),
  determinant: function() {
    var te = this.elements;
    var n11 = te[0], n12 = te[4], n13 = te[8], n14 = te[12];
    var n21 = te[1], n22 = te[5], n23 = te[9], n24 = te[13];
    var n31 = te[2], n32 = te[6], n33 = te[10], n34 = te[14];
    var n41 = te[3], n42 = te[7], n43 = te[11], n44 = te[15];
    return n41 * (+n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34) + n42 * (+n11 * n23 * n34 - n11 * n24 * n33 + n14 * n21 * n33 - n13 * n21 * n34 + n13 * n24 * n31 - n14 * n23 * n31) + n43 * (+n11 * n24 * n32 - n11 * n22 * n34 - n14 * n21 * n32 + n12 * n21 * n34 + n14 * n22 * n31 - n12 * n24 * n31) + n44 * (-n13 * n22 * n31 - n11 * n23 * n32 + n11 * n22 * n33 + n13 * n21 * n32 - n12 * n21 * n33 + n12 * n23 * n31);
  },
  transpose: function() {
    var te = this.elements;
    var tmp;
    tmp = te[1];
    te[1] = te[4];
    te[4] = tmp;
    tmp = te[2];
    te[2] = te[8];
    te[8] = tmp;
    tmp = te[6];
    te[6] = te[9];
    te[9] = tmp;
    tmp = te[3];
    te[3] = te[12];
    te[12] = tmp;
    tmp = te[7];
    te[7] = te[13];
    te[13] = tmp;
    tmp = te[11];
    te[11] = te[14];
    te[14] = tmp;
    return this;
  },
  setPosition: function(v) {
    var te = this.elements;
    te[12] = v.x;
    te[13] = v.y;
    te[14] = v.z;
    return this;
  },
  getInverse: function(m, throwOnDegenerate) {
    var te = this.elements, me = m.elements, n11 = me[0], n21 = me[1], n31 = me[2], n41 = me[3], n12 = me[4], n22 = me[5], n32 = me[6], n42 = me[7], n13 = me[8], n23 = me[9], n33 = me[10], n43 = me[11], n14 = me[12], n24 = me[13], n34 = me[14], n44 = me[15], t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44, t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44, t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44, t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;
    var det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;
    if (det === 0) {
      var msg = "THREE.Matrix4: .getInverse() can't invert matrix, determinant is 0";
      if (throwOnDegenerate === true) {
        throw new Error(msg);
      } else {
        console.warn(msg);
      }
      return this.identity();
    }
    var detInv = 1 / det;
    te[0] = t11 * detInv;
    te[1] = (n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44) * detInv;
    te[2] = (n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44) * detInv;
    te[3] = (n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43) * detInv;
    te[4] = t12 * detInv;
    te[5] = (n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44) * detInv;
    te[6] = (n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44) * detInv;
    te[7] = (n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43) * detInv;
    te[8] = t13 * detInv;
    te[9] = (n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44) * detInv;
    te[10] = (n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44) * detInv;
    te[11] = (n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43) * detInv;
    te[12] = t14 * detInv;
    te[13] = (n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34) * detInv;
    te[14] = (n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34) * detInv;
    te[15] = (n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33) * detInv;
    return this;
  },
  scale: function(v) {
    var te = this.elements;
    var x = v.x, y = v.y, z = v.z;
    te[0] *= x;
    te[4] *= y;
    te[8] *= z;
    te[1] *= x;
    te[5] *= y;
    te[9] *= z;
    te[2] *= x;
    te[6] *= y;
    te[10] *= z;
    te[3] *= x;
    te[7] *= y;
    te[11] *= z;
    return this;
  },
  getMaxScaleOnAxis: function() {
    var te = this.elements;
    var scaleXSq = te[0] * te[0] + te[1] * te[1] + te[2] * te[2];
    var scaleYSq = te[4] * te[4] + te[5] * te[5] + te[6] * te[6];
    var scaleZSq = te[8] * te[8] + te[9] * te[9] + te[10] * te[10];
    return Math.sqrt(Math.max(scaleXSq, scaleYSq, scaleZSq));
  },
  makeTranslation: function(x, y, z) {
    this.set(
      1,
      0,
      0,
      x,
      0,
      1,
      0,
      y,
      0,
      0,
      1,
      z,
      0,
      0,
      0,
      1
    );
    return this;
  },
  makeRotationX: function(theta) {
    var c = Math.cos(theta), s = Math.sin(theta);
    this.set(
      1,
      0,
      0,
      0,
      0,
      c,
      -s,
      0,
      0,
      s,
      c,
      0,
      0,
      0,
      0,
      1
    );
    return this;
  },
  makeRotationY: function(theta) {
    var c = Math.cos(theta), s = Math.sin(theta);
    this.set(
      c,
      0,
      s,
      0,
      0,
      1,
      0,
      0,
      -s,
      0,
      c,
      0,
      0,
      0,
      0,
      1
    );
    return this;
  },
  makeRotationZ: function(theta) {
    var c = Math.cos(theta), s = Math.sin(theta);
    this.set(
      c,
      -s,
      0,
      0,
      s,
      c,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1
    );
    return this;
  },
  makeRotationAxis: function(axis, angle) {
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var t = 1 - c;
    var x = axis.x, y = axis.y, z = axis.z;
    var tx = t * x, ty = t * y;
    this.set(
      tx * x + c,
      tx * y - s * z,
      tx * z + s * y,
      0,
      tx * y + s * z,
      ty * y + c,
      ty * z - s * x,
      0,
      tx * z - s * y,
      ty * z + s * x,
      t * z * z + c,
      0,
      0,
      0,
      0,
      1
    );
    return this;
  },
  makeScale: function(x, y, z) {
    this.set(
      x,
      0,
      0,
      0,
      0,
      y,
      0,
      0,
      0,
      0,
      z,
      0,
      0,
      0,
      0,
      1
    );
    return this;
  },
  makeShear: function(x, y, z) {
    this.set(
      1,
      y,
      z,
      0,
      x,
      1,
      z,
      0,
      x,
      y,
      1,
      0,
      0,
      0,
      0,
      1
    );
    return this;
  },
  compose: function(position, quaternion, scale) {
    var te = this.elements;
    var x = quaternion._x, y = quaternion._y, z = quaternion._z, w = quaternion._w;
    var x2 = x + x, y2 = y + y, z2 = z + z;
    var xx = x * x2, xy = x * y2, xz = x * z2;
    var yy = y * y2, yz = y * z2, zz = z * z2;
    var wx = w * x2, wy = w * y2, wz = w * z2;
    var sx = scale.x, sy = scale.y, sz = scale.z;
    te[0] = (1 - (yy + zz)) * sx;
    te[1] = (xy + wz) * sx;
    te[2] = (xz - wy) * sx;
    te[3] = 0;
    te[4] = (xy - wz) * sy;
    te[5] = (1 - (xx + zz)) * sy;
    te[6] = (yz + wx) * sy;
    te[7] = 0;
    te[8] = (xz + wy) * sz;
    te[9] = (yz - wx) * sz;
    te[10] = (1 - (xx + yy)) * sz;
    te[11] = 0;
    te[12] = position.x;
    te[13] = position.y;
    te[14] = position.z;
    te[15] = 1;
    return this;
  },
  decompose: (function() {
    var vector = new Vector3();
    var matrix = new Matrix4();
    return function decompose(position, quaternion, scale) {
      var te = this.elements;
      var sx = vector.set(te[0], te[1], te[2]).length();
      var sy = vector.set(te[4], te[5], te[6]).length();
      var sz = vector.set(te[8], te[9], te[10]).length();
      var det = this.determinant();
      if (det < 0) sx = -sx;
      position.x = te[12];
      position.y = te[13];
      position.z = te[14];
      matrix.copy(this);
      var invSX = 1 / sx;
      var invSY = 1 / sy;
      var invSZ = 1 / sz;
      matrix.elements[0] *= invSX;
      matrix.elements[1] *= invSX;
      matrix.elements[2] *= invSX;
      matrix.elements[4] *= invSY;
      matrix.elements[5] *= invSY;
      matrix.elements[6] *= invSY;
      matrix.elements[8] *= invSZ;
      matrix.elements[9] *= invSZ;
      matrix.elements[10] *= invSZ;
      quaternion.setFromRotationMatrix(matrix);
      scale.x = sx;
      scale.y = sy;
      scale.z = sz;
      return this;
    };
  })(),
  makePerspective: function(left, right, top, bottom, near, far) {
    if (far === void 0) {
      console.warn("THREE.Matrix4: .makePerspective() has been redefined and has a new signature. Please check the docs.");
    }
    var te = this.elements;
    var x = 2 * near / (right - left);
    var y = 2 * near / (top - bottom);
    var a = (right + left) / (right - left);
    var b = (top + bottom) / (top - bottom);
    var c = -(far + near) / (far - near);
    var d = -2 * far * near / (far - near);
    te[0] = x;
    te[4] = 0;
    te[8] = a;
    te[12] = 0;
    te[1] = 0;
    te[5] = y;
    te[9] = b;
    te[13] = 0;
    te[2] = 0;
    te[6] = 0;
    te[10] = c;
    te[14] = d;
    te[3] = 0;
    te[7] = 0;
    te[11] = -1;
    te[15] = 0;
    return this;
  },
  makeOrthographic: function(left, right, top, bottom, near, far) {
    var te = this.elements;
    var w = 1 / (right - left);
    var h = 1 / (top - bottom);
    var p = 1 / (far - near);
    var x = (right + left) * w;
    var y = (top + bottom) * h;
    var z = (far + near) * p;
    te[0] = 2 * w;
    te[4] = 0;
    te[8] = 0;
    te[12] = -x;
    te[1] = 0;
    te[5] = 2 * h;
    te[9] = 0;
    te[13] = -y;
    te[2] = 0;
    te[6] = 0;
    te[10] = -2 * p;
    te[14] = -z;
    te[3] = 0;
    te[7] = 0;
    te[11] = 0;
    te[15] = 1;
    return this;
  },
  equals: function(matrix) {
    var te = this.elements;
    var me = matrix.elements;
    for (var i = 0; i < 16; i++) {
      if (te[i] !== me[i]) return false;
    }
    return true;
  },
  fromArray: function(array, offset) {
    if (offset === void 0) offset = 0;
    for (var i = 0; i < 16; i++) {
      this.elements[i] = array[i + offset];
    }
    return this;
  },
  toArray: function(array, offset) {
    if (array === void 0) array = [];
    if (offset === void 0) offset = 0;
    var te = this.elements;
    array[offset] = te[0];
    array[offset + 1] = te[1];
    array[offset + 2] = te[2];
    array[offset + 3] = te[3];
    array[offset + 4] = te[4];
    array[offset + 5] = te[5];
    array[offset + 6] = te[6];
    array[offset + 7] = te[7];
    array[offset + 8] = te[8];
    array[offset + 9] = te[9];
    array[offset + 10] = te[10];
    array[offset + 11] = te[11];
    array[offset + 12] = te[12];
    array[offset + 13] = te[13];
    array[offset + 14] = te[14];
    array[offset + 15] = te[15];
    return array;
  }
});

// src/math/Quaternion.js
function Quaternion(x, y, z, w) {
  this._x = x || 0;
  this._y = y || 0;
  this._z = z || 0;
  this._w = w !== void 0 ? w : 1;
}
Object.assign(Quaternion, {
  slerp: function(qa, qb, qm, t) {
    return qm.copy(qa).slerp(qb, t);
  },
  slerpFlat: function(dst, dstOffset, src0, srcOffset0, src1, srcOffset1, t) {
    var x0 = src0[srcOffset0 + 0], y0 = src0[srcOffset0 + 1], z0 = src0[srcOffset0 + 2], w0 = src0[srcOffset0 + 3], x1 = src1[srcOffset1 + 0], y1 = src1[srcOffset1 + 1], z1 = src1[srcOffset1 + 2], w1 = src1[srcOffset1 + 3];
    if (w0 !== w1 || x0 !== x1 || y0 !== y1 || z0 !== z1) {
      var s = 1 - t, cos = x0 * x1 + y0 * y1 + z0 * z1 + w0 * w1, dir = cos >= 0 ? 1 : -1, sqrSin = 1 - cos * cos;
      if (sqrSin > Number.EPSILON) {
        var sin = Math.sqrt(sqrSin), len = Math.atan2(sin, cos * dir);
        s = Math.sin(s * len) / sin;
        t = Math.sin(t * len) / sin;
      }
      var tDir = t * dir;
      x0 = x0 * s + x1 * tDir;
      y0 = y0 * s + y1 * tDir;
      z0 = z0 * s + z1 * tDir;
      w0 = w0 * s + w1 * tDir;
      if (s === 1 - t) {
        var f = 1 / Math.sqrt(x0 * x0 + y0 * y0 + z0 * z0 + w0 * w0);
        x0 *= f;
        y0 *= f;
        z0 *= f;
        w0 *= f;
      }
    }
    dst[dstOffset] = x0;
    dst[dstOffset + 1] = y0;
    dst[dstOffset + 2] = z0;
    dst[dstOffset + 3] = w0;
  }
});
Object.defineProperties(Quaternion.prototype, {
  x: {
    get: function() {
      return this._x;
    },
    set: function(value) {
      this._x = value;
      this.onChangeCallback();
    }
  },
  y: {
    get: function() {
      return this._y;
    },
    set: function(value) {
      this._y = value;
      this.onChangeCallback();
    }
  },
  z: {
    get: function() {
      return this._z;
    },
    set: function(value) {
      this._z = value;
      this.onChangeCallback();
    }
  },
  w: {
    get: function() {
      return this._w;
    },
    set: function(value) {
      this._w = value;
      this.onChangeCallback();
    }
  }
});
Object.assign(Quaternion.prototype, {
  set: function(x, y, z, w) {
    this._x = x;
    this._y = y;
    this._z = z;
    this._w = w;
    this.onChangeCallback();
    return this;
  },
  clone: function() {
    return new this.constructor(this._x, this._y, this._z, this._w);
  },
  copy: function(quaternion) {
    this._x = quaternion.x;
    this._y = quaternion.y;
    this._z = quaternion.z;
    this._w = quaternion.w;
    this.onChangeCallback();
    return this;
  },
  setFromEuler: function(euler, update) {
    if (!(euler && euler.isEuler)) {
      throw new Error("THREE.Quaternion: .setFromEuler() now expects an Euler rotation rather than a Vector3 and order.");
    }
    var x = euler._x, y = euler._y, z = euler._z, order = euler.order;
    var cos = Math.cos;
    var sin = Math.sin;
    var c1 = cos(x / 2);
    var c2 = cos(y / 2);
    var c3 = cos(z / 2);
    var s1 = sin(x / 2);
    var s2 = sin(y / 2);
    var s3 = sin(z / 2);
    if (order === "XYZ") {
      this._x = s1 * c2 * c3 + c1 * s2 * s3;
      this._y = c1 * s2 * c3 - s1 * c2 * s3;
      this._z = c1 * c2 * s3 + s1 * s2 * c3;
      this._w = c1 * c2 * c3 - s1 * s2 * s3;
    } else if (order === "YXZ") {
      this._x = s1 * c2 * c3 + c1 * s2 * s3;
      this._y = c1 * s2 * c3 - s1 * c2 * s3;
      this._z = c1 * c2 * s3 - s1 * s2 * c3;
      this._w = c1 * c2 * c3 + s1 * s2 * s3;
    } else if (order === "ZXY") {
      this._x = s1 * c2 * c3 - c1 * s2 * s3;
      this._y = c1 * s2 * c3 + s1 * c2 * s3;
      this._z = c1 * c2 * s3 + s1 * s2 * c3;
      this._w = c1 * c2 * c3 - s1 * s2 * s3;
    } else if (order === "ZYX") {
      this._x = s1 * c2 * c3 - c1 * s2 * s3;
      this._y = c1 * s2 * c3 + s1 * c2 * s3;
      this._z = c1 * c2 * s3 - s1 * s2 * c3;
      this._w = c1 * c2 * c3 + s1 * s2 * s3;
    } else if (order === "YZX") {
      this._x = s1 * c2 * c3 + c1 * s2 * s3;
      this._y = c1 * s2 * c3 + s1 * c2 * s3;
      this._z = c1 * c2 * s3 - s1 * s2 * c3;
      this._w = c1 * c2 * c3 - s1 * s2 * s3;
    } else if (order === "XZY") {
      this._x = s1 * c2 * c3 - c1 * s2 * s3;
      this._y = c1 * s2 * c3 - s1 * c2 * s3;
      this._z = c1 * c2 * s3 + s1 * s2 * c3;
      this._w = c1 * c2 * c3 + s1 * s2 * s3;
    }
    if (update !== false) this.onChangeCallback();
    return this;
  },
  setFromAxisAngle: function(axis, angle) {
    var halfAngle = angle / 2, s = Math.sin(halfAngle);
    this._x = axis.x * s;
    this._y = axis.y * s;
    this._z = axis.z * s;
    this._w = Math.cos(halfAngle);
    this.onChangeCallback();
    return this;
  },
  setFromRotationMatrix: function(m) {
    var te = m.elements, m11 = te[0], m12 = te[4], m13 = te[8], m21 = te[1], m22 = te[5], m23 = te[9], m31 = te[2], m32 = te[6], m33 = te[10], trace = m11 + m22 + m33, s;
    if (trace > 0) {
      s = 0.5 / Math.sqrt(trace + 1);
      this._w = 0.25 / s;
      this._x = (m32 - m23) * s;
      this._y = (m13 - m31) * s;
      this._z = (m21 - m12) * s;
    } else if (m11 > m22 && m11 > m33) {
      s = 2 * Math.sqrt(1 + m11 - m22 - m33);
      this._w = (m32 - m23) / s;
      this._x = 0.25 * s;
      this._y = (m12 + m21) / s;
      this._z = (m13 + m31) / s;
    } else if (m22 > m33) {
      s = 2 * Math.sqrt(1 + m22 - m11 - m33);
      this._w = (m13 - m31) / s;
      this._x = (m12 + m21) / s;
      this._y = 0.25 * s;
      this._z = (m23 + m32) / s;
    } else {
      s = 2 * Math.sqrt(1 + m33 - m11 - m22);
      this._w = (m21 - m12) / s;
      this._x = (m13 + m31) / s;
      this._y = (m23 + m32) / s;
      this._z = 0.25 * s;
    }
    this.onChangeCallback();
    return this;
  },
  setFromUnitVectors: (function() {
    var v1 = new Vector3();
    var r;
    var EPS2 = 1e-6;
    return function setFromUnitVectors(vFrom, vTo) {
      if (v1 === void 0) v1 = new Vector3();
      r = vFrom.dot(vTo) + 1;
      if (r < EPS2) {
        r = 0;
        if (Math.abs(vFrom.x) > Math.abs(vFrom.z)) {
          v1.set(-vFrom.y, vFrom.x, 0);
        } else {
          v1.set(0, -vFrom.z, vFrom.y);
        }
      } else {
        v1.crossVectors(vFrom, vTo);
      }
      this._x = v1.x;
      this._y = v1.y;
      this._z = v1.z;
      this._w = r;
      return this.normalize();
    };
  })(),
  angleTo: function(q) {
    return 2 * Math.acos(Math.abs(_Math.clamp(this.dot(q), -1, 1)));
  },
  rotateTowards: function(q, step) {
    var angle = this.angleTo(q);
    if (angle === 0) return this;
    var t = Math.min(1, step / angle);
    this.slerp(q, t);
    return this;
  },
  inverse: function() {
    return this.conjugate();
  },
  conjugate: function() {
    this._x *= -1;
    this._y *= -1;
    this._z *= -1;
    this.onChangeCallback();
    return this;
  },
  dot: function(v) {
    return this._x * v._x + this._y * v._y + this._z * v._z + this._w * v._w;
  },
  lengthSq: function() {
    return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w;
  },
  length: function() {
    return Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w);
  },
  normalize: function() {
    var l = this.length();
    if (l === 0) {
      this._x = 0;
      this._y = 0;
      this._z = 0;
      this._w = 1;
    } else {
      l = 1 / l;
      this._x = this._x * l;
      this._y = this._y * l;
      this._z = this._z * l;
      this._w = this._w * l;
    }
    this.onChangeCallback();
    return this;
  },
  multiply: function(q, p) {
    if (p !== void 0) {
      console.warn("THREE.Quaternion: .multiply() now only accepts one argument. Use .multiplyQuaternions( a, b ) instead.");
      return this.multiplyQuaternions(q, p);
    }
    return this.multiplyQuaternions(this, q);
  },
  premultiply: function(q) {
    return this.multiplyQuaternions(q, this);
  },
  multiplyQuaternions: function(a, b) {
    var qax = a._x, qay = a._y, qaz = a._z, qaw = a._w;
    var qbx = b._x, qby = b._y, qbz = b._z, qbw = b._w;
    this._x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
    this._y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
    this._z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
    this._w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;
    this.onChangeCallback();
    return this;
  },
  slerp: function(qb, t) {
    if (t === 0) return this;
    if (t === 1) return this.copy(qb);
    var x = this._x, y = this._y, z = this._z, w = this._w;
    var cosHalfTheta = w * qb._w + x * qb._x + y * qb._y + z * qb._z;
    if (cosHalfTheta < 0) {
      this._w = -qb._w;
      this._x = -qb._x;
      this._y = -qb._y;
      this._z = -qb._z;
      cosHalfTheta = -cosHalfTheta;
    } else {
      this.copy(qb);
    }
    if (cosHalfTheta >= 1) {
      this._w = w;
      this._x = x;
      this._y = y;
      this._z = z;
      return this;
    }
    var sqrSinHalfTheta = 1 - cosHalfTheta * cosHalfTheta;
    if (sqrSinHalfTheta <= Number.EPSILON) {
      var s = 1 - t;
      this._w = s * w + t * this._w;
      this._x = s * x + t * this._x;
      this._y = s * y + t * this._y;
      this._z = s * z + t * this._z;
      return this.normalize();
    }
    var sinHalfTheta = Math.sqrt(sqrSinHalfTheta);
    var halfTheta = Math.atan2(sinHalfTheta, cosHalfTheta);
    var ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta, ratioB = Math.sin(t * halfTheta) / sinHalfTheta;
    this._w = w * ratioA + this._w * ratioB;
    this._x = x * ratioA + this._x * ratioB;
    this._y = y * ratioA + this._y * ratioB;
    this._z = z * ratioA + this._z * ratioB;
    this.onChangeCallback();
    return this;
  },
  equals: function(quaternion) {
    return quaternion._x === this._x && quaternion._y === this._y && quaternion._z === this._z && quaternion._w === this._w;
  },
  fromArray: function(array, offset) {
    if (offset === void 0) offset = 0;
    this._x = array[offset];
    this._y = array[offset + 1];
    this._z = array[offset + 2];
    this._w = array[offset + 3];
    this.onChangeCallback();
    return this;
  },
  toArray: function(array, offset) {
    if (array === void 0) array = [];
    if (offset === void 0) offset = 0;
    array[offset] = this._x;
    array[offset + 1] = this._y;
    array[offset + 2] = this._z;
    array[offset + 3] = this._w;
    return array;
  },
  onChange: function(callback) {
    this.onChangeCallback = callback;
    return this;
  },
  onChangeCallback: function() {
  }
});

// src/math/Vector3.js
function Vector3(x, y, z) {
  this.x = x || 0;
  this.y = y || 0;
  this.z = z || 0;
}
Object.assign(Vector3.prototype, {
  isVector3: true,
  set: function(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  },
  setScalar: function(scalar) {
    this.x = scalar;
    this.y = scalar;
    this.z = scalar;
    return this;
  },
  setX: function(x) {
    this.x = x;
    return this;
  },
  setY: function(y) {
    this.y = y;
    return this;
  },
  setZ: function(z) {
    this.z = z;
    return this;
  },
  setComponent: function(index, value) {
    switch (index) {
      case 0:
        this.x = value;
        break;
      case 1:
        this.y = value;
        break;
      case 2:
        this.z = value;
        break;
      default:
        throw new Error("index is out of range: " + index);
    }
    return this;
  },
  getComponent: function(index) {
    switch (index) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      case 2:
        return this.z;
      default:
        throw new Error("index is out of range: " + index);
    }
  },
  clone: function() {
    return new this.constructor(this.x, this.y, this.z);
  },
  copy: function(v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  },
  add: function(v, w) {
    if (w !== void 0) {
      console.warn("THREE.Vector3: .add() now only accepts one argument. Use .addVectors( a, b ) instead.");
      return this.addVectors(v, w);
    }
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  },
  addScalar: function(s) {
    this.x += s;
    this.y += s;
    this.z += s;
    return this;
  },
  addVectors: function(a, b) {
    this.x = a.x + b.x;
    this.y = a.y + b.y;
    this.z = a.z + b.z;
    return this;
  },
  addScaledVector: function(v, s) {
    this.x += v.x * s;
    this.y += v.y * s;
    this.z += v.z * s;
    return this;
  },
  sub: function(v, w) {
    if (w !== void 0) {
      console.warn("THREE.Vector3: .sub() now only accepts one argument. Use .subVectors( a, b ) instead.");
      return this.subVectors(v, w);
    }
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    return this;
  },
  subScalar: function(s) {
    this.x -= s;
    this.y -= s;
    this.z -= s;
    return this;
  },
  subVectors: function(a, b) {
    this.x = a.x - b.x;
    this.y = a.y - b.y;
    this.z = a.z - b.z;
    return this;
  },
  multiply: function(v, w) {
    if (w !== void 0) {
      console.warn("THREE.Vector3: .multiply() now only accepts one argument. Use .multiplyVectors( a, b ) instead.");
      return this.multiplyVectors(v, w);
    }
    this.x *= v.x;
    this.y *= v.y;
    this.z *= v.z;
    return this;
  },
  multiplyScalar: function(scalar) {
    this.x *= scalar;
    this.y *= scalar;
    this.z *= scalar;
    return this;
  },
  multiplyVectors: function(a, b) {
    this.x = a.x * b.x;
    this.y = a.y * b.y;
    this.z = a.z * b.z;
    return this;
  },
  applyEuler: (function() {
    var quaternion = new Quaternion();
    return function applyEuler(euler) {
      if (!(euler && euler.isEuler)) {
        console.error("THREE.Vector3: .applyEuler() now expects an Euler rotation rather than a Vector3 and order.");
      }
      return this.applyQuaternion(quaternion.setFromEuler(euler));
    };
  })(),
  applyAxisAngle: (function() {
    var quaternion = new Quaternion();
    return function applyAxisAngle(axis, angle) {
      return this.applyQuaternion(quaternion.setFromAxisAngle(axis, angle));
    };
  })(),
  applyMatrix3: function(m) {
    var x = this.x, y = this.y, z = this.z;
    var e = m.elements;
    this.x = e[0] * x + e[3] * y + e[6] * z;
    this.y = e[1] * x + e[4] * y + e[7] * z;
    this.z = e[2] * x + e[5] * y + e[8] * z;
    return this;
  },
  applyMatrix4: function(m) {
    var x = this.x, y = this.y, z = this.z;
    var e = m.elements;
    var w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);
    this.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w;
    this.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w;
    this.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w;
    return this;
  },
  applyQuaternion: function(q) {
    var x = this.x, y = this.y, z = this.z;
    var qx = q.x, qy = q.y, qz = q.z, qw = q.w;
    var ix = qw * x + qy * z - qz * y;
    var iy = qw * y + qz * x - qx * z;
    var iz = qw * z + qx * y - qy * x;
    var iw = -qx * x - qy * y - qz * z;
    this.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    this.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    this.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;
    return this;
  },
  project: (function() {
    var matrix = new Matrix4();
    return function project(camera) {
      matrix.multiplyMatrices(camera.projectionMatrix, matrix.getInverse(camera.matrixWorld));
      return this.applyMatrix4(matrix);
    };
  })(),
  unproject: (function() {
    var matrix = new Matrix4();
    return function unproject(camera) {
      matrix.multiplyMatrices(camera.matrixWorld, matrix.getInverse(camera.projectionMatrix));
      return this.applyMatrix4(matrix);
    };
  })(),
  transformDirection: function(m) {
    var x = this.x, y = this.y, z = this.z;
    var e = m.elements;
    this.x = e[0] * x + e[4] * y + e[8] * z;
    this.y = e[1] * x + e[5] * y + e[9] * z;
    this.z = e[2] * x + e[6] * y + e[10] * z;
    return this.normalize();
  },
  divide: function(v) {
    this.x /= v.x;
    this.y /= v.y;
    this.z /= v.z;
    return this;
  },
  divideScalar: function(scalar) {
    return this.multiplyScalar(1 / scalar);
  },
  min: function(v) {
    this.x = Math.min(this.x, v.x);
    this.y = Math.min(this.y, v.y);
    this.z = Math.min(this.z, v.z);
    return this;
  },
  max: function(v) {
    this.x = Math.max(this.x, v.x);
    this.y = Math.max(this.y, v.y);
    this.z = Math.max(this.z, v.z);
    return this;
  },
  clamp: function(min, max) {
    this.x = Math.max(min.x, Math.min(max.x, this.x));
    this.y = Math.max(min.y, Math.min(max.y, this.y));
    this.z = Math.max(min.z, Math.min(max.z, this.z));
    return this;
  },
  clampScalar: (function() {
    var min = new Vector3();
    var max = new Vector3();
    return function clampScalar(minVal, maxVal) {
      min.set(minVal, minVal, minVal);
      max.set(maxVal, maxVal, maxVal);
      return this.clamp(min, max);
    };
  })(),
  clampLength: function(min, max) {
    var length = this.length();
    return this.divideScalar(length || 1).multiplyScalar(Math.max(min, Math.min(max, length)));
  },
  floor: function() {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    this.z = Math.floor(this.z);
    return this;
  },
  ceil: function() {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);
    this.z = Math.ceil(this.z);
    return this;
  },
  round: function() {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    this.z = Math.round(this.z);
    return this;
  },
  roundToZero: function() {
    this.x = this.x < 0 ? Math.ceil(this.x) : Math.floor(this.x);
    this.y = this.y < 0 ? Math.ceil(this.y) : Math.floor(this.y);
    this.z = this.z < 0 ? Math.ceil(this.z) : Math.floor(this.z);
    return this;
  },
  negate: function() {
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;
    return this;
  },
  dot: function(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  },
  // TODO lengthSquared?
  lengthSq: function() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  },
  length: function() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  },
  manhattanLength: function() {
    return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
  },
  normalize: function() {
    return this.divideScalar(this.length() || 1);
  },
  setLength: function(length) {
    return this.normalize().multiplyScalar(length);
  },
  lerp: function(v, alpha) {
    this.x += (v.x - this.x) * alpha;
    this.y += (v.y - this.y) * alpha;
    this.z += (v.z - this.z) * alpha;
    return this;
  },
  lerpVectors: function(v1, v2, alpha) {
    return this.subVectors(v2, v1).multiplyScalar(alpha).add(v1);
  },
  cross: function(v, w) {
    if (w !== void 0) {
      console.warn("THREE.Vector3: .cross() now only accepts one argument. Use .crossVectors( a, b ) instead.");
      return this.crossVectors(v, w);
    }
    return this.crossVectors(this, v);
  },
  crossVectors: function(a, b) {
    var ax = a.x, ay = a.y, az = a.z;
    var bx = b.x, by = b.y, bz = b.z;
    this.x = ay * bz - az * by;
    this.y = az * bx - ax * bz;
    this.z = ax * by - ay * bx;
    return this;
  },
  projectOnVector: function(vector) {
    var scalar = vector.dot(this) / vector.lengthSq();
    return this.copy(vector).multiplyScalar(scalar);
  },
  projectOnPlane: (function() {
    var v1 = new Vector3();
    return function projectOnPlane(planeNormal) {
      v1.copy(this).projectOnVector(planeNormal);
      return this.sub(v1);
    };
  })(),
  reflect: (function() {
    var v1 = new Vector3();
    return function reflect(normal) {
      return this.sub(v1.copy(normal).multiplyScalar(2 * this.dot(normal)));
    };
  })(),
  angleTo: function(v) {
    var theta = this.dot(v) / Math.sqrt(this.lengthSq() * v.lengthSq());
    return Math.acos(_Math.clamp(theta, -1, 1));
  },
  distanceTo: function(v) {
    return Math.sqrt(this.distanceToSquared(v));
  },
  distanceToSquared: function(v) {
    var dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;
    return dx * dx + dy * dy + dz * dz;
  },
  manhattanDistanceTo: function(v) {
    return Math.abs(this.x - v.x) + Math.abs(this.y - v.y) + Math.abs(this.z - v.z);
  },
  setFromSpherical: function(s) {
    var sinPhiRadius = Math.sin(s.phi) * s.radius;
    this.x = sinPhiRadius * Math.sin(s.theta);
    this.y = Math.cos(s.phi) * s.radius;
    this.z = sinPhiRadius * Math.cos(s.theta);
    return this;
  },
  setFromCylindrical: function(c) {
    this.x = c.radius * Math.sin(c.theta);
    this.y = c.y;
    this.z = c.radius * Math.cos(c.theta);
    return this;
  },
  setFromMatrixPosition: function(m) {
    var e = m.elements;
    this.x = e[12];
    this.y = e[13];
    this.z = e[14];
    return this;
  },
  setFromMatrixScale: function(m) {
    var sx = this.setFromMatrixColumn(m, 0).length();
    var sy = this.setFromMatrixColumn(m, 1).length();
    var sz = this.setFromMatrixColumn(m, 2).length();
    this.x = sx;
    this.y = sy;
    this.z = sz;
    return this;
  },
  setFromMatrixColumn: function(m, index) {
    return this.fromArray(m.elements, index * 4);
  },
  equals: function(v) {
    return v.x === this.x && v.y === this.y && v.z === this.z;
  },
  fromArray: function(array, offset) {
    if (offset === void 0) offset = 0;
    this.x = array[offset];
    this.y = array[offset + 1];
    this.z = array[offset + 2];
    return this;
  },
  toArray: function(array, offset) {
    if (array === void 0) array = [];
    if (offset === void 0) offset = 0;
    array[offset] = this.x;
    array[offset + 1] = this.y;
    array[offset + 2] = this.z;
    return array;
  },
  fromBufferAttribute: function(attribute, index, offset) {
    if (offset !== void 0) {
      console.warn("THREE.Vector3: offset has been removed from .fromBufferAttribute().");
    }
    this.x = attribute.getX(index);
    this.y = attribute.getY(index);
    this.z = attribute.getZ(index);
    return this;
  }
});

// src/math/Sphere.js
function Sphere(center, radius) {
  this.center = center !== void 0 ? center : new Vector3();
  this.radius = radius !== void 0 ? radius : 0;
}
Object.assign(Sphere.prototype, {
  set: function(center, radius) {
    this.center.copy(center);
    this.radius = radius;
    return this;
  },
  setFromPoints: (function() {
    var box = new Box3();
    return function setFromPoints(points, optionalCenter) {
      var center = this.center;
      if (optionalCenter !== void 0) {
        center.copy(optionalCenter);
      } else {
        box.setFromPoints(points).getCenter(center);
      }
      var maxRadiusSq = 0;
      for (var i = 0, il = points.length; i < il; i++) {
        maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(points[i]));
      }
      this.radius = Math.sqrt(maxRadiusSq);
      return this;
    };
  })(),
  clone: function() {
    return new this.constructor().copy(this);
  },
  copy: function(sphere) {
    this.center.copy(sphere.center);
    this.radius = sphere.radius;
    return this;
  },
  empty: function() {
    return this.radius <= 0;
  },
  containsPoint: function(point) {
    return point.distanceToSquared(this.center) <= this.radius * this.radius;
  },
  distanceToPoint: function(point) {
    return point.distanceTo(this.center) - this.radius;
  },
  intersectsSphere: function(sphere) {
    var radiusSum = this.radius + sphere.radius;
    return sphere.center.distanceToSquared(this.center) <= radiusSum * radiusSum;
  },
  intersectsBox: function(box) {
    return box.intersectsSphere(this);
  },
  intersectsPlane: function(plane) {
    return Math.abs(plane.distanceToPoint(this.center)) <= this.radius;
  },
  clampPoint: function(point, target) {
    var deltaLengthSq = this.center.distanceToSquared(point);
    if (target === void 0) {
      console.warn("THREE.Sphere: .clampPoint() target is now required");
      target = new Vector3();
    }
    target.copy(point);
    if (deltaLengthSq > this.radius * this.radius) {
      target.sub(this.center).normalize();
      target.multiplyScalar(this.radius).add(this.center);
    }
    return target;
  },
  getBoundingBox: function(target) {
    if (target === void 0) {
      console.warn("THREE.Sphere: .getBoundingBox() target is now required");
      target = new Box3();
    }
    target.set(this.center, this.center);
    target.expandByScalar(this.radius);
    return target;
  },
  applyMatrix4: function(matrix) {
    this.center.applyMatrix4(matrix);
    this.radius = this.radius * matrix.getMaxScaleOnAxis();
    return this;
  },
  translate: function(offset) {
    this.center.add(offset);
    return this;
  },
  equals: function(sphere) {
    return sphere.center.equals(this.center) && sphere.radius === this.radius;
  }
});

// src/math/Box3.js
function Box3(min, max) {
  this.min = min !== void 0 ? min : new Vector3(Infinity, Infinity, Infinity);
  this.max = max !== void 0 ? max : new Vector3(-Infinity, -Infinity, -Infinity);
}
Object.assign(Box3.prototype, {
  isBox3: true,
  set: function(min, max) {
    this.min.copy(min);
    this.max.copy(max);
    return this;
  },
  setFromArray: function(array) {
    var minX = Infinity;
    var minY = Infinity;
    var minZ = Infinity;
    var maxX = -Infinity;
    var maxY = -Infinity;
    var maxZ = -Infinity;
    for (var i = 0, l = array.length; i < l; i += 3) {
      var x = array[i];
      var y = array[i + 1];
      var z = array[i + 2];
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (z < minZ) minZ = z;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      if (z > maxZ) maxZ = z;
    }
    this.min.set(minX, minY, minZ);
    this.max.set(maxX, maxY, maxZ);
    return this;
  },
  setFromBufferAttribute: function(attribute) {
    var minX = Infinity;
    var minY = Infinity;
    var minZ = Infinity;
    var maxX = -Infinity;
    var maxY = -Infinity;
    var maxZ = -Infinity;
    for (var i = 0, l = attribute.count; i < l; i++) {
      var x = attribute.getX(i);
      var y = attribute.getY(i);
      var z = attribute.getZ(i);
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (z < minZ) minZ = z;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      if (z > maxZ) maxZ = z;
    }
    this.min.set(minX, minY, minZ);
    this.max.set(maxX, maxY, maxZ);
    return this;
  },
  setFromPoints: function(points) {
    this.makeEmpty();
    for (var i = 0, il = points.length; i < il; i++) {
      this.expandByPoint(points[i]);
    }
    return this;
  },
  setFromCenterAndSize: (function() {
    var v1 = new Vector3();
    return function setFromCenterAndSize(center, size) {
      var halfSize = v1.copy(size).multiplyScalar(0.5);
      this.min.copy(center).sub(halfSize);
      this.max.copy(center).add(halfSize);
      return this;
    };
  })(),
  setFromObject: function(object) {
    this.makeEmpty();
    return this.expandByObject(object);
  },
  clone: function() {
    return new this.constructor().copy(this);
  },
  copy: function(box) {
    this.min.copy(box.min);
    this.max.copy(box.max);
    return this;
  },
  makeEmpty: function() {
    this.min.x = this.min.y = this.min.z = Infinity;
    this.max.x = this.max.y = this.max.z = -Infinity;
    return this;
  },
  isEmpty: function() {
    return this.max.x < this.min.x || this.max.y < this.min.y || this.max.z < this.min.z;
  },
  getCenter: function(target) {
    if (target === void 0) {
      console.warn("THREE.Box3: .getCenter() target is now required");
      target = new Vector3();
    }
    return this.isEmpty() ? target.set(0, 0, 0) : target.addVectors(this.min, this.max).multiplyScalar(0.5);
  },
  getSize: function(target) {
    if (target === void 0) {
      console.warn("THREE.Box3: .getSize() target is now required");
      target = new Vector3();
    }
    return this.isEmpty() ? target.set(0, 0, 0) : target.subVectors(this.max, this.min);
  },
  expandByPoint: function(point) {
    this.min.min(point);
    this.max.max(point);
    return this;
  },
  expandByVector: function(vector) {
    this.min.sub(vector);
    this.max.add(vector);
    return this;
  },
  expandByScalar: function(scalar) {
    this.min.addScalar(-scalar);
    this.max.addScalar(scalar);
    return this;
  },
  expandByObject: (function() {
    var scope, i, l;
    var v1 = new Vector3();
    function traverse(node) {
      var geometry = node.geometry;
      if (geometry !== void 0) {
        if (geometry.isGeometry) {
          var vertices = geometry.vertices;
          for (i = 0, l = vertices.length; i < l; i++) {
            v1.copy(vertices[i]);
            v1.applyMatrix4(node.matrixWorld);
            scope.expandByPoint(v1);
          }
        } else if (geometry.isBufferGeometry) {
          var attribute = geometry.attributes.position;
          if (attribute !== void 0) {
            for (i = 0, l = attribute.count; i < l; i++) {
              v1.fromBufferAttribute(attribute, i).applyMatrix4(node.matrixWorld);
              scope.expandByPoint(v1);
            }
          }
        }
      }
    }
    return function expandByObject(object) {
      scope = this;
      object.updateMatrixWorld(true);
      object.traverse(traverse);
      return this;
    };
  })(),
  containsPoint: function(point) {
    return point.x < this.min.x || point.x > this.max.x || point.y < this.min.y || point.y > this.max.y || point.z < this.min.z || point.z > this.max.z ? false : true;
  },
  containsBox: function(box) {
    return this.min.x <= box.min.x && box.max.x <= this.max.x && this.min.y <= box.min.y && box.max.y <= this.max.y && this.min.z <= box.min.z && box.max.z <= this.max.z;
  },
  getParameter: function(point, target) {
    if (target === void 0) {
      console.warn("THREE.Box3: .getParameter() target is now required");
      target = new Vector3();
    }
    return target.set(
      (point.x - this.min.x) / (this.max.x - this.min.x),
      (point.y - this.min.y) / (this.max.y - this.min.y),
      (point.z - this.min.z) / (this.max.z - this.min.z)
    );
  },
  intersectsBox: function(box) {
    return box.max.x < this.min.x || box.min.x > this.max.x || box.max.y < this.min.y || box.min.y > this.max.y || box.max.z < this.min.z || box.min.z > this.max.z ? false : true;
  },
  intersectsSphere: (function() {
    var closestPoint = new Vector3();
    return function intersectsSphere(sphere) {
      this.clampPoint(sphere.center, closestPoint);
      return closestPoint.distanceToSquared(sphere.center) <= sphere.radius * sphere.radius;
    };
  })(),
  intersectsPlane: function(plane) {
    var min, max;
    if (plane.normal.x > 0) {
      min = plane.normal.x * this.min.x;
      max = plane.normal.x * this.max.x;
    } else {
      min = plane.normal.x * this.max.x;
      max = plane.normal.x * this.min.x;
    }
    if (plane.normal.y > 0) {
      min += plane.normal.y * this.min.y;
      max += plane.normal.y * this.max.y;
    } else {
      min += plane.normal.y * this.max.y;
      max += plane.normal.y * this.min.y;
    }
    if (plane.normal.z > 0) {
      min += plane.normal.z * this.min.z;
      max += plane.normal.z * this.max.z;
    } else {
      min += plane.normal.z * this.max.z;
      max += plane.normal.z * this.min.z;
    }
    return min <= plane.constant && max >= plane.constant;
  },
  intersectsTriangle: (function() {
    var v0 = new Vector3();
    var v1 = new Vector3();
    var v2 = new Vector3();
    var f0 = new Vector3();
    var f1 = new Vector3();
    var f2 = new Vector3();
    var testAxis = new Vector3();
    var center = new Vector3();
    var extents = new Vector3();
    var triangleNormal = new Vector3();
    function satForAxes(axes) {
      var i, j;
      for (i = 0, j = axes.length - 3; i <= j; i += 3) {
        testAxis.fromArray(axes, i);
        var r = extents.x * Math.abs(testAxis.x) + extents.y * Math.abs(testAxis.y) + extents.z * Math.abs(testAxis.z);
        var p0 = v0.dot(testAxis);
        var p1 = v1.dot(testAxis);
        var p2 = v2.dot(testAxis);
        if (Math.max(-Math.max(p0, p1, p2), Math.min(p0, p1, p2)) > r) {
          return false;
        }
      }
      return true;
    }
    return function intersectsTriangle(triangle) {
      if (this.isEmpty()) {
        return false;
      }
      this.getCenter(center);
      extents.subVectors(this.max, center);
      v0.subVectors(triangle.a, center);
      v1.subVectors(triangle.b, center);
      v2.subVectors(triangle.c, center);
      f0.subVectors(v1, v0);
      f1.subVectors(v2, v1);
      f2.subVectors(v0, v2);
      var axes = [
        0,
        -f0.z,
        f0.y,
        0,
        -f1.z,
        f1.y,
        0,
        -f2.z,
        f2.y,
        f0.z,
        0,
        -f0.x,
        f1.z,
        0,
        -f1.x,
        f2.z,
        0,
        -f2.x,
        -f0.y,
        f0.x,
        0,
        -f1.y,
        f1.x,
        0,
        -f2.y,
        f2.x,
        0
      ];
      if (!satForAxes(axes)) {
        return false;
      }
      axes = [1, 0, 0, 0, 1, 0, 0, 0, 1];
      if (!satForAxes(axes)) {
        return false;
      }
      triangleNormal.crossVectors(f0, f1);
      axes = [triangleNormal.x, triangleNormal.y, triangleNormal.z];
      return satForAxes(axes);
    };
  })(),
  clampPoint: function(point, target) {
    if (target === void 0) {
      console.warn("THREE.Box3: .clampPoint() target is now required");
      target = new Vector3();
    }
    return target.copy(point).clamp(this.min, this.max);
  },
  distanceToPoint: (function() {
    var v1 = new Vector3();
    return function distanceToPoint(point) {
      var clampedPoint = v1.copy(point).clamp(this.min, this.max);
      return clampedPoint.sub(point).length();
    };
  })(),
  getBoundingSphere: (function() {
    var v1 = new Vector3();
    return function getBoundingSphere(target) {
      if (target === void 0) {
        console.warn("THREE.Box3: .getBoundingSphere() target is now required");
        target = new Sphere();
      }
      this.getCenter(target.center);
      target.radius = this.getSize(v1).length() * 0.5;
      return target;
    };
  })(),
  intersect: function(box) {
    this.min.max(box.min);
    this.max.min(box.max);
    if (this.isEmpty()) this.makeEmpty();
    return this;
  },
  union: function(box) {
    this.min.min(box.min);
    this.max.max(box.max);
    return this;
  },
  applyMatrix4: function(matrix) {
    if (this.isEmpty()) return this;
    var m = matrix.elements;
    var xax = m[0] * this.min.x, xay = m[1] * this.min.x, xaz = m[2] * this.min.x;
    var xbx = m[0] * this.max.x, xby = m[1] * this.max.x, xbz = m[2] * this.max.x;
    var yax = m[4] * this.min.y, yay = m[5] * this.min.y, yaz = m[6] * this.min.y;
    var ybx = m[4] * this.max.y, yby = m[5] * this.max.y, ybz = m[6] * this.max.y;
    var zax = m[8] * this.min.z, zay = m[9] * this.min.z, zaz = m[10] * this.min.z;
    var zbx = m[8] * this.max.z, zby = m[9] * this.max.z, zbz = m[10] * this.max.z;
    this.min.x = Math.min(xax, xbx) + Math.min(yax, ybx) + Math.min(zax, zbx) + m[12];
    this.min.y = Math.min(xay, xby) + Math.min(yay, yby) + Math.min(zay, zby) + m[13];
    this.min.z = Math.min(xaz, xbz) + Math.min(yaz, ybz) + Math.min(zaz, zbz) + m[14];
    this.max.x = Math.max(xax, xbx) + Math.max(yax, ybx) + Math.max(zax, zbx) + m[12];
    this.max.y = Math.max(xay, xby) + Math.max(yay, yby) + Math.max(zay, zby) + m[13];
    this.max.z = Math.max(xaz, xbz) + Math.max(yaz, ybz) + Math.max(zaz, zbz) + m[14];
    return this;
  },
  translate: function(offset) {
    this.min.add(offset);
    this.max.add(offset);
    return this;
  },
  equals: function(box) {
    return box.min.equals(this.min) && box.max.equals(this.max);
  }
});

// src/math/Color.js
var ColorKeywords = {
  "aliceblue": 15792383,
  "antiquewhite": 16444375,
  "aqua": 65535,
  "aquamarine": 8388564,
  "azure": 15794175,
  "beige": 16119260,
  "bisque": 16770244,
  "black": 0,
  "blanchedalmond": 16772045,
  "blue": 255,
  "blueviolet": 9055202,
  "brown": 10824234,
  "burlywood": 14596231,
  "cadetblue": 6266528,
  "chartreuse": 8388352,
  "chocolate": 13789470,
  "coral": 16744272,
  "cornflowerblue": 6591981,
  "cornsilk": 16775388,
  "crimson": 14423100,
  "cyan": 65535,
  "darkblue": 139,
  "darkcyan": 35723,
  "darkgoldenrod": 12092939,
  "darkgray": 11119017,
  "darkgreen": 25600,
  "darkgrey": 11119017,
  "darkkhaki": 12433259,
  "darkmagenta": 9109643,
  "darkolivegreen": 5597999,
  "darkorange": 16747520,
  "darkorchid": 10040012,
  "darkred": 9109504,
  "darksalmon": 15308410,
  "darkseagreen": 9419919,
  "darkslateblue": 4734347,
  "darkslategray": 3100495,
  "darkslategrey": 3100495,
  "darkturquoise": 52945,
  "darkviolet": 9699539,
  "deeppink": 16716947,
  "deepskyblue": 49151,
  "dimgray": 6908265,
  "dimgrey": 6908265,
  "dodgerblue": 2003199,
  "firebrick": 11674146,
  "floralwhite": 16775920,
  "forestgreen": 2263842,
  "fuchsia": 16711935,
  "gainsboro": 14474460,
  "ghostwhite": 16316671,
  "gold": 16766720,
  "goldenrod": 14329120,
  "gray": 8421504,
  "green": 32768,
  "greenyellow": 11403055,
  "grey": 8421504,
  "honeydew": 15794160,
  "hotpink": 16738740,
  "indianred": 13458524,
  "indigo": 4915330,
  "ivory": 16777200,
  "khaki": 15787660,
  "lavender": 15132410,
  "lavenderblush": 16773365,
  "lawngreen": 8190976,
  "lemonchiffon": 16775885,
  "lightblue": 11393254,
  "lightcoral": 15761536,
  "lightcyan": 14745599,
  "lightgoldenrodyellow": 16448210,
  "lightgray": 13882323,
  "lightgreen": 9498256,
  "lightgrey": 13882323,
  "lightpink": 16758465,
  "lightsalmon": 16752762,
  "lightseagreen": 2142890,
  "lightskyblue": 8900346,
  "lightslategray": 7833753,
  "lightslategrey": 7833753,
  "lightsteelblue": 11584734,
  "lightyellow": 16777184,
  "lime": 65280,
  "limegreen": 3329330,
  "linen": 16445670,
  "magenta": 16711935,
  "maroon": 8388608,
  "mediumaquamarine": 6737322,
  "mediumblue": 205,
  "mediumorchid": 12211667,
  "mediumpurple": 9662683,
  "mediumseagreen": 3978097,
  "mediumslateblue": 8087790,
  "mediumspringgreen": 64154,
  "mediumturquoise": 4772300,
  "mediumvioletred": 13047173,
  "midnightblue": 1644912,
  "mintcream": 16121850,
  "mistyrose": 16770273,
  "moccasin": 16770229,
  "navajowhite": 16768685,
  "navy": 128,
  "oldlace": 16643558,
  "olive": 8421376,
  "olivedrab": 7048739,
  "orange": 16753920,
  "orangered": 16729344,
  "orchid": 14315734,
  "palegoldenrod": 15657130,
  "palegreen": 10025880,
  "paleturquoise": 11529966,
  "palevioletred": 14381203,
  "papayawhip": 16773077,
  "peachpuff": 16767673,
  "peru": 13468991,
  "pink": 16761035,
  "plum": 14524637,
  "powderblue": 11591910,
  "purple": 8388736,
  "rebeccapurple": 6697881,
  "red": 16711680,
  "rosybrown": 12357519,
  "royalblue": 4286945,
  "saddlebrown": 9127187,
  "salmon": 16416882,
  "sandybrown": 16032864,
  "seagreen": 3050327,
  "seashell": 16774638,
  "sienna": 10506797,
  "silver": 12632256,
  "skyblue": 8900331,
  "slateblue": 6970061,
  "slategray": 7372944,
  "slategrey": 7372944,
  "snow": 16775930,
  "springgreen": 65407,
  "steelblue": 4620980,
  "tan": 13808780,
  "teal": 32896,
  "thistle": 14204888,
  "tomato": 16737095,
  "turquoise": 4251856,
  "violet": 15631086,
  "wheat": 16113331,
  "white": 16777215,
  "whitesmoke": 16119285,
  "yellow": 16776960,
  "yellowgreen": 10145074
};
function Color(r, g, b) {
  if (g === void 0 && b === void 0) {
    return this.set(r);
  }
  return this.setRGB(r, g, b);
}
Object.assign(Color.prototype, {
  isColor: true,
  r: 1,
  g: 1,
  b: 1,
  set: function(value) {
    if (value && value.isColor) {
      this.copy(value);
    } else if (typeof value === "number") {
      this.setHex(value);
    } else if (typeof value === "string") {
      this.setStyle(value);
    }
    return this;
  },
  setScalar: function(scalar) {
    this.r = scalar;
    this.g = scalar;
    this.b = scalar;
    return this;
  },
  setHex: function(hex) {
    hex = Math.floor(hex);
    this.r = (hex >> 16 & 255) / 255;
    this.g = (hex >> 8 & 255) / 255;
    this.b = (hex & 255) / 255;
    return this;
  },
  setRGB: function(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
    return this;
  },
  setHSL: /* @__PURE__ */ (function() {
    function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * 6 * (2 / 3 - t);
      return p;
    }
    return function setHSL(h, s, l) {
      h = _Math.euclideanModulo(h, 1);
      s = _Math.clamp(s, 0, 1);
      l = _Math.clamp(l, 0, 1);
      if (s === 0) {
        this.r = this.g = this.b = l;
      } else {
        var p = l <= 0.5 ? l * (1 + s) : l + s - l * s;
        var q = 2 * l - p;
        this.r = hue2rgb(q, p, h + 1 / 3);
        this.g = hue2rgb(q, p, h);
        this.b = hue2rgb(q, p, h - 1 / 3);
      }
      return this;
    };
  })(),
  setStyle: function(style) {
    function handleAlpha(string) {
      if (string === void 0) return;
      if (parseFloat(string) < 1) {
        console.warn("THREE.Color: Alpha component of " + style + " will be ignored.");
      }
    }
    var m;
    if (m = /^((?:rgb|hsl)a?)\(\s*([^\)]*)\)/.exec(style)) {
      var color;
      var name = m[1];
      var components = m[2];
      switch (name) {
        case "rgb":
        case "rgba":
          if (color = /^(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(,\s*([0-9]*\.?[0-9]+)\s*)?$/.exec(components)) {
            this.r = Math.min(255, parseInt(color[1], 10)) / 255;
            this.g = Math.min(255, parseInt(color[2], 10)) / 255;
            this.b = Math.min(255, parseInt(color[3], 10)) / 255;
            handleAlpha(color[5]);
            return this;
          }
          if (color = /^(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(,\s*([0-9]*\.?[0-9]+)\s*)?$/.exec(components)) {
            this.r = Math.min(100, parseInt(color[1], 10)) / 100;
            this.g = Math.min(100, parseInt(color[2], 10)) / 100;
            this.b = Math.min(100, parseInt(color[3], 10)) / 100;
            handleAlpha(color[5]);
            return this;
          }
          break;
        case "hsl":
        case "hsla":
          if (color = /^([0-9]*\.?[0-9]+)\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(,\s*([0-9]*\.?[0-9]+)\s*)?$/.exec(components)) {
            var h = parseFloat(color[1]) / 360;
            var s = parseInt(color[2], 10) / 100;
            var l = parseInt(color[3], 10) / 100;
            handleAlpha(color[5]);
            return this.setHSL(h, s, l);
          }
          break;
      }
    } else if (m = /^\#([A-Fa-f0-9]+)$/.exec(style)) {
      var hex = m[1];
      var size = hex.length;
      if (size === 3) {
        this.r = parseInt(hex.charAt(0) + hex.charAt(0), 16) / 255;
        this.g = parseInt(hex.charAt(1) + hex.charAt(1), 16) / 255;
        this.b = parseInt(hex.charAt(2) + hex.charAt(2), 16) / 255;
        return this;
      } else if (size === 6) {
        this.r = parseInt(hex.charAt(0) + hex.charAt(1), 16) / 255;
        this.g = parseInt(hex.charAt(2) + hex.charAt(3), 16) / 255;
        this.b = parseInt(hex.charAt(4) + hex.charAt(5), 16) / 255;
        return this;
      }
    }
    if (style && style.length > 0) {
      var hex = ColorKeywords[style];
      if (hex !== void 0) {
        this.setHex(hex);
      } else {
        console.warn("THREE.Color: Unknown color " + style);
      }
    }
    return this;
  },
  clone: function() {
    return new this.constructor(this.r, this.g, this.b);
  },
  copy: function(color) {
    this.r = color.r;
    this.g = color.g;
    this.b = color.b;
    return this;
  },
  copyGammaToLinear: function(color, gammaFactor) {
    if (gammaFactor === void 0) gammaFactor = 2;
    this.r = Math.pow(color.r, gammaFactor);
    this.g = Math.pow(color.g, gammaFactor);
    this.b = Math.pow(color.b, gammaFactor);
    return this;
  },
  copyLinearToGamma: function(color, gammaFactor) {
    if (gammaFactor === void 0) gammaFactor = 2;
    var safeInverse = gammaFactor > 0 ? 1 / gammaFactor : 1;
    this.r = Math.pow(color.r, safeInverse);
    this.g = Math.pow(color.g, safeInverse);
    this.b = Math.pow(color.b, safeInverse);
    return this;
  },
  convertGammaToLinear: function(gammaFactor) {
    this.copyGammaToLinear(this, gammaFactor);
    return this;
  },
  convertLinearToGamma: function(gammaFactor) {
    this.copyLinearToGamma(this, gammaFactor);
    return this;
  },
  copySRGBToLinear: /* @__PURE__ */ (function() {
    function SRGBToLinear(c) {
      return c < 0.04045 ? c * 0.0773993808 : Math.pow(c * 0.9478672986 + 0.0521327014, 2.4);
    }
    return function copySRGBToLinear(color) {
      this.r = SRGBToLinear(color.r);
      this.g = SRGBToLinear(color.g);
      this.b = SRGBToLinear(color.b);
      return this;
    };
  })(),
  copyLinearToSRGB: /* @__PURE__ */ (function() {
    function LinearToSRGB(c) {
      return c < 31308e-7 ? c * 12.92 : 1.055 * Math.pow(c, 0.41666) - 0.055;
    }
    return function copyLinearToSRGB(color) {
      this.r = LinearToSRGB(color.r);
      this.g = LinearToSRGB(color.g);
      this.b = LinearToSRGB(color.b);
      return this;
    };
  })(),
  convertSRGBToLinear: function() {
    this.copySRGBToLinear(this);
    return this;
  },
  convertLinearToSRGB: function() {
    this.copyLinearToSRGB(this);
    return this;
  },
  getHex: function() {
    return this.r * 255 << 16 ^ this.g * 255 << 8 ^ this.b * 255 << 0;
  },
  getHexString: function() {
    return ("000000" + this.getHex().toString(16)).slice(-6);
  },
  getHSL: function(target) {
    if (target === void 0) {
      console.warn("THREE.Color: .getHSL() target is now required");
      target = { h: 0, s: 0, l: 0 };
    }
    var r = this.r, g = this.g, b = this.b;
    var max = Math.max(r, g, b);
    var min = Math.min(r, g, b);
    var hue, saturation;
    var lightness = (min + max) / 2;
    if (min === max) {
      hue = 0;
      saturation = 0;
    } else {
      var delta = max - min;
      saturation = lightness <= 0.5 ? delta / (max + min) : delta / (2 - max - min);
      switch (max) {
        case r:
          hue = (g - b) / delta + (g < b ? 6 : 0);
          break;
        case g:
          hue = (b - r) / delta + 2;
          break;
        case b:
          hue = (r - g) / delta + 4;
          break;
      }
      hue /= 6;
    }
    target.h = hue;
    target.s = saturation;
    target.l = lightness;
    return target;
  },
  getStyle: function() {
    return "rgb(" + (this.r * 255 | 0) + "," + (this.g * 255 | 0) + "," + (this.b * 255 | 0) + ")";
  },
  offsetHSL: /* @__PURE__ */ (function() {
    var hsl = {};
    return function(h, s, l) {
      this.getHSL(hsl);
      hsl.h += h;
      hsl.s += s;
      hsl.l += l;
      this.setHSL(hsl.h, hsl.s, hsl.l);
      return this;
    };
  })(),
  add: function(color) {
    this.r += color.r;
    this.g += color.g;
    this.b += color.b;
    return this;
  },
  addColors: function(color1, color2) {
    this.r = color1.r + color2.r;
    this.g = color1.g + color2.g;
    this.b = color1.b + color2.b;
    return this;
  },
  addScalar: function(s) {
    this.r += s;
    this.g += s;
    this.b += s;
    return this;
  },
  sub: function(color) {
    this.r = Math.max(0, this.r - color.r);
    this.g = Math.max(0, this.g - color.g);
    this.b = Math.max(0, this.b - color.b);
    return this;
  },
  multiply: function(color) {
    this.r *= color.r;
    this.g *= color.g;
    this.b *= color.b;
    return this;
  },
  multiplyScalar: function(s) {
    this.r *= s;
    this.g *= s;
    this.b *= s;
    return this;
  },
  lerp: function(color, alpha) {
    this.r += (color.r - this.r) * alpha;
    this.g += (color.g - this.g) * alpha;
    this.b += (color.b - this.b) * alpha;
    return this;
  },
  equals: function(c) {
    return c.r === this.r && c.g === this.g && c.b === this.b;
  },
  fromArray: function(array, offset) {
    if (offset === void 0) offset = 0;
    this.r = array[offset];
    this.g = array[offset + 1];
    this.b = array[offset + 2];
    return this;
  },
  toArray: function(array, offset) {
    if (array === void 0) array = [];
    if (offset === void 0) offset = 0;
    array[offset] = this.r;
    array[offset + 1] = this.g;
    array[offset + 2] = this.b;
    return array;
  },
  toJSON: function() {
    return this.getHex();
  }
});

// src/math/Cylindrical.js
function Cylindrical(radius, theta, y) {
  this.radius = radius !== void 0 ? radius : 1;
  this.theta = theta !== void 0 ? theta : 0;
  this.y = y !== void 0 ? y : 0;
  return this;
}
Object.assign(Cylindrical.prototype, {
  set: function(radius, theta, y) {
    this.radius = radius;
    this.theta = theta;
    this.y = y;
    return this;
  },
  clone: function() {
    return new this.constructor().copy(this);
  },
  copy: function(other) {
    this.radius = other.radius;
    this.theta = other.theta;
    this.y = other.y;
    return this;
  },
  setFromVector3: function(vec3) {
    this.radius = Math.sqrt(vec3.x * vec3.x + vec3.z * vec3.z);
    this.theta = Math.atan2(vec3.x, vec3.z);
    this.y = vec3.y;
    return this;
  }
});

// src/math/Euler.js
function Euler(x, y, z, order) {
  this._x = x || 0;
  this._y = y || 0;
  this._z = z || 0;
  this._order = order || Euler.DefaultOrder;
}
Euler.RotationOrders = ["XYZ", "YZX", "ZXY", "XZY", "YXZ", "ZYX"];
Euler.DefaultOrder = "XYZ";
Object.defineProperties(Euler.prototype, {
  x: {
    get: function() {
      return this._x;
    },
    set: function(value) {
      this._x = value;
      this.onChangeCallback();
    }
  },
  y: {
    get: function() {
      return this._y;
    },
    set: function(value) {
      this._y = value;
      this.onChangeCallback();
    }
  },
  z: {
    get: function() {
      return this._z;
    },
    set: function(value) {
      this._z = value;
      this.onChangeCallback();
    }
  },
  order: {
    get: function() {
      return this._order;
    },
    set: function(value) {
      this._order = value;
      this.onChangeCallback();
    }
  }
});
Object.assign(Euler.prototype, {
  isEuler: true,
  set: function(x, y, z, order) {
    this._x = x;
    this._y = y;
    this._z = z;
    this._order = order || this._order;
    this.onChangeCallback();
    return this;
  },
  clone: function() {
    return new this.constructor(this._x, this._y, this._z, this._order);
  },
  copy: function(euler) {
    this._x = euler._x;
    this._y = euler._y;
    this._z = euler._z;
    this._order = euler._order;
    this.onChangeCallback();
    return this;
  },
  setFromRotationMatrix: function(m, order, update) {
    var clamp = _Math.clamp;
    var te = m.elements;
    var m11 = te[0], m12 = te[4], m13 = te[8];
    var m21 = te[1], m22 = te[5], m23 = te[9];
    var m31 = te[2], m32 = te[6], m33 = te[10];
    order = order || this._order;
    if (order === "XYZ") {
      this._y = Math.asin(clamp(m13, -1, 1));
      if (Math.abs(m13) < 0.99999) {
        this._x = Math.atan2(-m23, m33);
        this._z = Math.atan2(-m12, m11);
      } else {
        this._x = Math.atan2(m32, m22);
        this._z = 0;
      }
    } else if (order === "YXZ") {
      this._x = Math.asin(-clamp(m23, -1, 1));
      if (Math.abs(m23) < 0.99999) {
        this._y = Math.atan2(m13, m33);
        this._z = Math.atan2(m21, m22);
      } else {
        this._y = Math.atan2(-m31, m11);
        this._z = 0;
      }
    } else if (order === "ZXY") {
      this._x = Math.asin(clamp(m32, -1, 1));
      if (Math.abs(m32) < 0.99999) {
        this._y = Math.atan2(-m31, m33);
        this._z = Math.atan2(-m12, m22);
      } else {
        this._y = 0;
        this._z = Math.atan2(m21, m11);
      }
    } else if (order === "ZYX") {
      this._y = Math.asin(-clamp(m31, -1, 1));
      if (Math.abs(m31) < 0.99999) {
        this._x = Math.atan2(m32, m33);
        this._z = Math.atan2(m21, m11);
      } else {
        this._x = 0;
        this._z = Math.atan2(-m12, m22);
      }
    } else if (order === "YZX") {
      this._z = Math.asin(clamp(m21, -1, 1));
      if (Math.abs(m21) < 0.99999) {
        this._x = Math.atan2(-m23, m22);
        this._y = Math.atan2(-m31, m11);
      } else {
        this._x = 0;
        this._y = Math.atan2(m13, m33);
      }
    } else if (order === "XZY") {
      this._z = Math.asin(-clamp(m12, -1, 1));
      if (Math.abs(m12) < 0.99999) {
        this._x = Math.atan2(m32, m22);
        this._y = Math.atan2(m13, m11);
      } else {
        this._x = Math.atan2(-m23, m33);
        this._y = 0;
      }
    } else {
      console.warn("THREE.Euler: .setFromRotationMatrix() given unsupported order: " + order);
    }
    this._order = order;
    if (update !== false) this.onChangeCallback();
    return this;
  },
  setFromQuaternion: (function() {
    var matrix = new Matrix4();
    return function setFromQuaternion(q, order, update) {
      matrix.makeRotationFromQuaternion(q);
      return this.setFromRotationMatrix(matrix, order, update);
    };
  })(),
  setFromVector3: function(v, order) {
    return this.set(v.x, v.y, v.z, order || this._order);
  },
  reorder: (function() {
    var q = new Quaternion();
    return function reorder(newOrder) {
      q.setFromEuler(this);
      return this.setFromQuaternion(q, newOrder);
    };
  })(),
  equals: function(euler) {
    return euler._x === this._x && euler._y === this._y && euler._z === this._z && euler._order === this._order;
  },
  fromArray: function(array) {
    this._x = array[0];
    this._y = array[1];
    this._z = array[2];
    if (array[3] !== void 0) this._order = array[3];
    this.onChangeCallback();
    return this;
  },
  toArray: function(array, offset) {
    if (array === void 0) array = [];
    if (offset === void 0) offset = 0;
    array[offset] = this._x;
    array[offset + 1] = this._y;
    array[offset + 2] = this._z;
    array[offset + 3] = this._order;
    return array;
  },
  toVector3: function(optionalResult) {
    if (optionalResult) {
      return optionalResult.set(this._x, this._y, this._z);
    } else {
      return new Vector3(this._x, this._y, this._z);
    }
  },
  onChange: function(callback) {
    this.onChangeCallback = callback;
    return this;
  },
  onChangeCallback: function() {
  }
});

// src/math/Matrix3.js
function Matrix3() {
  this.elements = [
    1,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    1
  ];
  if (arguments.length > 0) {
    console.error("THREE.Matrix3: the constructor no longer reads arguments. use .set() instead.");
  }
}
Object.assign(Matrix3.prototype, {
  isMatrix3: true,
  set: function(n11, n12, n13, n21, n22, n23, n31, n32, n33) {
    var te = this.elements;
    te[0] = n11;
    te[1] = n21;
    te[2] = n31;
    te[3] = n12;
    te[4] = n22;
    te[5] = n32;
    te[6] = n13;
    te[7] = n23;
    te[8] = n33;
    return this;
  },
  identity: function() {
    this.set(
      1,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      1
    );
    return this;
  },
  clone: function() {
    return new this.constructor().fromArray(this.elements);
  },
  copy: function(m) {
    var te = this.elements;
    var me = m.elements;
    te[0] = me[0];
    te[1] = me[1];
    te[2] = me[2];
    te[3] = me[3];
    te[4] = me[4];
    te[5] = me[5];
    te[6] = me[6];
    te[7] = me[7];
    te[8] = me[8];
    return this;
  },
  setFromMatrix4: function(m) {
    var me = m.elements;
    this.set(
      me[0],
      me[4],
      me[8],
      me[1],
      me[5],
      me[9],
      me[2],
      me[6],
      me[10]
    );
    return this;
  },
  applyToBufferAttribute: (function() {
    var v1 = new Vector3();
    return function applyToBufferAttribute(attribute) {
      for (var i = 0, l = attribute.count; i < l; i++) {
        v1.x = attribute.getX(i);
        v1.y = attribute.getY(i);
        v1.z = attribute.getZ(i);
        v1.applyMatrix3(this);
        attribute.setXYZ(i, v1.x, v1.y, v1.z);
      }
      return attribute;
    };
  })(),
  multiply: function(m) {
    return this.multiplyMatrices(this, m);
  },
  premultiply: function(m) {
    return this.multiplyMatrices(m, this);
  },
  multiplyMatrices: function(a, b) {
    var ae = a.elements;
    var be = b.elements;
    var te = this.elements;
    var a11 = ae[0], a12 = ae[3], a13 = ae[6];
    var a21 = ae[1], a22 = ae[4], a23 = ae[7];
    var a31 = ae[2], a32 = ae[5], a33 = ae[8];
    var b11 = be[0], b12 = be[3], b13 = be[6];
    var b21 = be[1], b22 = be[4], b23 = be[7];
    var b31 = be[2], b32 = be[5], b33 = be[8];
    te[0] = a11 * b11 + a12 * b21 + a13 * b31;
    te[3] = a11 * b12 + a12 * b22 + a13 * b32;
    te[6] = a11 * b13 + a12 * b23 + a13 * b33;
    te[1] = a21 * b11 + a22 * b21 + a23 * b31;
    te[4] = a21 * b12 + a22 * b22 + a23 * b32;
    te[7] = a21 * b13 + a22 * b23 + a23 * b33;
    te[2] = a31 * b11 + a32 * b21 + a33 * b31;
    te[5] = a31 * b12 + a32 * b22 + a33 * b32;
    te[8] = a31 * b13 + a32 * b23 + a33 * b33;
    return this;
  },
  multiplyScalar: function(s) {
    var te = this.elements;
    te[0] *= s;
    te[3] *= s;
    te[6] *= s;
    te[1] *= s;
    te[4] *= s;
    te[7] *= s;
    te[2] *= s;
    te[5] *= s;
    te[8] *= s;
    return this;
  },
  determinant: function() {
    var te = this.elements;
    var a = te[0], b = te[1], c = te[2], d = te[3], e = te[4], f = te[5], g = te[6], h = te[7], i = te[8];
    return a * e * i - a * f * h - b * d * i + b * f * g + c * d * h - c * e * g;
  },
  getInverse: function(matrix, throwOnDegenerate) {
    if (matrix && matrix.isMatrix4) {
      console.error("THREE.Matrix3: .getInverse() no longer takes a Matrix4 argument.");
    }
    var me = matrix.elements, te = this.elements, n11 = me[0], n21 = me[1], n31 = me[2], n12 = me[3], n22 = me[4], n32 = me[5], n13 = me[6], n23 = me[7], n33 = me[8], t11 = n33 * n22 - n32 * n23, t12 = n32 * n13 - n33 * n12, t13 = n23 * n12 - n22 * n13, det = n11 * t11 + n21 * t12 + n31 * t13;
    if (det === 0) {
      var msg = "THREE.Matrix3: .getInverse() can't invert matrix, determinant is 0";
      if (throwOnDegenerate === true) {
        throw new Error(msg);
      } else {
        console.warn(msg);
      }
      return this.identity();
    }
    var detInv = 1 / det;
    te[0] = t11 * detInv;
    te[1] = (n31 * n23 - n33 * n21) * detInv;
    te[2] = (n32 * n21 - n31 * n22) * detInv;
    te[3] = t12 * detInv;
    te[4] = (n33 * n11 - n31 * n13) * detInv;
    te[5] = (n31 * n12 - n32 * n11) * detInv;
    te[6] = t13 * detInv;
    te[7] = (n21 * n13 - n23 * n11) * detInv;
    te[8] = (n22 * n11 - n21 * n12) * detInv;
    return this;
  },
  transpose: function() {
    var tmp, m = this.elements;
    tmp = m[1];
    m[1] = m[3];
    m[3] = tmp;
    tmp = m[2];
    m[2] = m[6];
    m[6] = tmp;
    tmp = m[5];
    m[5] = m[7];
    m[7] = tmp;
    return this;
  },
  getNormalMatrix: function(matrix4) {
    return this.setFromMatrix4(matrix4).getInverse(this).transpose();
  },
  transposeIntoArray: function(r) {
    var m = this.elements;
    r[0] = m[0];
    r[1] = m[3];
    r[2] = m[6];
    r[3] = m[1];
    r[4] = m[4];
    r[5] = m[7];
    r[6] = m[2];
    r[7] = m[5];
    r[8] = m[8];
    return this;
  },
  setUvTransform: function(tx, ty, sx, sy, rotation, cx, cy) {
    var c = Math.cos(rotation);
    var s = Math.sin(rotation);
    this.set(
      sx * c,
      sx * s,
      -sx * (c * cx + s * cy) + cx + tx,
      -sy * s,
      sy * c,
      -sy * (-s * cx + c * cy) + cy + ty,
      0,
      0,
      1
    );
  },
  scale: function(sx, sy) {
    var te = this.elements;
    te[0] *= sx;
    te[3] *= sx;
    te[6] *= sx;
    te[1] *= sy;
    te[4] *= sy;
    te[7] *= sy;
    return this;
  },
  rotate: function(theta) {
    var c = Math.cos(theta);
    var s = Math.sin(theta);
    var te = this.elements;
    var a11 = te[0], a12 = te[3], a13 = te[6];
    var a21 = te[1], a22 = te[4], a23 = te[7];
    te[0] = c * a11 + s * a21;
    te[3] = c * a12 + s * a22;
    te[6] = c * a13 + s * a23;
    te[1] = -s * a11 + c * a21;
    te[4] = -s * a12 + c * a22;
    te[7] = -s * a13 + c * a23;
    return this;
  },
  translate: function(tx, ty) {
    var te = this.elements;
    te[0] += tx * te[2];
    te[3] += tx * te[5];
    te[6] += tx * te[8];
    te[1] += ty * te[2];
    te[4] += ty * te[5];
    te[7] += ty * te[8];
    return this;
  },
  equals: function(matrix) {
    var te = this.elements;
    var me = matrix.elements;
    for (var i = 0; i < 9; i++) {
      if (te[i] !== me[i]) return false;
    }
    return true;
  },
  fromArray: function(array, offset) {
    if (offset === void 0) offset = 0;
    for (var i = 0; i < 9; i++) {
      this.elements[i] = array[i + offset];
    }
    return this;
  },
  toArray: function(array, offset) {
    if (array === void 0) array = [];
    if (offset === void 0) offset = 0;
    var te = this.elements;
    array[offset] = te[0];
    array[offset + 1] = te[1];
    array[offset + 2] = te[2];
    array[offset + 3] = te[3];
    array[offset + 4] = te[4];
    array[offset + 5] = te[5];
    array[offset + 6] = te[6];
    array[offset + 7] = te[7];
    array[offset + 8] = te[8];
    return array;
  }
});

// src/math/Plane.js
function Plane(normal, constant) {
  this.normal = normal !== void 0 ? normal : new Vector3(1, 0, 0);
  this.constant = constant !== void 0 ? constant : 0;
}
Object.assign(Plane.prototype, {
  set: function(normal, constant) {
    this.normal.copy(normal);
    this.constant = constant;
    return this;
  },
  setComponents: function(x, y, z, w) {
    this.normal.set(x, y, z);
    this.constant = w;
    return this;
  },
  setFromNormalAndCoplanarPoint: function(normal, point) {
    this.normal.copy(normal);
    this.constant = -point.dot(this.normal);
    return this;
  },
  setFromCoplanarPoints: (function() {
    var v1 = new Vector3();
    var v2 = new Vector3();
    return function setFromCoplanarPoints(a, b, c) {
      var normal = v1.subVectors(c, b).cross(v2.subVectors(a, b)).normalize();
      this.setFromNormalAndCoplanarPoint(normal, a);
      return this;
    };
  })(),
  clone: function() {
    return new this.constructor().copy(this);
  },
  copy: function(plane) {
    this.normal.copy(plane.normal);
    this.constant = plane.constant;
    return this;
  },
  normalize: function() {
    var inverseNormalLength = 1 / this.normal.length();
    this.normal.multiplyScalar(inverseNormalLength);
    this.constant *= inverseNormalLength;
    return this;
  },
  negate: function() {
    this.constant *= -1;
    this.normal.negate();
    return this;
  },
  distanceToPoint: function(point) {
    return this.normal.dot(point) + this.constant;
  },
  distanceToSphere: function(sphere) {
    return this.distanceToPoint(sphere.center) - sphere.radius;
  },
  projectPoint: function(point, target) {
    if (target === void 0) {
      console.warn("THREE.Plane: .projectPoint() target is now required");
      target = new Vector3();
    }
    return target.copy(this.normal).multiplyScalar(-this.distanceToPoint(point)).add(point);
  },
  intersectLine: (function() {
    var v1 = new Vector3();
    return function intersectLine(line, target) {
      if (target === void 0) {
        console.warn("THREE.Plane: .intersectLine() target is now required");
        target = new Vector3();
      }
      var direction = line.delta(v1);
      var denominator = this.normal.dot(direction);
      if (denominator === 0) {
        if (this.distanceToPoint(line.start) === 0) {
          return target.copy(line.start);
        }
        return void 0;
      }
      var t = -(line.start.dot(this.normal) + this.constant) / denominator;
      if (t < 0 || t > 1) {
        return void 0;
      }
      return target.copy(direction).multiplyScalar(t).add(line.start);
    };
  })(),
  intersectsLine: function(line) {
    var startSign = this.distanceToPoint(line.start);
    var endSign = this.distanceToPoint(line.end);
    return startSign < 0 && endSign > 0 || endSign < 0 && startSign > 0;
  },
  intersectsBox: function(box) {
    return box.intersectsPlane(this);
  },
  intersectsSphere: function(sphere) {
    return sphere.intersectsPlane(this);
  },
  coplanarPoint: function(target) {
    if (target === void 0) {
      console.warn("THREE.Plane: .coplanarPoint() target is now required");
      target = new Vector3();
    }
    return target.copy(this.normal).multiplyScalar(-this.constant);
  },
  applyMatrix4: (function() {
    var v1 = new Vector3();
    var m1 = new Matrix3();
    return function applyMatrix4(matrix, optionalNormalMatrix) {
      var normalMatrix = optionalNormalMatrix || m1.getNormalMatrix(matrix);
      var referencePoint = this.coplanarPoint(v1).applyMatrix4(matrix);
      var normal = this.normal.applyMatrix3(normalMatrix).normalize();
      this.constant = -referencePoint.dot(normal);
      return this;
    };
  })(),
  translate: function(offset) {
    this.constant -= offset.dot(this.normal);
    return this;
  },
  equals: function(plane) {
    return plane.normal.equals(this.normal) && plane.constant === this.constant;
  }
});

// src/math/Frustum.js
function Frustum(p0, p1, p2, p3, p4, p5) {
  this.planes = [
    p0 !== void 0 ? p0 : new Plane(),
    p1 !== void 0 ? p1 : new Plane(),
    p2 !== void 0 ? p2 : new Plane(),
    p3 !== void 0 ? p3 : new Plane(),
    p4 !== void 0 ? p4 : new Plane(),
    p5 !== void 0 ? p5 : new Plane()
  ];
}
Object.assign(Frustum.prototype, {
  set: function(p0, p1, p2, p3, p4, p5) {
    var planes = this.planes;
    planes[0].copy(p0);
    planes[1].copy(p1);
    planes[2].copy(p2);
    planes[3].copy(p3);
    planes[4].copy(p4);
    planes[5].copy(p5);
    return this;
  },
  clone: function() {
    return new this.constructor().copy(this);
  },
  copy: function(frustum) {
    var planes = this.planes;
    for (var i = 0; i < 6; i++) {
      planes[i].copy(frustum.planes[i]);
    }
    return this;
  },
  setFromMatrix: function(m) {
    var planes = this.planes;
    var me = m.elements;
    var me0 = me[0], me1 = me[1], me2 = me[2], me3 = me[3];
    var me4 = me[4], me5 = me[5], me6 = me[6], me7 = me[7];
    var me8 = me[8], me9 = me[9], me10 = me[10], me11 = me[11];
    var me12 = me[12], me13 = me[13], me14 = me[14], me15 = me[15];
    planes[0].setComponents(me3 - me0, me7 - me4, me11 - me8, me15 - me12).normalize();
    planes[1].setComponents(me3 + me0, me7 + me4, me11 + me8, me15 + me12).normalize();
    planes[2].setComponents(me3 + me1, me7 + me5, me11 + me9, me15 + me13).normalize();
    planes[3].setComponents(me3 - me1, me7 - me5, me11 - me9, me15 - me13).normalize();
    planes[4].setComponents(me3 - me2, me7 - me6, me11 - me10, me15 - me14).normalize();
    planes[5].setComponents(me3 + me2, me7 + me6, me11 + me10, me15 + me14).normalize();
    return this;
  },
  intersectsObject: (function() {
    var sphere = new Sphere();
    return function intersectsObject(object) {
      var geometry = object.geometry;
      if (geometry.boundingSphere === null)
        geometry.computeBoundingSphere();
      sphere.copy(geometry.boundingSphere).applyMatrix4(object.matrixWorld);
      return this.intersectsSphere(sphere);
    };
  })(),
  intersectsSprite: (function() {
    var sphere = new Sphere();
    return function intersectsSprite(sprite) {
      sphere.center.set(0, 0, 0);
      sphere.radius = 0.7071067811865476;
      sphere.applyMatrix4(sprite.matrixWorld);
      return this.intersectsSphere(sphere);
    };
  })(),
  intersectsSphere: function(sphere) {
    var planes = this.planes;
    var center = sphere.center;
    var negRadius = -sphere.radius;
    for (var i = 0; i < 6; i++) {
      var distance = planes[i].distanceToPoint(center);
      if (distance < negRadius) {
        return false;
      }
    }
    return true;
  },
  intersectsBox: (function() {
    var p = new Vector3();
    return function intersectsBox(box) {
      var planes = this.planes;
      for (var i = 0; i < 6; i++) {
        var plane = planes[i];
        p.x = plane.normal.x > 0 ? box.max.x : box.min.x;
        p.y = plane.normal.y > 0 ? box.max.y : box.min.y;
        p.z = plane.normal.z > 0 ? box.max.z : box.min.z;
        if (plane.distanceToPoint(p) < 0) {
          return false;
        }
      }
      return true;
    };
  })(),
  containsPoint: function(point) {
    var planes = this.planes;
    for (var i = 0; i < 6; i++) {
      if (planes[i].distanceToPoint(point) < 0) {
        return false;
      }
    }
    return true;
  }
});

// src/math/Interpolant.js
function Interpolant(parameterPositions, sampleValues, sampleSize, resultBuffer) {
  this.parameterPositions = parameterPositions;
  this._cachedIndex = 0;
  this.resultBuffer = resultBuffer !== void 0 ? resultBuffer : new sampleValues.constructor(sampleSize);
  this.sampleValues = sampleValues;
  this.valueSize = sampleSize;
}
Object.assign(Interpolant.prototype, {
  evaluate: function(t) {
    var pp = this.parameterPositions, i1 = this._cachedIndex, t1 = pp[i1], t0 = pp[i1 - 1];
    validate_interval: {
      seek: {
        var right;
        linear_scan: {
          forward_scan: if (!(t < t1)) {
            for (var giveUpAt = i1 + 2; ; ) {
              if (t1 === void 0) {
                if (t < t0) break forward_scan;
                i1 = pp.length;
                this._cachedIndex = i1;
                return this.afterEnd_(i1 - 1, t, t0);
              }
              if (i1 === giveUpAt) break;
              t0 = t1;
              t1 = pp[++i1];
              if (t < t1) {
                break seek;
              }
            }
            right = pp.length;
            break linear_scan;
          }
          if (!(t >= t0)) {
            var t1global = pp[1];
            if (t < t1global) {
              i1 = 2;
              t0 = t1global;
            }
            for (var giveUpAt = i1 - 2; ; ) {
              if (t0 === void 0) {
                this._cachedIndex = 0;
                return this.beforeStart_(0, t, t1);
              }
              if (i1 === giveUpAt) break;
              t1 = t0;
              t0 = pp[--i1 - 1];
              if (t >= t0) {
                break seek;
              }
            }
            right = i1;
            i1 = 0;
            break linear_scan;
          }
          break validate_interval;
        }
        while (i1 < right) {
          var mid = i1 + right >>> 1;
          if (t < pp[mid]) {
            right = mid;
          } else {
            i1 = mid + 1;
          }
        }
        t1 = pp[i1];
        t0 = pp[i1 - 1];
        if (t0 === void 0) {
          this._cachedIndex = 0;
          return this.beforeStart_(0, t, t1);
        }
        if (t1 === void 0) {
          i1 = pp.length;
          this._cachedIndex = i1;
          return this.afterEnd_(i1 - 1, t0, t);
        }
      }
      this._cachedIndex = i1;
      this.intervalChanged_(i1, t0, t1);
    }
    return this.interpolate_(i1, t0, t, t1);
  },
  settings: null,
  // optional, subclass-specific settings structure
  // Note: The indirection allows central control of many interpolants.
  // --- Protected interface
  DefaultSettings_: {},
  getSettings_: function() {
    return this.settings || this.DefaultSettings_;
  },
  copySampleValue_: function(index) {
    var result = this.resultBuffer, values = this.sampleValues, stride = this.valueSize, offset = index * stride;
    for (var i = 0; i !== stride; ++i) {
      result[i] = values[offset + i];
    }
    return result;
  },
  // Template methods for derived classes:
  interpolate_: function() {
    throw new Error("call to abstract method");
  },
  intervalChanged_: function() {
  }
});
//!\ DECLARE ALIAS AFTER assign prototype !
Object.assign(Interpolant.prototype, {
  //( 0, t, t0 ), returns this.resultBuffer
  beforeStart_: Interpolant.prototype.copySampleValue_,
  //( N-1, tN-1, t ), returns this.resultBuffer
  afterEnd_: Interpolant.prototype.copySampleValue_
});

// src/math/Line3.js
function Line3(start, end) {
  this.start = start !== void 0 ? start : new Vector3();
  this.end = end !== void 0 ? end : new Vector3();
}
Object.assign(Line3.prototype, {
  set: function(start, end) {
    this.start.copy(start);
    this.end.copy(end);
    return this;
  },
  clone: function() {
    return new this.constructor().copy(this);
  },
  copy: function(line) {
    this.start.copy(line.start);
    this.end.copy(line.end);
    return this;
  },
  getCenter: function(target) {
    if (target === void 0) {
      console.warn("THREE.Line3: .getCenter() target is now required");
      target = new Vector3();
    }
    return target.addVectors(this.start, this.end).multiplyScalar(0.5);
  },
  delta: function(target) {
    if (target === void 0) {
      console.warn("THREE.Line3: .delta() target is now required");
      target = new Vector3();
    }
    return target.subVectors(this.end, this.start);
  },
  distanceSq: function() {
    return this.start.distanceToSquared(this.end);
  },
  distance: function() {
    return this.start.distanceTo(this.end);
  },
  at: function(t, target) {
    if (target === void 0) {
      console.warn("THREE.Line3: .at() target is now required");
      target = new Vector3();
    }
    return this.delta(target).multiplyScalar(t).add(this.start);
  },
  closestPointToPointParameter: (function() {
    var startP = new Vector3();
    var startEnd = new Vector3();
    return function closestPointToPointParameter(point, clampToLine) {
      startP.subVectors(point, this.start);
      startEnd.subVectors(this.end, this.start);
      var startEnd2 = startEnd.dot(startEnd);
      var startEnd_startP = startEnd.dot(startP);
      var t = startEnd_startP / startEnd2;
      if (clampToLine) {
        t = _Math.clamp(t, 0, 1);
      }
      return t;
    };
  })(),
  closestPointToPoint: function(point, clampToLine, target) {
    var t = this.closestPointToPointParameter(point, clampToLine);
    if (target === void 0) {
      console.warn("THREE.Line3: .closestPointToPoint() target is now required");
      target = new Vector3();
    }
    return this.delta(target).multiplyScalar(t).add(this.start);
  },
  applyMatrix4: function(matrix) {
    this.start.applyMatrix4(matrix);
    this.end.applyMatrix4(matrix);
    return this;
  },
  equals: function(line) {
    return line.start.equals(this.start) && line.end.equals(this.end);
  }
});

// src/math/Ray.js
function Ray(origin, direction) {
  this.origin = origin !== void 0 ? origin : new Vector3();
  this.direction = direction !== void 0 ? direction : new Vector3();
}
Object.assign(Ray.prototype, {
  set: function(origin, direction) {
    this.origin.copy(origin);
    this.direction.copy(direction);
    return this;
  },
  clone: function() {
    return new this.constructor().copy(this);
  },
  copy: function(ray) {
    this.origin.copy(ray.origin);
    this.direction.copy(ray.direction);
    return this;
  },
  at: function(t, target) {
    if (target === void 0) {
      console.warn("THREE.Ray: .at() target is now required");
      target = new Vector3();
    }
    return target.copy(this.direction).multiplyScalar(t).add(this.origin);
  },
  lookAt: function(v) {
    this.direction.copy(v).sub(this.origin).normalize();
    return this;
  },
  recast: (function() {
    var v1 = new Vector3();
    return function recast(t) {
      this.origin.copy(this.at(t, v1));
      return this;
    };
  })(),
  closestPointToPoint: function(point, target) {
    if (target === void 0) {
      console.warn("THREE.Ray: .closestPointToPoint() target is now required");
      target = new Vector3();
    }
    target.subVectors(point, this.origin);
    var directionDistance = target.dot(this.direction);
    if (directionDistance < 0) {
      return target.copy(this.origin);
    }
    return target.copy(this.direction).multiplyScalar(directionDistance).add(this.origin);
  },
  distanceToPoint: function(point) {
    return Math.sqrt(this.distanceSqToPoint(point));
  },
  distanceSqToPoint: (function() {
    var v1 = new Vector3();
    return function distanceSqToPoint(point) {
      var directionDistance = v1.subVectors(point, this.origin).dot(this.direction);
      if (directionDistance < 0) {
        return this.origin.distanceToSquared(point);
      }
      v1.copy(this.direction).multiplyScalar(directionDistance).add(this.origin);
      return v1.distanceToSquared(point);
    };
  })(),
  distanceSqToSegment: (function() {
    var segCenter = new Vector3();
    var segDir = new Vector3();
    var diff = new Vector3();
    return function distanceSqToSegment(v0, v1, optionalPointOnRay, optionalPointOnSegment) {
      segCenter.copy(v0).add(v1).multiplyScalar(0.5);
      segDir.copy(v1).sub(v0).normalize();
      diff.copy(this.origin).sub(segCenter);
      var segExtent = v0.distanceTo(v1) * 0.5;
      var a01 = -this.direction.dot(segDir);
      var b0 = diff.dot(this.direction);
      var b1 = -diff.dot(segDir);
      var c = diff.lengthSq();
      var det = Math.abs(1 - a01 * a01);
      var s0, s1, sqrDist, extDet;
      if (det > 0) {
        s0 = a01 * b1 - b0;
        s1 = a01 * b0 - b1;
        extDet = segExtent * det;
        if (s0 >= 0) {
          if (s1 >= -extDet) {
            if (s1 <= extDet) {
              var invDet = 1 / det;
              s0 *= invDet;
              s1 *= invDet;
              sqrDist = s0 * (s0 + a01 * s1 + 2 * b0) + s1 * (a01 * s0 + s1 + 2 * b1) + c;
            } else {
              s1 = segExtent;
              s0 = Math.max(0, -(a01 * s1 + b0));
              sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c;
            }
          } else {
            s1 = -segExtent;
            s0 = Math.max(0, -(a01 * s1 + b0));
            sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c;
          }
        } else {
          if (s1 <= -extDet) {
            s0 = Math.max(0, -(-a01 * segExtent + b0));
            s1 = s0 > 0 ? -segExtent : Math.min(Math.max(-segExtent, -b1), segExtent);
            sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c;
          } else if (s1 <= extDet) {
            s0 = 0;
            s1 = Math.min(Math.max(-segExtent, -b1), segExtent);
            sqrDist = s1 * (s1 + 2 * b1) + c;
          } else {
            s0 = Math.max(0, -(a01 * segExtent + b0));
            s1 = s0 > 0 ? segExtent : Math.min(Math.max(-segExtent, -b1), segExtent);
            sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c;
          }
        }
      } else {
        s1 = a01 > 0 ? -segExtent : segExtent;
        s0 = Math.max(0, -(a01 * s1 + b0));
        sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c;
      }
      if (optionalPointOnRay) {
        optionalPointOnRay.copy(this.direction).multiplyScalar(s0).add(this.origin);
      }
      if (optionalPointOnSegment) {
        optionalPointOnSegment.copy(segDir).multiplyScalar(s1).add(segCenter);
      }
      return sqrDist;
    };
  })(),
  intersectSphere: (function() {
    var v1 = new Vector3();
    return function intersectSphere(sphere, target) {
      v1.subVectors(sphere.center, this.origin);
      var tca = v1.dot(this.direction);
      var d2 = v1.dot(v1) - tca * tca;
      var radius2 = sphere.radius * sphere.radius;
      if (d2 > radius2) return null;
      var thc = Math.sqrt(radius2 - d2);
      var t0 = tca - thc;
      var t1 = tca + thc;
      if (t0 < 0 && t1 < 0) return null;
      if (t0 < 0) return this.at(t1, target);
      return this.at(t0, target);
    };
  })(),
  intersectsSphere: function(sphere) {
    return this.distanceToPoint(sphere.center) <= sphere.radius;
  },
  distanceToPlane: function(plane) {
    var denominator = plane.normal.dot(this.direction);
    if (denominator === 0) {
      if (plane.distanceToPoint(this.origin) === 0) {
        return 0;
      }
      return null;
    }
    var t = -(this.origin.dot(plane.normal) + plane.constant) / denominator;
    return t >= 0 ? t : null;
  },
  intersectPlane: function(plane, target) {
    var t = this.distanceToPlane(plane);
    if (t === null) {
      return null;
    }
    return this.at(t, target);
  },
  intersectsPlane: function(plane) {
    var distToPoint = plane.distanceToPoint(this.origin);
    if (distToPoint === 0) {
      return true;
    }
    var denominator = plane.normal.dot(this.direction);
    if (denominator * distToPoint < 0) {
      return true;
    }
    return false;
  },
  intersectBox: function(box, target) {
    var tmin, tmax, tymin, tymax, tzmin, tzmax;
    var invdirx = 1 / this.direction.x, invdiry = 1 / this.direction.y, invdirz = 1 / this.direction.z;
    var origin = this.origin;
    if (invdirx >= 0) {
      tmin = (box.min.x - origin.x) * invdirx;
      tmax = (box.max.x - origin.x) * invdirx;
    } else {
      tmin = (box.max.x - origin.x) * invdirx;
      tmax = (box.min.x - origin.x) * invdirx;
    }
    if (invdiry >= 0) {
      tymin = (box.min.y - origin.y) * invdiry;
      tymax = (box.max.y - origin.y) * invdiry;
    } else {
      tymin = (box.max.y - origin.y) * invdiry;
      tymax = (box.min.y - origin.y) * invdiry;
    }
    if (tmin > tymax || tymin > tmax) return null;
    if (tymin > tmin || tmin !== tmin) tmin = tymin;
    if (tymax < tmax || tmax !== tmax) tmax = tymax;
    if (invdirz >= 0) {
      tzmin = (box.min.z - origin.z) * invdirz;
      tzmax = (box.max.z - origin.z) * invdirz;
    } else {
      tzmin = (box.max.z - origin.z) * invdirz;
      tzmax = (box.min.z - origin.z) * invdirz;
    }
    if (tmin > tzmax || tzmin > tmax) return null;
    if (tzmin > tmin || tmin !== tmin) tmin = tzmin;
    if (tzmax < tmax || tmax !== tmax) tmax = tzmax;
    if (tmax < 0) return null;
    return this.at(tmin >= 0 ? tmin : tmax, target);
  },
  intersectsBox: (function() {
    var v = new Vector3();
    return function intersectsBox(box) {
      return this.intersectBox(box, v) !== null;
    };
  })(),
  intersectTriangle: (function() {
    var diff = new Vector3();
    var edge1 = new Vector3();
    var edge2 = new Vector3();
    var normal = new Vector3();
    return function intersectTriangle(a, b, c, backfaceCulling, target) {
      edge1.subVectors(b, a);
      edge2.subVectors(c, a);
      normal.crossVectors(edge1, edge2);
      var DdN = this.direction.dot(normal);
      var sign;
      if (DdN > 0) {
        if (backfaceCulling) return null;
        sign = 1;
      } else if (DdN < 0) {
        sign = -1;
        DdN = -DdN;
      } else {
        return null;
      }
      diff.subVectors(this.origin, a);
      var DdQxE2 = sign * this.direction.dot(edge2.crossVectors(diff, edge2));
      if (DdQxE2 < 0) {
        return null;
      }
      var DdE1xQ = sign * this.direction.dot(edge1.cross(diff));
      if (DdE1xQ < 0) {
        return null;
      }
      if (DdQxE2 + DdE1xQ > DdN) {
        return null;
      }
      var QdN = -sign * diff.dot(normal);
      if (QdN < 0) {
        return null;
      }
      return this.at(QdN / DdN, target);
    };
  })(),
  applyMatrix4: function(matrix4) {
    this.origin.applyMatrix4(matrix4);
    this.direction.transformDirection(matrix4);
    return this;
  },
  equals: function(ray) {
    return ray.origin.equals(this.origin) && ray.direction.equals(this.direction);
  }
});

// src/math/Spherical.js
function Spherical(radius, phi, theta) {
  this.radius = radius !== void 0 ? radius : 1;
  this.phi = phi !== void 0 ? phi : 0;
  this.theta = theta !== void 0 ? theta : 0;
  return this;
}
Object.assign(Spherical.prototype, {
  set: function(radius, phi, theta) {
    this.radius = radius;
    this.phi = phi;
    this.theta = theta;
    return this;
  },
  clone: function() {
    return new this.constructor().copy(this);
  },
  copy: function(other) {
    this.radius = other.radius;
    this.phi = other.phi;
    this.theta = other.theta;
    return this;
  },
  // restrict phi to be betwee EPS and PI-EPS
  makeSafe: function() {
    var EPS2 = 1e-6;
    this.phi = Math.max(EPS2, Math.min(Math.PI - EPS2, this.phi));
    return this;
  },
  setFromVector3: function(vec3) {
    this.radius = vec3.length();
    if (this.radius === 0) {
      this.theta = 0;
      this.phi = 0;
    } else {
      this.theta = Math.atan2(vec3.x, vec3.z);
      this.phi = Math.acos(_Math.clamp(vec3.y / this.radius, -1, 1));
    }
    return this;
  }
});

// src/math/Triangle.js
function Triangle(a, b, c) {
  this.a = a !== void 0 ? a : new Vector3();
  this.b = b !== void 0 ? b : new Vector3();
  this.c = c !== void 0 ? c : new Vector3();
}
Object.assign(Triangle, {
  getNormal: (function() {
    var v0 = new Vector3();
    return function getNormal(a, b, c, target) {
      if (target === void 0) {
        console.warn("THREE.Triangle: .getNormal() target is now required");
        target = new Vector3();
      }
      target.subVectors(c, b);
      v0.subVectors(a, b);
      target.cross(v0);
      var targetLengthSq = target.lengthSq();
      if (targetLengthSq > 0) {
        return target.multiplyScalar(1 / Math.sqrt(targetLengthSq));
      }
      return target.set(0, 0, 0);
    };
  })(),
  // static/instance method to calculate barycentric coordinates
  // based on: http://www.blackpawn.com/texts/pointinpoly/default.html
  getBarycoord: (function() {
    var v0 = new Vector3();
    var v1 = new Vector3();
    var v2 = new Vector3();
    return function getBarycoord(point, a, b, c, target) {
      v0.subVectors(c, a);
      v1.subVectors(b, a);
      v2.subVectors(point, a);
      var dot00 = v0.dot(v0);
      var dot01 = v0.dot(v1);
      var dot02 = v0.dot(v2);
      var dot11 = v1.dot(v1);
      var dot12 = v1.dot(v2);
      var denom = dot00 * dot11 - dot01 * dot01;
      if (target === void 0) {
        console.warn("THREE.Triangle: .getBarycoord() target is now required");
        target = new Vector3();
      }
      if (denom === 0) {
        return target.set(-2, -1, -1);
      }
      var invDenom = 1 / denom;
      var u = (dot11 * dot02 - dot01 * dot12) * invDenom;
      var v = (dot00 * dot12 - dot01 * dot02) * invDenom;
      return target.set(1 - u - v, v, u);
    };
  })(),
  containsPoint: (function() {
    var v1 = new Vector3();
    return function containsPoint(point, a, b, c) {
      Triangle.getBarycoord(point, a, b, c, v1);
      return v1.x >= 0 && v1.y >= 0 && v1.x + v1.y <= 1;
    };
  })()
});
Object.assign(Triangle.prototype, {
  set: function(a, b, c) {
    this.a.copy(a);
    this.b.copy(b);
    this.c.copy(c);
    return this;
  },
  setFromPointsAndIndices: function(points, i0, i1, i2) {
    this.a.copy(points[i0]);
    this.b.copy(points[i1]);
    this.c.copy(points[i2]);
    return this;
  },
  clone: function() {
    return new this.constructor().copy(this);
  },
  copy: function(triangle) {
    this.a.copy(triangle.a);
    this.b.copy(triangle.b);
    this.c.copy(triangle.c);
    return this;
  },
  getArea: (function() {
    var v0 = new Vector3();
    var v1 = new Vector3();
    return function getArea() {
      v0.subVectors(this.c, this.b);
      v1.subVectors(this.a, this.b);
      return v0.cross(v1).length() * 0.5;
    };
  })(),
  getMidpoint: function(target) {
    if (target === void 0) {
      console.warn("THREE.Triangle: .getMidpoint() target is now required");
      target = new Vector3();
    }
    return target.addVectors(this.a, this.b).add(this.c).multiplyScalar(1 / 3);
  },
  getNormal: function(target) {
    return Triangle.getNormal(this.a, this.b, this.c, target);
  },
  getPlane: function(target) {
    if (target === void 0) {
      console.warn("THREE.Triangle: .getPlane() target is now required");
      target = new Vector3();
    }
    return target.setFromCoplanarPoints(this.a, this.b, this.c);
  },
  getBarycoord: function(point, target) {
    return Triangle.getBarycoord(point, this.a, this.b, this.c, target);
  },
  containsPoint: function(point) {
    return Triangle.containsPoint(point, this.a, this.b, this.c);
  },
  intersectsBox: function(box) {
    return box.intersectsTriangle(this);
  },
  closestPointToPoint: (function() {
    var vab = new Vector3();
    var vac = new Vector3();
    var vbc = new Vector3();
    var vap = new Vector3();
    var vbp = new Vector3();
    var vcp = new Vector3();
    return function closestPointToPoint(p, target) {
      if (target === void 0) {
        console.warn("THREE.Triangle: .closestPointToPoint() target is now required");
        target = new Vector3();
      }
      var a = this.a, b = this.b, c = this.c;
      var v, w;
      vab.subVectors(b, a);
      vac.subVectors(c, a);
      vap.subVectors(p, a);
      var d1 = vab.dot(vap);
      var d2 = vac.dot(vap);
      if (d1 <= 0 && d2 <= 0) {
        return target.copy(a);
      }
      vbp.subVectors(p, b);
      var d3 = vab.dot(vbp);
      var d4 = vac.dot(vbp);
      if (d3 >= 0 && d4 <= d3) {
        return target.copy(b);
      }
      var vc = d1 * d4 - d3 * d2;
      if (vc <= 0 && d1 >= 0 && d3 <= 0) {
        v = d1 / (d1 - d3);
        return target.copy(a).addScaledVector(vab, v);
      }
      vcp.subVectors(p, c);
      var d5 = vab.dot(vcp);
      var d6 = vac.dot(vcp);
      if (d6 >= 0 && d5 <= d6) {
        return target.copy(c);
      }
      var vb = d5 * d2 - d1 * d6;
      if (vb <= 0 && d2 >= 0 && d6 <= 0) {
        w = d2 / (d2 - d6);
        return target.copy(a).addScaledVector(vac, w);
      }
      var va = d3 * d6 - d5 * d4;
      if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) {
        vbc.subVectors(c, b);
        w = (d4 - d3) / (d4 - d3 + (d5 - d6));
        return target.copy(b).addScaledVector(vbc, w);
      }
      var denom = 1 / (va + vb + vc);
      v = vb * denom;
      w = vc * denom;
      return target.copy(a).addScaledVector(vab, v).addScaledVector(vac, w);
    };
  })(),
  equals: function(triangle) {
    return triangle.a.equals(this.a) && triangle.b.equals(this.b) && triangle.c.equals(this.c);
  }
});

// src/math/Vector4.js
function Vector4(x, y, z, w) {
  this.x = x || 0;
  this.y = y || 0;
  this.z = z || 0;
  this.w = w !== void 0 ? w : 1;
}
Object.assign(Vector4.prototype, {
  isVector4: true,
  set: function(x, y, z, w) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
    return this;
  },
  setScalar: function(scalar) {
    this.x = scalar;
    this.y = scalar;
    this.z = scalar;
    this.w = scalar;
    return this;
  },
  setX: function(x) {
    this.x = x;
    return this;
  },
  setY: function(y) {
    this.y = y;
    return this;
  },
  setZ: function(z) {
    this.z = z;
    return this;
  },
  setW: function(w) {
    this.w = w;
    return this;
  },
  setComponent: function(index, value) {
    switch (index) {
      case 0:
        this.x = value;
        break;
      case 1:
        this.y = value;
        break;
      case 2:
        this.z = value;
        break;
      case 3:
        this.w = value;
        break;
      default:
        throw new Error("index is out of range: " + index);
    }
    return this;
  },
  getComponent: function(index) {
    switch (index) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      case 2:
        return this.z;
      case 3:
        return this.w;
      default:
        throw new Error("index is out of range: " + index);
    }
  },
  clone: function() {
    return new this.constructor(this.x, this.y, this.z, this.w);
  },
  copy: function(v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    this.w = v.w !== void 0 ? v.w : 1;
    return this;
  },
  add: function(v, w) {
    if (w !== void 0) {
      console.warn("THREE.Vector4: .add() now only accepts one argument. Use .addVectors( a, b ) instead.");
      return this.addVectors(v, w);
    }
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    this.w += v.w;
    return this;
  },
  addScalar: function(s) {
    this.x += s;
    this.y += s;
    this.z += s;
    this.w += s;
    return this;
  },
  addVectors: function(a, b) {
    this.x = a.x + b.x;
    this.y = a.y + b.y;
    this.z = a.z + b.z;
    this.w = a.w + b.w;
    return this;
  },
  addScaledVector: function(v, s) {
    this.x += v.x * s;
    this.y += v.y * s;
    this.z += v.z * s;
    this.w += v.w * s;
    return this;
  },
  sub: function(v, w) {
    if (w !== void 0) {
      console.warn("THREE.Vector4: .sub() now only accepts one argument. Use .subVectors( a, b ) instead.");
      return this.subVectors(v, w);
    }
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    this.w -= v.w;
    return this;
  },
  subScalar: function(s) {
    this.x -= s;
    this.y -= s;
    this.z -= s;
    this.w -= s;
    return this;
  },
  subVectors: function(a, b) {
    this.x = a.x - b.x;
    this.y = a.y - b.y;
    this.z = a.z - b.z;
    this.w = a.w - b.w;
    return this;
  },
  multiplyScalar: function(scalar) {
    this.x *= scalar;
    this.y *= scalar;
    this.z *= scalar;
    this.w *= scalar;
    return this;
  },
  applyMatrix4: function(m) {
    var x = this.x, y = this.y, z = this.z, w = this.w;
    var e = m.elements;
    this.x = e[0] * x + e[4] * y + e[8] * z + e[12] * w;
    this.y = e[1] * x + e[5] * y + e[9] * z + e[13] * w;
    this.z = e[2] * x + e[6] * y + e[10] * z + e[14] * w;
    this.w = e[3] * x + e[7] * y + e[11] * z + e[15] * w;
    return this;
  },
  divideScalar: function(scalar) {
    return this.multiplyScalar(1 / scalar);
  },
  setAxisAngleFromQuaternion: function(q) {
    this.w = 2 * Math.acos(q.w);
    var s = Math.sqrt(1 - q.w * q.w);
    if (s < 1e-4) {
      this.x = 1;
      this.y = 0;
      this.z = 0;
    } else {
      this.x = q.x / s;
      this.y = q.y / s;
      this.z = q.z / s;
    }
    return this;
  },
  setAxisAngleFromRotationMatrix: function(m) {
    var angle, x, y, z, epsilon = 0.01, epsilon2 = 0.1, te = m.elements, m11 = te[0], m12 = te[4], m13 = te[8], m21 = te[1], m22 = te[5], m23 = te[9], m31 = te[2], m32 = te[6], m33 = te[10];
    if (Math.abs(m12 - m21) < epsilon && Math.abs(m13 - m31) < epsilon && Math.abs(m23 - m32) < epsilon) {
      if (Math.abs(m12 + m21) < epsilon2 && Math.abs(m13 + m31) < epsilon2 && Math.abs(m23 + m32) < epsilon2 && Math.abs(m11 + m22 + m33 - 3) < epsilon2) {
        this.set(1, 0, 0, 0);
        return this;
      }
      angle = Math.PI;
      var xx = (m11 + 1) / 2;
      var yy = (m22 + 1) / 2;
      var zz = (m33 + 1) / 2;
      var xy = (m12 + m21) / 4;
      var xz = (m13 + m31) / 4;
      var yz = (m23 + m32) / 4;
      if (xx > yy && xx > zz) {
        if (xx < epsilon) {
          x = 0;
          y = 0.707106781;
          z = 0.707106781;
        } else {
          x = Math.sqrt(xx);
          y = xy / x;
          z = xz / x;
        }
      } else if (yy > zz) {
        if (yy < epsilon) {
          x = 0.707106781;
          y = 0;
          z = 0.707106781;
        } else {
          y = Math.sqrt(yy);
          x = xy / y;
          z = yz / y;
        }
      } else {
        if (zz < epsilon) {
          x = 0.707106781;
          y = 0.707106781;
          z = 0;
        } else {
          z = Math.sqrt(zz);
          x = xz / z;
          y = yz / z;
        }
      }
      this.set(x, y, z, angle);
      return this;
    }
    var s = Math.sqrt((m32 - m23) * (m32 - m23) + (m13 - m31) * (m13 - m31) + (m21 - m12) * (m21 - m12));
    if (Math.abs(s) < 1e-3) s = 1;
    this.x = (m32 - m23) / s;
    this.y = (m13 - m31) / s;
    this.z = (m21 - m12) / s;
    this.w = Math.acos((m11 + m22 + m33 - 1) / 2);
    return this;
  },
  min: function(v) {
    this.x = Math.min(this.x, v.x);
    this.y = Math.min(this.y, v.y);
    this.z = Math.min(this.z, v.z);
    this.w = Math.min(this.w, v.w);
    return this;
  },
  max: function(v) {
    this.x = Math.max(this.x, v.x);
    this.y = Math.max(this.y, v.y);
    this.z = Math.max(this.z, v.z);
    this.w = Math.max(this.w, v.w);
    return this;
  },
  clamp: function(min, max) {
    this.x = Math.max(min.x, Math.min(max.x, this.x));
    this.y = Math.max(min.y, Math.min(max.y, this.y));
    this.z = Math.max(min.z, Math.min(max.z, this.z));
    this.w = Math.max(min.w, Math.min(max.w, this.w));
    return this;
  },
  clampScalar: /* @__PURE__ */ (function() {
    var min, max;
    return function clampScalar(minVal, maxVal) {
      if (min === void 0) {
        min = new Vector4();
        max = new Vector4();
      }
      min.set(minVal, minVal, minVal, minVal);
      max.set(maxVal, maxVal, maxVal, maxVal);
      return this.clamp(min, max);
    };
  })(),
  clampLength: function(min, max) {
    var length = this.length();
    return this.divideScalar(length || 1).multiplyScalar(Math.max(min, Math.min(max, length)));
  },
  floor: function() {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    this.z = Math.floor(this.z);
    this.w = Math.floor(this.w);
    return this;
  },
  ceil: function() {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);
    this.z = Math.ceil(this.z);
    this.w = Math.ceil(this.w);
    return this;
  },
  round: function() {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    this.z = Math.round(this.z);
    this.w = Math.round(this.w);
    return this;
  },
  roundToZero: function() {
    this.x = this.x < 0 ? Math.ceil(this.x) : Math.floor(this.x);
    this.y = this.y < 0 ? Math.ceil(this.y) : Math.floor(this.y);
    this.z = this.z < 0 ? Math.ceil(this.z) : Math.floor(this.z);
    this.w = this.w < 0 ? Math.ceil(this.w) : Math.floor(this.w);
    return this;
  },
  negate: function() {
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;
    this.w = -this.w;
    return this;
  },
  dot: function(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
  },
  lengthSq: function() {
    return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
  },
  length: function() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
  },
  manhattanLength: function() {
    return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z) + Math.abs(this.w);
  },
  normalize: function() {
    return this.divideScalar(this.length() || 1);
  },
  setLength: function(length) {
    return this.normalize().multiplyScalar(length);
  },
  lerp: function(v, alpha) {
    this.x += (v.x - this.x) * alpha;
    this.y += (v.y - this.y) * alpha;
    this.z += (v.z - this.z) * alpha;
    this.w += (v.w - this.w) * alpha;
    return this;
  },
  lerpVectors: function(v1, v2, alpha) {
    return this.subVectors(v2, v1).multiplyScalar(alpha).add(v1);
  },
  equals: function(v) {
    return v.x === this.x && v.y === this.y && v.z === this.z && v.w === this.w;
  },
  fromArray: function(array, offset) {
    if (offset === void 0) offset = 0;
    this.x = array[offset];
    this.y = array[offset + 1];
    this.z = array[offset + 2];
    this.w = array[offset + 3];
    return this;
  },
  toArray: function(array, offset) {
    if (array === void 0) array = [];
    if (offset === void 0) offset = 0;
    array[offset] = this.x;
    array[offset + 1] = this.y;
    array[offset + 2] = this.z;
    array[offset + 3] = this.w;
    return array;
  },
  fromBufferAttribute: function(attribute, index, offset) {
    if (offset !== void 0) {
      console.warn("THREE.Vector4: offset has been removed from .fromBufferAttribute().");
    }
    this.x = attribute.getX(index);
    this.y = attribute.getY(index);
    this.z = attribute.getZ(index);
    this.w = attribute.getW(index);
    return this;
  }
});

// scripts/contact-detector/globals.js
var Debug = false;
var Log = console;
var ParserRegistry = { add() {
} };
var DecompressorRegistry = { get() {
} };
var ColormakerRegistry = {
  getScheme() {
    throw new Error("Contact detection does not provide atom rendering");
  }
};

// src/utils.ts
function defaults(value, defaultValue) {
  return value !== void 0 ? value : defaultValue;
}
function createParams(params, defaultParams) {
  const o = Object.assign({}, params);
  for (const k in defaultParams) {
    const value = params[k];
    if (value === void 0) o[k] = defaultParams[k];
  }
  return o;
}
function lexicographicCompare(elm12, elm22) {
  if (elm12 < elm22) return -1;
  if (elm12 > elm22) return 1;
  return 0;
}
function binarySearchIndexOf(array, element, compareFunction = lexicographicCompare) {
  let low = 0;
  let high = array.length - 1;
  while (low <= high) {
    const mid = low + high >> 1;
    const cmp = compareFunction(element, array[mid]);
    if (cmp > 0) {
      low = mid + 1;
    } else if (cmp < 0) {
      high = mid - 1;
    } else {
      return mid;
    }
  }
  return -low - 1;
}
function binarySearchForLeftRange(array, leftRange) {
  let high = array.length - 1;
  if (array[high] < leftRange) return -1;
  let low = 0;
  while (low <= high) {
    const mid = low + high >> 1;
    if (array[mid] >= leftRange) {
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }
  return high + 1;
}
function binarySearchForRightRange(array, rightRange) {
  if (array[0] > rightRange) return -1;
  let low = 0;
  let high = array.length - 1;
  while (low <= high) {
    const mid = low + high >> 1;
    if (array[mid] > rightRange) {
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }
  return low - 1;
}
function rangeInSortedArray(array, min, max) {
  const indexLeft = binarySearchForLeftRange(array, min);
  const indexRight = binarySearchForRightRange(array, max);
  if (indexLeft === -1 || indexRight === -1 || indexLeft > indexRight) {
    return 0;
  } else {
    return indexRight - indexLeft + 1;
  }
}
function uniqueArray(array) {
  return array.sort().filter(function(value, index, sorted) {
    return index === 0 || value !== sorted[index - 1];
  });
}
function uint8ToString(u8a) {
  const chunkSize = 28672;
  if (u8a.length > chunkSize) {
    const c = [];
    for (let i = 0; i < u8a.length; i += chunkSize) {
      c.push(String.fromCharCode.apply(
        null,
        u8a.subarray(i, i + chunkSize)
      ));
    }
    return c.join("");
  } else {
    return String.fromCharCode.apply(null, u8a);
  }
}
function getTypedArray(arrayType, arraySize) {
  switch (arrayType) {
    case "int8":
      return new Int8Array(arraySize);
    case "int16":
      return new Int16Array(arraySize);
    case "int32":
      return new Int32Array(arraySize);
    case "uint8":
      return new Uint8Array(arraySize);
    case "uint16":
      return new Uint16Array(arraySize);
    case "uint32":
      return new Uint32Array(arraySize);
    case "float32":
      return new Float32Array(arraySize);
    default:
      throw new Error("arrayType unknown: " + arrayType);
  }
}

// src/parser/parser.ts
var Parser = class {
  constructor(streamer, params) {
    var p = params || {};
    this.streamer = streamer;
    this.name = defaults(p.name, "");
    this.path = defaults(p.path, "");
  }
  get type() {
    return "";
  }
  get __objName() {
    return "";
  }
  get isBinary() {
    return false;
  }
  get isJson() {
    return false;
  }
  get isXml() {
    return false;
  }
  parse() {
    return this.streamer.read().then(() => {
      this._beforeParse();
      this._parse();
      this._afterParse();
      return this[this.__objName];
    });
  }
  _parse() {
  }
  _beforeParse() {
  }
  _afterParse() {
    if (Debug) Log.log(this[this.__objName]);
  }
};
var parser_default = Parser;

// src/structure/structure.ts
var import_signals2 = __toESM(require_signals());

// scripts/contact-detector/picker.js
var ContactPicker = class {
  constructor(array, contacts) {
    this.array = array;
    this.contacts = contacts;
  }
};
var AtomPicker = class {
  constructor() {
    throw new Error("Contact detection does not provide atom picking");
  }
};
var BondPicker = class extends AtomPicker {
};
var UnitcellPicker = class extends AtomPicker {
};

// src/math/math-constants.ts
var TwoPI = 2 * Math.PI;
var DEG2RAD = Math.PI / 180;
var RAD2DEG = 180 / Math.PI;

// src/math/array-utils.ts
function uniformArray(n, a, optionalTarget) {
  const array = optionalTarget || new Float32Array(n);
  for (let i = 0; i < n; ++i) {
    array[i] = a;
  }
  return array;
}
function uniformArray3(n, a, b, c, optionalTarget) {
  const array = optionalTarget || new Float32Array(n * 3);
  for (let i = 0; i < n; ++i) {
    const j = i * 3;
    array[j + 0] = a;
    array[j + 1] = b;
    array[j + 2] = c;
  }
  return array;
}
function centerArray3(array, center = new Vector3()) {
  const n = array.length;
  for (let i = 0; i < n; i += 3) {
    center.x += array[i];
    center.y += array[i + 1];
    center.z += array[i + 2];
  }
  center.divideScalar(n / 3);
  return center;
}
function copyArray(src, dst, srcOffset, dstOffset, length) {
  for (let i = 0; i < length; ++i) {
    dst[dstOffset + i] = src[srcOffset + i];
  }
}
function copyWithin(array, srcOffset, dstOffset, length) {
  copyArray(array, array, srcOffset, dstOffset, length);
}
var swap = new Float32Array(4);
var temp = new Float32Array(4);
/**
 * quicksortIP
 * @function
 * @author Roman Bolzern <roman.bolzern@fhnw.ch>, 2013
 * @author I4DS http://www.fhnw.ch/i4ds, 2013
 * @license MIT License <http://www.opensource.org/licenses/mit-license.php>
 * @description
 * In-place quicksort for typed arrays (e.g. for Float32Array)
 * provides fast sorting
 * useful e.g. for a custom shader and/or BufferGeometry
 * Complexity: http://bigocheatsheet.com/ see Quicksort
 *
 * @example
 * points: [x, y, z, x, y, z, x, y, z, ...]
 * eleSize: 3 //because of (x, y, z)
 * orderElement: 0 //order according to x
 *
 * @param {TypedArray} arr - array to be sorted
 * @param {Integer} eleSize - element size
 * @param {Integer} orderElement - index of element used for sorting, < eleSize
 * @param {Integer} [begin] - start index for range to be sorted
 * @param {Integer} [end] - end index for range to be sorted
 * @return {TypedArray} the input array
 */
function arrayMax(array) {
  let max = -Infinity;
  for (let i = 0, il = array.length; i < il; ++i) {
    if (array[i] > max) max = array[i];
  }
  return max;
}
function arrayMin(array) {
  let min = Infinity;
  for (let i = 0, il = array.length; i < il; ++i) {
    if (array[i] < min) min = array[i];
  }
  return min;
}

// src/utils/bitarray.ts
function hammingWeight(v) {
  v -= v >>> 1 & 1431655765;
  v = (v & 858993459) + (v >>> 2 & 858993459);
  return (v + (v >>> 4) & 252645135) * 16843009 >>> 24;
}
var BitArray = class _BitArray {
  /**
   * @param  {Integer} length - array length
   * @param  {Boolean} [setAll] - initialize with true
   */
  constructor(length, setAll) {
    this.length = length;
    this._words = new Uint32Array(length + 32 >>> 5);
    if (setAll === true) {
      this.setAll();
    }
  }
  /**
   * Get value at index
   * @param  {Integer} index - the index
   * @return {Boolean} value
   */
  get(index) {
    return (this._words[index >>> 5] & 1 << index) !== 0;
  }
  /**
   * Set value at index to true
   * @param  {Integer} index - the index
   * @return {undefined}
   */
  set(index) {
    this._words[index >>> 5] |= 1 << index;
  }
  /**
   * Set value at index to false
   * @param  {Integer} index - the index
   * @return {undefined}
   */
  clear(index) {
    this._words[index >>> 5] &= ~(1 << index);
  }
  /**
   * Flip value at index
   * @param  {Integer} index - the index
   * @return {undefined}
   */
  flip(index) {
    this._words[index >>> 5] ^= 1 << index;
  }
  _assignRange(start, end, value) {
    if (end < start) return;
    const words = this._words;
    const wordValue = value === true ? 4294967295 : 0;
    const wordStart = start >>> 5;
    const wordEnd = end >>> 5;
    for (let k = wordStart; k < wordEnd; ++k) {
      words[k] = wordValue;
    }
    const startWord = wordStart << 5;
    const endWord = wordEnd << 5;
    if (value === true) {
      if (end - start < 32) {
        for (let i = start, n = end + 1; i < n; ++i) {
          words[i >>> 5] |= 1 << i;
        }
      } else {
        for (let i = start, n = startWord; i < n; ++i) {
          words[i >>> 5] |= 1 << i;
        }
        for (let i = endWord, n = end + 1; i < n; ++i) {
          words[i >>> 5] |= 1 << i;
        }
      }
    } else {
      if (end - start < 32) {
        for (let i = start, n = end + 1; i < n; ++i) {
          words[i >>> 5] &= ~(1 << i);
        }
      } else {
        for (let i = start, n = startWord; i < n; ++i) {
          words[i >>> 5] &= ~(1 << i);
        }
        for (let i = endWord, n = end + 1; i < n; ++i) {
          words[i >>> 5] &= ~(1 << i);
        }
      }
    }
    return this;
  }
  /**
   * Set bits of the given range
   * @param {Integer} start - start index
   * @param {Integer} end - end index
   * @return {BitArray} this object
   */
  setRange(start, end) {
    return this._assignRange(start, end, true);
  }
  /**
   * Clear bits of the given range
   * @param {Integer} start - start index
   * @param {Integer} end - end index
   * @return {BitArray} this object
   */
  clearRange(start, end) {
    return this._assignRange(start, end, false);
  }
  /**
   * Set bits at all given indices
   * @param {...Integer} arguments - indices
   * @return {Boolean} this object
   */
  setBits(...indices) {
    const words = this._words;
    const n = indices.length;
    for (let i = 0; i < n; ++i) {
      const index = indices[i];
      words[index >>> 5] |= 1 << index;
    }
    return this;
  }
  /**
   * Clear bits at all given indices
   * @param {...Integer} arguments - indices
   * @return {Boolean} this object
   */
  clearBits(...indices) {
    const words = this._words;
    const n = indices.length;
    for (let i = 0; i < n; ++i) {
      const index = indices[i];
      words[index >>> 5] &= ~(1 << index);
    }
    return this;
  }
  /**
   * Set all bits of the array
   * @return {BitArray} this object
   */
  setAll() {
    return this._assignRange(0, this.length - 1, true);
  }
  /**
   * Clear all bits of the array
   * @return {BitArray} this object
   */
  clearAll() {
    return this._assignRange(0, this.length - 1, false);
  }
  /**
   * Flip all the values in the array
   * @return {BitArray} this object
   */
  flipAll() {
    const count = this._words.length;
    const words = this._words;
    const bs = 32 - this.length % 32;
    for (let k = 0; k < count - 1; ++k) {
      words[k] = ~words[k];
    }
    words[count - 1] = ~(words[count - 1] << bs) >>> bs;
    return this;
  }
  _isRangeValue(start, end, value) {
    if (end < start) return;
    const words = this._words;
    const wordValue = value === true ? 4294967295 : 0;
    const wordStart = start >>> 5;
    const wordEnd = end >>> 5;
    for (let k = wordStart; k < wordEnd; ++k) {
      if (words[k] !== wordValue) return false;
    }
    if (end - start < 32) {
      for (let i = start, n = end + 1; i < n; ++i) {
        if (!!(words[i >>> 5] & 1 << i) !== value) return false;
      }
    } else {
      const startWord = wordStart << 5;
      const endWord = wordEnd << 5;
      for (let i = start, n = startWord << 5; i < n; ++i) {
        if (!!(words[i >>> 5] & 1 << i) !== value) return false;
      }
      for (let i = endWord, n = end + 1; i < n; ++i) {
        if (!!(words[i >>> 5] & 1 << i) !== value) return false;
      }
    }
    return true;
  }
  /**
   * Test if bits in given range are set
   * @param {Integer} start - start index
   * @param {Integer} end - end index
   * @return {BitArray} this object
   */
  isRangeSet(start, end) {
    return this._isRangeValue(start, end, true);
  }
  /**
   * Test if bits in given range are clear
   * @param {Integer} start - start index
   * @param {Integer} end - end index
   * @return {BitArray} this object
   */
  isRangeClear(start, end) {
    return this._isRangeValue(start, end, false);
  }
  /**
   * Test if all bits in the array are set
   * @return {Boolean} test result
   */
  isAllSet() {
    return this._isRangeValue(0, this.length - 1, true);
  }
  /**
   * Test if all bits in the array are clear
   * @return {Boolean} test result
   */
  isAllClear() {
    return this._isRangeValue(0, this.length - 1, false);
  }
  /**
   * Test if bits at all given indices are set
   * @param {...Integer} arguments - indices
   * @return {Boolean} test result
   */
  isSet(...indices) {
    const words = this._words;
    const n = indices.length;
    for (let i = 0; i < n; ++i) {
      const index = indices[i];
      if ((words[index >>> 5] & 1 << index) === 0) return false;
    }
    return true;
  }
  /**
   * Test if bits at all given indices are clear
   * @param {...Integer} arguments - indices
   * @return {Boolean} test result
   */
  isClear(...indices) {
    const words = this._words;
    const n = indices.length;
    for (let i = 0; i < n; ++i) {
      const index = indices[i];
      if ((words[index >>> 5] & 1 << index) !== 0) return false;
    }
    return true;
  }
  /**
   * Test if two BitArrays are identical in all their values
   * @param {BitArray} otherBitarray - the other BitArray
   * @return {Boolean} test result
   */
  isEqualTo(otherBitarray) {
    const words1 = this._words;
    const words2 = otherBitarray._words;
    const count = Math.min(words1.length, words2.length);
    for (let k = 0; k < count; ++k) {
      if (words1[k] !== words2[k]) {
        return false;
      }
    }
    return true;
  }
  /**
   * How many set bits?
   * @return {Integer} number of set bits
   */
  getSize() {
    const count = this._words.length;
    const words = this._words;
    let size = 0;
    for (let i = 0; i < count; ++i) {
      size += hammingWeight(words[i]);
    }
    return size;
  }
  /**
   * Calculate difference betwen this and another bit array.
   * Store result in this object.
   * @param  {BitArray} otherBitarray - the other bit array
   * @return {BitArray} this object
   */
  difference(otherBitarray) {
    const words1 = this._words;
    const words2 = otherBitarray._words;
    const count = Math.min(words1.length, words2.length);
    for (let k = 0; k < count; ++k) {
      words1[k] = words1[k] & ~words2[k];
    }
    for (let k = words1.length; k < count; ++k) {
      words1[k] = 0;
    }
    return this;
  }
  /**
   * Calculate union betwen this and another bit array.
   * Store result in this object.
   * @param  {BitArray} otherBitarray - the other bit array
   * @return {BitArray} this object
   */
  union(otherBitarray) {
    const words1 = this._words;
    const words2 = otherBitarray._words;
    const count = Math.min(words1.length, words2.length);
    for (let k = 0; k < count; ++k) {
      words1[k] |= words2[k];
    }
    for (let k = words1.length; k < count; ++k) {
      words1[k] = 0;
    }
    return this;
  }
  /**
   * Calculate intersection betwen this and another bit array.
   * Store result in this object.
   * @param  {BitArray} otherBitarray - the other bit array
   * @return {BitArray} this object
   */
  intersection(otherBitarray) {
    const words1 = this._words;
    const words2 = otherBitarray._words;
    const count = Math.min(words1.length, words2.length);
    for (let k = 0; k < count; ++k) {
      words1[k] &= words2[k];
    }
    for (let k = words1.length; k < count; ++k) {
      words1[k] = 0;
    }
    return this;
  }
  /**
   * Test if there is any intersection betwen this and another bit array.
   * @param  {BitArray} otherBitarray - the other bit array
   * @return {Boolean} test result
   */
  intersects(otherBitarray) {
    const words1 = this._words;
    const words2 = otherBitarray._words;
    const count = Math.min(words1.length, words2.length);
    for (let k = 0; k < count; ++k) {
      if ((words1[k] & words2[k]) !== 0) {
        return true;
      }
    }
    return false;
  }
  /**
   * Calculate the number of bits in common betwen this and another bit array.
   * @param  {BitArray} otherBitarray - the other bit array
   * @return {Integer} size
   */
  getIntersectionSize(otherBitarray) {
    const words1 = this._words;
    const words2 = otherBitarray._words;
    const count = Math.min(words1.length, words2.length);
    let size = 0;
    for (let k = 0; k < count; ++k) {
      size += hammingWeight(words1[k] & words2[k]);
    }
    return size;
  }
  /**
   * Calculate intersection betwen this and another bit array.
   * Store result in a new bit array.
   * @param  {BitArray} otherBitarray - the other bit array
   * @return {BitArray} the new bit array
   */
  makeIntersection(otherBitarray) {
    const words1 = this._words;
    const words2 = otherBitarray._words;
    const count = Math.min(words1.length, words2.length);
    const wordsA = new Uint32Array(count);
    const intersection = Object.create(_BitArray.prototype);
    intersection._words = wordsA;
    intersection.length = Math.min(this.length, otherBitarray.length);
    for (let k = 0; k < count; ++k) {
      wordsA[k] = words1[k] & words2[k];
    }
    return intersection;
  }
  /**
   * Iterate over all set bits in the array
   * @param  {function( index: Integer, i: Integer )} callback - the callback
   * @return {undefined}
   */
  forEach(callback) {
    const count = this._words.length;
    const words = this._words;
    let i = 0;
    for (let k = 0; k < count; ++k) {
      let w = words[k];
      while (w !== 0) {
        const t = w & -w;
        const index = (k << 5) + hammingWeight(t - 1);
        callback(index, i);
        w ^= t;
        ++i;
      }
    }
  }
  /**
   * Get an array with the set bits
   * @return {Array} bit indices
   */
  toArray() {
    const words = this._words;
    const answer = new Array(this.getSize());
    const count = this._words.length;
    let pos = 0;
    for (let k = 0; k < count; ++k) {
      let w = words[k];
      while (w !== 0) {
        const t = w & -w;
        answer[pos++] = (k << 5) + hammingWeight(t - 1);
        w ^= t;
      }
    }
    return answer;
  }
  toString() {
    return "{" + this.toArray().join(",") + "}";
  }
  toSeleString() {
    const sele = this.toArray().join(",");
    return sele ? "@" + sele : "NONE";
  }
  /**
   * Clone this object
   * @return {BitArray} the cloned object
   */
  clone() {
    const clone = Object.create(_BitArray.prototype);
    clone.length = this.length;
    clone._words = new Uint32Array(this._words);
    return clone;
  }
};

// src/structure/structure-constants.ts
var UnknownEntity = 0;
var PolymerEntity = 1;
var NonPolymerEntity = 2;
var MacrolideEntity = 3;
var WaterEntity = 4;
var UnknownType = 0;
var WaterType = 1;
var IonType = 2;
var ProteinType = 3;
var RnaType = 4;
var DnaType = 5;
var SaccharideType = 6;
var UnknownBackboneType = 0;
var ProteinBackboneType = 1;
var RnaBackboneType = 2;
var DnaBackboneType = 3;
var CgProteinBackboneType = 4;
var CgRnaBackboneType = 5;
var CgDnaBackboneType = 6;
var ChemCompProtein = [
  "D-BETA-PEPTIDE, C-GAMMA LINKING",
  "D-GAMMA-PEPTIDE, C-DELTA LINKING",
  "D-PEPTIDE COOH CARBOXY TERMINUS",
  "D-PEPTIDE NH3 AMINO TERMINUS",
  "D-PEPTIDE LINKING",
  "L-BETA-PEPTIDE, C-GAMMA LINKING",
  "L-GAMMA-PEPTIDE, C-DELTA LINKING",
  "L-PEPTIDE COOH CARBOXY TERMINUS",
  "L-PEPTIDE NH3 AMINO TERMINUS",
  "L-PEPTIDE LINKING",
  "PEPTIDE LINKING",
  "PEPTIDE-LIKE"
];
var ChemCompRna = [
  "RNA OH 3 PRIME TERMINUS",
  "RNA OH 5 PRIME TERMINUS",
  "RNA LINKING"
];
var ChemCompDna = [
  "DNA OH 3 PRIME TERMINUS",
  "DNA OH 5 PRIME TERMINUS",
  "DNA LINKING",
  "L-DNA LINKING",
  "L-RNA LINKING"
];
var ChemCompSaccharide = [
  "D-SACCHARIDE",
  "D-SACCHARIDE 1,4 AND 1,4 LINKING",
  "D-SACCHARIDE 1,4 AND 1,6 LINKING",
  "L-SACCHARIDE",
  "L-SACCHARIDE 1,4 AND 1,4 LINKING",
  "L-SACCHARIDE 1,4 AND 1,6 LINKING",
  "SACCHARIDE"
];
var ChemCompOther = [
  "OTHER"
];
var ChemCompNonPolymer = [
  "NON-POLYMER"
];
var ChemCompHetero = ChemCompNonPolymer.concat(ChemCompOther, ChemCompSaccharide);
var SecStrucHelix = ["h", "g", "i"];
var SecStrucSheet = ["e", "b"];
var SecStrucTurn = ["s", "t", "l", ""];
var AtomicNumbers = {
  "H": 1,
  "D": 1,
  "T": 1,
  "HE": 2,
  "LI": 3,
  "BE": 4,
  "B": 5,
  "C": 6,
  "N": 7,
  "O": 8,
  "F": 9,
  "NE": 10,
  "NA": 11,
  "MG": 12,
  "AL": 13,
  "SI": 14,
  "P": 15,
  "S": 16,
  "CL": 17,
  "AR": 18,
  "K": 19,
  "CA": 20,
  "SC": 21,
  "TI": 22,
  "V": 23,
  "CR": 24,
  "MN": 25,
  "FE": 26,
  "CO": 27,
  "NI": 28,
  "CU": 29,
  "ZN": 30,
  "GA": 31,
  "GE": 32,
  "AS": 33,
  "SE": 34,
  "BR": 35,
  "KR": 36,
  "RB": 37,
  "SR": 38,
  "Y": 39,
  "ZR": 40,
  "NB": 41,
  "MO": 42,
  "TC": 43,
  "RU": 44,
  "RH": 45,
  "PD": 46,
  "AG": 47,
  "CD": 48,
  "IN": 49,
  "SN": 50,
  "SB": 51,
  "TE": 52,
  "I": 53,
  "XE": 54,
  "CS": 55,
  "BA": 56,
  "LA": 57,
  "CE": 58,
  "PR": 59,
  "ND": 60,
  "PM": 61,
  "SM": 62,
  "EU": 63,
  "GD": 64,
  "TB": 65,
  "DY": 66,
  "HO": 67,
  "ER": 68,
  "TM": 69,
  "YB": 70,
  "LU": 71,
  "HF": 72,
  "TA": 73,
  "W": 74,
  "RE": 75,
  "OS": 76,
  "IR": 77,
  "PT": 78,
  "AU": 79,
  "HG": 80,
  "TL": 81,
  "PB": 82,
  "BI": 83,
  "PO": 84,
  "AT": 85,
  "RN": 86,
  "FR": 87,
  "RA": 88,
  "AC": 89,
  "TH": 90,
  "PA": 91,
  "U": 92,
  "NP": 93,
  "PU": 94,
  "AM": 95,
  "CM": 96,
  "BK": 97,
  "CF": 98,
  "ES": 99,
  "FM": 100,
  "MD": 101,
  "NO": 102,
  "LR": 103,
  "RF": 104,
  "DB": 105,
  "SG": 106,
  "BH": 107,
  "HS": 108,
  "MT": 109,
  "DS": 110,
  "RG": 111,
  "CN": 112,
  "NH": 113,
  "FL": 114,
  "MC": 115,
  "LV": 116,
  "TS": 117,
  "OG": 118
};
var DefaultAtomicNumber = 0;
var VdwRadii = {
  1: 1.1,
  2: 1.4,
  3: 1.81,
  4: 1.53,
  5: 1.92,
  6: 1.7,
  7: 1.55,
  8: 1.52,
  9: 1.47,
  10: 1.54,
  11: 2.27,
  12: 1.73,
  13: 1.84,
  14: 2.1,
  15: 1.8,
  16: 1.8,
  17: 1.75,
  18: 1.88,
  19: 2.75,
  20: 2.31,
  21: 2.3,
  22: 2.15,
  23: 2.05,
  24: 2.05,
  25: 2.05,
  26: 2.05,
  27: 2,
  28: 2,
  29: 2,
  30: 2.1,
  31: 1.87,
  32: 2.11,
  33: 1.85,
  34: 1.9,
  35: 1.83,
  36: 2.02,
  37: 3.03,
  38: 2.49,
  39: 2.4,
  40: 2.3,
  41: 2.15,
  42: 2.1,
  43: 2.05,
  44: 2.05,
  45: 2,
  46: 2.05,
  47: 2.1,
  48: 2.2,
  49: 2.2,
  50: 1.93,
  51: 2.17,
  52: 2.06,
  53: 1.98,
  54: 2.16,
  55: 3.43,
  56: 2.68,
  57: 2.5,
  58: 2.48,
  59: 2.47,
  60: 2.45,
  61: 2.43,
  62: 2.42,
  63: 2.4,
  64: 2.38,
  65: 2.37,
  66: 2.35,
  67: 2.33,
  68: 2.32,
  69: 2.3,
  70: 2.28,
  71: 2.27,
  72: 2.25,
  73: 2.2,
  74: 2.1,
  75: 2.05,
  76: 2,
  77: 2,
  78: 2.05,
  79: 2.1,
  80: 2.05,
  81: 1.96,
  82: 2.02,
  83: 2.07,
  84: 1.97,
  85: 2.02,
  86: 2.2,
  87: 3.48,
  88: 2.83,
  89: 2,
  90: 2.4,
  91: 2,
  92: 2.3,
  93: 2,
  94: 2,
  95: 2,
  96: 2,
  97: 2,
  98: 2,
  99: 2,
  100: 2,
  101: 2,
  102: 2,
  103: 2,
  104: 2,
  105: 2,
  106: 2,
  107: 2,
  108: 2,
  109: 2,
  110: 2,
  111: 2,
  112: 2,
  113: 2,
  114: 2,
  115: 2,
  116: 2,
  117: 2,
  118: 2
};
var DefaultVdwRadius = 2;
var CovalentRadii = {
  1: 0.31,
  2: 0.28,
  3: 1.28,
  4: 0.96,
  5: 0.84,
  6: 0.76,
  7: 0.71,
  8: 0.66,
  9: 0.57,
  10: 0.58,
  11: 1.66,
  12: 1.41,
  13: 1.21,
  14: 1.11,
  15: 1.07,
  16: 1.05,
  17: 1.02,
  18: 1.06,
  19: 2.03,
  20: 1.76,
  21: 1.7,
  22: 1.6,
  23: 1.53,
  24: 1.39,
  25: 1.39,
  26: 1.32,
  27: 1.26,
  28: 1.24,
  29: 1.32,
  30: 1.22,
  31: 1.22,
  32: 1.2,
  33: 1.19,
  34: 1.2,
  35: 1.2,
  36: 1.16,
  37: 2.2,
  38: 1.95,
  39: 1.9,
  40: 1.75,
  41: 1.64,
  42: 1.54,
  43: 1.47,
  44: 1.46,
  45: 1.42,
  46: 1.39,
  47: 1.45,
  48: 1.44,
  49: 1.42,
  50: 1.39,
  51: 1.39,
  52: 1.38,
  53: 1.39,
  54: 1.4,
  55: 2.44,
  56: 2.15,
  57: 2.07,
  58: 2.04,
  59: 2.03,
  60: 2.01,
  61: 1.99,
  62: 1.98,
  63: 1.98,
  64: 1.96,
  65: 1.94,
  66: 1.92,
  67: 1.92,
  68: 1.89,
  69: 1.9,
  70: 1.87,
  71: 1.87,
  72: 1.75,
  73: 1.7,
  74: 1.62,
  75: 1.51,
  76: 1.44,
  77: 1.41,
  78: 1.36,
  79: 1.36,
  80: 1.32,
  81: 1.45,
  82: 1.46,
  83: 1.48,
  84: 1.4,
  85: 1.5,
  86: 1.5,
  87: 2.6,
  88: 2.21,
  89: 2.15,
  90: 2.06,
  91: 2,
  92: 1.96,
  93: 1.9,
  94: 1.87,
  95: 1.8,
  96: 1.69,
  97: 1.6,
  98: 1.6,
  99: 1.6,
  100: 1.6,
  101: 1.6,
  102: 1.6,
  103: 1.6,
  104: 1.6,
  105: 1.6,
  106: 1.6,
  107: 1.6,
  108: 1.6,
  109: 1.6,
  110: 1.6,
  111: 1.6,
  112: 1.6,
  113: 1.6,
  114: 1.6,
  115: 1.6,
  116: 1.6,
  117: 1.6,
  118: 1.6
};
var DefaultCovalentRadius = 1.6;
var Valences = {
  1: [1],
  2: [0],
  3: [1],
  4: [2],
  5: [3],
  6: [4],
  7: [3],
  8: [2],
  9: [1],
  10: [0],
  11: [1],
  12: [2],
  13: [6],
  14: [6],
  15: [3, 5, 7],
  16: [2, 4, 6],
  17: [1],
  18: [0],
  19: [1],
  20: [2],
  31: [3],
  32: [4],
  33: [3, 5],
  34: [2, 4, 6],
  35: [1],
  36: [0],
  37: [1],
  38: [2],
  49: [3],
  50: [4],
  51: [3, 5],
  52: [2],
  53: [1, 2, 5],
  54: [0, 2],
  55: [1],
  56: [2],
  81: [3],
  82: [4],
  83: [3],
  84: [2],
  85: [1],
  86: [0],
  87: [1],
  88: [2]
};
var DefaultValence = -1;
var OuterShellElectronCounts = {
  1: 1,
  2: 2,
  3: 1,
  4: 2,
  5: 3,
  6: 4,
  7: 5,
  8: 6,
  9: 7,
  10: 8,
  11: 1,
  12: 2,
  13: 3,
  14: 4,
  15: 5,
  16: 6,
  17: 7,
  18: 8,
  19: 1,
  20: 2,
  21: 3,
  22: 4,
  23: 5,
  24: 6,
  25: 7,
  26: 8,
  27: 9,
  28: 10,
  29: 11,
  30: 2,
  31: 3,
  32: 4,
  33: 5,
  34: 6,
  35: 7,
  36: 8,
  37: 1,
  38: 2,
  39: 3,
  40: 4,
  41: 5,
  42: 6,
  43: 7,
  44: 8,
  45: 9,
  46: 10,
  47: 11,
  48: 2,
  49: 3,
  50: 4,
  51: 5,
  52: 6,
  53: 7,
  54: 8,
  55: 1,
  56: 2,
  57: 3,
  58: 4,
  59: 3,
  60: 4,
  61: 5,
  62: 6,
  63: 7,
  64: 8,
  65: 9,
  66: 10,
  67: 11,
  68: 12,
  69: 13,
  70: 14,
  71: 15,
  72: 4,
  73: 5,
  74: 6,
  75: 7,
  76: 8,
  77: 9,
  78: 10,
  79: 11,
  80: 2,
  81: 3,
  82: 4,
  83: 5,
  84: 6,
  85: 7,
  86: 8,
  87: 1,
  88: 2,
  89: 3,
  90: 4,
  91: 3,
  92: 4,
  93: 5,
  94: 6,
  95: 7,
  96: 8,
  97: 9,
  98: 10,
  99: 11,
  100: 12,
  101: 13,
  102: 14,
  103: 15,
  104: 2,
  105: 2,
  106: 2,
  107: 2,
  108: 2,
  109: 2,
  110: 2,
  111: 2,
  112: 2,
  113: 3,
  114: 4,
  115: 5,
  116: 6,
  117: 7,
  118: 8
};
var DefaultOuterShellElectronCount = 2;
var AA1 = {
  "HIS": "H",
  "ARG": "R",
  "LYS": "K",
  "ILE": "I",
  "PHE": "F",
  "LEU": "L",
  "TRP": "W",
  "ALA": "A",
  "MET": "M",
  "PRO": "P",
  "CYS": "C",
  "ASN": "N",
  "VAL": "V",
  "GLY": "G",
  "SER": "S",
  "GLN": "Q",
  "TYR": "Y",
  "ASP": "D",
  "GLU": "E",
  "THR": "T",
  "SEC": "U",
  // as per IUPAC definition
  "PYL": "O"
  // as per IUPAC definition
};
var AA3 = Object.keys(AA1);
var RnaBases = ["A", "C", "T", "G", "U", "I"];
var DnaBases = ["DA", "DC", "DT", "DG", "DU", "DI"];
var PurinBases = ["A", "G", "I", "DA", "DG", "DI"];
var Bases = RnaBases.concat(DnaBases);
var WaterNames = [
  "SOL",
  "WAT",
  "HOH",
  "H2O",
  "W",
  "DOD",
  "D3O",
  "TIP3",
  "TIP4",
  "SPC"
];
var IonNames = [
  "118",
  "119",
  "1AL",
  "1CU",
  "2FK",
  "2HP",
  "2OF",
  "3CO",
  "3MT",
  "3NI",
  "3OF",
  "3P8",
  "4MO",
  "4PU",
  "543",
  "6MO",
  "ACT",
  "AG",
  "AL",
  "ALF",
  "AM",
  "ATH",
  "AU",
  "AU3",
  "AUC",
  "AZI",
  "BA",
  "BCT",
  "BEF",
  "BF4",
  "BO4",
  "BR",
  "BS3",
  "BSY",
  "CA",
  "CAC",
  "CD",
  "CD1",
  "CD3",
  "CD5",
  "CE",
  "CHT",
  "CL",
  "CO",
  "CO3",
  "CO5",
  "CON",
  "CR",
  "CS",
  "CSB",
  "CU",
  "CU1",
  "CU3",
  "CUA",
  "CUZ",
  "CYN",
  "DME",
  "DMI",
  "DSC",
  "DTI",
  "DY",
  "E4N",
  "EDR",
  "EMC",
  "ER3",
  "EU",
  "EU3",
  "F",
  "FE",
  "FE2",
  "FPO",
  "GA",
  "GD3",
  "GEP",
  "HAI",
  "HG",
  "HGC",
  "IN",
  "IOD",
  "IR",
  "IR3",
  "IRI",
  "IUM",
  "K",
  "KO4",
  "LA",
  "LCO",
  "LCP",
  "LI",
  "LU",
  "MAC",
  "MG",
  "MH2",
  "MH3",
  "MLI",
  "MLT",
  "MMC",
  "MN",
  "MN3",
  "MN5",
  "MN6",
  "MO1",
  "MO2",
  "MO3",
  "MO4",
  "MO5",
  "MO6",
  "MOO",
  "MOS",
  "MOW",
  "MW1",
  "MW2",
  "MW3",
  "NA",
  "NA2",
  "NA5",
  "NA6",
  "NAO",
  "NAW",
  "NCO",
  "NET",
  "NH4",
  "NI",
  "NI1",
  "NI2",
  "NI3",
  "NO2",
  "NO3",
  "NRU",
  "O4M",
  "OAA",
  "OC1",
  "OC2",
  "OC3",
  "OC4",
  "OC5",
  "OC6",
  "OC7",
  "OC8",
  "OCL",
  "OCM",
  "OCN",
  "OCO",
  "OF1",
  "OF2",
  "OF3",
  "OH",
  "OS",
  "OS4",
  "OXL",
  "PB",
  "PBM",
  "PD",
  "PDV",
  "PER",
  "PI",
  "PO3",
  "PO4",
  "PR",
  "PT",
  "PT4",
  "PTN",
  "RB",
  "RH3",
  "RHD",
  "RU",
  "SB",
  "SCN",
  "SE4",
  "SEK",
  "SM",
  "SMO",
  "SO3",
  "SO4",
  "SR",
  "T1A",
  "TB",
  "TBA",
  "TCN",
  "TEA",
  "TH",
  "THE",
  "TL",
  "TMA",
  "TRA",
  "UNX",
  "V",
  "VN3",
  "VO4",
  "W",
  "WO5",
  "Y1",
  "YB",
  "YB2",
  "YH",
  "YT3",
  "ZCM",
  "ZN",
  "ZN2",
  "ZN3",
  "ZNO",
  "ZO3",
  // additional ion names
  "OHX"
];
var SaccharideNames = [
  "045",
  "0AT",
  "0BD",
  "0MK",
  "0NZ",
  "0TS",
  "0V4",
  "0XY",
  "0YT",
  "10M",
  "147",
  "149",
  "14T",
  "15L",
  "16G",
  "18T",
  "18Y",
  "1AR",
  "1BW",
  "1GL",
  "1GN",
  "1JB",
  "1LL",
  "1NA",
  "1S3",
  "26M",
  "26Q",
  "26R",
  "26V",
  "26W",
  "26Y",
  "27C",
  "289",
  "291",
  "293",
  "2DG",
  "2F8",
  "2FG",
  "2FL",
  "2FP",
  "2GL",
  "2M4",
  "2M5",
  "32O",
  "34V",
  "3CM",
  "3DO",
  "3DY",
  "3FM",
  "3LR",
  "3MF",
  "3MG",
  "3SA",
  "3ZW",
  "46D",
  "46M",
  "46Z",
  "48Z",
  "4CQ",
  "4GC",
  "4NN",
  "50A",
  "5DI",
  "5GF",
  "5MM",
  "5RP",
  "5SA",
  "5SP",
  "64K",
  "6PG",
  "6SA",
  "7JZ",
  "7SA",
  "A1Q",
  "A2G",
  "AAB",
  "AAL",
  "AAO",
  "ABC",
  "ABD",
  "ABE",
  "ABF",
  "ABL",
  "ACG",
  "ACI",
  "ACR",
  "ACX",
  "ADA",
  "ADG",
  "ADR",
  "AF1",
  "AFD",
  "AFL",
  "AFO",
  "AFP",
  "AFR",
  "AGC",
  "AGH",
  "AGL",
  "AHR",
  "AIG",
  "ALL",
  "ALX",
  "AMU",
  "AOG",
  "AOS",
  "ARA",
  "ARB",
  "ARE",
  "ARI",
  "ASG",
  "ASO",
  "AXP",
  "AXR",
  "B0D",
  "B16",
  "B2G",
  "B4G",
  "B6D",
  "B8D",
  "B9D",
  "BBK",
  "BCD",
  "BDG",
  "BDP",
  "BDR",
  "BEM",
  "BFP",
  "BGC",
  "BGL",
  "BGP",
  "BGS",
  "BHG",
  "BMA",
  "BMX",
  "BNG",
  "BNX",
  "BOG",
  "BRI",
  "BXF",
  "BXP",
  "BXX",
  "BXY",
  "C3X",
  "C4X",
  "C5X",
  "CAP",
  "CBI",
  "CBK",
  "CBS",
  "CDR",
  "CEG",
  "CGF",
  "CHO",
  "CR1",
  "CR6",
  "CRA",
  "CT3",
  "CTO",
  "CTR",
  "CTT",
  "D6G",
  "DAF",
  "DAG",
  "DDA",
  "DDB",
  "DDL",
  "DEL",
  "DFR",
  "DFX",
  "DG0",
  "DGC",
  "DGD",
  "DGM",
  "DGS",
  "DIG",
  "DLF",
  "DLG",
  "DMU",
  "DNO",
  "DOM",
  "DP5",
  "DQQ",
  "DQR",
  "DR2",
  "DR3",
  "DR4",
  "DRI",
  "DSR",
  "DT6",
  "DVC",
  "E4P",
  "E5G",
  "EAG",
  "EBG",
  "EBQ",
  "EGA",
  "EJT",
  "EPG",
  "ERE",
  "ERI",
  "F1P",
  "F1X",
  "F6P",
  "FBP",
  "FCA",
  "FCB",
  "FCT",
  "FDP",
  "FDQ",
  "FFC",
  "FIX",
  "FMO",
  "FRU",
  "FSI",
  "FU4",
  "FUB",
  "FUC",
  "FUD",
  "FUL",
  "FXP",
  "G16",
  "G1P",
  "G2F",
  "G3I",
  "G4D",
  "G4S",
  "G6D",
  "G6P",
  "G6S",
  "GAC",
  "GAD",
  "GAL",
  "GC1",
  "GC4",
  "GCD",
  "GCN",
  "GCO",
  "GCS",
  "GCT",
  "GCU",
  "GCV",
  "GCW",
  "GCX",
  "GE1",
  "GFG",
  "GFP",
  "GIV",
  "GL0",
  "GL2",
  "GL5",
  "GL6",
  "GL7",
  "GL9",
  "GLA",
  "GLB",
  "GLC",
  "GLD",
  "GLF",
  "GLG",
  "GLO",
  "GLP",
  "GLS",
  "GLT",
  "GLW",
  "GMH",
  "GN1",
  "GNX",
  "GP1",
  "GP4",
  "GPH",
  "GPM",
  "GQ1",
  "GQ2",
  "GQ4",
  "GS1",
  "GS4",
  "GSA",
  "GSD",
  "GTE",
  "GTH",
  "GTK",
  "GTR",
  "GTZ",
  "GU0",
  "GU1",
  "GU2",
  "GU3",
  "GU4",
  "GU5",
  "GU6",
  "GU8",
  "GU9",
  "GUF",
  "GUP",
  "GUZ",
  "GYP",
  "GYV",
  "H2P",
  "HDL",
  "HMS",
  "HS2",
  "HSD",
  "HSG",
  "HSH",
  "HSJ",
  "HSQ",
  "HSR",
  "HSU",
  "HSX",
  "HSY",
  "HSZ",
  "IAB",
  "IDG",
  "IDR",
  "IDS",
  "IDT",
  "IDU",
  "IDX",
  "IDY",
  "IMK",
  "IN1",
  "IPT",
  "ISL",
  "KBG",
  "KD2",
  "KDA",
  "KDM",
  "KDO",
  "KFN",
  "KO1",
  "KO2",
  "KTU",
  "L6S",
  "LAG",
  "LAI",
  "LAK",
  "LAO",
  "LAT",
  "LB2",
  "LBT",
  "LCN",
  "LDY",
  "LGC",
  "LGU",
  "LM2",
  "LMT",
  "LMU",
  "LOG",
  "LOX",
  "LPK",
  "LSM",
  "LTM",
  "LVZ",
  "LXB",
  "LXZ",
  "M1F",
  "M3M",
  "M6P",
  "M8C",
  "MA1",
  "MA2",
  "MA3",
  "MAB",
  "MAG",
  "MAL",
  "MAN",
  "MAT",
  "MAV",
  "MAW",
  "MBG",
  "MCU",
  "MDA",
  "MDM",
  "MDP",
  "MFA",
  "MFB",
  "MFU",
  "MG5",
  "MGA",
  "MGL",
  "MLB",
  "MMA",
  "MMN",
  "MN0",
  "MRP",
  "MTT",
  "MUG",
  "MVP",
  "MXY",
  "N1L",
  "N9S",
  "NAA",
  "NAG",
  "NBG",
  "NDG",
  "NED",
  "NG1",
  "NG6",
  "NGA",
  "NGB",
  "NGC",
  "NGE",
  "NGF",
  "NGL",
  "NGS",
  "NGY",
  "NHF",
  "NM6",
  "NM9",
  "NTF",
  "NTO",
  "NTP",
  "NXD",
  "NYT",
  "OPG",
  "OPM",
  "ORP",
  "OX2",
  "P3M",
  "P53",
  "P6P",
  "PA5",
  "PNA",
  "PNG",
  "PNW",
  "PRP",
  "PSJ",
  "PSV",
  "PTQ",
  "QDK",
  "QPS",
  "QV4",
  "R1P",
  "R1X",
  "R2B",
  "R5P",
  "RAA",
  "RAE",
  "RAF",
  "RAM",
  "RAO",
  "RAT",
  "RB5",
  "RBL",
  "RCD",
  "RDP",
  "REL",
  "RER",
  "RF5",
  "RG1",
  "RGG",
  "RHA",
  "RIB",
  "RIP",
  "RNS",
  "RNT",
  "ROB",
  "ROR",
  "RPA",
  "RST",
  "RUB",
  "RUU",
  "RZM",
  "S6P",
  "S7P",
  "SA0",
  "SCR",
  "SDD",
  "SF6",
  "SF9",
  "SG4",
  "SG5",
  "SG6",
  "SG7",
  "SGA",
  "SGC",
  "SGD",
  "SGN",
  "SGS",
  "SHB",
  "SHG",
  "SI3",
  "SIO",
  "SOE",
  "SOL",
  "SSG",
  "SUC",
  "SUP",
  "SUS",
  "T6P",
  "T6T",
  "TAG",
  "TCB",
  "TDG",
  "TGK",
  "TGY",
  "TH1",
  "TIA",
  "TM5",
  "TM6",
  "TM9",
  "TMR",
  "TMX",
  "TOA",
  "TOC",
  "TRE",
  "TYV",
  "UCD",
  "UDC",
  "VG1",
  "X0X",
  "X1X",
  "X2F",
  "X4S",
  "X5S",
  "X6X",
  "XBP",
  "XDN",
  "XDP",
  "XIF",
  "XIM",
  "XLF",
  "XLS",
  "XMM",
  "XUL",
  "XXR",
  "XYP",
  "XYS",
  "YO5",
  "Z3Q",
  "Z6J",
  "Z9M",
  "ZDC",
  "ZDM"
];
var ProteinBackboneAtoms = [
  "CA",
  "C",
  "N",
  "O",
  "O1",
  "O2",
  "OC1",
  "OC2",
  "OX1",
  "OXT",
  "H",
  "H1",
  "H2",
  "H3",
  "HA",
  "HN",
  "BB"
];
var NucleicBackboneAtoms = [
  "P",
  "OP1",
  "OP2",
  "HOP2",
  "HOP3",
  "O2'",
  "O3'",
  "O4'",
  "O5'",
  "C1'",
  "C2'",
  "C3'",
  "C4'",
  "C5'",
  "H1'",
  "H2'",
  "H2''",
  "HO2'",
  "H3'",
  "H4'",
  "H5'",
  "H5''",
  "HO3'",
  "HO5'",
  "O2*",
  "O3*",
  "O4*",
  "O5*",
  "C1*",
  "C2*",
  "C3*",
  "C4*",
  "C5*"
];
var ResidueTypeAtoms = {};
ResidueTypeAtoms[ProteinBackboneType] = {
  trace: "CA",
  direction1: "C",
  direction2: ["O", "OC1", "O1", "OX1", "OXT"],
  backboneStart: "N",
  backboneEnd: "C"
};
ResidueTypeAtoms[RnaBackboneType] = {
  trace: ["C4'", "C4*"],
  direction1: ["C1'", "C1*"],
  direction2: ["C3'", "C3*"],
  backboneStart: "P",
  backboneEnd: ["O3'", "O3*"]
};
ResidueTypeAtoms[DnaBackboneType] = {
  trace: ["C3'", "C3*"],
  direction1: ["C2'", "C2*"],
  direction2: ["O4'", "O4*"],
  backboneStart: "P",
  backboneEnd: ["O3'", "O3*"]
};
ResidueTypeAtoms[CgProteinBackboneType] = {
  trace: ["CA", "BB"],
  backboneStart: ["CA", "BB"],
  backboneEnd: ["CA", "BB"]
};
ResidueTypeAtoms[CgRnaBackboneType] = {
  trace: ["C4'", "C4*", "P"],
  backboneStart: ["C4'", "C4*", "P"],
  backboneEnd: ["C4'", "C4*", "P"]
};
ResidueTypeAtoms[CgDnaBackboneType] = {
  trace: ["C3'", "C3*", "C2'", "P"],
  // C2' is used in martini ff
  backboneStart: ["C3'", "C3*", "C2'", "P"],
  backboneEnd: ["C3'", "C3*", "C2'", "P"]
};
ResidueTypeAtoms[UnknownBackboneType] = {};

// src/utils/radius-factory.ts
var RadiusFactoryTypes = {
  "": "",
  "vdw": "by vdW radius",
  "covalent": "by covalent radius",
  "sstruc": "by secondary structure",
  "bfactor": "by bfactor",
  "size": "size",
  "data": "data",
  "explicit": "explicit"
};
var RadiusFactory = class {
  constructor(params = {}) {
    this.max = 10;
    this.type = defaults(params.type, "size");
    this.scale = defaults(params.scale, 1);
    this.size = defaults(params.size, 1);
    this.data = defaults(params.data, {});
  }
  atomRadius(a) {
    let r;
    switch (this.type) {
      case "vdw":
        r = a.vdw;
        break;
      case "covalent":
        r = a.covalent;
        break;
      case "bfactor":
        r = a.bfactor || 1;
        break;
      case "sstruc":
        const sstruc = a.sstruc;
        if (sstruc === "h") {
          r = 0.25;
        } else if (sstruc === "g") {
          r = 0.25;
        } else if (sstruc === "i") {
          r = 0.25;
        } else if (sstruc === "e") {
          r = 0.25;
        } else if (sstruc === "b") {
          r = 0.25;
        } else if (NucleicBackboneAtoms.includes(a.atomname)) {
          r = 0.4;
        } else {
          r = 0.1;
        }
        break;
      case "data":
        r = defaults(this.data[a.index], 1);
        break;
      case "explicit":
        r = a.radius;
        if (r === null) r = this.size;
        break;
      default:
        r = this.size;
        break;
    }
    return Math.min(r * this.scale, this.max);
  }
};
RadiusFactory.types = RadiusFactoryTypes;
var radius_factory_default = RadiusFactory;

// src/math/vector-utils.ts
function calculateMeanVector3(array) {
  const n = array.length;
  const m = n / 3;
  let x = 0;
  let y = 0;
  let z = 0;
  for (let i = 0; i < n; i += 3) {
    x += array[i + 0];
    y += array[i + 1];
    z += array[i + 2];
  }
  return new Vector3(x / m, y / m, z / m);
}
function projectPointOnVector(point, vector, origin) {
  if (origin) {
    point.sub(origin).projectOnVector(vector).add(origin);
  } else {
    point.projectOnVector(vector);
  }
  return point;
}
function computeBoundingBox(array) {
  let minX = Infinity;
  let minY = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = -Infinity;
  for (let i = 0, l = array.length; i < l; i += 3) {
    const x = array[i];
    const y = array[i + 1];
    const z = array[i + 2];
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (z < minZ) minZ = z;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
    if (z > maxZ) maxZ = z;
  }
  return [
    v3new([minX, minY, minZ]),
    v3new([maxX, maxY, maxZ])
  ];
}
computeBoundingBox.__deps = [v3new];
function v3new(array) {
  return new Float32Array(array || 3);
}
function v3cross(out, a, b) {
  const ax = a[0];
  const ay = a[1];
  const az = a[2];
  const bx = b[0];
  const by = b[1];
  const bz = b[2];
  out[0] = ay * bz - az * by;
  out[1] = az * bx - ax * bz;
  out[2] = ax * by - ay * bx;
}
function v3fromArray(out, array, offset = 0) {
  out[0] = array[offset];
  out[1] = array[offset + 1];
  out[2] = array[offset + 2];
}
function v3toArray(input, array, offset = 0) {
  array[offset] = input[0];
  array[offset + 1] = input[1];
  array[offset + 2] = input[2];
}
function v3forEach(array, fn, b) {
  const a = v3new();
  for (let i = 0, n = array.length; i < n; i += 3) {
    v3fromArray(a, array, i);
    fn(a, a, b);
    v3toArray(a, array, i);
  }
}
v3forEach.__deps = [v3new, v3fromArray, v3toArray];
function v3length(a) {
  return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
}
function v3divideScalar(out, a, s) {
  v3multiplyScalar(out, a, 1 / s);
}
v3divideScalar.__deps = [v3multiplyScalar];
function v3multiplyScalar(out, a, s) {
  out[0] = a[0] * s;
  out[1] = a[1] * s;
  out[2] = a[2] * s;
}
function v3normalize(out, a) {
  v3multiplyScalar(out, a, 1 / v3length(a));
}
v3normalize.__deps = [v3multiplyScalar, v3length];

// src/math/matrix-utils.ts
var Matrix = class {
  constructor(cols, rows) {
    this.cols = cols;
    this.rows = rows;
    this.size = this.cols * this.rows;
    this.data = new Float32Array(this.size);
  }
  copyTo(matrix) {
    matrix.data.set(this.data);
  }
};
function transpose(At, A) {
  let i = 0;
  let j = 0;
  const nrows = A.rows;
  const ncols = A.cols;
  let Ai = 0;
  let Ati = 0;
  let pAt = 0;
  const ad = A.data;
  const atd = At.data;
  for (; i < nrows; Ati += 1, Ai += ncols, i++) {
    pAt = Ati;
    for (j = 0; j < ncols; pAt += nrows, j++) atd[pAt] = ad[Ai + j];
  }
}
function multiplyABt(C, A, B) {
  let i = 0;
  let j = 0;
  let k = 0;
  let Ap = 0;
  let pA = 0;
  let pB = 0;
  let Cp = 0;
  const ncols = A.cols;
  const nrows = A.rows;
  const mrows = B.rows;
  const ad = A.data;
  const bd = B.data;
  const cd = C.data;
  let sum = 0;
  for (; i < nrows; Ap += ncols, i++) {
    for (pB = 0, j = 0; j < mrows; Cp++, j++) {
      pA = Ap;
      sum = 0;
      for (k = 0; k < ncols; pA++, pB++, k++) {
        sum += ad[pA] * bd[pB];
      }
      cd[Cp] = sum;
    }
  }
}
function meanRows(A) {
  const nrows = A.rows;
  const ncols = A.cols;
  const Ad = A.data;
  const mean = new Array(ncols);
  for (let j = 0; j < ncols; ++j) {
    mean[j] = 0;
  }
  for (let i = 0, p = 0; i < nrows; ++i) {
    for (let j = 0; j < ncols; ++j, ++p) {
      mean[j] += Ad[p];
    }
  }
  for (let j = 0; j < ncols; ++j) {
    mean[j] /= nrows;
  }
  return mean;
}
function subRows(A, row) {
  const nrows = A.rows;
  const ncols = A.cols;
  const Ad = A.data;
  for (let i = 0, p = 0; i < nrows; ++i) {
    for (let j = 0; j < ncols; ++j, ++p) {
      Ad[p] -= row[j];
    }
  }
}
function swap2(A, i0, i1, t) {
  t = A[i0];
  A[i0] = A[i1];
  A[i1] = t;
}
function hypot(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  if (a > b) {
    b /= a;
    return a * Math.sqrt(1 + b * b);
  }
  if (b > 0) {
    a /= b;
    return b * Math.sqrt(1 + a * a);
  }
  return 0;
}
var EPSILON = 1192092896e-16;
var FLT_MIN = 1e-37;
function JacobiSVDImpl(At, astep, _W, Vt, vstep, m, n, n1) {
  const eps = EPSILON * 2;
  const minval = FLT_MIN;
  let i = 0;
  let j = 0;
  let k = 0;
  let iter = 0;
  const maxIter = Math.max(m, 30);
  let Ai = 0;
  let Aj = 0;
  let Vi = 0;
  let Vj = 0;
  let changed = 0;
  let c = 0;
  let s = 0;
  let t = 0;
  let t0 = 0;
  let t1 = 0;
  let sd = 0;
  let beta = 0;
  let gamma = 0;
  let delta = 0;
  let a = 0;
  let p = 0;
  let b = 0;
  let seed = 4660;
  let val = 0;
  let val0 = 0;
  let asum = 0;
  const W = new Float64Array(n << 3);
  for (; i < n; i++) {
    for (k = 0, sd = 0; k < m; k++) {
      t = At[i * astep + k];
      sd += t * t;
    }
    W[i] = sd;
    if (Vt) {
      for (k = 0; k < n; k++) {
        Vt[i * vstep + k] = 0;
      }
      Vt[i * vstep + i] = 1;
    }
  }
  for (; iter < maxIter; iter++) {
    changed = 0;
    for (i = 0; i < n - 1; i++) {
      for (j = i + 1; j < n; j++) {
        Ai = i * astep | 0;
        Aj = j * astep | 0;
        a = W[i];
        p = 0;
        b = W[j];
        k = 2;
        p += At[Ai] * At[Aj];
        p += At[Ai + 1] * At[Aj + 1];
        for (; k < m; k++) {
          p += At[Ai + k] * At[Aj + k];
        }
        if (Math.abs(p) <= eps * Math.sqrt(a * b)) continue;
        p *= 2;
        beta = a - b;
        gamma = hypot(p, beta);
        if (beta < 0) {
          delta = (gamma - beta) * 0.5;
          s = Math.sqrt(delta / gamma);
          c = p / (gamma * s * 2);
        } else {
          c = Math.sqrt((gamma + beta) / (gamma * 2));
          s = p / (gamma * c * 2);
        }
        a = 0;
        b = 0;
        k = 2;
        t0 = c * At[Ai] + s * At[Aj];
        t1 = -s * At[Ai] + c * At[Aj];
        At[Ai] = t0;
        At[Aj] = t1;
        a += t0 * t0;
        b += t1 * t1;
        t0 = c * At[Ai + 1] + s * At[Aj + 1];
        t1 = -s * At[Ai + 1] + c * At[Aj + 1];
        At[Ai + 1] = t0;
        At[Aj + 1] = t1;
        a += t0 * t0;
        b += t1 * t1;
        for (; k < m; k++) {
          t0 = c * At[Ai + k] + s * At[Aj + k];
          t1 = -s * At[Ai + k] + c * At[Aj + k];
          At[Ai + k] = t0;
          At[Aj + k] = t1;
          a += t0 * t0;
          b += t1 * t1;
        }
        W[i] = a;
        W[j] = b;
        changed = 1;
        if (Vt) {
          Vi = i * vstep | 0;
          Vj = j * vstep | 0;
          k = 2;
          t0 = c * Vt[Vi] + s * Vt[Vj];
          t1 = -s * Vt[Vi] + c * Vt[Vj];
          Vt[Vi] = t0;
          Vt[Vj] = t1;
          t0 = c * Vt[Vi + 1] + s * Vt[Vj + 1];
          t1 = -s * Vt[Vi + 1] + c * Vt[Vj + 1];
          Vt[Vi + 1] = t0;
          Vt[Vj + 1] = t1;
          for (; k < n; k++) {
            t0 = c * Vt[Vi + k] + s * Vt[Vj + k];
            t1 = -s * Vt[Vi + k] + c * Vt[Vj + k];
            Vt[Vi + k] = t0;
            Vt[Vj + k] = t1;
          }
        }
      }
    }
    if (changed === 0) break;
  }
  for (i = 0; i < n; i++) {
    for (k = 0, sd = 0; k < m; k++) {
      t = At[i * astep + k];
      sd += t * t;
    }
    W[i] = Math.sqrt(sd);
  }
  for (i = 0; i < n - 1; i++) {
    j = i;
    for (k = i + 1; k < n; k++) {
      if (W[j] < W[k]) {
        j = k;
      }
    }
    if (i !== j) {
      swap2(W, i, j, sd);
      if (Vt) {
        for (k = 0; k < m; k++) {
          swap2(At, i * astep + k, j * astep + k, t);
        }
        for (k = 0; k < n; k++) {
          swap2(Vt, i * vstep + k, j * vstep + k, t);
        }
      }
    }
  }
  for (i = 0; i < n; i++) {
    _W[i] = W[i];
  }
  if (!Vt) {
    return;
  }
  for (i = 0; i < n1; i++) {
    sd = i < n ? W[i] : 0;
    while (sd <= minval) {
      val0 = 1 / m;
      for (k = 0; k < m; k++) {
        seed = seed * 214013 + 2531011;
        val = (seed >> 16 & 32767 & 256) !== 0 ? val0 : -val0;
        At[i * astep + k] = val;
      }
      for (iter = 0; iter < 2; iter++) {
        for (j = 0; j < i; j++) {
          sd = 0;
          for (k = 0; k < m; k++) {
            sd += At[i * astep + k] * At[j * astep + k];
          }
          asum = 0;
          for (k = 0; k < m; k++) {
            t = At[i * astep + k] - sd * At[j * astep + k];
            At[i * astep + k] = t;
            asum += Math.abs(t);
          }
          asum = asum ? 1 / asum : 0;
          for (k = 0; k < m; k++) {
            At[i * astep + k] *= asum;
          }
        }
      }
      sd = 0;
      for (k = 0; k < m; k++) {
        t = At[i * astep + k];
        sd += t * t;
      }
      sd = Math.sqrt(sd);
    }
    s = 1 / sd;
    for (k = 0; k < m; k++) {
      At[i * astep + k] *= s;
    }
  }
}
function svd(A, W, U, V) {
  let at = 0;
  let i = 0;
  const _m = A.rows;
  const _n = A.cols;
  let m = _m;
  let n = _n;
  if (m < n) {
    at = 1;
    i = m;
    m = n;
    n = i;
  }
  const amt = new Matrix(m, m);
  const wmt = new Matrix(1, n);
  const vmt = new Matrix(n, n);
  if (at === 0) {
    transpose(amt, A);
  } else {
    for (i = 0; i < _n * _m; i++) {
      amt.data[i] = A.data[i];
    }
    for (; i < n * m; i++) {
      amt.data[i] = 0;
    }
  }
  JacobiSVDImpl(amt.data, m, wmt.data, vmt.data, n, m, n, m);
  if (W) {
    for (i = 0; i < n; i++) {
      W.data[i] = wmt.data[i];
    }
    for (; i < _n; i++) {
      W.data[i] = 0;
    }
  }
  if (at === 0) {
    if (U) transpose(U, amt);
    if (V) transpose(V, vmt);
  } else {
    if (U) transpose(U, vmt);
    if (V) transpose(V, amt);
  }
}
function m4set(out, n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44) {
  out[0] = n11;
  out[4] = n12;
  out[8] = n13;
  out[12] = n14;
  out[1] = n21;
  out[5] = n22;
  out[9] = n23;
  out[13] = n24;
  out[2] = n31;
  out[6] = n32;
  out[10] = n33;
  out[14] = n34;
  out[3] = n41;
  out[7] = n42;
  out[11] = n43;
  out[15] = n44;
}
function m4identity(out) {
  m4set(
    out,
    1,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    1
  );
}
m4identity.__deps = [m4set];
function m4makeScale(out, x, y, z) {
  m4set(
    out,
    x,
    0,
    0,
    0,
    0,
    y,
    0,
    0,
    0,
    0,
    z,
    0,
    0,
    0,
    0,
    1
  );
}
m4makeScale.__deps = [m4set];
function m4makeTranslation(out, x, y, z) {
  m4set(
    out,
    1,
    0,
    0,
    x,
    0,
    1,
    0,
    y,
    0,
    0,
    1,
    z,
    0,
    0,
    0,
    1
  );
}
m4makeTranslation.__deps = [m4set];
function m4makeRotationY(out, theta) {
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  m4set(
    out,
    c,
    0,
    s,
    0,
    0,
    1,
    0,
    0,
    -s,
    0,
    c,
    0,
    0,
    0,
    0,
    1
  );
}
m4makeRotationY.__deps = [m4set];
function m3makeNormal(out, m4) {
  const r0 = v3new([m4[0], m4[1], m4[2]]);
  const r1 = v3new([m4[4], m4[5], m4[6]]);
  const r2 = v3new([m4[8], m4[9], m4[10]]);
  const cp = v3new();
  v3cross(cp, r1, r2);
  out[0] = cp[0];
  out[1] = cp[1];
  out[2] = cp[2];
  v3cross(cp, r2, r0);
  out[3] = cp[0];
  out[4] = cp[1];
  out[5] = cp[2];
  v3cross(cp, r0, r1);
  out[6] = cp[0];
  out[7] = cp[1];
  out[8] = cp[2];
}
m3makeNormal.__deps = [v3new, v3cross];

// src/math/principal-axes.ts
var negateVector = new Vector3(-1, -1, -1);
var tmpMatrix = new Matrix4();
var PrincipalAxes = class {
  /**
   * @param  {Matrix} points - 3 by N matrix
   */
  constructor(points) {
    const n = points.rows;
    const n3 = n / 3;
    const pointsT = new Matrix(n, 3);
    const A = new Matrix(3, 3);
    const W = new Matrix(1, 3);
    const U = new Matrix(3, 3);
    const V = new Matrix(3, 3);
    const mean = meanRows(points);
    subRows(points, mean);
    transpose(pointsT, points);
    multiplyABt(A, pointsT, pointsT);
    svd(A, W, U, V);
    const vm = new Vector3(mean[0], mean[1], mean[2]);
    const van = new Vector3(U.data[0], U.data[3], U.data[6]);
    const vbn = new Vector3(U.data[1], U.data[4], U.data[7]);
    const vcn = new Vector3(U.data[2], U.data[5], U.data[8]);
    const va = van.clone().multiplyScalar(Math.sqrt(W.data[0] / n3));
    const vb = vbn.clone().multiplyScalar(Math.sqrt(W.data[1] / n3));
    const vc = vcn.clone().multiplyScalar(Math.sqrt(W.data[2] / n3));
    this.begA = vm.clone().sub(va);
    this.endA = vm.clone().add(va);
    this.begB = vm.clone().sub(vb);
    this.endB = vm.clone().add(vb);
    this.begC = vm.clone().sub(vc);
    this.endC = vm.clone().add(vc);
    this.center = vm;
    this.vecA = va;
    this.vecB = vb;
    this.vecC = vc;
    this.normVecA = van;
    this.normVecB = vbn;
    this.normVecC = vcn;
  }
  /**
   * Get the basis matrix descriping the axes
   * @param  {Matrix4} [optionalTarget] - target object
   * @return {Matrix4} the basis
   */
  getBasisMatrix(optionalTarget = new Matrix4()) {
    const basis = optionalTarget;
    basis.makeBasis(this.normVecB, this.normVecA, this.normVecC);
    if (basis.determinant() < 0) {
      basis.scale(negateVector);
    }
    return basis;
  }
  /**
   * Get a quaternion descriping the axes rotation
   * @param  {Quaternion} [optionalTarget] - target object
   * @return {Quaternion} the rotation
   */
  getRotationQuaternion(optionalTarget = new Quaternion()) {
    const q = optionalTarget;
    q.setFromRotationMatrix(this.getBasisMatrix(tmpMatrix));
    return q.inverse();
  }
  /**
   * Get the scale/length for each dimension for a box around the axes
   * to enclose the atoms of a structure
   * @param  {Structure|StructureView} structure - the structure
   * @return {{d1a: Number, d2a: Number, d3a: Number, d1b: Number, d2b: Number, d3b: Number}} scale
   */
  getProjectedScaleForAtoms(structure) {
    let d1a = -Infinity;
    let d1b = -Infinity;
    let d2a = -Infinity;
    let d2b = -Infinity;
    let d3a = -Infinity;
    let d3b = -Infinity;
    const p = new Vector3();
    const t = new Vector3();
    const center = this.center;
    const ax1 = this.normVecA;
    const ax2 = this.normVecB;
    const ax3 = this.normVecC;
    structure.eachAtom(function(ap) {
      projectPointOnVector(p.copy(ap), ax1, center);
      const dp1 = t.subVectors(p, center).normalize().dot(ax1);
      const dt1 = p.distanceTo(center);
      if (dp1 > 0) {
        if (dt1 > d1a) d1a = dt1;
      } else {
        if (dt1 > d1b) d1b = dt1;
      }
      projectPointOnVector(p.copy(ap), ax2, center);
      const dp2 = t.subVectors(p, center).normalize().dot(ax2);
      const dt2 = p.distanceTo(center);
      if (dp2 > 0) {
        if (dt2 > d2a) d2a = dt2;
      } else {
        if (dt2 > d2b) d2b = dt2;
      }
      projectPointOnVector(p.copy(ap), ax3, center);
      const dp3 = t.subVectors(p, center).normalize().dot(ax3);
      const dt3 = p.distanceTo(center);
      if (dp3 > 0) {
        if (dt3 > d3a) d3a = dt3;
      } else {
        if (dt3 > d3b) d3b = dt3;
      }
    });
    return {
      d1a,
      d2a,
      d3a,
      d1b: -d1b,
      d2b: -d2b,
      d3b: -d3b
    };
  }
};
var principal_axes_default = PrincipalAxes;

// src/geometry/spatial-hash.ts
function createBoundingBox(positions) {
  const { x, y, z } = positions;
  const boundingBox = new Box3();
  const count = x.length;
  const { min, max } = boundingBox;
  for (let i = 0; i < count; i++) {
    min.x = Math.min(x[i], min.x);
    min.y = Math.min(y[i], min.y);
    min.z = Math.min(z[i], min.z);
    max.x = Math.max(x[i], max.x);
    max.y = Math.max(y[i], max.y);
    max.z = Math.max(z[i], max.z);
  }
  return boundingBox;
}
var SpatialHash = class {
  constructor(positions, boundingBox) {
    this.exp = 3;
    const bb = boundingBox || createBoundingBox(positions);
    this.minX = bb.min.x;
    this.minY = bb.min.y;
    this.minZ = bb.min.z;
    this.boundX = (bb.max.x - this.minX >> this.exp) + 1;
    this.boundY = (bb.max.y - this.minY >> this.exp) + 1;
    this.boundZ = (bb.max.z - this.minZ >> this.exp) + 1;
    const n = this.boundX * this.boundY * this.boundZ;
    const an = positions.count !== void 0 ? positions.count : positions.x.length;
    const xArray = positions.x;
    const yArray = positions.y;
    const zArray = positions.z;
    let count = 0;
    const grid = new Uint32Array(n);
    const bucketIndex = new Int32Array(an);
    for (let i = 0; i < an; ++i) {
      const x = xArray[i] - this.minX >> this.exp;
      const y = yArray[i] - this.minY >> this.exp;
      const z = zArray[i] - this.minZ >> this.exp;
      const idx = (x * this.boundY + y) * this.boundZ + z;
      if ((grid[idx] += 1) === 1) {
        count += 1;
      }
      bucketIndex[i] = idx;
    }
    const bucketCount = new Uint16Array(count);
    for (let i = 0, j = 0; i < n; ++i) {
      const c = grid[i];
      if (c > 0) {
        grid[i] = j + 1;
        bucketCount[j] = c;
        j += 1;
      }
    }
    const bucketOffset = new Uint32Array(count);
    for (let i = 1; i < count; ++i) {
      bucketOffset[i] += bucketOffset[i - 1] + bucketCount[i - 1];
    }
    const bucketFill = new Uint16Array(count);
    const bucketArray = new Int32Array(an);
    for (let i = 0; i < an; ++i) {
      const bucketIdx = grid[bucketIndex[i]];
      if (bucketIdx > 0) {
        const k = bucketIdx - 1;
        bucketArray[bucketOffset[k] + bucketFill[k]] = i;
        bucketFill[k] += 1;
      }
    }
    this.grid = grid;
    this.bucketCount = bucketCount;
    this.bucketOffset = bucketOffset;
    this.bucketArray = bucketArray;
    this.xArray = xArray;
    this.yArray = yArray;
    this.zArray = zArray;
  }
  within(x, y, z, r) {
    const result = [];
    this.eachWithin(x, y, z, r, (atomIndex) => result.push(atomIndex));
    return result;
  }
  eachWithin(x, y, z, r, callback) {
    const rSq = r * r;
    const loX = Math.max(0, x - r - this.minX >> this.exp);
    const loY = Math.max(0, y - r - this.minY >> this.exp);
    const loZ = Math.max(0, z - r - this.minZ >> this.exp);
    const hiX = Math.min(this.boundX, (x + r - this.minX >> this.exp) + 1);
    const hiY = Math.min(this.boundY, (y + r - this.minY >> this.exp) + 1);
    const hiZ = Math.min(this.boundZ, (z + r - this.minZ >> this.exp) + 1);
    for (let ix = loX; ix < hiX; ++ix) {
      for (let iy = loY; iy < hiY; ++iy) {
        for (let iz = loZ; iz < hiZ; ++iz) {
          const idx = (ix * this.boundY + iy) * this.boundZ + iz;
          const bucketIdx = this.grid[idx];
          if (bucketIdx > 0) {
            const k = bucketIdx - 1;
            const offset = this.bucketOffset[k];
            const count = this.bucketCount[k];
            const end = offset + count;
            for (let i = offset; i < end; ++i) {
              const atomIndex = this.bucketArray[i];
              const dx = this.xArray[atomIndex] - x;
              const dy = this.yArray[atomIndex] - y;
              const dz = this.zArray[atomIndex] - z;
              const dSq = dx * dx + dy * dy + dz * dz;
              if (dSq <= rSq) callback(atomIndex, dSq);
            }
          }
        }
      }
    }
  }
};

// scripts/contact-detector/unsupported-volume.js
var UnsupportedVolume = class {
  constructor() {
    throw new Error("Contact detection does not provide volume rendering");
  }
};

// src/math/math-utils.ts
function degToRad(deg) {
  return deg * 0.01745;
}
function radToDeg(rad) {
  return rad * 57.29578;
}
var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");
var uuid = new Array(36);

// src/chemistry/geometry.ts
function assignGeometry(totalCoordination) {
  switch (totalCoordination) {
    case 0:
      return 0 /* Spherical */;
    case 1:
      return 1 /* Terminal */;
    case 2:
      return 2 /* Linear */;
    case 3:
      return 3 /* Trigonal */;
    case 4:
      return 4 /* Tetrahedral */;
    default:
      return 8 /* Unknown */;
  }
}
var Angles = /* @__PURE__ */ new Map([
  [2 /* Linear */, degToRad(180)],
  [3 /* Trigonal */, degToRad(120)],
  [4 /* Tetrahedral */, degToRad(109.4721)],
  [6 /* Octahedral */, degToRad(90)]
]);
function calcAngles(ap1, ap2) {
  let angles = [];
  const d1 = new Vector3();
  const d2 = new Vector3();
  d1.subVectors(ap2, ap1);
  ap1.eachBondedAtom((x) => {
    if (x.number !== 1 /* H */) {
      d2.subVectors(x, ap1);
      angles.push(d1.angleTo(d2));
    }
  });
  return angles;
}
function calcPlaneAngle(ap1, ap2) {
  const x1 = ap1.clone();
  const v12 = new Vector3();
  v12.subVectors(ap2, ap1);
  const neighbours = [new Vector3(), new Vector3()];
  let ni = 0;
  ap1.eachBondedAtom((x) => {
    if (ni > 1) {
      return;
    }
    if (x.number !== 1 /* H */) {
      x1.index = x.index;
      neighbours[ni++].subVectors(x, ap1);
    }
  });
  if (ni === 1) {
    x1.eachBondedAtom((x) => {
      if (ni > 1) {
        return;
      }
      if (x.number !== 1 /* H */ && x.index !== ap1.index) {
        neighbours[ni++].subVectors(x, ap1);
      }
    });
  }
  if (ni !== 2) {
    return;
  }
  const cp = neighbours[0].cross(neighbours[1]);
  return Math.abs(Math.PI / 2 - cp.angleTo(v12));
}

// src/chemistry/valence-model.ts
function isConjugated(a) {
  const _bp = a.structure.getBondProxy();
  const atomicNumber = a.number;
  const hetero = atomicNumber === 8 /* O */ || atomicNumber === 7 /* N */;
  if (hetero && a.bondCount === 4) {
    return false;
  }
  let flag = false;
  a.eachBond((b) => {
    if (b.bondOrder > 1) {
      flag = true;
      return;
    }
    if (hetero) {
      const a2 = b.getOtherAtom(a);
      a2.eachBond((b2) => {
        if (b2.bondOrder > 1) {
          const atomicNumber2 = a2.number;
          if ((atomicNumber2 === 15 /* P */ || atomicNumber2 === 16 /* S */) && b2.getOtherAtom(a2).number === 8 /* O */) {
            return;
          }
          flag = true;
        }
      }, _bp);
    }
  });
  return flag;
}
function explicitValence(a) {
  let v = 0;
  a.eachBond((b) => v += b.bondOrder);
  return v;
}
function calculateHydrogensCharge(a, params) {
  const hydrogenCount = a.bondToElementCount(1 /* H */);
  let charge = a.formalCharge || 0;
  const assignCharge = params.assignCharge === "always" || params.assignCharge === "auto" && charge === 0;
  const assignH = params.assignH === "always" || params.assignH === "auto" && hydrogenCount === 0;
  const degree = a.bondCount;
  const valence = explicitValence(a);
  const conjugated = isConjugated(a);
  const multiBond = valence - degree > 0;
  let implicitHCount = 0;
  let geom = 8 /* Unknown */;
  switch (a.number) {
    case 1 /* H */:
      if (assignCharge) {
        if (degree === 0) {
          charge = 1;
          geom = 0 /* Spherical */;
        } else if (degree === 1) {
          charge = 0;
          geom = 1 /* Terminal */;
        }
      }
      break;
    case 6 /* C */:
      if (assignCharge) {
        charge = 0;
      }
      if (assignH) {
        implicitHCount = Math.max(0, 4 - valence - Math.abs(charge));
      }
      geom = assignGeometry(degree + implicitHCount + Math.max(0, -charge));
      break;
    case 7 /* N */:
      if (assignCharge) {
        if (!assignH) {
          charge = valence - 3;
        } else if (conjugated && valence < 4) {
          if (degree - hydrogenCount === 1 && valence - hydrogenCount === 2) {
            charge = 1;
          } else {
            charge = 0;
          }
        } else {
          let flag = false;
          a.eachBondedAtom((ba) => {
            if (ba.number === 16 /* S */ || ba.isMetal()) flag = true;
          });
          if (flag) charge = 0;
          else charge = 1;
        }
      }
      if (assignH) {
        implicitHCount = Math.max(0, 3 - valence + charge);
      }
      if (conjugated && !multiBond) {
        geom = assignGeometry(degree + implicitHCount - charge);
      } else {
        geom = assignGeometry(degree + implicitHCount + 1 - charge);
      }
      break;
    case 8 /* O */:
      if (assignCharge) {
        if (!assignH) {
          charge = valence - 2;
        }
        if (valence === 1) {
          a.eachBondedAtom((ba) => {
            ba.eachBond((b) => {
              const oa = b.getOtherAtom(ba);
              if (oa.index !== a.index && oa.number === 8 /* O */ && b.bondOrder === 2) {
                charge = -1;
              }
            });
          });
        }
      }
      if (assignH) {
        implicitHCount = Math.max(0, 2 - valence + charge);
      }
      if (conjugated && !multiBond) {
        geom = assignGeometry(degree + implicitHCount - charge + 1);
      } else {
        geom = assignGeometry(degree + implicitHCount - charge + 2);
      }
      break;
    // Only handles thiols/thiolates/thioether/sulfonium. Sulfoxides and higher
    // oxidiation states are assumed neutral S (charge carried on O if required)
    case 16 /* S */:
      if (assignCharge) {
        if (!assignH) {
          if (valence <= 3 && !a.bondToElementCount(8 /* O */)) {
            charge = valence - 2;
          } else {
            charge = 0;
          }
        }
      }
      if (assignH) {
        if (valence < 2) {
          implicitHCount = Math.max(0, 2 - valence + charge);
        }
      }
      if (valence <= 3) {
        geom = assignGeometry(degree + implicitHCount - charge + 2);
      }
      break;
    case 9 /* F */:
    case 17 /* CL */:
    case 35 /* BR */:
    case 53 /* I */:
    case 85 /* AT */:
      if (assignCharge) {
        charge = valence - 1;
      }
      break;
    case 3 /* LI */:
    case 11 /* NA */:
    case 19 /* K */:
    case 37 /* RB */:
    case 55 /* CS */:
    case 87 /* FR */:
      if (assignCharge) {
        charge = 1 - valence;
      }
      break;
    case 4 /* BE */:
    case 12 /* MG */:
    case 20 /* CA */:
    case 38 /* SR */:
    case 56 /* BA */:
    case 88 /* RA */:
      if (assignCharge) {
        charge = 2 - valence;
      }
      break;
    default:
      console.warn("Requested charge, protonation for an unhandled element", a.element);
  }
  return [charge, implicitHCount, implicitHCount + hydrogenCount, geom];
}
function ValenceModel(data, params) {
  const structure = data.structure;
  const n = structure.atomCount;
  const charge = new Int8Array(n);
  const implicitH = new Int8Array(n);
  const totalH = new Int8Array(n);
  const idealGeometry = new Int8Array(n);
  structure.eachAtom((a) => {
    const i = a.index;
    const [chg, implH, totH, geom] = calculateHydrogensCharge(a, params);
    charge[i] = chg;
    implicitH[i] = implH;
    totalH[i] = totH;
    idealGeometry[i] = geom;
  });
  return { charge, implicitH, totalH, idealGeometry };
}

// src/structure/data.ts
function createData(structure) {
  return {
    structure,
    "@spatialLookup": void 0,
    "@valenceModel": void 0
  };
}
function valenceModel(data) {
  if (data["@valenceModel"]) return data["@valenceModel"];
  const valenceModel2 = ValenceModel(data, { assignCharge: "auto", assignH: "auto" });
  data["@valenceModel"] = valenceModel2;
  return valenceModel2;
}

// src/utils/adjacency-list.ts
function createAdjacencyList(edges) {
  const { edgeCount, nodeCount, nodeArray1, nodeArray2 } = edges;
  const countArray = new Uint8Array(nodeCount);
  const offsetArray = new Int32Array(nodeCount);
  for (let i = 0; i < edgeCount; ++i) {
    countArray[nodeArray1[i]] += 1;
    countArray[nodeArray2[i]] += 1;
  }
  for (let i = 1; i < nodeCount; ++i) {
    offsetArray[i] += offsetArray[i - 1] + countArray[i - 1];
  }
  const bondCount2 = edgeCount * 2;
  const indexArray = new Int32Array(bondCount2);
  for (let j = 0; j < bondCount2; ++j) {
    indexArray[j] = -1;
  }
  for (let i = 0; i < edgeCount; ++i) {
    const idx1 = nodeArray1[i];
    const idx2 = nodeArray2[i];
    let j1 = offsetArray[idx1];
    while (indexArray[j1] !== -1 && j1 < bondCount2) {
      j1 += 1;
    }
    indexArray[j1] = i;
    let j2 = offsetArray[idx2];
    while (indexArray[j2] !== -1 && j2 < bondCount2) {
      j2 += 1;
    }
    indexArray[j2] = i;
  }
  return { countArray, offsetArray, indexArray };
}

// src/store/bond-hash.ts
var BondHash = class {
  constructor(bondStore, atomCount) {
    const al = createAdjacencyList({
      nodeArray1: bondStore.atomIndex1,
      nodeArray2: bondStore.atomIndex2,
      edgeCount: bondStore.count,
      nodeCount: atomCount
    });
    this.countArray = al.countArray;
    this.offsetArray = al.offsetArray;
    this.indexArray = al.indexArray;
  }
};
var bond_hash_default = BondHash;

// src/store/store.ts
var Store = class {
  /**
   * @param {Integer} [size] - initial size
   */
  constructor(size = 0) {
    this._fields = this._defaultFields;
    this._init(0);
  }
  /**
   * Initialize the store
   * @param  {Integer} size - size to initialize
   * @return {undefined}
   */
  _init(size) {
    this.length = size;
    this.count = 0;
    for (let i = 0, il = this._fields.length; i < il; ++i) {
      const [name, size2, type] = this._fields[i];
      this._initField(name, size2, type);
    }
  }
  /**
   * Initialize a field
   * @param  {String} name - field name
   * @param  {Integer} size - element size
   * @param  {String} type - data type, one of int8, int16, int32,
   *                         uint8, uint16, uint32, float32
   * @return {undefined}
   */
  _initField(name, size, type) {
    this[name] = getTypedArray(type, this.length * size);
  }
  /**
   * Add a field
   * @param  {String} name - field name
   * @param  {Integer} size - element size
   * @param  {String} type - data type, one of int8, int16, int32,
   *                         uint8, uint16, uint32, float32
   * @return {undefined}
   */
  addField(name, size, type) {
    this._fields.push([name, size, type]);
    this._initField(name, size, type);
  }
  /**
   * Resize the store to the new size
   * @param  {Integer} size - new size
   * @return {undefined}
   */
  resize(size) {
    this.length = Math.round(size || 0);
    this.count = Math.min(this.count, this.length);
    for (let i = 0, il = this._fields.length; i < il; ++i) {
      const name = this._fields[i][0];
      const itemSize = this._fields[i][1];
      const arraySize = this.length * itemSize;
      const tmpArray = new this[name].constructor(arraySize);
      if (this[name].length > arraySize) {
        tmpArray.set(this[name].subarray(0, arraySize));
      } else {
        tmpArray.set(this[name]);
      }
      this[name] = tmpArray;
    }
  }
  /**
   * Resize the store to 1.5 times its current size if full
   * @return {undefined}
   */
  growIfFull() {
    if (this.count >= this.length) {
      const size = Math.round(this.length * 1.5);
      this.resize(Math.max(256, size));
    }
  }
  /**
   * Copy data from one store to another
   * @param  {Store} other - store to copy from
   * @param  {Integer} thisOffset - offset to start copying to
   * @param  {Integer} otherOffset - offset to start copying from
   * @param  {Integer} length - number of entries to copy
   * @return {undefined}
   */
  copyFrom(other, thisOffset, otherOffset, length) {
    for (let i = 0, il = this._fields.length; i < il; ++i) {
      const name = this._fields[i][0];
      const itemSize = this._fields[i][1];
      const thisField = this[name];
      const otherField = other[name];
      for (let j = 0; j < length; ++j) {
        const thisIndex = itemSize * (thisOffset + j);
        const otherIndex = itemSize * (otherOffset + j);
        for (let k = 0; k < itemSize; ++k) {
          thisField[thisIndex + k] = otherField[otherIndex + k];
        }
      }
    }
  }
  /**
   * Copy data within this store
   * @param  {Integer} thisOffset - offset to start copying to
   * @param  {Integer} otherOffset - offset to start copying from
   * @param  {Integer} length - number of entries to copy
   * @return {undefined}
   */
  copyWithin(offsetTarget, offsetSource, length) {
    for (let i = 0, il = this._fields.length; i < il; ++i) {
      const name = this._fields[i][0];
      const itemSize = this._fields[i][1];
      const thisField = this[name];
      for (let j = 0; j < length; ++j) {
        const targetIndex = itemSize * (offsetTarget + j);
        const sourceIndex = itemSize * (offsetSource + j);
        for (let k = 0; k < itemSize; ++k) {
          thisField[targetIndex + k] = thisField[sourceIndex + k];
        }
      }
    }
  }
  /**
   * Sort entries in the store given the compare function
   * @param  {[type]} compareFunction - function to sort by
   * @return {undefined}
   */
  sort(compareFunction) {
    Log.time("Store.sort");
    const thisStore = this;
    const tmpStore = new this.constructor(1);
    function swap3(index1, index2) {
      if (index1 === index2) return;
      tmpStore.copyFrom(thisStore, 0, index1, 1);
      thisStore.copyWithin(index1, index2, 1);
      thisStore.copyFrom(tmpStore, index2, 0, 1);
    }
    function quicksort(left, right) {
      if (left < right) {
        let pivot = Math.floor((left + right) / 2);
        let leftNew = left;
        let rightNew = right;
        do {
          while (compareFunction(leftNew, pivot) < 0) {
            leftNew += 1;
          }
          while (compareFunction(rightNew, pivot) > 0) {
            rightNew -= 1;
          }
          if (leftNew <= rightNew) {
            if (leftNew === pivot) {
              pivot = rightNew;
            } else if (rightNew === pivot) {
              pivot = leftNew;
            }
            swap3(leftNew, rightNew);
            leftNew += 1;
            rightNew -= 1;
          }
        } while (leftNew <= rightNew);
        quicksort(left, rightNew);
        quicksort(leftNew, right);
      }
    }
    quicksort(0, this.count - 1);
    Log.timeEnd("Store.sort");
  }
  /**
   * Empty the store
   * @return {undefined}
   */
  clear() {
    this.count = 0;
  }
  /**
   * Dispose of the store entries and fields
   * @return {undefined}
   */
  dispose() {
    delete this.length;
    delete this.count;
    for (let i = 0, il = this._fields.length; i < il; ++i) {
      const name = this._fields[i][0];
      delete this[name];
    }
  }
};

// src/store/bond-store.ts
var BondStore = class extends Store {
  get _defaultFields() {
    return [
      ["atomIndex1", 1, "int32"],
      ["atomIndex2", 1, "int32"],
      ["bondOrder", 1, "int8"]
    ];
  }
  addBond(atom1, atom2, bondOrder) {
    this.growIfFull();
    const i = this.count;
    const ai1 = atom1.index;
    const ai2 = atom2.index;
    if (ai1 < ai2) {
      this.atomIndex1[i] = ai1;
      this.atomIndex2[i] = ai2;
    } else {
      this.atomIndex2[i] = ai1;
      this.atomIndex1[i] = ai2;
    }
    if (bondOrder) this.bondOrder[i] = bondOrder;
    this.count += 1;
  }
  addBondIfConnected(atom1, atom2, bondOrder) {
    if (atom1.connectedTo(atom2)) {
      this.addBond(atom1, atom2, bondOrder);
      return true;
    }
    return false;
  }
};

// src/store/atom-store.ts
var AtomStore = class extends Store {
  get _defaultFields() {
    return [
      ["residueIndex", 1, "uint32"],
      ["atomTypeId", 1, "uint16"],
      ["x", 1, "float32"],
      ["y", 1, "float32"],
      ["z", 1, "float32"],
      ["serial", 1, "int32"],
      ["bfactor", 1, "float32"],
      ["altloc", 1, "uint8"],
      ["occupancy", 1, "float32"]
    ];
  }
  setAltloc(i, str) {
    this.altloc[i] = str.charCodeAt(0);
  }
  getAltloc(i) {
    const code = this.altloc[i];
    return code ? String.fromCharCode(code) : "";
  }
};

// src/store/residue-store.ts
var ResidueStore = class extends Store {
  get _defaultFields() {
    return [
      ["chainIndex", 1, "uint32"],
      ["atomOffset", 1, "uint32"],
      ["atomCount", 1, "uint16"],
      ["residueTypeId", 1, "uint16"],
      ["resno", 1, "int32"],
      ["sstruc", 1, "uint8"],
      ["inscode", 1, "uint8"]
    ];
  }
  setSstruc(i, str) {
    this.sstruc[i] = str.charCodeAt(0);
  }
  getSstruc(i) {
    const code = this.sstruc[i];
    return code ? String.fromCharCode(code) : "";
  }
  setInscode(i, str) {
    this.inscode[i] = str.charCodeAt(0);
  }
  getInscode(i) {
    const code = this.inscode[i];
    return code ? String.fromCharCode(code) : "";
  }
};

// src/store/chain-store.ts
var ChainStore = class extends Store {
  get _defaultFields() {
    return [
      ["entityIndex", 1, "uint16"],
      ["modelIndex", 1, "uint16"],
      ["residueOffset", 1, "uint32"],
      ["residueCount", 1, "uint32"],
      ["chainname", 4, "uint8"],
      ["chainid", 4, "uint8"]
    ];
  }
  setChainname(i, str) {
    const j = 4 * i;
    this.chainname[j] = str.charCodeAt(0);
    this.chainname[j + 1] = str.charCodeAt(1);
    this.chainname[j + 2] = str.charCodeAt(2);
    this.chainname[j + 3] = str.charCodeAt(3);
  }
  getChainname(i) {
    let chainname = "";
    for (let k = 0; k < 4; ++k) {
      const code = this.chainname[4 * i + k];
      if (code) {
        chainname += String.fromCharCode(code);
      } else {
        break;
      }
    }
    return chainname;
  }
  setChainid(i, str) {
    const j = 4 * i;
    this.chainid[j] = str.charCodeAt(0);
    this.chainid[j + 1] = str.charCodeAt(1);
    this.chainid[j + 2] = str.charCodeAt(2);
    this.chainid[j + 3] = str.charCodeAt(3);
  }
  getChainid(i) {
    let chainid = "";
    for (let k = 0; k < 4; ++k) {
      const code = this.chainid[4 * i + k];
      if (code) {
        chainid += String.fromCharCode(code);
      } else {
        break;
      }
    }
    return chainid;
  }
};

// src/store/model-store.ts
var ModelStore = class extends Store {
  get _defaultFields() {
    return [
      ["chainOffset", 1, "uint32"],
      ["chainCount", 1, "uint32"]
    ];
  }
};

// src/geometry/helixorient.ts
var Helixorient = class {
  constructor(polymer) {
    this.polymer = polymer;
    this.size = polymer.residueCount;
  }
  getCenterIterator(smooth = 0) {
    const center = this.getPosition().center;
    const size = center.length / 3;
    let i = 0;
    let j = -1;
    const cache = [
      new Vector3(),
      new Vector3(),
      new Vector3(),
      new Vector3()
    ];
    function next() {
      const vector = this.get(j);
      j += 1;
      return vector;
    }
    function get(idx) {
      idx = Math.min(size - 1, Math.max(0, idx));
      const v = cache[i % 4];
      const idx3 = 3 * idx;
      v.fromArray(center, idx3);
      if (smooth) {
        const w = Math.min(smooth, idx, size - idx - 1);
        for (let k = 1; k <= w; ++k) {
          const l = k * 3;
          const t = (w + 1 - k) / (w + 1);
          v.x += t * center[idx3 - l + 0] + t * center[idx3 + l + 0];
          v.y += t * center[idx3 - l + 1] + t * center[idx3 + l + 1];
          v.z += t * center[idx3 - l + 2] + t * center[idx3 + l + 2];
        }
        v.x /= w + 1;
        v.y /= w + 1;
        v.z /= w + 1;
      }
      i += 1;
      return v;
    }
    function reset() {
      i = 0;
      j = -1;
    }
    return { size, next, get, reset };
  }
  getColor(params) {
    const polymer = this.polymer;
    const structure = polymer.structure;
    const n = polymer.residueCount;
    const residueIndexStart = polymer.residueIndexStart;
    const col = new Float32Array(n * 3);
    const p = params || {};
    p.structure = structure;
    const colormaker = ColormakerRegistry.getScheme(p);
    const rp = structure.getResidueProxy();
    const ap = structure.getAtomProxy();
    for (let i = 0; i < n; ++i) {
      rp.index = residueIndexStart + i;
      ap.index = rp.traceAtomIndex;
      colormaker.atomColorToArray(ap, col, i * 3);
    }
    return {
      "color": col
    };
  }
  getPicking() {
    const polymer = this.polymer;
    const structure = polymer.structure;
    const n = polymer.residueCount;
    const residueIndexStart = polymer.residueIndexStart;
    const pick = new Float32Array(n);
    const rp = structure.getResidueProxy();
    for (let i = 0; i < n; ++i) {
      rp.index = residueIndexStart + i;
      pick[i] = rp.traceAtomIndex;
    }
    return {
      "picking": new AtomPicker(pick, structure)
    };
  }
  getSize(params) {
    const polymer = this.polymer;
    const structure = polymer.structure;
    const n = polymer.residueCount;
    const residueIndexStart = polymer.residueIndexStart;
    const size = new Float32Array(n);
    const radiusFactory = new radius_factory_default(params);
    const rp = structure.getResidueProxy();
    const ap = structure.getAtomProxy();
    for (let i = 0; i < n; ++i) {
      rp.index = residueIndexStart + i;
      ap.index = rp.traceAtomIndex;
      size[i] = radiusFactory.atomRadius(ap);
    }
    return { size };
  }
  getPosition() {
    const polymer = this.polymer;
    const structure = polymer.structure;
    const n = polymer.residueCount;
    const n3 = n - 3;
    const center = new Float32Array(3 * n);
    const axis = new Float32Array(3 * n);
    const diff = new Float32Array(n);
    const radius = new Float32Array(n);
    const rise = new Float32Array(n);
    const twist = new Float32Array(n);
    const resdir = new Float32Array(3 * n);
    const r12 = new Vector3();
    const r23 = new Vector3();
    const r34 = new Vector3();
    const diff13 = new Vector3();
    const diff24 = new Vector3();
    const v1 = new Vector3();
    const v2 = new Vector3();
    const vt = new Vector3();
    const _axis = new Vector3();
    const _prevAxis = new Vector3();
    const _resdir = new Vector3();
    const _center = new Vector3(0, 0, 0);
    const type = "trace";
    const a1 = structure.getAtomProxy();
    const a2 = structure.getAtomProxy(polymer.getAtomIndexByType(0, type));
    const a3 = structure.getAtomProxy(polymer.getAtomIndexByType(1, type));
    const a4 = structure.getAtomProxy(polymer.getAtomIndexByType(2, type));
    for (let i = 0; i < n3; ++i) {
      a1.index = a2.index;
      a2.index = a3.index;
      a3.index = a4.index;
      a4.index = polymer.getAtomIndexByType(i + 3, type);
      const j = 3 * i;
      r12.subVectors(a2, a1);
      r23.subVectors(a3, a2);
      r34.subVectors(a4, a3);
      diff13.subVectors(r12, r23);
      diff24.subVectors(r23, r34);
      _axis.crossVectors(diff13, diff24).normalize();
      _axis.toArray(axis, j);
      if (i > 0) {
        diff[i] = _axis.angleTo(_prevAxis);
      }
      const tmp = Math.cos(diff13.angleTo(diff24));
      twist[i] = 180 / Math.PI * Math.acos(tmp);
      const diff13Length = diff13.length();
      const diff24Length = diff24.length();
      radius[i] = Math.sqrt(diff24Length * diff13Length) / // clamp, to avoid instabilities for when
      // angle between diff13 and diff24 is near 0
      Math.max(2, 2 * (1 - tmp));
      rise[i] = Math.abs(r23.dot(_axis));
      v1.copy(diff13).multiplyScalar(radius[i] / diff13Length);
      v2.copy(diff24).multiplyScalar(radius[i] / diff24Length);
      v1.subVectors(a2, v1);
      v2.subVectors(a3, v2);
      v1.toArray(center, j + 3);
      v2.toArray(center, j + 6);
      _resdir.subVectors(a1, _center);
      _resdir.toArray(resdir, j);
      _prevAxis.copy(_axis);
      _center.copy(v1);
    }
    v1.fromArray(center, 3);
    v2.fromArray(center, 6);
    _axis.subVectors(v1, v2).normalize();
    a1.index = polymer.getAtomIndexByType(0, type);
    _center.copy(a1);
    vt.copy(a1);
    projectPointOnVector(vt, _axis, v1);
    vt.toArray(center, 0);
    _resdir.subVectors(_center, v1);
    _resdir.toArray(resdir, 0);
    v1.fromArray(center, 3 * n - 6);
    v2.fromArray(center, 3 * n - 9);
    _axis.subVectors(v1, v2).normalize();
    a1.index = polymer.getAtomIndexByType(n - 1, type);
    _center.copy(a1);
    vt.copy(a1);
    projectPointOnVector(vt, _axis, v1);
    vt.toArray(center, 3 * n - 3);
    for (let i = n - 3; i < n; ++i) {
      v1.fromArray(center, 3 * i);
      a1.index = polymer.getAtomIndexByType(i, type);
      _center.copy(a1);
      _resdir.subVectors(_center, v1);
      _resdir.toArray(resdir, 3 * i);
    }
    const resRadius = new Float32Array(n);
    const resTwist = new Float32Array(n);
    const resRise = new Float32Array(n);
    const resBending = new Float32Array(n);
    resRadius[1] = radius[0];
    resTwist[1] = twist[0];
    resRise[1] = radius[0];
    for (let i = 2; i < n - 2; ++i) {
      resRadius[i] = 0.5 * (radius[i - 2] + radius[i - 1]);
      resTwist[i] = 0.5 * (twist[i - 2] + twist[i - 1]);
      resRise[i] = 0.5 * (rise[i - 2] + rise[i - 1]);
      v1.fromArray(axis, 3 * (i - 2));
      v2.fromArray(axis, 3 * (i - 1));
      resBending[i] = 180 / Math.PI * Math.acos(Math.cos(v1.angleTo(v2)));
    }
    resRadius[n - 2] = radius[n - 4];
    resTwist[n - 2] = twist[n - 4];
    resRise[n - 2] = rise[n - 4];
    const resAxis = new Float32Array(3 * n);
    copyArray(axis, resAxis, 0, 0, 3);
    copyArray(axis, resAxis, 0, 3, 3);
    for (let i = 2; i < n - 2; ++i) {
      v1.fromArray(axis, 3 * (i - 2));
      v2.fromArray(axis, 3 * (i - 1));
      _axis.addVectors(v2, v1).multiplyScalar(0.5).normalize();
      _axis.toArray(resAxis, 3 * i);
    }
    copyArray(axis, resAxis, 3 * n - 12, 3 * n - 6, 3);
    copyArray(axis, resAxis, 3 * n - 12, 3 * n - 3, 3);
    return {
      center,
      axis: resAxis,
      bending: resBending,
      radius: resRadius,
      rise: resRise,
      twist: resTwist,
      resdir
    };
  }
};
var helixorient_default = Helixorient;

// src/geometry/helixbundle.ts
var Helixbundle = class {
  constructor(polymer) {
    this.polymer = polymer;
    this.helixorient = new helixorient_default(polymer);
    this.position = this.helixorient.getPosition();
  }
  getAxis(localAngle, centerDist, ssBorder, colorParams, radiusParams) {
    localAngle = localAngle || 30;
    centerDist = centerDist || 2.5;
    ssBorder = ssBorder === void 0 ? false : ssBorder;
    const polymer = this.polymer;
    const structure = polymer.structure;
    const n = polymer.residueCount;
    const residueIndexStart = polymer.residueIndexStart;
    const pos = this.position;
    const cp = colorParams || {};
    cp.structure = structure;
    const colormaker = ColormakerRegistry.getScheme(cp);
    const radiusFactory = new radius_factory_default(radiusParams);
    let j = 0;
    let k = 0;
    const axis = [];
    const center = [];
    const beg = [];
    const end = [];
    const col = [];
    const pick = [];
    const size = [];
    const residueOffset = [];
    const residueCount = [];
    let tmpAxis = new Float32Array(n * 3);
    let tmpCenter = new Float32Array(n * 3);
    let _axis, _center;
    const _beg = new Vector3();
    const _end = new Vector3();
    const rp1 = structure.getResidueProxy();
    const rp2 = structure.getResidueProxy();
    const ap = structure.getAtomProxy();
    const c1 = new Vector3();
    const c2 = new Vector3();
    let split = false;
    for (let i = 0; i < n; ++i) {
      rp1.index = residueIndexStart + i;
      c1.fromArray(pos.center, i * 3);
      if (i === n - 1) {
        split = true;
      } else {
        rp2.index = residueIndexStart + i + 1;
        c2.fromArray(pos.center, i * 3 + 3);
        if (ssBorder && rp1.sstruc !== rp2.sstruc) {
          split = true;
        } else if (c1.distanceTo(c2) > centerDist) {
          split = true;
        } else if (pos.bending[i] > localAngle) {
          split = true;
        }
      }
      if (split) {
        if (i - j < 4) {
          j = i;
          split = false;
          continue;
        }
        ap.index = rp1.traceAtomIndex;
        tmpAxis = pos.axis.subarray(j * 3 + 3, i * 3);
        tmpCenter = pos.center.subarray(j * 3, i * 3 + 3);
        _axis = calculateMeanVector3(tmpAxis).normalize();
        _center = calculateMeanVector3(tmpCenter);
        _beg.fromArray(tmpCenter);
        projectPointOnVector(_beg, _axis, _center);
        _end.fromArray(tmpCenter, tmpCenter.length - 3);
        projectPointOnVector(_end, _axis, _center);
        _axis.subVectors(_end, _beg);
        _axis.toArray(axis, k);
        _center.toArray(center, k);
        _beg.toArray(beg, k);
        _end.toArray(end, k);
        colormaker.atomColorToArray(ap, col, k);
        pick.push(ap.index);
        size.push(radiusFactory.atomRadius(ap));
        residueOffset.push(residueIndexStart + j);
        residueCount.push(residueIndexStart + i + 1 - j);
        k += 3;
        j = i;
        split = false;
      }
    }
    const picking = new Float32Array(pick);
    return {
      axis: new Float32Array(axis),
      center: new Float32Array(center),
      begin: new Float32Array(beg),
      end: new Float32Array(end),
      color: new Float32Array(col),
      picking: new AtomPicker(picking, structure),
      size: new Float32Array(size),
      residueOffset,
      residueCount
    };
  }
};
var helixbundle_default = Helixbundle;

// src/utils/binary-heap.ts
var BinaryHeap = class {
  constructor(scoreFunction) {
    this.scoreFunction = scoreFunction;
    this.content = [];
    this.scoreFunction = scoreFunction;
  }
  push(element) {
    this.content.push(element);
    this.bubbleUp(this.content.length - 1);
  }
  pop() {
    const result = this.content[0];
    const end = this.content.pop();
    if (end && this.content.length > 0) {
      this.content[0] = end;
      this.sinkDown(0);
    }
    return result;
  }
  peek() {
    return this.content[0];
  }
  remove(element) {
    const len = this.content.length;
    for (let i = 0; i < len; i++) {
      if (this.content[i] === element) {
        const end = this.content.pop();
        if (end && i !== len - 1) {
          this.content[i] = end;
          if (this.scoreFunction(end) < this.scoreFunction(element)) {
            this.bubbleUp(i);
          } else {
            this.sinkDown(i);
          }
        }
        return;
      }
    }
    throw new Error("Node not found.");
  }
  size() {
    return this.content.length;
  }
  bubbleUp(n) {
    const element = this.content[n];
    while (n > 0) {
      const parentN = Math.floor((n + 1) / 2) - 1;
      const parent = this.content[parentN];
      if (this.scoreFunction(element) < this.scoreFunction(parent)) {
        this.content[parentN] = element;
        this.content[n] = parent;
        n = parentN;
      } else {
        break;
      }
    }
  }
  sinkDown(n) {
    const length = this.content.length;
    const element = this.content[n];
    const elemScore = this.scoreFunction(element);
    let child1Score = 0;
    let child2Score = 0;
    while (true) {
      const child2N = (n + 1) * 2;
      const child1N = child2N - 1;
      let swap3 = null;
      if (child1N < length) {
        const child1 = this.content[child1N];
        child1Score = this.scoreFunction(child1);
        if (child1Score < elemScore) swap3 = child1N;
      }
      if (child2N < length) {
        const child2 = this.content[child2N];
        child2Score = this.scoreFunction(child2);
        if (child2Score < (swap3 === null ? elemScore : child1Score)) swap3 = child2N;
      }
      if (swap3 !== null) {
        this.content[n] = this.content[swap3];
        this.content[swap3] = element;
        n = swap3;
      } else {
        break;
      }
    }
  }
};
var binary_heap_default = BinaryHeap;

// src/utils/kdtree.ts
/**
 * Kdtree
 * @class
 * @author Alexander Rose <alexander.rose@weirdbyte.de>, 2016
 * @author Roman Bolzern <roman.bolzern@fhnw.ch>, 2013
 * @author I4DS http://www.fhnw.ch/i4ds, 2013
 * @license MIT License <http://www.opensource.org/licenses/mit-license.php>
 * @description
 * k-d Tree for typed arrays of 3d points (e.g. for Float32Array), in-place
 * provides fast nearest neighbour search
 *
 * Based on https://github.com/ubilabs/kd-tree-javascript by Ubilabs
 *
 * Further information (including mathematical properties)
 * http://en.wikipedia.org/wiki/Binary_tree
 * http://en.wikipedia.org/wiki/K-d_tree
 *
 * @example
 * points: [x, y, z, x, y, z, x, y, z, ...]
 * metric: function(a, b){
 *    return Math.pow(a[0]-b[0], 2) + Math.pow(a[1]-b[1], 2) + Math.pow(a[2]-b[2], 2);
 * }
 *
 * @param {Float32Array} points - points
 * @param {Function} metric - metric
 */
var Kdtree = class {
  constructor(points, metric) {
    this.points = points;
    this.metric = metric;
    this.maxDepth = 0;
    this.currentNode = 0;
    const n = points.length / 3;
    const indices = new Uint32Array(n);
    for (let i = 0; i < n; ++i) {
      indices[i] = i;
    }
    this.indices = indices;
    this.nodes = new Int32Array(n * 4);
    this.rootIndex = this.buildTree(0, -1, 0, n);
  }
  buildTree(depth, parent, arrBegin, arrEnd) {
    if (depth > this.maxDepth) this.maxDepth = depth;
    const plength = arrEnd - arrBegin;
    if (plength === 0) {
      return -1;
    }
    const nodeIndex = this.currentNode * 4;
    const nodes = this.nodes;
    this.currentNode += 1;
    if (plength === 1) {
      nodes[nodeIndex] = arrBegin;
      nodes[nodeIndex + 1] = -1;
      nodes[nodeIndex + 2] = -1;
      nodes[nodeIndex + 3] = parent;
      return nodeIndex;
    }
    const indices = this.indices;
    const points = this.points;
    const arrMedian = arrBegin + Math.floor(plength / 2);
    const currentDim = depth % 3;
    let j, tmp, pivotIndex, pivotValue, storeIndex;
    let left = arrBegin;
    let right = arrEnd - 1;
    while (right > left) {
      pivotIndex = left + right >> 1;
      pivotValue = points[indices[pivotIndex] * 3 + currentDim];
      tmp = indices[pivotIndex];
      indices[pivotIndex] = indices[right];
      indices[right] = tmp;
      storeIndex = left;
      for (j = left; j < right; ++j) {
        if (points[indices[j] * 3 + currentDim] < pivotValue) {
          tmp = indices[storeIndex];
          indices[storeIndex] = indices[j];
          indices[j] = tmp;
          ++storeIndex;
        }
      }
      tmp = indices[right];
      indices[right] = indices[storeIndex];
      indices[storeIndex] = tmp;
      pivotIndex = storeIndex;
      if (arrMedian === pivotIndex) {
        break;
      } else if (arrMedian < pivotIndex) {
        right = pivotIndex - 1;
      } else {
        left = pivotIndex + 1;
      }
    }
    nodes[nodeIndex] = arrMedian;
    nodes[nodeIndex + 1] = this.buildTree(depth + 1, nodeIndex, arrBegin, arrMedian);
    nodes[nodeIndex + 2] = this.buildTree(depth + 1, nodeIndex, arrMedian + 1, arrEnd);
    nodes[nodeIndex + 3] = parent;
    return nodeIndex;
  }
  getNodeDepth(nodeIndex) {
    const parentIndex = this.nodes[nodeIndex + 3];
    return parentIndex === -1 ? 0 : this.getNodeDepth(parentIndex) + 1;
  }
  // TODO
  // function getNodePos (node) {}
  /**
   * find nearest points
   * @param {Array} point - array of size 3
   * @param {Integer} maxNodes - max amount of nodes to return
   * @param {Float} maxDistance - maximum distance of point to result nodes
   * @return {Array} array of point, distance pairs
   */
  nearest(point, maxNodes, maxDistance) {
    const bestNodes = new binary_heap_default((e) => -e[1]);
    const nodes = this.nodes;
    const points = this.points;
    const indices = this.indices;
    const nearestSearch = (nodeIndex) => {
      let bestChild, otherChild;
      const dimension = this.getNodeDepth(nodeIndex) % 3;
      const pointIndex = indices[nodes[nodeIndex]] * 3;
      const ownPoint = [
        points[pointIndex + 0],
        points[pointIndex + 1],
        points[pointIndex + 2]
      ];
      const ownDistance = this.metric(point, ownPoint);
      function saveNode(nodeIndex2, distance) {
        bestNodes.push([nodeIndex2, distance]);
        if (bestNodes.size() > maxNodes) {
          bestNodes.pop();
        }
      }
      const leftIndex = nodes[nodeIndex + 1];
      const rightIndex = nodes[nodeIndex + 2];
      if (rightIndex === -1 && leftIndex === -1) {
        if ((bestNodes.size() < maxNodes || ownDistance < bestNodes.peek()[1]) && ownDistance <= maxDistance) {
          saveNode(nodeIndex, ownDistance);
        }
        return;
      }
      if (rightIndex === -1) {
        bestChild = leftIndex;
      } else if (leftIndex === -1) {
        bestChild = rightIndex;
      } else {
        if (point[dimension] <= points[pointIndex + dimension]) {
          bestChild = leftIndex;
        } else {
          bestChild = rightIndex;
        }
      }
      nearestSearch(bestChild);
      if ((bestNodes.size() < maxNodes || ownDistance < bestNodes.peek()[1]) && ownDistance <= maxDistance) {
        saveNode(nodeIndex, ownDistance);
      }
      const linearPoint = [];
      for (let i = 0; i < 3; i += 1) {
        if (i === dimension) {
          linearPoint[i] = point[i];
        } else {
          linearPoint[i] = points[pointIndex + i];
        }
      }
      const linearDistance = this.metric(linearPoint, ownPoint);
      if ((bestNodes.size() < maxNodes || Math.abs(linearDistance) < bestNodes.peek()[1]) && Math.abs(linearDistance) <= maxDistance) {
        if (bestChild === leftIndex) {
          otherChild = rightIndex;
        } else {
          otherChild = leftIndex;
        }
        if (otherChild !== -1) {
          nearestSearch(otherChild);
        }
      }
    };
    nearestSearch(this.rootIndex);
    const result = [];
    for (let i = 0, il = Math.min(bestNodes.size(), maxNodes); i < il; i += 1) {
      result.push(bestNodes.content[i]);
    }
    return result;
  }
  verify(nodeIndex, depth = 0) {
    let count = 1;
    if (nodeIndex === void 0) {
      nodeIndex = this.rootIndex;
    }
    if (nodeIndex === -1) {
      throw new Error("node is null");
    }
    const dim = depth % 3;
    const nodes = this.nodes;
    const points = this.points;
    const indices = this.indices;
    const leftIndex = nodes[nodeIndex + 1];
    const rightIndex = nodes[nodeIndex + 2];
    if (leftIndex !== -1) {
      if (points[indices[nodes[leftIndex]] * 3 + dim] > points[indices[nodes[nodeIndex]] * 3 + dim]) {
        throw new Error("left child is > parent!");
      }
      count += this.verify(leftIndex, depth + 1);
    }
    if (rightIndex !== -1) {
      if (points[indices[nodes[rightIndex]] * 3 + dim] < points[indices[nodes[nodeIndex]] * 3 + dim]) {
        throw new Error("right child is < parent!");
      }
      count += this.verify(rightIndex, depth + 1);
    }
    return count;
  }
};
var kdtree_default = Kdtree;

// src/proxy/atom-proxy.ts
var AtomProxy = class _AtomProxy {
  /**
   * @param {Structure} structure - the structure
   * @param {Integer} index - the index
   */
  constructor(structure, index = 0) {
    this.structure = structure;
    this.index = index;
    this.chainStore = structure.chainStore;
    this.residueStore = structure.residueStore;
    this.atomStore = structure.atomStore;
    this.residueMap = structure.residueMap;
    this.atomMap = structure.atomMap;
  }
  /**
   * @type {BondHash}
   */
  get bondHash() {
    return this.structure.bondHash;
  }
  /**
   * Molecular enity
   * @type {Entity}
   */
  get entity() {
    return this.structure.entityList[this.entityIndex];
  }
  get entityIndex() {
    return this.chainStore.entityIndex[this.chainIndex];
  }
  get modelIndex() {
    return this.chainStore.modelIndex[this.chainIndex];
  }
  get chainIndex() {
    return this.residueStore.chainIndex[this.residueIndex];
  }
  /**
   * @type {ResidueProxy}
   */
  get residue() {
    console.warn("residue - might be expensive");
    return this.structure.getResidueProxy(this.residueIndex);
  }
  get residueIndex() {
    return this.atomStore.residueIndex[this.index];
  }
  set residueIndex(value) {
    this.atomStore.residueIndex[this.index] = value;
  }
  //
  /**
   * Secondary structure code
   * @type {String}
   */
  get sstruc() {
    return this.residueStore.getSstruc(this.residueIndex);
  }
  /**
   * Insertion code
   * @type {String}
   */
  get inscode() {
    return this.residueStore.getInscode(this.residueIndex);
  }
  /**
   * Residue number/label
   * @type {Integer}
   */
  get resno() {
    return this.residueStore.resno[this.residueIndex];
  }
  /**
   * Chain name
   * @type {String}
   */
  get chainname() {
    return this.chainStore.getChainname(this.chainIndex);
  }
  /**
   * Chain id
   * @type {String}
   */
  get chainid() {
    return this.chainStore.getChainid(this.chainIndex);
  }
  //
  /**
   * @type {ResidueType}
   */
  get residueType() {
    return this.residueMap.get(this.residueStore.residueTypeId[this.residueIndex]);
  }
  /**
   * @type {AtomType}
   */
  get atomType() {
    return this.atomMap.get(this.atomStore.atomTypeId[this.index]);
  }
  get residueAtomOffset() {
    return this.residueStore.atomOffset[this.residueIndex];
  }
  //
  /**
   * Residue name
   */
  get resname() {
    return this.residueType.resname;
  }
  /**
   * Hetero flag
   */
  get hetero() {
    return this.residueType.hetero;
  }
  //
  /**
   * Atom name
   */
  get atomname() {
    return this.atomType.atomname;
  }
  /**
   * Atomic number
   */
  get number() {
    return this.atomType.number;
  }
  /**
   * Element
   */
  get element() {
    return this.atomType.element;
  }
  /**
   * Van-der-Waals radius
   */
  get vdw() {
    return this.atomType.vdw;
  }
  /**
   * Covalent radius
   */
  get covalent() {
    return this.atomType.covalent;
  }
  //
  /**
   * X coordinate
   */
  get x() {
    return this.atomStore.x[this.index];
  }
  set x(value) {
    this.atomStore.x[this.index] = value;
  }
  /**
   * Y coordinate
   */
  get y() {
    return this.atomStore.y[this.index];
  }
  set y(value) {
    this.atomStore.y[this.index] = value;
  }
  /**
   * Z coordinate
   */
  get z() {
    return this.atomStore.z[this.index];
  }
  set z(value) {
    this.atomStore.z[this.index] = value;
  }
  /**
   * Serial number
   */
  get serial() {
    return this.atomStore.serial[this.index];
  }
  set serial(value) {
    this.atomStore.serial[this.index] = value;
  }
  /**
   * B-factor value
   */
  get bfactor() {
    return this.atomStore.bfactor[this.index];
  }
  set bfactor(value) {
    this.atomStore.bfactor[this.index] = value;
  }
  /**
   * Occupancy value
   */
  get occupancy() {
    return this.atomStore.occupancy[this.index];
  }
  set occupancy(value) {
    this.atomStore.occupancy[this.index] = value;
  }
  /**
   * Alternate location identifier
   */
  get altloc() {
    return this.atomStore.getAltloc(this.index);
  }
  set altloc(value) {
    this.atomStore.setAltloc(this.index, value);
  }
  /**
   * Partial charge
   */
  get partialCharge() {
    return this.atomStore.partialCharge ? this.atomStore.partialCharge[this.index] : null;
  }
  set partialCharge(value) {
    if (this.atomStore.partialCharge) {
      this.atomStore.partialCharge[this.index] = value;
    }
  }
  /**
   * Explicit radius
   */
  get radius() {
    return this.atomStore.radius ? this.atomStore.radius[this.index] : null;
  }
  set radius(value) {
    if (this.atomStore.radius) {
      this.atomStore.radius[this.index] = value;
    }
  }
  /**
   * Formal charge
   */
  get formalCharge() {
    return this.atomStore.formalCharge ? this.atomStore.formalCharge[this.index] : null;
  }
  set formalCharge(value) {
    if (this.atomStore.formalCharge) {
      this.atomStore.formalCharge[this.index] = value;
    }
  }
  /**
   * Aromaticity flag
   */
  get aromatic() {
    if (this.atomStore.aromatic) {
      return this.atomStore.aromatic[this.index];
    } else {
      return this.residueType.isAromatic(this) ? 1 : 0;
    }
  }
  set aromatic(value) {
    if (this.atomStore.aromatic) {
      this.atomStore.aromatic[this.index] = value;
    }
  }
  //
  get bondCount() {
    return this.bondHash.countArray[this.index];
  }
  //
  /**
   * Iterate over each bond
   * @param  {function(bond: BondProxy)} callback - iterator callback function
   * @param  {BondProxy} [bp] - optional target bond proxy for use in the callback
   * @return {undefined}
   */
  eachBond(callback, bp) {
    bp = bp || this.structure._bp;
    const idx = this.index;
    const bondHash = this.bondHash;
    const indexArray = bondHash.indexArray;
    const n = bondHash.countArray[idx];
    const offset = bondHash.offsetArray[idx];
    for (let i = 0; i < n; ++i) {
      bp.index = indexArray[offset + i];
      callback(bp);
    }
  }
  /**
   * Iterate over each bonded atom
   * @param  {function(atom: AtomProxy)} callback - iterator callback function
   * @param  {AtomProxy} [ap] - optional target atom proxy for use in the callback
   * @return {undefined}
   */
  eachBondedAtom(callback, _ap) {
    const ap = _ap ? _ap : this.structure._ap;
    const idx = this.index;
    this.eachBond(function(bp) {
      ap.index = idx !== bp.atomIndex1 ? bp.atomIndex1 : bp.atomIndex2;
      callback(ap);
    });
    this.index = idx;
  }
  /**
   * Check if this atom is bonded to the given atom,
   * assumes both atoms are from the same structure
   * @param  {AtomProxy} ap - the given atom
   * @return {Boolean} whether a bond exists or not
   */
  hasBondTo(ap) {
    let flag = false;
    this.eachBondedAtom(function(bap) {
      if (ap.index === bap.index) flag = true;
    });
    return flag;
  }
  bondToElementCount(element) {
    let count = 0;
    const idx = this.index;
    this.eachBondedAtom(function(bap) {
      if (bap.number === element) count += 1;
    });
    this.index = idx;
    return count;
  }
  hasBondToElement(element) {
    return this.bondToElementCount(element) > 0;
  }
  //
  /**
   * If atom is part of a backbone
   * @return {Boolean} flag
   */
  isBackbone() {
    const backboneIndexList = this.residueType.backboneIndexList;
    if (backboneIndexList.length > 0) {
      return backboneIndexList.includes(this.index - this.residueAtomOffset);
    } else {
      return false;
    }
  }
  /**
   * If atom is part of a polymer
   * @return {Boolean} flag
   */
  isPolymer() {
    if (this.structure.entityList.length > 0) {
      return this.entity.isPolymer();
    } else {
      const moleculeType = this.residueType.moleculeType;
      return moleculeType === ProteinType || moleculeType === RnaType || moleculeType === DnaType;
    }
  }
  /**
   * If atom is part of a sidechin
   * @return {Boolean} flag
   */
  isSidechain() {
    return this.isPolymer() && !this.isBackbone();
  }
  /**
   * If atom is part of a coarse-grain group
   * @return {Boolean} flag
   */
  isCg() {
    const backboneType = this.residueType.backboneType;
    return backboneType === CgProteinBackboneType || backboneType === CgRnaBackboneType || backboneType === CgDnaBackboneType;
  }
  isTrace() {
    return this.index === this.residueType.traceAtomIndex + this.residueAtomOffset;
  }
  /**
   * If atom is part of a hetero group
   * @return {Boolean} flag
   */
  isHetero() {
    return this.residueType.hetero === 1;
  }
  /**
   * If atom is part of a protein molecule
   * @return {Boolean} flag
   */
  isProtein() {
    return this.residueType.moleculeType === ProteinType;
  }
  /**
   * If atom is part of a nucleic molecule
   * @return {Boolean} flag
   */
  isNucleic() {
    const moleculeType = this.residueType.moleculeType;
    return moleculeType === RnaType || moleculeType === DnaType;
  }
  /**
   * If atom is part of a rna
   * @return {Boolean} flag
   */
  isRna() {
    return this.residueType.moleculeType === RnaType;
  }
  /**
   * If atom is part of a dna
   * @return {Boolean} flag
   */
  isDna() {
    return this.residueType.moleculeType === DnaType;
  }
  /**
   * If atom is part of a water molecule
   * @return {Boolean} flag
   */
  isWater() {
    return this.residueType.moleculeType === WaterType;
  }
  /**
   * If atom is part of an ion
   * @return {Boolean} flag
   */
  isIon() {
    return this.residueType.moleculeType === IonType;
  }
  /**
   * If atom is part of a saccharide
   * @return {Boolean} flag
   */
  isSaccharide() {
    return this.residueType.moleculeType === SaccharideType;
  }
  /**
   * If atom is part of a helix
   * @return {Boolean} flag
   */
  isHelix() {
    return SecStrucHelix.includes(this.sstruc);
  }
  /**
   * If atom is part of a sheet
   * @return {Boolean} flag
   */
  isSheet() {
    return SecStrucSheet.includes(this.sstruc);
  }
  /**
   * If atom is part of a turn
   * @return {Boolean} flag
   */
  isTurn() {
    return SecStrucTurn.includes(this.sstruc) && this.isProtein();
  }
  isBonded() {
    return this.bondHash.countArray[this.index] !== 0;
  }
  /**
   * If atom is part of a ring
   * @return {Boolean} flag
   */
  isRing() {
    const atomRings = this.residueType.getRings().atomRings;
    return atomRings[this.index - this.residueAtomOffset] !== void 0;
  }
  isAromatic() {
    return this.aromatic === 1;
  }
  isMetal() {
    return this.atomType.isMetal();
  }
  isNonmetal() {
    return this.atomType.isNonmetal();
  }
  isMetalloid() {
    return this.atomType.isMetalloid();
  }
  isHalogen() {
    return this.atomType.isHalogen();
  }
  isDiatomicNonmetal() {
    return this.atomType.isDiatomicNonmetal();
  }
  isPolyatomicNonmetal() {
    return this.atomType.isPolyatomicNonmetal();
  }
  isAlkaliMetal() {
    return this.atomType.isAlkaliMetal();
  }
  isAlkalineEarthMetal() {
    return this.atomType.isAlkalineEarthMetal();
  }
  isNobleGas() {
    return this.atomType.isNobleGas();
  }
  isTransitionMetal() {
    return this.atomType.isTransitionMetal();
  }
  isPostTransitionMetal() {
    return this.atomType.isPostTransitionMetal();
  }
  isLanthanide() {
    return this.atomType.isLanthanide();
  }
  isActinide() {
    return this.atomType.isActinide();
  }
  getDefaultValence() {
    return this.atomType.getDefaultValence();
  }
  getValenceList() {
    return this.atomType.getValenceList();
  }
  getOuterShellElectronCount() {
    return this.atomType.getOuterShellElectronCount();
  }
  /**
   * Distance to another atom
   * @param  {AtomProxy} atom - the other atom
   * @return {Number} the distance
   */
  distanceTo(atom) {
    const taa = this.atomStore;
    const aaa = atom.atomStore;
    const ti = this.index;
    const ai = atom.index;
    const x = taa.x[ti] - aaa.x[ai];
    const y = taa.y[ti] - aaa.y[ai];
    const z = taa.z[ti] - aaa.z[ai];
    const distSquared = x * x + y * y + z * z;
    return Math.sqrt(distSquared);
  }
  /**
   * If connected to another atom
   * @param  {AtomProxy} atom - the other atom
   * @return {Boolean} flag
   */
  connectedTo(atom) {
    const taa = this.atomStore;
    const aaa = atom.atomStore;
    const ti = this.index;
    const ai = atom.index;
    if (taa.altloc && aaa.altloc) {
      const ta = taa.altloc[ti];
      const aa = aaa.altloc[ai];
      if (!(ta === 0 || aa === 0 || ta === 32 || aa === 32 || ta === aa)) return false;
    }
    const x = taa.x[ti] - aaa.x[ai];
    const y = taa.y[ti] - aaa.y[ai];
    const z = taa.z[ti] - aaa.z[ai];
    const distSquared = x * x + y * y + z * z;
    if (distSquared < 48 && this.isCg()) return true;
    if (isNaN(distSquared)) return false;
    const d = this.covalent + atom.covalent;
    const d1 = d + 0.3;
    const d2 = d - 0.5;
    return distSquared < d1 * d1 && distSquared > d2 * d2;
  }
  /**
   * Set atom position from array
   * @param  {Array|TypedArray} array - input array
   * @param  {Integer} [offset] - the offset
   * @return {AtomProxy} this object
   */
  positionFromArray(array, offset = 0) {
    this.x = array[offset + 0];
    this.y = array[offset + 1];
    this.z = array[offset + 2];
    return this;
  }
  /**
   * Write atom position to array
   * @param  {Array|TypedArray} [array] - target array
   * @param  {Integer} [offset] - the offset
   * @return {Array|TypedArray} target array
   */
  positionToArray(array = [], offset = 0) {
    const index = this.index;
    const atomStore = this.atomStore;
    array[offset + 0] = atomStore.x[index];
    array[offset + 1] = atomStore.y[index];
    array[offset + 2] = atomStore.z[index];
    return array;
  }
  /**
   * Write atom position to vector
   * @param  {Vector3} [v] - target vector
   * @return {Vector3} target vector
   */
  positionToVector3(v) {
    if (v === void 0) v = new Vector3();
    v.x = this.x;
    v.y = this.y;
    v.z = this.z;
    return v;
  }
  /**
   * Set atom position from vector
   * @param  {Vector3} v - input vector
   * @return {AtomProxy} this object
   */
  positionFromVector3(v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  }
  /**
   * Add vector to atom position
   * @param  {Vector3} v - input vector
   * @return {AtomProxy} this object
   */
  positionAdd(v) {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  }
  /**
   * Subtract vector from atom position
   * @param  {Vector3} v - input vector
   * @return {AtomProxy} this object
   */
  positionSub(v) {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    return this;
  }
  /**
   * Get intra group/residue bonds
   * @param  {Boolean} firstOnly - immediately return the first connected atomIndex
   * @return {Integer[]|Integer|undefined} connected atomIndices
   */
  getResidueBonds(firstOnly = false) {
    const residueAtomOffset = this.residueAtomOffset;
    const relativeIndex = this.index - this.residueAtomOffset;
    const bonds = this.residueType.getBonds();
    const atomIndices1 = bonds.atomIndices1;
    const atomIndices2 = bonds.atomIndices2;
    let idx1, idx2, connectedAtomIndex;
    let connectedAtomIndices;
    if (!firstOnly) connectedAtomIndices = [];
    idx1 = atomIndices1.indexOf(relativeIndex);
    while (idx1 !== -1) {
      connectedAtomIndex = atomIndices2[idx1] + residueAtomOffset;
      if (connectedAtomIndices) {
        connectedAtomIndices.push(connectedAtomIndex);
        idx1 = atomIndices1.indexOf(relativeIndex, idx1 + 1);
      } else {
        return connectedAtomIndex;
      }
    }
    idx2 = atomIndices2.indexOf(relativeIndex);
    while (idx2 !== -1) {
      connectedAtomIndex = atomIndices1[idx2] + residueAtomOffset;
      if (connectedAtomIndices) {
        connectedAtomIndices.push(connectedAtomIndex);
        idx2 = atomIndices2.indexOf(relativeIndex, idx2 + 1);
      } else {
        return connectedAtomIndex;
      }
    }
    return connectedAtomIndices;
  }
  //
  qualifiedName(noResname = false) {
    var name = "";
    if (this.resname && !noResname) name += "[" + this.resname + "]";
    if (this.resno !== void 0) name += this.resno;
    if (this.inscode) name += "^" + this.inscode;
    if (this.chainname) name += ":" + this.chainname;
    if (this.atomname) name += "." + this.atomname;
    if (this.altloc) name += "%" + this.altloc;
    if (this.structure.modelStore.count > 1) name += "/" + this.modelIndex;
    return name;
  }
  /**
   * Clone object
   * @return {AtomProxy} cloned atom
   */
  clone() {
    return new _AtomProxy(this.structure, this.index);
  }
  toObject() {
    return {
      index: this.index,
      residueIndex: this.residueIndex,
      resname: this.resname,
      x: this.x,
      y: this.y,
      z: this.z,
      element: this.element,
      chainname: this.chainname,
      resno: this.resno,
      serial: this.serial,
      vdw: this.vdw,
      covalent: this.covalent,
      hetero: this.hetero,
      bfactor: this.bfactor,
      altloc: this.altloc,
      atomname: this.atomname,
      modelIndex: this.modelIndex
    };
  }
};
var atom_proxy_default = AtomProxy;

// src/geometry/kdtree.ts
function euclideanDistSq(a, b) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];
  return dx * dx + dy * dy + dz * dz;
}
function euclideanDist(a, b) {
  return Math.sqrt(euclideanDistSq(a, b));
}
var pointArray = new Float32Array(3);
var Kdtree2 = class {
  constructor(structure, useSquaredDist = false) {
    if (Debug) Log.time("Kdtree build");
    const metric = useSquaredDist ? euclideanDistSq : euclideanDist;
    const points = new Float32Array(structure.atomCount * 3);
    const atomIndices = new Uint32Array(structure.atomCount);
    let i = 0;
    structure.eachAtom(function(ap) {
      points[i + 0] = ap.x;
      points[i + 1] = ap.y;
      points[i + 2] = ap.z;
      atomIndices[i / 3] = ap.index;
      i += 3;
    });
    this.atomIndices = atomIndices;
    this.points = points;
    this.kdtree = new kdtree_default(points, metric);
    if (Debug) Log.timeEnd("Kdtree build");
  }
  nearest(point, maxNodes, maxDistance) {
    if (point instanceof Vector3) {
      point.toArray(pointArray);
    } else if (point instanceof atom_proxy_default) {
      point.positionToArray(pointArray);
    }
    const nodeList = this.kdtree.nearest(pointArray, maxNodes, maxDistance);
    const indices = this.kdtree.indices;
    const nodes = this.kdtree.nodes;
    const atomIndices = this.atomIndices;
    const resultList = [];
    for (let i = 0, n = nodeList.length; i < n; ++i) {
      const d = nodeList[i];
      const nodeIndex = d[0];
      const dist = d[1];
      resultList.push({
        index: atomIndices[indices[nodes[nodeIndex]]],
        distance: dist
      });
    }
    return resultList;
  }
};
var kdtree_default2 = Kdtree2;

// src/symmetry/symmetry-constants.ts
var SymOpCode = {
  " ": "X",
  "!": "Y",
  "#": "Z",
  "$": "-X",
  "%": "-Y",
  "&": "-Z",
  "'": "Y+1/2",
  "(": "1/2+X",
  ")": "1/2+Y",
  "*": "1/2-X",
  "+": "1/2+Z",
  ",": "1/2-Y",
  "-": "1/2-Z",
  ".": "X+1/2",
  "/": "Z+1/2",
  "0": "-X+1/2",
  "1": "-Y+1/2",
  "2": "-Z+1/2",
  "3": "1/4+X",
  "4": "1/4-Y",
  "5": "1/4+Z",
  "6": "1/4-X",
  "7": "1/4+Y",
  "8": "3/4-Y",
  "9": "3/4+Z",
  ":": "3/4+Y",
  ";": "3/4+X",
  "<": "3/4-X",
  "=": "1/4-Z",
  ">": "3/4-Z",
  "?": "X-Y",
  "@": "Y-X",
  "A": "Z+1/3",
  "B": "Z+2/3",
  "C": "X+2/3",
  "D": "Y+1/3",
  "E": "-Y+2/3",
  "F": "X-Y+1/3",
  "G": "Y-X+2/3",
  "H": "-X+1/3",
  "I": "X+1/3",
  "J": "Y+2/3",
  "K": "-Y+1/3",
  "L": "X-Y+2/3",
  "M": "Y-X+1/3",
  "N": "-X+2/3",
  "O": "2/3+X",
  "P": "1/3+Y",
  "Q": "1/3+Z",
  "R": "2/3-Y",
  "S": "1/3+X-Y",
  "T": "2/3+Y-X",
  "U": "1/3-X",
  "V": "2/3-X",
  "W": "1/3-Y",
  "X": "1/3-Z",
  "Y": "2/3+Y",
  "Z": "1/3+Y-X",
  "[": "2/3+X-Y",
  "]": "1/3+X",
  "^": "2/3+Z",
  "_": "2/3-Z",
  "`": "5/6+Z",
  "a": "1/6+Z",
  "b": "5/6-Z",
  "c": "1/6-Z",
  "d": "Z+5/6",
  "e": "Z+1/6",
  "f": "Z+1/4",
  "g": "+Y"
};
var EncodedSymOp = {
  "P 1": " !#",
  "P -1": " !#$%&",
  "P 1 2 1": " !#$!&",
  "P 1 21 1": " !#$'&",
  "C 1 2 1": " !#$!&()#*)&",
  "P 1 m 1": " !# %#",
  "P 1 c 1": " !# %+",
  "C 1 m 1": " !# %#()#(,#",
  "C 1 c 1": " !# %+()#(,+",
  "P 1 2/m 1": " !# %#$!&$%&",
  "P 1 21/m 1": " !#$)&$%& ,#",
  "C 1 2/m 1": " !# %#$!&$%&()#(,#*)&*,&",
  "P 1 2/c 1": " !#$!-$%& %+",
  "P 1 21/c 1": " !#$%&$)- ,+",
  "C 1 2/c 1": " !#$!-$%& %+()#*)-*,&(,+",
  "P 2 2 2": " !#$%#$!& %&",
  "P 2 2 21": " !#$%+$!- %&",
  "P 21 21 2": " !#$%#*)&(,&",
  "P 21 21 21": " !#*%+$)-(,&",
  "C 2 2 21": " !#$%+$!- %&()#*,+*)-(,&",
  "C 2 2 2": " !#$%#$!& %&()#*,#*)&(,&",
  "F 2 2 2": " !#$%#$!& %& )+$,+$)- ,-(!+*%+*!-(%-()#*,#*)&(,&",
  "I 2 2 2": " !#$%# %&$!&.'/01/.120'2",
  "I 21 21 21": " !#*%+$)-(,&()+$,#*!& %-",
  "P m m 2": " !#$%# %#$!#",
  "P m c 21": " !#$%+ %+$!#",
  "P c c 2": " !#$%# %+$!+",
  "P m a 2": " !#$%#(%#*!#",
  "P c a 21": " !#$%+(%#*!+",
  "P n c 2": " !#$%# ,+$)+",
  "P m n 21": " !#*%+(%+$!#",
  "P b a 2": " !#$%#(,#*)#",
  "P n a 21": " !#$%+(,#*)+",
  "P n n 2": " !#$%#(,+*)+",
  "C m m 2": " !#$%# %#$!#()#*,#(,#*)#",
  "C m c 21": " !#$%+ %+$!#()#*,+(,+*)#",
  "C c c 2": " !#$%# %+$!+()#*,#(,+*)+",
  "A m m 2": " !#$%# %#$!# )+$,+ ,+$)+",
  "A b m 2": " !#$%# ,#$)# )+$,+ %+$!+",
  "A m a 2": " !#$%#(%#*!# )+$,+(,+*)+",
  "A b a 2": " !#$%#(,#*)# )+$,+(%+*!+",
  "F m m 2": " !#$%# %#$!# )+$,+ ,+$)+(!+*%+(%+*!+()#*,#(,#*)#",
  "F d d 2": " !#$%#345675 )+$,+3896:9(!+*%+;49<79()#*,#;85<:5",
  "I m m 2": " !#$%# %#$!#()+*,+(,+*)+",
  "I b a 2": " !#$%#(,#*)#()+*,+ %+$!+",
  "I m a 2": " !#$%#(%#*!#()+*,+ ,+$)+",
  "P 2/m 2/m 2/m": " !#$%#$!& %&$%& !& %#$!#",
  "P 2/n 2/n 2/n": " !#$%#$!& %&*,-()-(,+*)+",
  "P 2/c 2/c 2/m": " !#$%#$!- %-$%& !& %+$!+",
  "P 2/b 2/a 2/n": " !#$%#$!& %&*,&()&(,#*)#",
  "P 21/m 2/m 2/a": " !#*%#$!&(%&$%&(!& %#*!#",
  "P 2/n 21/n 2/a": " !#*%#*)- ,-$%&(!&(,+$)+",
  "P 2/m 2/n 21/a": " !#*%+*!- %&$%&(!-(%+$!#",
  "P 21/c 2/c 2/a": " !#*%#$!-(%-$%&(!& %+*!+",
  "P 21/b 21/a 2/m": " !#$%#*)&(,&$%& !&(,#*)#",
  "P 21/c 21/c 2/n": " !#*,#$)-(%-$%&()& ,+*!+",
  "P 2/b 21/c 21/m": " !#$%+$)- ,&$%& !- ,+$)#",
  "P 21/n 21/n 2/m": " !#$%#*)-(,-$%& !&(,+*)+",
  "P 21/m 21/m 2/n": " !#$%#*'&.,&*,&.'& %#$!#",
  "P 21/b 2/c 21/n": " !#*,+$!-(,&$%&()- %+*)#",
  "P 21/b 21/c 21/a": " !#*%+$)-(,&$%&(!- ,+*)#",
  "P 21/n 21/m 21/a": " !#0%/$'&.12$%&.!2 1#0'/",
  "C 2/m 2/c 21/m": " !#$%+$!- %&$%& !- %+$!#()#*,+*)-(,&*,&()-(,+*)#",
  "C 2/m 2/c 21/a": " !#$,+$)- %&$%& )- ,+$!#()#*%+*!-(,&*,&(!-(%+*)#",
  "C 2/m 2/m 2/m": " !#$%#$!& %&$%& !& %#$!#()#*,#*)&(,&*,&()&(,#*)#",
  "C 2/c 2/c 2/m": " !#$%#$!- %-$%& !& %+$!+()#*,#*)-(,-*,&()&(,+*)+",
  "C 2/m 2/m 2/a": " !#$,#$)& %&$%& )& ,#$!#()#*%#*!&(,&*,&(!&(%#*)#",
  "C 2/c 2/c 2/a": " !#*,#$!&(,&$,-(!- ,+*!+()#$%#*)& %&*%- )-(%+$)+",
  "F 2/m 2/m 2/m": " !#$%#$!& %&$%& !& %#$!# )+$,+$)- ,-$,- )- ,+$)+(!+*%+*!-(%-*%-(!-(%+*!+()#*,#*)&(,&*,&()&(,#*)#",
  "F 2/d 2/d 2/d": " !#$%#$!& %&64=37=345675 )+$,+$)- ,-68>3:>3896:9(!+*%+*!-(%-<4>;7>;49<79()#*,#*)&(,&<8=;:=;85<:5",
  "I 2/m 2/m 2/m": " !#$%#$!& %&$%& !& %#$!#()+*,+*)-(,-*,-()-(,+*)+",
  "I 2/b 2/a 2/m": " !#$%#*)&(,&$%& !&(,#*)#()+*,+$!- %-*,-()- %+$!+",
  "I 21/b 21/c 21/a": " !#*%+$)-(,&$%&(!- ,+*)#()+$,#*!& %-*,- )&(%#$!+",
  "I 21/m 21/m 21/a": " !#$,#$)& %&$%& )& ,#$!#()+*%+*!-(,-*,-(!-(%+*)+",
  "P 4": " !#$%#% #!$#",
  "P 41": " !#$%+% 5!$9",
  "P 42": " !#$%#% +!$+",
  "P 43": " !#$%+% 9!$5",
  "I 4": " !#$%#% #!$#()+*,+,(+)*+",
  "I 41": " !#*,+%(5)$9()+$%#, 9!*5",
  "P -4": " !#$%#!$&% &",
  "I -4": " !#$%#!$&% &()+*,+)*-,(-",
  "P 4/m": " !#$%#% #!$#$%& !&!$&% &",
  "P 42/m": " !#$%#% +!$+$%& !&!$-% -",
  "P 4/n": " !#$%#,(#)*#*,&()&!$&% &",
  "P 42/n": " !#$%#,(+)*+*,-()-!$&% &",
  "I 4/m": " !#$%#% #!$#$%& !&!$&% &()+*,+,(+)*+*,-()-)*-,(-",
  "I 41/a": " !#*,+%(5)$9$,=(!>!$&,(-()+$%#, 9!*5*%> )=)*-% &",
  "P 4 2 2": " !#$%#% #!$#$!& %&! &%$&",
  "P 4 21 2": " !#$%#,(#)*#*)&(,&! &%$&",
  "P 41 2 2": " !#$%+% 5!$9$!& %-! >%$=",
  "P 41 21 2": " !#$%+,(5)*9*)=(,>! &%$-",
  "P 42 2 2": " !#$%#% +!$+$!& %&! -%$-",
  "P 42 21 2": " !#$%#,(+)*+*)-(,-! &%$&",
  "P 43 2 2": " !#$%+% 9!$5$!& %-! =%$>",
  "P 43 21 2": " !#$%+,(9)*5*)>(,=! &%$-",
  "I 4 2 2": " !#$%#% #!$#$!& %&! &%$&()+*,+,(+)*+*)-(,-)(-,*-",
  "I 41 2 2": " !#*,+%(5)$9*!> ,=)(-%$&()+$%#, 9!*5$)=(%>! &,*-",
  "P 4 m m": " !#$%#% #!$# %#$!#%$#! #",
  "P 4 b m": " !#$%#% #!$#(,#*)#,*#)(#",
  "P 42 c m": " !#$%#% +!$+ %+$!+%$#! #",
  "P 42 n m": " !#$%#,(+)*+(,+*)+%$#! #",
  "P 4 c c": " !#$%#% #!$# %+$!+%$+! +",
  "P 4 n c": " !#$%#% #!$#(,+*)+,*+)(+",
  "P 42 m c": " !#$%#% +!$+ %#$!#%$+! +",
  "P 42 b c": " !#$%#% +!$+(,#*)#,*+)(+",
  "I 4 m m": " !#$%#% #!$# %#$!#%$#! #()+*,+,(+)*+(,+*)+,*+)(+",
  "I 4 c m": " !#$%#% #!$# %+$!+%$+! +()+*,+,(+)*+(,#*)#,*#)(#",
  "I 41 m d": " !#*,+%(5)$9 %#*)+%*5) 9()+$%#, 9!*5(,+$!#,$9!(5",
  "I 41 c d": " !#*,+%(5)$9 %+*)#%*9) 5()+$%#, 9!*5(,#$!+,$5!(9",
  "P -4 2 m": " !#$%#% &!$&$!& %&%$#! #",
  "P -4 2 c": " !#$%#% &!$&$!- %-%$+! +",
  "P -4 21 m": " !#$%#% &!$&*)&(,&,*#)(#",
  "P -4 21 c": " !#$%#% &!$&*)-(,-,*+)(+",
  "P -4 m 2": " !#$%#!$&% & %#$!#! &%$&",
  "P -4 c 2": " !#$%#% &!$& %+$!+! -%$-",
  "P -4 b 2": " !#$%#% &!$&(,#*)#)(&,*&",
  "P -4 n 2": " !#$%#% &!$&(,+*)+)(-,*-",
  "I -4 m 2": " !#$%#% &!$& %#$!#! &%$&()+*,+,(-)*-(,+*)+)(-,*-",
  "I -4 c 2": " !#$%#% &!$& %+$!+! -%$-()+*,+,(-)*-(,#*)#)(&,*&",
  "I -4 2 m": " !#$%#% &!$&$!& %&%$#! #()+*,+,(-)*-*)-(,-,*+)(+",
  "I -4 2 d": " !#$%#% &!$&*!>(%>,$9) 9()+*,+,(-)*-$)= ,=%*5!(5",
  "P 4/m 2/m 2/m": " !#$%#% #!$#$!& %&! &%$&$%& !&!$&% & %#$!#%$#! #",
  "P 4/m 2/c 2/c": " !#$%#% #!$#$!- %-! -%$-$%& !&!$&% & %+$!+%$+! +",
  "P 4/n 2/b 2/m": " !#$%#% #!$#$!& %&! &%$&*,&()&)*&,(&(,#*)#,*#)(#",
  "P 4/n 2/n 2/c": " !#$%#% #!$#$!& %&! &%$&*,-()-)*-,(-(,+*)+,*+)(+",
  "P 4/m 21/b 2/m": " !#$%#% #!$#*)&(,&)(&,*&$%& !&!$&% &(,#*)#,*#)(#",
  "P 4/m 21/n 2/c": " !#$%#% #!$#*)-(,-)(-,*-$%& !&!$&% &(,+*)+,*+)(+",
  "P 4/n 21/m 2/m": " !#$%#,(#)*#*)&(,&! &%$&*,&()&!$&% & %#$!#,*#)(#",
  "P 4/n 2/c 2/c": " !#$%#,(#)*#*)-(,-! -%$-*,&()&!$&% & %+$!+,*+)(+",
  "P 42/m 2/m 2/c": " !#$%#% +!$+$!& %&! -%$-$%& !&!$-% - %#$!#%$+! +",
  "P 42/m 2/c 2/m": " !#$%#% +!$+$!- %-! &%$&$%& !&!$-% - %+$!+%$#! #",
  "P 42/n 2/b 2/c": " !#$%#,(+)*+$!- %-)(&,*&*,-()-!$&% &(,#*)#%$+! +",
  "P 42/n 2/n 2/m": " !#$%#,(+)*+$!& %&)(-,*-*,-()-!$&% &(,+*)+%$#! #",
  "P 42/m 21/b 2/c": " !#$%#% +!$+*)&(,&)(-,*-$%& !&!$-% -(,#*)#,*+)(+",
  "P 42/m 21/n 2/m": " !#$%#,./'*/*'-.,-! &%$&$%& !&'*-,.-.,/*'/%$#! #",
  "P 42/n 21/m 2/c": " !#$%#,(+)*+*)-(,-! &%$&*,-()-!$&% & %#$!#,*+)(+",
  "P 42/n 21/c 2/m": " !#$%#,(+)*+*)&(,&! -%$-*,-()-!$&% & %+$!+,*#)(#",
  "I 4/m 2/m 2/m": " !#$%#% #!$#$!& %&! &%$&$%& !&!$&% & %#$!#%$#! #()+*,+,(+)*+*)-(,-)(-,*-*,-()-)*-,(-(,+*)+,*+)(+",
  "I 4/m 2/c 2/m": " !#$%#% #!$#$!- %-! -%$-$%& !&!$&% & %+$!+%$+! +()+*,+,(+)*+*)&(,&)(&,*&*,-()-)*-,(-(,#*)#,*#)(#",
  "I 41/a 2/m 2/d": " !#*,+%(5)$9*!> ,=)(-%$&$,=(!>!$&,(-(,+$!#,$9!(5()+$%#, 9!*5$)=(%>! &,*-*%> )=)*-% & %#*)+%*5) 9",
  "I 41/a 2/c 2/d": " !#*,+%(5)$9*!= ,>)(&%$-$,=(!>!$&,(-(,#$!+,$5!(9()+$%#, 9!*5$)>(%=! -,*&*%> )=)*-% & %+*)#%*9) 5",
  "P 3": " !#%?#@$#",
  "P 31": " !#%?A@$B",
  "P 32": " !#%?B@$A",
  "H 3": " !#%?#@$#CDAEFAGHAIJBKLBMNB",
  "R 3": " !## !!# ",
  "P -3": " !#%?#@$#$%&!@&? &",
  "H -3": " !#%?#@$#$%&!@&? &OPQRSQTUQVWXYZX[]X]Y^W[^ZV^UR_PT_SO_",
  "R -3": " !## !!# $%&&$%%&$",
  "P 3 1 2": " !#%?#@$#%$&@!& ?&",
  "P 3 2 1": " !#%?#@$#! &?%&$@&",
  "P 31 1 2": " !#%?Q@$^%$_@!X ?&",
  "P 31 2 1": " !#%?A@$B! &?%_$@X",
  "P 32 1 2": " !#%?^@$Q%$X@!_ ?&",
  "P 32 2 1": " !#%?B@$A! &?%X$@_",
  "H 3 2": " !#%?#@$#! &?%&$@&OPQRSQTUQY]X[WXVZX]Y^W[^ZV^PO_SR_UT_",
  "R 3 2": " !## !!# %$&$&%&%$",
  "P 3 m 1": " !#%?#@$#%$#@!# ?#",
  "P 3 1 m": " !#%?#@$#! #?%#$@#",
  "P 3 c 1": " !#%?#@$#%$+@!+ ?+",
  "P 3 1 c": " !#%?#@$#! +?%+$@+",
  "H 3 m": " !#%?#@$#%$#@!# ?#OPQRSQTUQRUQTPQOSQ]Y^W[^ZV^WV^ZY^][^",
  "R 3 m": " !## !!# ! # #!#! ",
  "H 3 c": " !#%?#@$#%$+@!+ ?+OPQRSQTUQRU`TP`OS`]Y^W[^ZV^WVaZYa][a",
  "R 3 c": " !## !!# '././'/'.",
  "P -3 1 2/m": " !#%?#@$#%$&@!& ?&$%&!@&? &! #?%#$@#",
  "P -3 1 2/c": " !#%?#@$#%$-@!- ?-$%&!@&? &! +?%+$@+",
  "P -3 2/m 1": " !#%?#@$#! &?%&$@&$%&!@&? &%$#@!# ?#",
  "P -3 2/c 1": " !#%?#@$#! -?%-$@-$%&!@&? &%$+@!+ ?+",
  "H -3 2/m": " !#%?#@$#! &?%&$@&$%&!@&? &%$#@!# ?#OPQRSQTUQY]X[WXVZXVWXYZX[]XRUQTPQOSQ]Y^W[^ZV^PO_SR_UT_UR_PT_SO_WV^ZY^][^",
  "R -3 2/m": " !## !!# %$&$&%&%$$%&&$%%&$! # #!#! ",
  "H -3 2/c": " !#%?#@$#! -?%-$@-$%&!@&? &%$+@!+ ?+OPQRSQTUQY]b[WbVZbVWXYZX[]XRU`TP`OS`]Y^W[^ZV^POcSRcUTcUR_PT_SO_WVaZYa][a",
  "R -3 2/c": " !## !!# 102021210$%&&$%%&$'././'/'.",
  "P 6": " !#%?#@$#$%#!@#? #",
  "P 61": " !#%?A@$B$%/!@d? e",
  "P 65": " !#%?B@$A$%/!@e? d",
  "P 62": " !#%?^@$Q$%#!@^? Q",
  "P 64": " !#%?Q@$^$%#!@Q? ^",
  "P 63": " !#%?#@$#$%+!@+? +",
  "P -6": " !#%?#@$# !&%?&@$&",
  "P 6/m": " !#%?#@$#$%#!@#? #$%&!@&? & !&%?&@$&",
  "P 63/m": " !#%?#@$#$%+!@+? +$%&!@&? & !-%?-@$-",
  "P 6 2 2": " !#%?#@$#$%#!@#? #! &?%&$@&%$&@!& ?&",
  "P 61 2 2": " !#%?Q@$^$%+!@`? a! X?%&$@_%$b@!- ?c",
  "P 65 2 2": " !#%?^@$Q$%+!@a? `! _?%&$@X%$c@!- ?b",
  "P 62 2 2": " !#%?^@$Q$%#!@^? Q! _?%&$@X%$_@!& ?X",
  "P 64 2 2": " !#%?Q@$^$%#!@Q? ^! X?%&$@_%$X@!& ?_",
  "P 63 2 2": " !#%?#@$#$%+!@+? +! &?%&$@&%$-@!- ?-",
  "P 6 m m": " !#%?#@$#$%#!@#? #%$#@!# ?#! #?%#$@#",
  "P 6 c c": " !#%?#@$#$%#!@#? #%$+@!+ ?+! +?%+$@+",
  "P 63 c m": " !#%?#@$#$%+!@+? +%$+@!+ ?+! #?%#$@#",
  "P 63 m c": " !#%?#@$#$%+!@+? +%$#@!# ?#! +?%+$@+",
  "P -6 m 2": " !#%?#@$# !&%?&@$&%$#@!# ?#%$&@!& ?&",
  "P -6 c 2": " !#%?#@$# !-%?-@$-%$+@!+ ?+%$&@!& ?&",
  "P -6 2 m": " !#%?#@$# !&%?&@$&! &?%&$@&! #?%#$@#",
  "P -6 2 c": " !#%?#@$# !-%?-@$-! &?%&$@&! +?%+$@+",
  "P 6/m 2/m 2/m": " !#%?#@$#$%#!@#? #! &?%&$@&%$&@!& ?&$%&!@&? & !&@$&%?&%$#@!# ?#! #?%#$@#",
  "P 6/m 2/c 2/c": " !#%?#@$#$%#!@#? #! -?%-$@-%$-@!- ?-$%&!@&? & !&@$&%?&%$+@!+ ?+! +?%+$@+",
  "P 63/m 2/c 2/m": " !#%?#@$#$%+!@+? +! -?%-$@-%$&@!& ?&$%&!@&? & !-@$-%?-%$+@!+ ?+! #?%#$@#",
  "P 63/m 2/m 2/c": " !#%?#@$#$%+!@+? +! &?%&$@&%$-@!- ?-$%&!@&? & !-@$-%?-%$#@!# ?#! +?%+$@+",
  "P 2 3": " !#$%#$!& %&# !#$%&$!& %!# %#$!&$%& ",
  "F 2 3": " !#$%#$!& %&# !#$%&$!& %!# %#$!&$%&  )+$,+$)- ,-#()#*,&*)&(,!+(%+*!-*%-((!+*%+*!-(%-+ )+$,-$)- ,)#(,#*)&*,&(()#*,#*)&(,&+(!+*%-*!-(%)+ ,+$)-$,- ",
  "I 2 3": " !#$%#$!& %&# !#$%&$!& %!# %#$!&$%& ()+*,+*)-(,-+()+*,-*)-(,)+(,+*)-*,-(",
  "P 21 3": " !#*%+$)-(,&# !+*%-$)&(,!# %+*)-$,&(",
  "I 21 3": " !#*%+$)-(,&# !+*%-$)&(,!# %+*)-$,&(()+$,#*!& %-+()#$,&*!- %)+(,#$!&*%- ",
  "P 2/m -3": " !#$%#$!& %&# !#$%&$!& %!# %#$!&$%& $%& !& %#$!#&$%& !# %#$!%&$!& %# !#$",
  "P 2/n -3": " !#$%#$!& %&# !#$%&$!& %!# %#$!&$%& *,-()-(,+*)+-*,-()+(,+*),-*)-(,+()+*",
  "F 2/m -3": " !#$%#$!& %&# !#$%&$!& %!# %#$!&$%& $%& !& %#$!#&$%& !# %#$!%&$!& %# !#$ )+$,+$)- ,-#()#*,&*)&(,!+(%+*!-*%-($,- )- ,+$)+&*,&()#(,#*)%-*!-(%+(!+*(!+*%+*!-(%-+ )+$,-$)- ,)#(,#*)&*,&(*%-(!-(%+*!+-$,- )+ ,+$),&*)&(,#()#*()#*,#*)&(,&+(!+*%-*!-(%)+ ,+$)-$,- *,&()&(,#*)#-*%-(!+(%+*!,-$)- ,+ )+$",
  "F 2/d -3": " !#$%#$!& %&# !#$%&$!& %!# %#$!&$%& 64=37=345675=64=375345674=67=3453756 )+$,+$)- ,-#()#*,&*)&(,!+(%+*!-*%-(68>3:>3896:9=<8=;:5;85<:4><7>;49;79<(!+*%+*!-(%-+ )+$,-$)- ,)#(,#*)&*,&(<4>;7>;49<79>68>3:93896:8=<:=;85;:5<()#*,#*)&(,&+(!+*%-*!-(%)+ ,+$)-$,- <8=;:=;8f<:f><4>;79;49<78>6:>3893:96",
  "I 2/m -3": " !#$%#$!& %&# !#$%&$!& %!# %#$!&$%& $%& !& %#$!#&$%& !# %#$!%&$!& %# !#$()+*,+*)-(,-+()+*,-*)-(,)+(,+*)-*,-(*,-()-(,+*)+-*,-()+(,+*),-*)-(,+()+*",
  "P 21/a -3": " !#*%+$)-(,&# !+*%-$)&(,!# %+*)-$,&($%&(!- ,+*)#&$%-(!+ ,#*)%&$!-(,+ )#*",
  "I 21/a -3": " !#*%+$)-(,&# !+*%-$)&(,!# %+*)-$,&($%&(!- ,+*)#&$%-(!+ ,#*)%&$!-(,+ )#*()+$,#*g& %-+()#$,&*!- %)+(,#$!&*%- *,- )&(%#$!+-*,& )#(%+$!,-*)& %#(!+$",
  "P 4 3 2": " !#$%#$!& %&# !#$%&$!& %!# %#$!&$%& ! &%$&!$#% # #%$#!$&% &!#!$#% &! &%$",
  "P 42 3 2": " !#$%#$!& %&# !#$%&$!& %!# %#$!&$%& )(-,*-)*+,(+(+,*+)*-,(-)+)*+,(-)(-,*",
  "F 4 3 2": " !#$%#$!& %&# !#$%&$!& %!# %#$!&$%& ! &%$&!$#% # #%$#!$&% &!#!$#% &! &%$ )+$,+$)- ,-#()#*,&*)&(,!+(%+*!-*%-(!(-%*-!*+%(+ +,$+)$-, -)#)*#,(&)(&,*(!+*%+*!-(%-+ )+$,-$)- ,)#(,#*)&*,&() -,$-)$+, +(#,*#)*&,(&)+!*+%(-!(-%*()#*,#*)&(,&+(!+*%-*!-(%)+ ,+$)-$,- )(&,*&)*#,(#(+%*+!*-%(-!+)$+, -) -,$",
  "F 41 3 2": " !#$,+*)&(%-# !+$,&*)-(%!# ,+$)&*%-(:3>46=7<98;5;58<976=43>:97<58;>:3=46 )+$%#*!-(,&#()+*%&$!- ,!+(,#*)-$%& :;=4<>765839;94<5:6>83=79:6543>7;=8<(!+*,#$)- %&+ )#$%-*!&(,)#(%+*!&$,- 73=86>:<54;935469:<=8;>7576983=:;>4<()#*%+$!& ,-+(!#*,-$)& %)+ %#$!-*,&(7;>8<=:69435398657<>4;=:5:<94;=73>86",
  "I 4 3 2": " !#$%#$!& %&# !#$%&$!& %!# %#$!&$%& ! &%$&!$#% # #%$#!$&% &!#!$#% &! &%$()+*,+*)-(,-+()+*,-*)-(,)+(,+*)-*,-()(-,*-)*+,(+(+,*+)*-,(-)+)*+,(-)(-,*",
  "P 43 3 2": " !#*%+$)-(,&# !+*%-$)&(,!# %+*)-$,&(7;>46=:<5839398<5:6=4;>75:<983>7;=46",
  "P 41 3 2": " !#*%+$)-(,&# !+*%-$)&(,!# %+*)-$,&(:3=8<>7694;5;54697<>83=:97654;=:3>8<",
  "I 41 3 2": " !#*%+$)-(,&# !+*%-$)&(,!# %+*)-$,&(:3=8<>7694;5;54697<>83=:97654;=:3>8<()+$,#*!& %-+()#$,&*!- %)+(,#$!&*%- 7;>46=:<5839398<5:6=4;>75:<983>7;=46",
  "P -4 3 m": " !#$%#$!& %&# !#$%&$!& %!# %#$!&$%& ! #%$#!$&% & #!$#%$&! &%#! #%$&!$&% ",
  "F -4 3 m": " !#$%#$!& %&# !#$%&$!& %!# %#$!&$%& ! #%$#!$&% & #!$#%$&! &%#! #%$&!$&%  )+$,+$)- ,-#()#*,&*)&(,!+(%+*!-*%-(!(+%*+!*-%(- +)$+,$-) -,#)(#,*&)*&,((!+*%+*!-(%-+ )+$,-$)- ,)#(,#*)&*,&() +,$+)$-, -(#)*#,*&)(&,+!(+%*-!*-%(()#*,#*)&(,&+(!+*%-*!-(%)+ ,+$)-$,- )(#,*#)*&,(&(+!*+%*-!(-%+) +,$-)$-, ",
  "I -4 3 m": " !#$%#$!& %&# !#$%&$!& %!# %#$!&$%& ! #%$#!$&% & #!$#%$&! &%#! #%$&!$&% ()+*,+*)-(,-+()+*,-*)-(,)+(,+*)-*,-()(+,*+)*-,(-(+)*+,*-)(-,+)(+,*-)*-,(",
  "P -4 3 n": " !#$%#$!& %&# !#$%&$!& %!# %#$!&$%& )(+,*+)*-,(-(+)*+,*-)(-,+)(+,*-)*-,(",
  "F -4 3 c": " !#$%#$!& %&# !#$%&$!& %!# %#$!&$%& )(+,*+)*-,(-(+)*+,*-)(-,+)(+,*-)*-,( )+$,+$)- ,-#()#*,&*)&(,!+(%+*!-*%-() #,$#)$&, &(#!*#%*&!(&%+! +%$-!$-% (!+*%+*!-(%-+ )+$,-$)- ,)#(,#*)&*,&(!(#%*#!*&%(& +!$+%$-! -%#) #,$&)$&, ()#*,#*)&(,&+(!+*%-*!-(%)+ ,+$)-$,- ! +%$+!$-% - #)$#,$&) &,#!(#%*&!*&%(",
  "I -4 3 d": " !#*%+$)-(,&# !+*%-$)&(,!# %+*)-$,&(7354<9:6>8;=357<946>:;=857394<>:6=8;()+$,#*!& %-+()#$,&*!- %)+(,#$!&*%- :;98657<=43>;9:658<=73>49:;586=7<>43",
  "P 4/m -3 2/m": " !#$%#$!& %&# !#$%&$!& %!# %#$!&$%& ! &%$&!$#% # #%$#!$&% &!#!$#% &! &%$$%& !& %#$!#&$%& !# %#$!%&$!& %# !#$%$#! #% &!$&$&! &% #!$#%&% &!$#%$#! ",
  "P 4/n -3 2/n": " !#$%#$!& %&# !#$%&$!& %!# %#$!&$%& ! &%$&!$#% # #%$#!$&% &!#!$#% &! &%$*,-()-(,+*)+-*,-()+(,+*),-*)-(,+()+*,*+)(+,(-)*-*-)(-,(+)*+,-,(-)*+,*+)(",
  "P 42/m -3 2/n": " !#$%#$!& %&# !#$%&$!& %!# %#$!&$%& )(-,*-)*+,(+(+,*+)*-,(-)+)*+,(-)(-,*$%& !& %#$!#&$%& !# %#$!%&$!& %# !#$,*+)(+,(-)*-*-)(-,(+)*+,-,(-)*+,*+)(",
  "P 42/n -3 2/m": " !#$%#$!& %&# !#$%&$!& %!# %#$!&$%& )(-,*-)*+,(+(+,*+)*-,(-)+)*+,(-)(-,**,-()-(,+*)+-*,-()+(,+*),-*)-(,+()+*%$#! #% &!$&$&! &% #!$#%&% &!$#%$#! ",
  "F 4/m -3 2/m": " !#$%#$!& %&# !#$%&$!& %!# %#$!&$%& ! &%$&!$#% # #%$#!$&% &!#!$#% &! &%$$%& !& %#$!#&$%& !# %#$!%&$!& %# !#$%$#! #% &!$&$&! &% #!$#%&% &!$#%$#!  )+$,+$)- ,-#()#*,&*)&(,!+(%+*!-*%-(!(-%*-!*+%(+ +,$+)$-, -)#)*#,(&)(&,*$,- )- ,+$)+&*,&()#(,#*)%-*!-(%+(!+*%*+!(+%(-!*-$-) -, +)$+,&,(&)*#,*#)((!+*%+*!-(%-+ )+$,-$)- ,)#(,#*)&*,&() -,$-)$+, +(#,*#)*&,(&)+!*+%(-!(-%**%-(!-(%+*!+-$,- )+ ,+$),&*)&(,#()#*,$+) +, -)$-*&)(&,(#)*#,-%(-!*+%*+!(()#*,#*)&(,&+(!+*%-*!-(%)+ ,+$)-$,- )(&,*&)*#,(#(+%*+!*-%(-!+)$+, -) -,$*,&()&(,#*)#-*%-(!+(%+*!,-$)- ,+ )+$,*#)(#,(&)*&*-!(-%(+!*+%-, -)$+,$+) ",
  "F 4/m -3 2/c": " !#$%#$!& %&# !#$%&$!& %!# %#$!&$%& )(-,*-)*+,(+(+,*+)*-,(-)+)*+,(-)(-,*$%& !& %#$!#&$%& !# %#$!%&$!& %# !#$,*+)(+,(-)*-*-)(-,(+)*+,-,(-)*+,*+)( )+$,+$)- ,-#()#*,&*)&(,!+(%+*!-*%-() &,$&)$#, #(#%*#!*&%(&!+!$+% -! -%$$,- )- ,+$)+&*,&()#(,#*)%-*!-(%+(!+*,$#) #, &)$&*&!(&%(#!*#%-% -!$+%$+! (!+*%+*!-(%-+ )+$,-$)- ,)#(,#*)&*,&(!(&%*&!*#%(# +%$+!$-% -!#)$#, &) &,$*%-(!-(%+*!+-$,- )+ ,+$),&*)&(,#()#*%*#!(#%(&!*&$-! -% +!$+%&, &)$#,$#) ()#*,#*)&(,&+(!+*%-*!-(%)+ ,+$)-$,- ! -%$-!$+% + #,$#)$&, &)#!*#%(&!(&%**,&()&(,#*)#-*%-(!+(%+*!,-$)- ,+ )+$%$+! +% -!$-$&) &, #)$#,&%(&!*#%*#!(",
  "F 41/d -3 2/m": " !#$,+*)&(%-# !+$,&*)-(%!# ,+$)&*%-(:3>46=7<98;5;58<976=43>:97<58;>:3=4664=3:>;85<79=64>3:5;89<74=6:>385;79<,$+! #%(-)*&*&)(-% #!$+,-%(&)*+,$#!  )+$%#*!-(,&#()+*%&$!- ,!+(,#*)-$%& :;=4<>765839;94<5:6>83=79:6543>7;=8<68>37=;49<:5=<8>;753496:4><:=;893756,*#!(+% &)$-*-!(&, +)$#%-, &!$+%*#)((!+*,#$)- %&+ )#$%-*!&(,)#(%+*!&$,- 73=86>:<54;935469:<=8;>7576983=:;>4<<4>;:=389675>68=379;45<:8=<7>;453:96%$#) +,(&!*-$&! -,(#)*+%&% -)$#,*+!(()#*%+$!& ,-+(!#*,-$)& %)+ %#$!-*,&(7;>8<=:69435398657<>4;=:5:<94;=73>86<8=;7>3456:9><4=;:9385678>67=349;:5<%*+)(#, -!$&$-) &%(+!*#,&,(-!*#%$+) ",
  "F 41/d -3 2/c": " !#$,+*)&(%-# !+$,&*)-(%!# ,+$)&*%-(:3>46=7<98;5;58<976=43>:97<58;>:3=46<8>;7=3496:5><8=;793456:8><7=;493:56%*#)(+, &!$-$-! &,(+)*#%&, -!$#%*+)( )+$%#*!-(,&#()+*%&$!- ,!+(,#*)-$%& :;=4<>765839;94<5:6>83=79:6543>7;=8<<4=;:>385679>64=3:9;85<78=67>345;:9<%$+) #,(-!*&$&) -%(#!*+,&%(-)*#,$+! (!+*,#$)- %&+ )#$%-*!&(,)#(%+*!&$,- 73=86>:<54;935469:<=8;>7576983=:;>4<68=37>;45<:9=<4>;:5389674>6:=389;75<,*+!(#% -)$&*-)(&% +!$#,-,(&!*+%$#) ()#*%+$!& ,-+(!#*,-$)& %)+ %#$!-*,&(7;>8<=:69435398657<>4;=:5:<94;=73>8664>3:=;89<75=68>375;49<:4=<:>;853796,$#! +%(&)*-*&!(-, #)$+%-% &)$+,*#!(",
  "I 4/m -3 2/m": " !#$%#$!& %&# !#$%&$!& %!# %#$!&$%& ! &%$&!$#% # #%$#!$&% &!#!$#% &! &%$$%& !& %#$!#&$%& !# %#$!%&$!& %# !#$%$#! #% &!$&$&! &% #!$#%&% &!$#%$#! ()+*,+*)-(,-+()+*,-*)-(,)+(,+*)-*,-()(-,*-)*+,(+(+,*+)*-,(-)+)*+,(-)(-,**,-()-(,+*)+-*,-()+(,+*),-*)-(,+()+*,*+)(+,(-)*-*-)(-,(+)*+,-,(-)*+,*+)(",
  "I 41/a -3 2/d": " !#*%+$)-(,&# !+*%-$)&(,!# %+*)-$,&(:3=8<>7694;5;54697<>83=:97654;=:3>8<$%&(!- ,+*)#&$%-(!+ ,#*)%&$!-(,+ )#*4<97358;=:6>6>:;=8357<94=8;>:694<573()+$,#*!& %-+()#$,&*!- %)+(,#$!&*%- 7;>46=:<5839398<5:6=4;>75:<983>7;=46*,- )&(%#$!+-*,& )#(%+$!,-*)& %#(!+$865:;943>7<=<=73>4;9:658>43=7<5869:;",
  "P 1 1 2": " !#$%#",
  "P 1 1 21": " !#$%+",
  "B 1 1 2": " !#$%#(g+*%+",
  "A 1 2 1": " !#$!& )+$)-",
  "C 1 21 1": " !#$)&()#*!&",
  "I 1 2 1": " !#$!&.'/0'2",
  "I 1 21 1": " !#$)&.'/0!-",
  "P 1 1 m": " !# !&",
  "P 1 1 b": " !# )&",
  "B 1 1 m": " !# !&(!+(!-",
  "B 1 1 b": " !# )&(!+()-",
  "P 1 1 2/m": " !# !&$%#$%&",
  "P 1 1 21/m": " !#$%+$%& !-",
  "B 1 1 2/m": " !# !&$%#$%&(!+(!-*%+*%-",
  "P 1 1 2/b": " !#$,#$%& )&",
  "P 1 1 21/b": " !#$%&$,+ )-",
  "B 1 1 2/b": " !#$,#$%& )&(!+*,+*%-()-",
  "P 21 2 2": " !#$!&(%&*%#",
  "P 2 21 2": " !# ,&$)&$%#",
  "P 21 21 2 (a)": " !#*,#.%&$'&",
  "P 21 2 21": " !#$!&(%-*%+",
  "P 2 21 21": " !# %&$)-$,+",
  "C 2 2 21a)": " !#*%+(,&$)-()#$,+ %&*!-",
  "C 2 2 2a": " !#*,#.%&$'&()#$%# ,&*!&",
  "F 2 2 2a": " !#*,#.%&$'& '/*%/.12$!2.!/$,/ %20'2.'#$%# 1&0!&",
  "I 2 2 2a": " !#*,#.%&$'&()+$%+*!- ,-",
  "P 21/m 21/m 2/n a": " !#*,#$)&(%&$%&.'& ,#*!#",
  "P 42 21 2a": " !#*,#%.+'$+$'&.%&! -,*-",
  "I 2 3a": " !#*,#.%&$'&!# ,- '&$%/$# !-*!/$%&.%()+$%+ ,-*!-)+(%&(!-*,#*+()&$)#*,- ,"
};

// src/symmetry/symmetry-utils.ts
var reInteger = /^[1-9]$/;
function getSymmetryOperations(spacegroup) {
  const encodedSymopList = EncodedSymOp[spacegroup];
  const matrixDict = {};
  if (encodedSymopList === void 0) {
    console.warn(`spacegroup '${spacegroup}' not found in symop library`);
    return matrixDict;
  }
  const symopList = [];
  for (let i = 0, il = encodedSymopList.length; i < il; i += 3) {
    const symop = [];
    for (let j = 0; j < 3; ++j) {
      symop.push(SymOpCode[encodedSymopList[i + j]]);
    }
    symopList.push(symop);
  }
  symopList.forEach(function(symop) {
    let row = 0;
    const matrix = new Matrix4().set(
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1
    );
    const me = matrix.elements;
    matrixDict[symop.toString()] = matrix;
    symop.forEach(function(elm) {
      let negate = false;
      let denominator = false;
      for (let i = 0, n = elm.length; i < n; ++i) {
        const c = elm[i];
        if (c === "-") {
          negate = true;
        } else if (c === "+") {
          negate = false;
        } else if (c === "/") {
          denominator = true;
        } else if (c === "X") {
          me[0 + row] = negate ? -1 : 1;
        } else if (c === "Y") {
          me[4 + row] = negate ? -1 : 1;
        } else if (c === "Z") {
          me[8 + row] = negate ? -1 : 1;
        } else if (reInteger.test(c)) {
          const integer = parseInt(c);
          if (denominator) {
            me[12 + row] /= integer;
          } else {
            me[12 + row] = integer;
          }
        } else {
          Log.warn(`getSymmetryOperations: unknown token '${c}'`);
        }
      }
      row += 1;
    });
  });
  return matrixDict;
}

// src/selection/selection.ts
var import_signals = __toESM(require_signals());

// src/selection/selection-constants.ts
var kwd = /* @__PURE__ */ ((kwd2) => {
  kwd2[kwd2["PROTEIN"] = 1] = "PROTEIN";
  kwd2[kwd2["NUCLEIC"] = 2] = "NUCLEIC";
  kwd2[kwd2["RNA"] = 3] = "RNA";
  kwd2[kwd2["DNA"] = 4] = "DNA";
  kwd2[kwd2["POLYMER"] = 5] = "POLYMER";
  kwd2[kwd2["WATER"] = 6] = "WATER";
  kwd2[kwd2["HELIX"] = 7] = "HELIX";
  kwd2[kwd2["SHEET"] = 8] = "SHEET";
  kwd2[kwd2["TURN"] = 9] = "TURN";
  kwd2[kwd2["BACKBONE"] = 10] = "BACKBONE";
  kwd2[kwd2["SIDECHAIN"] = 11] = "SIDECHAIN";
  kwd2[kwd2["ALL"] = 12] = "ALL";
  kwd2[kwd2["HETERO"] = 13] = "HETERO";
  kwd2[kwd2["ION"] = 14] = "ION";
  kwd2[kwd2["SACCHARIDE"] = 15] = "SACCHARIDE";
  kwd2[kwd2["SUGAR"] = 15] = "SUGAR";
  kwd2[kwd2["BONDED"] = 16] = "BONDED";
  kwd2[kwd2["RING"] = 17] = "RING";
  kwd2[kwd2["AROMATICRING"] = 18] = "AROMATICRING";
  kwd2[kwd2["METAL"] = 19] = "METAL";
  kwd2[kwd2["NONE"] = 20] = "NONE";
  return kwd2;
})(kwd || {});
var SelectAllKeyword = ["*", "", "ALL"];
var SelectNoneKeyword = ["NONE"];
var AtomOnlyKeywords = [
  10 /* BACKBONE */,
  11 /* SIDECHAIN */,
  16 /* BONDED */,
  17 /* RING */,
  18 /* AROMATICRING */,
  19 /* METAL */
];
var ChainKeywords = [
  5 /* POLYMER */,
  6 /* WATER */
];
var SmallResname = ["ALA", "GLY", "SER"];
var NucleophilicResname = ["CYS", "SER", "THR"];
var HydrophobicResname = ["ALA", "ILE", "LEU", "MET", "PHE", "PRO", "TRP", "VAL"];
var AromaticResname = ["PHE", "TRP", "TYR", "HIS"];
var AmideResname = ["ASN", "GLN"];
var AcidicResname = ["ASP", "GLU"];
var BasicResname = ["ARG", "HIS", "LYS"];
var ChargedResname = ["ARG", "ASP", "GLU", "HIS", "LYS"];
var PolarResname = ["ASN", "ARG", "ASP", "CYS", "GLY", "GLN", "GLU", "HIS", "LYS", "SER", "THR", "TYR"];
var NonpolarResname = ["ALA", "ILE", "LEU", "MET", "PHE", "PRO", "TRP", "VAL"];
var CyclicResname = ["HIS", "PHE", "PRO", "TRP", "TYR"];
var AliphaticResname = ["ALA", "GLY", "ILE", "LEU", "VAL"];

// src/selection/selection-parser.ts
function parseSele(string) {
  let retSelection = {
    operator: void 0,
    rules: []
  };
  if (!string) {
    return retSelection;
  }
  let selection2 = retSelection;
  let newSelection;
  let oldSelection;
  const selectionStack = [];
  string = string.replace(/\(/g, " ( ").replace(/\)/g, " ) ").trim();
  if (string.charAt(0) === "(" && string.substr(-1) === ")") {
    string = string.slice(1, -1).trim();
  }
  const chunks = string.split(/\s+/);
  const createNewContext = (operator) => {
    newSelection = {
      operator,
      rules: []
    };
    if (selection2 === void 0) {
      selection2 = newSelection;
      retSelection = newSelection;
    } else {
      selection2.rules.push(newSelection);
      selectionStack.push(selection2);
      selection2 = newSelection;
    }
  };
  const getPrevContext = function(operator) {
    oldSelection = selection2;
    selection2 = selectionStack.pop();
    if (selection2 === void 0) {
      createNewContext(operator);
      pushRule(oldSelection);
    }
  };
  const pushRule = function(rule) {
    selection2.rules.push(rule);
  };
  let not = false;
  for (let i = 0; i < chunks.length; ++i) {
    const c = chunks[i];
    const cu = c.toUpperCase();
    if (c === "(") {
      not = false;
      createNewContext();
      continue;
    } else if (c === ")") {
      getPrevContext();
      if (selection2.negate) {
        getPrevContext();
      }
      continue;
    }
    if (not > 0) {
      if (cu === "NOT") {
        not = 1;
      } else if (not === 1) {
        not = 2;
      } else if (not === 2) {
        not = false;
        getPrevContext();
      } else {
        throw new Error("something went wrong with 'not'");
      }
    }
    if (cu === "AND") {
      if (selection2.operator === "OR") {
        const lastRule = selection2.rules.pop();
        createNewContext("AND");
        pushRule(lastRule);
      } else {
        selection2.operator = "AND";
      }
      continue;
    } else if (cu === "OR") {
      if (selection2.operator === "AND") {
        getPrevContext("OR");
      } else {
        selection2.operator = "OR";
      }
      continue;
    } else if (c.toUpperCase() === "NOT") {
      not = 1;
      createNewContext();
      selection2.negate = true;
      continue;
    } else {
    }
    if (+cu !== +cu) {
      const keyword = kwd[cu];
      if (keyword !== void 0) {
        pushRule({ keyword });
        continue;
      }
    }
    if (cu === "HYDROGEN") {
      pushRule({
        operator: "OR",
        rules: [
          { element: "H" },
          { element: "D" }
        ]
      });
      continue;
    }
    if (cu === "SMALL") {
      pushRule({ resname: SmallResname });
      continue;
    }
    if (cu === "NUCLEOPHILIC") {
      pushRule({ resname: NucleophilicResname });
      continue;
    }
    if (cu === "HYDROPHOBIC") {
      pushRule({ resname: HydrophobicResname });
      continue;
    }
    if (cu === "AROMATIC") {
      pushRule({ resname: AromaticResname });
      continue;
    }
    if (cu === "AMIDE") {
      pushRule({ resname: AmideResname });
      continue;
    }
    if (cu === "ACIDIC") {
      pushRule({ resname: AcidicResname });
      continue;
    }
    if (cu === "BASIC") {
      pushRule({ resname: BasicResname });
      continue;
    }
    if (cu === "CHARGED") {
      pushRule({ resname: ChargedResname });
      continue;
    }
    if (cu === "POLAR") {
      pushRule({ resname: PolarResname });
      continue;
    }
    if (cu === "NONPOLAR") {
      pushRule({ resname: NonpolarResname });
      continue;
    }
    if (cu === "CYCLIC") {
      pushRule({ resname: CyclicResname });
      continue;
    }
    if (cu === "ALIPHATIC") {
      pushRule({ resname: AliphaticResname });
      continue;
    }
    if (cu === "SIDECHAINATTACHED") {
      pushRule({
        operator: "OR",
        rules: [
          { keyword: 11 /* SIDECHAIN */ },
          {
            operator: "AND",
            negate: false,
            rules: [
              { keyword: 1 /* PROTEIN */ },
              {
                operator: "OR",
                negate: false,
                rules: [
                  { atomname: "CA" },
                  { atomname: "BB" }
                ]
              }
            ]
          },
          {
            operator: "AND",
            negate: false,
            rules: [
              { resname: "PRO" },
              { atomname: "N" }
            ]
          },
          {
            operator: "AND",
            negate: false,
            rules: [
              { keyword: 2 /* NUCLEIC */ },
              {
                operator: "OR",
                negate: true,
                rules: [
                  { atomname: "P" },
                  { atomname: "OP1" },
                  { atomname: "OP2" },
                  { atomname: "O3'" },
                  { atomname: "O3*" },
                  { atomname: "O5'" },
                  { atomname: "O5*" },
                  { atomname: "C5'" },
                  { atomname: "C5*" }
                ]
              }
            ]
          }
        ]
      });
      continue;
    }
    if (cu === "LIGAND") {
      pushRule({
        operator: "AND",
        rules: [
          {
            operator: "OR",
            rules: [
              {
                operator: "AND",
                rules: [
                  { keyword: 13 /* HETERO */ },
                  {
                    negate: true,
                    operator: void 0,
                    rules: [
                      { keyword: 5 /* POLYMER */ }
                    ]
                  }
                ]
              },
              {
                negate: true,
                operator: void 0,
                rules: [
                  { keyword: 5 /* POLYMER */ }
                ]
              }
            ]
          },
          {
            negate: true,
            operator: void 0,
            rules: [
              {
                operator: "OR",
                rules: [
                  { keyword: 6 /* WATER */ },
                  { keyword: 14 /* ION */ }
                ]
              }
            ]
          }
        ]
      });
      continue;
    }
    if (SelectAllKeyword.indexOf(cu) !== -1) {
      pushRule({ keyword: 12 /* ALL */ });
      continue;
    }
    if (c.charAt(0) === "@") {
      const indexList = c.substr(1).split(",").map((x) => parseInt(x));
      indexList.sort(function(a, b) {
        return a - b;
      });
      pushRule({ atomindex: indexList });
      continue;
    }
    if (c.charAt(0) === "#") {
      console.error("# for element selection deprecated, use _");
      pushRule({ element: cu.substr(1) });
      continue;
    }
    if (c.charAt(0) === "_") {
      pushRule({ element: cu.substr(1) });
      continue;
    }
    if (c[0] === "[" && c[c.length - 1] === "]") {
      const resnameList = cu.substr(1, c.length - 2).split(",");
      const resname = resnameList.length > 1 ? resnameList : resnameList[0];
      pushRule({ resname });
      continue;
    } else if (c.length >= 1 && c.length <= 4 && c[0] !== "^" && c[0] !== ":" && c[0] !== "." && c[0] !== "%" && c[0] !== "/" && isNaN(parseInt(c))) {
      pushRule({ resname: cu });
      continue;
    }
    const sele = {
      operator: "AND",
      rules: []
    };
    const model = c.split("/");
    if (model.length > 1 && model[1]) {
      if (isNaN(parseInt(model[1]))) {
        throw new Error("model must be an integer");
      }
      sele.rules.push({
        model: parseInt(model[1])
      });
    }
    const altloc = model[0].split("%");
    if (altloc.length > 1) {
      sele.rules.push({
        altloc: altloc[1]
      });
    }
    const atomname = altloc[0].split(".");
    if (atomname.length > 1 && atomname[1]) {
      if (atomname[1].length > 4) {
        throw new Error("atomname must be one to four characters");
      }
      sele.rules.push({
        atomname: atomname[1].substring(0, 4).toUpperCase()
      });
    }
    const chain = atomname[0].split(":");
    if (chain.length > 1 && chain[1]) {
      sele.rules.push({
        chainname: chain[1]
      });
    }
    const inscode = chain[0].split("^");
    if (inscode.length > 1) {
      sele.rules.push({
        inscode: inscode[1]
      });
    }
    if (inscode[0]) {
      let negate, negate2;
      if (inscode[0][0] === "-") {
        inscode[0] = inscode[0].substr(1);
        negate = true;
      }
      if (inscode[0].includes("--")) {
        inscode[0] = inscode[0].replace("--", "-");
        negate2 = true;
      }
      let resi = inscode[0].split("-");
      if (resi.length === 1) {
        let resiSingle = parseInt(resi[0]);
        if (isNaN(resiSingle)) {
          throw new Error("resi must be an integer");
        }
        if (negate) resiSingle *= -1;
        sele.rules.push({
          resno: resiSingle
        });
      } else if (resi.length === 2) {
        const resiRange = resi.map((x) => parseInt(x));
        if (negate) resiRange[0] *= -1;
        if (negate2) resiRange[1] *= -1;
        sele.rules.push({
          resno: [resiRange[0], resiRange[1]]
        });
      } else {
        throw new Error("resi range must contain one '-'");
      }
    }
    if (sele.rules.length === 1) {
      pushRule(sele.rules[0]);
    } else if (sele.rules.length > 1) {
      pushRule(sele);
    } else {
      throw new Error("empty selection chunk");
    }
  }
  if (retSelection.operator === void 0 && retSelection.rules.length === 1 && retSelection.rules[0].hasOwnProperty("operator")) {
    retSelection = retSelection.rules[0];
  }
  return retSelection;
}

// src/selection/selection-test.ts
function atomTestFn(a, s) {
  if (s.atomname === void 0 && s.element === void 0 && s.altloc === void 0 && s.atomindex === void 0 && s.keyword === void 0 && s.inscode === void 0 && s.resname === void 0 && s.sstruc === void 0 && s.resno === void 0 && s.chainname === void 0 && s.model === void 0) return -1;
  if (s.keyword !== void 0) {
    if (s.keyword === 10 /* BACKBONE */ && !a.isBackbone()) return false;
    if (s.keyword === 11 /* SIDECHAIN */ && !a.isSidechain()) return false;
    if (s.keyword === 16 /* BONDED */ && !a.isBonded()) return false;
    if (s.keyword === 17 /* RING */ && !a.isRing()) return false;
    if (s.keyword === 18 /* AROMATICRING */ && !a.isAromatic()) return false;
    if (s.keyword === 13 /* HETERO */ && !a.isHetero()) return false;
    if (s.keyword === 1 /* PROTEIN */ && !a.isProtein()) return false;
    if (s.keyword === 2 /* NUCLEIC */ && !a.isNucleic()) return false;
    if (s.keyword === 3 /* RNA */ && !a.isRna()) return false;
    if (s.keyword === 4 /* DNA */ && !a.isDna()) return false;
    if (s.keyword === 5 /* POLYMER */ && !a.isPolymer()) return false;
    if (s.keyword === 6 /* WATER */ && !a.isWater()) return false;
    if (s.keyword === 7 /* HELIX */ && !a.isHelix()) return false;
    if (s.keyword === 8 /* SHEET */ && !a.isSheet()) return false;
    if (s.keyword === 9 /* TURN */ && !a.isTurn()) return false;
    if (s.keyword === 14 /* ION */ && !a.isIon()) return false;
    if (s.keyword === 15 /* SACCHARIDE */ && !a.isSaccharide()) return false;
    if (s.keyword === 19 /* METAL */ && !a.isMetal()) return false;
  }
  if (s.atomname !== void 0 && s.atomname !== a.atomname) return false;
  if (s.element !== void 0 && s.element !== a.element) return false;
  if (s.altloc !== void 0 && s.altloc !== a.altloc) return false;
  if (s.atomindex !== void 0 && binarySearchIndexOf(s.atomindex, a.index) < 0) return false;
  if (s.resname !== void 0) {
    if (Array.isArray(s.resname)) {
      if (!s.resname.includes(a.resname)) return false;
    } else {
      if (s.resname !== a.resname) return false;
    }
  }
  if (s.sstruc !== void 0 && s.sstruc !== a.sstruc) return false;
  if (s.resno !== void 0) {
    if (Array.isArray(s.resno) && s.resno.length === 2) {
      if (s.resno[0] > a.resno || s.resno[1] < a.resno) return false;
    } else {
      if (s.resno !== a.resno) return false;
    }
  }
  if (s.inscode !== void 0 && s.inscode !== a.inscode) return false;
  if (s.chainname !== void 0 && s.chainname !== a.chainname) return false;
  if (s.model !== void 0 && s.model !== a.modelIndex) return false;
  return true;
}
function residueTestFn(r, s) {
  if (s.resname === void 0 && s.resno === void 0 && s.inscode === void 0 && s.sstruc === void 0 && s.model === void 0 && s.chainname === void 0 && s.atomindex === void 0 && (s.keyword === void 0 || AtomOnlyKeywords.includes(s.keyword))) return -1;
  if (s.keyword !== void 0) {
    if (s.keyword === 13 /* HETERO */ && !r.isHetero()) return false;
    if (s.keyword === 1 /* PROTEIN */ && !r.isProtein()) return false;
    if (s.keyword === 2 /* NUCLEIC */ && !r.isNucleic()) return false;
    if (s.keyword === 3 /* RNA */ && !r.isRna()) return false;
    if (s.keyword === 4 /* DNA */ && !r.isDna()) return false;
    if (s.keyword === 5 /* POLYMER */ && !r.isPolymer()) return false;
    if (s.keyword === 6 /* WATER */ && !r.isWater()) return false;
    if (s.keyword === 7 /* HELIX */ && !r.isHelix()) return false;
    if (s.keyword === 8 /* SHEET */ && !r.isSheet()) return false;
    if (s.keyword === 9 /* TURN */ && !r.isTurn()) return false;
    if (s.keyword === 14 /* ION */ && !r.isIon()) return false;
    if (s.keyword === 15 /* SACCHARIDE */ && !r.isSaccharide()) return false;
  }
  if (s.atomindex !== void 0 && rangeInSortedArray(s.atomindex, r.atomOffset, r.atomEnd) === 0) return false;
  if (s.resname !== void 0) {
    if (Array.isArray(s.resname)) {
      if (!s.resname.includes(r.resname)) return false;
    } else {
      if (s.resname !== r.resname) return false;
    }
  }
  if (s.sstruc !== void 0 && s.sstruc !== r.sstruc) return false;
  if (s.resno !== void 0) {
    if (Array.isArray(s.resno) && s.resno.length === 2) {
      if (s.resno[0] > r.resno || s.resno[1] < r.resno) return false;
    } else {
      if (s.resno !== r.resno) return false;
    }
  }
  if (s.inscode !== void 0 && s.inscode !== r.inscode) return false;
  if (s.chainname !== void 0 && s.chainname !== r.chainname) return false;
  if (s.model !== void 0 && s.model !== r.modelIndex) return false;
  return true;
}
function chainTestFn(c, s) {
  if (s.chainname === void 0 && s.model === void 0 && s.atomindex === void 0 && (s.keyword === void 0 || !ChainKeywords.includes(s.keyword) || !c.entity)) return -1;
  if (s.keyword !== void 0) {
    if (s.keyword === 5 /* POLYMER */ && !c.entity.isPolymer()) return false;
    if (s.keyword === 6 /* WATER */ && !c.entity.isWater()) return false;
  }
  if (s.atomindex !== void 0 && rangeInSortedArray(s.atomindex, c.atomOffset, c.atomEnd) === 0) return false;
  if (s.chainname !== void 0 && s.chainname !== c.chainname) return false;
  if (s.model !== void 0 && s.model !== c.modelIndex) return false;
  return true;
}
function modelTestFn(m, s) {
  if (s.model === void 0 && s.atomindex === void 0) return -1;
  if (s.atomindex !== void 0 && rangeInSortedArray(s.atomindex, m.atomOffset, m.atomEnd) === 0) return false;
  if (s.model !== void 0 && s.model !== m.index) return false;
  return true;
}
function makeTest(selection2, fn) {
  if (selection2 === null) return false;
  if (selection2.error) return false;
  if (!selection2.rules || selection2.rules.length === 0) return false;
  const n = selection2.rules.length;
  const t = !selection2.negate;
  const f = !!selection2.negate;
  const subTests = [];
  for (let i = 0; i < n; ++i) {
    const s = selection2.rules[i];
    if (s.hasOwnProperty("operator")) {
      subTests[i] = makeTest(s, fn);
    }
  }
  return function test(entity) {
    const and = selection2.operator === "AND";
    let na = false;
    for (let i = 0; i < n; ++i) {
      const s = selection2.rules[i];
      let ret;
      if (s.hasOwnProperty("operator")) {
        const test2 = subTests[i];
        if (test2 !== false) {
          ret = test2(entity);
        } else {
          ret = -1;
        }
        if (ret === -1) {
          na = true;
          continue;
        } else if (ret === true) {
          if (and) {
            continue;
          } else {
            return t;
          }
        } else {
          if (and) {
            return f;
          } else {
            continue;
          }
        }
      } else {
        if (s.keyword === 12 /* ALL */) {
          if (and) {
            continue;
          } else {
            return t;
          }
        } else if (s.keyword === 20 /* NONE */) {
          if (and) {
            continue;
          } else {
            return f;
          }
        }
        ret = fn(entity, s);
        if (ret === -1) {
          na = true;
          continue;
        } else if (ret === true) {
          if (and) {
            continue;
          } else {
            return t;
          }
        } else {
          if (and) {
            return f;
          } else {
            continue;
          }
        }
      }
    }
    if (na) {
      return -1;
    } else {
      if (and) {
        return t;
      } else {
        return f;
      }
    }
  };
}
function filter(selection2, fn) {
  if (selection2.error) return selection2;
  if (!selection2.rules || selection2.rules.length === 0) return selection2;
  const n = selection2.rules.length;
  const filtered = {
    operator: selection2.operator,
    rules: []
  };
  if (selection2.hasOwnProperty("negate")) {
    filtered.negate = selection2.negate;
  }
  for (let i = 0; i < n; ++i) {
    const s = selection2.rules[i];
    if (s.hasOwnProperty("operator")) {
      const fs = filter(s, fn);
      if (fs !== null) filtered.rules.push(fs);
    } else if (!fn(s)) {
      filtered.rules.push(s);
    }
  }
  if (filtered.rules.length > 0) {
    return selection2;
  } else {
    return null;
  }
}
function makeAtomTest(selection2, atomOnly = false) {
  let filteredSelection = selection2;
  if (atomOnly) {
    filteredSelection = filter(selection2, function(s) {
      if (s.keyword !== void 0 && !AtomOnlyKeywords.includes(s.keyword)) return true;
      if (s.model !== void 0) return true;
      if (s.chainname !== void 0) return true;
      if (s.resname !== void 0) return true;
      if (s.resno !== void 0) return true;
      if (s.sstruc !== void 0) return true;
      return false;
    });
  }
  return makeTest(filteredSelection, atomTestFn);
}
function makeResidueTest(selection2, residueOnly = false) {
  let filteredSelection = selection2;
  if (residueOnly) {
    filteredSelection = filter(selection2, function(s) {
      if (s.keyword !== void 0 && AtomOnlyKeywords.includes(s.keyword)) return true;
      if (s.model !== void 0) return true;
      if (s.chainname !== void 0) return true;
      if (s.atomname !== void 0) return true;
      if (s.element !== void 0) return true;
      if (s.altloc !== void 0) return true;
      return false;
    });
  }
  return makeTest(filteredSelection, residueTestFn);
}
function makeChainTest(selection2, chainOnly = false) {
  let filteredSelection = selection2;
  if (chainOnly) {
    filteredSelection = filter(selection2, function(s) {
      if (s.keyword !== void 0 && !ChainKeywords.includes(s.keyword)) return true;
      if (s.resname !== void 0) return true;
      if (s.resno !== void 0) return true;
      if (s.atomname !== void 0) return true;
      if (s.element !== void 0) return true;
      if (s.altloc !== void 0) return true;
      if (s.sstruc !== void 0) return true;
      if (s.inscode !== void 0) return true;
      return false;
    });
  }
  return makeTest(filteredSelection, chainTestFn);
}
function makeModelTest(selection2, modelOnly = false) {
  let filteredSelection = selection2;
  if (modelOnly) {
    filteredSelection = filter(selection2, function(s) {
      if (s.keyword !== void 0) return true;
      if (s.chainname !== void 0) return true;
      if (s.resname !== void 0) return true;
      if (s.resno !== void 0) return true;
      if (s.atomname !== void 0) return true;
      if (s.element !== void 0) return true;
      if (s.altloc !== void 0) return true;
      if (s.sstruc !== void 0) return true;
      if (s.inscode !== void 0) return true;
      return false;
    });
  }
  return makeTest(filteredSelection, modelTestFn);
}

// src/selection/selection.ts
var Selection = class {
  /**
   * Create Selection
   * @param {String} string - selection string, see {@tutorial selection-language}
   */
  constructor(string) {
    this.signals = {
      stringChanged: new import_signals.Signal()
    };
    this.setString(string);
  }
  get type() {
    return "selection";
  }
  setString(string, silent) {
    if (string === void 0) string = this.string || "";
    if (string === this.string) return;
    try {
      this.selection = parseSele(string);
    } catch (e) {
      this.selection = { "error": e.message };
    }
    const selection2 = this.selection;
    this.string = string;
    this.test = makeAtomTest(selection2);
    this.residueTest = makeResidueTest(selection2);
    this.chainTest = makeChainTest(selection2);
    this.modelTest = makeModelTest(selection2);
    this.atomOnlyTest = makeAtomTest(selection2, true);
    this.residueOnlyTest = makeResidueTest(selection2, true);
    this.chainOnlyTest = makeChainTest(selection2, true);
    this.modelOnlyTest = makeModelTest(selection2, true);
    if (!silent) {
      this.signals.stringChanged.dispatch(this.string);
    }
  }
  isAllSelection() {
    return SelectAllKeyword.includes(this.string.toUpperCase());
  }
  isNoneSelection() {
    return SelectNoneKeyword.includes(this.string.toUpperCase());
  }
};
var selection_default = Selection;

// src/symmetry/assembly.ts
function selectionFromChains(chainList) {
  let sele = "";
  if (chainList.length > 0) {
    sele = ":" + uniqueArray(chainList).join(" OR :");
  }
  return new selection_default(sele);
}
var Assembly = class {
  /**
   * @param {String} name - assembly name
   */
  constructor(name = "") {
    this.name = name;
    this.partList = [];
  }
  get type() {
    return "Assembly";
  }
  /**
   * Add transformed parts to the assembly
   * @example
   * var m1 = new NGL.Matrix4().set( ... );
   * var m2 = new NGL.Matrix4().set( ... );
   * var assembly = new NGL.Assembly( "myAssembly" );
   * // add part that transforms chain 'A' and 'B' using matrices `m1` and `m2`
   * assembly.addPart( [ m1, m2 ], [ "A", "B" ] )
   *
   * @param {Matrix4[]} matrixList - array of 4x4 transformation matrices
   * @param {String[]} chainList - array of chain names
   * @return {AssemblyPart} the added assembly part
   */
  addPart(matrixList, chainList) {
    const part = new AssemblyPart(matrixList, chainList);
    this.partList.push(part);
    return part;
  }
  /**
   * Get the number of atom for a given structure
   * @param  {Structure} structure - the given structure
   * @return {Integer} number of atoms in the assembly
   */
  getAtomCount(structure) {
    return this.partList.reduce(
      (count, part) => count + part.getAtomCount(structure),
      0
    );
  }
  /**
   * Get the number of residues for a given structure
   * @param  {Structure} structure - the given structure
   * @return {Integer} number of residues in the assembly
   */
  getResidueCount(structure) {
    return this.partList.reduce(
      (count, part) => count + part.getResidueCount(structure),
      0
    );
  }
  /**
   * Get number of instances the assembly will produce, i.e.
   * the number of transformations performed by the assembly
   * @return {Integer} number of instances
   */
  getInstanceCount() {
    let instanceCount = 0;
    this.partList.forEach(function(part) {
      instanceCount += part.matrixList.length;
    });
    return instanceCount;
  }
  /**
   * Determine if the assembly is the full and untransformed structure
   * @param  {Structure}  structure - the given structure
   * @return {Boolean} whether the assembly is identical to the structure
   */
  isIdentity(structure) {
    if (this.partList.length !== 1) return false;
    const part = this.partList[0];
    if (part.matrixList.length !== 1) return false;
    const identityMatrix = new Matrix4();
    if (!identityMatrix.equals(part.matrixList[0])) return false;
    let structureChainList = [];
    structure.eachChain(function(cp) {
      structureChainList.push(cp.chainname);
    });
    structureChainList = uniqueArray(structureChainList);
    if (part.chainList.length !== structureChainList.length) return false;
    return true;
  }
  getBoundingBox(structure) {
    const boundingBox = new Box3();
    this.partList.forEach(function(part) {
      const partBox = part.getBoundingBox(structure);
      boundingBox.expandByPoint(partBox.min);
      boundingBox.expandByPoint(partBox.max);
    });
    return boundingBox;
  }
  getCenter(structure) {
    return this.getBoundingBox(structure).getCenter(new Vector3());
  }
  getSelection() {
    let chainList = [];
    this.partList.forEach(function(part) {
      chainList = chainList.concat(part.chainList);
    });
    return selectionFromChains(chainList);
  }
};
var AssemblyPart = class {
  constructor(matrixList = [], chainList = []) {
    this.matrixList = matrixList;
    this.chainList = chainList;
  }
  get type() {
    return "AssemblyPart";
  }
  _getCount(structure, propertyName) {
    let count = 0;
    structure.eachChain((cp) => {
      if (this.chainList.length === 0 || this.chainList.includes(cp.chainname)) {
        count += cp[propertyName];
      }
    });
    return this.matrixList.length * count;
  }
  getAtomCount(structure) {
    return this._getCount(structure, "atomCount");
  }
  getResidueCount(structure) {
    return this._getCount(structure, "residueCount");
  }
  getBoundingBox(structure) {
    const partBox = new Box3();
    const instanceBox = new Box3();
    const selection2 = this.getSelection();
    const structureBox = structure.getBoundingBox(selection2);
    this.matrixList.forEach(function(matrix) {
      instanceBox.copy(structureBox).applyMatrix4(matrix);
      partBox.expandByPoint(instanceBox.min);
      partBox.expandByPoint(instanceBox.max);
    });
    return partBox;
  }
  getSelection() {
    return selectionFromChains(this.chainList);
  }
  getView(structure) {
    const selection2 = this.getSelection();
    if (selection2) {
      return structure.getView(selection2);
    } else {
      return structure;
    }
  }
  getInstanceList() {
    const instanceList = [];
    for (let j = 0, jl = this.matrixList.length; j < jl; ++j) {
      instanceList.push({
        id: j + 1,
        name: j,
        matrix: this.matrixList[j]
      });
    }
    return instanceList;
  }
};
var assembly_default = Assembly;

// src/structure/structure-builder.ts
var StructureBuilder = class {
  constructor(structure) {
    this.structure = structure;
    this.currentModelindex = null;
    this.currentChainid = null;
    this.currentResname = null;
    this.currentResno = null;
    this.currentInscode = void 0;
    this.currentHetero = null;
    this.previousResname = "";
    this.previousHetero = null;
    this.ai = -1;
    this.ri = -1;
    this.ci = -1;
    this.mi = -1;
  }
  addResidueType(ri) {
    const atomStore = this.structure.atomStore;
    const residueStore = this.structure.residueStore;
    const residueMap = this.structure.residueMap;
    const count = residueStore.atomCount[ri];
    const offset = residueStore.atomOffset[ri];
    const atomTypeIdList = new Array(count);
    for (let i = 0; i < count; ++i) {
      atomTypeIdList[i] = atomStore.atomTypeId[offset + i];
    }
    residueStore.residueTypeId[ri] = residueMap.add(
      this.previousResname,
      atomTypeIdList,
      this.previousHetero
      // TODO
    );
  }
  addAtom(modelindex, chainname, chainid, resname, resno, hetero, sstruc, inscode) {
    const atomStore = this.structure.atomStore;
    const residueStore = this.structure.residueStore;
    const chainStore = this.structure.chainStore;
    const modelStore = this.structure.modelStore;
    let addModel = false;
    let addChain = false;
    let addResidue = false;
    if (this.currentModelindex !== modelindex) {
      addModel = true;
      addChain = true;
      addResidue = true;
      this.mi += 1;
      this.ci += 1;
      this.ri += 1;
    } else if (this.currentChainid !== chainid) {
      addChain = true;
      addResidue = true;
      this.ci += 1;
      this.ri += 1;
    } else if (this.currentResno !== resno || this.currentResname !== resname || this.currentInscode !== inscode) {
      addResidue = true;
      this.ri += 1;
    }
    this.ai += 1;
    if (addModel) {
      modelStore.growIfFull();
      modelStore.chainOffset[this.mi] = this.ci;
      modelStore.chainCount[this.mi] = 0;
      modelStore.count += 1;
      chainStore.modelIndex[this.ci] = this.mi;
    }
    if (addChain) {
      chainStore.growIfFull();
      chainStore.setChainname(this.ci, chainname);
      chainStore.setChainid(this.ci, chainid);
      chainStore.residueOffset[this.ci] = this.ri;
      chainStore.residueCount[this.ci] = 0;
      chainStore.count += 1;
      chainStore.modelIndex[this.ci] = this.mi;
      modelStore.chainCount[this.mi] += 1;
      residueStore.chainIndex[this.ri] = this.ci;
    }
    if (addResidue) {
      this.previousResname = this.currentResname;
      this.previousHetero = this.currentHetero;
      if (this.ri > 0) this.addResidueType(this.ri - 1);
      residueStore.growIfFull();
      residueStore.resno[this.ri] = resno;
      if (sstruc !== void 0) {
        residueStore.sstruc[this.ri] = sstruc.charCodeAt(0);
      }
      if (inscode !== void 0) {
        residueStore.inscode[this.ri] = inscode.charCodeAt(0);
      }
      residueStore.atomOffset[this.ri] = this.ai;
      residueStore.atomCount[this.ri] = 0;
      residueStore.count += 1;
      residueStore.chainIndex[this.ri] = this.ci;
      chainStore.residueCount[this.ci] += 1;
    }
    atomStore.count += 1;
    atomStore.residueIndex[this.ai] = this.ri;
    residueStore.atomCount[this.ri] += 1;
    this.currentModelindex = modelindex;
    this.currentChainid = chainid;
    this.currentResname = resname;
    this.currentResno = resno;
    this.currentInscode = inscode;
    this.currentHetero = hetero;
  }
  finalize() {
    this.previousResname = this.currentResname;
    this.previousHetero = this.currentHetero;
    if (this.ri > -1) this.addResidueType(this.ri);
  }
};
var structure_builder_default = StructureBuilder;

// src/structure/structure-utils.ts
function assignSecondaryStructure(structure, secStruct) {
  if (!secStruct) return;
  if (Debug) Log.time("assignSecondaryStructure");
  const chainnames = [];
  structure.eachModel(function(mp) {
    mp.eachChain(function(cp) {
      chainnames.push(cp.chainname);
    });
  });
  const chainnamesSorted = chainnames.slice().sort();
  const chainnamesIndex = [];
  chainnamesSorted.forEach(function(c) {
    chainnamesIndex.push(chainnames.indexOf(c));
  });
  const helices = secStruct.helices.filter(function(h) {
    return binarySearchIndexOf(chainnamesSorted, h[0]) >= 0;
  });
  helices.sort(function(h1, h2) {
    const c1 = h1[0];
    const c2 = h2[0];
    const r1 = h1[1];
    const r2 = h2[1];
    if (c1 === c2) {
      if (r1 === r2) {
        return 0;
      } else {
        return r1 < r2 ? -1 : 1;
      }
    } else {
      const idx1 = binarySearchIndexOf(chainnamesSorted, c1);
      const idx2 = binarySearchIndexOf(chainnamesSorted, c2);
      return chainnamesIndex[idx1] < chainnamesIndex[idx2] ? -1 : 1;
    }
  });
  const residueStore = structure.residueStore;
  structure.eachModel(function(mp) {
    let i = 0;
    const n = helices.length;
    if (n === 0) return;
    let helix = helices[i];
    let helixRun = false;
    let done = false;
    mp.eachChain(function(cp) {
      let chainChange = false;
      if (cp.chainname === helix[0]) {
        const count = cp.residueCount;
        const offset = cp.residueOffset;
        const end = offset + count;
        for (let j = offset; j < end; ++j) {
          if (residueStore.resno[j] === helix[1] && // resnoBeg
          residueStore.getInscode(j) === helix[2]) {
            helixRun = true;
          }
          if (helixRun) {
            residueStore.sstruc[j] = helix[6];
            if (residueStore.resno[j] === helix[4] && // resnoEnd
            residueStore.getInscode(j) === helix[5]) {
              helixRun = false;
              i += 1;
              if (i < n) {
                j = offset - 1;
                helix = helices[i];
                chainChange = cp.chainname !== helix[0];
              } else {
                done = true;
              }
            }
          }
          if (chainChange || done) return;
        }
      }
    });
  });
  const sheets = secStruct.sheets.filter(function(s) {
    return binarySearchIndexOf(chainnamesSorted, s[0]) >= 0;
  });
  sheets.sort(function(s1, s2) {
    const c1 = s1[0];
    const c2 = s2[0];
    if (c1 === c2) return 0;
    const idx1 = binarySearchIndexOf(chainnamesSorted, c1);
    const idx2 = binarySearchIndexOf(chainnamesSorted, c2);
    return chainnamesIndex[idx1] < chainnamesIndex[idx2] ? -1 : 1;
  });
  const strandCharCode = "e".charCodeAt(0);
  structure.eachModel(function(mp) {
    let i = 0;
    const n = sheets.length;
    if (n === 0) return;
    let sheet = sheets[i];
    let sheetRun = false;
    let done = false;
    mp.eachChain(function(cp) {
      let chainChange = false;
      if (cp.chainname === sheet[0]) {
        const count = cp.residueCount;
        const offset = cp.residueOffset;
        const end = offset + count;
        for (let j = offset; j < end; ++j) {
          if (residueStore.resno[j] === sheet[1] && // resnoBeg
          residueStore.getInscode(j) === sheet[2]) {
            sheetRun = true;
          }
          if (sheetRun) {
            residueStore.sstruc[j] = strandCharCode;
            if (residueStore.resno[j] === sheet[4] && // resnoEnd
            residueStore.getInscode(j) === sheet[5]) {
              sheetRun = false;
              i += 1;
              if (i < n) {
                j = offset - 1;
                sheet = sheets[i];
                chainChange = cp.chainname !== sheet[0];
              } else {
                done = true;
              }
            }
          }
          if (chainChange || done) return;
        }
      }
    });
  });
  if (Debug) Log.timeEnd("assignSecondaryStructure");
}
var calculateSecondaryStructure = /* @__PURE__ */ (function() {
  const zhangSkolnickSS = function(polymer, i, distances, delta) {
    const structure = polymer.structure;
    const offset = polymer.residueIndexStart;
    const rp1 = structure.getResidueProxy();
    const rp2 = structure.getResidueProxy();
    const ap1 = structure.getAtomProxy();
    const ap2 = structure.getAtomProxy();
    for (let j = Math.max(0, i - 2); j <= i; ++j) {
      for (let k = 2; k < 5; ++k) {
        if (j + k >= polymer.residueCount) {
          continue;
        }
        rp1.index = offset + j;
        rp2.index = offset + j + k;
        ap1.index = rp1.traceAtomIndex;
        ap2.index = rp2.traceAtomIndex;
        const d = ap1.distanceTo(ap2);
        if (Math.abs(d - distances[k - 2]) > delta) {
          return false;
        }
      }
    }
    return true;
  };
  const isHelical = function(polymer, i) {
    const helixDistances = [5.45, 5.18, 6.37];
    const helixDelta = 2.1;
    return zhangSkolnickSS(polymer, i, helixDistances, helixDelta);
  };
  const isSheet = function(polymer, i) {
    const sheetDistances = [6.1, 10.4, 13];
    const sheetDelta = 1.42;
    return zhangSkolnickSS(polymer, i, sheetDistances, sheetDelta);
  };
  const proteinPolymer = function(p) {
    const residueStore = p.residueStore;
    const offset = p.residueIndexStart;
    for (let i = 0, il = p.residueCount; i < il; ++i) {
      let sstruc = "c";
      if (isHelical(p, i)) {
        sstruc = "h";
      } else if (isSheet(p, i)) {
        sstruc = "e";
      }
      residueStore.sstruc[offset + i] = sstruc.charCodeAt(0);
    }
  };
  const cgPolymer = function(p) {
    const localAngle = 20;
    const centerDist = 2;
    const residueStore = p.residueStore;
    const offset = p.residueIndexStart;
    const helixbundle = new helixbundle_default(p);
    const pos = helixbundle.position;
    const c1 = new Vector3();
    const c2 = new Vector3();
    for (let i = 0, il = p.residueCount; i < il; ++i) {
      c1.fromArray(pos.center, i * 3);
      c2.fromArray(pos.center, i * 3 + 3);
      const d = c1.distanceTo(c2);
      if (d < centerDist && d > 1 && pos.bending[i] < localAngle) {
        residueStore.sstruc[offset + i] = "h".charCodeAt(0);
        residueStore.sstruc[offset + i + 1] = "h".charCodeAt(0);
      }
    }
  };
  return function calculateSecondaryStructure2(structure) {
    if (Debug) Log.time("calculateSecondaryStructure");
    structure.eachPolymer(function(p) {
      if (p.residueCount < 4) return;
      if (p.isCg()) {
        cgPolymer(p);
      } else if (p.isProtein()) {
        proteinPolymer(p);
      } else {
        return;
      }
      let prevSstruc;
      let sstrucCount = 0;
      p.eachResidue(function(r) {
        if (r.sstruc === prevSstruc) {
          sstrucCount += 1;
        } else {
          if (sstrucCount === 1) {
            r.index -= 1;
            r.sstruc = "c";
          }
          sstrucCount = 1;
          prevSstruc = r.sstruc;
        }
      });
    });
    if (Debug) Log.timeEnd("calculateSecondaryStructure");
  };
})();
var ChainnameAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
function getChainname(index) {
  const n = ChainnameAlphabet.length;
  let j = index;
  let k = 0;
  let chainname = ChainnameAlphabet[j % n];
  while (j >= n) {
    j = Math.floor(j / n);
    chainname += ChainnameAlphabet[j % n];
    k += 1;
  }
  if (k >= 5) {
    Log.warn("chainname overflow");
  }
  return chainname;
}
function calculateChainnames(structure, useExistingBonds = false) {
  if (Debug) Log.time("calculateChainnames");
  let doAutoChainName = true;
  structure.eachChain(function(c) {
    if (c.chainname) doAutoChainName = false;
  });
  if (doAutoChainName) {
    const modelStore = structure.modelStore;
    const chainStore = structure.chainStore;
    const residueStore = structure.residueStore;
    const addChain = function(mIndex, chainname, rOffset, rCount) {
      const ci = chainStore.count;
      for (let i2 = 0; i2 < rCount; ++i2) {
        residueStore.chainIndex[rOffset + i2] = ci;
      }
      chainStore.growIfFull();
      chainStore.modelIndex[ci] = mIndex;
      chainStore.setChainname(ci, chainname);
      chainStore.setChainid(ci, chainname);
      chainStore.residueOffset[ci] = rOffset;
      chainStore.residueCount[ci] = rCount;
      chainStore.count += 1;
      modelStore.chainCount[mIndex] += 1;
    };
    const ap1 = structure.getAtomProxy();
    const ap2 = structure.getAtomProxy();
    let i = 0;
    let mi = 0;
    let rStart = 0;
    let rEnd = 0;
    const chainData = [];
    if (residueStore.count === 1) {
      chainData.push({
        mIndex: 0,
        chainname: "A",
        rStart: 0,
        rCount: 1
      });
    } else {
      structure.eachResidueN(2, function(rp1, rp2) {
        let newChain = false;
        const bbType1 = rp1.backboneType;
        const bbType2 = rp2.backboneType;
        const bbTypeUnk = UnknownBackboneType;
        rEnd = rp1.index;
        if (rp1.modelIndex !== rp2.modelIndex) {
          newChain = true;
        } else if (rp1.moleculeType !== rp2.moleculeType) {
          newChain = true;
        } else if (bbType1 !== bbTypeUnk && bbType1 === bbType2) {
          ap1.index = rp1.backboneEndAtomIndex;
          ap2.index = rp2.backboneStartAtomIndex;
          if (useExistingBonds) {
            newChain = !ap1.hasBondTo(ap2);
          } else {
            newChain = !ap1.connectedTo(ap2);
          }
        }
        if (!newChain && rp2.index === residueStore.count - 1) {
          newChain = true;
          rEnd = rp2.index;
        }
        if (newChain) {
          chainData.push({
            mIndex: mi,
            chainname: getChainname(i),
            rStart,
            rCount: rEnd - rStart + 1
          });
          i += 1;
          if (rp1.modelIndex !== rp2.modelIndex) {
            i = 0;
            mi += 1;
          }
          if (rp2.index === residueStore.count - 1 && rEnd !== rp2.index) {
            chainData.push({
              mIndex: mi,
              chainname: getChainname(i),
              rStart: residueStore.count - 1,
              rCount: 1
            });
          }
          rStart = rp2.index;
          rEnd = rp2.index;
        }
      });
    }
    chainStore.count = 0;
    chainData.forEach(function(d) {
      addChain(d.mIndex, d.chainname, d.rStart, d.rCount);
    });
    let chainOffset = 0;
    structure.eachModel(function(mp) {
      modelStore.chainOffset[mp.index] = chainOffset;
      modelStore.chainCount[mp.index] -= 1;
      chainOffset += modelStore.chainCount[mp.index];
    });
  }
  if (Debug) Log.timeEnd("calculateChainnames");
}
function calculateBonds(structure) {
  if (Debug) Log.time("calculateBonds");
  calculateBondsWithin(structure);
  calculateBondsBetween(structure);
  if (Debug) Log.timeEnd("calculateBonds");
}
var BondOrderTable = {
  "HIS|CD2|CG": 2,
  "HIS|CE1|ND1": 2,
  "ARG|CZ|NH2": 2,
  "PHE|CE1|CZ": 2,
  "PHE|CD2|CE2": 2,
  "PHE|CD1|CG": 2,
  "TRP|CD1|CG": 2,
  "TRP|CD2|CE2": 2,
  "TRP|CE3|CZ3": 2,
  "TRP|CH2|CZ2": 2,
  "ASN|CG|OD1": 2,
  "GLN|CD|OE1": 2,
  "TYR|CD1|CG": 2,
  "TYR|CD2|CE2": 2,
  "TYR|CE1|CZ": 2,
  "ASP|CG|OD1": 2,
  "GLU|CD|OE1": 2,
  "G|C8|N7": 2,
  "G|C4|C5": 2,
  "G|C2|N3": 2,
  "G|C6|O6": 2,
  "C|C4|N3": 2,
  "C|C5|C6": 2,
  "C|C2|O2": 2,
  "A|C2|N3": 2,
  "A|C6|N1": 2,
  "A|C4|C5": 2,
  "A|C8|N7": 2,
  "U|C5|C6": 2,
  "U|C2|O2": 2,
  "U|C4|O4": 2,
  "DG|C8|N7": 2,
  "DG|C4|C5": 2,
  "DG|C2|N3": 2,
  "DG|C6|O6": 2,
  "DC|C4|N3": 2,
  "DC|C5|C6": 2,
  "DC|C2|O2": 2,
  "DA|C2|N3": 2,
  "DA|C6|N1": 2,
  "DA|C4|C5": 2,
  "DA|C8|N7": 2,
  "DT|C5|C6": 2,
  "DT|C2|O2": 2,
  "DT|C4|O4": 2
};
function getBondOrderFromTable(resname, atomname1, atomname2) {
  [atomname1, atomname2] = atomname1 < atomname2 ? [atomname1, atomname2] : [atomname2, atomname1];
  if (AA3.includes(resname) && atomname1 === "C" && atomname2 === "O") return 2;
  if (Bases.includes(resname) && atomname1 === "OP1" && atomname2 === "P") return 2;
  return BondOrderTable[`${resname}|${atomname1}|${atomname2}`] || 1;
}
function calculateResidueBonds(r) {
  const structure = r.structure;
  const a1 = structure.getAtomProxy();
  const a2 = structure.getAtomProxy();
  const count = r.atomCount;
  const offset = r.atomOffset;
  const end = offset + count;
  const end1 = end - 1;
  const atomIndices1 = [];
  const atomIndices2 = [];
  const bondOrders = [];
  if (count > 500) {
    if (Debug) Log.warn("more than 500 atoms, skip residue for auto-bonding", r.qualifiedName());
  } else {
    if (count > 50) {
      const kdtree = new kdtree_default2(r, true);
      const radius = r.isCg() ? 1.2 : 2.3;
      for (let i = offset; i < end1; ++i) {
        a1.index = i;
        const maxd = a1.covalent + radius + 0.3;
        const nearestAtoms = kdtree.nearest(a1, Infinity, maxd * maxd);
        const m = nearestAtoms.length;
        for (let j = 0; j < m; ++j) {
          a2.index = nearestAtoms[j].index;
          if (a1.index < a2.index) {
            if (a1.connectedTo(a2)) {
              atomIndices1.push(a1.index - offset);
              atomIndices2.push(a2.index - offset);
              bondOrders.push(getBondOrderFromTable(a1.resname, a1.atomname, a2.atomname));
            }
          }
        }
      }
    } else {
      for (let i = offset; i < end1; ++i) {
        a1.index = i;
        for (let j = i + 1; j <= end1; ++j) {
          a2.index = j;
          if (a1.connectedTo(a2)) {
            atomIndices1.push(i - offset);
            atomIndices2.push(j - offset);
            bondOrders.push(getBondOrderFromTable(a1.resname, a1.atomname, a2.atomname));
          }
        }
      }
    }
  }
  return {
    atomIndices1,
    atomIndices2,
    bondOrders
  };
}
function calculateAtomBondMap(structure) {
  if (Debug) Log.time("calculateAtomBondMap");
  var atomBondMap = [];
  structure.eachBond(function(bp) {
    var ai1 = bp.atomIndex1;
    var ai2 = bp.atomIndex2;
    if (atomBondMap[ai1] === void 0) atomBondMap[ai1] = [];
    atomBondMap[ai1][ai2] = bp.index;
  });
  if (Debug) Log.timeEnd("calculateAtomBondMap");
  return atomBondMap;
}
function calculateBondsWithin(structure, onlyAddRung = false) {
  if (Debug) Log.time("calculateBondsWithin");
  const bondStore = structure.bondStore;
  const rungBondStore = structure.rungBondStore;
  const rungAtomSet = structure.getAtomSet(false);
  const a1 = structure.getAtomProxy();
  const a2 = structure.getAtomProxy();
  const bp = structure.getBondProxy();
  const atomBondMap = onlyAddRung ? null : calculateAtomBondMap(structure);
  structure.eachResidue(function(r) {
    if (!onlyAddRung && atomBondMap) {
      const count = r.atomCount;
      const offset = r.atomOffset;
      if (count > 500) {
        Log.warn("more than 500 atoms, skip residue for auto-bonding", r.qualifiedName());
        return;
      }
      const bonds = r.getBonds();
      const atomIndices1 = bonds.atomIndices1;
      const atomIndices2 = bonds.atomIndices2;
      const bondOrders = bonds.bondOrders;
      const nn = atomIndices1.length;
      for (let i = 0; i < nn; ++i) {
        const rai1 = atomIndices1[i];
        const rai2 = atomIndices2[i];
        const ai1 = rai1 + offset;
        const ai2 = rai2 + offset;
        const tmp = atomBondMap[ai1];
        if (tmp !== void 0 && tmp[ai2] !== void 0) {
          bp.index = tmp[ai2];
          const residueTypeBondIndex = r.residueType.getBondIndex(rai1, rai2);
          bondOrders[residueTypeBondIndex] = bp.bondOrder;
        } else {
          a1.index = ai1;
          a2.index = ai2;
          bondStore.addBond(a1, a2, bondOrders[i]);
        }
      }
    }
    const traceAtomIndex = r.residueType.traceAtomIndex;
    const rungEndAtomIndex = r.residueType.rungEndAtomIndex;
    if (traceAtomIndex !== -1 && rungEndAtomIndex !== -1) {
      a1.index = r.traceAtomIndex;
      a2.index = r.rungEndAtomIndex;
      rungBondStore.addBond(a1, a2);
      rungAtomSet.set(a1.index);
      rungAtomSet.set(a2.index);
    }
  });
  structure.atomSetDict.rung = rungAtomSet;
  if (Debug) Log.timeEnd("calculateBondsWithin");
}
function calculateBondsBetween(structure, onlyAddBackbone = false, useExistingBonds = false) {
  if (Debug) Log.time("calculateBondsBetween");
  const bondStore = structure.bondStore;
  const backboneBondStore = structure.backboneBondStore;
  const backboneAtomSet = structure.getAtomSet(false);
  const ap1 = structure.getAtomProxy();
  const ap2 = structure.getAtomProxy();
  if (backboneBondStore.count === 0) {
    backboneBondStore.resize(structure.residueStore.count);
  }
  function addBondIfConnected(rp12, rp22) {
    const bbType1 = rp12.backboneType;
    const bbType2 = rp22.backboneType;
    if (bbType1 !== UnknownBackboneType && bbType1 === bbType2) {
      ap1.index = rp12.backboneEndAtomIndex;
      ap2.index = rp22.backboneStartAtomIndex;
      if (useExistingBonds && ap1.hasBondTo(ap2) || ap1.connectedTo(ap2)) {
        if (!onlyAddBackbone) {
          bondStore.addBond(ap1, ap2, 1);
        }
        ap1.index = rp12.traceAtomIndex;
        ap2.index = rp22.traceAtomIndex;
        backboneBondStore.addBond(ap1, ap2);
        backboneAtomSet.set(ap1.index);
        backboneAtomSet.set(ap2.index);
      }
    }
  }
  structure.eachResidueN(2, addBondIfConnected);
  const rp1 = structure.getResidueProxy();
  const rp2 = structure.getResidueProxy();
  structure.eachChain(function(cp) {
    if (cp.residueCount === 0) return;
    rp1.index = cp.residueOffset;
    rp2.index = cp.residueOffset + cp.residueCount - 1;
    addBondIfConnected(rp2, rp1);
  });
  structure.atomSetDict.backbone = backboneAtomSet;
  if (!onlyAddBackbone) {
    if (Debug) Log.time("calculateBondsBetween inter");
    const spatialHash = structure.spatialHash;
    structure.eachResidue(function(rp) {
      if (rp.backboneType === UnknownBackboneType && !rp.isWater()) {
        rp.eachAtom(function(ap) {
          if (ap.isMetal()) return;
          spatialHash.eachWithin(ap.x, ap.y, ap.z, 4, function(idx) {
            ap2.index = idx;
            if (ap.modelIndex === ap2.modelIndex && ap.residueIndex !== ap2.residueIndex && !ap2.isMetal()) {
              bondStore.addBondIfConnected(ap, ap2, 1);
            }
          });
        });
      }
    });
    if (Debug) Log.timeEnd("calculateBondsBetween inter");
  }
  if (Debug) Log.timeEnd("calculateBondsBetween");
}
function buildUnitcellAssembly(structure) {
  if (!structure.unitcell) return;
  if (Debug) Log.time("buildUnitcellAssembly");
  const uc = structure.unitcell;
  const structureCenterFrac = structure.center.clone().applyMatrix4(uc.cartToFrac);
  const centerFrac = structureCenterFrac.clone().floor();
  const symopDict = getSymmetryOperations(uc.spacegroup);
  const centerFracSymop = new Vector3();
  const positionFracSymop = new Vector3();
  function getMatrixList(shift) {
    const matrixList = [];
    Object.keys(symopDict).forEach(function(name) {
      const m = symopDict[name].clone();
      centerFracSymop.copy(structureCenterFrac).applyMatrix4(m).floor();
      positionFracSymop.setFromMatrixPosition(m);
      positionFracSymop.sub(centerFracSymop);
      positionFracSymop.add(centerFrac);
      if (shift) positionFracSymop.add(shift);
      m.setPosition(positionFracSymop);
      m.multiplyMatrices(uc.fracToCart, m);
      m.multiply(uc.cartToFrac);
      matrixList.push(m);
    });
    return matrixList;
  }
  const unitcellAssembly = new assembly_default("UNITCELL");
  const unitcellMatrixList = getMatrixList();
  const ncsMatrixList = [];
  if (structure.biomolDict.NCS) {
    ncsMatrixList.push(
      new Matrix4(),
      ...structure.biomolDict.NCS.partList[0].matrixList
    );
    const ncsUnitcellMatrixList = [];
    unitcellMatrixList.forEach((sm) => {
      ncsMatrixList.forEach((nm) => {
        ncsUnitcellMatrixList.push(sm.clone().multiply(nm));
      });
    });
    unitcellAssembly.addPart(ncsUnitcellMatrixList);
  } else {
    unitcellAssembly.addPart(unitcellMatrixList);
  }
  const vec = new Vector3();
  const supercellAssembly = new assembly_default("SUPERCELL");
  const supercellMatrixList = Array.prototype.concat.call(
    getMatrixList(vec.set(1, 0, 0)),
    // 655
    getMatrixList(vec.set(0, 1, 0)),
    // 565
    getMatrixList(vec.set(0, 0, 1)),
    // 556
    getMatrixList(vec.set(-1, 0, 0)),
    // 455
    getMatrixList(vec.set(0, -1, 0)),
    // 545
    getMatrixList(vec.set(0, 0, -1)),
    // 554
    getMatrixList(vec.set(1, 1, 0)),
    // 665
    getMatrixList(vec.set(1, 0, 1)),
    // 656
    getMatrixList(vec.set(0, 1, 1)),
    // 566
    getMatrixList(vec.set(-1, -1, 0)),
    // 445
    getMatrixList(vec.set(-1, 0, -1)),
    // 454
    getMatrixList(vec.set(0, -1, -1)),
    // 544
    getMatrixList(vec.set(1, -1, -1)),
    // 644
    getMatrixList(vec.set(1, 1, -1)),
    // 664
    getMatrixList(vec.set(1, -1, 1)),
    // 646
    getMatrixList(vec.set(-1, 1, 1)),
    // 466
    getMatrixList(vec.set(-1, -1, 1)),
    // 446
    getMatrixList(vec.set(-1, 1, -1)),
    // 464
    getMatrixList(vec.set(0, 1, -1)),
    // 564
    getMatrixList(vec.set(0, -1, 1)),
    // 546
    getMatrixList(vec.set(1, 0, -1)),
    // 654
    getMatrixList(vec.set(-1, 0, 1)),
    // 456
    getMatrixList(vec.set(1, -1, 0)),
    // 645
    getMatrixList(vec.set(-1, 1, 0)),
    // 465
    getMatrixList(),
    // 555
    getMatrixList(vec.set(1, 1, 1)),
    // 666
    getMatrixList(vec.set(-1, -1, -1))
    // 444
  );
  if (structure.biomolDict.NCS) {
    const ncsSupercellMatrixList = [];
    supercellMatrixList.forEach(function(sm) {
      ncsMatrixList.forEach(function(nm) {
        ncsSupercellMatrixList.push(sm.clone().multiply(nm));
      });
    });
    supercellAssembly.addPart(ncsSupercellMatrixList);
  } else {
    supercellAssembly.addPart(supercellMatrixList);
  }
  structure.biomolDict.UNITCELL = unitcellAssembly;
  structure.biomolDict.SUPERCELL = supercellAssembly;
  if (Debug) Log.timeEnd("buildUnitcellAssembly");
}
var elm1 = ["H", "C", "O", "N", "S", "P"];
var elm2 = ["NA", "CL", "FE"];
function guessElement(atomName) {
  let at = atomName.trim().toUpperCase();
  if (parseInt(at.charAt(0))) at = at.substr(1);
  if (parseInt(at.charAt(0))) at = at.substr(1);
  const n = at.length;
  if (n === 0) return "";
  if (n === 1) return at;
  if (n === 2) {
    if (elm2.indexOf(at) !== -1) return at;
    if (elm1.indexOf(at[0]) !== -1) return at[0];
  }
  if (n >= 3) {
    if (elm1.indexOf(at[0]) !== -1) return at[0];
  }
  return "";
}
function assignResidueTypeBonds(structure) {
  const bondHash = structure.bondHash;
  const countArray = bondHash.countArray;
  const offsetArray = bondHash.offsetArray;
  const indexArray = bondHash.indexArray;
  const bp = structure.getBondProxy();
  structure.eachResidue(function(rp) {
    const residueType = rp.residueType;
    if (residueType.bonds !== void 0) return;
    var atomOffset = rp.atomOffset;
    var atomIndices1 = [];
    var atomIndices2 = [];
    var bondOrders = [];
    var bondDict = {};
    const nextAtomOffset = atomOffset + rp.atomCount;
    rp.eachAtom(function(ap) {
      const index = ap.index;
      const offset = offsetArray[index];
      const count = countArray[index];
      for (let i = 0, il = count; i < il; ++i) {
        bp.index = indexArray[offset + i];
        let idx1 = bp.atomIndex1;
        if (idx1 < atomOffset || idx1 >= nextAtomOffset) {
          continue;
        }
        let idx2 = bp.atomIndex2;
        if (idx2 < atomOffset || idx2 >= nextAtomOffset) {
          continue;
        }
        if (idx1 > idx2) {
          const tmp = idx2;
          idx2 = idx1;
          idx1 = tmp;
        }
        const hash = idx1 + "|" + idx2;
        if (bondDict[hash] === void 0) {
          bondDict[hash] = true;
          atomIndices1.push(idx1 - atomOffset);
          atomIndices2.push(idx2 - atomOffset);
          bondOrders.push(bp.bondOrder);
        }
      }
    });
    residueType.bonds = {
      atomIndices1,
      atomIndices2,
      bondOrders
    };
  });
}
function concatStructures(name, ...structures) {
  if (Debug) Log.time("concatStructures");
  const s = new structure_default(name, "");
  const sb = new structure_builder_default(s);
  const atomStore = s.atomStore;
  const atomMap = s.atomMap;
  atomStore.addField("formalCharge", 1, "int8");
  atomStore.addField("partialCharge", 1, "float32");
  const atomIndexDict = {};
  let idx = 0;
  let atomCount = 0;
  let modelCount = 0;
  structures.forEach((structure) => {
    structure.eachAtom((a) => {
      atomStore.growIfFull();
      atomStore.atomTypeId[idx] = atomMap.add(a.atomname, a.element);
      atomStore.x[idx] = a.x;
      atomStore.y[idx] = a.y;
      atomStore.z[idx] = a.z;
      atomStore.serial[idx] = a.serial;
      atomStore.formalCharge[idx] = a.formalCharge;
      atomStore.partialCharge[idx] = a.partialCharge;
      atomStore.altloc[idx] = a.altloc;
      atomStore.occupancy[idx] = a.occupancy;
      atomStore.bfactor[idx] = a.bfactor;
      sb.addAtom(
        a.modelIndex + modelCount,
        a.chainname,
        a.chainid,
        a.resname,
        a.resno,
        a.hetero === 1,
        a.sstruc,
        a.inscode
      );
      atomIndexDict[a.index + atomCount] = idx;
      idx += 1;
    });
    atomCount += structure.atomStore.count;
    modelCount += structure.modelStore.count;
  });
  const bondStore = s.bondStore;
  const a1 = s.getAtomProxy();
  const a2 = s.getAtomProxy();
  atomCount = 0;
  structures.forEach((structure) => {
    structure.eachBond((b) => {
      a1.index = atomIndexDict[b.atomIndex1 + atomCount];
      a2.index = atomIndexDict[b.atomIndex2 + atomCount];
      bondStore.addBond(a1, a2, b.bondOrder);
    });
    atomCount += structure.atomStore.count;
  });
  sb.finalize();
  calculateBondsBetween(s, true);
  calculateBondsWithin(s, true);
  s.finalizeAtoms();
  s.finalizeBonds();
  assignResidueTypeBonds(s);
  if (Debug) Log.timeEnd("concatStructures");
  return s;
}

// src/store/atom-type.ts
var AlkaliMetals = [3, 11, 19, 37, 55, 87];
var AlkalineEarthMetals = [4, 12, 20, 38, 56, 88];
var PolyatomicNonmetals = [6, 15, 16, 34];
var DiatomicNonmetals = [1, 7, 8, 9, 17, 35, 53];
var NobleGases = [2, 10, 18, 36, 54, 86];
var PostTransitionMetals = [13, 30, 31, 48, 49, 50, 80, 81, 82, 83, 84, 85, 112];
var Metalloids = [5, 14, 32, 33, 51, 52, 85];
var Halogens = [9, 17, 35, 53, 85];
var AtomType = class {
  /**
   * @param {Structure} structure - the structure object
   * @param {String} atomname - the name of the atom
   * @param {String} element - the chemical element
   */
  constructor(structure, atomname, element) {
    this.structure = structure;
    this.atomname = atomname;
    element = element || guessElement(atomname);
    this.element = element;
    this.number = AtomicNumbers[element] || DefaultAtomicNumber;
    this.vdw = VdwRadii[this.number] || DefaultVdwRadius;
    this.covalent = CovalentRadii[this.number] || DefaultCovalentRadius;
  }
  getDefaultValence() {
    const vl = Valences[this.number];
    return vl ? vl[0] : DefaultValence;
  }
  getValenceList() {
    return Valences[this.number] || [];
  }
  getOuterShellElectronCount() {
    return OuterShellElectronCounts[this.number] || DefaultOuterShellElectronCount;
  }
  isMetal() {
    return this.isAlkaliMetal() || this.isAlkalineEarthMetal() || this.isLanthanide() || this.isActinide() || this.isTransitionMetal() || this.isPostTransitionMetal();
  }
  isNonmetal() {
    return this.isDiatomicNonmetal() || this.isPolyatomicNonmetal() || this.isNobleGas();
  }
  isMetalloid() {
    return Metalloids.includes(this.number);
  }
  isHalogen() {
    return Halogens.includes(this.number);
  }
  isDiatomicNonmetal() {
    return DiatomicNonmetals.includes(this.number);
  }
  isPolyatomicNonmetal() {
    return PolyatomicNonmetals.includes(this.number);
  }
  isAlkaliMetal() {
    return AlkaliMetals.includes(this.number);
  }
  isAlkalineEarthMetal() {
    return AlkalineEarthMetals.includes(this.number);
  }
  isNobleGas() {
    return NobleGases.includes(this.number);
  }
  isTransitionMetal() {
    const no = this.number;
    return no >= 21 && no <= 29 || no >= 39 && no <= 47 || no >= 72 && no <= 79 || no >= 104 && no <= 108;
  }
  isPostTransitionMetal() {
    return PostTransitionMetals.includes(this.number);
  }
  isLanthanide() {
    return this.number >= 57 && this.number <= 71;
  }
  isActinide() {
    return this.number >= 89 && this.number <= 103;
  }
};
var atom_type_default = AtomType;

// src/store/atom-map.ts
function getHash(atomname, element) {
  return atomname + "|" + element;
}
var AtomMap = class {
  constructor(structure) {
    this.structure = structure;
    this.dict = {};
    this.list = [];
    this.structure = structure;
  }
  add(atomname, element) {
    atomname = atomname.toUpperCase();
    if (!element) {
      element = guessElement(atomname);
    } else {
      element = element.toUpperCase();
    }
    const hash = getHash(atomname, element);
    let id = this.dict[hash];
    if (id === void 0) {
      const atomType = new atom_type_default(this.structure, atomname, element);
      id = this.list.length;
      this.dict[hash] = id;
      this.list.push(atomType);
    }
    return id;
  }
  get(id) {
    return this.list[id];
  }
};
var atom_map_default = AtomMap;

// src/store/residue-type.ts
var ResidueType = class {
  /**
   * @param {Structure} structure - the structure object
   * @param {String} resname - name of the residue
   * @param {Array} atomTypeIdList - list of IDs of {@link AtomType}s corresponding
   *                                 to the atoms of the residue
   * @param {Boolean} hetero - hetero flag
   * @param {String} chemCompType - chemical component type
   * @param {Object} [bonds] - TODO
   */
  constructor(structure, resname, atomTypeIdList, hetero, chemCompType, bonds) {
    this.structure = structure;
    // Sparse array containing the reference atom index for each bond.
    this.bondReferenceAtomIndices = [];
    this.resname = resname;
    this.atomTypeIdList = atomTypeIdList;
    this.hetero = hetero ? 1 : 0;
    this.chemCompType = chemCompType;
    this.bonds = bonds;
    this.atomCount = atomTypeIdList.length;
    this.moleculeType = this.getMoleculeType();
    this.backboneType = this.getBackboneType(0);
    this.backboneEndType = this.getBackboneType(-1);
    this.backboneStartType = this.getBackboneType(1);
    this.backboneIndexList = this.getBackboneIndexList();
    const atomnames = ResidueTypeAtoms[this.backboneType];
    const atomnamesStart = ResidueTypeAtoms[this.backboneStartType];
    const atomnamesEnd = ResidueTypeAtoms[this.backboneEndType];
    const traceIndex = this.getAtomIndexByName(atomnames.trace);
    this.traceAtomIndex = defaults(traceIndex, -1);
    const dir1Index = this.getAtomIndexByName(atomnames.direction1);
    this.direction1AtomIndex = defaults(dir1Index, -1);
    const dir2Index = this.getAtomIndexByName(atomnames.direction2);
    this.direction2AtomIndex = defaults(dir2Index, -1);
    const bbStartIndex = this.getAtomIndexByName(atomnamesStart.backboneStart);
    this.backboneStartAtomIndex = defaults(bbStartIndex, -1);
    const bbEndIndex = this.getAtomIndexByName(atomnamesEnd.backboneEnd);
    this.backboneEndAtomIndex = defaults(bbEndIndex, -1);
    let rungEndIndex;
    if (PurinBases.includes(resname)) {
      rungEndIndex = this.getAtomIndexByName("N1");
    } else {
      rungEndIndex = this.getAtomIndexByName("N3");
    }
    this.rungEndAtomIndex = defaults(rungEndIndex, -1);
  }
  getBackboneIndexList() {
    const backboneIndexList = [];
    let atomnameList;
    switch (this.moleculeType) {
      case ProteinType:
        atomnameList = ProteinBackboneAtoms;
        break;
      case RnaType:
      case DnaType:
        atomnameList = NucleicBackboneAtoms;
        break;
      default:
        return backboneIndexList;
    }
    const atomMap = this.structure.atomMap;
    const atomTypeIdList = this.atomTypeIdList;
    for (let i = 0, il = this.atomCount; i < il; ++i) {
      const atomType = atomMap.get(atomTypeIdList[i]);
      if (atomnameList.includes(atomType.atomname)) {
        backboneIndexList.push(i);
      }
    }
    return backboneIndexList;
  }
  getMoleculeType() {
    if (this.isProtein()) {
      return ProteinType;
    } else if (this.isRna()) {
      return RnaType;
    } else if (this.isDna()) {
      return DnaType;
    } else if (this.isWater()) {
      return WaterType;
    } else if (this.isIon()) {
      return IonType;
    } else if (this.isSaccharide()) {
      return SaccharideType;
    } else {
      return UnknownType;
    }
  }
  getBackboneType(position) {
    if (this.hasProteinBackbone(position)) {
      return ProteinBackboneType;
    } else if (this.hasRnaBackbone(position)) {
      return RnaBackboneType;
    } else if (this.hasDnaBackbone(position)) {
      return DnaBackboneType;
    } else if (this.hasCgProteinBackbone(position)) {
      return CgProteinBackboneType;
    } else if (this.hasCgRnaBackbone(position)) {
      return CgRnaBackboneType;
    } else if (this.hasCgDnaBackbone(position)) {
      return CgDnaBackboneType;
    } else {
      return UnknownBackboneType;
    }
  }
  isProtein() {
    if (this.chemCompType) {
      return ChemCompProtein.includes(this.chemCompType);
    } else {
      return this.hasAtomWithName("CA", "C", "N") || AA3.includes(this.resname);
    }
  }
  isCg() {
    const backboneType = this.backboneType;
    return backboneType === CgProteinBackboneType || backboneType === CgRnaBackboneType || backboneType === CgDnaBackboneType;
  }
  isNucleic() {
    return this.isRna() || this.isDna();
  }
  isRna() {
    if (this.chemCompType) {
      return ChemCompRna.includes(this.chemCompType);
    } else if (this.hetero === 1) {
      return false;
    } else {
      return this.hasAtomWithName(
        ["P", "O3'", "O3*"],
        ["C4'", "C4*"],
        ["O2'", "O2*", "F2'", "F2*"]
      ) || RnaBases.includes(this.resname) && this.hasAtomWithName(["O2'", "O2*", "F2'", "F2*"]);
    }
  }
  isDna() {
    if (this.chemCompType) {
      return ChemCompDna.includes(this.chemCompType);
    } else if (this.hetero === 1) {
      return false;
    } else {
      return this.hasAtomWithName(["P", "O3'", "O3*"], ["C3'", "C3*"]) && !this.hasAtomWithName(["O2'", "O2*", "F2'", "F2*"]) || DnaBases.includes(this.resname);
    }
  }
  isHetero() {
    return this.hetero === 1;
  }
  isIon() {
    return IonNames.includes(this.resname);
  }
  isWater() {
    return WaterNames.includes(this.resname);
  }
  isSaccharide() {
    if (this.chemCompType) {
      return ChemCompSaccharide.includes(this.chemCompType);
    } else {
      return SaccharideNames.includes(this.resname);
    }
  }
  isStandardAminoacid() {
    return AA3.includes(this.resname);
  }
  isStandardBase() {
    return Bases.includes(this.resname);
  }
  hasBackboneAtoms(position, type) {
    const atomnames = ResidueTypeAtoms[type];
    if (position === -1) {
      return this.hasAtomWithName(
        atomnames.trace,
        atomnames.backboneEnd,
        atomnames.direction1,
        atomnames.direction2
      );
    } else if (position === 0) {
      return this.hasAtomWithName(
        atomnames.trace,
        atomnames.direction1,
        atomnames.direction2
      );
    } else if (position === 1) {
      return this.hasAtomWithName(
        atomnames.trace,
        atomnames.backboneStart,
        atomnames.direction1,
        atomnames.direction2
      );
    } else {
      return this.hasAtomWithName(
        atomnames.trace,
        atomnames.backboneStart,
        atomnames.backboneEnd,
        atomnames.direction1,
        atomnames.direction2
      );
    }
  }
  hasProteinBackbone(position) {
    return this.isProtein() && this.hasBackboneAtoms(position, ProteinBackboneType);
  }
  hasRnaBackbone(position) {
    return this.isRna() && this.hasBackboneAtoms(position, RnaBackboneType);
  }
  hasDnaBackbone(position) {
    return this.isDna() && this.hasBackboneAtoms(position, DnaBackboneType);
  }
  hasCgProteinBackbone(position) {
    return this.atomCount < 7 && this.isProtein() && this.hasBackboneAtoms(position, CgProteinBackboneType);
  }
  hasCgRnaBackbone(position) {
    return this.atomCount < 11 && this.isRna() && this.hasBackboneAtoms(position, CgRnaBackboneType);
  }
  hasCgDnaBackbone(position) {
    return this.atomCount < 11 && this.isDna() && this.hasBackboneAtoms(position, CgDnaBackboneType);
  }
  hasBackbone(position) {
    return this.hasProteinBackbone(position) || this.hasRnaBackbone(position) || this.hasDnaBackbone(position) || this.hasCgProteinBackbone(position) || this.hasCgRnaBackbone(position) || this.hasCgDnaBackbone(position);
  }
  getAtomIndexByName(atomname) {
    const n = this.atomCount;
    const atomMap = this.structure.atomMap;
    const atomTypeIdList = this.atomTypeIdList;
    if (Array.isArray(atomname)) {
      for (let i = 0; i < n; ++i) {
        const index = atomTypeIdList[i];
        if (atomname.includes(atomMap.get(index).atomname)) {
          return i;
        }
      }
    } else {
      for (let i = 0; i < n; ++i) {
        const index = atomTypeIdList[i];
        if (atomname === atomMap.get(index).atomname) {
          return i;
        }
      }
    }
    return void 0;
  }
  hasAtomWithName(...atomnames) {
    const n = atomnames.length;
    for (let i = 0; i < n; ++i) {
      if (atomnames[i] === void 0) continue;
      if (this.getAtomIndexByName(atomnames[i]) === void 0) {
        return false;
      }
    }
    return true;
  }
  getBonds(r) {
    if (this.bonds === void 0) {
      this.bonds = calculateResidueBonds(r);
    }
    return this.bonds;
  }
  getRings() {
    if (this.rings === void 0) {
      this.calculateRings();
    }
    return this.rings;
  }
  getBondGraph() {
    if (this.bondGraph === void 0) {
      this.calculateBondGraph();
    }
    return this.bondGraph;
  }
  getAromatic(a) {
    if (this.aromaticAtoms === void 0) {
      this.calculateAromatic(this.structure.getResidueProxy(a.residueIndex));
    }
    return this.aromaticAtoms;
  }
  getAromaticRings(r) {
    if (this.aromaticRings === void 0) {
      this.calculateAromatic(r);
    }
    return this.aromaticRings;
  }
  /**
   * @return {Object} bondGraph - represents the bonding in this
   *   residue: { ai1: [ ai2, ai3, ...], ...}
   */
  calculateBondGraph() {
    const bondGraph = this.bondGraph = {};
    const bonds = this.getBonds();
    const nb = bonds.atomIndices1.length;
    const atomIndices1 = bonds.atomIndices1;
    const atomIndices2 = bonds.atomIndices2;
    for (let i = 0; i < nb; ++i) {
      const ai1 = atomIndices1[i];
      const ai2 = atomIndices2[i];
      const a1 = bondGraph[ai1] = bondGraph[ai1] || [];
      a1.push(ai2);
      const a2 = bondGraph[ai2] = bondGraph[ai2] || [];
      a2.push(ai1);
    }
  }
  /**
   * Find all rings up to 2 * RingFinderMaxDepth
   */
  calculateRings() {
    const bondGraph = this.getBondGraph();
    const state = RingFinderState(bondGraph, this.atomCount);
    for (let i = 0; i < state.count; i++) {
      if (state.visited[i] >= 0) continue;
      findRings(state, i);
    }
    this.rings = { atomRings: state.atomRings, rings: state.rings };
  }
  isAromatic(atom) {
    this.aromaticAtoms = this.getAromatic(atom);
    return this.aromaticAtoms[atom.index - atom.residueAtomOffset] === 1;
  }
  calculateAromatic(r) {
    const aromaticAtoms = this.aromaticAtoms = new Uint8Array(this.atomCount);
    const rings = this.getRings().rings;
    const aromaticRingFlags = rings.map((ring) => {
      return isRingAromatic(ring.map((idx) => {
        return this.structure.getAtomProxy(idx + r.atomOffset);
      }));
    });
    const aromaticRings = this.aromaticRings = [];
    rings.forEach((ring, i) => {
      if (aromaticRingFlags[i]) {
        aromaticRings.push(ring);
        ring.forEach((idx) => aromaticAtoms[idx] = 1);
      }
    });
  }
  /**
   * For bonds with order > 1, pick a reference atom
   * @return {undefined}
   */
  assignBondReferenceAtomIndices() {
    const bondGraph = this.getBondGraph();
    const rings = this.getRings();
    const atomRings = rings.atomRings;
    const ringData = rings.rings;
    const bonds = this.bonds;
    const atomIndices1 = bonds.atomIndices1;
    const atomIndices2 = bonds.atomIndices2;
    const bondOrders = bonds.bondOrders;
    const bondReferenceAtomIndices = this.bondReferenceAtomIndices;
    const nb = bonds.atomIndices1.length;
    bondReferenceAtomIndices.length = 0;
    for (let i = 0; i < nb; ++i) {
      if (bondOrders[i] <= 1) continue;
      let refRing;
      const ai1 = atomIndices1[i];
      const ai2 = atomIndices2[i];
      const rings1 = atomRings[ai1];
      const rings2 = atomRings[ai2];
      if (rings1 && rings2) {
        for (let ri1 = 0; ri1 < rings1.length; ri1++) {
          if (rings2.indexOf(rings1[ri1]) !== -1) {
            refRing = ringData[rings1[ri1]];
            break;
          }
        }
      }
      if (bondGraph[ai1].length > 1) {
        for (let j = 0; j < bondGraph[ai1].length; ++j) {
          const ai3 = bondGraph[ai1][j];
          if (ai3 !== ai2) {
            if (refRing === void 0 || refRing.indexOf(ai3) !== -1) {
              bondReferenceAtomIndices[i] = ai3;
              break;
            }
          }
        }
      } else if (bondGraph[ai2].length > 1) {
        for (let j = 0; j < bondGraph[ai2].length; ++j) {
          const ai3 = bondGraph[ai2][j];
          if (ai3 !== ai1) {
            if (refRing === void 0 || refRing.indexOf(ai3) !== -1) {
              bondReferenceAtomIndices[i] = ai3;
              break;
            }
          }
        }
      }
    }
  }
  getBondIndex(atomIndex1, atomIndex2) {
    const bonds = this.bonds;
    const atomIndices1 = bonds.atomIndices1;
    const atomIndices2 = bonds.atomIndices2;
    let idx1 = atomIndices1.indexOf(atomIndex1);
    let idx2 = atomIndices2.indexOf(atomIndex2);
    const _idx2 = idx2;
    while (idx1 !== -1) {
      while (idx2 !== -1) {
        if (idx1 === idx2) return idx1;
        idx2 = atomIndices2.indexOf(atomIndex2, idx2 + 1);
      }
      idx1 = atomIndices1.indexOf(atomIndex1, idx1 + 1);
      idx2 = _idx2;
    }
  }
  getBondReferenceAtomIndex(atomIndex1, atomIndex2) {
    const bondIndex = this.getBondIndex(atomIndex1, atomIndex2);
    if (bondIndex === void 0) return void 0;
    if (this.bondReferenceAtomIndices.length === 0) {
      this.assignBondReferenceAtomIndices();
    }
    return this.bondReferenceAtomIndices[bondIndex];
  }
};
var AromaticRingElements = [
  5 /* B */,
  6 /* C */,
  7 /* N */,
  8 /* O */,
  14 /* SI */,
  15 /* P */,
  16 /* S */,
  32 /* GE */,
  33 /* AS */,
  50 /* SN */,
  51 /* SB */,
  83 /* BI */
];
var AromaticRingPlanarityThreshold = 0.05;
function isRingAromatic(ring) {
  if (ring.some((a) => !AromaticRingElements.includes(a.number))) return false;
  let i = 0;
  const coords = new Matrix(3, ring.length);
  const cd = coords.data;
  ring.forEach((a) => {
    cd[i + 0] = a.x;
    cd[i + 1] = a.y;
    cd[i + 2] = a.z;
    i += 3;
  });
  const pa = new principal_axes_default(coords);
  return pa.vecC.length() < AromaticRingPlanarityThreshold;
}
function addRing(state, a, b) {
  if (b < a) return;
  const { pred, color, left, right } = state;
  const nc = ++state.currentColor;
  let current = a;
  for (let t = 0; t < RingFinderMaxDepth; t++) {
    color[current] = nc;
    current = pred[current];
    if (current < 0) break;
  }
  let leftOffset = 0;
  let rightOffset = 0;
  let found = false;
  let target = 0;
  current = b;
  for (let t = 0; t < RingFinderMaxDepth; t++) {
    if (color[current] === nc) {
      target = current;
      found = true;
      break;
    }
    right[rightOffset++] = current;
    current = pred[current];
    if (current < 0) break;
  }
  if (!found) return;
  current = a;
  for (let t = 0; t < RingFinderMaxDepth; t++) {
    left[leftOffset++] = current;
    if (target === current) break;
    current = pred[current];
    if (current < 0) break;
  }
  const rn = leftOffset + rightOffset;
  const ring = new Array(rn);
  let ringOffset = 0;
  for (let t = 0; t < leftOffset; t++) {
    ring[ringOffset++] = left[t];
  }
  for (let t = rightOffset - 1; t >= 0; t--) {
    ring[ringOffset++] = right[t];
  }
  const ri = state.rings.length;
  for (let i = 0; i < rn; ++i) {
    const ai = ring[i];
    if (state.atomRings[ai]) {
      state.atomRings[ai].push(ri);
    } else {
      state.atomRings[ai] = [ri];
    }
  }
  state.rings.push(ring);
}
function findRings(state, from) {
  const { bonds, visited, queue, pred } = state;
  visited[from] = 1;
  queue[0] = from;
  let head = 0;
  let size = 1;
  while (head < size) {
    const top = queue[head++];
    const start = 0;
    if (bonds[top] === void 0) {
      continue;
    }
    const end = bonds[top].length;
    for (let i = start; i < end; i++) {
      const other = bonds[top][i];
      if (visited[other] > 0) {
        if (pred[other] !== top && pred[top] !== other) {
          addRing(state, top, other);
        }
        continue;
      }
      visited[other] = 1;
      queue[size++] = other;
      pred[other] = top;
    }
  }
}
var RingFinderMaxDepth = 4;
function RingFinderState(bonds, capacity) {
  const state = {
    count: capacity,
    visited: new Int32Array(capacity),
    queue: new Int32Array(capacity),
    pred: new Int32Array(capacity),
    left: new Int32Array(RingFinderMaxDepth),
    right: new Int32Array(RingFinderMaxDepth),
    color: new Int32Array(capacity),
    currentColor: 0,
    rings: [],
    atomRings: [],
    bonds
  };
  for (let i = 0; i < capacity; i++) {
    state.visited[i] = -1;
    state.pred[i] = -1;
  }
  return state;
}

// src/store/residue-map.ts
function getHash2(resname, atomTypeIdList, hetero, chemCompType = "") {
  return resname + "|" + atomTypeIdList.join(",") + "|" + (hetero ? 1 : 0) + "|" + chemCompType;
}
var ResidueMap = class {
  constructor(structure) {
    this.structure = structure;
    this.dict = {};
    this.list = [];
  }
  add(resname, atomTypeIdList, hetero, chemCompType = "", bonds) {
    resname = resname.toUpperCase();
    const hash = getHash2(resname, atomTypeIdList, hetero, chemCompType);
    let id = this.dict[hash];
    if (id === void 0) {
      const residueType = new ResidueType(
        this.structure,
        resname,
        atomTypeIdList,
        hetero,
        chemCompType,
        bonds
      );
      id = this.list.length;
      this.dict[hash] = id;
      this.list.push(residueType);
    }
    return id;
  }
  get(id) {
    return this.list[id];
  }
};
var residue_map_default = ResidueMap;

// src/proxy/bond-proxy.ts
var BondProxy = class _BondProxy {
  /**
   * @param {Structure} structure - the structure
   * @param {Integer} index - the index
   */
  constructor(structure, index = 0) {
    this.structure = structure;
    this.index = index;
    this.bondStore = structure.bondStore;
    this._v12 = new Vector3();
    this._v13 = new Vector3();
    this._ap1 = this.structure.getAtomProxy();
    this._ap2 = this.structure.getAtomProxy();
    this._ap3 = this.structure.getAtomProxy();
  }
  /**
   * @type {AtomProxy}
   */
  get atom1() {
    return this.structure.getAtomProxy(this.atomIndex1);
  }
  /**
   * @type {AtomProxy}
   */
  get atom2() {
    return this.structure.getAtomProxy(this.atomIndex2);
  }
  /**
   * @type {Integer}
   */
  get atomIndex1() {
    return this.bondStore.atomIndex1[this.index];
  }
  set atomIndex1(value) {
    this.bondStore.atomIndex1[this.index] = value;
  }
  /**
   * @type {Integer}
   */
  get atomIndex2() {
    return this.bondStore.atomIndex2[this.index];
  }
  set atomIndex2(value) {
    this.bondStore.atomIndex2[this.index] = value;
  }
  /**
   * @type {Integer}
   */
  get bondOrder() {
    return this.bondStore.bondOrder[this.index];
  }
  set bondOrder(value) {
    this.bondStore.bondOrder[this.index] = value;
  }
  getOtherAtomIndex(atomIndex) {
    return atomIndex === this.atomIndex1 ? this.atomIndex2 : this.atomIndex1;
  }
  getOtherAtom(atom) {
    return this.structure.getAtomProxy(this.getOtherAtomIndex(atom.index));
  }
  /**
   * Get reference atom index for the bond
   * @return {Integer|undefined} atom index, or `undefined` if unavailable
   */
  getReferenceAtomIndex() {
    const ap1 = this._ap1;
    const ap2 = this._ap2;
    ap1.index = this.atomIndex1;
    ap2.index = this.atomIndex2;
    if (ap1.residueIndex !== ap2.residueIndex) {
      return void 0;
    }
    const typeAtomIndex1 = ap1.index - ap1.residueAtomOffset;
    const typeAtomIndex2 = ap2.index - ap2.residueAtomOffset;
    const residueType = ap1.residueType;
    const ix = residueType.getBondReferenceAtomIndex(typeAtomIndex1, typeAtomIndex2);
    if (ix !== void 0) {
      return ix + ap1.residueAtomOffset;
    } else {
      console.warn("No reference atom found", ap1.index, ap2.index);
    }
  }
  /**
   * calculate shift direction for displaying double/triple bonds
   * @param  {Vector3} [v] pre-allocated output vector
   * @return {Vector3} the shift direction vector
   */
  calculateShiftDir(v = new Vector3()) {
    const ap1 = this._ap1;
    const ap2 = this._ap2;
    const ap3 = this._ap3;
    const v12 = this._v12;
    const v13 = this._v13;
    ap1.index = this.atomIndex1;
    ap2.index = this.atomIndex2;
    const ai3 = this.getReferenceAtomIndex();
    v12.subVectors(ap1, ap2).normalize();
    if (ai3 !== void 0) {
      ap3.index = ai3;
      v13.subVectors(ap1, ap3);
    } else {
      v13.copy(ap1);
    }
    v13.normalize();
    let dp = v12.dot(v13);
    if (1 - Math.abs(dp) < 1e-5) {
      v13.set(1, 0, 0);
      dp = v12.dot(v13);
      if (1 - Math.abs(dp) < 1e-5) {
        v13.set(0, 1, 0);
        dp = v12.dot(v13);
      }
    }
    return v.copy(v13.sub(v12.multiplyScalar(dp))).normalize();
  }
  qualifiedName() {
    return this.atomIndex1 + "=" + this.atomIndex2;
  }
  /**
   * Clone object
   * @return {BondProxy} cloned bond
   */
  clone() {
    return new _BondProxy(this.structure, this.index);
  }
  toObject() {
    return {
      atomIndex1: this.atomIndex1,
      atomIndex2: this.atomIndex2,
      bondOrder: this.bondOrder
    };
  }
};
var bond_proxy_default = BondProxy;

// src/proxy/residue-proxy.ts
var ResidueProxy = class _ResidueProxy {
  /**
   * @param {Structure} structure - the structure
   * @param {Integer} index - the index
   */
  constructor(structure, index = 0) {
    this.structure = structure;
    this.index = index;
    this.chainStore = structure.chainStore;
    this.residueStore = structure.residueStore;
    this.atomStore = structure.atomStore;
    this.residueMap = structure.residueMap;
    this.atomMap = structure.atomMap;
  }
  /**
   * Entity
   * @type {Entity}
   */
  get entity() {
    return this.structure.entityList[this.entityIndex];
  }
  get entityIndex() {
    return this.chainStore.entityIndex[this.chainIndex];
  }
  /**
   * Chain
   * @type {ChainProxy}
   */
  get chain() {
    return this.structure.getChainProxy(this.chainIndex);
  }
  get chainIndex() {
    return this.residueStore.chainIndex[this.index];
  }
  set chainIndex(value) {
    this.residueStore.chainIndex[this.index] = value;
  }
  get atomOffset() {
    return this.residueStore.atomOffset[this.index];
  }
  set atomOffset(value) {
    this.residueStore.atomOffset[this.index] = value;
  }
  /**
   * Atom count
   * @type {Integer}
   */
  get atomCount() {
    return this.residueStore.atomCount[this.index];
  }
  set atomCount(value) {
    this.residueStore.atomCount[this.index] = value;
  }
  get atomEnd() {
    return this.atomOffset + this.atomCount - 1;
  }
  //
  get modelIndex() {
    return this.chainStore.modelIndex[this.chainIndex];
  }
  /**
   * Chain name
   * @type {String}
   */
  get chainname() {
    return this.chainStore.getChainname(this.chainIndex);
  }
  /**
   * Chain id
   * @type {String}
   */
  get chainid() {
    return this.chainStore.getChainid(this.chainIndex);
  }
  //
  /**
   * Residue number/label
   * @type {Integer}
   */
  get resno() {
    return this.residueStore.resno[this.index];
  }
  set resno(value) {
    this.residueStore.resno[this.index] = value;
  }
  /**
   * Secondary structure code
   * @type {String}
   */
  get sstruc() {
    return this.residueStore.getSstruc(this.index);
  }
  set sstruc(value) {
    this.residueStore.setSstruc(this.index, value);
  }
  /**
   * Insertion code
   * @type {String}
   */
  get inscode() {
    return this.residueStore.getInscode(this.index);
  }
  set inscode(value) {
    this.residueStore.setInscode(this.index, value);
  }
  //
  get residueType() {
    return this.residueMap.get(this.residueStore.residueTypeId[this.index]);
  }
  /**
   * Residue name
   * @type {String}
   */
  get resname() {
    return this.residueType.resname;
  }
  /**
   * Hetero flag
   * @type {Boolean}
   */
  get hetero() {
    return this.residueType.hetero;
  }
  get moleculeType() {
    return this.residueType.moleculeType;
  }
  get backboneType() {
    return this.residueType.backboneType;
  }
  get backboneStartType() {
    return this.residueType.backboneStartType;
  }
  get backboneEndType() {
    return this.residueType.backboneEndType;
  }
  get traceAtomIndex() {
    return this.residueType.traceAtomIndex + this.atomOffset;
  }
  get direction1AtomIndex() {
    return this.residueType.direction1AtomIndex + this.atomOffset;
  }
  get direction2AtomIndex() {
    return this.residueType.direction2AtomIndex + this.atomOffset;
  }
  get backboneStartAtomIndex() {
    return this.residueType.backboneStartAtomIndex + this.atomOffset;
  }
  get backboneEndAtomIndex() {
    return this.residueType.backboneEndAtomIndex + this.atomOffset;
  }
  get rungEndAtomIndex() {
    return this.residueType.rungEndAtomIndex + this.atomOffset;
  }
  //
  get x() {
    let x = 0;
    for (let i = this.atomOffset; i <= this.atomEnd; ++i) {
      x += this.atomStore.x[i];
    }
    return x / this.atomCount;
  }
  get y() {
    let y = 0;
    for (let i = this.atomOffset; i <= this.atomEnd; ++i) {
      y += this.atomStore.y[i];
    }
    return y / this.atomCount;
  }
  get z() {
    let z = 0;
    for (let i = this.atomOffset; i <= this.atomEnd; ++i) {
      z += this.atomStore.z[i];
    }
    return z / this.atomCount;
  }
  //
  /**
   * Atom iterator
   * @param  {function(atom: AtomProxy)} callback - the callback
   * @param  {Selection} [selection] - the selection
   * @return {undefined}
   */
  eachAtom(callback, selection2) {
    const count = this.atomCount;
    const offset = this.atomOffset;
    const ap = this.structure._ap;
    const end = offset + count;
    if (selection2 && selection2.atomOnlyTest) {
      const atomOnlyTest = selection2.atomOnlyTest;
      for (let i = offset; i < end; ++i) {
        ap.index = i;
        if (atomOnlyTest(ap)) callback(ap);
      }
    } else {
      for (let i = offset; i < end; ++i) {
        ap.index = i;
        callback(ap);
      }
    }
  }
  //
  /**
   * Write residue center position to array
   * @param  {Array|TypedArray} [array] - target array
   * @param  {Integer} [offset] - the offset
   * @return {Array|TypedArray} target array
   */
  positionToArray(array = [], offset = 0) {
    array[offset + 0] = this.x;
    array[offset + 1] = this.y;
    array[offset + 2] = this.z;
    return array;
  }
  //
  /**
   * If residue is from a protein
   * @return {Boolean} flag
   */
  isProtein() {
    return this.residueType.moleculeType === ProteinType;
  }
  /**
   * If residue is nucleic
   * @return {Boolean} flag
   */
  isNucleic() {
    const moleculeType = this.residueType.moleculeType;
    return moleculeType === RnaType || moleculeType === DnaType;
  }
  /**
   * If residue is rna
   * @return {Boolean} flag
   */
  isRna() {
    return this.residueType.moleculeType === RnaType;
  }
  /**
   * If residue is dna
   * @return {Boolean} flag
   */
  isDna() {
    return this.residueType.moleculeType === DnaType;
  }
  /**
   * If residue is coarse-grain
   * @return {Boolean} flag
   */
  isCg() {
    const backboneType = this.residueType.backboneType;
    return backboneType === CgProteinBackboneType || backboneType === CgRnaBackboneType || backboneType === CgDnaBackboneType;
  }
  /**
   * If residue is from a polymer
   * @return {Boolean} flag
   */
  isPolymer() {
    if (this.structure.entityList.length > 0) {
      return this.entity.isPolymer();
    } else {
      const moleculeType = this.residueType.moleculeType;
      return moleculeType === ProteinType || moleculeType === RnaType || moleculeType === DnaType;
    }
  }
  /**
   * If residue is hetero
   * @return {Boolean} flag
   */
  isHetero() {
    return this.residueType.hetero === 1;
  }
  /**
   * If residue is a water molecule
   * @return {Boolean} flag
   */
  isWater() {
    return this.residueType.moleculeType === WaterType;
  }
  /**
   * If residue is an ion
   * @return {Boolean} flag
   */
  isIon() {
    return this.residueType.moleculeType === IonType;
  }
  /**
   * If residue is a saccharide
   * @return {Boolean} flag
   */
  isSaccharide() {
    return this.residueType.moleculeType === SaccharideType;
  }
  isStandardAminoacid() {
    return this.residueType.isStandardAminoacid();
  }
  isStandardBase() {
    return this.residueType.isStandardBase();
  }
  /**
   * If residue is part of a helix
   * @return {Boolean} flag
   */
  isHelix() {
    return SecStrucHelix.includes(this.sstruc);
  }
  /**
   * If residue is part of a sheet
   * @return {Boolean} flag
   */
  isSheet() {
    return SecStrucSheet.includes(this.sstruc);
  }
  /**
   * If residue is part of a turn
   * @return {Boolean} flag
   */
  isTurn() {
    return SecStrucTurn.includes(this.sstruc) && this.isProtein();
  }
  getAtomType(index) {
    return this.atomMap.get(this.atomStore.atomTypeId[index]);
  }
  getResname1() {
    return AA1[this.resname.toUpperCase()] || "X";
  }
  getBackboneType(position) {
    switch (position) {
      case -1:
        return this.residueType.backboneStartType;
      case 1:
        return this.residueType.backboneEndType;
      default:
        return this.residueType.backboneType;
    }
  }
  getAtomIndexByName(atomname) {
    let index = this.residueType.getAtomIndexByName(atomname);
    if (index !== void 0) {
      index += this.atomOffset;
    }
    return index;
  }
  hasAtomWithName(atomname) {
    return this.residueType.hasAtomWithName(atomname);
  }
  getAtomnameList() {
    console.warn("getAtomnameList - might be expensive");
    const n = this.atomCount;
    const offset = this.atomOffset;
    const list = new Array(n);
    for (let i = 0; i < n; ++i) {
      list[i] = this.getAtomType(offset + i).atomname;
    }
    return list;
  }
  /**
   * If residue is connected to another
   * @param  {ResidueProxy} rNext - the other residue
   * @return {Boolean} - flag
   */
  connectedTo(rNext) {
    const bbAtomEnd = this.structure.getAtomProxy(this.backboneEndAtomIndex);
    const bbAtomStart = this.structure.getAtomProxy(rNext.backboneStartAtomIndex);
    if (bbAtomEnd && bbAtomStart) {
      return bbAtomEnd.connectedTo(bbAtomStart);
    } else {
      return false;
    }
  }
  getNextConnectedResidue() {
    const rOffset = this.chainStore.residueOffset[this.chainIndex];
    const rCount = this.chainStore.residueCount[this.chainIndex];
    const nextIndex = this.index + 1;
    if (nextIndex < rOffset + rCount) {
      const rpNext = this.structure.getResidueProxy(nextIndex);
      if (this.connectedTo(rpNext)) {
        return rpNext;
      }
    } else if (nextIndex === rOffset + rCount) {
      const rpFirst = this.structure.getResidueProxy(rOffset);
      if (this.connectedTo(rpFirst)) {
        return rpFirst;
      }
    }
    return void 0;
  }
  getPreviousConnectedResidue(residueProxy) {
    const rOffset = this.chainStore.residueOffset[this.chainIndex];
    const prevIndex = this.index - 1;
    if (prevIndex >= rOffset) {
      const rpPrev = defaults(residueProxy, this.structure.getResidueProxy());
      rpPrev.index = prevIndex;
      if (rpPrev.connectedTo(this)) {
        return rpPrev;
      }
    } else if (prevIndex === rOffset - 1) {
      const rCount = this.chainStore.residueCount[this.chainIndex];
      const rpLast = defaults(residueProxy, this.structure.getResidueProxy());
      rpLast.index = rOffset + rCount - 1;
      if (rpLast.connectedTo(this)) {
        return rpLast;
      }
    }
    return void 0;
  }
  getBonds() {
    return this.residueType.getBonds(this);
  }
  getRings() {
    return this.residueType.getRings();
  }
  getAromaticRings() {
    return this.residueType.getAromaticRings(this);
  }
  qualifiedName(noResname = false) {
    let name = "";
    if (this.resname && !noResname) name += "[" + this.resname + "]";
    if (this.resno !== void 0) name += this.resno;
    if (this.inscode) name += "^" + this.inscode;
    if (this.chain) name += ":" + this.chainname;
    name += "/" + this.modelIndex;
    return name;
  }
  /**
   * Clone object
   * @return {ResidueProxy} cloned residue
   */
  clone() {
    return new _ResidueProxy(this.structure, this.index);
  }
  toObject() {
    return {
      index: this.index,
      chainIndex: this.chainIndex,
      atomOffset: this.atomOffset,
      atomCount: this.atomCount,
      resno: this.resno,
      resname: this.resname,
      sstruc: this.sstruc
    };
  }
};
var residue_proxy_default = ResidueProxy;

// src/proxy/polymer.ts
var Polymer = class {
  /**
   * @param {Structure} structure - the structure
   * @param {Integer} residueIndexStart - the index of the first residue
   * @param {Integer} residueIndexEnd - the index of the last residue
   */
  constructor(structure, residueIndexStart, residueIndexEnd) {
    this.structure = structure;
    this.residueIndexStart = residueIndexStart;
    this.residueIndexEnd = residueIndexEnd;
    this.chainStore = structure.chainStore;
    this.residueStore = structure.residueStore;
    this.atomStore = structure.atomStore;
    this.residueCount = residueIndexEnd - residueIndexStart + 1;
    const rpStart = this.structure.getResidueProxy(this.residueIndexStart);
    const rpEnd = this.structure.getResidueProxy(this.residueIndexEnd);
    this.isPrevConnected = rpStart.getPreviousConnectedResidue() !== void 0;
    const rpNext = rpEnd.getNextConnectedResidue();
    this.isNextConnected = rpNext !== void 0;
    this.isNextNextConnected = rpNext !== void 0 && rpNext.getNextConnectedResidue() !== void 0;
    this.isCyclic = rpEnd.connectedTo(rpStart);
    this.__residueProxy = this.structure.getResidueProxy();
  }
  get chainIndex() {
    return this.residueStore.chainIndex[this.residueIndexStart];
  }
  get modelIndex() {
    return this.chainStore.modelIndex[this.chainIndex];
  }
  /**
   * @type {String}
   */
  get chainname() {
    return this.chainStore.getChainname(this.chainIndex);
  }
  //
  /**
   * If first residue is from aprotein
   * @return {Boolean} flag
   */
  isProtein() {
    this.__residueProxy.index = this.residueIndexStart;
    return this.__residueProxy.isProtein();
  }
  /**
   * If atom is part of a coarse-grain group
   * @return {Boolean} flag
   */
  isCg() {
    this.__residueProxy.index = this.residueIndexStart;
    return this.__residueProxy.isCg();
  }
  /**
   * If atom is part of a nucleic molecule
   * @return {Boolean} flag
   */
  isNucleic() {
    this.__residueProxy.index = this.residueIndexStart;
    return this.__residueProxy.isNucleic();
  }
  getMoleculeType() {
    this.__residueProxy.index = this.residueIndexStart;
    return this.__residueProxy.moleculeType;
  }
  getBackboneType(position) {
    this.__residueProxy.index = this.residueIndexStart;
    return this.__residueProxy.getBackboneType(position);
  }
  getAtomIndexByType(index, type) {
    if (this.isCyclic) {
      if (index === -1) {
        index = this.residueCount - 1;
      } else if (index === this.residueCount) {
        index = 0;
      }
    } else {
      if (index === -1 && !this.isPrevConnected) index += 1;
      if (index === this.residueCount && !this.isNextNextConnected) index -= 1;
    }
    const rp = this.__residueProxy;
    rp.index = this.residueIndexStart + index;
    let aIndex;
    switch (type) {
      case "trace":
        aIndex = rp.traceAtomIndex;
        break;
      case "direction1":
        aIndex = rp.direction1AtomIndex;
        break;
      case "direction2":
        aIndex = rp.direction2AtomIndex;
        break;
      default:
        aIndex = rp.getAtomIndexByName(type);
    }
    return aIndex;
  }
  /**
   * Atom iterator
   * @param  {function(atom: AtomProxy)} callback - the callback
   * @param  {Selection} [selection] - the selection
   * @return {undefined}
   */
  eachAtom(callback, selection2) {
    this.eachResidue(function(rp) {
      rp.eachAtom(callback, selection2);
    });
  }
  eachAtomN(n, callback, type) {
    const m = this.residueCount;
    const array = new Array(n);
    for (let i = 0; i < n; ++i) {
      array[i] = this.structure.getAtomProxy(this.getAtomIndexByType(i, type));
    }
    callback.apply(this, array);
    for (var j = n; j < m; ++j) {
      for (let i = 1; i < n; ++i) {
        array[i - 1].index = array[i].index;
      }
      array[n - 1].index = this.getAtomIndexByType(j, type);
      callback.apply(this, array);
    }
  }
  /**
   * Residue iterator
   * @param  {function(residue: ResidueProxy)} callback - the callback
   * @return {undefined}
   */
  eachResidue(callback) {
    const rp = this.structure.getResidueProxy();
    const n = this.residueCount;
    const rStartIndex = this.residueIndexStart;
    for (let i = 0; i < n; ++i) {
      rp.index = rStartIndex + i;
      callback(rp);
    }
  }
  qualifiedName() {
    const rpStart = this.structure.getResidueProxy(this.residueIndexStart);
    const rpEnd = this.structure.getResidueProxy(this.residueIndexEnd);
    return rpStart.qualifiedName() + " - " + rpEnd.qualifiedName();
  }
};
var polymer_default = Polymer;

// src/proxy/chain-proxy.ts
var ChainProxy = class _ChainProxy {
  /**
   * @param {Structure} structure - the structure
   * @param {Integer} index - the index
   */
  constructor(structure, index = 0) {
    this.structure = structure;
    this.index = index;
    this.chainStore = structure.chainStore;
    this.residueStore = structure.residueStore;
  }
  /**
   * Entity
   * @type {Entity}
   */
  get entity() {
    return this.structure.entityList[this.entityIndex];
  }
  /**
   * Model
   * @type {ModelProxy}
   */
  get model() {
    return this.structure.getModelProxy(this.modelIndex);
  }
  get entityIndex() {
    return this.chainStore.entityIndex[this.index];
  }
  set entityIndex(value) {
    this.chainStore.entityIndex[this.index] = value;
  }
  get modelIndex() {
    return this.chainStore.modelIndex[this.index];
  }
  set modelIndex(value) {
    this.chainStore.modelIndex[this.index] = value;
  }
  get residueOffset() {
    return this.chainStore.residueOffset[this.index];
  }
  set residueOffset(value) {
    this.chainStore.residueOffset[this.index] = value;
  }
  /**
   * Residue count
   * @type {Integer}
   */
  get residueCount() {
    return this.chainStore.residueCount[this.index];
  }
  set residueCount(value) {
    this.chainStore.residueCount[this.index] = value;
  }
  get residueEnd() {
    return this.residueOffset + this.residueCount - 1;
  }
  get atomOffset() {
    return this.residueStore.atomOffset[this.residueOffset];
  }
  get atomEnd() {
    return this.residueStore.atomOffset[this.residueEnd] + this.residueStore.atomCount[this.residueEnd] - 1;
  }
  /**
   * Atom count
   * @type {Integer}
   */
  get atomCount() {
    if (this.residueCount === 0) {
      return 0;
    } else {
      return this.atomEnd - this.atomOffset + 1;
    }
  }
  //
  /**
   * Chain name
   * @type {String}
   */
  get chainname() {
    return this.chainStore.getChainname(this.index);
  }
  set chainname(value) {
    this.chainStore.setChainname(this.index, value);
  }
  /**
   * Chain id
   * @type {String}
   */
  get chainid() {
    return this.chainStore.getChainid(this.index);
  }
  set chainid(value) {
    this.chainStore.setChainid(this.index, value);
  }
  //
  /**
   * Atom iterator
   * @param  {function(atom: AtomProxy)} callback - the callback
   * @param  {Selection} [selection] - the selection
   * @return {undefined}
   */
  eachAtom(callback, selection2) {
    this.eachResidue(function(rp) {
      rp.eachAtom(callback, selection2);
    }, selection2);
  }
  /**
   * Residue iterator
   * @param  {function(residue: ResidueProxy)} callback - the callback
   * @param  {Selection} [selection] - the selection
   * @return {undefined}
   */
  eachResidue(callback, selection2) {
    const count = this.residueCount;
    const offset = this.residueOffset;
    const rp = this.structure._rp;
    const end = offset + count;
    if (selection2 && selection2.test) {
      const residueOnlyTest = selection2.residueOnlyTest;
      if (residueOnlyTest) {
        for (let i = offset; i < end; ++i) {
          rp.index = i;
          if (residueOnlyTest(rp)) {
            callback(rp);
          }
        }
      } else {
        for (let i = offset; i < end; ++i) {
          rp.index = i;
          callback(rp);
        }
      }
    } else {
      for (let i = offset; i < end; ++i) {
        rp.index = i;
        callback(rp);
      }
    }
  }
  /**
   * Multi-residue iterator
   * @param {Integer} n - window size
   * @param  {function(residueList: ResidueProxy[])} callback - the callback
   * @return {undefined}
   */
  eachResidueN(n, callback) {
    const count = this.residueCount;
    const offset = this.residueOffset;
    const end = offset + count;
    if (count < n) return;
    const array = new Array(n);
    for (let i = 0; i < n; ++i) {
      array[i] = this.structure.getResidueProxy(offset + i);
    }
    callback.apply(this, array);
    for (let j = offset + n; j < end; ++j) {
      for (let i = 0; i < n; ++i) {
        array[i].index += 1;
      }
      callback.apply(this, array);
    }
  }
  /**
   * Polymer iterator
   * @param  {function(polymer: Polymer)} callback - the callback
   * @param  {Selection} [selection] - the selection
   * @return {undefined}
   */
  eachPolymer(callback, selection2) {
    let rStartIndex = 0;
    let rNextIndex = 0;
    const test = selection2 ? selection2.residueOnlyTest : void 0;
    const structure = this.model.structure;
    const count = this.residueCount;
    const offset = this.residueOffset;
    const end = offset + count;
    const rp1 = this.structure.getResidueProxy();
    const rp2 = this.structure.getResidueProxy(offset);
    const ap1 = this.structure.getAtomProxy();
    const ap2 = this.structure.getAtomProxy();
    let first = true;
    for (let i = offset + 1; i < end; ++i) {
      rp1.index = rp2.index;
      rp2.index = i;
      const bbType1 = first ? rp1.backboneEndType : rp1.backboneType;
      const bbType2 = rp2.backboneType;
      if (first) {
        rStartIndex = rp1.index;
        first = false;
      }
      rNextIndex = rp2.index;
      if (bbType1 !== UnknownBackboneType && bbType1 === bbType2) {
        ap1.index = rp1.backboneEndAtomIndex;
        ap2.index = rp2.backboneStartAtomIndex;
      } else {
        if (bbType1 !== UnknownBackboneType) {
          if (rp1.index - rStartIndex > 1) {
            callback(new polymer_default(structure, rStartIndex, rp1.index));
          }
        }
        rStartIndex = rNextIndex;
        continue;
      }
      if (!ap1 || !ap2 || !ap1.connectedTo(ap2) || test && (!test(rp1) || !test(rp2))) {
        if (rp1.index - rStartIndex > 1) {
          callback(new polymer_default(structure, rStartIndex, rp1.index));
        }
        rStartIndex = rNextIndex;
      }
    }
    if (rNextIndex - rStartIndex > 1) {
      if (this.structure.getResidueProxy(rStartIndex).backboneEndType) {
        callback(new polymer_default(structure, rStartIndex, rNextIndex));
      }
    }
  }
  //
  qualifiedName() {
    var name = ":" + this.chainname + "/" + this.modelIndex;
    return name;
  }
  /**
   * Clone object
   * @return {ChainProxy} cloned chain
   */
  clone() {
    return new _ChainProxy(this.structure, this.index);
  }
  toObject() {
    return {
      index: this.index,
      residueOffset: this.residueOffset,
      residueCount: this.residueCount,
      chainname: this.chainname
    };
  }
};
var chain_proxy_default = ChainProxy;

// src/proxy/model-proxy.ts
var ModelProxy = class _ModelProxy {
  /**
   * @param {Structure} structure - the structure
   * @param {Integer} index - the index
   */
  constructor(structure, index = 0) {
    this.structure = structure;
    this.index = index;
    this.modelStore = structure.modelStore;
    this.chainStore = structure.chainStore;
    this.residueStore = structure.residueStore;
  }
  get chainOffset() {
    return this.modelStore.chainOffset[this.index];
  }
  set chainOffset(value) {
    this.modelStore.chainOffset[this.index] = value;
  }
  get chainCount() {
    return this.modelStore.chainCount[this.index];
  }
  set chainCount(value) {
    this.modelStore.chainCount[this.index] = value;
  }
  get residueOffset() {
    return this.chainStore.residueOffset[this.chainOffset];
  }
  get atomOffset() {
    return this.residueStore.atomOffset[this.residueOffset];
  }
  get chainEnd() {
    return this.chainOffset + this.chainCount - 1;
  }
  get residueEnd() {
    return this.chainStore.residueOffset[this.chainEnd] + this.chainStore.residueCount[this.chainEnd] - 1;
  }
  get atomEnd() {
    return this.residueStore.atomOffset[this.residueEnd] + this.residueStore.atomCount[this.residueEnd] - 1;
  }
  /**
   * Residue count
   * @type {Integer}
   */
  get residueCount() {
    if (this.chainCount === 0) {
      return 0;
    } else {
      return this.residueEnd - this.residueOffset + 1;
    }
  }
  /**
   * Atom count
   * @type {Integer}
   */
  get atomCount() {
    if (this.residueCount === 0) {
      return 0;
    } else {
      return this.atomEnd - this.atomOffset + 1;
    }
  }
  //
  /**
   * Atom iterator
   * @param  {function(atom: AtomProxy)} callback - the callback
   * @param  {Selection} [selection] - the selection
   * @return {undefined}
   */
  eachAtom(callback, selection2) {
    this.eachChain(function(cp) {
      cp.eachAtom(callback, selection2);
    }, selection2);
  }
  /**
   * Residue iterator
   * @param  {function(residue: ResidueProxy)} callback - the callback
   * @param  {Selection} [selection] - the selection
   * @return {undefined}
   */
  eachResidue(callback, selection2) {
    this.eachChain(function(cp) {
      cp.eachResidue(callback, selection2);
    }, selection2);
  }
  /**
   * Polymer iterator
   * @param  {function(polymer: Polymer)} callback - the callback
   * @param  {Selection} [selection] - the selection
   * @return {undefined}
   */
  eachPolymer(callback, selection2) {
    if (selection2 && selection2.chainOnlyTest) {
      const chainOnlyTest = selection2.chainOnlyTest;
      this.eachChain(function(cp) {
        if (chainOnlyTest(cp)) {
          cp.eachPolymer(callback, selection2);
        }
      });
    } else {
      this.eachChain(function(cp) {
        cp.eachPolymer(callback, selection2);
      });
    }
  }
  /**
   * Chain iterator
   * @param  {function(chain: ChainProxy)} callback - the callback
   * @param  {Selection} [selection] - the selection
   * @return {undefined}
   */
  eachChain(callback, selection2) {
    const count = this.chainCount;
    const offset = this.chainOffset;
    const cp = this.structure._cp;
    const end = offset + count;
    if (selection2 && selection2.test) {
      const chainOnlyTest = selection2.chainOnlyTest;
      if (chainOnlyTest) {
        for (let i = offset; i < end; ++i) {
          cp.index = i;
          if (chainOnlyTest(cp)) {
            callback(cp);
          }
        }
      } else {
        for (let i = offset; i < end; ++i) {
          cp.index = i;
          callback(cp);
        }
      }
    } else {
      for (let i = offset; i < end; ++i) {
        cp.index = i;
        callback(cp);
      }
    }
  }
  //
  qualifiedName() {
    const name = "/" + this.index;
    return name;
  }
  /**
   * Clone object
   * @return {ModelProxy} cloned model
   */
  clone() {
    return new _ModelProxy(this.structure, this.index);
  }
  toObject() {
    return {
      index: this.index,
      chainOffset: this.chainOffset,
      chainCount: this.chainCount
    };
  }
};
var model_proxy_default = ModelProxy;

// src/structure/structure.ts
var Structure = class {
  /**
   * @param {String} name - structure name
   * @param {String} path - source path
   */
  constructor(name = "", path = "") {
    this.signals = {
      refreshed: new import_signals2.Signal()
    };
    this.init(name, path);
  }
  init(name, path) {
    this.name = name;
    this.path = path;
    this.title = "";
    this.id = "";
    this.data = createData(this);
    this.header = {};
    this.extraData = {};
    this.atomSetCache = {};
    this.atomSetDict = {};
    this.biomolDict = {};
    this.entityList = [];
    this.unitcell = void 0;
    this.frames = [];
    this.boxes = [];
    this.validation = void 0;
    this.bondStore = new BondStore(0);
    this.backboneBondStore = new BondStore(0);
    this.rungBondStore = new BondStore(0);
    this.atomStore = new AtomStore(0);
    this.residueStore = new ResidueStore(0);
    this.chainStore = new ChainStore(0);
    this.modelStore = new ModelStore(0);
    this.atomMap = new atom_map_default(this);
    this.residueMap = new residue_map_default(this);
    this.bondHash = void 0;
    this.spatialHash = void 0;
    this.atomSet = void 0;
    this.bondSet = void 0;
    this.center = new Vector3();
    this.boundingBox = new Box3();
    this._bp = this.getBondProxy();
    this._ap = this.getAtomProxy();
    this._rp = this.getResidueProxy();
    this._cp = this.getChainProxy();
  }
  get type() {
    return "Structure";
  }
  finalizeAtoms() {
    this.atomSet = this.getAtomSet();
    this.atomCount = this.atomStore.count;
    this.boundingBox = this.getBoundingBox(void 0, this.boundingBox);
    this.center = this.boundingBox.getCenter(new Vector3());
    this.spatialHash = new SpatialHash(this.atomStore, this.boundingBox);
  }
  finalizeBonds() {
    this.bondSet = this.getBondSet();
    this.bondCount = this.bondStore.count;
    this.bondHash = new bond_hash_default(this.bondStore, this.atomStore.count);
    this.atomSetCache = {};
    if (!this.atomSetDict.rung) {
      this.atomSetDict.rung = this.getAtomSet(false);
    }
    for (let name in this.atomSetDict) {
      this.atomSetCache["__" + name] = this.atomSetDict[name].clone();
    }
  }
  //
  getBondProxy(index) {
    return new bond_proxy_default(this, index);
  }
  getAtomProxy(index) {
    return new atom_proxy_default(this, index);
  }
  getResidueProxy(index) {
    return new residue_proxy_default(this, index);
  }
  getChainProxy(index) {
    return new chain_proxy_default(this, index);
  }
  getModelProxy(index) {
    return new model_proxy_default(this, index);
  }
  //
  getBondSet() {
    const n = this.bondStore.count;
    const bondSet = new BitArray(n);
    const atomSet = this.atomSet;
    if (atomSet) {
      if (atomSet.isAllSet()) {
        bondSet.setAll();
      } else if (atomSet.isAllClear()) {
        bondSet.clearAll();
      } else {
        const bp = this.getBondProxy();
        for (let i = 0; i < n; ++i) {
          bp.index = i;
          if (atomSet.isSet(bp.atomIndex1, bp.atomIndex2)) {
            bondSet.set(bp.index);
          }
        }
      }
    } else {
      bondSet.setAll();
    }
    return bondSet;
  }
  getBackboneBondSet() {
    const n = this.backboneBondStore.count;
    const backboneBondSet = new BitArray(n);
    const backboneAtomSet = this.atomSetCache.__backbone;
    if (backboneAtomSet) {
      const bp = this.getBondProxy();
      bp.bondStore = this.backboneBondStore;
      for (let i = 0; i < n; ++i) {
        bp.index = i;
        if (backboneAtomSet.isSet(bp.atomIndex1, bp.atomIndex2)) {
          backboneBondSet.set(bp.index);
        }
      }
    } else {
      backboneBondSet.setAll();
    }
    return backboneBondSet;
  }
  getRungBondSet() {
    const n = this.rungBondStore.count;
    const rungBondSet = new BitArray(n);
    const rungAtomSet = this.atomSetCache.__rung;
    if (rungAtomSet) {
      const bp = this.getBondProxy();
      bp.bondStore = this.rungBondStore;
      for (let i = 0; i < n; ++i) {
        bp.index = i;
        if (rungAtomSet.isSet(bp.atomIndex1, bp.atomIndex2)) {
          rungBondSet.set(bp.index);
        }
      }
    } else {
      rungBondSet.setAll();
    }
    return rungBondSet;
  }
  /**
   * Get a set of atoms
   * @param  {Boolean|Selection|BitArray} selection - object defining how to
   *                                      initialize the atom set.
   *                                      Boolean: init with value;
   *                                      Selection: init with selection;
   *                                      BitArray: return bit array
   * @return {BitArray} set of atoms
   */
  getAtomSet(selection2) {
    const n = this.atomStore.count;
    if (selection2 === void 0) {
      return new BitArray(n, true);
    } else if (selection2 instanceof BitArray) {
      return selection2;
    } else if (selection2 === true) {
      return new BitArray(n, true);
    } else if (selection2 && selection2.test) {
      const seleString = selection2.string;
      if (seleString in this.atomSetCache) {
        return this.atomSetCache[seleString];
      } else {
        if (seleString === "") {
          return new BitArray(n, true);
        } else {
          const atomSet = new BitArray(n);
          this.eachAtom(function(ap) {
            atomSet.set(ap.index);
          }, selection2);
          this.atomSetCache[seleString] = atomSet;
          return atomSet;
        }
      }
    } else if (selection2 === false) {
      return new BitArray(n);
    }
    return new BitArray(n, true);
  }
  /**
   * Get set of atoms around a set of atoms from a selection
   * @param  {Selection} selection - the selection object
   * @param  {Number} radius - radius to select within
   * @return {BitArray} set of atoms
   */
  getAtomSetWithinSelection(selection2, radius) {
    const spatialHash = this.spatialHash;
    const atomSet = this.getAtomSet(false);
    const ap = this.getAtomProxy();
    if (!spatialHash) return atomSet;
    this.getAtomSet(selection2).forEach(function(idx) {
      ap.index = idx;
      spatialHash.within(ap.x, ap.y, ap.z, radius).forEach(function(idx2) {
        atomSet.set(idx2);
      });
    });
    return atomSet;
  }
  /**
   * Get set of atoms around a point
   * @param  {Vector3|AtomProxy} point - the point
   * @param  {Number} radius - radius to select within
   * @return {BitArray} set of atoms
   */
  getAtomSetWithinPoint(point, radius) {
    const p = point;
    const atomSet = this.getAtomSet(false);
    if (!this.spatialHash) return atomSet;
    this.spatialHash.within(p.x, p.y, p.z, radius).forEach(function(idx) {
      atomSet.set(idx);
    });
    return atomSet;
  }
  /**
   * Get set of atoms within a volume
   * @param  {Volume} volume - the volume
   * @param  {Number} radius - radius to select within
   * @param  {[type]} minValue - minimum value to be considered as within the volume
   * @param  {[type]} maxValue - maximum value to be considered as within the volume
   * @param  {[type]} outside - use only values falling outside of the min/max values
   * @return {BitArray} set of atoms
   */
  getAtomSetWithinVolume(volume, radius, minValue, maxValue, outside) {
    const fv = new UnsupportedVolume(volume, minValue, maxValue, outside);
    const dp = fv.getDataPosition();
    const n = dp.length;
    const r = fv.matrix.getMaxScaleOnAxis();
    const atomSet = this.getAtomSet(false);
    if (!this.spatialHash) return atomSet;
    for (let i = 0; i < n; i += 3) {
      this.spatialHash.within(dp[i], dp[i + 1], dp[i + 2], r).forEach(function(idx) {
        atomSet.set(idx);
      });
    }
    return atomSet;
  }
  /**
   * Get set of all atoms within the groups of a selection
   * @param  {Selection} selection - the selection object
   * @return {BitArray} set of atoms
   */
  getAtomSetWithinGroup(selection2) {
    const atomResidueIndex = this.atomStore.residueIndex;
    const atomSet = this.getAtomSet(false);
    const rp = this.getResidueProxy();
    this.getAtomSet(selection2).forEach(function(idx) {
      rp.index = atomResidueIndex[idx];
      for (let idx2 = rp.atomOffset; idx2 <= rp.atomEnd; ++idx2) {
        atomSet.set(idx2);
      }
    });
    return atomSet;
  }
  //
  getSelection() {
    return false;
  }
  getStructure() {
    return this;
  }
  /**
   * Entity iterator
   * @param  {function(entity: Entity)} callback - the callback
   * @param  {EntityType} type - entity type
   * @return {undefined}
   */
  eachEntity(callback, type) {
    this.entityList.forEach(function(entity) {
      if (type === void 0 || entity.getEntityType() === type) {
        callback(entity);
      }
    });
  }
  /**
   * Bond iterator
   * @param  {function(bond: BondProxy)} callback - the callback
   * @param  {Selection} [selection] - the selection
   * @return {undefined}
   */
  eachBond(callback, selection2) {
    const bp = this.getBondProxy();
    let bondSet;
    if (selection2 && selection2.test) {
      bondSet = this.getBondSet(
        /*selection*/
      );
      if (this.bondSet) {
        bondSet.intersection(this.bondSet);
      }
    }
    if (bondSet) {
      bondSet.forEach(function(index) {
        bp.index = index;
        callback(bp);
      });
    } else {
      const n = this.bondStore.count;
      for (let i = 0; i < n; ++i) {
        bp.index = i;
        callback(bp);
      }
    }
  }
  /**
   * Atom iterator
   * @param  {function(atom: AtomProxy)} callback - the callback
   * @param  {Selection} [selection] - the selection
   * @return {undefined}
   */
  eachAtom(callback, selection2) {
    if (selection2 && selection2.test) {
      this.eachModel(function(mp) {
        mp.eachAtom(callback, selection2);
      }, selection2);
    } else {
      const an = this.atomStore.count;
      const ap = this.getAtomProxy();
      for (let i = 0; i < an; ++i) {
        ap.index = i;
        callback(ap);
      }
    }
  }
  /**
   * Residue iterator
   * @param  {function(residue: ResidueProxy)} callback - the callback
   * @param  {Selection} [selection] - the selection
   * @return {undefined}
   */
  eachResidue(callback, selection2) {
    if (selection2 && selection2.test) {
      const mn = this.modelStore.count;
      const mp = this.getModelProxy();
      const modelOnlyTest = selection2.modelOnlyTest;
      if (modelOnlyTest) {
        for (let i = 0; i < mn; ++i) {
          mp.index = i;
          if (modelOnlyTest(mp)) {
            mp.eachResidue(callback, selection2);
          }
        }
      } else {
        for (let i = 0; i < mn; ++i) {
          mp.index = i;
          mp.eachResidue(callback, selection2);
        }
      }
    } else {
      const rn = this.residueStore.count;
      const rp = this.getResidueProxy();
      for (let i = 0; i < rn; ++i) {
        rp.index = i;
        callback(rp);
      }
    }
  }
  /**
   * Multi-residue iterator
   * @param {Integer} n - window size
   * @param  {function(residueList: ResidueProxy[])} callback - the callback
   * @return {undefined}
   */
  eachResidueN(n, callback) {
    const rn = this.residueStore.count;
    if (rn < n) return;
    const array = new Array(n);
    for (let i = 0; i < n; ++i) {
      array[i] = this.getResidueProxy(i);
    }
    callback.apply(this, array);
    for (let j = n; j < rn; ++j) {
      for (let i = 0; i < n; ++i) {
        array[i].index += 1;
      }
      callback.apply(this, array);
    }
  }
  /**
   * Polymer iterator
   * @param  {function(polymer: Polymer)} callback - the callback
   * @param  {Selection} [selection] - the selection
   * @return {undefined}
   */
  eachPolymer(callback, selection2) {
    if (selection2 && selection2.modelOnlyTest) {
      const modelOnlyTest = selection2.modelOnlyTest;
      this.eachModel(function(mp) {
        if (modelOnlyTest(mp)) {
          mp.eachPolymer(callback, selection2);
        }
      });
    } else {
      this.eachModel(function(mp) {
        mp.eachPolymer(callback, selection2);
      });
    }
  }
  /**
   * Chain iterator
   * @param  {function(chain: ChainProxy)} callback - the callback
   * @param  {Selection} [selection] - the selection
   * @return {undefined}
   */
  eachChain(callback, selection2) {
    if (selection2 && selection2.test) {
      this.eachModel(function(mp) {
        mp.eachChain(callback, selection2);
      });
    } else {
      const cn = this.chainStore.count;
      const cp = this.getChainProxy();
      for (let i = 0; i < cn; ++i) {
        cp.index = i;
        callback(cp);
      }
    }
  }
  /**
   * Model iterator
   * @param  {function(model: ModelProxy)} callback - the callback
   * @param  {Selection} [selection] - the selection
   * @return {undefined}
   */
  eachModel(callback, selection2) {
    const n = this.modelStore.count;
    const mp = this.getModelProxy();
    if (selection2 && selection2.test) {
      const modelOnlyTest = selection2.modelOnlyTest;
      if (modelOnlyTest) {
        for (let i = 0; i < n; ++i) {
          mp.index = i;
          if (modelOnlyTest(mp)) {
            callback(mp);
          }
        }
      } else {
        for (let i = 0; i < n; ++i) {
          mp.index = i;
          callback(mp);
        }
      }
    } else {
      for (let i = 0; i < n; ++i) {
        mp.index = i;
        callback(mp);
      }
    }
  }
  //
  getAtomData(params) {
    const p = Object.assign({}, params);
    if (p.colorParams) p.colorParams.structure = this.getStructure();
    const what = p.what;
    const atomSet = defaults(p.atomSet, this.atomSet);
    let radiusFactory;
    let colormaker;
    const atomData = {};
    const ap = this.getAtomProxy();
    const atomCount = atomSet.getSize();
    if (!what || what.position) {
      atomData.position = new Float32Array(atomCount * 3);
    }
    if ((!what || what.color) && p.colorParams) {
      atomData.color = new Float32Array(atomCount * 3);
      colormaker = ColormakerRegistry.getScheme(p.colorParams);
    }
    if (!what || what.picking) {
      atomData.picking = new AtomPicker(new Float32Array(atomCount), this.getStructure());
    }
    if (!what || what.radius) {
      atomData.radius = new Float32Array(atomCount);
      radiusFactory = new radius_factory_default(p.radiusParams);
    }
    if (!what || what.index) {
      atomData.index = new Uint32Array(atomCount);
    }
    const { position, color, picking, radius, index } = atomData;
    atomSet.forEach((idx, i) => {
      const i3 = i * 3;
      ap.index = idx;
      if (position) {
        ap.positionToArray(position, i3);
      }
      if (color) {
        colormaker.atomColorToArray(ap, color, i3);
      }
      if (picking) {
        picking.array[i] = idx;
      }
      if (radius) {
        radius[i] = radiusFactory.atomRadius(ap);
      }
      if (index) {
        index[i] = idx;
      }
    });
    return atomData;
  }
  getBondData(params) {
    const p = Object.assign({}, params);
    if (p.colorParams) p.colorParams.structure = this.getStructure();
    const what = p.what;
    const bondSet = defaults(p.bondSet, this.bondSet);
    const multipleBond = defaults(p.multipleBond, "off");
    const isMulti = multipleBond !== "off";
    const isOffset = multipleBond === "offset";
    const bondScale = defaults(p.bondScale, 0.4);
    const bondSpacing = defaults(p.bondSpacing, 1);
    let radiusFactory;
    let colormaker;
    const bondData = {};
    const bp = this.getBondProxy();
    if (p.bondStore) bp.bondStore = p.bondStore;
    const ap1 = this.getAtomProxy();
    const ap2 = this.getAtomProxy();
    let bondCount;
    if (isMulti) {
      const storeBondOrder = bp.bondStore.bondOrder;
      bondCount = 0;
      bondSet.forEach(function(index) {
        bondCount += storeBondOrder[index];
      });
    } else {
      bondCount = bondSet.getSize();
    }
    if (!what || what.position) {
      bondData.position1 = new Float32Array(bondCount * 3);
      bondData.position2 = new Float32Array(bondCount * 3);
    }
    if ((!what || what.color) && p.colorParams) {
      bondData.color = new Float32Array(bondCount * 3);
      bondData.color2 = new Float32Array(bondCount * 3);
      colormaker = ColormakerRegistry.getScheme(p.colorParams);
    }
    if (!what || what.picking) {
      bondData.picking = new BondPicker(new Float32Array(bondCount), this.getStructure(), p.bondStore);
    }
    if (!what || what.radius || isMulti && what.position) {
      radiusFactory = new radius_factory_default(p.radiusParams);
    }
    if (!what || what.radius) {
      bondData.radius = new Float32Array(bondCount);
      if (p.radius2) {
        bondData.radius2 = new Float32Array(bondCount);
      }
    }
    const { position1, position2, color, color2, picking, radius, radius2 } = bondData;
    let i = 0;
    let j, i3, k, bondOrder, absOffset;
    let multiRadius;
    const vt = new Vector3();
    const vShortening = new Vector3();
    const vShift = new Vector3();
    bondSet.forEach((index) => {
      i3 = i * 3;
      bp.index = index;
      ap1.index = bp.atomIndex1;
      ap2.index = bp.atomIndex2;
      bondOrder = bp.bondOrder;
      if (position1) {
        if (isMulti && bondOrder > 1) {
          const atomRadius = radiusFactory.atomRadius(ap1);
          multiRadius = atomRadius * bondScale / (0.5 * bondOrder);
          bp.calculateShiftDir(vShift);
          if (isOffset) {
            absOffset = 2 * bondSpacing * atomRadius;
            vShift.multiplyScalar(absOffset);
            vShift.negate();
            vShortening.subVectors(ap2, ap1).multiplyScalar(
              // TODO
              Math.max(0.1, absOffset / 1.88)
            );
            ap1.positionToArray(position1, i3);
            ap2.positionToArray(position2, i3);
            if (bondOrder >= 2) {
              vt.addVectors(ap1, vShift).add(vShortening).toArray(position1, i3 + 3);
              vt.addVectors(ap2, vShift).sub(vShortening).toArray(position2, i3 + 3);
              if (bondOrder >= 3) {
                vt.subVectors(ap1, vShift).add(vShortening).toArray(position1, i3 + 6);
                vt.subVectors(ap2, vShift).sub(vShortening).toArray(position2, i3 + 6);
              }
            }
          } else {
            absOffset = (bondSpacing - bondScale) * atomRadius;
            vShift.multiplyScalar(absOffset);
            if (bondOrder === 2) {
              vt.addVectors(ap1, vShift).toArray(position1, i3);
              vt.subVectors(ap1, vShift).toArray(position1, i3 + 3);
              vt.addVectors(ap2, vShift).toArray(position2, i3);
              vt.subVectors(ap2, vShift).toArray(position2, i3 + 3);
            } else if (bondOrder === 3) {
              ap1.positionToArray(position1, i3);
              vt.addVectors(ap1, vShift).toArray(position1, i3 + 3);
              vt.subVectors(ap1, vShift).toArray(position1, i3 + 6);
              ap2.positionToArray(position2, i3);
              vt.addVectors(ap2, vShift).toArray(position2, i3 + 3);
              vt.subVectors(ap2, vShift).toArray(position2, i3 + 6);
            } else {
              ap1.positionToArray(position1, i3);
              ap2.positionToArray(position2, i3);
            }
          }
        } else {
          ap1.positionToArray(position1, i3);
          ap2.positionToArray(position2, i3);
        }
      }
      if (color && color2) {
        colormaker.bondColorToArray(bp, 1, color, i3);
        colormaker.bondColorToArray(bp, 0, color2, i3);
        if (isMulti && bondOrder > 1) {
          for (j = 1; j < bondOrder; ++j) {
            k = j * 3 + i3;
            copyWithin(color, i3, k, 3);
            copyWithin(color2, i3, k, 3);
          }
        }
      }
      if (picking && picking.array) {
        picking.array[i] = index;
        if (isMulti && bondOrder > 1) {
          for (j = 1; j < bondOrder; ++j) {
            picking.array[i + j] = index;
          }
        }
      }
      if (radius) {
        radius[i] = radiusFactory.atomRadius(ap1);
        if (isMulti && bondOrder > 1) {
          multiRadius = radius[i] * bondScale / (isOffset ? 1 : 0.5 * bondOrder);
          for (j = isOffset ? 1 : 0; j < bondOrder; ++j) {
            radius[i + j] = multiRadius;
          }
        }
      }
      if (radius2) {
        radius2[i] = radiusFactory.atomRadius(ap2);
        if (isMulti && bondOrder > 1) {
          multiRadius = radius2[i] * bondScale / (isOffset ? 1 : 0.5 * bondOrder);
          for (j = isOffset ? 1 : 0; j < bondOrder; ++j) {
            radius2[i + j] = multiRadius;
          }
        }
      }
      i += isMulti ? bondOrder : 1;
    });
    return bondData;
  }
  getBackboneAtomData(params) {
    params = Object.assign({
      atomSet: this.atomSetCache.__backbone
    }, params);
    return this.getAtomData(params);
  }
  getBackboneBondData(params) {
    params = Object.assign({
      bondSet: this.getBackboneBondSet(),
      bondStore: this.backboneBondStore
    }, params);
    return this.getBondData(params);
  }
  getRungAtomData(params) {
    params = Object.assign({
      atomSet: this.atomSetCache.__rung
    }, params);
    return this.getAtomData(params);
  }
  getRungBondData(params) {
    params = Object.assign({
      bondSet: this.getRungBondSet(),
      bondStore: this.rungBondStore
    }, params);
    return this.getBondData(params);
  }
  //
  /**
   * Gets the bounding box of the (selected) structure atoms
   * @param  {Selection} [selection] - the selection
   * @param  {Box3} [box] - optional target
   * @return {Vector3} the box
   */
  getBoundingBox(selection2, box) {
    if (Debug) Log.time("getBoundingBox");
    box = box || new Box3();
    let minX = Infinity;
    let minY = Infinity;
    let minZ = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let maxZ = -Infinity;
    this.eachAtom((ap) => {
      const x = ap.x;
      const y = ap.y;
      const z = ap.z;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (z < minZ) minZ = z;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      if (z > maxZ) maxZ = z;
    }, selection2);
    box.min.set(minX, minY, minZ);
    box.max.set(maxX, maxY, maxZ);
    if (Debug) Log.timeEnd("getBoundingBox");
    return box;
  }
  /**
   * Gets the principal axes of the (selected) structure atoms
   * @param  {Selection} [selection] - the selection
   * @return {PrincipalAxes} the principal axes
   */
  getPrincipalAxes(selection2) {
    if (Debug) Log.time("getPrincipalAxes");
    let i = 0;
    const coords = new Matrix(3, this.atomCount);
    const cd = coords.data;
    this.eachAtom((a) => {
      cd[i + 0] = a.x;
      cd[i + 1] = a.y;
      cd[i + 2] = a.z;
      i += 3;
    }, selection2);
    if (Debug) Log.timeEnd("getPrincipalAxes");
    return new principal_axes_default(coords);
  }
  /**
   * Gets the center of the (selected) structure atoms
   * @param  {Selection} [selection] - the selection
   * @return {Vector3} the center
   */
  atomCenter(selection2) {
    if (selection2) {
      return this.getBoundingBox(selection2).getCenter(new Vector3());
    } else {
      return this.center.clone();
    }
  }
  hasCoords() {
    if (this._hasCoords === void 0) {
      const atomStore = this.atomStore;
      this._hasCoords = arrayMin(atomStore.x) !== 0 || arrayMax(atomStore.x) !== 0 || arrayMin(atomStore.y) !== 0 || arrayMax(atomStore.y) !== 0 || arrayMin(atomStore.z) !== 0 || arrayMax(atomStore.z) !== 0 || // allow models with a single atom at the origin
      atomStore.count / this.modelStore.count === 1;
    }
    return this._hasCoords;
  }
  getSequence(selection2) {
    const seq = [];
    const rp = this.getResidueProxy();
    this.eachAtom(function(ap) {
      rp.index = ap.residueIndex;
      if (ap.index === rp.traceAtomIndex) {
        seq.push(rp.getResname1());
      }
    }, selection2);
    return seq;
  }
  getAtomIndices(selection2) {
    if (selection2 && selection2.string) {
      const indices = [];
      this.eachAtom(function(ap) {
        indices.push(ap.index);
      }, selection2);
      return new Uint32Array(indices);
    } else {
      const p = { what: { index: true } };
      return this.getAtomData(p).index;
    }
  }
  /**
   * Get number of unique chainnames
   * @param  {Selection} selection - limit count to selection
   * @return {Integer} count
   */
  getChainnameCount(selection2) {
    const chainnames = /* @__PURE__ */ new Set();
    this.eachChain(function(cp) {
      if (cp.residueCount) {
        chainnames.add(cp.chainname);
      }
    }, selection2);
    return chainnames.size;
  }
  //
  updatePosition(position) {
    let i = 0;
    this.eachAtom(function(ap) {
      ap.positionFromArray(position, i);
      i += 3;
    }, void 0);
    this._hasCoords = void 0;
  }
  refreshPosition() {
    this.getBoundingBox(void 0, this.boundingBox);
    this.boundingBox.getCenter(this.center);
    this.spatialHash = new SpatialHash(this.atomStore, this.boundingBox);
  }
  /**
   * Calls dispose() method of property objects.
   * Unsets properties to help garbage collection.
   * @return {undefined}
   */
  dispose() {
    if (this.frames) this.frames.length = 0;
    if (this.boxes) this.boxes.length = 0;
    this.bondStore.dispose();
    this.backboneBondStore.dispose();
    this.rungBondStore.dispose();
    this.atomStore.dispose();
    this.residueStore.dispose();
    this.chainStore.dispose();
    this.modelStore.dispose();
    delete this.bondStore;
    delete this.atomStore;
    delete this.residueStore;
    delete this.chainStore;
    delete this.modelStore;
    delete this.frames;
    delete this.boxes;
    delete this.bondSet;
    delete this.atomSet;
  }
};
var structure_default = Structure;

// src/parser/structure-parser.ts
var StructureParser = class extends parser_default {
  constructor(streamer, params) {
    var p = params || {};
    super(streamer, p);
    this.firstModelOnly = defaults(p.firstModelOnly, false);
    this.asTrajectory = defaults(p.asTrajectory, false);
    this.cAlphaOnly = defaults(p.cAlphaOnly, false);
    this.structure = new structure_default(this.name, this.path);
    this.structureBuilder = new structure_builder_default(this.structure);
  }
  get type() {
    return "structure";
  }
  get __objName() {
    return "structure";
  }
};
var structure_parser_default = StructureParser;

// src/structure/entity.ts
function entityTypeFromString(string) {
  string = string.toLowerCase();
  switch (string) {
    case "polymer":
      return PolymerEntity;
    case "non-polymer":
      return NonPolymerEntity;
    case "macrolide":
      return MacrolideEntity;
    case "water":
      return WaterEntity;
    default:
      return UnknownEntity;
  }
}
function entityFromType(type) {
  switch (type) {
    case PolymerEntity:
      return "polymer";
    case NonPolymerEntity:
      return "non-polymer";
    case MacrolideEntity:
      return "macrolide";
    case WaterEntity:
      return "water";
    default:
      return void 0;
  }
}
var Entity = class {
  /**
   * @param {Structure} structure - structure the entity belongs to
   * @param {Integer} index - index within structure.entityList
   * @param {String} description - entity description
   * @param {String} type - entity type
   * @param {Array} chainIndexList - entity chainIndexList
   */
  constructor(structure, index, description = "", type, chainIndexList = []) {
    this.structure = structure;
    this.index = index;
    this.description = description;
    this.entityType = entityTypeFromString(type || "");
    this.chainIndexList = chainIndexList;
    chainIndexList.forEach(function(ci) {
      structure.chainStore.entityIndex[ci] = index;
    });
  }
  get type() {
    return entityFromType(this.entityType);
  }
  getEntityType() {
    return this.entityType;
  }
  isPolymer() {
    return this.entityType === PolymerEntity;
  }
  isNonPolymer() {
    return this.entityType === NonPolymerEntity;
  }
  isMacrolide() {
    return this.entityType === MacrolideEntity;
  }
  isWater() {
    return this.entityType === WaterEntity;
  }
  eachChain(callback) {
    const cp = this.structure.getChainProxy();
    this.chainIndexList.forEach(function(index) {
      cp.index = index;
      callback(cp);
    });
  }
};

// src/symmetry/unitcell.ts
var DefaultBoxParams = {
  a: 1,
  b: 1,
  c: 1,
  alpha: 90,
  beta: 90,
  gamma: 90,
  spacegroup: "P 1"
};
var Unitcell = class {
  /**
   * @param  {Object} params - unitcell parameters
   * @param  {Number} params.a - length a
   * @param  {Number} params.b - length b
   * @param  {Number} params.c - length c
   * @param  {Number} params.alpha - angle alpha
   * @param  {Number} params.beta - angle beta
   * @param  {Number} params.gamma - angle gamma
   * @param  {String} params.spacegroup - spacegroup
   * @param  {Matrix4} [params.cartToFrac] - transformation matrix from
   *                                         cartesian to fractional coordinates
   * @param  {Matrix4} [params.scale] - alias for `params.cartToFrac`
   */
  constructor(params = DefaultBoxParams) {
    this.cartToFrac = new Matrix4();
    this.fracToCart = new Matrix4();
    this.a = params.a;
    this.b = params.b;
    this.c = params.c;
    this.alpha = params.alpha;
    this.beta = params.beta;
    this.gamma = params.gamma;
    this.spacegroup = params.spacegroup;
    const alphaRad = degToRad(this.alpha);
    const betaRad = degToRad(this.beta);
    const gammaRad = degToRad(this.gamma);
    const cosAlpha = Math.cos(alphaRad);
    const cosBeta = Math.cos(betaRad);
    const cosGamma = Math.cos(gammaRad);
    const sinBeta = Math.sin(betaRad);
    const sinGamma = Math.sin(gammaRad);
    this.volume = this.a * this.b * this.c * Math.sqrt(
      1 - cosAlpha * cosAlpha - cosBeta * cosBeta - cosGamma * cosGamma + 2 * cosAlpha * cosBeta * cosGamma
    );
    if (params.cartToFrac === void 0) {
      const cStar = this.a * this.b * sinGamma / this.volume;
      const cosAlphaStar = (cosBeta * cosGamma - cosAlpha) / (sinBeta * sinGamma);
      this.fracToCart.set(
        this.a,
        0,
        0,
        0,
        this.b * cosGamma,
        this.b * sinGamma,
        0,
        0,
        this.c * cosBeta,
        -this.c * sinBeta * cosAlphaStar,
        1 / cStar,
        0,
        0,
        0,
        0,
        1
      ).transpose();
      this.cartToFrac.getInverse(this.fracToCart);
    } else {
      this.cartToFrac.copy(params.cartToFrac);
      this.fracToCart.getInverse(this.cartToFrac);
    }
  }
  getPosition(structure) {
    const vertexPosition = new Float32Array(3 * 8);
    if (structure.unitcell) {
      const uc = structure.unitcell;
      const centerFrac = structure.center.clone().applyMatrix4(uc.cartToFrac).floor();
      const v = new Vector3();
      let cornerOffset = 0;
      const addCorner = function(x, y, z) {
        v.set(x, y, z).add(centerFrac).applyMatrix4(uc.fracToCart).toArray(vertexPosition, cornerOffset);
        cornerOffset += 3;
      };
      addCorner(0, 0, 0);
      addCorner(1, 0, 0);
      addCorner(0, 1, 0);
      addCorner(0, 0, 1);
      addCorner(1, 1, 0);
      addCorner(1, 0, 1);
      addCorner(0, 1, 1);
      addCorner(1, 1, 1);
    }
    return vertexPosition;
  }
  getCenter(structure) {
    return centerArray3(this.getPosition(structure));
  }
  getData(structure, params = {}) {
    const colorValue = defaults(params.colorValue, "orange");
    const radius = defaults(params.radius, Math.cbrt(this.volume) / 200);
    const c = new Color(colorValue);
    const v = new Vector3();
    const vertexPosition = this.getPosition(structure);
    const vertexColor = uniformArray3(8, c.r, c.g, c.b);
    const vertexRadius = uniformArray(8, radius);
    const edgePosition1 = new Float32Array(3 * 12);
    const edgePosition2 = new Float32Array(3 * 12);
    const edgeColor = uniformArray3(12, c.r, c.g, c.b);
    const edgeRadius = uniformArray(12, radius);
    let edgeOffset = 0;
    function addEdge(a, b) {
      v.fromArray(vertexPosition, a * 3).toArray(edgePosition1, edgeOffset);
      v.fromArray(vertexPosition, b * 3).toArray(edgePosition2, edgeOffset);
      edgeOffset += 3;
    }
    addEdge(0, 1);
    addEdge(0, 2);
    addEdge(0, 3);
    addEdge(1, 4);
    addEdge(1, 5);
    addEdge(2, 6);
    addEdge(3, 5);
    addEdge(4, 7);
    addEdge(5, 7);
    addEdge(2, 4);
    addEdge(7, 6);
    addEdge(3, 6);
    const picker = new UnitcellPicker(this, structure);
    return {
      vertex: {
        position: vertexPosition,
        color: vertexColor,
        radius: vertexRadius,
        picking: picker
      },
      edge: {
        position1: edgePosition1,
        position2: edgePosition2,
        color: edgeColor,
        color2: edgeColor,
        radius: edgeRadius,
        picking: picker
      }
    };
  }
};
var unitcell_default = Unitcell;

// src/parser/pdb-parser.ts
var HelixTypes = {
  1: "h",
  // Right-handed alpha (default)
  2: "h",
  // Right-handed omega
  3: "i",
  // Right-handed pi
  4: "h",
  // Right-handed gamma
  5: "g",
  // Right-handed 310
  6: "h",
  // Left-handed alpha
  7: "h",
  // Left-handed omega
  8: "h",
  // Left-handed gamma
  9: "h",
  // 27 ribbon/helix
  10: "h",
  // Polyproline
  0: "h"
  //Used to be ''
};
var dAminoAcids = [
  "DAL",
  // D-ALANINE
  "DAR",
  // D-ARGININE
  "DSG",
  // D-ASPARAGINE
  "DAS",
  // D-ASPARTIC ACID
  "DCY",
  // D-CYSTEINE
  "DGL",
  // D-GLUTAMIC ACID
  "DGN",
  // D-GLUTAMINE
  "DHI",
  // D-HISTIDINE
  "DIL",
  // D-ISOLEUCINE
  "DLE",
  // D-LEUCINE
  "DLY",
  // D-LYSINE
  "MED",
  // D-METHIONINE
  "DPN",
  // D-PHENYLALANINE
  "DPR",
  // D-PROLINE
  "DSN",
  // D-SERINE
  "DTH",
  // D-THREONINE
  "DTR",
  // D-TRYPTOPHAN
  "DTY",
  // D-TYROSINE
  "DVA",
  // D-VALINE
  "DNE"
  // D-NORLEUCINE
  // ???  // D-SELENOCYSTEINE
];
var entityKeyList = [
  "MOL_ID",
  "MOLECULE",
  "CHAIN",
  "FRAGMENT",
  "SYNONYM",
  "EC",
  "ENGINEERED",
  "MUTATION",
  "OTHER_DETAILS"
];
var reWhitespace = /\s+/;
function getModresId(resno, chainname, inscode) {
  let id = `${resno}`;
  if (chainname) id += `:${chainname}`;
  if (inscode) id += `^${inscode}`;
  return id;
}
var PdbParser = class extends structure_parser_default {
  /**
   * Create a pdb parser
   * @param  {Streamer} streamer - streamer object
   * @param  {Object} params - params object
   * @param  {Boolean} params.hex - hexadecimal parsing of
   *                                atom numbers >99.999 and
   *                                residue numbers >9.999
   * @return {undefined}
   */
  constructor(streamer, params) {
    const p = params || {};
    super(streamer, p);
    this.hex = defaults(p.hex, false);
  }
  get type() {
    return "pdb";
  }
  _parse() {
    if (Debug) Log.time("PdbParser._parse " + this.name);
    let isLegacy = false;
    const headerLine = this.streamer.peekLines(1)[0];
    const headerId = headerLine.substr(62, 4);
    const legacyId = headerLine.substr(72, 4);
    if (headerId === legacyId && legacyId.trim()) {
      isLegacy = true;
    }
    const isPqr = this.type === "pqr";
    const isPdbqt = this.type === "pdbqt";
    const s = this.structure;
    const sb = this.structureBuilder;
    const hex = this.hex;
    let serialRadix = 10;
    let resnoRadix = 10;
    const firstModelOnly = this.firstModelOnly;
    const asTrajectory = this.asTrajectory;
    const cAlphaOnly = this.cAlphaOnly;
    const frames = s.frames;
    const boxes = s.boxes;
    let doFrames = false;
    let currentFrame, currentCoord;
    const biomolDict = s.biomolDict;
    let currentBiomol;
    let currentPart;
    let currentMatrix;
    let line, recordName;
    let serial, chainname, resno, resname, occupancy;
    let inscode, atomname, hetero, bfactor, altloc;
    let startChain, startResi, startIcode;
    let endChain, endResi, endIcode;
    let serialDict = {};
    const unitcellDict = {};
    const bondDict = {};
    const entityDataList = [];
    let currentEntityData;
    let currentEntityKey;
    const hetnameDict = {};
    const modresDict = {};
    const chainDict = {};
    let chainIdx, chainid, newChain;
    let currentChainname, currentResno, currentResname, currentInscode;
    const seqresDict = {};
    let currentSeqresChainname;
    const secStruct = {
      helices: [],
      sheets: []
    };
    const helices = secStruct.helices;
    const sheets = secStruct.sheets;
    const atomMap = s.atomMap;
    const atomStore = s.atomStore;
    atomStore.resize(Math.round(this.streamer.data.length / 80));
    if (isPqr || isPdbqt) atomStore.addField("partialCharge", 1, "float32");
    if (isPqr) atomStore.addField("radius", 1, "float32");
    const ap1 = s.getAtomProxy();
    const ap2 = s.getAtomProxy();
    let idx = 0;
    let modelIdx = 0;
    let pendingStart = true;
    function _parseChunkOfLines(_i, _n, lines) {
      for (let i = _i; i < _n; ++i) {
        line = lines[i];
        recordName = line.substr(0, 6);
        if (recordName === "ATOM  " || recordName === "HETATM") {
          if (pendingStart) {
            if (asTrajectory) {
              if (doFrames) {
                currentFrame = new Float32Array(atomStore.count * 3);
                frames.push(currentFrame);
              } else {
                currentFrame = [];
              }
              currentCoord = 0;
            } else {
              if (!firstModelOnly) serialDict = {};
            }
            chainIdx = 1;
            chainid = chainIdx.toString();
            newChain = true;
            pendingStart = false;
          }
          if (firstModelOnly && modelIdx > 0) continue;
          let x, y, z, ls, dd;
          if (isPqr) {
            ls = line.split(reWhitespace);
            dd = ls.length === 10 ? 1 : 0;
            atomname = ls[2];
            if (cAlphaOnly && atomname !== "CA") continue;
            x = parseFloat(ls[6 - dd]);
            y = parseFloat(ls[7 - dd]);
            z = parseFloat(ls[8 - dd]);
          } else {
            atomname = line.substr(12, 4).trim();
            if (cAlphaOnly && atomname !== "CA") continue;
            x = parseFloat(line.substr(30, 8));
            y = parseFloat(line.substr(38, 8));
            z = parseFloat(line.substr(46, 8));
          }
          if (asTrajectory) {
            const j = currentCoord * 3;
            currentFrame[j + 0] = x;
            currentFrame[j + 1] = y;
            currentFrame[j + 2] = z;
            currentCoord += 1;
            if (doFrames) continue;
          }
          let element;
          if (isPqr) {
            serial = parseInt(ls[1]);
            element = "";
            hetero = line[0] === "H" ? 1 : 0;
            chainname = dd ? "" : ls[4];
            resno = parseInt(ls[5 - dd]);
            inscode = "";
            resname = ls[3];
            altloc = "";
            occupancy = 1;
          } else {
            serial = parseInt(line.substr(6, 5), serialRadix);
            if (hex && serial === 99999) {
              serialRadix = 16;
            }
            hetero = line[0] === "H" ? 1 : 0;
            chainname = line[21].trim();
            resno = parseInt(line.substr(22, 4), resnoRadix);
            if (hex && resno === 9999) {
              resnoRadix = 16;
            }
            inscode = line[26].trim();
            resname = line.substr(17, 4).trim() || "MOL";
            bfactor = parseFloat(line.substr(60, 6));
            altloc = line[16].trim();
            occupancy = parseFloat(line.substr(54, 6));
            if (!isLegacy) {
              if (isPdbqt) {
                element = line.substr(12, 2).trim();
              } else {
                element = line.substr(76, 2).trim();
                if (!chainname) {
                  chainname = line.substr(72, 4).trim();
                }
              }
            }
          }
          atomStore.growIfFull();
          atomStore.atomTypeId[idx] = atomMap.add(atomname, element);
          atomStore.x[idx] = x;
          atomStore.y[idx] = y;
          atomStore.z[idx] = z;
          atomStore.serial[idx] = serial;
          atomStore.altloc[idx] = altloc.charCodeAt(0);
          atomStore.occupancy[idx] = isNaN(occupancy) ? 0 : occupancy;
          if (isPqr) {
            atomStore.partialCharge[idx] = parseFloat(ls[9 - dd]);
            atomStore.radius[idx] = parseFloat(ls[10 - dd]);
          } else {
            atomStore.bfactor[idx] = isNaN(bfactor) ? 0 : bfactor;
            if (isPdbqt) {
              atomStore.partialCharge[idx] = parseFloat(line.substr(70, 6));
            }
          }
          const modresId = getModresId(resno, chainname, inscode);
          if (hetero && !modresDict[modresId] && !dAminoAcids.includes(resname)) {
            if (currentChainname !== chainname || currentResname !== resname || !WaterNames.includes(resname) && (currentResno !== resno || currentInscode !== inscode)) {
              chainIdx += 1;
              chainid = chainIdx.toString();
              currentResno = resno;
              currentResname = resname;
              currentInscode = inscode;
            }
          } else if (!newChain && currentChainname !== chainname) {
            chainIdx += 1;
            chainid = chainIdx.toString();
          }
          sb.addAtom(modelIdx, chainname, chainid, resname, resno, hetero, void 0, inscode);
          serialDict[serial] = idx;
          idx += 1;
          newChain = false;
          currentChainname = chainname;
        } else if (recordName === "CONECT") {
          const fromIdx = serialDict[parseInt(line.substr(6, 5))];
          const pos = [11, 16, 21, 26];
          const bondIndex = {};
          if (fromIdx === void 0) {
            continue;
          }
          for (let j = 0; j < 4; ++j) {
            let toIdx = parseInt(line.substr(pos[j], 5));
            if (Number.isNaN(toIdx)) continue;
            toIdx = serialDict[toIdx];
            if (toIdx === void 0) {
              continue;
            }
            if (fromIdx < toIdx) {
              ap1.index = fromIdx;
              ap2.index = toIdx;
            } else {
              ap1.index = toIdx;
              ap2.index = fromIdx;
            }
            if (bondIndex[toIdx] !== void 0) {
              s.bondStore.bondOrder[bondIndex[toIdx]] += 1;
            } else {
              const hash = ap1.index + "|" + ap2.index;
              if (bondDict[hash] === void 0) {
                bondDict[hash] = true;
                bondIndex[toIdx] = s.bondStore.count;
                s.bondStore.addBond(ap1, ap2, 1);
              }
            }
          }
        } else if (recordName === "HELIX ") {
          startChain = line[19].trim();
          startResi = parseInt(line.substr(21, 4));
          startIcode = line[25].trim();
          endChain = line[31].trim();
          endResi = parseInt(line.substr(33, 4));
          endIcode = line[37].trim();
          let helixType = parseInt(line.substr(39, 1));
          helixType = (HelixTypes[helixType] || HelixTypes[0]).charCodeAt(0);
          helices.push([
            startChain,
            startResi,
            startIcode,
            endChain,
            endResi,
            endIcode,
            helixType
          ]);
        } else if (recordName === "SHEET ") {
          startChain = line[21].trim();
          startResi = parseInt(line.substr(22, 4));
          startIcode = line[26].trim();
          endChain = line[32].trim();
          endResi = parseInt(line.substr(33, 4));
          endIcode = line[37].trim();
          sheets.push([
            startChain,
            startResi,
            startIcode,
            endChain,
            endResi,
            endIcode
          ]);
        } else if (recordName === "HETNAM") {
          hetnameDict[line.substr(11, 3)] = line.substr(15).trim();
        } else if (recordName === "SEQRES") {
          const seqresChainname = line[11].trim();
          if (seqresChainname !== currentSeqresChainname) {
            seqresDict[seqresChainname] = [];
            currentSeqresChainname = seqresChainname;
          }
          seqresDict[seqresChainname].push(
            ...line.substr(19).trim().split(reWhitespace)
          );
        } else if (recordName === "MODRES") {
          const resname2 = line.substr(12, 3).trim();
          const chainname2 = line[16].trim();
          const inscode2 = line[22].trim();
          const resno2 = parseInt(line.substr(18, 4).trim());
          const id = getModresId(resno2, chainname2, inscode2);
          modresDict[id] = { resname: resname2, chainname: chainname2, inscode: inscode2, resno: resno2 };
        } else if (recordName === "COMPND") {
          const comp = line.substr(10, 70).trim();
          const keyEnd = comp.indexOf(":");
          const key = comp.substring(0, keyEnd);
          let value;
          if (entityKeyList.includes(key)) {
            currentEntityKey = key;
            value = comp.substring(keyEnd + 2);
          } else {
            value = comp;
          }
          value = value.replace(/;$/, "");
          if (currentEntityKey === "MOL_ID") {
            currentEntityData = {
              chainList: [],
              name: ""
            };
            entityDataList.push(currentEntityData);
          } else if (currentEntityKey === "MOLECULE") {
            if (currentEntityData.name) currentEntityData.name += " ";
            currentEntityData.name += value;
          } else if (currentEntityKey === "CHAIN") {
            Array.prototype.push.apply(
              currentEntityData.chainList,
              value.split(/\s*,\s*/)
            );
          }
        } else if (line.startsWith("TER")) {
          const cp = s.getChainProxy(s.chainStore.count - 1);
          chainDict[cp.chainname] = cp.index;
          chainIdx += 1;
          chainid = chainIdx.toString();
          newChain = true;
        } else if (recordName === "REMARK" && line.substr(7, 3) === "350") {
          if (line.substr(11, 12) === "BIOMOLECULE:") {
            let name = line.substr(23).trim();
            if (/^(0|[1-9][0-9]*)$/.test(name)) name = "BU" + name;
            currentBiomol = new assembly_default(name);
            biomolDict[name] = currentBiomol;
          } else if (line.substr(13, 5) === "BIOMT") {
            const biomt = line.split(/\s+/);
            const row = parseInt(line[18]) - 1;
            if (row === 0) {
              currentMatrix = new Matrix4();
              currentPart.matrixList.push(currentMatrix);
            }
            const biomtElms = currentMatrix.elements;
            biomtElms[4 * 0 + row] = parseFloat(biomt[4]);
            biomtElms[4 * 1 + row] = parseFloat(biomt[5]);
            biomtElms[4 * 2 + row] = parseFloat(biomt[6]);
            biomtElms[4 * 3 + row] = parseFloat(biomt[7]);
          } else if (line.substr(11, 30) === "APPLY THE FOLLOWING TO CHAINS:" || line.substr(11, 30) === "                   AND CHAINS:") {
            if (line.substr(11, 5) === "APPLY") {
              currentPart = currentBiomol.addPart();
            }
            const chainList = line.substr(41, 30).split(",");
            for (let j = 0, jl = chainList.length; j < jl; ++j) {
              const c = chainList[j].trim();
              if (c) currentPart.chainList.push(c);
            }
          }
        } else if (recordName === "HEADER") {
          s.id = line.substr(62, 4);
        } else if (recordName === "TITLE ") {
          s.title += (s.title ? " " : "") + line.substr(10, 70).trim();
        } else if (recordName === "MODEL ") {
          pendingStart = true;
        } else if (recordName === "ENDMDL" || line.trim() === "END") {
          if (pendingStart) continue;
          if (asTrajectory && !doFrames) {
            frames.push(new Float32Array(currentFrame));
            doFrames = true;
          }
          modelIdx += 1;
          pendingStart = true;
        } else if (line.substr(0, 5) === "MTRIX") {
          if (line[59] === "1") continue;
          if (!currentBiomol || currentBiomol.name !== "NCS") {
            const ncsName = "NCS";
            currentBiomol = new assembly_default(ncsName);
            biomolDict[ncsName] = currentBiomol;
            currentPart = currentBiomol.addPart();
          }
          const ncs = line.split(/\s+/);
          const ncsRow = parseInt(line[5]) - 1;
          if (ncsRow === 0) {
            currentMatrix = new Matrix4();
            currentPart.matrixList.push(currentMatrix);
          }
          const ncsElms = currentMatrix.elements;
          ncsElms[4 * 0 + ncsRow] = parseFloat(ncs[2]);
          ncsElms[4 * 1 + ncsRow] = parseFloat(ncs[3]);
          ncsElms[4 * 2 + ncsRow] = parseFloat(ncs[4]);
          ncsElms[4 * 3 + ncsRow] = parseFloat(ncs[5]);
        } else if (line.substr(0, 5) === "ORIGX") {
          if (!unitcellDict.origx) {
            unitcellDict.origx = new Matrix4();
          }
          const orgix = line.split(/\s+/);
          const origxRow = parseInt(line[5]) - 1;
          const origxElms = unitcellDict.origx.elements;
          origxElms[4 * 0 + origxRow] = parseFloat(orgix[1]);
          origxElms[4 * 1 + origxRow] = parseFloat(orgix[2]);
          origxElms[4 * 2 + origxRow] = parseFloat(orgix[3]);
          origxElms[4 * 3 + origxRow] = parseFloat(orgix[4]);
        } else if (line.substr(0, 5) === "SCALE") {
          if (!unitcellDict.scale) {
            unitcellDict.scale = new Matrix4();
          }
          const scale = line.split(/\s+/);
          const scaleRow = parseInt(line[5]) - 1;
          const scaleElms = unitcellDict.scale.elements;
          scaleElms[4 * 0 + scaleRow] = parseFloat(scale[1]);
          scaleElms[4 * 1 + scaleRow] = parseFloat(scale[2]);
          scaleElms[4 * 2 + scaleRow] = parseFloat(scale[3]);
          scaleElms[4 * 3 + scaleRow] = parseFloat(scale[4]);
        } else if (recordName === "CRYST1") {
          const aLength = parseFloat(line.substr(6, 9));
          const bLength = parseFloat(line.substr(15, 9));
          const cLength = parseFloat(line.substr(24, 9));
          const alpha = parseFloat(line.substr(33, 7));
          const beta = parseFloat(line.substr(40, 7));
          const gamma = parseFloat(line.substr(47, 7));
          const sGroup = line.substr(55, 11).trim();
          const box = new Float32Array(9);
          box[0] = aLength;
          box[4] = bLength;
          box[8] = cLength;
          boxes.push(box);
          if (modelIdx === 0) {
            unitcellDict.a = aLength;
            unitcellDict.b = bLength;
            unitcellDict.c = cLength;
            unitcellDict.alpha = alpha;
            unitcellDict.beta = beta;
            unitcellDict.gamma = gamma;
            unitcellDict.spacegroup = sGroup;
          }
        }
      }
    }
    this.streamer.eachChunkOfLines(function(lines) {
      _parseChunkOfLines(0, lines.length, lines);
    });
    sb.finalize();
    const en = entityDataList.length;
    if (en) {
      s.eachChain(function(cp) {
        cp.entityIndex = en;
      });
      entityDataList.forEach(function(e, i) {
        const chainIndexList = e.chainList.map(function(chainname2) {
          return chainDict[chainname2];
        });
        s.entityList.push(new Entity(
          s,
          i,
          e.name,
          "polymer",
          chainIndexList
        ));
      });
      let ei = entityDataList.length;
      const rp = s.getResidueProxy();
      const residueDict = {};
      s.eachChain(function(cp) {
        if (cp.entityIndex === en) {
          rp.index = cp.residueOffset;
          if (!residueDict[rp.resname]) {
            residueDict[rp.resname] = [];
          }
          residueDict[rp.resname].push(cp.index);
        }
      });
      Object.keys(residueDict).forEach(function(resname2) {
        const chainList = residueDict[resname2];
        let type = "non-polymer";
        let name = hetnameDict[resname2] || resname2;
        if (WaterNames.includes(resname2)) {
          name = "water";
          type = "water";
        }
        s.entityList.push(new Entity(
          s,
          ei,
          name,
          type,
          chainList
        ));
        ei += 1;
      });
    }
    if (unitcellDict.a !== void 0) {
      s.unitcell = new unitcell_default(unitcellDict);
    } else {
      s.unitcell = void 0;
    }
    if (helices.length || sheets.length) {
      assignSecondaryStructure(s, secStruct);
    }
    s.finalizeAtoms();
    if (!isLegacy) calculateChainnames(s);
    calculateBonds(s);
    s.finalizeBonds();
    if (!helices.length && !sheets.length) {
      calculateSecondaryStructure(s);
    }
    buildUnitcellAssembly(s);
    if (Debug) Log.timeEnd("PdbParser._parse " + this.name);
  }
};
ParserRegistry.add("pdb", PdbParser);
ParserRegistry.add("pdb1", PdbParser);
ParserRegistry.add("ent", PdbParser);
var pdb_parser_default = PdbParser;

// src/parser/sdf-parser.ts
var reItem = /> <(.+)>/;
var SdfParser = class extends structure_parser_default {
  get type() {
    return "sdf";
  }
  _parse() {
    if (Debug) Log.time("SdfParser._parse " + this.name);
    const s = this.structure;
    const sb = this.structureBuilder;
    const firstModelOnly = this.firstModelOnly;
    const asTrajectory = this.asTrajectory;
    const headerLines = this.streamer.peekLines(2);
    s.id = headerLines[0].trim();
    s.title = headerLines[1].trim();
    const frames = s.frames;
    let doFrames = false;
    let currentFrame, currentCoord;
    const atomMap = s.atomMap;
    const atomStore = s.atomStore;
    atomStore.resize(Math.round(this.streamer.data.length / 50));
    atomStore.addField("formalCharge", 1, "int8");
    const ap1 = s.getAtomProxy();
    const ap2 = s.getAtomProxy();
    let idx = 0;
    let lineNo = 0;
    let modelIdx = 0;
    let modelAtomIdxStart = 0;
    const sdfData = [];
    let currentItem = false;
    let currentData = {};
    let mItem;
    s.extraData.sdf = sdfData;
    let atomCount, bondCount, atomStart, atomEnd, bondStart, bondEnd;
    function _parseChunkOfLines(_i, _n, lines) {
      for (let i = _i; i < _n; ++i) {
        const line = lines[i];
        if (line.substr(0, 4) === "$$$$") {
          lineNo = -1;
          ++modelIdx;
          modelAtomIdxStart = atomStore.count;
          sdfData.push(currentData);
          currentData = {};
          currentItem = false;
        } else if (lineNo === 3) {
          atomCount = parseInt(line.substr(0, 3));
          bondCount = parseInt(line.substr(3, 3));
          atomStart = 4;
          atomEnd = atomStart + atomCount;
          bondStart = atomEnd;
          bondEnd = bondStart + bondCount;
          if (asTrajectory) {
            currentCoord = 0;
            currentFrame = new Float32Array(atomCount * 3);
            frames.push(currentFrame);
            if (modelIdx > 0) doFrames = true;
          }
        } else if (lineNo >= atomStart && lineNo < atomEnd) {
          if (firstModelOnly && modelIdx > 0) continue;
          const x = parseFloat(line.substr(0, 10));
          const y = parseFloat(line.substr(10, 10));
          const z = parseFloat(line.substr(20, 10));
          if (asTrajectory) {
            const j = currentCoord * 3;
            currentFrame[j + 0] = x;
            currentFrame[j + 1] = y;
            currentFrame[j + 2] = z;
            currentCoord += 1;
            if (doFrames) continue;
          }
          const element = line.substr(31, 3).trim();
          const atomname = element + (idx + 1);
          atomStore.growIfFull();
          atomStore.atomTypeId[idx] = atomMap.add(atomname, element);
          atomStore.x[idx] = x;
          atomStore.y[idx] = y;
          atomStore.z[idx] = z;
          atomStore.serial[idx] = idx;
          atomStore.formalCharge[idx] = 0;
          sb.addAtom(modelIdx, "", "", "HET", 1, 1);
          idx += 1;
        } else if (lineNo >= bondStart && lineNo < bondEnd) {
          if (firstModelOnly && modelIdx > 0) continue;
          if (asTrajectory && modelIdx > 0) continue;
          ap1.index = parseInt(line.substr(0, 3)) - 1 + modelAtomIdxStart;
          ap2.index = parseInt(line.substr(3, 3)) - 1 + modelAtomIdxStart;
          const order = parseInt(line.substr(6, 3));
          s.bondStore.addBond(ap1, ap2, order);
        } else if (line.match(/M {2}CHG/)) {
          const chargeCount = parseInt(line.substr(6, 3));
          for (let ci = 0, coffset = 10; ci < chargeCount; ++ci, coffset += 8) {
            const aToken = parseInt(line.substr(coffset, 3));
            const atomIdx = aToken - 1 + modelAtomIdxStart;
            const cToken = parseInt(line.substr(coffset + 4, 3));
            atomStore.formalCharge[atomIdx] = cToken;
          }
        } else if (mItem = line.match(reItem)) {
          currentItem = mItem[1];
          currentData[currentItem] = [];
        } else if (currentItem !== false && line) {
          currentData[currentItem].push(line);
        }
        ++lineNo;
      }
    }
    this.streamer.eachChunkOfLines(function(lines) {
      _parseChunkOfLines(0, lines.length, lines);
    });
    sb.finalize();
    s.finalizeAtoms();
    s.finalizeBonds();
    assignResidueTypeBonds(s);
    if (Debug) Log.timeEnd("SdfParser._parse " + this.name);
  }
  _postProcess() {
    assignResidueTypeBonds(this.structure);
  }
};
ParserRegistry.add("sdf", SdfParser);
ParserRegistry.add("sd", SdfParser);
ParserRegistry.add("mol", SdfParser);
var sdf_parser_default = SdfParser;

// scripts/contact-detector/sdf-v3000-parser.js
var SdfV3000Parser = class extends structure_parser_default {
  _parse() {
    const structure = this.structure;
    const atoms = structure.atomStore;
    atoms.addField("formalCharge", 1, "int8");
    const first = structure.getAtomProxy();
    const second = structure.getAtomProxy();
    const records = this.streamer.asText().split(/^\$\$\$\$\s*$/m).filter((record) => record.trim());
    records.forEach((record, model) => {
      var _a;
      const indices = /* @__PURE__ */ new Map();
      let section = "";
      let expectedAtoms;
      let expectedBonds;
      let bondCount = 0;
      const lines = record.replace(/-\r?\nM {2}V30 /g, "").split(/\r?\n/);
      for (const line of lines) {
        if (!line.startsWith("M  V30 ")) continue;
        const tokens = line.slice(7).trim().split(/\s+/);
        if (tokens[0] === "COUNTS") {
          expectedAtoms = Number(tokens[1]);
          expectedBonds = Number(tokens[2]);
        } else if (tokens[0] === "BEGIN") {
          section = tokens[1];
        } else if (tokens[0] === "END") {
          section = "";
        } else if (section === "ATOM") {
          const [id, element, x, y, z] = tokens;
          const coordinates = [x, y, z].map(Number);
          const charge = Number(((_a = tokens.find((token) => token.startsWith("CHG="))) == null ? void 0 : _a.slice(4)) || 0);
          if (!/^[A-Z][a-z]?$/.test(element) || !coordinates.every(Number.isFinite) || !Number.isInteger(charge) || Math.abs(charge) > 15 || indices.has(id)) {
            throw new Error("Invalid V3000 contact atom");
          }
          const index = atoms.count;
          atoms.growIfFull();
          atoms.atomTypeId[index] = structure.atomMap.add(element + (index + 1), element);
          [atoms.x[index], atoms.y[index], atoms.z[index]] = coordinates;
          atoms.serial[index] = index;
          atoms.formalCharge[index] = charge;
          indices.set(id, index);
          this.structureBuilder.addAtom(model, "", "", "HET", 1, 1);
        } else if (section === "BOND") {
          const order = Number(tokens[1]);
          if (!indices.has(tokens[2]) || !indices.has(tokens[3]) || ![1, 2, 3, 4].includes(order)) {
            throw new Error("Invalid or unsupported V3000 contact bond");
          }
          first.index = indices.get(tokens[2]);
          second.index = indices.get(tokens[3]);
          structure.bondStore.addBond(first, second, order);
          bondCount++;
        }
      }
      if (indices.size !== expectedAtoms || bondCount !== expectedBonds) {
        throw new Error("Incomplete V3000 contact structure");
      }
    });
    this.structureBuilder.finalize();
    structure.finalizeAtoms();
    structure.finalizeBonds();
    assignResidueTypeBonds(structure);
  }
};

// src/streamer/streamer.ts
var Streamer = class {
  constructor(src, params = {}) {
    this.chunkSize = 1024 * 1024 * 10;
    this.newline = "\n";
    this.__pointer = 0;
    this.__partialLine = "";
    this.compressed = defaults(params.compressed, false);
    this.binary = defaults(params.binary, false);
    this.json = defaults(params.json, false);
    this.xml = defaults(params.xml, false);
    this.src = src;
  }
  isBinary() {
    return this.binary || this.compressed;
  }
  read() {
    return this._read().then((data) => {
      const decompressFn = this.compressed ? DecompressorRegistry.get(this.compressed) : void 0;
      if (this.compressed && decompressFn) {
        this.data = decompressFn(data);
      } else {
        if ((this.binary || this.compressed) && data instanceof ArrayBuffer) {
          data = new Uint8Array(data);
        }
        this.data = data;
      }
      return this.data;
    });
  }
  _chunk(start, end) {
    end = Math.min(this.data.length, end);
    if (start === 0 && this.data.length === end) {
      return this.data;
    } else {
      if (this.isBinary()) {
        return this.data.subarray(start, end);
      } else {
        return this.data.substring(start, end);
      }
    }
  }
  chunk(start) {
    const end = start + this.chunkSize;
    return this._chunk(start, end);
  }
  peekLines(m) {
    const data = this.data;
    const n = data.length;
    const newline = this.isBinary() ? this.newline.charCodeAt(0) : this.newline;
    let i;
    let count = 0;
    for (i = 0; i < n; ++i) {
      if (data[i] === newline) ++count;
      if (count === m) break;
    }
    const chunk = this._chunk(0, i + 1);
    const d = this.chunkToLines(chunk, "", i > n);
    return d.lines;
  }
  chunkCount() {
    return Math.floor(this.data.length / this.chunkSize) + 1;
  }
  asText() {
    return this.isBinary() ? uint8ToString(this.data) : this.data;
  }
  chunkToLines(chunk, partialLine, isLast) {
    const newline = this.newline;
    if (!this.isBinary() && chunk.length === this.data.length) {
      return {
        lines: chunk.split(newline),
        partialLine: ""
      };
    }
    let lines = [];
    const str = this.isBinary() ? uint8ToString(chunk) : chunk;
    const idx = str.lastIndexOf(newline);
    if (idx === -1) {
      partialLine += str;
    } else {
      const str2 = partialLine + str.substr(0, idx);
      lines = lines.concat(str2.split(newline));
      if (idx === str.length - newline.length) {
        partialLine = "";
      } else {
        partialLine = str.substr(idx + newline.length);
      }
    }
    if (isLast && partialLine !== "") {
      lines.push(partialLine);
    }
    return {
      lines,
      partialLine
    };
  }
  nextChunk() {
    const start = this.__pointer;
    if (start > this.data.length) {
      return void 0;
    }
    this.__pointer += this.chunkSize;
    return this.chunk(start);
  }
  nextChunkOfLines() {
    const chunk = this.nextChunk();
    if (chunk === void 0) {
      return void 0;
    }
    const isLast = this.__pointer > this.data.length;
    const d = this.chunkToLines(chunk, this.__partialLine, isLast);
    this.__partialLine = d.partialLine;
    return d.lines;
  }
  eachChunk(callback) {
    const chunkSize = this.chunkSize;
    const n = this.data.length;
    const chunkCount = this.chunkCount();
    for (let i = 0; i < n; i += chunkSize) {
      const chunk = this.chunk(i);
      const chunkNo = Math.round(i / chunkSize);
      callback(chunk, chunkNo, chunkCount);
    }
  }
  eachChunkOfLines(callback) {
    this.eachChunk((chunk, chunkNo, chunkCount) => {
      const isLast = chunkNo === chunkCount + 1;
      const d = this.chunkToLines(chunk, this.__partialLine, isLast);
      this.__partialLine = d.partialLine;
      callback(d.lines, chunkNo, chunkCount);
    });
  }
  dispose() {
    delete this.src;
  }
};
var streamer_default = Streamer;

// src/structure/structure-view.ts
structure_default.prototype.getView = function(selection2) {
  return new StructureView(this, selection2);
};
var StructureView = class extends structure_default {
  /**
   * @param {Structure} structure - the structure
   * @param {Selection} selection - the selection
   */
  constructor(structure, selection2) {
    super();
    this.structure = structure;
    this.selection = selection2;
    this.center = new Vector3();
    this.boundingBox = new Box3();
    this._bp = this.getBondProxy();
    this._ap = this.getAtomProxy();
    this._rp = this.getResidueProxy();
    this._cp = this.getChainProxy();
    if (this.selection) {
      this.selection.signals.stringChanged.add(this.refresh, this);
    }
    this.structure.signals.refreshed.add(this.refresh, this);
    this.refresh();
  }
  init() {
  }
  get type() {
    return "StructureView";
  }
  get name() {
    return this.structure.name;
  }
  get path() {
    return this.structure.path;
  }
  get title() {
    return this.structure.title;
  }
  get id() {
    return this.structure.id;
  }
  get data() {
    return this.structure.data;
  }
  get atomSetDict() {
    return this.structure.atomSetDict;
  }
  get biomolDict() {
    return this.structure.biomolDict;
  }
  get entityList() {
    return this.structure.entityList;
  }
  get unitcell() {
    return this.structure.unitcell;
  }
  get frames() {
    return this.structure.frames;
  }
  get boxes() {
    return this.structure.boxes;
  }
  get validation() {
    return this.structure.validation;
  }
  get bondStore() {
    return this.structure.bondStore;
  }
  get backboneBondStore() {
    return this.structure.backboneBondStore;
  }
  get rungBondStore() {
    return this.structure.rungBondStore;
  }
  get atomStore() {
    return this.structure.atomStore;
  }
  get residueStore() {
    return this.structure.residueStore;
  }
  get chainStore() {
    return this.structure.chainStore;
  }
  get modelStore() {
    return this.structure.modelStore;
  }
  get atomMap() {
    return this.structure.atomMap;
  }
  get residueMap() {
    return this.structure.residueMap;
  }
  get bondHash() {
    return this.structure.bondHash;
  }
  get spatialHash() {
    return this.structure.spatialHash;
  }
  get _hasCoords() {
    return this.structure._hasCoords;
  }
  set _hasCoords(value) {
    this.structure._hasCoords = value;
  }
  /**
   * Updates atomSet, bondSet, atomSetCache, atomCount, bondCount, boundingBox, center.
   * @emits {Structure.signals.refreshed} when refreshed
   * @return {undefined}
   */
  refresh() {
    if (Debug) Log.time("StructureView.refresh");
    this.atomSetCache = {};
    const structure = this.structure;
    if (this.selection.isAllSelection() && structure !== this && structure.atomSet && structure.bondSet) {
      this.atomSet = structure.atomSet.clone();
      this.bondSet = structure.bondSet.clone();
      for (let name in this.atomSetDict) {
        const atomSet = this.atomSetDict[name];
        this.atomSetCache["__" + name] = atomSet.clone();
      }
      this.atomCount = structure.atomCount;
      this.bondCount = structure.bondCount;
      this.boundingBox.copy(structure.boundingBox);
      this.center.copy(structure.center);
    } else if (this.selection.isNoneSelection() && structure !== this && structure.atomSet && structure.bondSet) {
      this.atomSet = new BitArray(structure.atomCount);
      this.bondSet = new BitArray(structure.bondCount);
      for (let name in this.atomSetDict) {
        this.atomSetCache["__" + name] = new BitArray(structure.atomCount);
      }
      this.atomCount = 0;
      this.bondCount = 0;
      this.boundingBox.makeEmpty();
      this.center.set(0, 0, 0);
    } else {
      this.atomSet = this.getAtomSet(this.selection, true);
      if (structure.atomSet) {
        this.atomSet = this.atomSet.intersection(structure.atomSet);
      }
      this.bondSet = this.getBondSet();
      for (let name in this.atomSetDict) {
        const atomSet = this.atomSetDict[name];
        this.atomSetCache["__" + name] = atomSet.makeIntersection(this.atomSet);
      }
      this.atomCount = this.atomSet.getSize();
      this.bondCount = this.bondSet.getSize();
      this.boundingBox = this.getBoundingBox();
      this.center = this.boundingBox.getCenter(new Vector3());
    }
    if (Debug) Log.timeEnd("StructureView.refresh");
    this.signals.refreshed.dispatch();
  }
  //
  setSelection(selection2) {
    this.selection = selection2;
    this.refresh();
  }
  getSelection(selection2) {
    const seleList = [];
    if (selection2 && selection2.string) {
      seleList.push(selection2.string);
    }
    const parentSelection = this.structure.getSelection();
    if (parentSelection && parentSelection.string) {
      seleList.push(parentSelection.string);
    }
    if (this.selection && this.selection.string) {
      seleList.push(this.selection.string);
    }
    let sele = "";
    if (seleList.length > 0) {
      sele = `( ${seleList.join(" ) AND ( ")} )`;
    }
    return new selection_default(sele);
  }
  getStructure() {
    return this.structure.getStructure();
  }
  //
  eachBond(callback, selection2) {
    this.structure.eachBond(callback, this.getSelection(selection2));
  }
  eachAtom(callback, selection2) {
    const ap = this.getAtomProxy();
    const atomSet = this.getAtomSet(selection2);
    const n = this.atomStore.count;
    if (atomSet.getSize() < n) {
      atomSet.forEach(function(index) {
        ap.index = index;
        callback(ap);
      });
    } else {
      for (let i = 0; i < n; ++i) {
        ap.index = i;
        callback(ap);
      }
    }
  }
  eachResidue(callback, selection2) {
    this.structure.eachResidue(callback, this.getSelection(selection2));
  }
  /**
   * Not implemented
   * @alias StructureView#eachResidueN
   * @return {undefined}
   */
  eachResidueN(n, callback) {
    console.error("StructureView.eachResidueN() not implemented");
  }
  eachChain(callback, selection2) {
    this.structure.eachChain(callback, this.getSelection(selection2));
  }
  eachModel(callback, selection2) {
    this.structure.eachModel(callback, this.getSelection(selection2));
  }
  //
  getAtomSet(selection2, ignoreView = false) {
    let atomSet = this.structure.getAtomSet(selection2);
    if (!ignoreView && this.atomSet) {
      atomSet = atomSet.makeIntersection(this.atomSet);
    }
    return atomSet;
  }
  //
  getAtomIndices(selection2) {
    return this.structure.getAtomIndices(this.getSelection(selection2));
  }
  refreshPosition() {
    return this.structure.refreshPosition();
  }
  //
  dispose() {
    if (this.selection) {
      this.selection.signals.stringChanged.remove(this.refresh, this);
    }
    this.structure.signals.refreshed.remove(this.refresh, this);
    delete this.structure;
    delete this.atomSet;
    delete this.bondSet;
    delete this.atomCount;
    delete this.bondCount;
  }
};

// src/store/contact-store.ts
var ContactStore = class extends Store {
  get _defaultFields() {
    return [
      ["index1", 1, "int32"],
      ["index2", 1, "int32"],
      ["type", 1, "int8"]
    ];
  }
  addContact(index1, index2, type) {
    this.growIfFull();
    const i = this.count;
    if (index1 < index2) {
      this.index1[i] = index1;
      this.index2[i] = index2;
    } else {
      this.index2[i] = index1;
      this.index1[i] = index2;
    }
    if (type) this.type[i] = type;
    this.count += 1;
  }
};

// src/chemistry/interactions/features.ts
function createFeatures() {
  return {
    types: [],
    groups: [],
    centers: { x: [], y: [], z: [] },
    atomSets: []
  };
}
function createFeatureState(type = 0 /* Unknown */, group = 0 /* Unknown */) {
  return { type, group, x: 0, y: 0, z: 0, atomSet: [] };
}
function addAtom(state, atom) {
  state.x += atom.x;
  state.y += atom.y;
  state.z += atom.z;
  state.atomSet.push(atom.index);
}
function addFeature(features, state) {
  const n = state.atomSet.length;
  if (n > 0) {
    const { types, groups, centers, atomSets } = features;
    types.push(state.type);
    groups.push(state.group);
    centers.x.push(state.x / n);
    centers.y.push(state.y / n);
    centers.z.push(state.z / n);
    atomSets.push(state.atomSet);
  }
}

// src/chemistry/functional-groups.ts
function isSulfonicAcid(a) {
  return a.number === 16 && a.bondToElementCount(8 /* O */) === 3;
}
function isSulfate(a) {
  return a.number === 16 && a.bondToElementCount(8 /* O */) === 4;
}
function isPhosphate(a) {
  return a.number === 15 && a.bondToElementCount(8 /* O */) === a.bondCount;
}
function isCarboxylate(a) {
  let terminalOxygenCount = 0;
  if (a.number === 6 && a.bondToElementCount(8 /* O */) === 2 && a.bondToElementCount(6 /* C */) === 1) {
    a.eachBondedAtom((ba) => {
      if (ba.number === 8 && ba.bondCount - ba.bondToElementCount(1 /* H */) === 1) {
        ++terminalOxygenCount;
      }
    });
  }
  return terminalOxygenCount === 2;
}
function isGuanidine(a) {
  let terminalNitrogenCount = 0;
  if (a.number === 6 && a.bondCount === 3 && a.bondToElementCount(7 /* N */) === 3) {
    a.eachBondedAtom((ba) => {
      if (ba.bondCount - ba.bondToElementCount(1 /* H */) === 1) {
        ++terminalNitrogenCount;
      }
    });
  }
  return terminalNitrogenCount === 2;
}
function isAcetamidine(a) {
  let terminalNitrogenCount = 0;
  if (a.number === 6 && a.bondCount === 3 && a.bondToElementCount(7 /* N */) === 2 && a.bondToElementCount(6 /* C */) === 1) {
    a.eachBondedAtom((ba) => {
      if (ba.bondCount - ba.bondToElementCount(1 /* H */) === 1) {
        ++terminalNitrogenCount;
      }
    });
  }
  return terminalNitrogenCount === 2;
}
var PolarElements = [
  7 /* N */,
  8 /* O */,
  16 /* S */,
  9 /* F */,
  17 /* CL */,
  35 /* BR */,
  53 /* I */
];

// src/chemistry/interactions/charged.ts
var PositvelyCharged = ["ARG", "HIS", "LYS"];
var NegativelyCharged = ["GLU", "ASP"];
function addPositiveCharges(structure, features) {
  const { charge } = valenceModel(structure.data);
  const atomInGroupDict = {};
  structure.eachResidue((r) => {
    if (PositvelyCharged.includes(r.resname)) {
      const state = createFeatureState(1 /* PositiveCharge */);
      r.eachAtom((a) => {
        if (a.number === 7 /* N */ && a.isSidechain()) {
          addAtom(state, a);
        }
      });
      addFeature(features, state);
    } else if (!AA3.includes(r.resname) && !r.isNucleic()) {
      r.eachAtom((a) => {
        let addGroup = false;
        const state = createFeatureState(1 /* PositiveCharge */);
        if (isGuanidine(a)) {
          state.group = 8 /* Guanidine */;
          addGroup = true;
        } else if (isAcetamidine(a)) {
          state.group = 9 /* Acetamidine */;
          addGroup = true;
        }
        if (addGroup) {
          a.eachBondedAtom((a2) => {
            if (a2.number === 7 /* N */) {
              atomInGroupDict[a2.index] = true;
              addAtom(state, a2);
            }
          });
          addFeature(features, state);
        }
      });
      r.eachAtom((a) => {
        const state = createFeatureState(1 /* PositiveCharge */);
        if (charge[a.index] > 0) {
          if (!atomInGroupDict[a.index]) {
            addAtom(state, a);
            addFeature(features, state);
          }
        }
      });
    }
  });
}
function addNegativeCharges(structure, features) {
  const { charge } = valenceModel(structure.data);
  const atomInGroupDict = {};
  structure.eachResidue((r) => {
    if (NegativelyCharged.includes(r.resname)) {
      const state = createFeatureState(2 /* NegativeCharge */);
      r.eachAtom((a) => {
        if (a.number === 8 /* O */ && a.isSidechain()) {
          addAtom(state, a);
        }
      });
      addFeature(features, state);
    } else if (Bases.includes(r.resname)) {
      const state = createFeatureState(2 /* NegativeCharge */);
      r.eachAtom((a) => {
        if (isPhosphate(a)) {
          state.group = 6 /* Phosphate */;
          a.eachBondedAtom((a2) => {
            if (a2.number === 8 /* O */) addAtom(state, a2);
          });
          addFeature(features, state);
        }
      });
    } else if (!AA3.includes(r.resname) && !Bases.includes(r.resname)) {
      r.eachAtom((a) => {
        let addGroup = false;
        const state = createFeatureState(2 /* NegativeCharge */);
        if (isSulfonicAcid(a)) {
          state.group = 4 /* SulfonicAcid */;
          addGroup = true;
        } else if (isPhosphate(a)) {
          state.group = 6 /* Phosphate */;
          addGroup = true;
        } else if (isSulfate(a)) {
          state.group = 5 /* Sulfate */;
          addGroup = true;
        } else if (isCarboxylate(a)) {
          state.group = 10 /* Carboxylate */;
          addGroup = true;
        }
        if (addGroup) {
          a.eachBondedAtom((a2) => {
            if (a2.number === 8 /* O */) {
              atomInGroupDict[a2.index] = true;
              addAtom(state, a2);
            }
          });
          addFeature(features, state);
        }
      });
      r.eachAtom((a) => {
        const state = createFeatureState(2 /* NegativeCharge */);
        if (charge[a.index] < 0) {
          if (!atomInGroupDict[a.index]) {
            addAtom(state, a);
            addFeature(features, state);
          }
        }
      });
    }
  });
}
function addAromaticRings(structure, features) {
  const a = structure.getAtomProxy();
  structure.eachResidue((r) => {
    const rings = r.getAromaticRings();
    if (rings) {
      const offset = r.atomOffset;
      rings.forEach((ring) => {
        const state = createFeatureState(3 /* AromaticRing */);
        ring.forEach((i) => {
          a.index = i + offset;
          addAtom(state, a);
        });
        addFeature(features, state);
      });
    }
  });
}
function isIonicInteraction(ti, tj) {
  return ti === 2 /* NegativeCharge */ && tj === 1 /* PositiveCharge */ || ti === 1 /* PositiveCharge */ && tj === 2 /* NegativeCharge */;
}
function isPiStacking(ti, tj) {
  return ti === 3 /* AromaticRing */ && tj === 3 /* AromaticRing */;
}
function isCationPi(ti, tj) {
  return ti === 3 /* AromaticRing */ && tj === 1 /* PositiveCharge */ || ti === 1 /* PositiveCharge */ && tj === 3 /* AromaticRing */;
}
function addChargedContacts(structure, contacts, params = {}) {
  const maxIonicDist = defaults(params.maxIonicDist, ContactDefaultParams.maxIonicDist);
  const maxPiStackingDist = defaults(params.maxPiStackingDist, ContactDefaultParams.maxPiStackingDist);
  const maxPiStackingOffset = defaults(params.maxPiStackingOffset, ContactDefaultParams.maxPiStackingOffset);
  const maxPiStackingAngle = defaults(params.maxPiStackingAngle, ContactDefaultParams.maxPiStackingAngle);
  const maxCationPiDist = defaults(params.maxCationPiDist, ContactDefaultParams.maxCationPiDist);
  const maxCationPiOffset = defaults(params.maxCationPiOffset, ContactDefaultParams.maxCationPiOffset);
  const masterIdx = defaults(params.masterModelIndex, ContactDefaultParams.masterModelIndex);
  const maxDistance = Math.max(maxIonicDist + 2, maxPiStackingDist, maxCationPiDist);
  const maxPiStackingDistSq = maxPiStackingDist * maxPiStackingDist;
  const maxCationPiDistSq = maxCationPiDist * maxCationPiDist;
  const { features, spatialHash, contactStore, featureSet } = contacts;
  const { types, centers, atomSets } = features;
  const { x, y, z } = centers;
  const n = types.length;
  const ax = structure.atomStore.x;
  const ay = structure.atomStore.y;
  const az = structure.atomStore.z;
  const ap1 = structure.getAtomProxy();
  const ap2 = structure.getAtomProxy();
  const areAtomSetsWithinDist = function(atomSet1, atomSet2, maxDist) {
    const sn = atomSet1.length;
    const sm = atomSet2.length;
    for (let si = 0; si < sn; ++si) {
      ap1.index = atomSet1[si];
      for (let sj = 0; sj < sm; ++sj) {
        ap2.index = atomSet2[sj];
        if (ap1.distanceTo(ap2) <= maxDist) {
          return true;
        }
      }
    }
    return false;
  };
  const v1 = new Vector3();
  const v2 = new Vector3();
  const v3 = new Vector3();
  const d1 = new Vector3();
  const d2 = new Vector3();
  const n1 = new Vector3();
  const n2 = new Vector3();
  const getNormal = function(atoms, normal) {
    v1.set(ax[atoms[0]], ay[atoms[0]], az[atoms[0]]);
    v2.set(ax[atoms[1]], ay[atoms[1]], az[atoms[1]]);
    v3.set(ax[atoms[2]], ay[atoms[2]], az[atoms[2]]);
    d1.subVectors(v1, v2);
    d2.subVectors(v1, v3);
    normal.crossVectors(d1, d2);
  };
  const getOffset = function(i, j, normal) {
    v1.set(x[i], y[i], z[i]);
    v2.set(x[j], y[j], z[j]);
    return v1.sub(v2).projectOnPlane(normal).add(v2).distanceTo(v2);
  };
  const add = function(i, j, ct) {
    featureSet.setBits(i, j);
    contactStore.addContact(i, j, ct);
  };
  for (let i = 0; i < n; ++i) {
    spatialHash.eachWithin(x[i], y[i], z[i], maxDistance, (j, dSq) => {
      if (j <= i) return;
      ap1.index = atomSets[i][0];
      ap2.index = atomSets[j][0];
      if (invalidAtomContact(ap1, ap2, masterIdx)) return;
      const ti = types[i];
      const tj = types[j];
      if (isIonicInteraction(ti, tj)) {
        if (areAtomSetsWithinDist(atomSets[i], atomSets[j], maxIonicDist)) {
          add(i, j, 1 /* IonicInteraction */);
        }
      } else if (isPiStacking(ti, tj)) {
        if (dSq <= maxPiStackingDistSq) {
          getNormal(atomSets[i], n1);
          getNormal(atomSets[j], n2);
          const angle = radToDeg(n1.angleTo(n2));
          const offset = Math.min(getOffset(i, j, n2), getOffset(j, i, n1));
          if (offset <= maxPiStackingOffset) {
            if (angle <= maxPiStackingAngle || angle >= 180 - maxPiStackingAngle) {
              add(i, j, 3 /* PiStacking */);
            } else if (angle <= maxPiStackingAngle + 90 && angle >= 90 - maxPiStackingAngle) {
              add(i, j, 3 /* PiStacking */);
            }
          }
        }
      } else if (isCationPi(ti, tj)) {
        if (dSq <= maxCationPiDistSq) {
          const [l, k] = ti === 3 /* AromaticRing */ ? [i, j] : [j, i];
          getNormal(atomSets[l], n1);
          const offset = getOffset(k, l, n1);
          if (offset <= maxCationPiOffset) {
            add(l, k, 2 /* CationPi */);
          }
        }
      }
    });
  }
}

// src/chemistry/interactions/hydrogen-bonds.ts
function addHydrogenDonors(structure, features) {
  const { totalH } = valenceModel(structure.data);
  structure.eachAtom((a) => {
    const state = createFeatureState(4 /* HydrogenDonor */);
    const an = a.number;
    if (isHistidineNitrogen(a)) {
      addAtom(state, a);
      addFeature(features, state);
    } else if (totalH[a.index] > 0 && (an === 7 /* N */ || an === 8 /* O */ || an === 16 /* S */)) {
      addAtom(state, a);
      addFeature(features, state);
    }
  });
}
function addWeakHydrogenDonors(structure, features) {
  const { totalH } = valenceModel(structure.data);
  structure.eachAtom((a) => {
    if (a.number === 6 /* C */ && totalH[a.index] > 0 && (a.bondToElementCount(7 /* N */) > 0 || a.bondToElementCount(8 /* O */) > 0 || inAromaticRingWithElectronNegativeElement(a))) {
      const state = createFeatureState(9 /* WeakHydrogenDonor */);
      addAtom(state, a);
      addFeature(features, state);
    }
  });
}
function inAromaticRingWithElectronNegativeElement(a) {
  if (!a.isAromatic()) return false;
  const ringData = a.residueType.getRings();
  if (!ringData) return false;
  let hasElement = false;
  const rings = ringData.rings;
  rings.forEach((ring) => {
    if (hasElement) return;
    if (ring.some((idx) => a.index - a.residueAtomOffset === idx)) {
      hasElement = ring.some((idx) => {
        const atomTypeId = a.residueType.atomTypeIdList[idx];
        const number = a.atomMap.get(atomTypeId).number;
        return number === 7 /* N */ || number === 8 /* O */;
      });
    }
  });
  return hasElement;
}
function addHydrogenAcceptors(structure, features) {
  const { charge, implicitH, idealGeometry } = valenceModel(structure.data);
  structure.eachAtom((a) => {
    const state = createFeatureState(5 /* HydrogenAcceptor */);
    const an = a.number;
    if (an === 8 /* O */) {
      addAtom(state, a);
      addFeature(features, state);
    } else if (an === 7 /* N */) {
      if (isHistidineNitrogen(a)) {
        addAtom(state, a);
        addFeature(features, state);
      } else if (charge[a.index] < 1) {
        const totalBonds = a.bondCount + implicitH[a.index];
        const ig = idealGeometry[a.index];
        if (ig === 4 /* Tetrahedral */ && totalBonds < 4 || ig === 3 /* Trigonal */ && totalBonds < 3 || ig === 2 /* Linear */ && totalBonds < 2) {
          addAtom(state, a);
          addFeature(features, state);
        }
      }
    } else if (an === 16) {
      if (a.resname === "CYS" || a.resname === "MET" || a.formalCharge === -1) {
        addAtom(state, a);
        addFeature(features, state);
      }
    }
  });
}
function isHistidineNitrogen(ap) {
  return ap.resname === "HIS" && ap.number == 7 /* N */ && ap.isRing();
}
function isBackboneHydrogenBond(ap1, ap2) {
  return ap1.isBackbone() && ap2.isBackbone();
}
function isWaterHydrogenBond(ap1, ap2) {
  return ap1.isWater() && ap2.isWater();
}
function isHydrogenBond(ti, tj) {
  return ti === 5 /* HydrogenAcceptor */ && tj === 4 /* HydrogenDonor */ || ti === 4 /* HydrogenDonor */ && tj === 5 /* HydrogenAcceptor */;
}
function isWeakHydrogenBond(ti, tj) {
  return ti === 9 /* WeakHydrogenDonor */ && tj === 5 /* HydrogenAcceptor */ || ti === 5 /* HydrogenAcceptor */ && tj === 9 /* WeakHydrogenDonor */;
}
function getHydrogenBondType(ap1, ap2) {
  if (isWaterHydrogenBond(ap1, ap2)) {
    return 9 /* WaterHydrogenBond */;
  } else if (isBackboneHydrogenBond(ap1, ap2)) {
    return 10 /* BackboneHydrogenBond */;
  } else {
    return 4 /* HydrogenBond */;
  }
}
function addHydrogenBonds(structure, contacts, params = {}) {
  const maxHbondDist = defaults(params.maxHbondDist, ContactDefaultParams.maxHbondDist);
  const maxHbondSulfurDist = defaults(params.maxHbondSulfurDist, ContactDefaultParams.maxHbondSulfurDist);
  const maxHbondAccAngle = degToRad(defaults(params.maxHbondAccAngle, ContactDefaultParams.maxHbondAccAngle));
  const maxHbondDonAngle = degToRad(defaults(params.maxHbondDonAngle, ContactDefaultParams.maxHbondDonAngle));
  const maxHbondAccPlaneAngle = degToRad(defaults(params.maxHbondAccPlaneAngle, ContactDefaultParams.maxHbondAccPlaneAngle));
  const maxHbondDonPlaneAngle = degToRad(defaults(params.maxHbondDonPlaneAngle, ContactDefaultParams.maxHbondDonPlaneAngle));
  const masterIdx = defaults(params.masterModelIndex, ContactDefaultParams.masterModelIndex);
  const maxDist = Math.max(maxHbondDist, maxHbondSulfurDist);
  const maxHbondDistSq = maxHbondDist * maxHbondDist;
  const { features, spatialHash, contactStore, featureSet } = contacts;
  const { types, centers, atomSets } = features;
  const { x, y, z } = centers;
  const n = types.length;
  const { idealGeometry } = valenceModel(structure.data);
  const donor = structure.getAtomProxy();
  const acceptor = structure.getAtomProxy();
  for (let i = 0; i < n; ++i) {
    spatialHash.eachWithin(x[i], y[i], z[i], maxDist, (j, dSq) => {
      if (j <= i) return;
      const ti = types[i];
      const tj = types[j];
      const isWeak = isWeakHydrogenBond(ti, tj);
      if (!isWeak && !isHydrogenBond(ti, tj)) return;
      const [l, k] = tj === 5 /* HydrogenAcceptor */ ? [i, j] : [j, i];
      donor.index = atomSets[l][0];
      acceptor.index = atomSets[k][0];
      if (acceptor.index === donor.index) return;
      if (invalidAtomContact(donor, acceptor, masterIdx)) return;
      if (donor.number !== 16 /* S */ && acceptor.number !== 16 /* S */ && dSq > maxHbondDistSq) return;
      if (donor.connectedTo(acceptor)) return;
      const donorAngles = calcAngles(donor, acceptor);
      const idealDonorAngle = Angles.get(idealGeometry[donor.index]) || degToRad(120);
      if (donorAngles.some((donorAngle) => {
        return Math.abs(idealDonorAngle - donorAngle) > maxHbondDonAngle;
      })) return;
      if (idealGeometry[donor.index] === 3 /* Trigonal */) {
        const outOfPlane = calcPlaneAngle(donor, acceptor);
        if (outOfPlane !== void 0 && outOfPlane > maxHbondDonPlaneAngle) return;
      }
      const acceptorAngles = calcAngles(acceptor, donor);
      const idealAcceptorAngle = Angles.get(idealGeometry[acceptor.index]) || degToRad(120);
      if (acceptorAngles.some((acceptorAngle) => {
        return idealAcceptorAngle - acceptorAngle > maxHbondAccAngle;
      })) return;
      if (idealGeometry[acceptor.index] === 3 /* Trigonal */) {
        const outOfPlane = calcPlaneAngle(acceptor, donor);
        if (outOfPlane !== void 0 && outOfPlane > maxHbondAccPlaneAngle) return;
      }
      featureSet.setBits(l, k);
      const bondType = isWeak ? 8 /* WeakHydrogenBond */ : getHydrogenBondType(donor, acceptor);
      contactStore.addContact(l, k, bondType);
    });
  }
}

// src/chemistry/interactions/metal-binding.ts
var IonicTypeMetals = [
  3 /* LI */,
  11 /* NA */,
  19 /* K */,
  37 /* RB */,
  55 /* CS */,
  12 /* MG */,
  20 /* CA */,
  38 /* SR */,
  56 /* BA */,
  13 /* AL */,
  31 /* GA */,
  49 /* IN */,
  81 /* TL */,
  21 /* SC */,
  50 /* SN */,
  82 /* PB */,
  83 /* BI */,
  51 /* SB */,
  80 /* HG */
];
function addMetalBinding(structure, features) {
  structure.eachAtom((a) => {
    let dative = false;
    let ionic = false;
    const isStandardAminoacid = AA3.includes(a.resname);
    const isStandardBase = Bases.includes(a.resname);
    if (!isStandardAminoacid && !isStandardBase) {
      if (a.isHalogen() || a.number === 8 /* O */ || a.number === 16 /* S */) {
        dative = true;
        ionic = true;
      } else if (a.number === 7 /* N */) {
        dative = true;
      }
    } else if (isStandardAminoacid) {
      if (a.number === 8 /* O */) {
        if (["ASP", "GLU", "SER", "THR", "TYR", "ASN", "GLN"].includes(a.resname) && a.isSidechain()) {
          dative = true;
          ionic = true;
        } else if (a.isBackbone()) {
          dative = true;
          ionic = true;
        }
      } else if (a.number === 16 /* S */ && "CYS" === a.resname) {
        dative = true;
        ionic = true;
      } else if (a.number === 7 /* N */) {
        if (a.resname === "HIS" && a.isSidechain()) {
          dative = true;
        }
      }
    } else if (isStandardBase) {
      if (a.number === 8 /* O */ && a.isBackbone()) {
        dative = true;
        ionic = true;
      } else if (["N3", "N4", "N7"].includes(a.atomname)) {
        dative = true;
      } else if (["O2", "O4", "O6"].includes(a.atomname)) {
        dative = true;
        ionic = true;
      }
    }
    if (dative) {
      const state = createFeatureState(11 /* DativeBondPartner */);
      addAtom(state, a);
      addFeature(features, state);
    }
    if (ionic) {
      const state = createFeatureState(10 /* IonicTypePartner */);
      addAtom(state, a);
      addFeature(features, state);
    }
  });
}
function addMetals(structure, features) {
  structure.eachAtom((a) => {
    if (a.isTransitionMetal() || a.number === 30 /* ZN */ || a.number === 48 /* CD */) {
      const state = createFeatureState(12 /* TransitionMetal */);
      addAtom(state, a);
      addFeature(features, state);
    } else if (IonicTypeMetals.includes(a.number)) {
      const state = createFeatureState(13 /* IonicTypeMetal */);
      addAtom(state, a);
      addFeature(features, state);
    }
  });
}
function isMetalComplex(ti, tj) {
  if (ti === 12 /* TransitionMetal */) {
    return tj === 11 /* DativeBondPartner */ || tj === 12 /* TransitionMetal */;
  } else if (ti === 13 /* IonicTypeMetal */) {
    return tj === 10 /* IonicTypePartner */;
  }
}
function addMetalComplexation(structure, contacts, params = {}) {
  const maxMetalDist = defaults(params.maxMetalDist, ContactDefaultParams.maxMetalDist);
  const masterIdx = defaults(params.masterModelIndex, ContactDefaultParams.masterModelIndex);
  const { features, spatialHash, contactStore, featureSet } = contacts;
  const { types, centers, atomSets } = features;
  const { x, y, z } = centers;
  const n = types.length;
  const ap1 = structure.getAtomProxy();
  const ap2 = structure.getAtomProxy();
  for (let i = 0; i < n; ++i) {
    spatialHash.eachWithin(x[i], y[i], z[i], maxMetalDist, (j, dSq) => {
      if (j <= i) return;
      ap1.index = atomSets[i][0];
      ap2.index = atomSets[j][0];
      if (invalidAtomContact(ap1, ap2, masterIdx)) return;
      const m1 = ap1.isMetal();
      const m2 = ap2.isMetal();
      if (!m1 && !m2) return;
      const [ti, tj] = m1 ? [types[i], types[j]] : [types[j], types[i]];
      if (isMetalComplex(ti, tj)) {
        featureSet.setBits(i, j);
        contactStore.addContact(i, j, 7 /* MetalCoordination */);
      }
    });
  }
}

// src/chemistry/interactions/hydrophobic.ts
function addHydrophobic(structure, features) {
  structure.eachAtom((a) => {
    const state = createFeatureState(8 /* Hydrophobic */);
    let flag = false;
    if (a.number === 6 /* C */) {
      flag = true;
      a.eachBondedAtom((ap) => {
        const an = ap.number;
        if (an !== 6 /* C */ && an !== 1 /* H */) flag = false;
      });
    } else if (a.number === 9 /* F */) {
      flag = true;
    }
    if (flag) {
      addAtom(state, a);
      addFeature(features, state);
    }
  });
}
function isHydrophobicContact(ti, tj) {
  return ti === 8 /* Hydrophobic */ && tj === 8 /* Hydrophobic */;
}
function addHydrophobicContacts(structure, contacts, params = {}) {
  const maxHydrophobicDist = defaults(params.maxHydrophobicDist, ContactDefaultParams.maxHydrophobicDist);
  const masterIdx = defaults(params.masterModelIndex, ContactDefaultParams.masterModelIndex);
  const { features, spatialHash, contactStore, featureSet } = contacts;
  const { types, centers, atomSets } = features;
  const { x, y, z } = centers;
  const n = types.length;
  const ap1 = structure.getAtomProxy();
  const ap2 = structure.getAtomProxy();
  for (let i = 0; i < n; ++i) {
    spatialHash.eachWithin(x[i], y[i], z[i], maxHydrophobicDist, (j, dSq) => {
      if (j <= i) return;
      ap1.index = atomSets[i][0];
      ap2.index = atomSets[j][0];
      if (invalidAtomContact(ap1, ap2, masterIdx)) return;
      if (ap1.number === 9 /* F */ && ap2.number === 9 /* F */) return;
      if (ap1.connectedTo(ap2)) return;
      if (isHydrophobicContact(types[i], types[j])) {
        featureSet.setBits(i, j);
        contactStore.addContact(i, j, 6 /* Hydrophobic */);
      }
    });
  }
}

// src/chemistry/interactions/halogen-bonds.ts
var halBondElements = [17, 35, 53, 85];
function addHalogenDonors(structure, features) {
  structure.eachAtom((a) => {
    if (halBondElements.includes(a.number) && a.bondToElementCount(6 /* C */) === 1) {
      const state = createFeatureState(6 /* HalogenDonor */);
      addAtom(state, a);
      addFeature(features, state);
    }
  });
}
var X = [7 /* N */, 8 /* O */, 16 /* S */];
var Y = [6 /* C */, 7 /* N */, 15 /* P */, 16 /* S */];
function addHalogenAcceptors(structure, features) {
  structure.eachAtom((a) => {
    if (X.includes(a.number)) {
      let flag = false;
      a.eachBondedAtom((ba) => {
        if (Y.includes(ba.number)) {
          flag = true;
        }
      });
      if (flag) {
        const state = createFeatureState(7 /* HalogenAcceptor */);
        addAtom(state, a);
        addFeature(features, state);
      }
    }
  });
}
function isHalogenBond(ti, tj) {
  return ti === 7 /* HalogenAcceptor */ && tj === 6 /* HalogenDonor */ || ti === 6 /* HalogenDonor */ && tj === 7 /* HalogenAcceptor */;
}
var OptimalHalogenAngle = degToRad(180);
var OptimalAcceptorAngle = degToRad(120);
function addHalogenBonds(structure, contacts, params = {}) {
  const maxHalogenBondDist = defaults(params.maxHalogenBondDist, ContactDefaultParams.maxHalogenBondDist);
  const maxHalogenBondAngle = degToRad(defaults(params.maxHalogenBondAngle, ContactDefaultParams.maxHalogenBondAngle));
  const masterIdx = defaults(params.masterModelIndex, ContactDefaultParams.masterModelIndex);
  const { features, spatialHash, contactStore, featureSet } = contacts;
  const { types, centers, atomSets } = features;
  const { x, y, z } = centers;
  const n = types.length;
  const ap1 = structure.getAtomProxy();
  const ap2 = structure.getAtomProxy();
  for (let i = 0; i < n; ++i) {
    spatialHash.eachWithin(x[i], y[i], z[i], maxHalogenBondDist, (j, dSq) => {
      if (j <= i) return;
      ap1.index = atomSets[i][0];
      ap2.index = atomSets[j][0];
      if (invalidAtomContact(ap1, ap2, masterIdx)) return;
      if (!isHalogenBond(types[i], types[j])) return;
      const [halogen, acceptor] = types[i] === 6 /* HalogenDonor */ ? [ap1, ap2] : [ap2, ap1];
      const halogenAngles = calcAngles(halogen, acceptor);
      if (halogenAngles.length !== 1) return;
      if (OptimalHalogenAngle - halogenAngles[0] > maxHalogenBondAngle) return;
      const acceptorAngles = calcAngles(acceptor, halogen);
      if (acceptorAngles.length === 0) return;
      if (acceptorAngles.some((acceptorAngle) => {
        return OptimalAcceptorAngle - acceptorAngle > maxHalogenBondAngle;
      })) return;
      featureSet.setBits(i, j);
      contactStore.addContact(i, j, 5 /* HalogenBond */);
    });
  }
}

// src/chemistry/interactions/refine-contacts.ts
function invalidAtomContact2(ap1, ap2, masterIdx) {
  return !isMasterContact(ap1, ap2, masterIdx) && (ap1.modelIndex !== ap2.modelIndex || ap1.altloc && ap2.altloc && ap1.altloc !== ap2.altloc);
}
function refineLineOfSight(structure, contacts, params = {}) {
  if (Debug) Log.time("refineLineOfSight");
  const lineOfSightDistFactor = defaults(params.lineOfSightDistFactor, ContactDefaultParams.lineOfSightDistFactor);
  const masterIdx = defaults(params.masterModelIndex, ContactDefaultParams.masterModelIndex);
  const spatialHash = structure.spatialHash;
  const { contactSet, contactStore, features } = contacts;
  const { index1, index2 } = contactStore;
  const { centers, atomSets } = features;
  const { x, y, z } = centers;
  const ac1 = structure.getAtomProxy();
  const ac2 = structure.getAtomProxy();
  const aw = structure.getAtomProxy();
  const c1 = new Vector3();
  const c2 = new Vector3();
  const lineOfSightDist = 3 * lineOfSightDistFactor;
  const lineOfSightDistFactorSq = lineOfSightDistFactor * lineOfSightDistFactor;
  contactSet.forEach((i) => {
    c1.set(x[index1[i]], y[index1[i]], z[index1[i]]);
    c2.set(x[index2[i]], y[index2[i]], z[index2[i]]);
    const cx = (c1.x + c2.x) / 2;
    const cy = (c1.y + c2.y) / 2;
    const cz = (c1.z + c2.z) / 2;
    const as1 = atomSets[index1[i]];
    const as2 = atomSets[index2[i]];
    ac1.index = as1[0];
    ac2.index = as2[0];
    spatialHash.eachWithin(cx, cy, cz, lineOfSightDist, (j, dSq) => {
      aw.index = j;
      if (aw.number !== 1 /* H */ && aw.vdw * aw.vdw * lineOfSightDistFactorSq > dSq && !invalidAtomContact2(ac1, aw, masterIdx) && !invalidAtomContact2(ac2, aw, masterIdx) && !as1.includes(j) && !as2.includes(j) && // to ignore atoms in the center of functional groups
      c1.distanceToSquared(aw) > 1 && c2.distanceToSquared(aw) > 1) {
        contactSet.clear(i);
        if (Debug) Log.log("removing", ac1.qualifiedName(), ac2.qualifiedName(), "because", aw.qualifiedName());
      }
    });
  });
  if (Debug) Log.timeEnd("refineLineOfSight");
}
function refineHydrophobicContacts(structure, contacts) {
  const { contactSet, contactStore, features } = contacts;
  const { type, index1, index2 } = contactStore;
  const { atomSets } = features;
  const ap1 = structure.getAtomProxy();
  const ap2 = structure.getAtomProxy();
  const residueContactDict = {};
  const handleResidueContact = function(dist, i, key) {
    const [minDist, minIndex] = residueContactDict[key] || [Infinity, -1];
    if (dist < minDist) {
      if (minIndex !== -1) contactSet.clear(minIndex);
      residueContactDict[key] = [dist, i];
    } else {
      contactSet.clear(i);
    }
  };
  contactSet.forEach((i) => {
    if (type[i] !== 6 /* Hydrophobic */) return;
    ap1.index = atomSets[index1[i]][0];
    ap2.index = atomSets[index2[i]][0];
    const dist = ap1.distanceTo(ap2);
    handleResidueContact(dist, i, `${ap1.index}|${ap2.residueIndex}`);
    handleResidueContact(dist, i, `${ap2.index}|${ap1.residueIndex}`);
  });
}
function isHydrogenBondType(type) {
  return type === 4 /* HydrogenBond */ || type === 9 /* WaterHydrogenBond */ || type === 10 /* BackboneHydrogenBond */;
}
function refineSaltBridges(structure, contacts) {
  const { contactSet, contactStore, features } = contacts;
  const { type, index1, index2 } = contactStore;
  const { atomSets } = features;
  const ionicInteractionDict = {};
  const add = function(idx, i) {
    if (!ionicInteractionDict[idx]) ionicInteractionDict[idx] = [];
    ionicInteractionDict[idx].push(i);
  };
  contactSet.forEach((i) => {
    if (type[i] !== 1 /* IonicInteraction */) return;
    atomSets[index1[i]].forEach((idx) => add(idx, i));
    atomSets[index2[i]].forEach((idx) => add(idx, i));
  });
  contactSet.forEach((i) => {
    if (!isHydrogenBondType(type[i])) return;
    const iil1 = ionicInteractionDict[atomSets[index1[i]][0]];
    const iil2 = ionicInteractionDict[atomSets[index2[i]][0]];
    if (!iil1 || !iil2) return;
    const n = iil1.length;
    for (let j = 0; j < n; ++j) {
      if (iil2.includes(iil1[j])) {
        contactSet.clear(i);
        return;
      }
    }
  });
}
function refinePiStacking(structure, contacts) {
  const { contactSet, contactStore, features } = contacts;
  const { type, index1, index2 } = contactStore;
  const { atomSets } = features;
  const piStackingDict = {};
  const add = function(idx, i) {
    if (!piStackingDict[idx]) piStackingDict[idx] = [];
    piStackingDict[idx].push(i);
  };
  contactSet.forEach((i) => {
    if (type[i] !== 3 /* PiStacking */) return;
    atomSets[index1[i]].forEach((idx) => add(idx, i));
    atomSets[index2[i]].forEach((idx) => add(idx, i));
  });
  contactSet.forEach((i) => {
    if (type[i] !== 6 /* Hydrophobic */ && type[i] !== 2 /* CationPi */) return;
    const pil1 = piStackingDict[atomSets[index1[i]][0]];
    const pil2 = piStackingDict[atomSets[index2[i]][0]];
    if (!pil1 || !pil2) return;
    const n = pil1.length;
    for (let j = 0; j < n; ++j) {
      if (pil2.includes(pil1[j])) {
        contactSet.clear(i);
        return;
      }
    }
  });
}
function refineMetalCoordination(structure, contacts) {
  const { contactSet, contactStore, features } = contacts;
  const { type, index1, index2 } = contactStore;
  const { atomSets } = features;
  const ionicInteractionDict = {};
  const add = function(idx, i) {
    if (!ionicInteractionDict[idx]) ionicInteractionDict[idx] = [];
    ionicInteractionDict[idx].push(i);
  };
  contactSet.forEach((i) => {
    if (type[i] !== 1 /* IonicInteraction */) return;
    atomSets[index1[i]].forEach((idx) => add(idx, i));
    atomSets[index2[i]].forEach((idx) => add(idx, i));
  });
  contactSet.forEach((i) => {
    if (type[i] !== 7 /* MetalCoordination */) return;
    const iil1 = ionicInteractionDict[atomSets[index1[i]][0]];
    const iil2 = ionicInteractionDict[atomSets[index2[i]][0]];
    if (!iil1 || !iil2) return;
    const n = iil1.length;
    for (let j = 0; j < n; ++j) {
      if (iil2.includes(iil1[j])) {
        contactSet.clear(iil1[j]);
        return;
      }
    }
  });
}

// src/chemistry/interactions/contact.ts
var ContactDefaultParams = {
  maxHydrophobicDist: 4,
  maxHbondDist: 3.5,
  maxHbondSulfurDist: 4.1,
  maxHbondAccAngle: 45,
  maxHbondDonAngle: 45,
  maxHbondAccPlaneAngle: 90,
  maxHbondDonPlaneAngle: 30,
  maxPiStackingDist: 5.5,
  maxPiStackingOffset: 2,
  maxPiStackingAngle: 30,
  maxCationPiDist: 6,
  maxCationPiOffset: 2,
  maxIonicDist: 5,
  maxHalogenBondDist: 4,
  maxHalogenBondAngle: 30,
  maxMetalDist: 3,
  refineSaltBridges: true,
  masterModelIndex: -1,
  lineOfSightDistFactor: 1
};
function isMasterContact(ap1, ap2, masterIdx) {
  return ap1.modelIndex === masterIdx && ap2.modelIndex !== masterIdx || ap2.modelIndex === masterIdx && ap1.modelIndex !== masterIdx;
}
function invalidAtomContact(ap1, ap2, masterIdx) {
  return !isMasterContact(ap1, ap2, masterIdx) && (ap1.modelIndex !== ap2.modelIndex || ap1.residueIndex === ap2.residueIndex || ap1.altloc && ap2.altloc && ap1.altloc !== ap2.altloc);
}
function createContacts(features) {
  const { types, centers } = features;
  const spatialHash = new SpatialHash(centers);
  const contactStore = new ContactStore();
  const featureSet = new BitArray(types.length, false);
  return { features, spatialHash, contactStore, featureSet };
}
function createFrozenContacts(contacts) {
  const { index1, index2, count } = contacts.contactStore;
  const adjacencyList = createAdjacencyList({
    nodeArray1: index1,
    nodeArray2: index2,
    edgeCount: count,
    nodeCount: contacts.featureSet.length
  });
  const contactSet = new BitArray(contacts.contactStore.count, true);
  return Object.assign({ adjacencyList, contactSet }, contacts);
}
function calculateFeatures(structure) {
  const features = createFeatures();
  if (Debug) Log.time("calculateFeatures");
  addPositiveCharges(structure, features);
  addNegativeCharges(structure, features);
  addAromaticRings(structure, features);
  addHydrogenAcceptors(structure, features);
  addHydrogenDonors(structure, features);
  addWeakHydrogenDonors(structure, features);
  addMetalBinding(structure, features);
  addMetals(structure, features);
  addHydrophobic(structure, features);
  addHalogenAcceptors(structure, features);
  addHalogenDonors(structure, features);
  if (Debug) Log.timeEnd("calculateFeatures");
  return features;
}
function calculateContacts(structure, params = ContactDefaultParams) {
  const features = calculateFeatures(structure);
  const contacts = createContacts(features);
  if (Debug) Log.time("calculateContacts");
  addChargedContacts(structure, contacts, params);
  addHydrogenBonds(structure, contacts, params);
  addMetalComplexation(structure, contacts, params);
  addHydrophobicContacts(structure, contacts, params);
  addHalogenBonds(structure, contacts, params);
  const frozenContacts = createFrozenContacts(contacts);
  refineLineOfSight(structure, frozenContacts, params);
  refineHydrophobicContacts(structure, frozenContacts);
  if (params.refineSaltBridges) refineSaltBridges(structure, frozenContacts);
  refinePiStacking(structure, frozenContacts);
  refineMetalCoordination(structure, frozenContacts);
  if (Debug) Log.timeEnd("calculateContacts");
  return frozenContacts;
}
var ContactDataDefaultParams = {
  hydrogenBond: true,
  hydrophobic: true,
  halogenBond: true,
  ionicInteraction: true,
  metalCoordination: true,
  cationPi: true,
  piStacking: true,
  weakHydrogenBond: true,
  waterHydrogenBond: true,
  backboneHydrogenBond: true,
  radius: 1,
  filterSele: ""
};
var tmpColor = new Color();
function contactColor(type) {
  switch (type) {
    case 4 /* HydrogenBond */:
    case 9 /* WaterHydrogenBond */:
    case 10 /* BackboneHydrogenBond */:
      return tmpColor.setHex(2851770).toArray();
    case 6 /* Hydrophobic */:
      return tmpColor.setHex(8421504).toArray();
    case 5 /* HalogenBond */:
      return tmpColor.setHex(4259775).toArray();
    case 1 /* IonicInteraction */:
      return tmpColor.setHex(15779860).toArray();
    case 7 /* MetalCoordination */:
      return tmpColor.setHex(9191577).toArray();
    case 2 /* CationPi */:
      return tmpColor.setHex(16744448).toArray();
    case 3 /* PiStacking */:
      return tmpColor.setHex(9220966).toArray();
    case 8 /* WeakHydrogenBond */:
      return tmpColor.setHex(12967404).toArray();
    default:
      return tmpColor.setHex(13421772).toArray();
  }
}
function getContactData(contacts, structure, params) {
  const p = createParams(params, ContactDataDefaultParams);
  const types = [];
  if (p.hydrogenBond) types.push(4 /* HydrogenBond */);
  if (p.hydrophobic) types.push(6 /* Hydrophobic */);
  if (p.halogenBond) types.push(5 /* HalogenBond */);
  if (p.ionicInteraction) types.push(1 /* IonicInteraction */);
  if (p.metalCoordination) types.push(7 /* MetalCoordination */);
  if (p.cationPi) types.push(2 /* CationPi */);
  if (p.piStacking) types.push(3 /* PiStacking */);
  if (p.weakHydrogenBond) types.push(8 /* WeakHydrogenBond */);
  if (p.waterHydrogenBond) types.push(9 /* WaterHydrogenBond */);
  if (p.backboneHydrogenBond) types.push(10 /* BackboneHydrogenBond */);
  const { features, contactSet, contactStore } = contacts;
  const { centers, atomSets } = features;
  const { x, y, z } = centers;
  const { index1, index2, type } = contactStore;
  const position1 = [];
  const position2 = [];
  const color = [];
  const radius = [];
  const picking = [];
  let filterSet;
  if (p.filterSele) {
    if (Array.isArray(p.filterSele)) {
      filterSet = p.filterSele.map((sele) => {
        return structure.getAtomSet(new selection_default(sele));
      });
    } else {
      filterSet = structure.getAtomSet(new selection_default(p.filterSele));
    }
  }
  contactSet.forEach((i) => {
    const ti = type[i];
    if (!types.includes(ti)) return;
    if (filterSet) {
      const idx1 = atomSets[index1[i]][0];
      const idx2 = atomSets[index2[i]][0];
      if (Array.isArray(filterSet)) {
        if (!(filterSet[0].isSet(idx1) && filterSet[1].isSet(idx2) || filterSet[1].isSet(idx1) && filterSet[0].isSet(idx2))) return;
      } else {
        if (!filterSet.isSet(idx1) && !filterSet.isSet(idx2)) return;
      }
    }
    const k = index1[i];
    const l = index2[i];
    position1.push(x[k], y[k], z[k]);
    position2.push(x[l], y[l], z[l]);
    color.push(...contactColor(ti));
    radius.push(p.radius);
    picking.push(i);
  });
  return {
    position1: new Float32Array(position1),
    position2: new Float32Array(position2),
    color: new Float32Array(color),
    color2: new Float32Array(color),
    radius: new Float32Array(radius),
    picking: new ContactPicker(picking, contacts, structure)
  };
}

// scripts/contact-detector/entry.js
var TextStream = class extends streamer_default {
  _read() {
    return Promise.resolve(this.src);
  }
};
var contactDefaults = Object.freeze({
  ...ContactDefaultParams,
  hydrogenBond: true,
  weakHydrogenBond: true,
  waterHydrogenBond: false,
  backboneHydrogenBond: false,
  hydrophobic: false,
  halogenBond: true,
  ionicInteraction: true,
  metalCoordination: true,
  cationPi: true,
  piStacking: true,
  maxHalogenBondDist: 3.5,
  maxHbondDonPlaneAngle: 35,
  masterModelIndex: 0,
  radiusSize: 0.05,
  radiusScale: 1,
  filterSele: ""
});
var selection = (value) => {
  const result = new selection_default(value);
  if (result.selection.error) throw new Error(`Invalid contact selection: ${result.selection.error}`);
  return result;
};
async function detectContacts({ pdb, sdf, parameters = {}, environment = false }) {
  const structures = [];
  const views = [];
  const parse = async (Parser2, text) => {
    const parser = new Parser2(new TextStream(text));
    structures.push(parser.structure);
    return parser.parse();
  };
  const view = (structure, sele) => {
    const result = structure.getView(selection(sele));
    views.push(result);
    return result;
  };
  try {
    const LigandParser = (sdf == null ? void 0 : sdf.includes("V3000")) ? SdfV3000Parser : sdf_parser_default;
    let structure = await parse(pdb ? pdb_parser_default : LigandParser, pdb || sdf);
    if (sdf && pdb) {
      const ligand = await parse(LigandParser, sdf);
      if (!ligand.atomCount) throw new Error("Contact ligand contains no readable atoms");
      structure = concatStructures("contacts", view(structure, "not ligand"), ligand);
      structures.push(structure);
    }
    if (!structure.atomCount) throw new Error("Contact structure contains no readable atoms");
    const params = { ...contactDefaults };
    for (const key of Object.keys(params)) {
      if (parameters[key] !== void 0) params[key] = parameters[key];
    }
    let sele = parameters.sele || "";
    if (sele === "/*/*/*/*") sele = "";
    if (sele === "/*/*/(LIG)/*") sele = "LIG";
    if (environment && sele === "LIG") {
      const nearby = structure.getAtomSetWithinSelection(selection("LIG"), 5);
      sele = structure.getAtomSetWithinGroup(nearby).toSeleString() + " or LIG";
    }
    const selected = view(structure, sele);
    const contacts = calculateContacts(selected, params);
    if (params.filterSele) {
      (Array.isArray(params.filterSele) ? params.filterSele : [params.filterSele]).forEach(selection);
    }
    const data = getContactData(contacts, selected, { ...params, radius: params.radiusSize * params.radiusScale });
    const types = Uint8Array.from(data.picking.array, (index) => contacts.contactStore.type[index]);
    return { position1: data.position1, position2: data.position2, color: data.color, radius: data.radius, types };
  } finally {
    views.reverse().forEach((item) => item.dispose());
    structures.reverse().forEach((item) => item.dispose());
  }
}
export {
  contactDefaults,
  detectContacts
};
