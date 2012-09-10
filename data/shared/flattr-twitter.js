;(function() {

  /*
  * TODO: Add flattr button on media view (ex https://twitter.com/#!/simongate/media/grid)
  * TODO: Add flattr button to profile popup (ex öhh, klick a profile name)
  */

  var port = chrome.extension.connect({name: "flattr"});

  var twitterURL = (function (url) {
    try {
      if(!url.match(/^https?:\/\/twitter\.com/)) {
        if(url.charAt(0) != "/") {
          url = "/"+url;
        }
        url = "http://twitter.com" + url;
      }
      return url;
    } catch(e) {
      return undefined;
    }
  });

  var buttons = {};
  buttons = [
    {
      name: "tweet-action",
      text: "Flattr",
      container: ".stream div.stream-item-footer .tweet-actions, .permalink .simple-tweet div.stream-item-footer .tweet-actions",
      after: '.action-fav-container',
      className: 'flattr-action',
      selector: '.flattr-action',
      create: function(btnConfig) {
        var li = document.createElement("li");
        li.className = "action-flattr-container";

        var a = document.createElement('a');
        a.setAttribute("class", btnConfig.className + " with-icn");
        a.setAttribute("href", "#");

        var i =  document.createElement("i");
        i.setAttribute("class", "sm-fav");
        var imgURL = chrome.extension.getURL("/data/images/flattr-twitter-icons.png");
        $(i).css("backgroundImage", "url("+imgURL+")");
        $(i).css("backgroundPosition", "-6px -61px");
        $(i).css("width", "13px");
        $(i).css("height", "13px");


        $(a).append(i);

        var b = document.createElement('b');
        $(b).html("<span>"+btnConfig.text+"</span>");

        $(a).append(b);

        $(li).append(a);

        return li;
      },
      data: function (elem) {
        var c = $(elem).closest('.tweet');
        var link = c.find('.js-permalink').attr("href");

        return twitterURL(link);
      }
    },
    {
      name: "user-action",
      text: "Flattr",
      container: ".tweet .follow-bar .user-actions, .profile-modal .follow-bar .user-actions, .profile-card .profile-card-actions .user-actions",
      after: '.follow-button',
      className: 'flattr-user-button',
      selector: '.flattr-user-button',
      create: function(btnConfig) {
        var button = document.createElement("button");
        button.className = btnConfig.className+" btn";
        button.setAttribute("type", "button");
        button.setAttribute("style", "margin-left: 5px;");

        var span = document.createElement('span');
        span.setAttribute("class", "button-text");
        span.innerHTML = btnConfig.text;

        button.appendChild(span);

        return button;
      },
      data: function(elem) {
        var screenname = $(elem).closest('.user-actions').data("screen-name");
        return twitterURL(screenname);
      }
    },
    {
      name: "user-action-modal",
      text: "Flattr",
      container: ".profile-modal .follow-bar .follow-combo",
      after: '.follow-btn',
      className: 'flattr-user-button',
      selector: '.flattr-user-button',
      create: function(btnConfig) {
        var button = document.createElement("button");
        button.className = btnConfig.className+" btn";
        button.setAttribute("type", "button");
        button.setAttribute("style", "margin-left: 5px;");

        var span = document.createElement('span');
        span.setAttribute("class", "button-text");
        span.innerHTML = btnConfig.text;

        button.appendChild(span);

        return button;
      },
      data: function(elem) {
        var screenname = $(elem).closest('.follow-combo').data("screen-name");
        return twitterURL(screenname);
      }
    },
    {
      name: "user-dropdown",
      text: "Flattr this user",
      container: '.stream-items .account .user-actions .user-dropdown .dropdown-menu',
      after: 'li:nth(1)',
      className: 'flattr-profile-action',
      selector: '.flattr-profile-action',
      create: function(btnConfig) {
        var li = $('<li>');
        li.attr("style", "display:block;");
        li.addClass("pretty-link");
        li.addClass("not-blocked");

        var a = $('<a>');
        a.addClass(btnConfig.className);
        a.attr("href", "#");
        a.attr("style", "display:block;");
        a.text(btnConfig.text);
        // li.text(btnConfig.text);

        $(li).append(a);
        return li;

      },
      data: function(elem) {
        var container = $(elem).closest('.account');
        var target = $(container).find('.account-group');
        var url;
        if(target.attr('href')) {
          url = twitterURL(target.attr('href'));
        } else if(target[0].innerText) {
          url = twitterURL(target[0].innerText.substr(1));
        }


        return url;
      }
    },
    {
      name: "tweet-permalink-action",
      text: "Flattr",
      container: ".permalink-tweet div.stream-item-footer .tweet-actions",
      after: ".action-fav-container",
      className: "flattr-action",
      selector: ".flattr-action",
      create: function(btnConfig) {
        var li = document.createElement("li");
        li.className = "action-flattr-container";

        var a = document.createElement('a');
        a.setAttribute("class", btnConfig.className + " with-icn");
        a.setAttribute("href", "#");

        var i =  document.createElement("i");
        i.setAttribute("class", "sm-fav");
        var imgURL = chrome.extension.getURL("/data/images/flattr-twitter-icons.png");
        $(i).css("backgroundImage", "url("+imgURL+")");
        $(i).css("backgroundPosition", "-6px -30px");
        $(i).css("width", "16px");
        $(i).css("height", "16px");

        $(a).append(i);

        var b = document.createElement('b');
        $(b).text(btnConfig.text);

        $(a).append(b);

        $(li).append(a);

        return li;
      },
      data: function(elem) {
        var c = $(elem).closest('.tweet');
        var link = c.find('.js-permalink').attr("href");

        return twitterURL(link);
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

        $(container).find(btnConfig.after).after(btn);

        if ( !! btnConfig.activator) btnConfig.activator(btn, btnConfig);

        var getData = btnConfig.data;
        var clearData = btnConfig.clear;

        var clearcb = function() {};

        $(btn).click(function (e) {
            e.preventDefault();
            var url = getData(btn);
            if( url ) {
              console.log("Flattr URL: "+url);
              port.postMessage({url: url});
            } else {
              console.log("Error figuring out the Flattr URL");
            }
        });
      });
    }
  };

  var removeExtras = function() {
    $('.replies .flattr-tweet-button').remove();
  };

  var twitterLoop = function flattrTwitter() {
    insertButtons();
    removeExtras();
    setTimeout(flattrTwitter,500);
  };

  twitterLoop();

}());
