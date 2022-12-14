var config = {
    type: Phaser.WEBGL,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    backgroundColor: '#2d2d2d',
    parent: 'phaser-example',
    scene: {
        preload: preload,
        create: create,
        update: update,
        extend: {
            player: null,
            healthpoints: null,
            playerBullets: null,
            time: 0,
        }
    }
};

var bullets;
var turret;
var speed;
var stats;
var lastFired = 0;
var isDown = false;
var mouseX = 0;
var mouseY = 0;

var game = new Phaser.Game(config);

function preload() {
    this.load.image('turret', 'assets/sprites/turret.png');
    this.load.image('bullet1', 'assets/sprites/bullet.png');
    this.load.image('background', 'assets/background/bg1.jpg');
    this.load.image('enemy', 'assets/sprites/enemy.png');

}

function create() {
    var Bullet = new Phaser.Class({

        Extends: Phaser.GameObjects.Image,

        initialize:

            function Bullet(scene) {
                Phaser.GameObjects.Image.call(this, scene, 0, 0, 'bullet1');

                this.incX = 0;
                this.incY = 0;
                this.lifespan = 0;
                this.setSize(12, 12, true);
                this.speed = Phaser.Math.GetSpeed(600, 1);
            },

        fire: function (x, y) {
            this.setActive(true);
            this.setVisible(true);

            //  Bullets fire from the middle of the screen to the given x/y
            this.setPosition(400, 300);

            var angle = Phaser.Math.Angle.Between(x, y, 400, 300);

            this.setRotation(angle);

            this.incX = Math.cos(angle);
            this.incY = Math.sin(angle);

            this.lifespan = 1000;
        },

        update: function (time, delta) {
            this.lifespan -= delta;

            this.x -= this.incX * (this.speed * delta);
            this.y -= this.incY * (this.speed * delta);

            if (this.lifespan <= 0) {
                this.setActive(false);
                this.setVisible(false);
            }
        }

    });

    bullets = this.add.group({
        classType: Bullet,
        maxSize: 5,
        runChildUpdate: true
    });

    turret = this.add.sprite(400, 300, 'turret').setDepth(1);
    enemy = this.physics.add.sprite(300, 600, 'enemy');


    enemy.setDisplaySize(120, 120).setCollideWorldBounds(true);

    // Set sprite variables
    //player.health = 3;
    enemy.health = 3;


    this.input.on('pointerdown', function (pointer) {

        isDown = true;
        mouseX = pointer.x;
        mouseY = pointer.y;

    });

    this.input.on('pointermove', function (pointer) {

        mouseX = pointer.x;
        mouseY = pointer.y;

    });

    this.input.on('pointerup', function (pointer) {

        isDown = false;

    });

}

function update(time, delta) {

    if (isDown && time > lastFired) {
        var bullet = bullets.get();

        if (bullet) {
            bullet.fire(mouseX, mouseY);
            this.physics.add.collider(enemy, bullet, enemyHitCallback);
            console.log("Enemy hp: ", enemy.health);

            lastFired = time + 50;
        }
    }

    turret.setRotation(Phaser.Math.Angle.Between(mouseX, mouseY, turret.x, turret.y) - Math.PI / 2);

}

function enemyHitCallback(enemyHit, bulletHit) {
    // Reduce health of enemy
    if (bulletHit.active === true && enemyHit.active === true) {
        enemyHit.health = enemyHit.health - 1;
        console.log("Enemy hp: ", enemyHit.health);

        // Kill enemy if health <= 0
        if (enemyHit.health <= 0) {
            enemyHit.setActive(false).setVisible(false);
        }

        // Destroy bullet
        bulletHit.setActive(false).setVisible(false);
    }
}