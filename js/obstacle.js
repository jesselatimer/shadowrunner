(function () {
  var ShadowRunner = window.ShadowRunner = window.ShadowRunner || {};

  var Obstacle = ShadowRunner.Obstacle = function (pos, game) {
    var dx = randoVelocity();
    var dy = randoVelocity();
    this.COLOR = "green";
    this.RADIUS = 15;
    var args = { pos: pos, vel: [dx, dy],
                 color: this.COLOR, radius: this.RADIUS, game: game };
    ShadowRunner.MovingObject.call(this, args);
  };

  ShadowRunner.Util.inherits(Obstacle, ShadowRunner.MovingObject);

  function randoVelocity() {
    return Math.random() * 2 - 1;
  }

})();
