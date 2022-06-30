import './style.css'

document.querySelector('#app').innerHTML = `
    <div class="game-over">
        Game Over
    </div>
    <div>
        <section class="widget">
            <div class="player-hp"><div class="player-hp-real"></div></div>
            <div class="timer">100</div>
            <div class="enemy-hp"><div class="enemy-hp-real"></div></div>
        </section>
        <canvas id="main-game"></canvas>
    </div>
`

const canvas = document.getElementById("main-game")
const ctx = canvas.getContext("2d")
const bg = new Image()
bg.src = "./images/background.png"
const playerHP = document.querySelector(".player-hp-real")
const enemyHP = document.querySelector(".enemy-hp-real")
const gameOver = document.querySelector(".game-over")
const timer = document.querySelector(".timer")
canvas.width = window.innerWidth
canvas.height = window.innerHeight
ctx.drawImage(bg, 0, 0, canvas.width, canvas.height + 156)
const gravity = 0.2
const fps = 45
const interval = 1000/fps
let lastTime2 = 0
let lastTime = 0

let keys = []

class Sprite {
    constructor({position, velocity, color = "red"}){
        this.position = position
        this.velocity = velocity
        this.height = 150
        this.width = 50
        this.color = color
        this.jump = "endJump"
        this.direction = "right"
        this.attackBox = {
            position: this.position,
            width: 100,
            height: 50
        }
        this.isAttack = false
        this.hitPoint = 100
    }

    draw(){
        ctx.fillStyle = this.color
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height)
    }

    attack(){
        if(this.isAttack){
            ctx.fillStyle = "green"
            if(this.direction === "right") {
                ctx.fillRect(
                    this.attackBox.position.x, 
                    this.attackBox.position.y, 
                    this.attackBox.width, 
                    this.attackBox.height
                )
            } else if (this.direction === "left") {
                ctx.fillRect(
                    this.attackBox.position.x - this.attackBox.width + this.width, 
                    this.attackBox.position.y, 
                    this.attackBox.width, 
                    this.attackBox.height
                )
            }
        }
    }

    update(){
        this.draw()
        var x = this.velocity.x
        var y = this.velocity.y
        if(keys[87]){
            if(this.jump == "endJump"){
                this.jump = "startJump"
            }
        } 
        if(this.jump == "startJump") {
            y = this.velocity.y < 0 ? this.velocity.y : -this.velocity.y
            this.position.y += y
        }
        if(this.position.y + this.height + gravity > canvas.height){
            y = 0
        } else if(this.position.y + y <= 400 && this.jump == "startJump") {
            y = 0
            this.jump = "onJump"
        } else {
            if(this.position.y + this.height + gravity + y >= canvas.height) this.jump = "endJump"
            this.position.y += gravity + y
            if (this.position.y + this.height >= canvas.height) this.position.y = canvas.height - this.height
        }
        if(keys[68]){
            x = Math.abs(this.velocity.x)
            this.direction = "right"
        } else if (keys[65]) {
            x = -this.velocity.x
            this.direction = "left"
        } 
        if(
            !keys[68] && 
            !keys[65] || 
            (
                this.position.x + x < 0 ||
                this.position.x + x + this.width > canvas.width
            )
        ) {
            x = 0
        }
        this.position.x += x
    }

}

let player = new Sprite({
    position: {
        x: canvas.width / 4 - 50,
        y: canvas.height - 200
    },
    velocity: {
        x: 10,
        y: 10
    },
    color: "blue"
})

let enemy = new Sprite({
    position: {
        x: canvas.width * 3 / 4 - 50, 
        y: canvas.height - 200
    },
    velocity: {
        x: 10,
        y: 10
    },
    color: "red"
})

enemy.update = () => {
    enemy.draw()
    var x = enemy.velocity.x
    var y = enemy.velocity.y
    if(keys[38]){
        if(enemy.jump == "endJump"){
            enemy.jump = "startJump"
        }
    } 
    if(enemy.jump == "startJump") {
        y = enemy.velocity.y < 0 ? enemy.velocity.y : -enemy.velocity.y
        enemy.position.y += y
    }
    if(enemy.position.y + enemy.height + gravity >= canvas.height){
        y = 0
    } else if(enemy.position.y + y <= 400 && enemy.jump == "startJump") {
        y = 0
        enemy.jump = "onJump"
    } else {
        enemy.position.y += gravity + y
        if(enemy.position.y + enemy.height + gravity + y >= canvas.height) enemy.jump = "endJump"
        if (enemy.position.y + enemy.height >= canvas.height) enemy.position.y = canvas.height - enemy.height
    }
    if(keys[39]){
        x = Math.abs(enemy.velocity.x)
        enemy.direction = "right"
    } else if (keys[37]) {
        x = -enemy.velocity.x
        enemy.direction = "left"
    } 
    if(
        !keys[39] && 
        !keys[37] || 
        (
            enemy.position.x + x < 0 ||
            enemy.position.x + x + enemy.width > canvas.width
        )
    ) {
        x = 0
    }
    enemy.position.x += x
}

function animate(timeStamp){
    var deltaTime = timeStamp - lastTime
    var deltaTime2 = timeStamp - lastTime2
    if(deltaTime2 >= 1000) {
        timer.innerText = new String(parseInt(timer.innerText) - 1)
        lastTime2 = timeStamp
        if(timer.innerText === "0"){
            gameOverF("Draw")
        }
    }
    if(deltaTime > interval){
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(bg, 0, 0, canvas.width, canvas.height + 156)
        player.draw()
        player.update()
        player.attack()
        enemy.draw()
        enemy.update()
        enemy.attack()
        lastTime = timeStamp
    }
    window.requestAnimationFrame(animate)
}

animate(0)

window.addEventListener("keydown", keyDown)

function keyDown(e) {
    if(e.keyCode !== 32 && e.keyCode !== 13) keys[e.keyCode] = true
}

window.addEventListener("keyup", keyUp)

function keyUp(e){
    delete keys[e.keyCode]
    if(e.keyCode === 81) {
        if(gameOver.classList.contains("active")){
            gameOver.classList.remove("active") 
            restart()
        }
    }
    if(e.keyCode === 32 || e.keyCode === 13){
        if(e.keyCode === 13){
            enemy.isAttack = true
            setTimeout(() => enemy.isAttack = false, 100)
        }
        if(e.keyCode === 32){
            player.isAttack = true
            setTimeout(() => player.isAttack = false, 100)
        }
        if(
            ( player.isAttack ) && 
            (
                (
                    player.attackBox.position.x < enemy.position.x + enemy.width &&
                    player.attackBox.position.x + player.attackBox.width > enemy.position.x &&
                    player.attackBox.position.y < enemy.position.y + enemy.height &&
                    player.attackBox.position.y + player.attackBox.height > enemy.position.y &&
                    player.direction === "right"
                ) ||
                (
                    player.attackBox.position.x - player.attackBox.width + player.width < enemy.position.x + enemy.width &&
                    player.attackBox.position.x - player.attackBox.width + player.width + player.attackBox.width > enemy.position.x &&
                    player.attackBox.position.y < enemy.position.y + enemy.height &&
                    player.attackBox.position.y + player.attackBox.height > enemy.position.y &&
                    player.direction === "left"
                )
            )
        ) {
            if((enemyHP.offsetWidth - (document.querySelector(".enemy-hp").offsetWidth * 10 / 100)) > 0) {
                enemyHP.style.width = (enemyHP.offsetWidth - (document.querySelector(".enemy-hp").offsetWidth * 10 / 100)) + "px"
            } else {
                enemyHP.style.width = 0 + "px"
                gameOverF("Player 1 win")
            }
        }
        if(
            ( enemy.isAttack ) && 
            (
                (
                    enemy.attackBox.position.x < player.position.x + player.width &&
                    enemy.attackBox.position.x + player.attackBox.width > player.position.x &&
                    enemy.attackBox.position.y < player.position.y + player.height &&
                    enemy.attackBox.position.y + player.attackBox.height > player.position.y &&
                    enemy.direction === "right"
                ) ||
                (
                    enemy.attackBox.position.x - enemy.attackBox.width + enemy.width < player.position.x + player.width &&
                    enemy.attackBox.position.x - enemy.attackBox.width + enemy.width + enemy.attackBox.width > player.position.x &&
                    enemy.attackBox.position.y < player.position.y + player.height &&
                    enemy.attackBox.position.y + enemy.attackBox.height > player.position.y &&
                    enemy.direction === "left"
                )
            )
        ) {
            if((playerHP.offsetWidth - (document.querySelector(".player-hp").offsetWidth * 10 / 100)) > 0) {
                playerHP.style.width = (playerHP.offsetWidth - (document.querySelector(".player-hp").offsetWidth * 10 / 100)) + "px"
            } else {
                playerHP.style.width = 0 + "px"
                gameOverF("Player 2 win")
            }
        }
    }

}

function restart(){
    keys = []
    window.removeEventListener("keyup", keyUp)
    window.addEventListener("keydown", keyDown)
    window.addEventListener("keyup", keyUp)
    player = new Sprite({
    position: {
        x: canvas.width / 4 - 50,
        y: canvas.height - 200
    },
    velocity: {
        x: 10,
        y: 10
    },
    color: "blue"
})

enemy = new Sprite({
    position: {
        x: canvas.width * 3 / 4 - 50, 
        y: canvas.height - 200
    },
    velocity: {
        x: 10,
        y: 10
    },
    color: "red"
})

enemy.update = () => {
    enemy.draw()
    var x = enemy.velocity.x
    var y = enemy.velocity.y
    if(keys[38]){
        if(enemy.jump == "endJump"){
            enemy.jump = "startJump"
        }
    } 
    if(enemy.jump == "startJump") {
        y = enemy.velocity.y < 0 ? enemy.velocity.y : -enemy.velocity.y
        enemy.position.y += y
    }
    if(enemy.position.y + enemy.height + gravity >= canvas.height){
        y = 0
    } else if(enemy.position.y + y <= 400 && enemy.jump == "startJump") {
        y = 0
        enemy.jump = "onJump"
    } else {
        enemy.position.y += gravity + y
        if(enemy.position.y + enemy.height + gravity + y >= canvas.height) enemy.jump = "endJump"
    }
    if(keys[39]){
        x = Math.abs(enemy.velocity.x)
        enemy.direction = "right"
    } else if (keys[37]) {
        x = -enemy.velocity.x
        enemy.direction = "left"
    } 
    if(
        !keys[39] && 
        !keys[37] || 
        (
            enemy.position.x + x < 0 ||
            enemy.position.x + x + enemy.width > canvas.width
        )
    ) {
        x = 0
    }
    enemy.position.x += x
}
    timer.innerText = "100"
    playerHP.style.width = "100%"
    enemyHP.style.width = "100%"
}

function gameOverF(title){
    window.removeEventListener("keydown", keyDown)
    window.removeEventListener("keyup", keyUp)
    window.addEventListener("keyup", e => {
        if(e.keyCode === 81){
            if(gameOver.classList.contains("active")){
                gameOver.classList.remove("active")
                restart()
            }
        }
    })
    gameOver.innerText = title
    gameOver.classList.add("active")
}
