(function () {
  var ShadowRunner = window.ShadowRunner = window.ShadowRunner || {};

  var Runner = ShadowRunner.Runner = function (pos, game) {
    this.isJumping = false;
    this.COLOR = "black";
    this.RADIUS = 15;
    this.startPos = pos;
    var args = { pos: pos, vel: [0, 0],
                 color: this.COLOR, radius: this.RADIUS, game: game };
    ShadowRunner.MovingObject.call(this, args);
  };

  ShadowRunner.Util.inherits(Runner, ShadowRunner.MovingObject);

  Runner.prototype.collideWith = function (otherObject) {
    this.game.gameOver();
  };

  Runner.prototype.jump = function () {
    if (this.isJumping === false) {
      this.vel[1] = -15;
      this.isJumping = true;
    }
  };

})();
