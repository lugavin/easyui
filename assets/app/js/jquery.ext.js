(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // CommonJS
        factory(require('jquery'));
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {

    $.ajaxSetup({
        statusCode: {
            200: function (data, textStatus, XMLHttpRequest) {
                var retKey = XMLHttpRequest.getResponseHeader('x-app-alert');
                if (retKey) {
                    var params = XMLHttpRequest.getResponseHeader('x-app-params');
                    console.info(params);
                }
            },
            400: function (XMLHttpRequest, textStatus, errorThrown) {
                var retMsg = 'Operation failed! Please try again later.';
                var retKey = XMLHttpRequest.getResponseHeader('x-app-error');
                if (retKey) {
                    // var params = XMLHttpRequest.getResponseHeader('x-app-params');
                    retMsg = XMLHttpRequest.responseJSON['title'];
                }
                new Noty({
                    text: retMsg,
                    type: 'error',
                    theme: 'nest',
                    killer: true
                }).show();
            },
            401: function (XMLHttpRequest, textStatus, errorThrown) {
                location.href = '../sso/login.html?redirectURL=' + encodeURIComponent(location.href);
            },
            403: function (XMLHttpRequest, textStatus, errorThrown) {
                location.href = '/403.html';
            },
            404: function (XMLHttpRequest, textStatus, errorThrown) {
                location.href = '/404.html';
            },
            500: function (XMLHttpRequest, textStatus, errorThrown) {
                location.href = '/500.html';
            }
        }
    });

    $.fn.extend({
        serializeObject: serializeObject
    });

    function serializeObject() {
        var data = {};
        this.serializeArray().forEach(function (field) {
            var value = data[field.name];
            // If node with same name exists already, need to convert it to an array as it
            // is a multi-value field (i.e., checkboxes)
            if (typeof value !== 'undefined' && value !== null) {
                if (Array.isArray(value)) {
                    value.push(field.value);
                } else {
                    data[field.name] = [value, field.value];
                }
            } else {
                data[field.name] = field.value;
            }
        });
        return data;
    }

}));
