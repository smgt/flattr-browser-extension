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
      after: '.subscription',
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
                  count.setAttribute("href", autosubmitURL({url:window.location.href}));
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
      container: ".pagehead.userpage .pagehead-actions",
      after: '',
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

  var insertButtons = function() {
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
        } else {
          $(container).prepend(btn);
        }

        var getData = btnConfig.data;

        $(btn).click(function (e) {
            e.preventDefault();
            var targetURL = getData(btn);
            if( targetURL ) {
              targetURL = githubURL(targetURL);
              console.log("Flattr URL: "+targetURL);
              port.postMessage({url: targetURL});
            } else {
              console.log("Error figuring out the Flattr URL");
            }
        });
      });
    }
  };

  insertButtons();

})();
