function getDateShort (date : Date) {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = date.getDate();
    const monthIndex = date.getMonth();
    const year = date.getFullYear().toString();
    return `${day} ${monthNames[monthIndex]}'${year.slice(2)}`;
}

export {getDateShort}