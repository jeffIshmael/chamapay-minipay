const getPicture = (id) => {
  if (id <= 20) {
    console.log(id);
    return;
  } else {
    console.log(id % 20);
    return;
  }
};

getPicture(69);
console.log(new Date(Date.now()));