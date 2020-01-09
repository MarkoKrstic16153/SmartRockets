var populacija;
var meta;
var zivot = 350;
var lifeP, genP;
var count = 0;
var px = 105, py = 220;
var pw = 210,ph = 30;
var generacija = 1;
var mx=210,my=40;

class Meta {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.crtaj = function () {
            fill(255,255,0);
            ellipse(this.x, this.y, 30, 30);
            fill(255,165,0);
            ellipse(this.x, this.y, 20, 20);
            fill(255,0,0);
            ellipse(this.x, this.y, 10, 10);
        };
    }
}

class DNK {
    constructor(geni) {
        if (geni)
            this.geni = geni;
        else {
            this.geni = [];
            for (var i = 0; i < zivot; i++) {
                this.geni[i] = p5.Vector.random2D();
                this.geni[i].setMag(0.15);
            }
        }
        this.crossover = function (partner) {
            var newGenes = [];
            var novaDNK;
            var mid = floor(random(this.geni.length));
            for (i = 0; i < this.geni.length; i++) {
                if (i > mid)
                    newGenes.push(this.geni[i]);
                else
                    newGenes.push(partner.geni[i]);
            }
            novaDNK = new DNK(newGenes);
            return novaDNK;
        };
    }
}

class Populacija {
    constructor() {
        this.rakete = [];
        this.popsize = 25;
        this.mrestiliste = [];
        for (var i = 0; i < this.popsize; i++)
            this.rakete[i] = new Raketa();
        this.run = function () {
            for (var i = 0; i < this.popsize; i++) {
                this.rakete[i].nacrtaj();
                this.rakete[i].pomeri();
            }
        };
        this.evaluate = function () {
            var maxfit = 0;
            for (var i = 0; i < this.popsize; i++) {
                this.rakete[i].izracunajFitness();
                if (this.rakete[i].fitness > maxfit)
                    maxfit = this.rakete[i].fitness;
            }
            for (var i = 0; i < this.popsize; i++)
                this.rakete[i].fitness /= maxfit;
            this.mrestiliste = [];
            for (var i = 0; i < this.popsize; i++) {
                var n = this.rakete[i].fitness * 100;
                for (var j = 0; j < n; j++)
                    this.mrestiliste.push(this.rakete[i]);
            }
        };
        this.selection = function () {
            var noveRakete = [];
            for (var i = 0; i < this.rakete.length; i++) {
                var parentA = random(this.mrestiliste).dnk;
                var parentB = random(this.mrestiliste).dnk;
                var childDNK = parentA.crossover(parentB);
                noveRakete[i] = new Raketa(childDNK);
            }
            this.rakete = noveRakete;
        };
        this.mutation = function () {
            for (var i = 0; i < this.rakete.length; i++)
                this.rakete[i].mutate();
        };
    }
}

class Raketa {
    constructor(dnk) {
        this.position = createVector(width / 2, height);
        this.velocity = createVector();
        this.acc = createVector();
        this.count = 0;
        this.fitness;
        this.pogodio = false;
        this.unistena = false;
        this.prepreka = false;
        this.zid = false;
        this.iznad = false;
        if (dnk)
            this.dnk = dnk;
        else
            this.dnk = new DNK();
        this.nacrtaj = function () {
            push();
            translate(this.position.x, this.position.y);
            rotate(this.velocity.heading());
            fill(255,255,255);
            stroke(0,0,0);
            rectMode(CENTER);
            rect(0, 0, 26, 6);
            fill(225,0,0);
            triangle(13,-5,23,0,13,5);
            fill(0,0,195);
            beginShape();
            vertex(-13, 3);
            vertex(-13, -3);
            vertex(-20, -8);
            vertex(-20, 8);
            endShape(CLOSE);           
            if(this.pogodio==false && this.unistena==false){
                fill(226, 184, 34);
                beginShape();
                vertex(-20, 5);
                vertex(-20, -5);
                vertex(-24, -4);
                vertex(-27, 0);
                vertex(-24, 4);
                endShape(CLOSE); 
                fill(226, 88, 34);
                beginShape();
                vertex(-20, 3);
                vertex(-20, -3);
                vertex(-22, -2);
                vertex(-23, 0);
                vertex(-22, 2);
                endShape(CLOSE);
            }
            pop();
        };
        this.pomeri = function () {
            if (this.pogodio == false && this.unistena == false && this.prepreka == false) {
                this.primeniSilu(this.dnk.geni[count]);
                this.velocity.add(this.acc);
                this.position.add(this.velocity);
                this.acc.mult(0);
                this.count++;
                var d = dist(this.position.x, this.position.y, meta.x, meta.y);
                if (d < 15)
                    this.pogodio = true;
                else if (this.position.x > px && this.position.x < (px + pw) && this.position.y > py && this.position.y < (py + ph)){
                    this.unistena = true;
                    this.prepreka = true;
                }
                else if (this.position.x < 0 || this.position.x > width) {
                    this.unistena = true;
                    this.zid = true;
                }
                else if(this.y < 0)
                    this.iznad = true;
                else{
                    this.zid = false;
                    this.iznad = false;
                }
            }
        };
        this.primeniSilu = function (sila) {
            this.acc.add(sila);
        };
        this.izracunajFitness = function () {
            if (this.pogodio) {
                this.fitness *= 7;
                this.fitness += map(this.count, 0, 350, 3500, 100);
            }
            else if (this.zid == true){
                if(this.position.y>py+ph)
                    this.fitness = 1;
                else 
                    this.fitness /= 10;
            }  
            else if (this.iznad == true)
                this.fitness /=3;
            else if(this.prepreka == true)
                this.fitness = zidHeuristika(this.position.x);
            else if (this.position.y>height)
                this.fitness = 1;
            else if (this.unistena) 
                this.fitness = 2;
            else if(this.position.y<py+ph){
                var d = dist(this.position.x, this.position.y, meta.x, meta.y);
                this.fitness = map(d, 0, width, width, 1);
            }
            else{
                this.fitness = 3;
            }
        };
        this.mutate = function () {
            for (var i = 0; i < dnk.geni.length; i++) {
                if (random(1) < 0.01) {
                    this.dnk.geni[i] = p5.Vector.random2D();
                    this.dnk.geni[i].setMag(0.15);
                }
            }
        };
    }
}

function zidHeuristika(posX){
    if(this.posX<width/2)
        return map(posX,0,width/2,1,4);
    else
        return map(posX,width/2-1,width,4,1);
}

function setup(){
    createCanvas(420,400);
    lifeP = document.createElement("p");
    document.body.appendChild(lifeP);
    genP = document.createElement("p");
    document.body.appendChild(genP);
    meta = new Meta(mx,my);
    populacija = new Populacija();
}

function draw(){
    background(51);
    lifeP.innerHTML = "Zivot : " + count;
    genP.innerHTML = "Generacija : " + generacija;
    count++;
    meta.crtaj();
    fill(255);
    crtajPrepreku(px,py,pw,ph);
    if(count == zivot)
    {
       populacija.evaluate();
       populacija.selection();
       populacija.mutation();
       count = 0;
       generacija++;
    }
    populacija.run();
}

function crtajPrepreku(x,y,w,h){
    let debljinaCigle = 10;
    let duzinaCigle = 30;
    let i,j;
    rect(x,y,w,h);
    fill(203,65,84);
    for(i=0;i<3;i++)
    {
        for(j=0;j<7;j++)
        {
            if(i == 1){
                if(j == 0)
                    rect(x+1,y+1+(debljinaCigle*i),(duzinaCigle-2)/2,debljinaCigle-2);
                else if (j == 6){
                    rect(x+1+(duzinaCigle*j) - (duzinaCigle-2)/2,y+1+(debljinaCigle*i),duzinaCigle-2,debljinaCigle-2);
                    rect(x+1+(duzinaCigle*7) - (duzinaCigle-2)/2,y+1+(debljinaCigle*i),(duzinaCigle-2)/2-2,debljinaCigle-2);
                }
                else 
                    rect(x+1+(duzinaCigle*j) - (duzinaCigle-2)/2,y+1+(debljinaCigle*i),duzinaCigle-2,debljinaCigle-2);
            }
            else
                rect(x+1+(duzinaCigle*j),y+1+(debljinaCigle*i),duzinaCigle-2,debljinaCigle-2);
        }
    }
}

function keyPressed(){
    if (keyCode === UP_ARROW)
       py -= 10;
    else if (keyCode === LEFT_ARROW) 
        px -= 10;
    else if (keyCode === RIGHT_ARROW) 
        px += 10;
    else if (keyCode === DOWN_ARROW) 
        py += 10;
    else if(key === 'A' || key === 'a')
        meta.x -= 10;
    else if(key === 'W' || key === 'w')
        meta.y -= 10;
    else if((key === 'S'|| key === 's') && (meta.y+10)< py)
        meta.y += 10;
    else if(key === 'D'|| key === 'd')
        meta.x += 10;
}