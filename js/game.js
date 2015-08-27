(function () {
  var terrain;
  var ground;
  var wisp;
  var testObstacle;

  function preload() {
    game.load.image('ground', 'assets/blackrectangle.jpg');
    game.load.image('wisp', 'assets/wisp.png');
    game.load.image('obstacle', 'assets/badguy.png');
    game.load.image('terrain', 'assets/mountain.png');
  }

  function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    terrain = game.add.group();
    terrain.enableBody = true;
    ground = terrain.create(0, game.world.height - 120, 'ground');
    ground.scale.setTo(2, 2);
    ground.body.immovable = true;

    wisp = game.add.sprite(0, 0, 'wisp');
    game.physics.arcade.enable(wisp);
    wisp.scale.set(0.5, 0.5);

    wisp.body.gravity.y = 300;
    player.body.collideWorldBounds = true;

    obstacles = game.add.group();
    obstacles.enableBody = true;

    game.time.events.loop((Phaser.Timer.SECOND * game.rnd.integerInRange(2, 6)), createObstacle, this);

    spacebar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    game.input.keyboard.addKeyCapture(Phaser.Keyboard.SPACEBAR);

  }

  function createObstacle() {
    testObstacle = obstacles.create(game.world.width + 100, game.world.height - 200, 'obstacle');
    testObstacle.scale.setTo(0.2, 0.2);
    testObstacle.body.velocity.x = -200;
  }

  function update() {
    game.physics.arcade.collide(wisp, terrain);
    game.physics.arcade.collide(wisp, obstacles, die);

    wisp.body.velocity.x = 0;


    if (spacebar.isDown && wisp.body.touching.down)
    {
        wisp.body.velocity.y = -350;
    }

  }

  function die() {
    wisp.kill();
    game.pause();
  }
})();
