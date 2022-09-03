function transitionToPage(href) {
    document.body.style.opacity = 0;
    setTimeout(() => { 
        window.location.href = href;
    }, 500);
}

document.addEventListener('DOMContentLoaded', function(event) {
  window.requestAnimationFrame(() => {
    document.body.style.opacity = 1;
    // document.body.style.transform = "translate(0%, 100%Q)";
  });
});

if(!(window.localStorage.getItem('options'))) {
  
}