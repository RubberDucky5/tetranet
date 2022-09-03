class PieceRenderer {
  constructor(width, height, game){
    this.size = createVector(width, height);
    this.matrix = new Matrix(this.size.x, this.size.y);
    this.spacing = 20;
    this.depthHeight = 7;
    this.game = game
  }
  // Just for the draw loop
  clear(){
    this.matrix.loopThrough((o) => {
      o.object.color = null;
      o.object.shadow = false;
      o.object.alive = false;
    });
  }
  toRealCoords(xi, yi, from0){
    let x = xi * this.spacing;
    let y = yi * this.spacing;
    
    let pos = createVector(x, y);
    let offset = createVector((this.size.x*this.spacing)/2, ((this.size.y + this.yoff)*this.spacing)/2)
    if(!from0)
      pos.add(width/2, height/2);
    pos.sub(offset);
    return pos.copy();
  }
  
  static fromFunction(width, height, game, func){
    let b = new PieceRenderer(width, height, game);
    
    for(let x = 0; x < b.size.x; x++){
      for(let y = 0; y < b.size.y; y++){
        b.matrix.setAt(x, y, func(x, y));
      }
    }
    return b;
  }
  
  draw(){
    // Tune to try to get weird edges to go away
    let w = 0.5;
    
    this.depthHeight = this.spacing / 3;
    
    // let vec1 = this.toRealCoords(0, this.yoff);
    // let vec2 = createVector(this.matrix.size.x * this.spacing, (this.matrix.size.y - this.yoff) * this.spacing);
    // vec1.sub(5, 5);
    // vec2.add(10, 10);
    // stroke(255);
    // strokeWeight(10);
    // rect(vec1.x, vec1.y, vec2.x, vec2.y);
    //this.matrix.debug(this.spacing);
    this.matrix.loopThroughBackwards((h) => {
      let co = color(255);
      strokeWeight(2);
      stroke(150);
      noFill();
      if(h.object.color){
        co = color(this.game.getColor(h.object.color));
        strokeWeight(1);
      }
      stroke(co);
      fill(co)
      
      let c = this.toRealCoords(h.pos.x, h.pos.y, true);
      
      if(h.object.color){
        let top = changeBrightness(co, 70);
        noStroke();
        fill(top)
        rect(c.x - w, c.y - this.depthHeight, this.spacing + w, this.depthHeight + w);
        fill(co)
        rect(c.x - w, c.y - w, this.spacing + w, this.spacing + w);
      }
    });
  }
}


class Board extends PieceRenderer {
  constructor(width, height, game){
    super(width, height);
    this.game = game;
    this.yoff = 4;

  }
  
  static fromFunction(width, height, game, func){
    let b = new Board(width, height, game);
    
    for(let x = 0; x < b.size.x; x++){
      for(let y = 0; y < b.size.y; y++){
        b.matrix.setAt(x, y, func(x, y));
      }
    }
    return b;
  }
  
  draw(){
    // Tune w to try to get weird edges to go away
    let w = 0.5;
    
    this.depthHeight = this.spacing / 3;
    
    let vec1 = this.toRealCoords(0, this.yoff);
    let vec2 = createVector(this.matrix.size.x * this.spacing, (this.matrix.size.y - this.yoff) * this.spacing);
    vec1.sub(2.5, 2.5);
    vec2.add(5, 5);
    stroke(255);
    strokeWeight(5);
    rect(vec1.x, vec1.y, vec2.x, vec2.y);
    this.matrix.loopThroughBackwards((h) => {
      let isShadow = false
      let co = color(255);
      strokeWeight(2);
      stroke(150);
      noFill();
      if(h.object.color){
        co = color(this.game.getColor(h.object.color));
        strokeWeight(1);
      }
      if(h.object.permColor && h.object.state == 'block'){
        co = color(this.game.getColor(h.object.permColor));
        strokeWeight(1);
      }
      if(h.object.shadow && !h.object.alive){
        co = color(this.game.getColor(h.object.color));
        co.setAlpha(80);
        noStroke();
        isShadow = true;
      }
      stroke(co);
      fill(co)
      
      let c = this.toRealCoords(h.pos.x, h.pos.y);
      if(d)
        console.log(this.toRealCoords(0, 0));
      
      if((h.object.state != "empty") || h.object.color){
        if(!isShadow){
          let top = changeBrightness(co, 70);
          noStroke();
          fill(top)
          rect(c.x - w, c.y - this.depthHeight, this.spacing + w, this.depthHeight + w);
        }
        else {
          noStroke();
        }
        fill(co)
        rect(c.x - w, c.y - w, this.spacing + w, this.spacing + w);
      }
      
      if(!h.object.isOutside){
        stroke(255)
        //point(c.x, c.y);
      }
      noFill();
    });
    
  }
  
  clearLine(y, g) {
    let to = this.matrix.toArrayIndex(0, y);
    let from = this.matrix.toArrayIndex(this.matrix.size.x, y);
    this.matrix.array.splice(to, from - to);
    
    let empty = Board.fromFunction(this.matrix.size.x, 1, this.game, g.boardInitializer);
    
    this.matrix.array = empty.matrix.array.concat(this.matrix.array);
  }
  
  
  
  
}

class Matrix {
  constructor(width, height){
    this.size = createVector(width, height);
    this.array = [];
    this.initialize();
  }
  
  initialize(){
    for(let x = 0; x < this.size.x; x++){
      for(let y = 0; y < this.size.y; y++){
        this.array.push(null);
      }
    }
    if(this.array.length == this.size.x * this.size.y){
      return true;
    }
    return false;
  }
  
  toArrayIndex(x, y){
    return (y * this.size.x) + x;
  }
  
  toCoords(i){
    let y = floor(i / this.size.x);
    let x = i - (y * this.size.x);
    return createVector(x, y);
  }
  
  setAt(x, y, c){
    let i = this.toArrayIndex(x, y);
    
    this.array[i] = c;
  }
  
  rotate(a){
    
    let tempMatrix = new Matrix(this.size.x, this.size.y);
    let off = createVector(floor(this.size.x / 2), floor(this.size.y / 2));
    if(a == -1){
      this.loopThrough((c) => {
        // (-y, x)
        let t = createVector(c.pos.x - off.x, c.pos.y - off.y);
        let nc = createVector(-t.y + off.x, t.x + off.y);
        tempMatrix.setAt(nc.x, nc.y, c.object);
      });
    }
    else if(a == 1) {
      this.loopThrough((c) => {
        // (y, -x)
        let t = createVector(c.pos.x - off.x, c.pos.y - off.y);
        let nc = createVector(t.y + off.x, -t.x + off.y);
        tempMatrix.setAt(nc.x, nc.y, c.object);
      });
    }
    else {
      tempMatrix = this;
    }
    
    this.array = tempMatrix.array;
  }
  
  getAt(x, y ){
    let i = this.toArrayIndex(x, y);
    
    return this.array[i];
  }
  
  set(a, c){
    if(this.array.length == a.length){
      for(let i = 0; i < a.length; i++){
        if(a[i] == 1){
          this.array[i] = c;
        }
      }
    }
    else{
      console.error('Array needs to be same length');
    }
  }
  
  loopThrough(func){
    for(let i = 0; i < this.array.length; i++){
      func({object: this.array[i], index: i, pos: this.toCoords(i)});
    }
  }
  
  loopThroughBackwards(func){
    for(let i = this.array.length - 1; i > 0; i--){
      func({object: this.array[i], index: i, pos: this.toCoords(i)});
    }
  }
  
  getMiddle(){
    return createVector(floor(this.size.x / 2), floor(this.size.y / 2));
  }
  
  debug(s){
    for(let x = 0; x < this.size.x; x++){
      for(let y = 0; y < this.size.y; y++){
        stroke(255);
        noFill();
        rect(x*s, y*s, s, s); //sus
      }
    }
  }
}

function changeBrightness(c, v){
  return color(c.levels[0] + v, c.levels[1] + v, c.levels[2] + v, c.levels[3]);
}
