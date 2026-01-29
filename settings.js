const defaults = {
  playerColor:"#4fc3f7",
  playerGlow:true,
  ghostColor:"#ffffff",
  ghostSpeed:2,
  moves:20,
  watcher:true,
  noise:true,
  theme:"dark",
  grid:true
};

const saved = JSON.parse(localStorage.getItem("timelockCustom")) || defaults;

Object.keys(saved).forEach(k=>{
  if(document.getElementById(k))
    document.getElementById(k).value = saved[k];
  if(document.getElementById(k)?.type==="checkbox")
    document.getElementById(k).checked = saved[k];
});

moveVal.innerText = saved.moves;

function save(){
  const data = {
    playerColor:playerColor.value,
    playerGlow:playerGlow.checked,
    ghostColor:ghostColor.value,
    ghostSpeed:Number(ghostSpeed.value),
    moves:Number(moveCount.value),
    watcher:watcher.checked,
    noise:noise.checked,
    theme:theme.value,
    grid:grid.checked
  };
  localStorage.setItem("timelockCustom",JSON.stringify(data));
  location.href="index.html";
}
