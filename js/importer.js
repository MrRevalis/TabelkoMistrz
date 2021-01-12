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
    openCsvModal.setContent('<h3>Wybierz plik:</h3><input type="file" id="csvfileinput" onchange="Importer.loadCsv(this)" />');
    openCsvModal.open();
}

/*
LATEX SECTION
*/
var openLatexModal = new tingle.modal({
    footer: true,
    stickyFooter: false,
    closeMethods: ['overlay', 'button', 'escape'],
    closeLabel: "Zamknij"
});
openLatexModal.addFooterBtn('Importuj', 'tingle-btn tingle-btn--primary tingle-btn--pull-right', function() {
    if(Importer.loadLatex() == -1){
        const element = document.createElement("p");
        element.classList.add("error");
        element.textContent = "Nie można odnaleźć tabeli w podanym kodzie!";
        document.querySelector(".importModal").prepend(element);
    }
    else openLatexModal.close();
});
openLatexModal.addFooterBtn('Anuluj', 'tingle-btn tingle-btn--default tingle-btn--pull-right', function() {
    openLatexModal.close();
});
Importer.openLatexModal = function(){
    openLatexModal.setContent('<div class="importModal"><h3>Kod LaTeX:</h3><textarea rows=10 id="latexInput"></textarea></div>');
    openLatexModal.open();
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
    if(tabularIdx == -1) return -1;
    const header = Importer.getToEnd(code, tabularIdx+"begin{tabular}".length+2);
    console.log(header);
    const headerResults = Importer.manageHeader(header.replaceAll(" ",""));
    cols=headerResults[0];
    vlines=headerResults[1];
    colsSpec=headerResults[2];
    colsExtras=headerResults[3];

    //caption and label
    const captionIdx = code.search("\\\\caption");
    let caption;
    if(captionIdx >= 0) caption = Importer.getToEnd(code, captionIdx+"caption".length+2);
    const captionLocation = captionIdx < tabularIdx ? "top" : "bottom";

    const labelIdx = code.search("\\\\label");
    let label;
    if(labelIdx >= 0) label = Importer.getToEnd(code, labelIdx+"label".length+2);
    
    //clear code
    code = code.replace(code.substring(0,tabularIdx), "");
    code = code.replace("\\begin{tabular}{"+header+"}", "");
    if(captionLocation != "top") code = code.replace("\\caption{"+caption+"}", "");
    code = code.replace("\\label{"+label+"}", "");
    code = code.substring(0, code.search("\\\\end{tabular}")).trim();

    //rows count
    const rows = code.split("\\\\");
    rowsCount = rows.length - 1;
    
    //create table
    CreateTable(rowsCount, cols);
    const table = document.getElementById("mainTable");

    if(caption){
        document.querySelector("#caption").value = caption;
        //to do location
    }
    if(label) document.querySelector("#label").value = label;

    Importer.insertColSpec(colsSpec, colsExtras);

    let allVLines = false;
    if(!vlines.includes(0)){
        TableBorderChange(['0', '1']);
        allVLines = true;
    }

    for(let i = 0; i < table.rows.length; i++){
        const thisRow = rows[i].replaceAll("\\&", "<,UMPERDAND.>").split("&");
        const rowSpec = Importer.manageFirstCell(thisRow[0]);
        thisRow[0] = Importer.clearFirstCell(thisRow[0], rowSpec);
        let rowColor = undefined;

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
                let cellContent = thisRow[j].replaceAll("<,UMPERDAND.>", "\\&");
                //check for multi -column and -row
                let cmd = Importer.getCommand(cellContent.trim(), 1);
                if(cmd[0] == "multicolumn"){
                    colspan = parseInt(cmd[1][0]);
                    let rowspan = 1;
                    const interCmd = Importer.getCommand(cmd[1][2].trim(), 1);
                    if(interCmd[0] == "multirow"){
                        rowspan = parseInt(interCmd[1][0]);
                        cellContent = interCmd[1][2];
                    } else {
                        cellContent = cmd[1][2];
                    }
                    pierwszaKomorka = i+":"+col;
                    ostatniaKomorka = (i+rowspan-1)+":"+(col+colspan-1);
                    wybranaKomorka = i+":"+col;
                    ScalKomorki();

                    //set align
                    wybranaKomorka = i+":"+col;
                    switch(cmd[1][1].replaceAll('|', '')){
                        case "l": ChangeTextAlign(['1','0','0','0']); break;
                        case "c": ChangeTextAlign(['0','1','0','0']); break;
                        case "r": ChangeTextAlign(['0','0','1','0']); break;
                    }
                    wybranaKomorka = null;
                    
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
                } else if(cmd[0] == "multirow"){
                    const rowspan = parseInt(cmd[1][0]);
                    pierwszaKomorka = i + ":" + col;
                    ostatniaKomorka = (i+rowspan-1) + ":" + col;
                    wybranaKomorka = i + ":" + col;
                    ScalKomorki();
                    cellContent = cmd[1][2];
                }
                
                //manage colours
                cmd = Importer.getCommand(cellContent.trim(), 1);
                if(col == 0 && cmd[0] == "rowcolor"){
                    const rowColorVal = Importer.setRowColor(cmd[1], i, col);
                    cellContent = cellContent.replace(rowColorVal[0], "");
                    rowColor = rowColorVal[1];
                    cmd = Importer.getCommand(cellContent.trim(), 1);
                }
                if(rowColor){
                    cellsColorTable[i][col] = rowColor;
                    document.getElementById(i+":"+col).style.backgroundColor = rowColor;
                }
                if(cmd[0] == "cellcolor"){
                    const replaceCellColorVal = Importer.setCellColor(cmd[1], i, col);
                    cellContent = cellContent.replace(replaceCellColorVal, "");
                    cellContent.trim();
                }

                const cellmanged = Importer.manageCell(cellContent);
                cell.textContent = cellmanged[0];
                //do bold, italic, underline cmds
                wybranaKomorka = i+":"+col;
                cellmanged[1].forEach(element => {
                    switch(element){
                        case "textbf": FontBold(cell); break;
                        case "emph": ItalicFont(cell); break;
                        case "underline": UnderLineFont(cell); break; 
                    }
                    Importer.setFontSize(element, i, col);
                });
                wybranaKomorka = null;
                
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
            } else{ //move current col id when it is multirowed cell in multirow
                let cellContent = thisRow[j].replace("<,UMPERDAND.>", "&");
                //check for multicolumn
                const cmd = Importer.getCommand(cellContent.trim(), 1);
                if(cmd[0] == "multicolumn"){
                    colspan = parseInt(cmd[1][0]);
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
    const knownCommandsNA = ["hline", "$", "%", "&", "#", "_", "{", "}", "backslash"]; //brak argumentow
    const knownCommandsWA = ["cline", "textbf", "emph", "underline", "tiny", "scriptsize", "footnotesize", "small", "normalsize", "large", "Large", "LARGE", "huge", "Huge", "~", "^"]; //jeden argument
    const knownCommandsTA = ["multicolumn", "multirow"]; //3 argumenty
    const knownCommandsWO = ["cellcolor", "rowcolor"]; //1 arg z opcjami
    let cmd = "";
    let arg = "";
    let cmdReady = false;
    let moreArgs = false; // 1<x<4
    let extraOptions = false;
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
            } else if(knownCommandsWO.includes(cmd)){
                cmdReady = true;
                extraOptions = true;
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
                    if(extraOptions){
                        args.push(arg);
                        return [cmd, args];
                    } else return [cmd, arg];
                }
            } else if(code[i] == '[' && args.length == 0){
                let option = "";
                let j = i+1;
                while(code[j] != ']'){
                    option += code[j++];
                }
                args.push(option);
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
        ChangeCellsTextAlign(i, spec[i]);
    }
}

const colorNames = ["red", "green", "blue", "cyan", "magenta", "yellow", "orange", "violet", "purple", "brown", "pink", "olive", "black", "darkgray", "gray", "lightgray", "teal", "lime"];
const colorHTMLCodes = ["FF0000", "00FF00", "0000FF", "00FFFF", "FF00FF", "FFFF00", "FF8000", "800080", "BF0040", "BF8040", "FFBFBF", "808000", "000000", "404040", "808080", "BFBFBF", "008080", "BFFF00"];
const colorRGBCodes = ["1,0,0", "0,1,0", "0,0,1", "0,1,1", "1,0,1", "1,1,0", "1,0.5,0", "0.5,0,0.5", "0.75,0,0.25", "0.75,0.5,0.25", "1,0.75,0.75", "0.5,0.5,0", "0,0,0", "0.25,0.25,0.25", "0.5,0.5,0.5", "0.75,0.75,0.75", "0,0.5,0.5", "0.75,1,0"];
const colorCmykCodes = ["0,1,1,0", "1,0,1,0", "1,1,0,0", "1,0,0,0", "0,1,0,0", "0,0,1,0", "0,0.5,1,0", "0,0.5,0,0.5", "0,0.75,0.5,0.25", "0,0.25,0.5,0.25", "0,0.25,0.25,0", "0,0,1,0.5", "0,0,0,1", "0,0,0,0.75", "0,0,0,0.5", "0,0,0,0.25", "0.5,0,0,0.5", "0.25,0,1,0"];

Importer.setCellColor = function(args, row, col){
    let option = null;
    let color;
    let returnVal = "\\cellcolor";
    if(args.length > 1){
        option = args[0];
        color = args[1];
        returnVal += "["+option+"]{"+color+"}";
        switch(option){
            case "HTML":
            case 'html':
                color = "#"+color;   
            break;
            case 'rgb':
                let resultR = [];
                let valuesR = color.split(',');
                valuesR.forEach(element => {
                    resultR.push(parseFloat(element)*255);
                });
                color = "rgb("+resultR.join(',') + ")";
            break;
            case 'RGB':
                color = "rgb("+color+")";
            break;
            case "CMYK":
            case 'cmyk':
                let valuesC = color.split(',');
                let resultC = [];
                valuesC.forEach(element => {
                    resultC.push(element.trim()); 
                });
                const idx = colorCmykCodes.indexOf(resultC.join(','));
                if(idx >= 0){
                    color = "#"+colorHTMLCodes[idx];
                } else color = undefined;
            break;
        }
    } else {
        returnVal += "{"+args[0]+"}";
        color = Importer.translateColor(args[0]);
    }
    
    //set color
    if(color){
        cellsColorTable[row][col] = color;
        document.getElementById(row+":"+col).style.backgroundColor = color;
    }
    return returnVal;
}

Importer.translateColor = function(color){
    let aColor;
    let transparency;
    if(color.includes('!')){
        const tab = color.split('!');
        aColor = tab[0];
        transparency = tab[1];
    } else {
        aColor = color;
    }
    
    if(transparency){
        const idx = colorNames.indexOf(aColor);
        if(idx >= 0){
            let result = "";
            const values = colorRGBCodes[idx].split(',');
            values.forEach(element => {
                result += (parseFloat(element)*255) + ',';
            });
            return "rgba("+result+"0."+transparency+")";
        } else return undefined;
    } else {
        const idx = colorNames.indexOf(aColor);
        if(idx >= 0){
            return "#"+colorHTMLCodes[idx];
        } else return undefined;
    }
}

Importer.setRowColor = function(args){
    let option = null;
    let color;
    let returnVal = "\\rowcolor";
    if(args.length > 1){
        option = args[0];
        color = args[1];
        returnVal += "["+option+"]{"+color+"}";
        switch(option){
            case "HTML":
            case 'html':
                color = "#"+color;   
            break;
            case 'rgb':
                let resultR = [];
                let valuesR = color.split(',');
                valuesR.forEach(element => {
                    resultR.push(parseFloat(element)*255);
                });
                color = "rgb("+resultR.join(',') + ")";
            break;
            case 'RGB':
                color = "rgb("+color+")";
            break;
            case "CMYK":
            case 'cmyk':
                let valuesC = color.split(',');
                let resultC = [];
                valuesC.forEach(element => {
                    resultC.push(element.trim()); 
                });
                const idx = colorCmykCodes.indexOf(resultC.join(','));
                if(idx >= 0){
                    color = "#"+colorHTMLCodes[idx];
                } else color = undefined;
            break;
        }
    } else {
        returnVal += "{"+args[0]+"}";
        color = Importer.translateColor(args[0]);
    }
    
    return [returnVal, color];
}

Importer.manageCell = function(content){
    const cmds = [];
    let cell = content;
    for(let i = 0; i < content.length; i++){
        if(cell[i] == "\\"){
            const cmd = Importer.getCommand(cell, i+1);
            if(cmd[0]){
                if(cmd[1]){
                    cmds.push(cmd[0]);
                    cell = cell.replace("\\"+cmd[0]+"{"+cmd[1]+"}", cmd[1]);
                } else if(cmd[1] == ""){
                    cell = cell.replace("\\"+cmd[0]+"{}", cmd[0]);
                }else {
                    if(cmd[0] == "backslash")
                        cell = cell.replace("$\\backslash$", "\\");
                    else
                        cell = cell.replace("\\"+cmd[0], cmd[0]);
                }
            }
        }
    }
    return [cell, cmds];
}

Importer.setFontSize = function(cmd, row, col){
    const cell = document.getElementById(row+":"+col);
    if(cell){
        let size;
        switch(cmd){
            case "tiny": size = 6; break;
            case "scriptsize": size = 8; break;
            case "footnotesize": size = 9; break;
            case "small": size = 10; break;
            case "large": size = 12; break;
            case "Large": size = 14; break;
            case "LARGE": size = 17; break;
            case "huge": size = 20; break;
            case "Huge": size = 25; break;
        }
        size += "pt";
        cell.style.fontSize = Converter_pt_px(size);
    }
}