var cached = {};

chrome.runtime.onConnect.addListener(function (port) {
    if (port.name == "douban-movie") {
        port.onMessage.addListener(function (msg) {
            if (cached[msg.url]) {
                port.postMessage(cached[msg.url]);
                return;
            }
            var xhr = new XMLHttpRequest();
            xhr.onload = function () {
                if (xhr.status == 200) {
                    var resp = JSON.parse(xhr.responseText);
                    var resoures = resp['list'];
                    if (resoures && resoures[0]) {
                        msg.neetLinks = [];
                        for (var i = 0; i < resoures.length; i++) {
                            var themes = resoures[i]['themes'];
                            if (themes && themes[0]) {
                                var domainName = themes[0]['domainName'];
                                var auxiliaryInfo = themes[0]['auxiliaryInfo'];
                                var videoUrl =  themes[0]['videoUrl'];
                                msg.neetLinks.push([domainName, auxiliaryInfo, videoUrl]);
                            }
                        }
                        msg.success = true;
                        port.postMessage(msg);
                        cached[msg.url] = msg;
                    } else {
                        msg.success = false;
                        port.postMessage(msg);
                        cached[msg.url] = msg;
                    }
                }
            };
            xhr.open('GET', msg.url, true);
            xhr.setRequestHeader('Content-type', 'text/html');
            xhr.send();
        });
    }
});