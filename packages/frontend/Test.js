const payoutOrder = [8, 4, 3 ];
for (let i = payoutOrder.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [payoutOrder[i], payoutOrder[j]] = [payoutOrder[j], payoutOrder[i]];
}

console.log(payoutOrder);