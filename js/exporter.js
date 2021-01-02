function Exporter(){}
Exporter.Foo = function(){
    console.log("hello world");
}

Exporter.genLatexCode = function(){
    wybranaKomorka = null;
    WyczyscStyl();
    const table = document.getElementById("mainTable");
    const rows = table.rows.length;
    
    const allBorders = Exporter.priv.CheckTableBorders("allEdges");
    const horizontalBorders = Exporter.priv.CheckTableBorders("horizontalEdges");
    const verticalBorders = Exporter.priv.CheckTableBorders("verticalEdges");
    let noHorizontalLines = [];
    if(horizontalBorders) noHorizontalLines = Exporter.priv.checkRowSpan(table);

    let hlines = [];
    if(!allBorders || !horizontalBorders) hlines = Exporter.priv.getBorders(table.rows.length, tableCols);

    let code = [];
    code.push("\\begin{table}");
    code.push(Exporter.priv.createTableHeader(tableCols, allBorders, verticalBorders, horizontalBorders, hlines[0]));
    for(let i = 0; i < rows; i++){
        let row = [];
        for(let j = 0; j < tableCols; j++){
            const cell = document.getElementById(i+":"+j);
            if(cell != null){
                let result = cell.textContent;
                //check font weight XD
                if(cell.style.fontWeight == "bold"){
                    result = "\\textbf{"+result+"}";
                }

                if(cell.style.fontStyle == "italic"){
                    result = "\\emph{"+result+"}";
                }

                if(cell.style.textDecoration == "underline"){
                    result = "\\underline{"+result+"}";
                }
                
                //Rozwala całkowicie widok :)
                /*let fontType = Exporter.priv.getTextSize(cell.style.fontSize);
                result = "{\\fontsize{"+fontType+"}{"+fontType+"}\\selectfont "+result+"}";*/

                //check text color
                if(cell.style.color != ""){
                    result = "\\textcolor[RGB]{"+cell.style.color.replace("rgb(","").replace(")","")+"}{"+result+"}";
                }
                //check cell color
                if(cell.style.backgroundColor != "white" && cell.style.backgroundColor != ""){
                    result = "\\cellcolor[RGB]{"+cell.style.backgroundColor.replace("rgb(","").replace(")","")+"}"+result;
                }
                //check multirow
                if(cell.rowSpan > 1){
                    result = "\\multirow{" + cell.rowSpan + "}{*}{" + result + "}";
                }
                //check multicol
                if(cell.colSpan > 1){
                    let border = "l";
                    if(allBorders || verticalBorders) if(j == 0) border = "|l|"; else border = "l|";
                    result = "\\multicolumn{" + cell.colSpan + "}{" + border + "}{" + result + "}";
                    j += cell.colSpan-1;
                }
                row.push(result);
            } else {
                const shift = Exporter.priv.getColsInMR(i, j);
                if(shift != null){
                    if(shift == 1){
                        row.push("");
                    } else{
                        let border = "l";
                    if(allBorders || verticalBorders) if(j == 0) border = "|l|"; else border = "l|";
                        row.push("\\multicolumn{" + shift + "}{" + border + "}{}");
                    }
                }
            }
        }
        if((allBorders == true || horizontalBorders == true) && !noHorizontalLines.includes(i) || hlines[i+1].countElement(1) == tableCols){
            code.push(row.join(" & ") + "\\\\" + "\\hline");
        }
        else if(noHorizontalLines.includes(i)){
            let clines = "";
            const clinesTab = Exporter.priv.getClines(i);
            for(let c = 0; c < clinesTab.length; c++) clines += "\\cline{"+clinesTab[c]+"}";
            code.push(row.join(" & ") + "\\\\" + clines);
        } else if(hlines[i+1].includes(1)){
            let clines = "";
            const clinesTab = Exporter.priv.getClinesFromArray(hlines[i+1]);
            for(let c = 0; c < clinesTab.length; c++) clines += "\\cline{"+clinesTab[c]+"}";
            code.push(row.join(" & ") + "\\\\" + clines);
        }
        else
            code.push(row.join(" & ") + "\\\\");
    }
    code.push("\\end{tabular}", "\\end{table}");
    console.log(code.join("\n"));

    //show
    document.querySelector("#latexCode").textContent = code.join("\n");
    Prism.highlightElement(document.querySelector("#latexCode"));
    document.querySelector("#latexCode").parentElement.style.display = "block";
}

Exporter.priv = function(){}

Exporter.priv.createTableHeader = function(cols, allBorders, verticalBorders, horizontalBorders, borderRow){
    let code = "\\begin{tabular}{";
    var text = "l";
    if(allBorders == true || verticalBorders == true) text = "|l";
    for(let i = 0; i < cols; i++) code += text;

    if(allBorders==true || verticalBorders == true)code+="|";
    code += "}";

    if(allBorders == true || horizontalBorders == true || borderRow.countElement(1) == tableCols) code+="\\hline";
    else if(borderRow.includes(1)){
        let clines = "";
        const clinesTab = Exporter.priv.getClinesFromArray(borderRow);
        for(let c = 0; c < clinesTab.length; c++) clines += "\\cline{"+clinesTab[c]+"}";
        code += clines;
    }

    return code;
}

//return value of colspan in multirow merger cell (for merged cells which do not exist in html)
Exporter.priv.getColsInMR = function(row, col){
    for(let i = row - 1; i >= 0; i--){
        const cell = document.getElementById(i+":"+col);
        if(cell != null){
            if(cell.rowSpan > 1){
                return cell.colSpan;
            }
        }
    }
    return null;
}

Exporter.priv.getTextSize = function(size){
    var fontSize = size.replace("px","");
    var fontSizePT = (fontSize / .75).toFixed(2);
    return fontSizePT+"pt";
}

Exporter.priv.CheckTableBorders = function(id){
    return document.getElementById(id).classList.contains("borderChecked");
}

//return table with rows id that are in rowspan somewhere and \hline can not be used
Exporter.priv.checkRowSpan = function(table){
    let noLine = [];
    for(let i = 0; i < table.rows.length; i++){
        for(let j = 0; j < tableCols; j++){
            if(this.isPartOfRowSpan(i,j)){
                noLine.push(i);
                break;
            }
        }
    }
    return noLine;
}

Exporter.priv.getClines = function(i){
    let clines = [];
    let first = null;
    for(let j = 0; j <= tableCols; j++){
        const cell = document.getElementById(i+":"+j);
        if(cell == null){
            if(first != null){
                clines.push((first+1)+"-"+(j));
                first = null;
            }
        } else if(cell.rowSpan < 2 && first == null){
            first = j;
        } else if(cell.rowSpan > 1 && first != null){
            clines.push((first+1)+"-"+(j));
            first = null;
        }
    }
    return clines;
}

Exporter.priv.getClinesFromArray = function(row){
    let clines = [];
    let first = null;
    for(let j = 0; j <= tableCols; j++){
        if(row[j] != 1 && first != null){
            clines.push((first+1)+"-"+(j));
            first = null;
        } else if(row[j] == 1 && first == null){
            first = j;
        }
    }
    return clines;
}

Exporter.priv.isPartOfRowSpan = function(i, j){
    for(let r = 0; r <= i; r++){
        const cell = document.getElementById(r+":"+j);
        if(cell == null) continue;
        if(cell.rowSpan > 1){
            if(r + cell.rowSpan - 1 > i) return true;
        }
    }
    return false;
}

Exporter.priv.getBorders = function(rows, cols){
    //initialize array
    const hlines = new Array(rows + 1);
    for(let i = 0; i < rows + 1; i++){
        hlines[i] = new Array(cols);
    }
    //check cells
    for(let i = 0; i < rows; i++){
        for(let j = 0; j < cols; j++){
            const cell = document.getElementById(i+":"+j);
            if(cell != null){
                for(let m = 0; m < cell.colSpan; m++){
                    if(cell.style.borderTopStyle == "solid"){
                        hlines[i][j+m] = 1;
                    }
                    if(cell.style.borderBottomStyle == "solid"){
                        hlines[i+cell.rowSpan][j+m] = 1;
                    }
                }
            }
        }
    }
    //console.log(hlines);
    return hlines;
}

document.querySelector("#genCode a").addEventListener("click", Exporter.genLatexCode);
