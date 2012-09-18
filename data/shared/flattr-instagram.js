;(function() {
  var buttons = [];
  var port = chrome.extension.connect({name: "flattr"});
  var buttons = {};

  buttons = [
    {
      name: "photo",
      text: "Flattrs",
      container: ".media-info .media-bar ul",
      after: '.comment-control',
      className: 'flattr-control',
      selector: '.flattr-control',
      create: function(btnConfig) {

        var flattrs = 0;

        $.ajax({
            url: 'https://api.flattr.com/rest/v2/things/lookup',
            dataType: 'json',
            data: {
              url: window.location.href
            },
            success: function(data, status, xhr) {
              if(data.flattrs) {
                flattrs = data.flattrs;
              } else {
                flattrs = 0;
              }
            }
        });

        var li = document.createElement("li");
        li.className = "flattr-control";
        li.style.margin = "2px 0 1px";

        var counter = document.createElement('strong');
        var span = document.createElement('span');
        span.className = "count-badge flattr-count";
        span.style.color = "#fff";
        span.innerHTML = flattrs;
        var b = document.createElement("b");
        b.innerHTML = btnConfig.text;

        counter.appendChild(span);
        counter.appendChild(b);

        var button = document.createElement("a");
        button.className = "flattr-button";
        button.setAttribute("href", "");
        button.style.borderTop = "1px solid rgba(255,255,255,0.12)";
        button.style.borderBottom = "1px solid #1C5380";

        var title = document.createElement("span");
        title.innerHTML = btnConfig.text;

        var button_b = document.createElement('b');
        button_b.style.background = "url("+chrome.extension.getURL("/data/images/flattr-instagram.png")+") no-repeat 12px 12px";
        var button_i = document.createElement('i');

        button.appendChild(title);
        button.appendChild(button_i);
        button.appendChild(button_b);

        li.appendChild(counter);
        li.appendChild(button);

        return li;
      },
      data: function (elem) {
        return window.location.href;
      }
    }
  ];

  port.onMessage.addListener(function(msg) {
    if(msg.flattr_options) {
      if(msg.flattr_options['flattr.option.service-instagram'] === "service-instagram") {
        Flattr.insertServiceButtons(buttons);
      }
    }
  });

})();
