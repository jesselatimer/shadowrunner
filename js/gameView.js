(function (){
  var ShadowRunner = window.ShadowRunner = window.ShadowRunner || {};

  var GameView = ShadowRunner.GameView = function (game, canvas) {
    this.game = game;
    this.ctx = canvas.getContext("2d");
  };

  GameView.prototype.start = function () {
    var that = this;
    var interval = setInterval(function() {
      that.bindKeyHandlers();
      that.game.step.call(that.game);
      if (that.game.over === true) {
        alert("Game Over! You deaded.");
      } else {
        that.game.draw.call(that.game, that.ctx);
      }
    }, 1000 / 60);
  };

  GameView.prototype.bindKeyHandlers = function () {
    if(key.isPressed("space")){ this.game.runner.jump(); }
  };

})();
