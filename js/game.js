// Variable Jumping code adapted from code © 2014 John Watson
// Licensed under the terms of the MIT License

(function () {

  var ShadowRunner = window.ShadowRunner = window.ShadowRunner || {};

  var Game = ShadowRunner.Game = function () {
    // Create Phaser game
    this.game = new Phaser.Game(
      window.innerWidth,
      window.innerHeight,
      Phaser.AUTO,
      'game-wrapper',
      {
        preload: this.preload.bind(this),
        create: this.create.bind(this),
        update: this.update.bind(this)
      },
      true // Sets background to transparent
    );
  };

  Game.prototype.preload = function () {
    this.game.load.image('ground', 'assets/blackrectangle.jpg');
    this.game.load.image('wisp', 'assets/wisp.png');
    this.game.load.image('obstacle', 'assets/badguy.png');
    this.game.load.image('terrain', 'assets/mountain.png');
    this.game.load.image('grass', 'assets/grass.png');
  };

  Game.prototype.create = function () {
    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    this.terrain = this.game.add.group();
    this.terrain.enableBody = true;
    this.ground = this.terrain.create(0, this.game.world.height - 120, 'ground');
    this.ground.scale.setTo(2, 2);
    this.ground.body.immovable = true;

    this.wisp = this.game.add.sprite(70, 300, 'wisp');
    this.game.physics.arcade.enable(this.wisp);
    this.wisp.scale.set(0.5, 0.5);
    this.wisp.body.collideWorldBounds = true;

    this.obstacles = this.game.add.group();
    this.obstacles.enableBody = true;
    this.nextObstacle = 0;

    this.decorations = this.game.add.group();
    this.decorations.enableBody = true;
    this.game.time.events.loop(100, this.createDecoration, this);

    this.level = 3;

    // Define movement constants
    this.MAX_SPEED = 500; // pixels/second
    this.ACCELERATION = 1500; // pixels/second/second
    this.DRAG = 600; // pixels/second
    this.GRAVITY = 2600; // pixels/second/second
    this.JUMP_SPEED = -700; // pixels/second (negative y is up)

    // Set wisp minimum and maximum movement speed
    this.wisp.body.maxVelocity.setTo(this.MAX_SPEED, this.MAX_SPEED * 10); // x, y

    // Add drag to the wisp that slows them down when they are not accelerating
    this.wisp.body.drag.setTo(this.DRAG, 0); // x, y

    // Since we're jumping we need gravity
    // this.game.physics.arcade.gravity.y = this.GRAVITY;
    this.wisp.body.gravity.y = this.GRAVITY;

    // Flag to track if the jump button is pressed
    this.jumping = false;

    this.spacebar = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.game.input.keyboard.addKeyCapture(Phaser.Keyboard.SPACEBAR);
  };

  Game.prototype.update = function () {
    this.game.physics.arcade.collide(this.wisp, this.terrain);
    this.game.physics.arcade.collide(this.wisp, this.obstacles, _die.bind(this));

    // Jump
    // Set a variable that is true when the wisp is touching the ground
    var onTheGround = this.wisp.body.touching.down;

    // If the wisp is touching the ground, let him have 2 jumps
    if (onTheGround) {
        this.jumps = 2;
        this.jumping = false;
    }

    // Jump! Keep y velocity constant while the jump button is held for up to 150 ms
    if (this.jumps > 0 && this.upInputIsActive(150)) {
        this.wisp.body.velocity.y = this.JUMP_SPEED;
        this.jumping = true;
    }

    // Reduce the number of available jumps if the jump input is released
    if (this.jumping && this.upInputReleased()) {
        this.jumps--;
        this.jumping = false;
    }

    // Create Obstacles
    if (this.game.time.now > this.nextObstacle) {
      this.updateNextObstacle();
      this.createObstacle();
    }
  };

  Game.prototype.updateNextObstacle = function() {
    // Average out new time to create a curve
    var min = (this.game.rnd.realInRange(1, 6) * 1000),
        max = (this.game.rnd.realInRange(1, 6) * 1000),
        average = (min + max) / 2,
        levelMod = (this.level > 5) ? (5 * 0.5) : (this.level * 0.5),
        newTime = average / levelMod;

    this.nextObstacle = this.game.time.now + newTime;
  };

  Game.prototype.createObstacle = function () {
    obstacle = this.obstacles.create(this.game.world.width + 100, this.game.world.height - 200, 'obstacle');
    obstacle.scale.setTo(0.2, 0.2);
    obstacle.body.velocity.x = -(1 - Math.exp(-(this.level) / 10)) * 1500;
    obstacle.body.immovable = true;
  };

  Game.prototype.createDecoration = function () {
    decoration = this.decorations.create(this.game.world.width + 25, this.game.world.height - 160, 'grass');
    decoration.scale.setTo(0.2, 0.2);
    decoration.body.velocity.x = -(1 - Math.exp(-(this.level) / 10)) * 1500;
    decoration.body.immovable = true;
  };

  // This function should return true when the wisp activates the "jump" control
  // In this case, either holding the up arrow or tapping or clicking.
  Game.prototype.upInputIsActive = function (duration) {
      var isActive = false;

      isActive = this.game.input.keyboard.downDuration(Phaser.Keyboard.SPACEBAR, duration);
      isActive |= (this.game.input.activePointer.justPressed(duration + 1000/60));

      return isActive;
  };

  // This function returns true when the wisp releases the "jump" control
  Game.prototype.upInputReleased = function () {
      var released = false;

      released = this.game.input.keyboard.upDuration(Phaser.Keyboard.SPACEBAR);
      released |= this.game.input.activePointer.justReleased();

      return released;
  };

  function _die() {
    this.wisp.kill();
  }

})();
