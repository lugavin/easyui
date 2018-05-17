/*!
 * Namespace.js v1.0
 * https://lugavin.github.io/
 * Copyright 2015-2017 Gavin Inc.
 */
(function (root, factory) {

    if (typeof(Namespace) === 'undefined') {
        Namespace = {};
    }

    factory(root.Namespace);

})(window, function (Namespace) {

    /**
     * 声明一个全局变量用来注册命名空间
     * @param {string} namespace
     */
    Namespace.register = register;

    function register(namespace) {
        var nsArr = namespace.split('.');
        var nsStr = '', codeStr = '';
        nsArr.forEach(function (ns, idx) {
            nsStr += (idx === 0 ? ns : '.' + ns);
            codeStr += 'if (typeof(' + nsStr + ') === "undefined") { ' + nsStr + ' = {}; }';
        });
        codeStr && eval(codeStr);
    }

});
