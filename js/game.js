// var terrain;
// var ground;
// var wisp;
//
// function preload() {
//   game.load.image('ground', 'assets/blackrectangle.jpg');
//   game.load.image('wisp', 'assets/wisp.png');
// }
//
// function create() {
//
//   game.physics.startSystem(Phaser.Physics.ARCADE);
//
//   terrain = game.add.group();
//   terrain.enableBody = true;
//   ground = terrain.create(0, game.world.height - 64, 'ground');
//   ground.scale.setTo(2, 1);
//   ground.body.immovable = true;
//
//   wisp = game.add.sprite(0, 0, 'wisp');
//   game.physics.arcade.enable(wisp);
//   wisp.body.gravity.y = 300;
//
// }
//
// function update() {
//   game.physics.arcade.collide(wisp, terrain);
//
// }

var innerWidth = window.innerWidth;
var innerHeight = window.innerHeight;
var gameRatio = innerWidth/innerHeight;

var game = new Phaser.Game(Math.ceil(480*gameRatio), 480, Phaser.CANVAS);

var wisp;
var wispGravity = 800;
var wispJumpPower;

var score;
var scoreText;
var topScore;
var powerBar;
var powerTween;

var placedObstacles;
var obstacleGroup;
var minObstacleGap = 100;
var maxObstacleGap = 300;

var wispJumping;
var wispFallingDown;

var play = function(game){};

play.prototype = {

	preload:function(){
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		game.scale.setScreenSize(true);

		game.load.image("wisp", "assets/wisp.png");
		game.load.image("obstacle", "assets/blackrectangle.jpg");
    game.load.image("powerbar", "assets/obstacle.png");
	},

	create:function(){
		wispJumping = false;
		wispFallingDown = false;
		score = 0;
		placedObstacles = 0;
		obstacleGroup = game.add.group();
		topScore = localStorage.getItem("topFlappyScore")===null?0:localStorage.getItem("topFlappyScore");
		scoreText = game.add.text(10,10,"-",{
			font:"bold 16px Arial"
		});
		updateScore();
		game.stage.backgroundColor = "#87CEEB";
		game.physics.startSystem(Phaser.Physics.ARCADE);
		wisp = game.add.sprite(80,0,"wisp");
		wisp.anchor.set(0.5);
		wisp.lastObstacle = 1;
		game.physics.arcade.enable(wisp);
		wisp.body.gravity.y = wispGravity;
		game.input.onDown.add(prepareToJump, this);
		addObstacle(80);
	},

	update:function(){
		game.physics.arcade.collide(wisp, obstacleGroup, checkLanding);
		if(wisp.y>game.height){
			die();
		}
	}
};

game.state.add("Play",play);
game.state.start("Play");

function updateScore(){
	scoreText.text = "Score: "+score+"\nBest: "+topScore;
}

function prepareToJump(){
	if(wisp.body.velocity.y===0){
          powerBar = game.add.sprite(wisp.x,wisp.y-50,"powerbar");
          powerBar.width = 0;
          powerTween = game.add.tween(powerBar).to({
		   width:100
		}, 1000, "Linear",true);
          game.input.onDown.remove(prepareToJump, this);
          game.input.onUp.add(jump, this);
        }
}

function jump(){
  wispJumpPower= -powerBar.width*3-100;
  powerBar.destroy();
  game.tweens.removeAll();
  wisp.body.velocity.y = wispJumpPower*2;
  wispJumping = true;
  powerTween.stop();
  game.input.onUp.remove(jump, this);
}

function addNewObstacles(){
  var maxObstacleX = 0;
	obstacleGroup.forEach(function(item) {
		maxObstacleX = Math.max(item.x,maxObstacleX);
	});
	var nextObstaclePosition = maxObstacleX + game.rnd.between(minObstacleGap,maxObstacleGap);
	addObstacle(nextObstaclePosition);
}

function addObstacle(obstacleX){
	if(obstacleX<game.width*2){
		placedObstacles++;
		var obstacle = new Obstacle(game, obstacleX, game.rnd.integerInRange(250,380));
		game.add.existing(obstacle);
    obstacle.anchor.set(0.5,0);
		obstacleGroup.add(obstacle);
		var nextObstaclePosition = obstacleX + game.rnd.integerInRange(minObstacleGap,maxObstacleGap);
		addObstacle(nextObstaclePosition);
	}
}

function die(){
	localStorage.setItem("topFlappyScore",Math.max(score,topScore));
	game.state.start("Play");
}

function checkLanding(n,p){
	if(p.y>=n.y+n.height/2){
		var border = n.x-p.x;
		if(Math.abs(border)>20){
			n.body.velocity.x=border*2;
			n.body.velocity.y=-200;
		}
		var obstacleDiff = p.obstacleNumber-n.lastObstacle;
		if(obstacleDiff>0){
			score+= Math.pow(2,obstacleDiff);
			updateScore();
			n.lastObstacle= p.obstacleNumber;
		}
		if(wispJumping){
     	wispJumping = false;
     	game.input.onDown.add(prepareToJump, this);
    }
	} else {
		wispFallingDown = true;
		obstacleGroup.forEach(function(item) {
			item.body.velocity.x = 0;
		});
	}
}

Obstacle = function (game, x, y) {
	Phaser.Sprite.call(this, game, x, y, "obstacle");
	game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.immovable = true;
  this.obstacleNumber = placedObstacles;
};

Obstacle.prototype = Object.create(Phaser.Sprite.prototype);
Obstacle.prototype.constructor = Obstacle;
Obstacle.prototype.update = function() {
  if(wispJumping && !wispFallingDown){
       this.body.velocity.x = wispJumpPower;
  }
  else{
       this.body.velocity.x = 0;
  }
	if(this.x<-this.width){
		this.destroy();
		addNewObstacles();
	}
};
