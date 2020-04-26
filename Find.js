/**
 * @summary Deep searches given key in the given object.
 * @param {object} obj The object to be deep searched.
 * @param {string} key The key to deep search in the object.
 * 
 */
module.exports = function find(key, obj) {

    return keyToFind(key);

    function keyToFind(key) {
        var result = {};

        Object.keys(obj).forEach(el => {
            if (el === key) {
                result = obj[el];
            } else if (typeof obj[el] == 'object') {
                result = find(key, obj[el]);
            }
        });

        return result;
    }

}