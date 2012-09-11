function getFlattrLangCodeForWikipediaUrl(url) {
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
}

function createWikipediaAutoSubmitUrl(url, title) {
    return autosubmitURL({
      url: url,
      user: "WikimediaFoundation",
      title: title,
      language: getFlattrLangCodeForWikipediaUrl(url),
      tags: new Array("wikipedia", "article"),
      hidden: false,
      category: "text"
    });
}

function isWikipedia(url) {
    return url.match("(http|https)://(.*\.)?(wikipedia.org)");
}

var autosubmitURL = function(data) {
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
    params.push("category="+encodeURIComponent(category));
  }

  return baseURL + "?" + params.join("&");
}

function findFlattrThingForUrl(url, callback) {
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
}

var Flattr = {
  serviceEnabled: function(service) {
    if(localStorage.getItem("flattr.option.service-"+service) === "service-"+service) {
      return true;
    } else {
      return false;
    }
  }
}
