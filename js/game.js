// Variable Jumping code adapted from code © 2014 John Watson
// Licensed under the terms of the MIT License

(function () {

  //  The Google WebFont Loader will look for this object, so create it before loading the script.
  WebFontConfig = {

      //  The Google Fonts we want to load (specify as many as you like in the array)
      google: {
        families: ['Kaushan Script']
      }

  };


  var ShadowRunner = window.ShadowRunner = window.ShadowRunner || {};

  var Game = ShadowRunner.Game = function (options) {
    this.background = options.background;

    // Create Phaser game
    this.game = new Phaser.Game(
      options.width,
      options.height,
      Phaser.CANVAS,
      'game-wrapper',
      {
        preload: this.preload.bind(this),
        create: this.create.bind(this),
        update: this.update.bind(this),
        render: this.render.bind(this)
      },
      true // Sets background to transparent
    );
  };

  Game.prototype.preload = function () {
    this.game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
    this.game.load.image('ground', 'assets/blackrectangle.jpg');
    this.game.load.image('emptyGround', 'assets/transparent.png');
    this.game.load.image('wisp', 'assets/wisp.gif');
    this.game.load.image('obstacle', 'assets/spikeballred.png');
    this.game.load.image('terrain', 'assets/mountain.png');
    this.game.load.image('grass', 'assets/grass.png');
    this.highScore = 0;
  };

  Game.prototype.create = function () {
    this.debug = false;
    this.game.canvas.oncontextmenu = function (e) { e.preventDefault(); };
    this.dead = false;
    this.cutscene = true;

    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.level = 5;
    this.obstacleCount = 0;
    this.jumping = false;

    // Add wisp
    this.wisp = this.game.add.sprite(1, this.game.world.height - 200, 'wisp');
    this.game.add.tween(this.wisp).to( {
      x: [
        this.game.world.width * 0.1,
        this.game.world.width * 0.3
         ]
       }, 2000, "Sine.easeOut", true, 1200);

    this.game.physics.arcade.enable(this.wisp);
    this.wisp.anchor.x = 1;
    this.wisp.anchor.y = 1;

    setTimeout(function () {
      this.wisp.body.collideWorldBounds = true;
      this.cutscene = false;
    }.bind(this), 2400);

    this.MAX_SPEED = 700; // pixels/second
    this.ACCELERATION = 1500; // pixels/second/second
    this.DRAG = 600; // pixels/second
    this.GRAVITY = 2600; // pixels/second/second
    this.JUMP_SPEED = -700; // pixels/second (negative y is up)

    // Set wisp minimum and maximum movement speed
    this.wisp.body.maxVelocity.setTo(this.MAX_SPEED, this.MAX_SPEED * 10); // x, y
    this.wisp.body.drag.setTo(this.DRAG, 0); // x, y
    this.wisp.body.gravity.y = this.GRAVITY;
    this.wisp.body.setSize(
      this.wisp.body.width * 0.8,
      this.wisp.body.height * 0.6,
      this.wisp.body.width * 0.1,
      this.wisp.body.height * 0.3
    );

    // Add obstacles
    this.obstacles = this.game.add.group();
    this.obstacles.alpha = 0;
    this.obstacles.enableBody = true;
    this.nextObstacle = this.game.time.now + 3000;

    // Add decorations
    this.decorations = this.game.add.group();
    this.decorations.alpha = 0;
    this.decorations.enableBody = true;
    for (var i = 1; i < (this.game.world.width / 80) + 2; i++) {
      this.createDecoration(i * 80);
    }
    this.decNum = this.decorations.length;

    // Add terrain
    this.terrain = this.game.add.group();
    this.terrain.alpha = 0;
    this.terrain.enableBody = true;
    this.ground = this.terrain.create(0, this.game.world.height - 120, 'ground');
    this.ground.scale.setTo(2, 2);
    this.ground.body.immovable = true;

    // Empty terrain gives illusion of floating
    this.emptyGround = this.terrain.create(0, this.game.world.height - 135, 'emptyGround');
    this.emptyGround.scale.setTo(1, 2);
    this.emptyGround.body.immovable = true;

    // Fade it all in
    this.game.add.tween(this.terrain).to( { alpha: 1 }, 500, "Sine.easeIn", true);
    this.game.add.tween(this.decorations).to( { alpha: 1 }, 500, "Sine.easeIn", true);
    this.game.add.tween(this.obstacles).to( { alpha: 1 }, 500, "Sine.easeIn", true);

    // Negate standard spacebar function
    this.game.input.keyboard.addKeyCapture(Phaser.Keyboard.SPACEBAR);
  };

  Game.prototype.update = function () {
    this.game.physics.arcade.collide(this.wisp, this.terrain);
    this.game.physics.arcade.collide(this.wisp, this.obstacles, this.die.bind(this));

    // Jump
    // Set a variable that is true when the wisp is touching the ground
    var onTheGround = this.wisp.body.touching.down;

    // Set max jumps
    var jumpNum = Math.floor((this.level - 5) / 5);
    this.bonusJumps = jumpNum > 2 ? 2 : jumpNum;

    // If the wisp is touching the ground, let him have jumps
    if (this.dead || this.cutscene) {
      this.jumps = 0;
      this.jumping = false;
    } else if (onTheGround) {
      this.jumps = 1 + this.bonusJumps;
      this.jumping = false;
    }

    // Jump! Keep y velocity constant while the jump button is held
    if (this.jumps > 0 && this.upInputIsActive(200) && !this.dead && !this.cutscene) {
      this.wisp.body.velocity.y = this.JUMP_SPEED;
      this.jumping = true;
    }

    // If the jump input is released, set jumping to false
    if (this.jumping && this.upInputReleased()) {
      this.jumps--;
      this.jumping = false;
    }

    // Create Obstacles
    if (this.game.time.now > this.nextObstacle) {
      this.updateNextObstacle();
      this.createObstacle();
    }

    // Create Decorations
    if (this.decorations && this.decorations.length < this.decNum) {
      this.createDecoration(this.game.world.width + 80);
    }
  };

  Game.prototype.render = function () {
    if (this.debug) { this.debugMode(); }
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
    var obstacle = this.obstacles.create(
      this.game.world.width - 1,
      this.game.world.height - 120 - this.sizeVariation(40),
      'obstacle'
    );

    var size = 0.2 * (this.sizeVariation(1.2));
    obstacle.scale.setTo(size, size);
    obstacle.anchor.x = 0.5;
    obstacle.anchor.y = 0.5;

    obstacle.body.setSize(
      obstacle.body.width * 0.4,
      obstacle.body.height * 0.5
    );

    // Exponential saturation velocity increase
    obstacle.body.velocity.x = this.getVelocity();
    obstacle.body.immovable = true;
    obstacle.events.onOutOfBounds.add(this.objectOOB, this);
    obstacle.checkWorldBounds = true;
  };

  Game.prototype.createDecoration = function (x) {
    var decoration = this.decorations.create(x, this.game.world.height - 108, 'grass');
    decoration.anchor.x = 1;
    decoration.anchor.y = 1;

    var size = this.sizeVariation(1);
    decoration.scale.setTo(size, size);

    decoration.body.velocity.x = this.getVelocity();
    decoration.body.immovable = true;
    decoration.events.onOutOfBounds.add(this.objectOOB, this);
    decoration.checkWorldBounds = true;
  };

  Game.prototype.sizeVariation = function (adjustor) {
    return (this.game.rnd.realInRange(0.85 / adjustor, 1.15 * adjustor));
  };

  Game.prototype.objectOOB = function (object) {
    object.destroy();
    if (object.key === "obstacle") {
      this.obstacleCount += 1;
      if (this.obstacleCount % 10 === 0) {
        this.level += 1;
        this.decorations.setAllChildren("body.velocity.x", this.getVelocity());
        this.obstacles.setAllChildren("body.velocity.x", this.getVelocity());
      }
    }
  };

  Game.prototype.getVelocity = function () {
    return -(1 - Math.exp(-(this.level) / 10)) * 1500;
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

  Game.prototype.die = function () {
    // play death animation, on success:
    this.wisp.kill();
    this.gameOver();
  };

  Game.prototype.gameOver = function () {
    if (this.obstacleCount > this.highScore) { this.highScore = this.obstacleCount; }
    this.dead = true;

    // Add game over screen
    this.gameOverScreen = this.game.add.graphics(0, 0);
    this.gameOverScreen.alpha = 0;
    this.gameOverScreen.beginFill(0xffffff, 0.4);
    this.gameOverScreen.lineStyle(2, 0xffffff, 0.4);
    this.gameOverScreen.drawRoundedRect(this.game.world.width * 0.1, this.game.world.height * 0.1, this.game.world.width * 0.8, this.game.world.height * 0.8, 5);
    this.gameOverScreen.endFill();

    this.gameOverText = this.game.add.text(0, 0, "you have failed \nclick to try again \nobstacles cleared: " + this.obstacleCount + " \nrecord: " + this.highScore + " ");
    this.gameOverText.alpha = 0;
    this.gameOverText.setTextBounds(this.game.world.width * 0.1, this.game.world.height * 0.1, this.game.world.width * 0.8, this.game.world.height * 0.8);
    this.gameOverText.boundsAlignH = "center";
    this.gameOverText.boundsAlignV = "middle";
    this.gameOverText.font = 'Kaushan Script';
    this.gameOverText.fontSize = 50;
    this.gameOverText.align = "center";
    this.game.add.tween(this.gameOverText).to( { alpha: 1 }, 500, "Sine.easeIn", true);
    this.game.add.tween(this.gameOverScreen).to( { alpha: 1 }, 500, "Sine.easeIn", true);
    this.game.add.tween(this.terrain).to( { alpha: 0 }, 500, "Sine.easeIn", true);
    this.game.add.tween(this.decorations).to( { alpha: 0 }, 500, "Sine.easeIn", true);
    this.game.add.tween(this.obstacles).to( { alpha: 0 }, 500, "Sine.easeIn", true);

    // Add restart event listener
    this.restartListener = this.game.input.onDown.add(this.restart.bind(this));
  };

  Game.prototype.restart = function () {
    this.wisp.destroy();
    this.terrain.destroy();
    this.obstacles.destroy();
    this.decorations.destroy();
    this.gameOverScreen.destroy();
    this.gameOverText.destroy();
    this.restartListener.detach();

    this.create();

    this.game.paused = false;
    this.background.isPaused = false;
  };

  Game.prototype.debugMode = function () {
		this.game.debug.body(this.wisp, "#9090ff", false);
		this.obstacles.forEachAlive(this.game.debug.body,this.game.debug,"#ff9090",false);
	};
})();
