// BOMBRUNNER.game = {
//   state: {
//
//     roomID: window.location,
//
//     bombs: []
//   },
//   firstPersonmovement: function(playerMoves){
//     var firstPerson = document.getElementById("firstPerson")
//     if(firstPerson === null){
//       var firstPerson = document.createElement("div");
//       var colors = ["#4cb7db", "#fff8b0", "#c4fcdd", "#ffb6c1", "#660066", "#f6546a", '#b32500', '#8dc63f', '#114355', '#794044', '#ca8f42', '#6a7d8e', '#00ffff', '#ff7373']
//       firstPerson.setAttribute("class", "ball");
//       firstPerson.setAttribute("id", "firstPerson");
//       firstPerson.style.background = colors[Math.floor(Math.random()* 14)-1];
//       document.querySelector('.board').appendChild(firstPerson);
//     }else{
//       firstPerson.style.top = playerMoves.x+"px";
//       firstPerson.style.left = playerMoves.y+"px";
//     }
//   }
// }
