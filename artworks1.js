function toggleCode(element) {
    element.classList.toggle('open');
}

/* ============================== */
/*          1.  1-1 벽면           */
/* ============================== */
const sketch1 = (p) => {
    let _minWidth;
    let _aryPoints = [];
    let _numTile;
    let _resolution = 240; 
    let pg;

    p.setup = () => {
        let container = document.getElementById('canvas-1');
        let canvas = p.createCanvas(container.offsetWidth, container.offsetHeight);
        canvas.parent('canvas-1');
        p.noSmooth();
        p.pixelDensity(1);
        p.colorMode(p.HSB, 360, 100, 100, 255);
        p.ellipseMode(p.RADIUS);
        p.imageMode(p.CENTER);
        p.frameRate(30);

        pg = p.createGraphics(_resolution, _resolution);
        pg.colorMode(p.HSB, 360, 100, 100, 255);
        pg.noSmooth();

        _minWidth = p.min(_resolution, _resolution) * 0.8;
        setObject();
    };

    p.draw = () => {
        pg.blendMode(p.BLEND);
        pg.background(100);
        pg.blendMode(p.MULTIPLY);
        pg.push();
        pg.translate(_resolution / 2, _resolution / 2);
        for (let i = _aryPoints.length - 1; i >= 0; i--) {
            _aryPoints[i].update();
            _aryPoints[i].draw();
        }
        pg.pop();
        dither();
        p.blendMode(p.BLEND);
        p.background(100);
        let displaySize = p.min(p.width, p.height);
        p.imageMode(p.CENTER);
        p.image(pg, p.width / 2, p.height / 2, displaySize, displaySize);
    };

    p.windowResized = () => {
        let container = document.getElementById('canvas-1');
        p.resizeCanvas(container.offsetWidth, container.offsetHeight);
    };

    function setObject() {
        let numPoints = 16;
        let xy1Start = p.createVector(0, 0);
        let xy2Start = p.createVector(0, 0);
        let unitTime = 30;
        _numTile = 4;
        let xyShift = p.createVector(_minWidth / _numTile, 0);
        _aryPoints = [];
        let maxR = (_minWidth / _numTile / 2) * 0.8;
        let d = 10;
        let type = "inout";

        for (let i = 0; i < numPoints; i++) {
            let randRot1 = p.random([0, 1, 2, 3]);
            let randRot2 = p.random([0, 1, 2, 3]);
            let xy1End = p5.Vector.add(xy1Start, p5.Vector.rotate(xyShift, p.PI / 2 * randRot1));
            let xy2End = p5.Vector.add(xy2Start, p5.Vector.rotate(xyShift, p.PI / 2 * randRot2));
            let r = (maxR / numPoints) * (i + 1);
            _aryPoints[i] = new Points(xy1Start, xy1End, xy2Start, xy2End, r, unitTime, xyShift, type, d);
        }
    }

    class Points {
        constructor(xy1Start, xy1End, xy2Start, xy2End, r, unitTime, xyShift, type, d) {
            this.xy1Start = xy1Start; this.xy1End = xy1End; this.xy2Start = xy2Start; this.xy2End = xy2End;
            this.r = r; this.unitTime = unitTime; this.count = 0; this.xyShift = xyShift; this.d = d; this.type = type;
            let colNum = 5;
            this.col = p.color(100 / (colNum - 1) * p.floor(p.random(colNum)));
        }
        update() {
            let unitTime = this.unitTime;
            this.xy1Current = p5.Vector.lerp(this.xy1Start, this.xy1End, easing(unitTime, this.count, this.type, this.d));
            this.xy2Current = p5.Vector.lerp(this.xy2Start, this.xy2End, easing(unitTime, this.count, this.type, this.d));
            this.count++;
            if (this.count > unitTime) {
                this.count = 0;
                this.xy1Start = this.xy1End;
                let xy1EndNew = this.getNextPos(this.xy1End);
                this.xy1End = xy1EndNew;
                this.xy2Start = this.xy2End;
                let xy2EndNew = this.getNextPos(this.xy2End);
                this.xy2End = xy2EndNew;
                this.xy1Current = this.xy1Start;
                this.xy2Current = this.xy2Start;
            }
        }
        getNextPos(currentPos) {
            let nextPos;
            let margin = 1.01;
            let limit = _minWidth / 2 * margin;
            do {
                nextPos = p5.Vector.add(currentPos, p5.Vector.rotate(this.xyShift, p.PI / 2 * p.random([0, 1, 2, 3])));
            } while (nextPos.x > limit || nextPos.x < -limit || nextPos.y > limit || nextPos.y < -limit);
            return nextPos;
        }
        draw() {
            pg.fill(this.col); pg.noStroke();
            if (this.xy1Current.x == this.xy2Current.x && this.xy1Current.y == this.xy2Current.y) {
                pg.ellipse(this.xy2Current.x, this.xy2Current.y, this.r, this.r);
            } else {
                let aryPoints = getContactLine(this.xy1Current, this.xy2Current, this.r, this.r);
                drawVertexShape(aryPoints);
            }
        }
    }
    function getContactLine(xy1, xy2, r1, r2) {
        let xy_l, xy_s, r_l, r_s;
        if (r1 > r2) { xy_l = xy1; xy_s = xy2; r_l = r1; r_s = r2; } else { xy_l = xy2; xy_s = xy1; r_l = r2; r_s = r1; }
        let numAng = 64; let aryContactLinePoints = []; let d = p5.Vector.dist(xy_l, xy_s);
        if (d <= r_l - r_s) {
            for (let i = 0; i < numAng; i++) {
                let vec_radius_l = p.createVector(0, r_l); let vec = p5.Vector.add(xy_l, vec_radius_l);
                aryContactLinePoints.push(vec); vec_radius_l.rotate((2 * p.PI) / numAng);
            }
            return aryContactLinePoints;
        }
        let theta_l = p.acos((r_l - r_s) / d); let vec_l_s = p5.Vector.sub(xy_s, xy_l); let vec_radius_l = p5.Vector.rotate(vec_l_s, theta_l).setMag(r_l);
        for (let i = 0; i < numAng + 1; i++) {
            let vec = p5.Vector.add(xy_l, vec_radius_l); aryContactLinePoints.push(vec); vec_radius_l.rotate(((2 * p.PI - theta_l * 2) / numAng));
        }
        let theta_s = p.PI - theta_l; let vec_s_l = p5.Vector.sub(xy_l, xy_s); let vec_radius_s = p5.Vector.rotate(vec_s_l, theta_s).setMag(r_s);
        for (let i = 0; i < numAng + 1; i++) {
            let vec = p5.Vector.add(xy_s, vec_radius_s); aryContactLinePoints.push(vec); vec_radius_s.rotate(((2 * p.PI - theta_s * 2) / numAng));
        }
        return aryContactLinePoints;
    }
    function drawVertexShape(aryPoints) {
        pg.beginShape(); for (let i = 0; i < aryPoints.length; i++) { pg.vertex(aryPoints[i].x, aryPoints[i].y); } pg.endShape(p.CLOSE);
    }
    function easing(unitTime, t, type, d) {
        if (type == "in") return (t / unitTime) ** d; if (type == "out") return 1 - ((unitTime - t) / unitTime) ** d;
        if (type == "inout") { if (t < unitTime / 2) return ((t * 2) / unitTime) ** d / 2; else return (1 - ((unitTime - (t * 2 - unitTime)) / unitTime) ** d) / 2 + 0.5; }
    }
    function dither() {
        let m = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
        pg.loadPixels();
        for (let x = 0; x < pg.width; x++) {
            for (let y = 0; y < pg.height; y++) {
                let index = 4 * (y * pg.width + x);
                let bright = pg.pixels[index];
                if (bright < (m[y % 4][x % 4] + 1) * 255 / 16) { pg.pixels[index] = 0; pg.pixels[index + 1] = 0; pg.pixels[index + 2] = 0; } else { pg.pixels[index] = 255; pg.pixels[index + 1] = 255; pg.pixels[index + 2] = 255; }
                pg.pixels[index + 3] = 255;
            }
        }
        pg.updatePixels();
    }

    p.mousePressed = () => {
        if (p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {
            p.setup();
        }
    };

    p.windowResized = () => {
        let c = document.getElementById('canvas-1');
        p.resizeCanvas(c.offsetWidth, c.offsetHeight);
    };
};



/* ============================== */
/*          2.  2-1 바닥           */
/* ============================== */
const sketch2 = (p) => {
    let _numColor;
    let _object;
    let _minWidth;

    p.setup = () => {
        let container = document.getElementById('canvas-2');
        let canvas = p.createCanvas(container.offsetWidth, container.offsetHeight);
        canvas.parent('canvas-2');
        
        _minWidth = p.min(p.width, p.height);

        p.frameRate(30);
        p.noStroke();
        p.rectMode(p.CENTER);
        
        _numColor = 17;
        _object = new GradationRect(_numColor);
    };

    p.draw = () => {
        p.background(255);
        p.translate(p.width / 2, p.height / 2);
        _object.update();
        _object.draw();
    };

    p.mouseReleased = () => {
        if (p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {
            _object = new GradationRect(_numColor);
        }
    };
    
    p.windowResized = () => {
        let container = document.getElementById('canvas-2');
        p.resizeCanvas(container.offsetWidth, container.offsetHeight);
        _minWidth = p.min(p.width, p.height);
        _object = new GradationRect(_numColor); // 리사이징 시 객체 재생성
    };

    class GradationRect {
        constructor(numColor) {
            this.posCent = [0, 0];
            this.w = [_minWidth / 0.5, _minWidth / 1];
            this.numColor = numColor;
            this.aryGradNoiseInit = [];
            this.gradNoiseSpeed = [0.004, 0.005]; //[for pos, for color]
            this.aryGradNoise = []; //[value for pos, value for color, ratio for pos]
            this.count = 0;
            for (let i = 0; i < this.numColor; i++) {
                this.aryGradNoiseInit[i] = [p.random(2000), p.random(2000)];
                this.aryGradNoise[i] = [0, 0, 0];
            }
        }
        update() {
            let totalNoiseValPos = 0;
            for (let i = 0; i < this.numColor; i++) {
                this.aryGradNoise[i][0] = calcNoise(this.aryGradNoiseInit[i][0] + this.gradNoiseSpeed[0] * this.count, 2, 3); //pos
                if (i == 0) { this.aryGradNoise[i][0] = 0; }
                totalNoiseValPos += this.aryGradNoise[i][0];
                this.aryGradNoise[i][1] = calcNoise(this.aryGradNoiseInit[i][1] + this.gradNoiseSpeed[1] * this.count, 3, 1); //color
            }
            let previousNoiseRatioPos = 0;
            for (let i = 0; i < this.numColor; i++) {
                previousNoiseRatioPos += this.aryGradNoise[i][0] / totalNoiseValPos;
                this.aryGradNoise[i][2] = previousNoiseRatioPos;
                if (i == this.numColor - 1) { this.aryGradNoise[i][2] = 1.0; }
            }
            this.count++;
        }
        draw() {
            p.push();
            let grad;
            // [중요] drawingContext는 p.drawingContext로 접근
            grad = p.drawingContext.createLinearGradient(-this.w[1] / 2, 0, this.w[1] / 2, 0);
            for (let i = 0; i < this.numColor; i++) {
                grad.addColorStop(this.aryGradNoise[i][2], p.color(255 * this.aryGradNoise[i][1]));
            }
            p.drawingContext.fillStyle = grad;
            p.drawingContext.shadowColor = p.color(128);
            p.drawingContext.shadowBlur = _minWidth / 10;
            p.translate(this.posCent[0], this.posCent[1]);
            p.rect(0, 0, this.w[0], this.w[1]);
            p.pop();
        }
    }

    function calcNoise(noiseSeed, freq, d) {
        let noiseVal;
        noiseVal = (p.sin(2 * p.PI * freq * p.noise(noiseSeed)) * 0.5 + 0.5) ** d;
        return noiseVal;
    }

    // 창 크기 변경 시 대응
    p.windowResized = () => {
        let c = document.getElementById('canvas-2');
        p.resizeCanvas(c.offsetWidth, c.offsetHeight);
    };
};



/* ============================== */
/*          3.  2-2 벽면           */
/* ============================== */
const sketch3 = (p) => {
    let blackholes = [];
    let stars = [];
    let blackholesNum = 10;
    let starsNum = 700;

    let starStep = 1;
    let maxStarStep = 20;
    let starStepIncrement = 0.005;

    let FrameRate = 30;
    let maxFrameRate = 100;
    let frameRateIncrement = 1;

    p.setup = () => {
        // 캔버스 컨테이너 크기에 맞춰 생성
        let container = document.getElementById('canvas-3');
        if (container) {
            p.createCanvas(container.offsetWidth, container.offsetHeight).parent('canvas-3');
        } else {
            p.createCanvas(p.windowWidth, p.windowHeight);
        }
        p.colorMode(p.HSB, 100);
        p.strokeWeight(1);
        
        for (let i = starsNum; i--;) {
            stars.push(new Star(i));
        }
        p.frameRate(FrameRate);
    };

    p.draw = () => {
        p.background(0, 10);

        ///// update blackholes /////
        const t = p.frameCount / 1e3;
        p.stroke('black');
        for (let i = blackholesNum; i--;) {
            blackholes[i] = {
                x: p.cos(t * i) * i * 50 + p.width / 2,
                y: p.sin(t * i) * i * 50 + p.height / 2
            };
            p.ellipse(blackholes[i].x, blackholes[i].y, 0.1, 0.1);
        }

        ///// update stars /////
        stars.forEach(s => s.update());
    };

    class Star {
        constructor(i) {
            const x = p.cos(i) * 280 + p.width / 2;
            const y = p.sin(i) * 280 + p.height / 2;
            this.x = x;
            this.y = y;
            this.startx = x;
            this.starty = y;
        }

        update() {
            const angle = this.sumAngles(this.x, this.y);
            if (!angle) return;
            p.stroke(255);
            // line(x1, y1, x2, y2)
            p.line(this.x, this.y, this.x += p.cos(angle) * starStep, this.y += p.sin(angle) * starStep);
        }

        sumAngles(x, y) {
            let angle = 0;
            for (const b of blackholes) {
                const dy = b.y - y;
                const dx = b.x - x;
                angle += p.atan2(dy, dx);
                if (p.sqrt(dx ** 2 + dy ** 2) < starStep) {
                    this.x = this.startx;
                    this.y = this.starty;
                    return false;
                }
            }
            return angle;
        }
    }

    p.mousePressed = () => {
        if (p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {
            stars = []; // 배열 초기화 필요
            p.setup();
        }
    };
    
    // 창 크기 변경 시 대응
    p.windowResized = () => {
        let c = document.getElementById('canvas-3');
        p.resizeCanvas(c.offsetWidth, c.offsetHeight);
    };
};



/* ============================== */
/*          4.  2-2 바닥           */
/* ============================== */
const sketch4 = (p) => {
    let incX=0.04, incY=0.05, distance=10, wavesHeight=5, zOff=0;
    p.setup = () => {
        let c = document.getElementById('canvas-4');
        p.createCanvas(c.offsetWidth, c.offsetHeight).parent('canvas-4');
        p.noiseDetail(1);
    };
    p.draw = () => {
        zOff = p.frameCount * 0.01;
        p.background(0); p.strokeWeight(0.5); p.stroke(0);
        let yOff = 0;
        for (let y = -wavesHeight; y < p.height + wavesHeight; y += distance) {
            let xOff = 0; p.beginShape();
            for (let x = -wavesHeight; x < p.width * 2; x += distance) {
                let n = p.noise(xOff, yOff, zOff);
                let val = p.map(n, 0, 1, -wavesHeight, wavesHeight);
                p.curveVertex(x, y + val);
                xOff += incX;
                p.fill(p.map(xOff, 0, 3.5, 255, 255), p.map(n, 0.2, 0.7, 255, 255), p.map(yOff, 0, 4, 255, 255));
            }
            p.endShape(); yOff += incY;
        }
    };
    p.mousePressed = () => {
        if (p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {
            p.setup();
        }
    };
    p.windowResized = () => {
        let c = document.getElementById('canvas-4');
        p.resizeCanvas(c.offsetWidth, c.offsetHeight);
    };
};



/* ============================== */
/*          5.  2-4 벽면           */
/* ============================== */
const sketch5 = (p) => {
let message = "한"; // 텍스트 메시지
    let fontFile = "Assets/NanumMyeongjoExtraBold.ttf"; // 사용할 폰트 파일 (경로 수정됨)
    let font;
    let fontSize = 300; // 텍스트 크기 (캔버스 크기에 맞춰 조절)
    let textAlpha = 1; // 텍스트 투명도

    let backgroundColor = 0; // 배경색
    let strokeAlpha = 10; // 선의 투명도
    let strokeColor = 255; // 선의 색상

    let points = []; // 포인트 배열
    let fontSampleFactor = 0.3; // 텍스트의 포인트 개수
    let noiseZoom = 0.006; // 펄린 노이즈의 확대 비율
    let noiseOctaves = 4; // 노이즈의 옥타브 개수
    let noiseFalloff = 0.5; // 노이즈 계층의 감쇠 정도
    let lineSpeed = 0.2; // 각 포인트가 한 프레임에 이동할 수 있는 최대 거리

    let isLooping = true; // 루프 여부

    p.preload = () => { // 폰트 불러오기
        font = p.loadFont(fontFile);
    };

    p.setup = () => {
        // 캔버스 생성 (HTML 컨테이너 크기에 맞춤)
        let container = document.getElementById('canvas-5');
        if (container) {
            p.createCanvas(container.offsetWidth, container.offsetHeight).parent('canvas-5');
        } else {
            p.createCanvas(p.windowWidth, p.windowHeight);
        }

        p.background(backgroundColor); // 배경색 설정
        p.textFont(font); // 폰트 설정
        p.textSize(fontSize); // 폰트 크기 설정
        p.fill(backgroundColor, textAlpha); // 텍스트 설정
        p.stroke(strokeColor, strokeAlpha); // 선 설정
        p.noiseDetail(noiseOctaves, noiseFalloff); // 노이즈 설정

        // 시작 포인트 설정
        // 캔버스 중앙에 오도록 위치 계산 수정
        points = font.textToPoints(
            message,
            p.width / 2 - p.textWidth(message) / 2,
            p.height / 2 + fontSize / 3, // 높이 중앙 정렬 보정
            fontSize, 
            { sampleFactor: fontSampleFactor }
        );
    };

    p.draw = () => {
        if (p.keyIsPressed === false) { // 키보드를 누르고 있을 때 일시정지
            for (let i = 0; i < points.length; i++) {
                let ptObj = points[i]; 
                
                let noiseX = ptObj.x * noiseZoom;
                let noiseY = ptObj.y * noiseZoom;
                let noiseZ = 0;

                let newPX = ptObj.x + p.map(p.noise(noiseX, noiseY, noiseZ), 0, 1, -lineSpeed, lineSpeed);
                let newPY = ptObj.y + p.map(p.noise(noiseX, noiseY, noiseZ + 214), 0, 1, -lineSpeed, lineSpeed);

                p.line(ptObj.x, ptObj.y, newPX, newPY);
                
                ptObj.x = newPX;
                ptObj.y = newPY;
            }
        }
    };

    p.mousePressed = () => {
        if (p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {
            p.setup();
        }
    };

    p.windowResized = () => {
        let c = document.getElementById('canvas-5');
        p.resizeCanvas(c.offsetWidth, c.offsetHeight);
    };
};



/* ============================== */
/*          6.  2-4 바닥           */
/* ============================== */
const sketch6 = (p) => {
    // 2-4 바닥
    // 참고: https://openprocessing.org/sketch/1414758

    p.setup = () => {
        // 캔버스 생성 (HTML 컨테이너 크기에 맞춤)
        let container = document.getElementById('canvas-6');
        if (container) {
            p.createCanvas(container.offsetWidth, container.offsetHeight).parent('canvas-6');
        } else {
            p.createCanvas(p.windowWidth, p.windowHeight);
        }

        p.fill(0);
        p.noStroke();
        p.rectMode(p.CENTER);
        p.frameRate(16);
        p.noiseDetail(2, 0.5); // 노이즈 디테일 및 범위를 조절
    };

    p.draw = () => {
        p.background(255);
        for (let x = 10; x < p.width; x += 10) {
            for (let y = 10; y < p.height; y += 10) {
                let n = p.noise(x * 0.01, y * 0.01, p.frameCount * 0.16);
                p.push();
                p.translate(x, y);
                p.rotate(p.TWO_PI * n);
                p.scale(30 * n); // 스케일 값을 더 크게 조절
                p.rect(0, 0, 1, 1);
                p.pop();
            }
        }
    };

    p.mousePressed = () => {
        if (p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {
            p.setup();
        }
    };

    p.windowResized = () => {
        let c = document.getElementById('canvas-6');
        p.resizeCanvas(c.offsetWidth, c.offsetHeight);
    };
};


// 인스턴스 실행
new p5(sketch1);
new p5(sketch2);
new p5(sketch3);
new p5(sketch4);
new p5(sketch5);
new p5(sketch6);



// 페이지 내의 <audio> 태그들을 찾아와 play 이벤트가 발생하는지 감시힘
// 방금 재생한 오디오가 아닌 다른 오디오라면 일시정지 시키기
document.addEventListener('DOMContentLoaded', function() {
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