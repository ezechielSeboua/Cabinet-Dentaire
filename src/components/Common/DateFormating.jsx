const formatDate = (dateString) => {
  if (!dateString) return "";

  try {
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  } catch (e) {
    return dateString; // Return original if format doesn't match
  }
};
export default formatDate;
