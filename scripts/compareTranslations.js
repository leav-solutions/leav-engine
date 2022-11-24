// A function that compares the keys of 2 json files recursively
// and outputs the keys that are missing in the second file
// Usage: node compare_translations.js <file1> <file2>
// Example: node compare_translations.js en.json fr.json
const file1 = process.argv[2];
const file2 = process.argv[3];

if (!file1 || !file2) {
    console.error(`
        This scripts compares the keys of 2 json files recursively and outputs the keys that are missing in the second file.

        Usage: compareTranslations.js <file1> <file2>
    `);

    process.exit(1);
}

const json = require(file1);
const json2 = require(file2);

const compare = (obj1, obj2, path = []) => {
    Object.keys(obj1).forEach(key => {
        if (typeof obj1[key] === 'object') {
            if (obj2[key]) {
                compare(obj1[key], obj2[key], [...path, key]);
            } else {
                console.info(`Missing ${path.join('/')}/${key}`);
            }
        } else if (!obj2[key]) {
            console.info(`Missing ${path.join('/')}/${key}`);
        }
    });
};
compare(json, json2);
