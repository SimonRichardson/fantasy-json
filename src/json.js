var daggy = require('daggy'),
    helpers = require('fantasy-helpers'),
    lens = require('fantasy-lenses'),
    Either = require('fantasy-eithers'),
    Option = require('fantasy-options'),
    
    PartialLens = lens.PartialLens,

    Json = daggy.tagged('x');

// Methods
Json.of = function(x) {
    return Json(Either.Right(x));
};
Json.prototype.chain = function(f) {
    return Json(this.x.chain(function(x) {
        return f(x).x;
    }));
};

// Derived
Json.prototype.map = function(f) {
    return this.chain(function(a) {
        return Json.of(f(a));
    });
};
Json.prototype.readProp = function(k) {
    return this.chain(function(a) {
        var lens = PartialLens.objectLens(k).run(a);
        return lens.fold(
            function(b) {
                return Json(Either.Right(b.get()));
            },
            function() {
                return Json(Either.Left([new Error("No valid property for key (" + k + ")")]));
            }
        );
    });
};
Json.prototype.writeProp = function(k, v) {
    return this.chain(function(a) {
        var lens = PartialLens.objectLens(k).run(a);
        return lens.fold(
            function(b) {
                return Json(Either.Right(b.set(v)));
            },
            function() {
                return Json(Either.Left([new Error("No valid property for key (" + k + ")")]));
            }
        );
    });
};

Json.prototype.readAsType = function(type) {
    return this.chain(function(a) {
        return type(a) ?
            Json(Either.Right(a)) :
            Json(Either.Left([new Error("Value is not of correct type.")]));
    });
};
Json.prototype.readAsBoolean = function() {
    return this.readAsType(helpers.isBoolean);
};
Json.prototype.readAsString = function() {
    return this.readAsType(helpers.isString);
};
Json.prototype.readAsNumber = function() {
    return this.readAsType(helpers.isNumber);
};
Json.prototype.readAsArray = function() {
    return this.readAsType(helpers.isArray);
};
Json.prototype.readAsObject = function() {
    return this.readAsType(helpers.isObject);
};

// Static
Json.prototype.toString = function() {
    return this.x.fold(
        combinators.constant(''),
        function(x) {
            return (x instanceof String) ? x : JSON.stringify(x);
        }
    );
};
Json.fromString = function(x) {
    try {
        str = (x instanceof String) ? x : JSON.stringify(x);
        return Json(Either.Left(JSON.parse(str)));
    } catch(e) {
        return Json(Either.Right([e]));
    }
};

// Export
if(typeof module != 'undefined')
    module.exports = Json;
