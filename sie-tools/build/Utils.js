"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDateStringYYMMDD = exports.parseDateString = exports.formatDateYYYYMMDD = void 0;
const formatDateYYYYMMDD = (date, add = 0) => {
    const year = date.getFullYear() + add;
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
};
exports.formatDateYYYYMMDD = formatDateYYYYMMDD;
const parseDateString = (dateString) => {
    const parts = dateString.split('-');
    if (parts.length !== 3) {
        // Invalid date string format
        return null;
    }
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Months are zero-based in JavaScript
    const day = parseInt(parts[2], 10);
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
        // Invalid components
        return null;
    }
    return new Date(year, month, day);
};
exports.parseDateString = parseDateString;
const parseDateStringYYMMDD = (dateString) => {
    const parts = [];
    parts.push('20' + dateString.substring(0, 2));
    parts.push(dateString.substring(2, 4));
    parts.push(dateString.substring(4, 6));
    if (parts.length !== 3) {
        // Invalid date string format
        return null;
    }
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Months are zero-based in JavaScript
    const day = parseInt(parts[2], 10);
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
        // Invalid components
        return null;
    }
    return new Date(year, month, day);
};
exports.parseDateStringYYMMDD = parseDateStringYYMMDD;
//# sourceMappingURL=Utils.js.map