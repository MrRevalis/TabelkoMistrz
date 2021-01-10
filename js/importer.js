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

    Importer.insertColSpec(colsSpec, colsExtras);

    let allVLines = false;
    if(!vlines.includes(0)){
        TableBorderChange(['0', '1']);
        allVLines = true;
    }

    for(let i = 0; i < table.rows.length; i++){
        const thisRow = rows[i].replace("\\&", "<,UMPERDAND.>").split("&");
        const rowSpec = Importer.manageFirstCell(thisRow[0]);
        thisRow[0] = Importer.clearFirstCell(thisRow[0], rowSpec);

        let tborders = [];
        //get cols with top borders
        if(rowSpec[0]){
            if(rowSpec[0][0] != -1)
            tborders = Importer.getIdFromCline(rowSpec[0]);
            else {
                for(let i=0;i<cols;i++) tborders.push(i);
            }
        }
        
        //loop throunght cells in row
        let col = 0;
        for(let j = 0; j < thisRow.length; j++){
            const cell = document.getElementById(i+":"+col);
            let colspan = 1;
            if(cell){
                let cellContent = thisRow[j].replace("<,UMPERDAND.>", "&");
                //check for multi -column and -row
                const cmd = Importer.getCommand(cellContent.trim(), 1);
                if(cmd[0] == "multicolumn"){
                    colspan = parseInt(cmd[1][0]);
                    pierwszaKomorka = i+":"+col;
                    ostatniaKomorka = i+":"+(col+colspan-1);
                    wybranaKomorka = i+":"+col;
                    ScalKomorki();
                    cellContent = cmd[1][2];
                    //set right border
                    if(!allVLines && (vlines[col+colspan] == 1 || cmd[1][1][cmd[1][1].length-1] == '|')){
                        wybranaKomorka = i+":"+col;
                        AddBorderToCell(['0','0','1','0']);
                    }
                    //set left border
                    if(cmd[1][1][0] == '|' && cell.style.borderLeftStyle == "dashed"){
                        wybranaKomorka = i+":"+col;
                        AddBorderToCell(['1','0','0','0']);
                        wybranaKomorka = i+":"+(col-1); //and right of col - 1
                        AddBorderToCell(['0','0','1','0']);
                    }
                }
                
                cell.textContent = cellContent;
                
                //set top border
                if(tborders.includes(col)){
                    wybranaKomorka = i+":"+col;
                    AddBorderToCell(['0','1','0','0']);
                    wybranaKomorka = (i-1)+":"+col; //and bottom in i-1 row
                    AddBorderToCell(['0','0','0','1']);
                    wybranaKomorka = null;
                }
                if(!allVLines){
                    //set left border
                    if(vlines[col] == 1){
                        wybranaKomorka = i+":"+col;
                        AddBorderToCell(['1','0','0','0']);
                        wybranaKomorka = i+":"+(col-1); //and right of col - 1
                        AddBorderToCell(['0','0','1','0']);
                    }
                    //set right border on last col
                    if(col == cols - 1 && vlines[cols] == 1){
                        wybranaKomorka = i+":"+col;
                        AddBorderToCell(['0','0','1','0']);
                    }
                }
            }
            col+=colspan;
        }

        //set row height
        if(rowSpec[1]){
            document.getElementById("h:"+(i-1)).textContent = rowSpec[1].replaceAll(" ", "");
            heightTooBarArray[i-1] = "["+rowSpec[1].replaceAll(" ", "")+"]";
        }
    }
    //last row ending hline
    const rowSpec = Importer.manageFirstCell(rows[rowsCount]);
    let tborders = [];
    if(rowSpec[0]){
        if(rowSpec[0][0] != -1){
            tborders = Importer.getIdFromCline(rowSpec[0]);
            for(let i=0;i<tborders.length;i++){
                wybranaKomorka = (rowsCount-1)+":"+tborders[i];
                AddBorderToCell(['0','0','0','1']);
            }
        } else {
            for(let i=0;i<cols;i++){
                wybranaKomorka = (rowsCount-1)+":"+i;
                AddBorderToCell(['0','0','0','1']);
            }
        }
        wybranaKomorka = null;
    }
    //set last row height
    if(rowSpec[1]){
        document.getElementById("h:"+(rowsCount-1)).textContent = rowSpec[1].replaceAll(" ", "");
        heightTooBarArray[rowsCount-1] = "["+rowSpec[1].replaceAll(" ", "")+"]";
    }
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
    let pos = 0;
    for(let i = 0; i < code.length; i++){
        if(validSpec.includes(code[i])){
            if(code[i-1] == '|'){
                vlines.push(1);
            } else {
                vlines.push(0);
            }
        }
        if(skipSpec.includes(code[i])){
            if(code[i-1] == '|'){
                vlines.push(1);
            } else {
                vlines.push(0);
            }
            i += Importer.getToEnd(code, i+2).length + 1;
        }
    }
    if(code[code.length-1] == '|'){
        vlines.push(1);
    } else {
        vlines.push(0);
    }

    return [cols,vlines,colsSpec,colsExtras];
}
//zwraca komende w podanym kodzie na podanym miejscu oraz argument
Importer.getCommand = function(code, idx){
    const knownCommandsNA = ["hline"];
    const knownCommandsWA = ["cline", "textbf"];
    const knownCommandsTA = ["multicolumn", "multirow"];
    let cmd = "";
    let arg = "";
    let cmdReady = false;
    let moreArgs = false; // 1<x<4
    const args = [];

    for(let i = idx; i < code.length; i++){
        if(!cmdReady){
            cmd += code[i];
            if(knownCommandsNA.includes(cmd)){
                return [cmd, null];
            } else if(knownCommandsWA.includes(cmd)){
                cmdReady = true;
            } else if(knownCommandsTA.includes(cmd)){
                cmdReady = true;
                moreArgs = true;
            }
        } else {
            if(code[i] == '{'){
                if(moreArgs){
                    arg = Importer.getToEnd(code, i+1);
                    args.push(arg);
                    i+=arg.length;
                    if(args.length == 3) return [cmd, args];
                } else {
                    arg = Importer.getToEnd(code, i+1);
                    return [cmd, arg];
                }
            }
        }
    }
    return [undefined, null];
}
//pobiera dane o \hlines i \clines oraz o height
Importer.manageFirstCell = function(code){
    const hlines = [];
    let height;
    let lineIdx = null;

    for(let i = 0; i<code.length; i++){
        if(code[i] == "\\"){
            const cmd = Importer.getCommand(code, i+1);
            if(cmd[0] == "hline"){
                hlines.push(-1);
                if(lineIdx == null) lineIdx = i;
            } else if(cmd[0] == "cline"){
                hlines.push(cmd[1]);
                if(lineIdx == null) lineIdx = i;
            }
        }
        else if(code[i] == '['){
            if(lineIdx == null){
                //get height
                let j = i+1;
                let hgh = "";
                while(code[j]!=']'){
                    hgh += code[j++];
                }
                height = hgh;
                lineIdx = i;
            }
        } else if(lineIdx == null){
            var regex = /^\s*\S+(\s?\S)*\s*$/;
            if(regex.test(code[i])) lineIdx = i;
        }
    }
    return [hlines, height];
}
//usuwa komendy
Importer.clearFirstCell = function(content, tab){
    let result = content;
    if(tab[1]){
        result = result.replace("[", "");
        result = result.replace(tab[1], "");
        result = result.replace("]", "");
    }
    if(tab[0]){
        if(tab[0][0] == -1){
            result = result.replace("\\hline", "");
        } else {
            for(let c = 0; c < tab[0].length; c++){
                result = result.replace("\\cline{"+tab[0][c]+"}", "");
            }
        }
    }
    return result.trim();
}
//przekszalca dane z cline na indexy kolumn
Importer.getIdFromCline = function(code){
    const ids = [];
    for(let c = 0; c < code.length; c++){
        const val = code[c].split('-');
        for(let i = parseInt(val[0].trim()) - 1; i < parseInt(val[1].trim()); i++){
            ids.push(i);
        }
    }
    return ids;
}
//ustawia specyfikacje kolumn
Importer.insertColSpec = function(spec, extras){
    let e = 0;
    const useExtra = ['m','p','b'];
    const toolbar = document.querySelectorAll("#toolBarTable tr > td");
    for(let i = 0; i<spec.length; i++){
        if(useExtra.includes(spec[i])){
            const val = spec[i]+"{"+extras[e++]+"}";
            toolbar.item(i).textContent = val;
            contentToolBar[i] = val;
        } else {
            toolbar.item(i).textContent = spec[i];
            contentToolBar[i] = spec[i];
        }
    }
}