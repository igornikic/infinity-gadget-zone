export const formatDate = (date) => {
  // en-GB is British order that goes dd/mm/yyyy
  const options = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  return options.format(new Date(date));
};
