let fs = require('fs');

function mergeJsonFiles(json1, json2) {
    Object.keys(json2).forEach((key) => {
        if (!json1[key]) {
            json1[key] = json2[key];
        }
    });
    return json1;
}

if (process.argv[2] == '--help') {
    console.log("Usage: node merge-json.js destiny_file.json source_file.json");
    return;
}

let file1, file2;

if (process.argv.length >= 4) {
    file1 = process.argv[2];
    file2 = process.argv[3];
    
} else {
    file1 = '../src/assets/i18n/pt-BR.json';
    file2 = '../src/assets/i18n/template.json';
}
let json1 = JSON.parse(fs.readFileSync(file1));
const json2 = JSON.parse(fs.readFileSync(file2));

json1 = mergeJsonFiles(json1, json2);

const json_string = JSON.stringify(json1, null, '  ');
fs.writeFileSync(file1 + '.new', json_string);