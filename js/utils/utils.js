(function () {
  var ShadowRunner = window.ShadowRunner = window.ShadowRunner || {};

  var Util = ShadowRunner.Util = function () {};
  Util.inherits = function (ChildClass, ParentClass) {
    function Surrogate() {}
    Surrogate.prototype = ParentClass.prototype;
    ChildClass.prototype = new Surrogate();
    ChildClass.prototype.constructor = ChildClass;
  };

})();
