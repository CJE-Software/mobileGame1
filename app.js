/*
Wrapping your code in an anonymous function like this prevents variable collision if it were to be integrated with another program, it also helps with security
*/
window.addEventListener('load', function() {

    /** @type {HTMLCanvasElement} */
    //initial JavaScript setup for canvas animation and Game Development *****START*****
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 1440;
    canvas.height = 720;
    //CANVAS_WIDTH = canvas.width = 800;
    //CANVAS_HEIGHT = canvas.height = 720;
    //initial JavaScript setup for canvas animation and Game Development *****END*****
    //image test
    //ctx.fillStyle = 'white';
    //ctx.fillRect(50, 50, 100, 150);
    //^should create a white rectangle at 50px x / 50px y, that is 100px wide / 150px height

    let enemies = [];
    let score = 0;
    let gameOver = false;
    const fullscreenButton = document.getElementById('fullscreenButton');

    class InputHandler {
        constructor() {
            this.keys = [];
            this.touchY = '';
            this.touchTreshold = 30; //how much swipe needed to perform a given action
            window.addEventListener('keydown', e => {
                if ((   e.key === 'ArrowDown' ||
                        e.key === 'ArrowUp' ||
                        e.key === 'ArrowLeft' ||
                        e.key === 'ArrowRight')
                        && this.keys.indexOf(e.key) === -1) {
                        this.keys.push(e.key);
                } else if (e.key === 'Enter' && gameOver) restartGame();
            });
            window.addEventListener('keyup', e => {
                if (    e.key === 'ArrowDown' ||
                        e.key === 'ArrowUp' ||
                        e.key === 'ArrowLeft' ||
                        e.key === 'ArrowRight') {
                    this.keys.splice(this.keys.indexOf(e.key), 1);
                }
            });
            window.addEventListener('touchstart', e => {
                this.touchY = e.changedTouches[0].pageY;
            });
            window.addEventListener('touchmove', e => {
                const swipeDistance = e.changedTouches[0].pageY - this.touchY;
                if (swipeDistance < -this.touchTreshold && this.keys.indexOf('swipe up') === -1) this.keys.push('swipe up');
                else if (swipeDistance > this.touchTreshold && this.keys.indexOf('swipe down') === -1) this.keys.push('swipe down');
                if (gameOver) restartGame();
            });
            window.addEventListener('touchend', e => {
                this.keys.splice(this.keys.indexOf('swipe up'), 1);
                this.keys.splice(this.keys.indexOf('swipe down'), 1);

            })
        }
    }

    class Player {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 200;
            this.height = 200;
            this.x = 100;
            this.y = this.gameHeight - this.height;
            this.image = document.getElementById('playerImage');
            this.frameX = 0;
            this.maxFrame = 8;
            this.frameY = 0;
            this.fps = 20;
            this.frameTimer = 0;
            this.frameInterval = 1000 / this.fps;
            this.speed = 0; //if pos move toon right if neg move toon left
            this.velocityY = 0; //vertical jump speed
            this.weight = 1; //gravity or opposing force to bring toon back down
        }
        restart() {
            this.x = 100;
            this.y = this.gameHeight - this.height;
            this.maxFrame = 8;
            this.frameY = 0;
        }
        draw(context) {
            //context.fillStyle = 'red';
            //context.fillRect(this.x, this.y, this.width, this.height);
            /* used for collision detection calibration!
            context.strokeStyle = 'red';
            context.strokeRect(this.x, this.y, this.width, this.height);
            context.beginPath();
            context.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
            context.stroke();
            context.strokeStyle = 'blue';
            context.beginPath();
            context.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
            context.stroke();
            */
            context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height);
        }
        update(input, deltaTime, enemies) {
            //collision detection between circles below
            enemies.forEach(enemy => {
                const dx = (enemy.x + enemy.width / 2 - 20) - (this.x + this.width / 2);
                const dy = (enemy.y + enemy.height / 2) - (this.y + this.height / 2 + 20);
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < enemy.width / 3 + this.width / 3) {
                    gameOver = true;
                }
            });
            //toon animation code
            if (this.frameTimer > this.frameInterval) {
                if (this.frameX >= this.maxFrame) this.frameX = 0;
                else this.frameX++;
                this.frameTimer = 0;
            } else {
                this.frameTimer += deltaTime;
            }
            if (input.keys.indexOf('ArrowRight') > -1) {
                this.speed = 5
            } else if (input.keys.indexOf('ArrowLeft') > -1) {
                this.speed = -5;
            } else if ((input.keys.indexOf('ArrowUp') > -1 || input.keys.indexOf('swipe up') > -1) && this.onGround()) {
                this.velocityY -= 33;
            } else {
                this.speed = 0;
            }
            //adds horizontal mvmnt to toon
            this.x += this.speed;
            if (this.x < 0) this.x = 0;
            else if (this.x > this.gameWidth - this.width) this.x = this.gameWidth - this.width;
            //vertical movement
            this.y += this.velocityY;
            if (!this.onGround()) {
                this.velocityY += this.weight;
                this.maxFrame = 5; //allows only 5 frames instead of 8 while jumping
                this.frameY = 1;
            } else {
                this.velocityY = 0;
                this.maxFrame = 8;
                this.frameY = 0;
            }
            if (this.y > this.gameHeight - this.height) this.y = this.gameHeight - this.height
        }
        onGround() {
            return this.y >= this.gameHeight - this.height;
            //this is a global utility method used to check if toon is on the ground
        }
    }

    class Background {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.image = document.getElementById('backgroundImage');
            this.x = 0;
            this.y = 0;
            this.width = 2400;
            this.height = 720;
            this.speed = 8;
        }
        draw(context) {
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
            context.drawImage(this.image, this.x + this.width - this.speed, this.y, this.width, this.height);

        }
        update() {
            this.x -= this.speed;
            if (this.x < 0 - this.width) this.x = 0;
        }
        restart() {
            this.x = 0;
        }
    }

    class Enemy {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 160;
            this.height = 119;
            this.image = document.getElementById('enemyImage');
            this.x = this.gameWidth;
            this.y = this.gameHeight - this.height;
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 5;
            this.fps = 20;
            this.frameTimer = 0;
            this.frameInterval = 1000 / this.fps;
            this.speed =  4; //you could Math.random() * 6 + 2; to have random enemy speeds
            this.markeForDeletion = false;
        }
        draw(context) {
            /*
            //used for collision detection calibration
            context.strokeStyle = 'red';
            context.strokeRect(this.x, this.y, this.width, this.height); //for collision etection between rectangles
            context.beginPath();
            context.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
            context.stroke();
            context.strokeStyle = 'blue';
            context.beginPath();
            context.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
            context.stroke();
            */
            context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height);
        }
        update(deltaTime) {
            if (this.frameTimer > this.frameInterval) {
                if (this.frameX >= this.maxFrame) this.frameX = 0;
                else this. frameX++;
                this.frameTimer = 0;
            } else {
                this.frameTimer += deltaTime;
            }
            this.x -= this.speed;
            if (this.x < 0 - this.width) {
                this.markeForDeletion = true;
                score++;
            }
        }
    }


    //enemies.push(new Enemy(canvas.width, canvas.height));


    function handleEnemies(deltaTime) {
        if (enemyTimer > enemyInterval + randomEnemyInterval) {
            enemies.push(new Enemy(canvas.width, canvas.height));
            randomEnemyInterval = Math.random() * 1000 + 500;
            enemyTimer = 0;
        } else {
            enemyTimer += deltaTime;
        }
        enemies.forEach(enemy => {
            enemy.draw(ctx);
            enemy.update(deltaTime);
        });
        enemies = enemies.filter(enemy => !enemy.markeForDeletion);
    }

    function displayStatusText(context) {
        context.textAlign = 'left';
        context.font = '40px Helvetica';
        context.fillStyle = 'red';
        context.fillText('Score: ' + score, 20, 50);
        context.fillStyle = 'black';
        context.fillText('Score: ' + score, 22, 52);
        if (gameOver) {
            context.textAlign = 'center';
            context.fillStyle = 'red';
            context.fillText('GAMEOVER, press ENTER or SWIPE DOWN to restart', canvas.width / 2, 200);
            context.textAlign = 'center';
            context.fillStyle = 'black';
            context.fillText('GAMEOVER, press ENTER or SWIPE DOWN to restart', canvas.width / 2 + 2, 202);
        }
    }

    function restartGame() {
        player.restart();
        background.restart();
        enemies = [];
        score = 0;
        gameOver = false;
        animate(0);
    }

    function toggleFullscreen() {
        console.log(document.fullscreenElement);
        if (!document.fullscreenElement) {
            canvas.requestFullscreen().catch(err => {
                alert(`Error, cannot enable fullscreen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }
    fullscreenButton.addEventListener('click', toggleFullscreen());

    const input = new InputHandler(); //by instantiating the code here all the code in the class called InputHandler() will be run ^.^
    const player = new Player(canvas.width, canvas.height);
    const background = new Background(canvas.width, canvas.height);
    //player.draw(ctx);

    let lastTime = 0;
    let enemyTimer = 0;
    let enemyInterval = 1000; //time in milliseconds
    let randomEnemyInterval = Math.random() * 1000 + 600;

    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        background.draw(ctx);
        background.update(); //<--commented out for now to conserve power auto scroll bg
        player.draw(ctx);
        player.update(input, deltaTime, enemies);
        handleEnemies(deltaTime);
        displayStatusText(ctx);
        if (!gameOver) requestAnimationFrame(animate);
    }
    animate(0);


});

/*
NOTES
console.log(e.changedTouches[0].pageY); <-- will console the location of touch events on mobile and touch devices
the 'JavaScript Fullscreen API' gives us methods that allow us to present a specific element and it's descendants in full screen mode, it will hide all browser user interface elements, sidebars, and other applications as long as full screen is active
document.fullscreenElement <---is a built in read only property on the document object that returns the element that is currently being presented in full screen mode, if it is 'null' it means full screen is not active
the '.requestFullscreen()' method is asynchronous and returns a promise which means you can chain '.then()' and '.catch()' methods to it
example:  canvas.requestFullscreen().then().catch()
to concatenate you use 'back ticks' this is known as 'template literal syntax refer to toggleFullscreen function for an example
'template literals' are delimited with backticks (` template literal string here ${ some javascript object or variable } `), template literals provide simpler syntax for embedding ${expressions} within strings, template literals can also do other things, they arent string literals and can't be used everywhere a string literal can be used

there is also the built in method 'document.exitFullscreen()' which will do as the name implies...exit fullscreen view mode
fullscreen cannot be enbaled on page load it can only be triggered by user events such as click or touch
to initiate the toggleFullscreen() function you can wrap the function inside of an eventListener ie: fullscreenButton.addEventListener('click', toggleFullscreen());

to draw a simple circle around an object on the canvas you can go inside of it's built in draw() method (assuming it has a draw() method on the class) and place this code inside the draw() method
CODE
    draw(context) {
        context.lineWidth = 5;
        context.strokeStyle = 'white';
        context.beginPath();
        context.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, Math.PI * 2);
        context.stroke();
        !extra code to draw the image associated with this class START!
        context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height);
        !extra code to draw the image associated with this class END!
    }
CODE
^^^the above code will draw a circle around the object, this is very useful for calibrating hit boxes when implementing 2d collision

2d circular collision algorithm and logic below:
CODE
    enemies.forEach(enemy => {
        const distanceX = (enemy.x + enemy.width/2) - (this.x + this.width/2);
        const distanceY = (enemy.y + enemy.height/2) - (this.y + this.height/2);
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
        if (distance < enemy.width/2 + this.width/2) {
            gameOver = true;
        }
    })
CODE
^^^the above code uses the pythagorean theorem to calculate the distance between one object and another, it does this by checking to see whether the distance between two objects is less than the some of their radii. so a circle with a diameter of 2inches(your character) and another circle with a diameter of 4 inches(an enemy) have a combined radii of (1(toon radius) + 2(enemy radius)) = 3inches... if the distance between the two circle objects ever reaches at or below 3inches then the objects have collided. this distance is checked for every frame of the game (on average 16 times per second and on native hardware with no delimiting variables 60 frames per second) object collision is compute intensive so be careful when adding collision mechanics to your games ESPECIALLY BROWSER GAMES as you do not have infinite compute resources) for object collision it is best to implement the logic on entire classes I.E. checking against your Player class and the Enemy class. if the environment of your game needs to be checked for collision ensure that the objects you will be checking for instances of collision are tightly associated with one another (uniform sizes across variables that can instigate collision logic)

context.arc(this.x + this.width/2, ?, ?, ?, ?) <---gives you the horizontal (coordinates) center point of player object

context.arc(?, this.y + this.height/2, ?, ?, ?) <---gives you the vertical (coordinates) center point of the character [if you were to add to this distance or subtract from this distance you can move the hit box up or down on the vertical axis] EXAMPLE context.arc(?, this.y + this.height/2 + 20, ?, ?, ?) <- would lower the hitbox by 20pixels on your character object, pushing your players hit box closer to the ground

context.arc(?, ?, this.width/2, ?, ?) <--- this is the radius of the collision circle of the player object [if you wanted the area of the collision circle to be smaller you could divide by a bigger number to create a smaller circle hence a small radius] EXAMPLE context.arc(?, ?, this.width/3, ?, ?) <- would create a smaller circle aka SMALLER HITBOX

context.arc(?, ?, ?, 0, ?) <---

context.arc(?, ?, ?, ?, Math.PI * 2) <---




*/
