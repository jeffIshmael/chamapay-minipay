const users = ["A","C","R","F","J"];
let cycle = 1;

const trialFnctn = () =>{
  // cycle = cycle ++;
  console.log(users[6 % users.length]);
}

trialFnctn();