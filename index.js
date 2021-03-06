'use strict';

var through = require('through2');
var gutil = require('gulp-util');

module.exports = function gulpContains(options) {
    if (typeof options === 'string' || Array.isArray(options)) {
        options = {
            search: options
        };
    }

    options.onFound = options.onFound || function (string, file, cb) {
            var error = 'Your file contains "' + string + '", it should not.';
            cb(new gutil.PluginError('gulp-contains', error));
        };

    options.onNotFound = options.onNotFound || function () {
            return false;
        };

    return through.obj(function (file, enc, cb) {
        if (file.isNull()) {
            cb(null, file);
            return;
        }

        if (file.isStream()) {
            cb(new gutil.PluginError('gulp-contains', 'Streaming not supported'));
            return;
        }

        if (!options.search) {
            cb(new gutil.PluginError('gulp-contains', 'You did not specify a valid search string'));
            return;
        }

        var found = stringMatches(file.contents.toString(enc), options.search);

        var skip = false;
        if (found) {
            skip = options.onFound(found, file, cb);
        } else {
            skip = options.onNotFound(file, cb);
        }
        if (skip === true) {
            return cb();
        }

        cb(null, file);
    });
};

function stringMatches(str, search) {
    if (typeof search === 'string') {
        return (str.indexOf(search) !== -1) ? search : false;
    } else if (search instanceof RegExp) {
        return str.match(search);
    }

    for (var i = 0; i < search.length; i++) {
        if (stringMatches(str, search[i])) {
            return search[i];
        }
    }

    return false;
}
