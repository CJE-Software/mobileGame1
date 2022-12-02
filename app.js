/*
Wrapping your code in an anonymous function like this prevents variable collision if it were to be integrated with another program, it also helps with security
*/
window.addEventListener('load', function() {

    /** @type {HTMLCanvasElement} */
    //initial JavaScript setup for canvas animation and Game Development *****START*****
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
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

    class InputHandler {
        constructor() {
            this.keys = [];
            window.addEventListener('keydown', e => {
                if ((   e.key === 'ArrowDown' ||
                        e.key === 'ArrowUp' ||
                        e.key === 'ArrowLeft' ||
                        e.key === 'ArrowRight')
                        && this.keys.indexOf(e.key) === -1) {
                        this.keys.push(e.key);
                }
            });
            window.addEventListener('keyup', e => {
                if (    e.key === 'ArrowDown' ||
                        e.key === 'ArrowUp' ||
                        e.key === 'ArrowLeft' ||
                        e.key === 'ArrowRight') {
                    this.keys.splice(this.keys.indexOf(e.key), 1);
                }
            });
        }
    }

    class Player {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 200;
            this.height = 200;
            this.x = 0;
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
                const dx = (enemy.x + enemy.width / 10) - (this.x + this.width / 10);
                const dy = (enemy.y + enemy.height / 10) - (this.y + this.height / 10);
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < enemy.width / 2.8 + this.width / 2.8) {
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
            } else if (input.keys.indexOf('ArrowUp') > -1 && this.onGround()) {
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
        context.font = '40px Helvetica';
        context.fillStyle = 'red';
        context.fillText('Score: ' + score, 20, 50);
        context.fillStyle = 'black';
        context.fillText('Score: ' + score, 22, 52);
        if (gameOver) {
            context.textAlign = 'center';
            context.fillStyle = 'red';
            context.fillText('GAMEOVER', canvas.width / 2, 200);
            context.textAlign = 'center';
            context.fillStyle = 'black';
            context.fillText('GAMEOVER', canvas.width / 2 + 2, 202);
        }
    }

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