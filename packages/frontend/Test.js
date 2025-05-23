const now = new Date();
const utcNow = new Date(
  Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    now.getUTCHours(),
    now.getUTCMinutes()
  )
);
console.log("now", now);
console.log(utcNow);