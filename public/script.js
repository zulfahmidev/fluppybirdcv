var video = document.getElementById('video');
let cvs = document.querySelector('canvas');
let ctx = cvs.getContext('2d');
let width = cvs.width = window.innerWidth;
let height = cvs.height = window.innerHeight;
video.width = cvs.width * 0.2;
video.height = cvs.height * 0.2;
let model;


let bird = {
    x: 150,
    y: height/2,
}

let target_pos = {
    x: 150,
    y: height/2,
}

let point = 0;

let pipes = []

let gameOver = false;

let bg = new Image();
bg.src = "assets/sprites/background-day.png";
let pipeImage = new Image();
pipeImage.src = "assets/sprites/pipe-green.png";
let birdImage = new Image();
birdImage.src = "assets/sprites/yellowbird-downflap.png";


function render() {
    if (!gameOver) {

        ctx.clearRect(0, 0, width, height);

        drawPipes();
        drawBird();
        document.querySelector('#point_score').innerHTML = point;
    }
    requestAnimationFrame(render);
}

let cpipe = null;
function drawPipes() {
    let pipeHeight = height - 300;
    let pipeWidth = 100;
    let pipeGap = 300;
    let speed = 10;

    pipes.forEach((pipe, i) => {
        ctx.save();
        ctx.scale(1, -1);
        ctx.drawImage(pipeImage, pipe.x, -pipe.y, pipeWidth, pipeHeight)
        ctx.restore();

        ctx.drawImage(pipeImage, pipe.x, pipe.y + pipeGap, pipeWidth, pipeHeight)

        pipe.x -= speed;

        if (bird.x + 60 > pipe.x && bird.x < pipe.x + pipeWidth) {
            if (bird.y + 50 > pipe.y && bird.y < pipe.y + pipeGap) {
                if (cpipe == null) {
                    point++;
                    cpipe = pipe;
                }
                if (cpipe != pipe) {
                    point++;
                    cpipe = pipe;
                }
            }else {
                gameOver = true;
                alert('Permainan Selesai, Tekan Ok Jika Ingin Bermain Kembali!')
                location.reload();
            }
        }

        if (pipe.x < -100) {
            pipes.splice(i, 1);
        }
    })
}

async function detectPosition() {
    if ( video.readyState === 4 ) {
        // console.log('a')

        await model.detect(video).then(predictions => {
            if (predictions.length > 0) {
                let prediction = predictions[0];
    
                if (prediction) {
                    if (prediction.label == 'open') {
                        let box = prediction.bbox;
                        if (box) {
                            target_pos.y = ((box[1] + (box[3]/2)) * 7) - 200;
                        }
                    }
                }
            }
        });
    }
}

function drawBird() {
    if (bird.x && bird.y) {

        if (bird.x != target_pos.x || bird.y != target_pos.y) {
            let x = target_pos.x - bird.x;
            let y = target_pos.y - bird.y;
            bird.x += x/10;
            bird.y += y/10;

        }
        ctx.beginPath();
        ctx.drawImage(birdImage, bird.x, bird.y, 60, 50)

    }
}

handTrack.load().then(m => { 
    model = m;
    render();

    setInterval(detectPosition, 100)

    setInterval(() => {
        pipes.push({
            x: width,
            y: 100 + (Math.random() * (height-400)),
        })
    }, 5000)
});

navigator.mediaDevices.enumerateDevices().then((devices) => {
    let deviceId = devices[1].deviceId;
    navigator.mediaDevices.getUserMedia({audio: false, video: {facingMode: 'user', deviceId}})
    .then(function(stream) { video.srcObject = stream; });
})