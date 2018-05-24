/*!
 * Image Paste V0.1
 * https://lugavin.github.io/
 */
KindEditor.plugin('imagepaste', function (K) {
    var self = this;
    if (self.isCreated) {
        init();
    } else {
        self.afterCreate(init);
    }
    function init() {
        var doc = self.edit.doc;
        var cmd = self.edit.cmd;
        K(doc.body).bind('paste', function (KEvent) {
            var dataItem = KEvent.event.clipboardData.items[0];
            if (dataItem) {
                var imgFile = dataItem.getAsFile();
                if (imgFile) {
                    var reader = new FileReader();
                    reader.readAsDataURL(imgFile);
                    reader.onload = function (evt) {
                        var formData = new FormData();
                        formData.append(self.filePostName, imgFile);
                        var xhr = window.XMLHttpRequest ? new window.XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
                        xhr.onreadystatechange = function () {
                            if (xhr.readyState === 4 && xhr.status === 200) {
                                var resp = JSON.parse(xhr.responseText);
                                if (resp.ok) {
                                    cmd.insertimage(resp.url, resp.data.originalName);
                                }
                            }
                        };
                        xhr.open('POST', self.uploadJson, true);
                        xhr.send(formData);
                    };
                }
            }
        });
    }
});
