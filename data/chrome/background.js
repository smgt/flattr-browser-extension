var tabs = {};

// Enable all the options in localstorage
if(!localStorage.getItem("flattr.options")) {
  localStorage.setItem("flattr.options", true);
  $.get("options.html", function(data){
    $("input[type=checkbox]", data).each(function(item) {
      localStorage.setItem("flattr.option."+this.getAttribute("id"), this.getAttribute("id"));
    });
  });
}

// Check if it's the first time the extension is run
if(!localStorage.getItem("flattr.first_run")) {
  localStorage.setItem("flattr.first_run", true);
  chrome.tabs.create({
    url: "http://flattr.com/extension/chrome/install",
    active: true
  });
}

// Listen for any changes to the URL of any tab. If URL
// exists, we show our extension icon in the address field.
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if(changeInfo.status === "complete" && tab && tab.url && tab.url.match(/^https?:\/\//)) {

    var thisTab = {};
    tabs[tabId] = thisTab;

    if (Wikipedia.validURL(tab.url)) {
      thisTab.flattrable = true;
      thisTab.lookupUrl = Wikipedia.autosubmitURL(tab.url, tab.title);
      pageActionShow(tabId);
    } else {
      showFlattrButtonIfThingExistsForUrl(tab.url, tabId, function(url) {
        thisTab.lookupUrl = url;
      });
    }
  }
});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
  delete tabs[tabId];
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

  var thisTab = tabs[tabId];

  Flattr.lookupURL(urlToTest, function(response) {
      var url;

      if (response.message === 'flattrable') {
          url = Flattr.autosubmitURL({url:urlToTest});
      } else if (response && response.link) {
          url = response.link;
      }

      if (url) {
          thisTab.flattrable = true;
          pageActionShow(tabId);
          callback(url);
      }
  });
}

// When the icon in address field is clicked, we open the flattr.com
// thing page in a new tab/window.
chrome.pageAction.onClicked.addListener(function (tab) {
    var thisTab = tabs[tab.id];
    if(thisTab.flattrable) {
      chrome.tabs.create({
        url: (thisTab.lookupUrl || thisTab.relPaymentLink || thisTab.canonicalUrl)
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
      if(port.sender === undefined) return;

      var thisTab = tabs[port.sender.tab.id];

      if( msg.url ) {
        chrome.tabs.create({
          url:Flattr.autosubmitURL({url:msg.url})
        });
      } else if (msg.relPaymentLink) {
        if(port.sender.tab) {
          thisTab.relPaymentLink = msg.relPaymentLink;
          thisTab.flattrable = true;
          pageActionShow(port.sender.tab.id);
        }
      } else if (msg.canonicalUrl) {
        if(port.sender.tab) {
          showFlattrButtonIfThingExistsForUrl(msg.canonicalUrl, port.sender.tab.id, function(url) {
              thisTab.canonicalUrl = url;
          });
        }
      }
    });

});
