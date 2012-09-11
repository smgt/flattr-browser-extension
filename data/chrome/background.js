var lookupUrl = undefined;
var relPaymentLink = undefined;
var canonicalUrl = undefined;
var flattrable = undefined;

// Enable all the options in localstorage
if(!localStorage.getItem("flattr.options")) {
  localStorage.setItem("flattr.options", true);
  $.get("options.html", function(data){
    $("input[type=checkbox]", data).each(function(item) {
      localStorage.setItem("flattr.option."+this.getAttribute("id"), this.getAttribute("id"));
    });
  });
}

// Listen for any changes to the URL of any tab. If URL
// exists, we show our extension icon in the address field.
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if(changeInfo.status === "complete" && tab && tab.url && tab.url.match(/^https?:\/\//)) {
    lookupUrl = undefined;

    if (Wikipedia.validURL(tab.url)) {
      flattrable = true;
      lookupUrl = Wikipedia.autosubmitURL(tab.url, tab.title);
      pageActionShow(tabId);
    } else {
      showFlattrButtonIfThingExistsForUrl(tab.url, tabId, function(url) {
        lookupUrl = url;
      });
    }
  }
});

function pageActionShow(tabId) {
  chrome.pageAction.setIcon({path:"../images/icon_19.png", tabId:tabId})
  chrome.tabs.get(tabId, function(tab) {
    chrome.pageAction.setTitle({tabId:tab.id, title:'Flattr "'+tab.title+'"'});
  });
  chrome.pageAction.show(tabId);
}

function showFlattrButtonIfThingExistsForUrl(urlToTest, tabId, callback) {

    if(!urlToTest.match(/^https?:\/\//)) return;
    if(urlToTest.match(/^https?:\/\/(?:\w+\.)?flattr.com\/?/)) return;

    Flattr.lookupURL(urlToTest, function(response) {
        var url;

        if (response.message === 'flattrable') {
            url = Flattr.autosubmitURL({url:urlToTest});
        } else if (response && response.link) {
            url = response.link;
        }

        if (url) {
            flattrable = true;
            pageActionShow(tabId);
            callback(url);
        }
    });
}

// When the icon in address field is clicked, we open the flattr.com
// thing page in a new tab/window.
chrome.pageAction.onClicked.addListener(function (tab) {
    if(flattrable) {
      chrome.tabs.create({
        url: (lookupUrl || relPaymentLink || canonicalUrl)
      });
    } else {
      return;
    }
});

chrome.extension.onConnect.addListener(function(port) {

    if(port.name !== "flattr") return;

    // Send settings to content scripts
    port.postMessage({flattr_options: localStorage});

    // Wait for a URL from a contentscript
    port.onMessage.addListener(function(msg, port) {
      if( msg.url ) {
        chrome.tabs.create({
          url:Flattr.autosubmitURL({url:msg.url})
        });
      } else if (msg.relPaymentLink) {
        if(port.sender.tab) {
          relPaymentLink = msg.relPaymentLink;
          flattrable = true;
          pageActionShow(port.sender.tab.id);
        }
      } else if (msg.canonicalUrl) {
        if(port.sender.tab) {
          showFlattrButtonIfThingExistsForUrl(msg.canonicalUrl, port.sender.tab.id, function(url) {
              canonicalUrl = url;
          });
        }
      }
    });

});
