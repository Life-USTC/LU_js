// LU_js runtime with nodejs
var fs = require("fs");
var path = require("path");
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

// parse foldername from CLI arguments
var foldername = process.argv[2];
if (foldername == undefined) {
    foldername = "ustc";
}

// load ./ustc/main.js, ./ustc/declare.json
var mainjs = fs.readFileSync(path.join(__dirname, foldername, "main.js"), "utf-8");
var declarejson = JSON.parse(fs.readFileSync(path.join(__dirname, foldername, "declare.json"), "utf-8"));

var inputs = {};
var device_cache = {};

// load inputs cache under .cache/inputs.json
var inputs_cache_path = path.join(__dirname, ".cache", "inputs.json");

// create folder if .cache doesn't exists
if (!fs.existsSync(path.join(__dirname, ".cache"))) {
    fs.mkdirSync(path.join(__dirname, ".cache"));
}

if (!fs.existsSync(inputs_cache_path)) {
    // create file if inputs.json doesn't exists
    fs.writeFileSync(inputs_cache_path, "{}");

    // end if inputs.json doesn't exists
    console.log("inputs.json not found, please fill it and run again.");
    process.exit(0);
} else {
    // load inputs cache
    var inputs_cache = fs.readFileSync(inputs_cache_path, "utf-8");
    inputs = JSON.parse(inputs_cache);
}

// run main.js
eval(mainjs);

login_to_cas();
course_table();