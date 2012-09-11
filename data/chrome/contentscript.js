(function() {
  // Look for a rel payment link
  var port = chrome.extension.connect({name: "flattr"});
  var elem = document.querySelector('link[rel=payment]');
  var href;

  if (elem) {
      href = elem.getAttribute('href');
      if (href) {
          port.postMessage({relPaymentLink: href});
      }
  }

  // If no rel payment link was found, continue looking for a canonical URL
  if (!href) {
      elem = document.querySelector('link[rel=canonical]');

      if (elem) {
          href = elem.getAttribute('href');
          if (href) {
              if (href[0] === '/') {
                  href = location.origin + href;
              }
              port.postMessage({canonicalUrl: href});
          }
      }
  }
})();
