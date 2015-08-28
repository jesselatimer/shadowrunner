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
    this.wisp.body.gravity.y = 1000;
    this.wisp.body.collideWorldBounds = true;

    this.obstacles = this.game.add.group();
    this.obstacles.enableBody = true;
    this.nextObstacle = 0;

    this.level = 10;

    this.spacebar = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.game.input.keyboard.addKeyCapture(Phaser.Keyboard.SPACEBAR);

  };

  Game.prototype.update = function () {
    this.game.physics.arcade.collide(this.wisp, this.terrain);
    this.game.physics.arcade.collide(this.wisp, this.obstacles, _die.bind(this));

    this.wisp.body.velocity.x = 0;

    // Jump
    if (this.spacebar.isDown && this.wisp.body.touching.down) {
      this.wisp.body.velocity.y = -550;
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
    obstacle.body.velocity.x = -(1 - Math.exp(-(100) / 10)) * 1500;
    console.log(obstacle.body.velocity.x);
    obstacle.body.immovable = true;

  };

  function _die() {
    this.wisp.kill();
  }
})();
