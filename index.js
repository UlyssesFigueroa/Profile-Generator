const fs = require("fs");
var pdf = require('html-pdf');
const axios = require("axios");
const electron = require("electron");
// const BrowserWindow = electron.remote.BrowserWindow;
const inquirer = require("inquirer");
const util = require("util");
const html = require('./generateHTML.js');
const colors = html.colors;


const writeFileAsync = util.promisify(fs.writeFile);
// const readFileAsync = util.promisify(fs.readFile);

function promptUser() {

  return inquirer.prompt([
    {
      type: "input",
      name: "username",
      message: "What is your Github username?",
    },
    {
      type: "checkbox",
      message: "what is your favorite color?",
      name: "color",
      choices: [
        "green",
        "blue",
        "pink",
        "red",
      ]
    },
  ])

}


function getUserAccount(data) {
  return axios.get(`https://api.github.com/users/${data.username}?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&per_page=100`);
}

function getUserPermissions(data) {
  var starz = 0;
  return axios.get(`https://api.github.com/users/${data.username}/repos?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&per_page=20`)
    .then(function (req) {
      for (let i = 0; i < req.data.length; i++) {
        var starCount = req.data[i].stargazers_count;
        starz += starCount;
      }
      return starz;
    });
};


async function init() {
  console.log("hi");
  try {
    const data = await promptUser();


    axios.all([getUserAccount(data), getUserPermissions(data)])
      .then(axios.spread(function (res, response) {
        const htmlGen1 = html.generateHTML1(data, res, response);

        writeFileAsync("profile.html", htmlGen1);
        // Both requests are now complete

      }))
    createPDF();

    console.log("Success");

  } catch (err) {
    console.log(err);
  }
}


function createPDF() {
  setTimeout(function () {
    var html = fs.readFileSync('./profile.html', 'utf8');
    var options = { format: 'Letter' };
    pdf.create(html, options).toFile('./profile.pdf', function (err, res) {
      if (err) return console.log(err);
      console.log(res);
    })
  }, 2000);
}

init();
