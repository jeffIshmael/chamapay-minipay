// this function receive no. of days and return it in simple form e.g 1 week, 3 wks
export const duration = (cycleTime: number) => {
  const daysInYear = 365;
  const daysInMonth = 30; // Approximate month duration
  const daysInWeek = 7;

  // Calculate time units and their remainders
  const years = Math.floor(cycleTime / daysInYear);
  const months = Math.floor(cycleTime / daysInMonth);
  const weeks = Math.floor(cycleTime / daysInWeek);

  const remainderYears = cycleTime % daysInYear;
  const remainderMonths = cycleTime % daysInMonth;
  const remainderWeeks = cycleTime % daysInWeek;

  let result = "";

  // Display the highest unit if there is no remainder, otherwise display in days
  if (years > 0 && remainderYears === 0) {
    result = years === 1 ? "year" : `${years} yrs`;
  } else if (months > 0 && remainderMonths === 0) {
    result = months === 1 ? "month" : `${months} months`;
  } else if (weeks > 0 && remainderWeeks === 0) {
    result = weeks === 1 ? "week" : `${weeks} wks`;
  } else {
    result = cycleTime === 1 ? "day" : `${cycleTime} dys`;
  }

  return result;
};

// this function changes UTC time to user's local time
export const utcToLocalTime = (utcDate: Date) => {
  const date = new Date(utcDate);

  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: userTimeZone,
  }).format(date);
};

//this function changes time from UTC to EAT
export const utcToEAT = (utcDate: Date) => {
  const date = new Date(utcDate);

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Nairobi",
  }).format(date);
};


// this function will is to loop between the pictures
export const getPicture = (id: number): string => {
  if (id <= 20) {
    return id.toString();
  } else {
    return (id % 20).toString();
  }
};
