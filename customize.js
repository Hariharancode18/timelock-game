const defaults = {
  playerSpeed: 2,
  ghostSpeed: 2,
  useMoves: false,
  moves: 20
};

const saved = JSON.parse(localStorage.getItem("timelock")) || defaults;

playerSpeed.value = saved.playerSpeed;
ghostSpeed.value = saved.ghostSpeed;
useMoves.checked = saved.useMoves;
moves.value = saved.moves;
mv.innerText = saved.moves;

function save(){
  localStorage.setItem("timelock", JSON.stringify({
    playerSpeed:+playerSpeed.value,
    ghostSpeed:+ghostSpeed.value,
    useMoves:useMoves.checked,
    moves:+moves.value
  }));
  location.href="index.html";
}
