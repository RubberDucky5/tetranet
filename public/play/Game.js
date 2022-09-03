class Game {
  constructor(options, audioManager) {
    this.options = options;
    this.am = audioManager;
    
    this.size = createVector(options.game.width, options.game.height + 4);
    this.board = Board.fromFunction(
      options.game.width,
      options.game.height + 4,
      this,
      this.boardInitializer
    );
    this.holdDisplay = PieceRenderer.fromFunction(
      Piece.getSize().x,
      Piece.getSize().y,
      this,
      this.boardInitializer
    );
    
    this.next = []
    this.nextL = 6;
    this.nSpace = 10;
    for(let i = 0; i < this.nextL; i++){
      this.next.push(PieceRenderer.fromFunction(
      Piece.getSize().x,
      Piece.getSize().y,
      this,
      this.boardInitializer
      ));
    }

    this.piece;
    this.shadow;
    this.bag = [];
    this.bag2 = [];
    this.newBag();
    this.piece = this.nextPiece();
    this.desired = createVector(0, 0);
    this.desiredRot = 0;

    this.holdPiece = null;
    this.holdable = true;
    this.immobile = false;
    this.combo = 0;
    this.backToBack = 0;

    this.justKilled = false;
    this.DAS_TIMEOUT_IDS = {};
    this.DAS_INTERVAL_IDS = {};
    this.DAS_DIRECTION = 0;
    this.SD_IDS = [];
    this.AL_ID = 0;

    this.se = new ScreenEffects();

    this.k = new Keybinds(this.options.keybinds);

    document.addEventListener("think", this.onSpecialKey, false);
    document.addEventListener("keyup", this.onSpecialKeyUp, false);

    this.gravitySpeed = options.game.gravity;
    this.gravityTimer = 0;
    
    this.messages = new MessageHandler(this);
    document.addEventListener("clearlines", this.displayClearLineMessage, false);

    /*
    These speed vaules are the levels in normal Tetris (don't use values above 1 because reasons)
    
    gravitySpeed = [0.01667, 0.021017, 0.026977, 0.035256, 0.04693, 0.06361, 0.0879, 0.1236, 0.1775, 0.2598, 0.388, 0.59, 0.92, 1.46, 2.36];
    */
  }
  
  displayClearLineMessage(e){
    let game = g;
    let lm = "";
    switch(e.detail.lc){
      case 1:
        lm = "Single!"
        break;  
      case 2:
        lm = "Double!"
        break;
      case 3:
        lm = "Triple!"
        break;
      case 4:
        lm = "Tetra!"
        break;
    }
    
    if(e.detail.ac){
      game.messages.addMessage("All Clear!");
      return;
    }
    
    let piece = e.detail.piece.bagName;
    let spin = e.detail.spin ? piece + "-Spin " : "";
    let combo = e.detail.combo > 1 ? " x" + e.detail.combo : "";
    
    let backToBack = "";
    if(e.detail.backToBack > 1 && (e.detail.lc == 4 || e.detail.spin))
      backToBack = "Back To Back ";
    
    game.messages.addMessage(backToBack + spin + lm + combo);
  }

  onSpecialKey(e) {
    let game = g;

    let k = game.k;
    let keyCode = e.detail.keyCode;

    let ca = false;

    switch (keyCode) {
      case k.cp("hd", keyCode):
        game.hardDrop();
        ca = true;
        break;
      case k.cp("sd", keyCode):
        game.startSD();
        break;
      case k.cp("left", keyCode):
        game.desired.x = -1;
        game.updateDAS(-1);
        ca = true;
        break;
      case k.cp("right", keyCode):
        game.desired.x = 1;
        game.updateDAS(1);
        ca = true;
        break;
      case k.cp("lrot", keyCode):
        game.desiredRot = 1;
        ca = true;
        break;
      case k.cp("rrot", keyCode):
        game.desiredRot = -1;
        ca = true;
        break;
      case k.cp("180", keyCode):
        game.r180();
        ca = true;
        break;
      case k.cp("hold", keyCode):
        game.hold();
        ca = true;
        break;
      case k.cp("reset", keyCode):
        game.cancelAL();
        game.reset();
        break;
    }

    if (ca) game.cancelAL();
  }

  onSpecialKeyUp(e) {
    let game = g;

    let k = game.k;
    let keyCode = e.keyCode;

    switch (keyCode) {
      case k.cp("left", keyCode):
        game.cancelAS("left");
        break;
      case k.cp("right", keyCode):
        game.cancelAS("right");
        break;
      case k.cp("sd", keyCode):
        game.cancelSD();
    }
  }

  r180() {
    for (let i = 0; i < 5; i++) {
      this.piece.rotate(1, i);
      this.piece.rotate(1, i);

      if (this.isPieceColliding()) {
        this.piece.rotate(-1, i);
        this.piece.rotate(-1, i);
      } else break;
    }
  }

  hold() {
    if (this.holdable) {
      if (this.holdPiece != null) {
        let tempNum = this.holdPiece;

        this.holdPiece = this.piece.bagNum;

        this.piece = Piece.get7BagPieceFromInt(tempNum);
      } else {
        this.holdPiece = this.piece.bagNum;
        this.piece = this.nextPiece();
      }
      this.holdable = false;
    }
  }

  getColor(c) {
    if (this.options.visual.colors[c]) {
      return this.options.visual.colors[c];
    } else return "white";
  }

  updateDAS(direction) {
    if (direction == (this.DAS_DIRECTION *= -1)) {
      this.cancelAS("left");
      this.cancelAS("right");
    }

    this.DAS_DIRECTION = direction;
    let dirWord = direction == -1 ? "left" : "right";

    let TIMEOUT_ID = setTimeout(
      this.startAS,
      this.options.tuning.DAS,
      this,
      dirWord
    );
    this.DAS_TIMEOUT_IDS[dirWord] = TIMEOUT_ID;

    // print("Update DAS: " + this.options.tuning.DAS);
  }

  startAS(game, dirWord) {
    // print("Start AS", dirWord)
    let INTERVAL_ID = setInterval(() => {
      game.desired.x = game.DAS_DIRECTION;
    }, game.options.tuning.ASR);

    game.DAS_INTERVAL_IDS[dirWord] = INTERVAL_ID;
  }

  cancelAS(dirWord) {
    // print("Cancel AS", dirWord);

    clearTimeout(this.DAS_TIMEOUT_IDS[dirWord]);
    clearTimeout(this.DAS_INTERVAL_IDS[dirWord]);

    // for(let id of this.DAS_TIMEOUT_IDS)
    //   clearTimeout(id);
    // for(let id of this.DAS_INTERVAL_IDS)
    //   clearInterval(id);
  }

  startSD() {
    let id = setInterval(() => {
      this.tryToMove(createVector(0, 1));
    }, this.options.tuning.SDR);
    this.SD_IDS.push(id);
  }

  cancelSD() {
    for (let id of this.SD_IDS) clearInterval(id);
  }

  hardDrop() {
    for (let i = 0; i < this.board.matrix.size.y; i++) {
      let d = createVector(0, 1);
      this.piece.pos.add(this.checkDesired(d, "y", true));
      if (this.justKilled) break;
    }
    //this.se.triggerShake();
    this.se.impulse(createVector(0, 1));
  }

  static getClient() {
    if (g) return g;
    else return false;
  }

  boardInitializer(x, y) {
    let c = new Cell(x, y, this);
    return c;
  }

  renderCells(b, p, s, grey) {
    let coords = p.getRelativeCoords();
    for (let c of coords) {
      let x = p.pos.x + c.x;
      let y = p.pos.y + c.y;
      b.matrix.getAt(x, y).color = grey ? "grey" : p.color;
      b.matrix.getAt(x, y).alive = true;
    }
    if (s) {
      p = s;
      coords = p.getRelativeCoords();
      for (let c of coords) {
        let x = p.pos.x + c.x;
        let y = p.pos.y + c.y;
        b.matrix.getAt(x, y).color = p.color;
        b.matrix.getAt(x, y).shadow = true;
      }
    }
  }

  kill() {
    let p = this.piece;
    let coords = p.getRelativeCoords();
    for (let c of coords) {
      let x = p.pos.x + c.x;
      let y = p.pos.y + c.y;
      this.board.matrix.getAt(x, y).state = "block";
      this.board.matrix.getAt(x, y).permColor = p.color;
    }
    
    this.checkBoard();
    this.justKilled = true;
    this.piece = this.nextPiece();
    this.cancelAS();
    this.se.impulse(createVector(0, 2));
    this.gravityTimer = 0;
    
    am.lock.play();
  }

  nextPiece() {
    if (this.bag.length == 0) {
      this.bag = this.bag2;
      this.newBag();
    }
    this.holdable = true;

    let p = Piece.get7BagPieceFromInt(this.bag.shift());
    
    if (!this.checkCell(p.pos.x, p.pos.y)) {
      this.reset();
    }
      
    
    return p;
  }

  newBag() {
    this.bag2 = shuffle([0, 1, 2, 3, 4, 5, 6], true);
  }

  checkCell(x, y, debug) {
    let bool = false;

    if (
      this.board.matrix.getAt(x, y) &&
      x < this.board.matrix.size.x &&
      x > -1
    ) {
      if (debug) this.board.matrix.getAt(x, y).color = "red";

      if (this.board.matrix.getAt(x, y).state == "empty") bool = true;
    }

    return bool;
  }

  autoLock() {
    if (!this.AL_ID) {
      let id = setTimeout(() => {
        this.kill();
        this.AL_ID = null;
      }, this.options.tuning.ALD);

      this.AL_ID = id;
    }
  }

  cancelAL() {
    clearInterval(this.AL_ID);
    this.AL_ID = null;
  }

  checkDesired(d, axis, kill = false, lock = true, effects = true) {
    if(this.piece == undefined) return;
    
    let trueDesired = d.copy();

    if (axis == "x") trueDesired.y = 0;
    else if (axis == "y") trueDesired.x = 0;
    
    let hasDied = false;
    this.piece.cells.loopThrough((c) => {
      if(this.piece == undefined) return;
      if (c.object) {
        let offsetToOrigin = p5.Vector.sub(c.pos, createVector(2, 2));
        let cellPos = p5.Vector.add(this.piece.pos, offsetToOrigin);
        let desiredPos = p5.Vector.add(cellPos, d);

        let checkXCell = this.checkCell(desiredPos.x, cellPos.y);
        let checkYCell = this.checkCell(cellPos.x, desiredPos.y);

        if (!checkXCell && axis == "x") {
          if(effects)
            this.se.impulse(createVector(trueDesired.x, 0));
          trueDesired.x = 0;
        }

        if (!checkYCell && axis == "y") {
          trueDesired.y = 0;

          if (kill) {
            this.kill();
            return trueDesired;
          }

          if (lock) {
            this.autoLock();
            this.gravityTimer = 0;
          }
        }
      }
    });

    return trueDesired;
  }

  isPieceColliding() {
    let bool = false;
    let coords = this.piece.getRelativeCoords();
    for (let c of coords) {
      let worldC = p5.Vector.add(c, this.piece.pos);

      if (!this.checkCell(worldC.x, worldC.y)) bool = true;
    }
    return bool;
  }

  rotatePiece(d) {
    for (let i = 0; i < 5; i++) {
      this.piece.rotate(d, i);

      if (this.isPieceColliding()) this.piece.rotate(-d, i);
      else break;
    }
  }
  
  checkSpin(){
    let check = 0;
    
    // UP
    if(this.checkDesired(createVector(0, -1), "y", false, false, false).equals())
      check++;
    // LEFT
    if(this.checkDesired(createVector(-1, 0), "x", false, false, false).equals())
      check++;
    // RIGHT
    if(this.checkDesired(createVector(1, 0), "x", false, false, false).equals())
      check++;
    
    
    
    if(check == 3){
      this.immobile = true;
    }
    else{
      this.immobile = false;
    }
  }

  checkBoard() {
    let linesCleared = 0;
    for (let y = 0; y < this.board.size.y; y++) {
      let c = true;
      for (let x = 0; x < this.board.size.x; x++) {
        if (this.board.matrix.getAt(x, y).state != "block") {
          c = false;
        }
      }
      if (!c) continue;

      this.board.clearLine(y, this);

      linesCleared++;
    }

    if (linesCleared) {
      this.combo++;
      
      let ac = true;
      this.board.matrix.loopThrough((c) => {
        if(c.object.state == 'block')
          ac = false;
      });
      
      if(this.immobile || linesCleared == 0) this.backToBack++;
      
      let e = new CustomEvent("clearlines", { detail: {lc: linesCleared, ac: ac, piece: this.piece, spin: this.immobile, combo: this.combo, backToBack: this.backToBack} });
      document.dispatchEvent(e);
    } else {
      this.combo = 0;
      this.backToBack = 0;
    }
    
    this.se.impulse(createVector(0, linesCleared * 4));
    
    // Set outside cells to be outside
    this.board.matrix.loopThrough((c) => {
      if (c.pos.y <= this.board.yoff || c.pos.x == 0) c.object.isOutside = true;
      else c.object.isOutside = false;
    });
  }

  draw() {
    this.se.update();
    this.se.applyEffects();

    this.renderCells(this.board, this.piece, this.shadow, false);
    this.board.draw();
    
    push();
    if (this.holdPiece != null) {
      let t2 = createVector(
        this.board.toRealCoords(0, this.board.yoff).x,
        this.board.toRealCoords(0, this.board.yoff).y
      );
      t2.x -= this.holdDisplay.spacing * 3.5;

      translate(t2);
      this.holdDisplay.clear();

      this.updatePieceDisplay(this.holdPiece, this.holdDisplay, !this.holdable);
      this.holdDisplay.draw();

    }
    pop();
    
    for(let i = 0; i < this.nextL; i++){
      this.next[i].spacing = this.nSpace;
      push();
      let p = this.bag[i];
      if(i >= this.bag.length){
        p = this.bag2[i - this.bag.length];
      }
      
      this.updatePieceDisplay(p, this.next[i], false, false);
      let t2 = createVector(
        this.board.toRealCoords(this.board.size.x, this.board.yoff).x,
        this.board.toRealCoords(this.board.size.x, this.board.yoff).y
      );
      
      t2.x += this.nSpace * 3.5;
      t2.y += (i * 100);
      
      translate(t2);
      
      this.next[i].draw();
      pop();
    }
    
    noFill();
    
    this.messages.display();
  }

  updatePieceDisplay(p, b, g){
    b.clear();
    let heldp = Piece.get7BagPieceFromInt(p);
    heldp.pos = b.matrix.getMiddle();

    this.renderCells(b, heldp, false, g);
  }

  tryToMove(d) {
    // if(!d.equals(createVector()))
    //   print(d);

    // X
    this.piece.pos.add(this.checkDesired(d, "x"));
    // Then Y
    this.piece.pos.add(this.checkDesired(d, "y"));
  }

  shadowMaker() {
    // let shadow = JSON.parse(JSON.stringify(this.piece));
    // print(shadow);

    // let shadow = Piece.get7BagPieceFromInt(this.piece.bagNum);
    // for(let i = 0;)
    let shadow = this.piece.pos.copy();

    let shift;
    for (shift = 1; shift < this.board.matrix.size.y; shift++) {
      let d = createVector(0, shift);

      let move = this.checkDesired(d, "y", false, false);
      if (move.y == 0) break;
    }

    shadow.y += shift - 1;
    // print(shadow);

    let final = Piece.get7BagPieceFromInt(this.piece.bagNum);

    for (let s = 0; s < this.piece.rotState; s++) final.rotate(-1, 0);
    final.pos = shadow.copy();
    return final;
  }

  update() {
    // Clears Visuals
    this.board.clear();

    // Movement Priority => rotation, move x, move y  || I think, might revise later

    this.gravityTimer += this.gravitySpeed;
    if (this.gravityTimer > 1) {
      this.gravityTimer--;
      this.desired.y = 1;
    }
    

    // Determine if desired is possible
    this.rotatePiece(this.desiredRot);
    this.tryToMove(this.desired);

    this.checkSpin();
    // //print(this.immobile);
    //this.checkBoard();
    
    // Reset Variables
    this.desired = createVector(0, 0);
    this.desiredRot = 0;
    
    this.justKilled = false;
    this.shadow = this.shadowMaker();
    this.messages.update();
  }

  reset() {
    // this.cancelAS();
    // this.cancelSD();
    // this.cancelAL();
    // Object.assign(this, new Game(this.options));
    // this.messages.addMessage("Reset");
    reset();
  }
}

class Cell {
  constructor(x, y, game) {
    this.game = game;
    this.isOutside = false;
    this.color = null;
    this.permColor = null;
    this.state = "empty";
  }
}

class Keybinds {
  constructor(binds = {}) {
    this.binds = binds;
  }
  checkProperty(p, code) {
    for (let b of this.binds[p]) {
      if (b == code) {
        return true;
      }
    }
    return false;
  }
  cp(p, code) {
    if (this.checkProperty(p, code)) return code;
  }
}

class ScreenEffects {
  constructor() {
    this.shakeAmt = 10;
    this.shakeFalloff = 1;
    this.shake = 0;
    this.shakeVec = createVector();

    this.flashAmt = 255;
    this.flashFalloff = 1;
    this.flash = 0;

    this.screenVel = createVector();
    this.screenPos = createVector();
    this.screenMass = 1;
    this.screenDamping = 0.05;
    this.screenFriction = 0.8;
  }
  update() {
    this.shakeVec = p5.Vector.random2D().setMag(this.shake);
    this.shake -= this.shakeFalloff;
    this.shake = constrain(this.shake, 0, this.shakeAmt);

    // this.flashVec = p5.Vector.random2D().setMag(this.shake);
    this.flash -= this.flashFalloff;
    this.flash = constrain(this.flash, 0, this.flashAmt);

    let F = p5.Vector.mult(this.screenPos, -this.screenDamping);
    let a = p5.Vector.div(F, this.screenMass);
    this.screenVel.add(a);
    this.screenVel.mult(this.screenFriction);
    this.screenPos.add(this.screenVel);
  }

  impulse(i) {
    this.screenVel.add(i);
  }
  triggerShake() {
    this.shake = this.shakeAmt;
  }

  triggerFlash() {
    this.flash = this.flashAmt;
  }

  applyEffects() {
    push();
    noStroke();
    fill(255, this.flash);
    rect(0, 0, width, height);
    pop();

    translate(this.screenPos.x, this.screenPos.y);
    translate(this.shakeVec.x, this.shakeVec.y);
  }
}

class MessageHandler{
  constructor(game){
    this.game = game;
    this.messages = [];
  }
  
  update(){
    for(let m of this.messages){
      m.vel.add(createVector(0, 0.12));
      m.pos.sub(m.vel);
    }
  }
  
  addMessage(m){
    this.messages.push(new mes(m.toUpperCase(), createVector(), createVector()));
  }
  
  display(){
    for(let i = 0; i < this.messages.length; i++){
      let m = this.messages[i];
      
      push();
      noStroke();
      fill(255);
      textStyle(BOLD);
      textSize(this.game.board.spacing);
      textAlign(CENTER);
      translate(width/2, height/2);
      text(m.m, m.pos.x, m.pos.y)
      noFill();
      pop();
      
      if(abs(m.pos.y) > height){
        
        this.messages = this.messages.slice(i + 1);
      }
    }
  }
  
}

class mes {
  constructor(m, pos, vel){
    this.m = m;
    this.pos = pos;
    this.vel = vel;
  }
}