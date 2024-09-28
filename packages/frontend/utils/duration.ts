export const duration = (cycleTime: number) => {
    const daysInYear = 365;
    const daysInMonth = 30;  // Approximate month duration
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
      result = years === 1 ? 'year' : `${years} yrs`;
    } else if (months > 0 && remainderMonths === 0) {
      result = months === 1 ? 'month' : `${months} months`;
    } else if (weeks > 0 && remainderWeeks === 0) {
      result = weeks === 1 ? 'week' : `${weeks} wks`;
    } else {
      result = cycleTime === 1 ? 'day' : `${cycleTime} dys`;
    }
  
    return result;
  };