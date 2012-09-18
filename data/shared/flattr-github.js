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
        a.innerHTML = btnConfig.text;

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
        return repo.attr("href");
      }
    },
    {
      name: "repository",
      text: "Flattr",
      container: "body:not(.org-profile) .pagehead.userpage .pagehead-actions",
      append: true,
      className: 'flattr-action',
      selector: '.flattr-action',
      create: function(btnConfig) {
        var li = document.createElement("li");

        var a = document.createElement('a');
        a.setAttribute("class", btnConfig.className + " minibutton tabnav-widget");
        a.setAttribute("href", "#");
        a.innerHTML = btnConfig.text;

        $(li).append(a);
        return li;
      },
      data: function (elem) {
        return window.location.href;
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
