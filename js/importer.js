function Importer(){}

Importer.loadCsvFile = async function(file){
    const data = await file.text();
    const lines = data.split("\r\n"); //.split("\n\r").split("\n").split("\r");
    return lines;
}

Importer.loadTable = function(lines){
    const x = lines.length - 1;
    const y = lines[0].split(',').length;
    CreateTable(x,y);

    for(let i = 0; i < x; i++){
        const row = lines[i].split(',');
        for(let j = 0; j < y; j++){
            document.getElementById(i+":"+j).textContent = row[j];
        }
    }
}

Importer.loadCsv = async function(){
    const lines = await Importer.loadCsvFile(document.getElementById("csvfileinput").files[0]);
    Importer.loadTable(lines);
    openCsvModal.close();
}

var openCsvModal = new tingle.modal({
    footer: true,
    stickyFooter: false,
    closeMethods: ['overlay', 'button', 'escape'],
    closeLabel: "Zamknij"
});

Importer.openCsvModal = function(){
    
    openCsvModal.setContent('<input type="file" id="csvfileinput" onchange="Importer.loadCsv(this)" />');
    openCsvModal.open();
}

/*
LATEX SECTION
*/
Importer.openLatexModal = function(){
    openCsvModal.setContent('<textarea id="latexInput"></textarea><button onclick="Importer.loadLatex()">Importuj</button>');
    openCsvModal.open();
}

Importer.loadLatex = function(){
    let cols;
    let rowsCount;
    let colsSpec;
    let colsExtras;
    let vlines;

    let code = document.querySelector("#latexInput").value;
    //openCsvModal.close();

    //gdzie zaczyna sie tabular
    const tabularIdx = code.search("\\\\begin{tabular}");
    const header = Importer.getToEnd(code, tabularIdx+"begin{tabular}".length+2);
    console.log(header);
    const headerResults = Importer.manageHeader(header);
    cols=headerResults[0];
    vlines=headerResults[1];
    colsSpec=headerResults[2];
    colsExtras=headerResults[3];
    
    //clear code
    code = code.replace(code.substring(0,tabularIdx), "");
    code = code.replace("\\begin{tabular}{"+header+"}", "");
    code = code.replace("\\end{tabular}", "");
    code = code.replace("\\end{table}", "").trim();

    //rows count
    const rows = code.split("\\\\");
    rowsCount = rows.length - 1;
    
    //create table
    CreateTable(rowsCount, cols);
    const table = document.getElementById("mainTable");
}
//zwraca caly tekst az do zamkniecia klamerek
Importer.getToEnd = function(code, idx){
    let result = "";
    let i = 0;
    let adds = 0;
    while(code.length > idx + i){//code[idx+i] != '}' && ads == 0
        if(code[idx+i] == '{'){
            adds++;
            result += '{';
        }
        else if(code[idx+i] == '}'){
            if(adds>0){
                adds--;
                result += '}';
            } else {
                break;
            }
        } else {
            result += code[idx+i];
        }
        i++;
    }
    return result;
}
//liczy ilość kolumn, zapisuje wyrównanie kolumn oraz sprawdza vlines
Importer.manageHeader = function(code){
    let cols = 0;
    const vlines = [];
    const colsSpec = [];
    const colsExtras = [];

    //get cols count and spec
    const validSpec = ['l', 'r', 'c'];
    const skipSpec = ['m', 'p', 'b'];
    for(let i = 0; i < code.length; i++){
        if(skipSpec.includes(code[i])){
            cols++;
            colsSpec.push(code[i]);
            const wdth = Importer.getToEnd(code, i+2);
            colsExtras.push(wdth);
            i += wdth.length + 1;
        }
        if(validSpec.includes(code[i])){
            cols++;
            colsSpec.push(code[i]);
        }
    }
    //get vlines

    return [cols,vlines,colsSpec,colsExtras];
}