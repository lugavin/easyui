/*!
 * Base.js v1.0
 * https://lugavin.github.io/
 * Copyright 2015-2017 Gavin Inc.
 */
(function (root, factory) {

    if (typeof(root.Namespace) === 'undefined') {
        throw new Error('Base\'s JavaScript requires Namespace v1.0 or later')
    }

    factory(root.Namespace);

})(window, function (Namespace) {

    /**
     * @namespace Base
     */
    Namespace.register('Base');

    var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

    Base.format = format;

    Base.randomKey = randomKey;

    Base.isBoolean = isBoolean;
    Base.isString = isString;
    Base.isArray = Array.isArray;
    Base.isFunction = isFunction;
    Base.isObject = isObject;
    Base.isEmptyObject = isEmptyObject;

    Base.hasMobileUA = hasMobileUA;
    Base.isTablet = isTablet;
    Base.isMobile = isMobile;
    Base.isDesktop = isDesktop;

    Base.isEmail = isEmail;
    Base.isPhone = isPhone;

    Base.trim = trim;
    Base.getURLParam = getURLParam;
    Base.buildURLParams = buildURLParams;

    Base.getContextPath = getContextPath;

    Base.post = post;

    Base.base64Encode = base64Encode;
    Base.base64Decode = base64Decode;

    Base.parse = parse;
    Base.stringify = stringify;

    function format() {
        if (arguments.length == 0) {
            return '';
        }
        var str = arguments[0];
        for (var i = 1; i < arguments.length; i++) {
            str = str.replace(new RegExp('\\{' + (i - 1) + '\\}', 'gm'), arguments[i]);
        }
        return str;
    }

    function randomKey() {
        return String(new Date().getTime()) + String(Math.floor(Math.random() * 1000000));
    }

    function isBoolean(value) {
        return typeof value === 'boolean';
    }

    function isString(value) {
        return typeof value === 'string';
    }

    function isFunction(value) {
        return typeof value === 'function';
    }

    function isObject(value) {
        return value !== null && typeof value === 'object';
    }

    function isEmptyObject(obj) {
        return Object.keys(obj || {}).length < 1;
    }

    function hasMobileUA() {
        var nav = window.navigator;
        var ua = nav.userAgent;
        var pa = /iPad|iPhone|Android|Opera Mini|BlackBerry|webOS|UCWEB|Blazer|PSP|IEMobile|Symbian/g;
        return pa.test(ua);
    }

    function isTablet() {
        return window.screen.width < 992 && window.screen.width > 767 && Base.hasMobileUA();
    }

    function isMobile() {
        return window.screen.width < 767 && Base.hasMobileUA();
    }

    function isDesktop() {
        return !Base.isTablet() && !Base.isMobile();
    }

    function isEmail(value) {
        return (/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/).test(trim(value));
    }

    function isPhone(value) {
        return /^((00|\+)?(86(?:-| )))?((\d{11})|(\d{3}[- ]\d{4}[- ]\d{4})|((\d{2,4}[- ])(\d{7,8}|(\d{3,4}[- ]\d{4}))([- ]\d{1,4})?))$/.test(trim(value));
    }

    function trim(text) {
        return (text || '').trim();
    }

    function getURLParam(name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ''])[1].replace(/\+/g, '%20')) || null;
    }

    /**
     *
     * @param {Array|Object} obj
     * @returns {string}
     */
    function buildURLParams(obj) {

        var params = [];

        var add = function (key, value) {
            value = typeof value === 'function' ? value() : (value == null ? '' : value);
            params[params.length] = encodeURIComponent(key) + '=' + encodeURIComponent(value);
        };

        var buildParams = function (prefix, obj, add) {
            if (Array.isArray(obj)) {
                obj.forEach(function (v, i) {
                    if (/\[]$/.test(prefix)) {
                        add(prefix, v);
                    } else {
                        buildParams(prefix + '[' + (typeof v === 'object' ? i : '') + ']', v, add);
                    }
                });
            } else if (typeof obj === 'object') {
                Object.keys(obj).forEach(function (key) {
                    buildParams(prefix + '[' + key + ']', obj[key], add);
                });
            } else {
                add(prefix, obj);
            }
        };

        // If an array was passed in, assume that it is an array of form elements.
        if (Array.isArray(obj)) {
            // Serialize the form elements
            obj.forEach(function (e) {
                add(e.name, e.value);
            });
        } else {
            Object.keys(obj).forEach(function (key) {
                buildParams(key, obj[key], add);
            });
        }

        return params.join('&').replace(/%20/g, '+');
    }

    function getContextPath() {
        var curWwwPath = window.document.location.href;
        var pathName = window.document.location.pathname;
        var localPath = curWwwPath.substring(0, curWwwPath.indexOf(pathName));
        var projectName = pathName.substring(0, pathName.substr(1).indexOf('/') + 1);
        return localPath + projectName;
    }

    /**
     * @param {String} url
     * @param {object=} data
     * @param {Function=} callback
     */
    function post(url, data, callback) {
        var args = Array.prototype.slice.call(arguments);
        // 移除数组中的第一个元素并返回该元素
        url = args.shift();
        // 移除数组中的最后一个元素并返回该元素
        if (typeof args[args.length - 1] === 'function') {
            callback = args.pop();
        }
        // 如果args中仍有元素, 那就是可选参数, 使用以下方法逐个取出
        data = args.length > 0 ? args.shift() : {};
        var xhr = window.XMLHttpRequest ? new window.XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                callback && callback(JSON.parse(xhr.responseText));
            }
        };
        xhr.open('POST', url, true);
        xhr.send(data);
    }

    function base64Encode(input) {
        var output = '',
            chr1, chr2, chr3,
            enc1, enc2, enc3, enc4,
            i = 0;

        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
                keyStr.charAt(enc1) +
                keyStr.charAt(enc2) +
                keyStr.charAt(enc3) +
                keyStr.charAt(enc4);
        }

        return output;
    }

    function hasOwnProperty(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    }

    function stringifyPrimitive(v) {
        switch (typeof v) {
            case 'string':
                return v;
            case 'boolean':
                return v ? 'true' : 'false';
            case 'number':
                return isFinite(v) ? v : '';
            default:
                return '';
        }
    }

    function base64Decode(input) {
        var output = '',
            chr1, chr2, chr3,
            enc1, enc2, enc3, enc4,
            i = 0;

        // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
        input = input.replace(/[^A-Za-z0-9\+\/=]/g, '');

        while (i < input.length) {
            enc1 = keyStr.indexOf(input.charAt(i++));
            enc2 = keyStr.indexOf(input.charAt(i++));
            enc3 = keyStr.indexOf(input.charAt(i++));
            enc4 = keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 !== 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 !== 64) {
                output = output + String.fromCharCode(chr3);
            }
        }

        return output;
    }

    function parse(qs, sep, eq, options) {
        sep = sep || '&';
        eq = eq || '=';
        var obj = {};

        if (typeof qs !== 'string' || qs.length === 0) {
            return obj;
        }

        var regexp = /\+/g;
        qs = qs.split(sep);

        var maxKeys = 1000;
        if (options && typeof options.maxKeys === 'number') {
            maxKeys = options.maxKeys;
        }

        var len = qs.length;
        // maxKeys <= 0 means that we should not limit keys count
        if (maxKeys > 0 && len > maxKeys) {
            len = maxKeys;
        }

        for (var i = 0; i < len; ++i) {
            var x = qs[i].replace(regexp, '%20'),
                idx = x.indexOf(eq),
                kstr, vstr, k, v;

            if (idx >= 0) {
                kstr = x.substr(0, idx);
                vstr = x.substr(idx + 1);
            } else {
                kstr = x;
                vstr = '';
            }

            k = decodeURIComponent(kstr);
            v = decodeURIComponent(vstr);

            if (!hasOwnProperty(obj, k)) {
                obj[k] = v;
            } else if (Array.isArray(obj[k])) {
                obj[k].push(v);
            } else {
                obj[k] = [obj[k], v];
            }
        }

        return obj;
    }

    function stringify(obj, sep, eq, name) {
        sep = sep || '&';
        eq = eq || '=';
        if (obj === null) {
            obj = undefined;
        }

        if (typeof obj === 'object') {
            return Object.keys(obj).map(function (k) {
                var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
                if (Array.isArray(obj[k])) {
                    return obj[k].map(function (v) {
                        return ks + encodeURIComponent(stringifyPrimitive(v));
                    }).join(sep);
                } else {
                    return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
                }
            }).filter(Boolean).join(sep);

        }

        if (!name) return '';
        return encodeURIComponent(stringifyPrimitive(name)) + eq +
            encodeURIComponent(stringifyPrimitive(obj));
    }

});
