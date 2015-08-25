(function (){
  var ShadowRunner = window.ShadowRunner = window.ShadowRunner || {};

  var MovingObject = ShadowRunner.MovingObject = function (options) {
    this.pos = options.pos;
    this.vel = options.vel;
    this.radius = options.radius;
    this.color = options.color;
    this.game = options.game;
  };

  MovingObject.prototype.draw = function (ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();

    ctx.arc(
      this.pos[0],
      this.pos[1],
      this.radius,
      0,
      2 * Math.PI,
      false
    );

    ctx.fill();
  };

  MovingObject.prototype.move = function () {
    this.pos[0] += this.vel[0];
    this.pos[1] += this.vel[1];
    if (this.isWrappable) {
      this.pos = this.game.wrap(this.pos, this.radius);
    }
    else if (this.isOutOfBounds) {
      this.game.remove(this);
    }
  };

  MovingObject.prototype.isCollidedWith = function (otherObject) {
    var radTotal = this.radius + otherObject.radius;
    var triX = this.pos[0] - otherObject.pos[0];
    var triY = this.pos[1] - otherObject.pos[1];
    var triSqr = Math.pow(triX, 2) + Math.pow(triY, 2);
    var distance = Math.sqrt(triSqr);
    return distance <= radTotal;
  };

  MovingObject.prototype.collideWith = function (otherObject) {
  };

})();
