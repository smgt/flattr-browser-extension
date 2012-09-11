var Options = {
  init: function() {
    // var services = document.getElementsByClassName("service");
    var services = document.querySelectorAll("input[type=checkbox]");

    for(var i = 0; i < services.length; ++i) {
      console.log(services[i]);
      services[i].addEventListener("change", function(e) {
        Options.toggle(this);
      });
      if(localStorage.getItem('flattr.option.'+services[i].getAttribute("id")) === services[i].getAttribute("id")) {
        services[i].setAttribute("checked", "checked");
      }
    }
  },
  toggle: function(elem) {
    var serviceId = elem.getAttribute('id');
    var alert = document.getElementById('alert-box');
    alert.style.display = "block";
    window.setTimeout(function(alert) {
      console.log(alert);
      alert.style.display = "none";
    }, 1000, alert);
    if(localStorage.getItem('flattr.option.'+serviceId) === serviceId) {
      Options.disable(elem);
    } else {
      Options.enable(elem);
    }
  },
  enable: function(elem) {
    console.log("set attribute");
    localStorage.setItem('flattr.option.'+elem.getAttribute('id'), elem.getAttribute('id'));
  },
  disable: function(elem) {
    console.log("unset attribute");
    localStorage.removeItem('flattr.option.'+elem.getAttribute('id'));
  }
}

document.addEventListener('DOMContentLoaded', function () {
  Options.init();
});
