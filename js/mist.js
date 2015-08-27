(function () {
  // Adapted from the code created and maintained by Piotr
  // (http://twitter.com/zalun) and Oskar (https://twitter.com/oskar)
  // at http://jsfiddle.net/jonnyc/Ujz4P/5/

  var ShadowRunner = window.ShadowRunner = window.ShadowRunner || {};

  var Mist = ShadowRunner.Mist = function () {
    // Create an array to store our particles
    this.particles = [];

    // The amount of particles to render
    this.particleCount = 100;

    // The maximum velocity in each direction
    this.maxVelocity = 0.3;

    // The target frames per second (how often do we want to update / redraw the scene)
    this.targetFPS = 60;

    // Set the dimensions of the canvas as variables so they can be used.
    this.canvasWidth = window.innerWidth;
    var docHeight = document.body.offsetHeight;
    this.canvasHeight = (docHeight < 400) ? 400 : docHeight;

    // Create an image object (only need one instance)
    var imageObj = new Image();

    // Once the image has been downloaded then set the image on all of the particles
    imageObj.onload = function() {
      this.particles.forEach(function(particle) {
        particle.setImage(imageObj);
      });
    }.bind(this);

    // Once the callback is arranged then set the source of the image
    imageObj.src = "/assets/Smoke10.png";

    // The canvas context if it is defined.
    // Don't need because it's a instance variable.
    // var context;

    // Initialize the scene
    this.init();

    // If the context is set then we can draw the scene (if not then the browser does not support canvas)
    if (this.context) {
      setInterval(function() {
        // Update the scene before drawing
        this.update();

        // Draw the scene
        this.draw();
      }.bind(this), 1000 / this.targetFPS);
    }
  };



  // A function to create a particle object.
  Mist.prototype.Particle = function (context) {

      // Set the initial x and y positions
      this.x = 0;
      this.y = 0;

      // Set the initial velocity
      this.xVelocity = 0;
      this.yVelocity = 0;

      // Set the radius
      this.radius = 5;

      // Store the context which will be used to draw the particle
      this.context = context;

      // The function to draw the particle on the canvas.
      this.draw = function() {

          // If an image is set draw it
          if(this.image){
              this.context.drawImage(this.image, this.x-128, this.y-128);
              // If the image is being rendered do not draw the circle so break out of the draw function
              return;
          }
          // Draw the circle as before, with the addition of using the position and the radius from this object.
          this.context.beginPath();
          this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
          // this.context.fillStyle = "rgba(0, 255, 255, 1)";
          // this.context.fill();
          this.context.closePath();
      };

      // Update the particle.
      this.update = function() {
          // Update the position of the particle with the addition of the velocity.
          this.x += this.xVelocity;
          this.y += this.yVelocity;

          // Check if has crossed the right edge
          if (this.x >= this.canvasWidth) {
              this.xVelocity = -this.xVelocity;
              this.x = this.canvasWidth;
          }
          // Check if has crossed the left edge
          else if (this.x <= 0) {
              this.xVelocity = -this.xVelocity;
              this.x = 0;
          }

          // Check if has crossed the bottom edge
          if (this.y >= this.canvasHeight) {
              this.yVelocity = -this.yVelocity;
              this.y = this.canvasHeight;
          }

          // Check if has crossed the top edge
          else if (this.y <= 0) {
              this.yVelocity = -this.yVelocity;
              this.y = 0;
          }
      };

      // A function to set the position of the particle.
      this.setPosition = function(x, y) {
          this.x = x;
          this.y = y;
      };

      // Function to set the velocity.
      this.setVelocity = function(x, y) {
          this.xVelocity = x;
          this.yVelocity = y;
      };

      this.setImage = function(image){
          this.image = image;
      };
  };

  // A function to generate a random number between 2 values
  Mist.prototype.generateRandom = function (min, max){
      return Math.random() * (max - min) + min;
  };

  // Initialise the scene and set the context if possible
  Mist.prototype.init = function () {
      this.canvas = document.getElementById('mist-canvas');
      this.canvas.width = this.canvasWidth;
      this.canvas.height = this.canvasHeight;
      if (this.canvas.getContext) {

          // Set the context variable so it can be re-used
          this.context = this.canvas.getContext('2d');

          // Create the particles and set their initial positions and velocities
          for(var i=0; i < this.particleCount; ++i){
              var particle = new this.Particle(this.context);

              // Set the position to be inside the canvas bounds
              particle.setPosition(this.generateRandom(0, this.canvasWidth), this.generateRandom(0, this.canvasHeight));

              // Set the initial velocity to be either random and either negative or positive
              particle.setVelocity(this.generateRandom(-this.maxVelocity, this.maxVelocity), this.generateRandom(-this.maxVelocity, this.maxVelocity));
              this.particles.push(particle);
          }
      }
      else {
          alert("Please use a modern browser");
      }
  };

  // The function to draw the scene
  Mist.prototype.draw = function () {
      // Clear the drawing surface and fill it with a white background
      this.context.fillStyle = "rgba(0, 0, 0, 0.5)";
      this.context.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

      // Go through all of the particles and draw them.
      this.particles.forEach(function(particle) {
          particle.draw();
      });
  };

  // Update the scene
  Mist.prototype.update = function () {
      this.particles.forEach(function(particle) {
          particle.update();
      });
  };
})();
