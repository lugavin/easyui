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

    Base.encodeURLParam = encodeURLParam;
    Base.decodeURLParam = decodeURLParam;
    Base.resolveURLParam = resolveURLParam;

    Base.base64Encode = base64Encode;
    Base.base64Decode = base64Decode;

    Base.post = post;
    Base.getContextPath = getContextPath;

    function format() {
        if (arguments.length === 0) {
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

    /**
     * @param {string} body
     * @returns {object}
     */
    function decodeURLParam(body) {
        var obj = {};
        trim(body).split('&').forEach(function (bytes) {
            if (bytes) {
                var split = bytes.split('=');
                var name = split.shift().replace(/\+/g, ' ');
                var value = split.join('=').replace(/\+/g, ' ');
                obj[decodeURIComponent(name)] = decodeURIComponent(value);
            }
        });
        return obj;
    }

    /**
     * @param {array|object} obj
     * @returns {string}
     */
    function encodeURLParam(obj) {
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

    /**
     *
     * @param {string} name
     * @returns {string | null}
     */
    function resolveURLParam(name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ''])[1].replace(/\+/g, '%20')) || null;
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

    /**
     * @param {string} url
     * @param {object=} data
     * @param {function=} callback
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

    function getContextPath() {
        var curWwwPath = window.document.location.href;
        var pathName = window.document.location.pathname;
        var localPath = curWwwPath.substring(0, curWwwPath.indexOf(pathName));
        var projectName = pathName.substring(0, pathName.substr(1).indexOf('/') + 1);
        return localPath + projectName;
    }

});
