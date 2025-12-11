function toggleCode(element) {
    element.classList.toggle('open');
}

/* ============================== */
/*          7.  3-1 벽면           */
/* ============================== */
const sketch7 = (p) => {
    let sdf;
    p.setup = () => {
        let container = document.getElementById('canvas-7');
        if (container) {
            p.createCanvas(container.offsetWidth, container.offsetHeight, p.WEBGL).parent('canvas-7');
        } else {
            p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
        }
        p.pixelDensity(1);
        sdf = p.createShaderPark(shaderParkCode, {
            scale: 0.8,
            drawGeometry: () => p.sphere(170)
        });
    };
    p.draw = () => {
        p.background(255);
        p.noStroke();
        p.orbitControl();
        p.translate(0, -50, 0);
        p.scale(3);
        p.push();
        sdf.draw();
        p.pop();
    };

    p.windowResized = () => {
        let c = document.getElementById('canvas-7');
        p.resizeCanvas(c.offsetWidth, c.offsetHeight);
    };

    function shaderParkCode() {
        let p = enable2D();
        p = vec2(p.x, p.y);

        let radians = 0.017453292519943295;
        const zoom = 40;
        const brightness = 0.975;
        let fScale = 1.25;

        function cosRange(degrees, range, minimum) {
            return (((1.0 + cos(degrees * radians)) * 0.5) * range) + minimum;
        }

        let t = time;
        let uv = vec2(p.x, p.y);
        let ct = cosRange(t * 5.0, 3.0, 1.1);
        let xBoost = cosRange(t * 0.2, 5.0, 5.0);
        let yBoost = cosRange(t * 0.1, 10.0, 5.0);
        fScale = cosRange(t * 15.5, 1.25, 0.5);

        for (let i = 1; i < zoom; i++) {
            let _i = 1.0 * i;
            let newp = p;
            newp.x += 0.25 / _i * sin(_i * p.y + t * cos(ct) * 0.5 / 20.0 + 0.005 * _i) * fScale + xBoost;
            newp.y += 0.25 / _i * sin(_i * p.x + t * ct * 0.3 / 40.0 + 0.03 * i + 15) * fScale + yBoost;
            p = newp;
        }

        let newColor = vec3(0.5 * sin(3.0 * p.x) + 0.5, 0.5 * sin(3.0 * p.y) + 0.5, sin(p.x + p.y));
        newColor *= brightness;

        let vigAmt = 5.0;
        let vignette = (1. - vigAmt * (uv.y - .5) * (uv.y - .5)) * (1. - vigAmt * (uv.x - .5) * (uv.x - .5));
        let extrusion = (newColor.x + newColor.y + newColor.z) / 4.0;
        extrusion *= 1.5;
        extrusion *= vignette;

        color(newColor);
    }
};



/* ============================== */
/*          8.  4-1 벽면           */
/* ============================== */
const sketch8 = (p) => {
    let mic;
    let circles = [];

    p.setup = () => {
        let container = document.getElementById('canvas-8');
        if (container) {
            p.createCanvas(container.offsetWidth, container.offsetHeight).parent('canvas-8');
        } else {
            p.createCanvas(p.windowWidth, p.windowHeight);
        }

        mic = new p5.AudioIn();
        mic.start();
        p.noStroke();
    };

    p.draw = () => {
        p.background(255);
        let vol = mic.getLevel();
        let probability = p.map(vol, 0, 1, 0, 1);
        let numCircles = p.floor(p.map(vol, 0, 1, 1, 10));

        for (let j = 0; j < numCircles; j++) {
            if (p.random() < probability) {
                let x = p.random(p.width);
                let y = p.random(p.height);
                let d = p.random(100, 200);
                let growth = p.random(2, 5);
                let alpha = 100;
                let fillColor = p.color(p.random(255), p.random(255), p.random(255));

                circles.push({ x, y, diameter: d, growth, alpha, fillColor });
            }
        }

        for (let i = 0; i < circles.length; i++) {
            let circle = circles[i];
            circle.diameter += circle.growth;
            circle.alpha = p.constrain(circle.alpha - 2, 0, 100);
            p.fill(circle.fillColor.levels[0], circle.fillColor.levels[1], circle.fillColor.levels[2], circle.alpha);
            p.ellipse(circle.x, circle.y, circle.diameter, circle.diameter);
            if (circle.alpha <= 0) {
                circles.splice(i, 1);
                i--;
            }
        }
    };

    p.mousePressed = () => {
        if (p.getAudioContext().state !== 'running') {
            p.userStartAudio();
        }
    };

    p.windowResized = () => {
        let c = document.getElementById('canvas-8');
        p.resizeCanvas(c.offsetWidth, c.offsetHeight);
    };
};



/* ============================== */
/*          9.  4-2 벽면           */
/* ============================== */
const sketch9 = (p) => {
    let canvas;
    let message = '흥';
    let font;
    let fontFile = "Assets/NanumGothic.ttf";
    let fontSize = 85;

    let textData = [];
    let dotsCoordinate = [];
    let particles = [];
    let scaleRate;

    let inpactRange = 120;
    let isMousePressed = false;
    let mic;

    p.preload = () => {
        font = p.loadFont(fontFile);
    };

    class Particle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.r = 2;
            this.originalX = x;
            this.originalY = y;
            this.colors = ["#A71C1C", "#A71C1C", "#A71C1C",
                "#032A53", "#032A53", "#032A53",
                "#e5e1dc", "#e5e1dc",
                "#70B18D", "#33614A", "#f3a712"];
            this.color = p.random(this.colors);
            this.density = p.random(30) + 10;
            this.amplitude = p.random(40) + 10;
        }

        draw() {
            let level = mic ? mic.getLevel() : 0;
            let particleSize = this.r + this.amplitude * (3 * level);
            p.fill(this.color);
            p.circle(this.x, this.y, particleSize * 2);
        }

        update() {
            let distanceFromMouse = Math.sqrt((this.x - p.mouseX) ** 2 + (this.y - p.mouseY) ** 2);
            let distanceToOrigin = Math.sqrt((this.originalX - this.x) ** 2 + (this.originalY - this.y) ** 2);

            if (isMousePressed) {
                if (distanceFromMouse < inpactRange) {
                    let repulsionAngle = Math.atan2(this.y - p.mouseY, this.x - p.mouseX);
                    let repulsionForce = (inpactRange - distanceFromMouse) / inpactRange * this.density;
                    this.x += Math.cos(repulsionAngle) * repulsionForce;
                    this.y += Math.sin(repulsionAngle) * repulsionForce;
                }
            } else {
                let attractionAngle = Math.atan2(this.originalY - this.y, this.originalX - this.x);
                let attractionForce = Math.abs(distanceToOrigin) / this.density;
                this.x += Math.cos(attractionAngle) * attractionForce;
                this.y += Math.sin(attractionAngle) * attractionForce;
            }
        }
    }

    p.setup = () => {
        let container = document.getElementById('canvas-9');
        if (container) {
            canvas = p.createCanvas(container.offsetWidth, container.offsetHeight);
            canvas.parent('canvas-9');
        } else {
            canvas = p.createCanvas(p.windowWidth, p.windowHeight);
        }
        p.colorMode(p.HSL);
        p.noStroke();
        if (typeof p5.AudioIn !== 'undefined') {
            mic = new p5.AudioIn();
            mic.start();
        }
        initSystem();
    };

    p.draw = () => {
        p.background(255);
        updating();
        drawParticles();
    };
    p.windowResized = () => {
        let container = document.getElementById('canvas-9');
        if (container) {
            p.resizeCanvas(container.offsetWidth, container.offsetHeight);
            initSystem();
        }
    };
    function initSystem() {
        p.background(255);
        p.textSize(fontSize);
        p.textFont(font);
        p.textAlign(p.LEFT, p.TOP);
        textData = getTextData(message);
        dotsCoordinate = getCoordinates();
        let cols = dotsCoordinate[0].length;
        let rows = dotsCoordinate.length;
        let targetWidth = p.width * 0.6;
        scaleRate = targetWidth / cols;
        let particleTextWidth = cols * scaleRate;
        let particleTextHeight = rows * scaleRate;


        let marginX = (p.width - particleTextWidth) / 2;
        let marginY = p.height / 5;

        particles = createParticles(scaleRate, marginX, marginY);
    }

    function getTextData(message) {
        let data = [];
        p.textSize(fontSize);
        p.textFont(font);
        let ascent = p.textAscent();
        let descent = p.textDescent();
        let txtW = p.textWidth(message);
        let padding = 10;
        let pgW = p.ceil(txtW + padding * 2);
        let pgH = p.ceil(ascent + descent + padding * 2);

        let pg = p.createGraphics(pgW, pgH);
        pg.pixelDensity(1);
        pg.background(255);
        pg.fill(0);
        pg.textSize(fontSize);
        pg.textFont(font);
        pg.textAlign(p.LEFT, p.TOP);
        pg.text(message, padding, padding);

        pg.loadPixels();

        for (let y = 0; y < pg.height; y++) {
            let row = [];
            for (let x = 0; x < pg.width; x++) {
                let index = (y * pg.width + x) * 4;
                let r = pg.pixels[index];
                row.push([r, r, r, 255]);
            }
            data.push(row);
        }
        return data;
    }
    function getCoordinates() {
        let coordinate = [];
        for (let y = 0; y < textData.length; y++) {
            let row = [];
            for (let x = 0; x < textData[0].length; x++) {
                let redVal = textData[y][x][0];
                if (redVal < 128) {
                    row.push(1);
                } else {
                    row.push(0);
                }
            }
            coordinate.push(row);
        }
        return coordinate;
    }
    function createParticles(scaleRate, marginX, marginY) {
        let newParticles = [];
        for (let y = 0; y < dotsCoordinate.length; y++) {
            for (let x = 0; x < dotsCoordinate[0].length; x++) {
                if (dotsCoordinate[y][x] === 1) {
                    let posX = x * scaleRate + marginX;
                    let posY = y * scaleRate + marginY;
                    newParticles.push(new Particle(posX, posY));
                }
            }
        }
        return newParticles;
    }
    function drawParticles() {
        for (let i = 0; i < particles.length; i++) {
            particles[i].draw();
        }
    }
    function updating() {
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
        }
    }
    p.mousePressed = () => {
        if (p.getAudioContext().state !== 'running') {
            p.userStartAudio();
        }
        if (p.mouseX > 0 && p.mouseX < p.width && p.mouseY > 0 && p.mouseY < p.height) {
            isMousePressed = true;
        }
    };
    p.mouseReleased = () => {
        isMousePressed = false;
    };
    p.keyPressed = () => {
        inpactRange += 10;
    };
};


// 인스턴스 실행
new p5(sketch7);
new p5(sketch8);
new p5(sketch9);



// 페이지 내의 <audio> 태그들을 찾아와 play 이벤트가 발생하는지 감시힘
// 방금 재생한 오디오가 아닌 다른 오디오라면 일시정지 시키기
document.addEventListener('DOMContentLoaded', function () {
    const allAudios = document.querySelectorAll('audio');
    allAudios.forEach(audio => {
        audio.addEventListener('play', (event) => {
            const currentAudio = event.target;
            allAudios.forEach(otherAudio => {
                if (otherAudio !== currentAudio) {
                    otherAudio.pause();
                }
            });
        });
    });
});