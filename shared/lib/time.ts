export function formatToLocalDateTime(isoString: string) {
  const date = new Date(isoString);

  const year = date.getFullYear();
  const month = date.getMonth() + 1; // getMonth() returns 0-11
  const day = date.getDate();
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'

  const monthFormatted = month < 10 ? `0${month}` : month;
  const dayFormatted = day < 10 ? `0${day}` : day;
  const minutesFormatted = minutes < 10 ? `0${minutes}` : minutes;

  return `${year}-${monthFormatted}-${dayFormatted} ${hours}:${minutesFormatted} ${ampm}`;
}
