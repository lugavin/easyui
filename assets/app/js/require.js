(function () {

    var modules = {
        jquery: {
            js: 'jquery/jquery.js'
        },
        bootstrap: {
            js: 'bootstrap/js/bootstrap.js',
            css: 'bootstrap/css/bootstrap.css',
            dependencies: ['jquery']
        }
    };

    var locales = {
        'en_US': 'i18n/en_US.js',
        'zh_CN': 'i18n/zh_CN.js',
        'zh_TW': 'i18n/zh_TW.js'
    };

    var queues = {};

    function loadJs(url, callback) {
        var done = false;
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        var startTime = new Date().getTime();
        script.onload = script.onreadystatechange = function () {
            if (!done && (!script.readyState || script.readyState == 'loaded' || script.readyState == 'complete')) {
                done = true;
                script.onload = script.onreadystatechange = null;
                console.log('%cLoad [ %s ] completed in [ %f ] seconds', 'color: #286090;', url, (new Date().getTime() - startTime) / 1000);
                callback && callback.call(script);
            }
        };
        document.getElementsByTagName('head')[0].appendChild(script);
    }

    function loadCss(url, callback) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = url;
        var startTime = new Date().getTime();
        document.getElementsByTagName('head')[0].appendChild(link);
        console.log('%cLoad [ %s ] completed in [ %f ] seconds', 'color: #3c763d;', url, (new Date().getTime() - startTime) / 1000);
        callback && callback.call(link);
    }

    function loadSingle(name, callback) {
        queues[name] = 'loading';
        var module = modules[name];
        var jsStatus = 'loading';
        var cssStatus = (easyloader.css && module['css']) ? 'loading' : 'loaded';

        var url = null;
        if (easyloader.css && module['css']) {
            if (/^http/i.test(module['css'])) {
                url = module['css'];
            } else {
                url = easyloader.baseUrl + module['css'];
            }
            loadCss(url, function () {
                cssStatus = 'loaded';
                if (jsStatus == 'loaded' && cssStatus == 'loaded') {
                    finish();
                }
            });
        }

        if (/^http/i.test(module['js'])) {
            url = module['js'];
        } else {
            url = easyloader.baseUrl + module['js'];
        }
        loadJs(url, function () {
            jsStatus = 'loaded';
            if (jsStatus == 'loaded' && cssStatus == 'loaded') {
                finish();
            }
        });

        function finish() {
            queues[name] = 'loaded';
            easyloader.onProgress(name);
            callback && callback();
        }
    }

    function loadModule(name, callback) {
        var mm = [];
        var doLoad = false;

        if (typeof name == 'string') {
            add(name);
        } else {
            for (var i = 0; i < name.length; i++) {
                add(name[i]);
            }
        }

        function add(name) {
            if (!modules[name]) return;
            var d = modules[name]['dependencies'];
            if (d) {
                for (var i = 0; i < d.length; i++) {
                    add(d[i]);
                }
            }
            mm.push(name);
        }

        function finish() {
            callback && callback();
            easyloader.onLoad(name);
        }

        var time = 0;

        function loadMm() {
            if (mm.length) {
                // the first module
                var m = mm[0];
                if (!queues[m]) {
                    doLoad = true;
                    loadSingle(m, function () {
                        mm.shift();
                        loadMm();
                    });
                } else if (queues[m] == 'loaded') {
                    mm.shift();
                    loadMm();
                } else {
                    if (time < easyloader.timeout) {
                        time += 10;
                        setTimeout(arguments.callee, 10);
                    }
                }
            } else {
                if (easyloader.locale && doLoad == true && locales[easyloader.locale]) {
                    var url = easyloader.baseUrl + locales[easyloader.locale];
                    runJs(url, function () {
                        finish();
                    });
                } else {
                    finish();
                }
            }
        }

        loadMm();
    }

    function runJs(url, callback) {
        loadJs(url, function () {
            document.getElementsByTagName('head')[0].removeChild(this);
            callback && callback();
        });
    }

    var easyloader = {
        // Use the <base> tag to specify the document base URL.
        // I.E. <base href="http://www.example.com/vendor/">
        baseUrl: '/assets/',
        modules: modules,
        locales: locales,
        locale: null,
        timeout: 2000,
        css: true,
        // urlArgs: 'v=20171014',
        load: function (name, callback) {
            // Make sure the baseUrl ends in a slash.
            if (!easyloader.baseUrl) {
                easyloader.baseUrl = './';
            } else {
                var ss = easyloader.baseUrl.split('/');
                var subPath = ss.length ? ss.join('/') : './';
                if (subPath.charAt(subPath.length - 1) !== '/') {
                    subPath += '/';
                }
                easyloader.baseUrl = subPath;
            }
            // Load JS & CSS resources
            if (/\.css$/i.test(name)) {
                if (/^http/i.test(name)) {
                    loadCss(name, callback);
                } else {
                    loadCss(easyloader.baseUrl + name, callback);
                }
            } else if (/\.js$/i.test(name)) {
                if (/^http/i.test(name)) {
                    loadJs(name, callback);
                } else {
                    loadJs(easyloader.baseUrl + name, callback);
                }
            } else {
                loadModule(name, callback);
            }
        },
        onProgress: function (name) {
        },
        onLoad: function (name) {
        }
    };

    var scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
        var src = scripts[i].src;
        if (!src) continue;
        var m = src.match(/easyloader\.js(\W|$)/i);
        if (m) {
            easyloader.baseUrl = src.substring(0, m.index);
        }
    }

    window.require = window.using = easyloader.load;

})();
