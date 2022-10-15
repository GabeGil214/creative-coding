var song;
var slider;
var amp;
var playing;
var fft;
var mic;
var img;
var lowFreq;
var sliderVolume;
var sliderRate;
var buttonMusic;
var buttonMic;
var particles = [];
var imgRadio;
var circleColor = [];
var particleColors = [];

function preload() {
    img = loadImage("../assets/victor-grabarczyk.webp");
}

function setup() {
    var canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas');
    sliderVolume = createSlider(0, 1, 0.5, 0.01);
    sliderVolume.parent('volume');
    sliderRate = createSlider(0, 1.75, 1, 0.01);
    sliderRate.parent('tempo');
    imgRadio = createRadio('background-img');
    imgRadio.option('Yes');
    imgRadio.option('No');
    imgRadio.selected('No');
    imgRadio.parent('background');
    circleColorPicker = createColorPicker('#fff');
    particleColorPicker = createColorPicker('#fff');
    circleRadio = createRadio('circle-color');
    circleRadio.option('Use Color Picker');
    circleRadio.option('Shimmer');
    circleRadio.selected('Use Color Picker');
    circleRadio.parent('circle-color');
    particleRadio = createRadio('particle-color');
    particleRadio.option('Shimmer');
    particleRadio.option('Randomize');
    particleRadio.option('Use Color Picker');
    particleRadio.selected('Use Color Picker');
    particleRadio.parent('particle-colors');
    particleColorPicker.parent('particle-colors');
    circleColorPicker.parent('circle-color');
    angleMode(DEGREES);
    imageMode(CENTER);
    rectMode(CENTER);
    amp = new p5.Amplitude();
    mic = new p5.AudioIn();
    fft = new p5.FFT();

    song = loadSound("../assets/trap.mp3", loaded);

    img.filter(BLUR, 12);
}

function loaded () {
    buttonMusic = createButton("Play Music");
    buttonMic = createButton("Use Microphone Input");
    buttonMusic.mousePressed(toggleMusic);
    buttonMic.mousePressed(toggleInput);
    buttonMusic.parent('input');
    buttonMic.parent('input');
}

function toggleMusic () {
    fft.setInput(song)
    mic.stop()
    if(song.isPlaying()){
        song.pause();
        buttonMusic.html("Play Music");
    } else {
        song.play();
        song.setVolume(sliderVolume.value());
        buttonMusic.html("Pause Music");
    }
}

function toggleInput () {
    fft.setInput(mic)
    mic.start();
}

function draw() {
    background(0);

    translate(width / 2, height / 2);
    var wave = fft.waveform();

    fft.analyze()
    lowFreq = fft.getEnergy(20, 200)

    if(imgRadio.value() === 'Yes'){
        push()
        if(lowFreq > 210){
            rotate(random(-0.5, 0.5))
        }
        image(img, 0, 0, width + 100, height + 100);
        pop()

        var alpha = map(lowFreq, 0, 255, 240, 170)
        fill(0, alpha)
        noStroke()
        rect(0, 0, width, height)
    }

    if (particleRadio.value() === 'Randomize'){
        particleColors = [random(0,255), random(0, 255), random(0, 255)]
    } else if (particleRadio.value() === 'Shimmer'){
        particleColors = ['Shimmer']
    } else {
        particleColors = [particleColorPicker.color()]
    }

    var p = new Particle(particleColors);
    particles.push(p);

    for (var i = 0; i < particles.length; i++) {
        if (!particles[i].edges()){
            particles[i].update(lowFreq > 210)
            particles[i].show()
        } else {
            particles.splice(i,1)
        }
    }

    if(circleRadio.value() === 'Shimmer'){
        circleColor = [random(0,255), random(0,255), random(0,255)]
    } else {
        circleColor = [circleColorPicker.color()]
    }

    stroke(...circleColor);
    strokeWeight(3);
    noFill();

    for(var t=-1; t<=1; t += 2){
        beginShape();
        for(var i=0; i <= 180; i++){
            var index = floor(map(i, 0, 180, 0, wave.length - 1));

            var r = map(wave[index], -1, 1, 100, 450);

            var x = r * sin(i) * t;
            var y = r * cos(i);
            vertex(x,y);
        }
        endShape();
    }



    song.setVolume(sliderVolume.value());
    song.rate(sliderRate.value());
}


class Particle {
    constructor(color) {
        this.pos = p5.Vector.random2D().mult(275)
        this.vel = createVector(0, 0)
        this.acc = this.pos.copy().mult(random(0.000025, 0.000001))

        this.w = random(2, 5)
        this.color = color;
    }

    update(cond) {
        this.vel.add(this.acc)
        this.pos.add(this.vel)
        if (cond){
            this.pos.add(this.vel)
            this.pos.add(this.vel)
            this.pos.add(this.vel)
        }
    }

    edges() {
        if (this.pos.x < -width / 2 || this.pos.x > width / 2 || this.pos.y > height / 2 || this.pos.y < -height /2){
            return true;
        } else {
            return false;
        }
    }

    show() {
        noStroke()
        if(this.color[0] === 'Shimmer'){
            fill(random(0,255), random(0,255), random(0,255))
        } else {
            fill(...this.color)
        }
        ellipse(this.pos.x, this.pos.y, this.w)
    }
}
