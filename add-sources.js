import { Octokit } from "octokit";
import { fetch } from 'node-fetch';
import { readFile, writeFile } from "fs";

const pageCount = 100;
const maxFiles = 10000;

const fileName = "sources.json";

const allowedLanguages = [
    "JavaScript",
    "HTML",
    "C++",
    "Python",
    "TypeScript",
    "CSS",
    "Dart",
    "C",
    "C#",
    "Go",
    "Java",
    "PHP",
    "Shell",
    "SQL",
    "Elixir",
    "PowerShell",
    "Ruby",
    "Rust",
    "Swift",
    "R",
    "Lua",
    "Zig",
    "Coq",
    "Objective-C",
    "Elm",
    "Scala",
    "Kotlin",
    "Assembly",
    "D",
]
    // "Vue",
    // "Pug",
    // "Fluent",
    // "AutoIt",
    // "Raku",
    // "ColdFusion",
    // "HLSL",
    // "Emacs Lisp",
    // "Sage",
    // "Liquid",
    // "Awk",
    // "Tcl",
    // "Typst",

const validFileSize = chars => chars > 100 && chars < 50000;

const octokit = new Octokit({
	auth: process.env.GITHUB_TOKEN
});

function getGist(page) {
	return octokit.request("https://api.github.com/gists/public?page={page}", {
		page: page
	});
}

function getFiles(page) {
    return page["data"].map(v => v["files"]).flat(1).map(Object.values).flat(1);
}

function filterFile(file) {
    return allowedLanguages.includes(file["language"]) && validFileSize(file["size"]);// && !file["raw_url"].contains("Untrusted-Game"); // TODO
}

function loadFile(file) {
    return fetch(file["raw_url"]).then(req => req.text()).then(text => {
        return {
            language: file["language"],
            url: file["raw_url"],
            text: text
        }
    });
}

let pages = await Promise.all([...Array(pageCount).keys()].map(getGist));

let files = pages.map(getFiles).flat(1).filter(filterFile).slice(0, maxFiles);

let fileValues = await Promise.all(files.map(loadFile));

let mapped = Object.fromEntries(fileValues.map(i => [i["url"], i]));

readFile(fileName, "UTF-8", (err, data) => {
    if (err) {
        console.log("Error reading file: " + err);
        return;
    }

    let rawJSON = JSON.parse(data);

    let obj = {...rawJSON, ...mapped};

    let keys = [...Object.keys(obj)];
    console.log(keys);
    for (let key of keys) {
        if (key.includes("Untrusted-Game")) {
            delete obj[key];
        }
    }

    writeFile(fileName, JSON.stringify(obj), "UTF-8", err => {
        if (err != null) console.log("Error writing file: " + err)
    });
})
