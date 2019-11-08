const fs = require("fs");
const axios = require("axios");
const electron = require("electron");
const inquirer = require("inquirer");
const util = require("util");
const html = require('./generateHTML.js');
const colors = html.colors;


const writeFileAsync = util.promisify(fs.writeFile);
const appendFileAsync = util.promisify(fs.appendFile);

function  promptUser() {

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





async function init() {
    console.log("hi");
    try {
        const data = await promptUser();
console.log(data);
console.log(data.username);
        const res = await  axios.get("https://api.github.com/users/" + data.username);
        // console.log(res);
        console.log(colors[data.color]);
        const htmlGen1 = html.generateHTML1(data)

        await writeFileAsync("profile.html", htmlGen1);

        const htmlGen2 = html.generateHTML2(res);

        await appendFileAsync("profile.html",htmlGen2);
        console.log("Success");
  
        createPDF();
  
    } catch(err) {
        console.log(err);
    }
}

     

init();

function createPDF() {

window_to_PDF = new BrowserWindow({show : false});//to just open the browser in background
window_to_PDF.loadURL('profile.html'); //give the file link you want to display
function pdfSettings() {
    var paperSizeArray = ["A4", "A5"];
    var option = {
        landscape: false,
        marginsType: 0,
        printBackground: false,
        printSelectionOnly: false,
        pageSize: paperSizeArray[settingCache.getPrintPaperSize()-1],
    };
  return option;
}
window_to_PDF.webContents.printToPDF(pdfSettings(), function(err, data) {
    if (err) {
        //do whatever you want
        return;
    }
    try{
        fs.writeFileSync('./generated_pdf.pdf', data);
    }catch(err){
        //unable to save pdf..
    }
   
})
}