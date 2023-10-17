// Global Variables
var DIRECTION = {
    IDLE: 0,
    UP: 1,
    DOWN: 2,
    LEFT: 3,
    RIGHT: 4
};
 
var rounds = [5, 5, 3];
 
// The ball object (The cube that bounces back and forth)
var Ball = {
    new: function (incrementedSpeed) {
        return {
            width: 18,
            height: 18,
            x: (this.canvas.width / 2) - 9,
            y: (this.canvas.height / 2) - 9,
            moveX: DIRECTION.IDLE,
            moveY: DIRECTION.IDLE,
            speed: incrementedSpeed || 10
        };
    }
};
 
// The ai object (The two lines that move up and down)
var Ai = {
    new: function (side) {
        return {
            width: 18,
            height: 180,
            x: side === 'left' ? 150 : this.canvas.width - 150,
            y: (this.canvas.height / 2) - 35,
            score: 0,
            move: DIRECTION.IDLE,
            speed: 15
        };
    }
};
 
var Game = {
    initialize: function () {
        this.canvas = document.querySelector('canvas');
        this.context = this.canvas.getContext('2d');
 
        this.canvas.width = 1400;
        this.canvas.height = 1000;
 
        this.canvas.style.width = (900) + 'px';
        this.canvas.style.height = (600) + 'px';
 
        this.player1 = Ai.new.call(this, 'left');
        this.player2 = Ai.new.call(this, 'right');
        this.ball = Ball.new.call(this);
 
        this.running = this.over = false;
        this.turn = this.player2;
        this.timer = this.round = 0;
        this.color = 'black';
 
        Pong.menu();
        Pong.listen();
    },
 
    endGameMenu: function (text) {
        // Change the canvas font size and color
        Pong.context.font = '45px Courier New';
        Pong.context.fillStyle = this.color;
 
        // Draw the rectangle behind the 'Press any key to begin' text.
        Pong.context.fillRect(
            Pong.canvas.width / 2 - 350,
            Pong.canvas.height / 2 - 48,
            700,
            100
        );
 
        // Change the canvas color;
        Pong.context.fillStyle = '#ffffff';
 
        // Draw the end game menu text ('Game Over' and 'Winner')
        Pong.context.fillText(text,
            Pong.canvas.width / 2,
            Pong.canvas.height / 2 + 15
        );
 
        setTimeout(function () {
            Pong = Object.assign({}, Game);
            Pong.initialize();
        }, 3000);
    },
 
    menu: function () {
        // Draw all the Pong objects in their current state
        Pong.draw();
 
        // Change the canvas font size and color
        this.context.font = '50px Courier New';
        this.context.fillStyle = this.color;
 
        // Draw the rectangle behind the 'Press any key to begin' text.
        this.context.fillRect(
            this.canvas.width / 2 - 350,
            this.canvas.height / 2 - 48,
            700,
            100
        );
 
        // Change the canvas color;
        this.context.fillStyle = '#ffffff';
 
        // Draw the 'press any key to begin' text
        this.context.fillText('Press any key to begin',
            this.canvas.width / 2,
            this.canvas.height / 2 + 15
        );
    },
 
    // Update all objects (move the player1, ai, ball, increment the score, etc.)
    update: function () {
        if (!this.over) {
            // If the ball collides with the bound limits - correct the x and y coords.
            if (this.ball.x <= 0) Pong._resetTurn.call(this, this.player2, this.player1);
            if (this.ball.x >= this.canvas.width - this.ball.width) Pong._resetTurn.call(this, this.player1, this.player2);
            if (this.ball.y <= 0) this.ball.moveY = DIRECTION.DOWN;
            if (this.ball.y >= this.canvas.height - this.ball.height) this.ball.moveY = DIRECTION.UP;
 
            // Move player1 if they player1.move value was updated by a keyboard event
            if (this.player1.move === DIRECTION.UP) this.player1.y -= this.player1.speed;
            else if (this.player1.move === DIRECTION.DOWN) this.player1.y += this.player1.speed;

            // Move player2 if they player1.move value was updated by a keyboard event
            if (this.player2.move === DIRECTION.UP) this.player2.y -= this.player2.speed;
            else if (this.player2.move === DIRECTION.DOWN) this.player2.y += this.player2.speed;
 
            // On new serve (start of each turn) move the ball to the correct side
            // and randomize the direction to add some challenge.
            if (Pong._turnDelayIsOver.call(this) && this.turn) {
                this.ball.moveX = this.turn === this.player1 ? DIRECTION.LEFT : DIRECTION.RIGHT;
                this.ball.moveY = [DIRECTION.UP, DIRECTION.DOWN][Math.round(Math.random())];
                this.ball.y = Math.floor(Math.random() * this.canvas.height - 200) + 200;
                this.turn = null;
            }
 
            // If the player1 collides with the bound limits, update the x and y coords.
            if (this.player1.y <= 0) this.player1.y = 0;
            else if (this.player1.y >= (this.canvas.height - this.player1.height)) this.player1.y = (this.canvas.height - this.player1.height);
 
            // Move ball in intended direction based on moveY and moveX values
            if (this.ball.moveY === DIRECTION.UP) this.ball.y -= (this.ball.speed / 1.5);
            else if (this.ball.moveY === DIRECTION.DOWN) this.ball.y += (this.ball.speed / 1.5);
            if (this.ball.moveX === DIRECTION.LEFT) this.ball.x -= this.ball.speed;
            else if (this.ball.moveX === DIRECTION.RIGHT) this.ball.x += this.ball.speed;
 
            // Handle player2 wall collision
            if (this.player2.y >= this.canvas.height - this.player2.height) this.player2.y = this.canvas.height - this.player2.height;
            else if (this.player2.y <= 0) this.player2.y = 0;
 
            // Handle player1-Ball collisions
            if (this.ball.x - this.ball.width <= this.player1.x && this.ball.x >= this.player1.x - this.player1.width) {
                if (this.ball.y <= this.player1.y + this.player1.height && this.ball.y + this.ball.height >= this.player1.y) {
                    this.ball.x = (this.player1.x + this.ball.width);
                    this.ball.moveX = DIRECTION.RIGHT;
 
                }
            }
 
            // Handle player2-ball collision
            if (this.ball.x - this.ball.width <= this.player2.x && this.ball.x >= this.player2.x - this.player2.width) {
                if (this.ball.y <= this.player2.y + this.player2.height && this.ball.y + this.ball.height >= this.player2.y) {
                    this.ball.x = (this.player2.x - this.ball.width);
                    this.ball.moveX = DIRECTION.LEFT;
 
                }
            }
        }
 
        // Handle the end of round transition
        // Check to see if the player1 won the round.
        if (this.player1.score === rounds[this.round]) {
            // Check to see if there are any more rounds/levels left and display the victory screen if
            // there are not.
            if (!rounds[this.round + 1]) {
                this.over = true;
                setTimeout(function () { Pong.endGameMenu('Player One Win!'); }, 1000);
            } else {
                // If there is another round, reset all the values and increment the round number.
                this.player1.score = this.player2.score = 0;
                this.player1.speed += 0.5;
                this.player2.speed += 0.5;
                
                this.ball.speed += 1;
                this.round += 1;
 
            }
        }
        // Check to see if the player2 has won the round.
        else if (this.player2.score === rounds[this.round]) {
            if (!rounds[this.round + 1]) {
                this.over = true;
                setTimeout(function () { Pong.endGameMenu('Player Two Win!'); }, 1000);
            } else {
                // If there is another round, reset all the values and increment the round number.
                this.player1.score = this.player2.score = 0;
                this.player1.speed += 0.5;
                this.player2.speed += 0.5;
                
                this.ball.speed += 1;
                this.round += 1;
 
            }
        }
    },
 
    // Draw the objects to the canvas element
    draw: function () {
        // Clear the Canvas
        this.context.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );
 
        // Set the fill style to black
        this.context.fillStyle = this.color;
 
        // Draw the background
        this.context.fillRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );
 
        // Set the fill style to white (For the paddles and the ball)
        this.context.fillStyle = '#ffffff';
 
        // Draw the player1
        this.context.fillRect(
            this.player1.x,
            this.player1.y,
            this.player1.width,
            this.player1.height
        );
 
        // Draw the player2
        this.context.fillRect(
            this.player2.x,
            this.player2.y,
            this.player2.width,
            this.player2.height 
        );
 
        // Draw the Ball
        if (Pong._turnDelayIsOver.call(this)) {
            this.context.fillRect(
                this.ball.x,
                this.ball.y,
                this.ball.width,
                this.ball.height
            );
        }
 
        // Draw the net (Line in the middle)
        this.context.beginPath();
        this.context.setLineDash([7, 15]);
        this.context.moveTo((this.canvas.width / 2), this.canvas.height - 140);
        this.context.lineTo((this.canvas.width / 2), 140);
        this.context.lineWidth = 10;
        this.context.strokeStyle = '#ffffff';
        this.context.stroke();
 
        // Set the default canvas font and align it to the center
        this.context.font = '80px Courier New';
        this.context.textAlign = 'center';
 
        // Draw the player1 score (left)
        this.context.fillText(
            this.player1.score.toString(),
            (this.canvas.width / 2) - 300,
            200
        );
 
        // Draw the player2 score (right)
        this.context.fillText(
            this.player2.score.toString(),
            (this.canvas.width / 2) + 300,
            200
        );
 
        // Change the font size for the center score text
        this.context.font = '30px Courier New';
 
        // Draw the winning score (center)
        this.context.fillText(
            'Player 1      ' + 'Round ' + (Pong.round + 1) + '      Player 2',
            (this.canvas.width / 2),
            35
        );
 
        // Change the font size for the center score value
        this.context.font = '40px Courier';
 
        // Draw the current round number
        this.context.fillText(
            rounds[Pong.round] ? rounds[Pong.round] : rounds[Pong.round - 1],
            (this.canvas.width / 2),
            100
        );
    },
 
    loop: function () {
        Pong.update();
        Pong.draw();
 
        // If the game is not over, draw the next frame.
        if (!Pong.over) requestAnimationFrame(Pong.loop);
    },
 
    listen: function () {
        document.addEventListener('keydown', function (key) {
            // Handle the 'Press any key to begin' function and start the game.
            if (Pong.running === false) {
                Pong.running = true;
                window.requestAnimationFrame(Pong.loop);
            }
 
            // Handle w key events
            if (key.keyCode === 87) Pong.player1.move = DIRECTION.UP;
 
            // Handle s key events
            if (key.keyCode === 83) Pong.player1.move = DIRECTION.DOWN;

            // Handle up key events
            if (key.keyCode === 38 ) Pong.player2.move = DIRECTION.UP;
 
            // Handle down  key events
            if (key.keyCode === 40) Pong.player2.move = DIRECTION.DOWN;
        });
 
        // Stop the player1 from moving when there are no keys being pressed.
        document.addEventListener('keyup', function (key) { Pong.player1.move = DIRECTION.IDLE; });
        document.addEventListener('keyup', function (key) { Pong.player2.move = DIRECTION.IDLE; });
    },
 
    // Reset the ball location, the player1 turns and set a delay before the next round begins.
    _resetTurn: function(victor, loser) {
        this.ball = Ball.new.call(this, this.ball.speed);
        this.turn = loser;
        this.timer = (new Date()).getTime();
 
        victor.score++;
    },
 
    // Wait for a delay to have passed after each turn.
    _turnDelayIsOver: function() {
        return ((new Date()).getTime() - this.timer >= 1000);
    },
 
};
 
var Pong = Object.assign({}, Game);
Pong.initialize();