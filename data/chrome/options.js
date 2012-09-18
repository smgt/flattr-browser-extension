var Options = {
  init: function() {
    // var services = document.getElementsByClassName("service");
    var services = document.querySelectorAll("input[type=checkbox]");

    for(var i = 0; i < services.length; ++i) {
      console.log(services[i]);
      services[i].addEventListener("change", function(e) {
        var that = this;
        Options.toggle(that);
      });
      if(localStorage.getItem('flattr.option.'+services[i].getAttribute("name")) === services[i].getAttribute("name")) {
        services[i].setAttribute("checked", "checked");
      }
    }
  },
  toggle: function(elem) {
    var container = elem.parentElement;
    if(container.querySelector("span.label")) return;
    var serviceId = elem.getAttribute('name');
    var alert = document.createElement("span");
    alert.className = "label";
    alert.innerHTML = "Saved...";
    container.appendChild(alert);

    if(localStorage.getItem('flattr.option.'+serviceId) === serviceId) {
      Options.disable(elem);
    } else {
      Options.enable(elem);
    }

    window.setTimeout(function(elem, alert) {
      console.log(alert);
      elem.removeChild(alert);
    }, 1500, container, alert);

  },
  enable: function(elem) {
    var service = elem.getAttribute("name");
    console.log("set attribute: "+service);
    localStorage.setItem('flattr.option.'+service, service);
  },
  disable: function(elem) {
    console.log("unset attribute");
    localStorage.removeItem('flattr.option.'+elem.getAttribute('name'));
  }
}

document.addEventListener('DOMContentLoaded', function () {
  Options.init();
});
