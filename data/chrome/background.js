var lookupUrl = undefined;
var relPaymentLink = undefined;
var canonicalUrl = undefined;
var flattrable = undefined;

// Listen for any changes to the URL of any tab. If URL
// exists, we show our extension icon in the address field.
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    lookupUrl = undefined;

    if (isWikipedia(tab.url)) {
        lookupUrl = createWikipediaAutoSubmitUrl(tab.url, tab.title);
    } else {
        showFlattrButtonIfThingExistsForUrl(tab.url, tabId, function(url) {
            lookupUrl = url;
        });
    }
});

function showFlattrButtonIfThingExistsForUrl(urlToTest, tabId, callback) {
    findFlattrThingForUrl(urlToTest, function(thing) {
        var url;

        if (thing.message === 'flattrable') {
            url = autosubmitURL({url:urlToTest});
        } else if (thing) {
            url = thing.link;
        }

        if (url) {
            flattrable = true;
            chrome.pageAction.setIcon({path:"data/images/icon_19.png", tabId:tabId})
            chrome.tabs.get(tabId, function(tab) {
              chrome.pageAction.setTitle({tabId:tab.id, title:'Flattr "'+tab.title+'"'});
            });
            chrome.pageAction.show(tabId);
            callback(url);
        }
    });
}

// See if contentscript.js finds a rel payment link or canonical url. 
// Use these if the regular flattr API lookup does not find a matching thing.
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if (request.relPaymentLink) {
        relPaymentLink = request.relPaymentLink;
        chrome.pageAction.show(sender.tab.id);
    } else if (request.canonicalUrl) {
        showFlattrButtonIfThingExistsForUrl(request.canonicalUrl, sender.tab.id, function(url) {
            canonicalUrl = url;
        });
    }
});

// When the icon in address field is clicked, we open the flattr.com
// thing page in a new tab/window.
chrome.pageAction.onClicked.addListener(function (tab) {
    if(flattrable) {
      chrome.tabs.create({
        url: (lookupUrl || relPaymentLink || canonicalUrl)
      });
    } else {
      return false;
    }
});

chrome.extension.onConnect.addListener(function(port) {
    console.assert(port.name == "flattr");
    port.onMessage.addListener(function(msg) {
      if( msg.url ) {

        chrome.tabs.create({
          url:autosubmitURL({url:msg.url})
        });

      } else {
        console.log("Error, url in message is missing");
      }
    });
});
