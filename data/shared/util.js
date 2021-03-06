var Flattr = {
  lookupURL: function(url, callback) {
    if(typeof url === "string" && url.match(/^https?:\/\//)) {
      var xhr = new XMLHttpRequest(),
          lookupUrl = 'https://api.flattr.com/rest/v2/things/lookup?q=' + encodeURIComponent(url);

      xhr.open("GET", lookupUrl, true); // HEAD makes a 400 Bad Request...
      xhr.onreadystatechange = function() {
          if (xhr.readyState == 4 && xhr.status == 200 || xhr.status == 304) {
              var response = JSON.parse(xhr.responseText);
              if (response.message !== "not_found") {
                  callback(response);
              } else {
                  callback(false);
              }
          }
      };
      xhr.send();
    } else {
      throw "URL is not a valid Flattr url";
    }
  },
  autosubmitURL: function(data) {
    var baseURL = "https://flattr.com/submit/auto";
    var params = [];

    if(data.url) {
      params.push("url="+encodeURIComponent(data.url));
    } else {
      throw "URL parameter is missing";
    }

    if(data.user) {
      params.push("user_id="+encodeURIComponent(data.user));
    }

    if(data.title) {
      params.push("title="+encodeURIComponent(data.title));
    }

    if(data.language) {
      params.push("language="+encodeURIComponent(data.language));
    }

    if(data.tags) {
      var tags;
      if(Array.isArray(data.tags)) {
        tags = data.tags.join(",");
      } else {
        tags = data.tags;
      }

      params.push("tags="+encodeURIComponent(tags));
    }

    if(data.hidden) {
      var hidden = 0;
      if(data.hidden === true || data.hidden === 1) {
        hidden = 1;
      } else if (data.hidden === false || data.hidden === 0) {
        hidden = 0;
      }

      params.push("hidden="+encodeURIComponent(hidden));
    }

    if(data.category) {
      params.push("category="+encodeURIComponent(data.category));
    }

    return baseURL + "?" + params.join("&");
  },
  insertServiceButtons: function(buttons) {
    var i, l=buttons.length;
    for( i=0 ; i < l; i++ ) {
      var btnConfig = buttons[i];

      $(btnConfig.container).each(function () {
        var container = $(this);

        if ( $(container).hasClass('flattr-inserted') ) return;

        $(container).addClass('flattr-inserted');

        var btn = btnConfig.create(btnConfig);

        if(btnConfig.after) {
          $(container).find(btnConfig.after).after(btn);
        } else if (btnConfig.before) {
          $(container).find(btnConfig.before).before(btn);
        } else if (btnConfig.append) {
          $(container).append(btn);
        } else if (btnConfig.prepend) {
          $(container).prepend(btn);
        } else {
          throw "You need to add your button to a element to make it visible"
        }

        var getData = btnConfig.data;

        $(btn).click(function (e) {
            e.preventDefault();
            var targetURL = getData(btn);
            if( targetURL ) {
              targetURL = targetURL;
              console.log("Flattr URL: "+targetURL);
              var port = chrome.extension.connect({name: "flattr"});
              port.postMessage({url: targetURL});
            } else {
              console.log("Error figuring out the Flattr URL");
            }
        });
      });
    }
  }
}

var Wikipedia = {
  flattrLanguageFromURL: function(url) {
      var ret = 'en_GB';
      var map = {
          'en': 'en_GB',
          'es': 'es_ES',
          'de': 'de_DE',
          'fr': 'fr_FR',
          'it': 'it_IT',
          'pt': 'pt_PT',
          'pl': 'pl_PL',
          'ja': 'ja_JP',
          'ru': 'ru_RU',
          'zh': 'zh_CN',
          'sv': 'sv_SE',
          'dk': 'da_DK',
          'fi': 'fi_FI',
          'no': 'no_NO',
      };

      try {
          var langCode = url.match("(http|https)://(.*)\.(wikipedia.org)")[2];
          if (langCode in map) {
              ret = map[langCode];
          }
      } catch (e) {
      }

      return ret;
  },
  autosubmitURL: function (url, title) {
    return Flattr.autosubmitURL({
      url: url,
      user: "WikimediaFoundation",
      title: title,
      language: Wikipedia.flattrLanguageFromURL(url),
      tags: new Array("wikipedia", "article"),
      hidden: false,
      category: "text"
    });
  },
  validURL: function (url) {
    return url.match("(http|https)://(.*\.)?(wikipedia.org)");
  }
}
