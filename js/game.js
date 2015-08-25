(function () {
  var ShadowRunner = window.ShadowRunner = window.ShadowRunner || {};

  var Game = ShadowRunner.Game = function (dimX, dimY, speed) {
    this.gravity = 1.2;
    this.over = false;
    this.DIM_X = dimX;
    this.DIM_Y = dimY;
    this.speed = speed;
    this.runner = new ShadowRunner.Runner([dimX/2, dimY/2], this);
    this.addObstacles();
    this.allObjects = [this.runner].concat(this.obstacles);
  };

  Game.prototype.addObstacles = function () {
    // Add terrain
    this.obstacles = [];
  };

  Game.prototype.draw = function (ctx) {
    ctx.clearRect(0, 0, this.DIM_X, this.DIM_Y);
    this.allObjects.forEach(function (object) { object.draw(ctx); });
  };

  Game.prototype.moveObjects = function () {
    if (this.runner.isJumping) {
      this.runner.vel[1] += this.gravity;
      character.y += this.vel[1];
      if (character.y > characterGround) {
        character.y = characterGround;
        this.vel[1] = 0;
        isJumping = false;
       }
    }
    this.obstacles.forEach(function (object) { object.move(); });
  };

  Game.prototype.checkCollisions = function () {
    for (var i = 0; i < this.allObjects.length; i++) {
      for (var j = i + 1; j < this.allObjects.length; j++) {
        if (this.allObjects[i].isCollidedWith(this.allObjects[j])) {
          this.allObjects[i].collideWith(this.allObjects[j]);
        }
      }
    }
  };

  Game.prototype.step = function () {
    this.moveObjects();
    this.checkCollisions();
  };

  Game.prototype.gameOver = function () {
    this.over = true;
  };

  function randoPos(dims){
    var x = Math.random() * dims[0];
    var y = Math.random() * dims[1];
    return [x, y];
  }

})();
