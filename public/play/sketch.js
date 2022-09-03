let g, options;
let keys = {};
let thisFrame = {};
let d = false;

let am = {};

function preload(){
  options = loadJSON("../default-options.json");
  
  am["lock"] = loadSound("https://cdn.glitch.global/a96e73ec-dc4c-47eb-85d5-07226b4fa3b3/Lock.wav?v=1662131560731");
}

function setup() {
  g = new Game(options, am);
  
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background('#363941');
  
  g.update();
  g.draw();
  
  g.board.spacing = height / 25;
  g.holdDisplay.spacing = height / 25;
  g.nSpace = height / 50;
  
  stroke(255);
  //rect(frameCount % 10, 0, 10, 10);
  
}

function reset(){
  g = new Game(options, am);
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}

// Custom input system to avoid the built in DAS
{
  document.addEventListener("keydown", keyDownHandler, false);
  document.addEventListener("keyup", keyUpHandler, false);
  let think = new CustomEvent('think', {keyCode: 37});
  
  function keyDownHandler(e) {
    think = new CustomEvent('think', {detail: e});
    
    if(!(keys[e.keyCode])){
      document.dispatchEvent(think);
    }
    
    keys[e.keyCode] = true;
    
  }
  function keyUpHandler(e) {
    keys[e.keyCode] = false;
  }

  function keyIsDown(keyCode) {
    return keys[keyCode];
  }
}

function v (x, y){
  return createVector(x, y);
}
// gird!!