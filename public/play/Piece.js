class Piece {
  constructor() {
    this.pos = createVector(4, 3);
    this.cells = new Matrix(Piece.getSize().x, Piece.getSize().y);
    this.cells.set([
      [], [], [], [], [], 
      [], [], [], [], [], 
      [], [], [1],[], [], 
      [], [], [], [], [], 
      [], [], [], [], [],
    ], true);
    this.spin = new Matrix(Piece.getSize().x, Piece.getSize().y);
    
    this.color = 'grey';
    this.rotState = 0;
    this.bagNum = -1;
    this.bagName = "";
    
    /*
    0 => 0 = no rotation (how it spawned)
    1 => R = 1 rotation to the right after spawned
    2 => L = 1 rotation to the left after spawned
    3 => 2 = 2 rotations after spawned
    
    For all except I and O
    	Offset 1 	Offset 2 	Offset 3 	Offset 4 	Offset 5
0 	( 0, 0) 	( 0, 0) 	( 0, 0) 	( 0, 0) 	( 0, 0)
R 	( 0, 0), 	( 1, 0), 	( 1,-1), 	( 0, 2), 	( 1, 2)
2 	( 0, 0), 	( 0, 0), 	( 0, 0), 	( 0, 0), 	( 0, 0)
L 	( 0, 0), 	(-1, 0), 	(-1,-1), 	( 0, 2), 	(-1, 2)
    */
    
    this.kickTable = [
      [v( 0, 0), 	v( 0, 0), 	v( 0, 0), 	v( 0, 0), 	v( 0, 0)],
      [v( 0, 0), 	v( 1, 0), 	v( 1, 1), 	v( 0,-2), 	v( 1,-2)],
      [v( 0, 0), 	v( 0, 0), 	v( 0, 0), 	v( 0, 0), 	v( 0, 0)],
      [v( 0, 0), 	v(-1, 0), 	v(-1, 1), 	v( 0,-2), 	v(-1,-2)]
    ];
  }
  
  static getSize(){
    return createVector(5, 5)
  }
  
  getRelativeCoords(){
    let cs = [];
    this.cells.loopThrough((p) => {
      let c = createVector(p.pos.x - floor(this.cells.size.x / 2), p.pos.y - floor(this.cells.size.y / 2));
      
      //if(frameCount < 10) print(this.cells);
      
      if(p.object)
        cs.push(c);
    });
    
    return cs;
  }
  
  getSpinCoords(){
    let cs = [];
    this.spin.loopThrough((p) => {
      let c = createVector(p.pos.x - floor(this.spin.size.x / 2), p.pos.y - floor(this.spin.size.y / 2));
      
      if(p.object)
        cs.push(c);
    });
    
    return cs;
  }
  
  rotate(a, test) {
    if(a) {
      let nrs = this.rotState - a;
      nrs = fract(nrs/4)*4;
      
      let offset1 = this.kickTable[this.rotState][test];
      let offset2 = this.kickTable[nrs][test];
      
      this.rotState = nrs;
      
      this.cells.rotate(a);
      this.spin.rotate();
      this.pos.add(p5.Vector.sub(offset1, offset2));
    }
  }
  
  static get7BagPieceFromString(s){
    let p = new Piece();
    
    switch (s) {
      case "T":
        p = new TBlock();
      break;
        case "S":
        p = new SBlock();
      break;
        case "Z":
        p = new ZBlock();
      break;
        case "L":
        p = new LBlock();
      break;
        case "J":
        p = new JBlock();
      break;
        case "I":
        p = new IBlock();
      break;
        case "O":
        p = new OBlock();
      break;
    }
    return p;
  }
  
    static get7BagPieceFromInt(i, pos){
    let p = new Piece();
    if(!(pos)){
      pos = new Piece().pos
    }
    
    switch (i) {
      case 0:
        p = new TBlock();
      break;
        case 1:
        p = new SBlock();
      break;
        case 2:
        p = new ZBlock();
      break;
        case 3:
        p = new LBlock();
      break;
        case 4:
        p = new JBlock();
      break;
        case 5:
        p = new IBlock();
      break;
        case 6:
        p = new OBlock();
      break;
    }
      p.pos = pos;
      return p;
  }
  
}


class IBlock extends Piece {
  constructor() {
    super();
    this.bagNum = 5;
    this.bagName = "I";
    
    
    this.color = 'cyan';

    this.cells.set([
      [], [], [], [], [], 
      [], [], [], [], [], 
      [], [1],[1],[1],[1], 
      [], [], [], [], [], 
      [], [], [], [], [],
    ], true);
    /*
    Exclusive To I
	Offset 1 	Offset 2 	Offset 3 	Offset 4 	Offset 5
0 	( 0, 0),	(-1, 0),	( 2, 0),	(-1, 0),	( 2, 0)
R 	(-1, 0),	( 0, 0),	( 0, 0),	( 0, 1),	( 0,-2)
2 	(-1, 1),	( 1, 1),	(-2, 1),	( 1, 0),	(-2, 0)
L 	( 0, 1),	( 0, 1),	( 0, 1),	( 0,-1),	( 0, 2)
    */
    
    this.kickTable = [
      [v( 0, 0),	v(-1, 0),	v( 2, 0),	v(-1, 0),	v( 2, 0)],
      [v(-1, 0),	v( 0, 0),	v( 0, 0),	v( 0, 1),	v( 0,-2)],
      [v(-1,-1),	v( 1, 1),	v(-2, 1),	v( 1, 0),	v(-2, 0)],
      [v( 0,-1),	v( 0, 1),	v( 0, 1),	v( 0,-1),	v( 0, 2)]
    ];
  }
}

class OBlock extends Piece {
  constructor() {
    super();
    this.bagNum = 6;
    this.bagName = "O";
    
    
    this.color = 'yellow';

    this.cells.set([
      [], [], [], [], [], 
      [], [], [1],[1],[], 
      [], [], [1],[1],[], 
      [], [], [], [], [], 
      [], [], [], [], [],
    ], true);
    /*
    Exclusive To O
	Offset 1 	Offset 2 	Offset 3 	Offset 4 	Offset 5
0 	( 0, 0) 	No further offset data required
R 	( 0,-1)
2 	(-1,-1)
L 	(-1, 0)
    */
    
    this.kickTable = [
      [v( 0, 0), 	v( 0, 0), 	v( 0, 0), 	v( 0, 0), 	v( 0, 0)],
      [v( 0, 1), 	v( 0, 0), 	v( 0, 0), 	v( 0, 0), 	v( 0, 0)],
      [v(-1, 1), 	v( 0, 0), 	v( 0, 0), 	v( 0, 0), 	v( 0, 0)],
      [v(-1, 0), 	v( 0, 0), 	v( 0, 0), 	v( 0, 0), 	v( 0, 0)]
    ];
  }
}

class TBlock extends Piece {
  constructor() {
    super();
    this.bagNum = 0;
    this.bagName = "T";
    
    
    this.color = 'purple';

    this.cells.set([
      [], [], [], [], [], 
      [], [], [1], [], [], 
      [], [1],[1],[1],[], 
      [], [], [],[], [], 
      [], [], [], [], [],
    ], true);
    
    this.spin.set([
      [], [], [], [], [], 
      [], [1],[], [1],[], 
      [], [], [], [], [], 
      [], [], [], [], [], 
      [], [], [], [], [],
    ], true);
    
  }
}

class SBlock extends Piece {
  constructor() {
    super();
    this.bagNum = 1;
    this.bagName = "S";
    
    
    this.color = 'green';

    this.cells.set([
      [], [], [], [], [], 
      [], [], [1],[1],[], 
      [], [1],[1],[], [], 
      [], [], [], [], [], 
      [], [], [], [], [],
    ], true);
  }
}
class ZBlock extends Piece {
  constructor() {
    super();
    this.bagNum = 2;
    this.bagName = "Z";
    
    
    this.color = 'red';

    this.cells.set([
      [], [], [], [], [], 
      [], [1],[1],[], [], 
      [], [], [1],[1],[], 
      [], [], [], [], [], 
      [], [], [], [], [],
    ], true);
  }
}
class LBlock extends Piece {
  constructor() {
    super();
    this.bagNum = 3;
    this.bagName = "L";
    
    
    this.color = 'orange';

    this.cells.set([
      [], [], [], [], [], 
      [], [], [], [1], [], 
      [], [1],[1],[1],[], 
      [], [], [],[], [], 
      [], [], [], [], [],
    ], true);
  }
}
class JBlock extends Piece {
  constructor() {
    super();
    this.bagNum = 4;
    this.bagName = "J";
    
    
    this.color = 'blue';

    this.cells.set([
      [], [], [], [], [], 
      [], [1],[], [], [], 
      [], [1],[1],[1],[], 
      [], [], [], [], [], 
      [], [], [], [], [],
    ], true);
  }
}
