(function () {
  // Adapted by the code by Loktar http://codepen.io/loktar00
  // at http://codepen.io/loktar00/details/uEJKl/

  var ShadowRunner = window.ShadowRunner = window.ShadowRunner || {};

  var Background = ShadowRunner.Background = function () {
    // Terrain stuff.
    this.background = document.getElementById("bg-canvas");
    this.bgCtx = background.getContext("2d");
    this.width = window.innerWidth;
    this.height = document.body.offsetHeight;

    this.height = (this.height < 400) ? 400 : this.height;

    this.background.width = width;
    this.background.height = height;


    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
    window.requestAnimationFrame = requestAnimationFrame;
  };

  function Terrain(options) {
      options = options || {};
      this.terrain = document.createElement("canvas");
      this.terCtx = this.terrain.getContext("2d");
      this.scrollDelay = options.scrollDelay || 90;
      this.lastScroll = new Date().getTime();

      this.terrain.width = width;
      this.terrain.height = height;
      this.fillStyle = options.fillStyle || "#191D4C";
      this.mHeight = options.mHeight || height;

      // generate
      this.points = [];

      var displacement = options.displacement || 140,
          power = Math.pow(2, Math.ceil(Math.log(width) / (Math.log(2))));

      // set the start height and end height for the terrain
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
  }

  Terrain.prototype.update = function () {
      // draw the terrain
      this.terCtx.clearRect(0, 0, width, height);
      this.terCtx.fillStyle = this.fillStyle;

      if (new Date().getTime() > this.lastScroll + this.scrollDelay) {
          this.lastScroll = new Date().getTime();
          this.points.push(this.points.shift());
      }

      this.terCtx.beginPath();
      for (var i = 0; i <= width; i++) {
          if (i === 0) {
              this.terCtx.moveTo(0, this.points[0]);
          } else if (this.points[i] !== undefined) {
              this.terCtx.lineTo(i, this.points[i]);
          }
      }

      this.terCtx.lineTo(width, this.terrain.height);
      this.terCtx.lineTo(0, this.terrain.height);
      this.terCtx.lineTo(0, this.points[0]);
      this.terCtx.fill();
  }


  // Second canvas used for the stars
  bgCtx.fillStyle = '#05004c';
  bgCtx.fillRect(0, 0, width, height);

  var entities = [];

  entities.push(new Terrain({fillStyle : "#929292", mHeight : (height/2)-300}));
  entities.push(new Terrain({displacement : 120, scrollDelay : 50, fillStyle : "#5f5f5f", mHeight : (height/2)-200}));
  entities.push(new Terrain({displacement : 100, scrollDelay : 20, fillStyle : "#3a3a3a", mHeight : (height/2)-75, }));

  //animate background
  function animate() {
      bgCtx.fillStyle = '#b2b2b2';
      bgCtx.fillRect(0, 0, width, height);
      bgCtx.fillStyle = '#ffffff';
      bgCtx.strokeStyle = '#ffffff';

      var entLen = entities.length;

      while (entLen--) {
          entities[entLen].update();
      }
      requestAnimationFrame(animate);
  }

  animate();
})();
