;(function() {

  var port = chrome.extension.connect({name: "flattr"});

  var buttons = {};

  var githubURL = function (url) {
    try {
      if(!url.match(/^https?:\/\/github\.com/)) {
        if(url.charAt(0) != "/") {
          url = "/"+url;
        }
        url = "https://github.com" + url;
      }
      return url;
    } catch(e) {
      return undefined;
    }
  };

  var githubIconsURL = chrome.extension.getURL("/data/images/flattr-github.png");
  $('head').append("<style type='text/css'>"+
     ".flattr-action .flattr-icon { background:url("+githubIconsURL+") no-repeat left center; display:inline-block; vertical-align: middle; width: 15px; height: 15px; margin-right:6px; opacity:1;}"+
     ".flattr-action:hover .flattr-icon {background:url("+githubIconsURL+") no-repeat -18px center;}"+
     "</style>");


  buttons = [
    {
      name: "repository",
      text: "Flattr",
      container: ".repohead .pagehead-actions",
      append: true,
      className: 'flattr-action',
      selector: '.flattr-action',
      create: function(btnConfig) {
        var li = document.createElement("li");

        var a = document.createElement('a');
        a.setAttribute("class", btnConfig.className + " minibutton");
        a.setAttribute("href", "#");
        var i = document.createElement('i');
        i.setAttribute("class", "flattr-icon");
        a.innerHTML = i.outerHTML + btnConfig.text;

        $(li).append(a);

        var repo = $('.js-current-repository');
        if(repo[0]) {
          var count = document.createElement('a');
          count.className = "social-count";

          $.ajax({
              url: 'https://api.flattr.com/rest/v2/things/lookup',
              dataType: 'json',
              data: {
                url: "https://github.com"+repo[0].getAttribute('href')
              },
              success: function(data, status, xhr) {
                if(data.flattrs) {
                  count.innerHTML = data.flattrs;
                  count.setAttribute("href", data.link);
                  count.setAttribute("target", "_blank");
                } else {
                  count.innerHTML = 0;
                  count.setAttribute("href", Flattr.autosubmitURL({url:window.location.href}));
                }
                $(li).append(count);
              }
          });
        }
        return li;
      },
      data: function (elem) {
        var repo = $(elem).closest(".title-actions-bar").find(".js-current-repository");
        return githubURL(repo.attr("href"));
      }
    },
    {
      name: "user",
      text: "Flattr",
      container: ".profilecols .tabnav .tabnav-right",
      after: ".user-following-container",
      className: 'flattr-action',
      selector: '.flattr-action',
      create: function(btnConfig) {
        var span = document.createElement("span");

        var a = document.createElement('a');
        a.setAttribute("class", btnConfig.className + " tabnav-widget minibutton");
        a.setAttribute("href", "#");
        a.style.marginLeft = "4px";
        var i = document.createElement('i');
        i.setAttribute("class", "flattr-icon");
        a.innerHTML = i.outerHTML + btnConfig.text;

        $(span).append(a);
        return span;
      },
      data: function (elem) {
        return githubURL(window.location.href);
      }
    }
  ];

  port.onMessage.addListener(function(msg) {
    if(msg.flattr_options) {
      if(msg.flattr_options['flattr.option.service-github'] === "service-github") {
        Flattr.insertServiceButtons(buttons);
      }
    }
  });

})();
