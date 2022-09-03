let jsonFile, display;
let loc = "";
let parent = document.getElementById("middle");
let elements = [];
let brElements = [];

function preload () {
  jsonFile = loadJSON("../options-make.json");
}

function setup (){
  noCanvas();
  updatePage();
}

function updatePage() {
  if(elements.length != 0){
    for(let e of elements){
      if(e){
        e.remove();
      }  
    }
    for(let b of brElements){
      if(b){
        b.remove();
      }  
    }
  }
  
  elements = [];
  brElements = [];
  
  display = getAllInPath(loc, jsonFile);
  elements = drawFromDisplay(display);
}

function goTo (l) {
  loc = loc + l + "/";
  updatePage();
}

function goBack() {
  let l = loc.split("/");
  if(l[0].length == 0){
    transitionToPage("../"); 
    return;
  }
  l = removeEmptyStrings(l);
  l.pop();
  l.push("");
  loc = l.join("/");
  
  updatePage();
}

function setPath (l) {
  loc = l;
  updatePage();
}


function drawFromDisplay(d) {
  let currentElements = [];
  for(let p in d){
    let element = makeElementObject(d[p], p);
    currentElements.push(element);
  }
  
  currentElements.push(makeBackButton());
  
  return currentElements;
}

function makeElementObject(o, p){
  let e;
  switch(o.type){
    case "folder":
      e = makeFolder(o, p);
      break;
    case "keybind":
      e = makeBind(o);
      break;
  }
  
  return e;
}

function addSpace(){
  let b = createElement("br");
  b.parent(parent);
  brElements.push(b);
  return b;
}

function makeBackButton(){
  let ele = createButton("Back");
  ele.parent(parent);
  ele.elt.onclick = () => {goBack();};
  addSpace();
  return ele;
}

function makeFolder(o, p) {
  let click = "goTo('" + p + "')";
  let ele = createButton(o.name);
  ele.parent(parent);
  ele.elt.onclick = () => { eval(click); };
  addSpace();
  return ele;
}

function makeBind(o) {
  
}

function getAllInPath(path, m){
  //if(path == null || m == null) return;
  let p = path.split("/");
  let elements = [];
  let sm = m;
  
  if(p.length > 1){
    sm = sm.sub;
    sm = sm[p[0]];
    p.shift();
    return getAllInPath(p.join("/"), sm); 
  }
  
  return sm.sub;
  
}

function removeEmptyStrings (array) {
  let a = array;
  for(let i = 0; i < a.length; i++){
    if (!a[i].length)
      a.splice(i, i + 1);
  }
  
  return a;
}

class Slider {
  constructor(name, ){
    this.container = 
    this.name = createElement();
  }
}