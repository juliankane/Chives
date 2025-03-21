// File: ./utility/MappingFunctions.js
function getNameFromID(ids) {
    if (Array.isArray(ids)) {
        return ids.map(id => `<@${id}>`);
    } else {
        return `<@${ids}>`;
    }
}

// Correct export
module.exports = { getNameFromID };