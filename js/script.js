// Used to toggle the menu on small screens when clicking on the menu button
function menuToggle() {
  const x = document.getElementById('navSmall');
  if (x.className.indexOf('w3-show') === -1) {
    x.className += ' w3-show';
  } else { 
    x.className = x.className.replace(' w3-show', '');
  }
}

// Show or hide the sub-menu under "How To Use"
function howToUse() {
  const sub_menu = document.getElementById('how-to-use-sub-menu');
  const caret_down = document.getElementById('how-to-use-caret-down');
  const caret_up = document.getElementById('how-to-use-caret-up');
  console.log (sub_menu.style.display);
  if (sub_menu.style.display === '') {
    sub_menu.style.display = 'block';
    caret_down.style.display = 'none';
    caret_up.style.display = 'inline';
  } else {
    sub_menu.style.display = '';  
    caret_down.style.display = 'inline';
    caret_up.style.display = 'none';
  }
}

// Show or hide the sub-menu under "Theory"
function theory() {
  const sub_menu = document.getElementById('theory-sub-menu');
  const caret_down = document.getElementById('theory-caret-down');
  const caret_up = document.getElementById('theory-caret-up');
  console.log (sub_menu.style.display);
  if (sub_menu.style.display === '') {
    sub_menu.style.display = 'block';
    caret_down.style.display = 'none';
    caret_up.style.display = 'inline';
  } else {
    sub_menu.style.display = '';  
    caret_down.style.display = 'inline';
    caret_up.style.display = 'none';
  }
}
