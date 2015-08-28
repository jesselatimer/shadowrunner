(function () {
  // Adapted by the code by Loktar http://codepen.io/loktar00
  // at http://codepen.io/loktar00/details/uEJKl/

  var ShadowRunner = window.ShadowRunner = window.ShadowRunner || {};

  var Background = ShadowRunner.Background = function () {
    this.background = document.getElementById("bg-canvas");
    this.bgCtx = this.background.getContext("2d");

    this.width = window.innerWidth;
    var docHeight = document.body.offsetHeight;
    this.height = (docHeight < 400) ? 400 : docHeight;

    this.background.width = this.width;
    this.background.height = this.height;

    this.entities = [];
    this.entities.push(new Terrain({displacement : 140, scrollDelay : 90, fillStyle : "#929292", mHeight : (this.height/2)-300, width: this.width, height: this.height}));
    this.entities.push(new Terrain({displacement : 120, scrollDelay : 50,  fillStyle : "#5f5f5f", mHeight : (this.height/2)-200, width: this.width, height: this.height}));
    this.entities.push(new Terrain({displacement : 100, scrollDelay : 20,  fillStyle : "#3a3a3a", mHeight : (this.height/2)-75, width: this.width, height: this.height}));
    this.entities.push(new Terrain({displacement : 60,  scrollDelay :  1,  fillStyle : "#333", mHeight : (this.height/2)+50, width: this.width, height: this.height}));

    this.isPaused = false;

    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
      window.setTimeout(callback, 1000 / 60);
    };
    window.requestAnimationFrame = requestAnimationFrame;

    this.animate();
  };

  //animate background
  Background.prototype.animate = function () {
      this.bgCtx.fillStyle = '#b2b2b2';
      this.bgCtx.fillRect(0, 0, this.width, this.height);
      this.bgCtx.fillStyle = '#ffffff';
      this.bgCtx.strokeStyle = '#ffffff';

      var entLen = this.entities.length;

      if (!this.isPaused) {
        while (entLen--) {
            this.entities[entLen].update();
        }
      }
      requestAnimationFrame(this.animate.bind(this));        
  };

  // Define Terrain
  var Terrain = ShadowRunner.Terrain = function (options) {
      options = options || {};

      this.terrain = document.createElement("canvas");
      this.terCtx = this.terrain.getContext("2d");
      this.scrollDelay = options.scrollDelay || 90;
      this.lastScroll = new Date().getTime();

      this.width = options.width;
      this.height = options.height;
      this.terrain.width = this.width;
      this.terrain.height = this.height;
      this.fillStyle = options.fillStyle || "#191D4C";
      this.mHeight = options.mHeight || this.height;

      // generate
      this.points = [];

      var displacement = options.displacement || 140,
          power = Math.pow(2, Math.ceil(Math.log(this.width) / (Math.log(2))));

      // set the start this.height and end this.height for the terrain
      this.points[0] = this.mHeight;//(this.mHeight - (Math.random() * this.mHeight / 2)) - displacement;
      this.points[power] = this.points[0];

      // create the rest of the points
      for (var i = 1; i < power; i *= 2) {
          for (var j = (power / i) / 2; j < power; j += power / i) {
              this.points[j] = ((this.points[j - (power / i) / 2] + this.points[j + (power / i) / 2]) / 2) + Math.floor(Math.random() * -displacement + displacement);
          }
          displacement *= 0.6;
      }

      document.getElementById('bg-canvas-wrapper').appendChild(this.terrain);
  };

  Terrain.prototype.update = function () {
      // draw the terrain
      this.terCtx.clearRect(0, 0, this.width, this.height);
      this.terCtx.fillStyle = this.fillStyle;

      if (new Date().getTime() > this.lastScroll + this.scrollDelay) {
          this.lastScroll = new Date().getTime();
          this.points.push(this.points.shift());
      }

      this.terCtx.beginPath();
      for (var i = 0; i <= this.width; i++) {
          if (i === 0) {
              this.terCtx.moveTo(0, this.points[0]);
          } else if (this.points[i] !== undefined) {
              this.terCtx.lineTo(i, this.points[i]);
          }
      }

      this.terCtx.lineTo(this.width, this.terrain.height);
      this.terCtx.lineTo(0, this.terrain.height);
      this.terCtx.lineTo(0, this.points[0]);
      this.terCtx.fill();
  };
})();
