function Exporter(){}
Exporter.Foo = function(){
    console.log("hello world");
}

Exporter.genLatexCode = function(){
    wybranaKomorka = null;
    WyczyscStyl();
    const table = document.getElementById("mainTable");
    if(!table){
        ShowCustomAlert("Stwórz najpierw tabele.");
        return;
    }
    const rows = table.rows.length;

    const allBorders = Exporter.priv.CheckTableBorders("allEdges");
    const horizontalBorders = Exporter.priv.CheckTableBorders("horizontalEdges");
    const verticalBorders = Exporter.priv.CheckTableBorders("verticalEdges");
    let noHorizontalLines = [];
    if(horizontalBorders) noHorizontalLines = Exporter.priv.checkRowSpan(table);

    let hlines = [];
    let vlines = [];
    let vheader = []; //wher to put | when generating header
    if(!allBorders || !horizontalBorders || !verticalBorders){
        const borders = Exporter.priv.getBorders(table.rows.length, tableCols);
        hlines = borders[0];
        vlines = borders[1];
        vheader = Exporter.priv.mergeVlines(vlines);
    }

    var specificColumns = [...contentToolBar];

    var multiRowPackage = false;
    var cellColorPackage = false;

    const minusRowSpanCols = []; //zawiera id komorek w ktorych multirow musi byc ujemne
    const minusRowSpanSpec = []; //zawiera [rowSpan, content] tychze komorek

    let code = [];
    /*var colorName = (function(text){
        var index = colorTable.findIndex(x => x == text);
        var color = index ? colorNames[index] : "black";
        return color;
      })(borderColor);*/

    if(borderColor != "#000000"){
        var color = borderColor.substr(1, borderColor.length).toUpperCase();
        code.push("\\definecolor{wlasnyKolor}{HTML}{"+color+"}")
        code.push("\\arrayrulecolor{wlasnyKolor}");
        cellColorPackage = true;
    }
    code.push("\\begin{table}");
    if(document.getElementById("caption").value.length > 0 && titlePlace == "top"){
		code.push("\\caption{" + Exporter.priv.specialCharacters(document.getElementById("caption").value) + "}");
	}
    code.push(Exporter.priv.createTableHeader(tableCols, allBorders, verticalBorders, horizontalBorders, hlines[0], vheader));
    for(let i = 0; i < rows; i++){
        let row = [];

        //Wysokosc wiersza tabeli => 0ex to domyślna wartość wysokości
        var heightValue = "";
        if(heightTooBarArray[i] != "[0ex]"){
            heightValue = heightTooBarArray[i];
        }

        for(let j = 0; j < tableCols; j++){
            const cell = document.getElementById(i+":"+j);

            if(cell != null){
                let result = cell.textContent;
				
				//check special characters / symbols
				result = Exporter.priv.specialCharacters(result).trim();
				
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
                let fontType = Exporter.priv.getTextSize(cell.style.fontSize);
                if(fontType != "\\normalsize") result = fontType+"{"+result+"}";

                //check text color
                if(cell.style.color != ""){
                    result = "\\textcolor[RGB]{"+cell.style.color.replace("rgb(","").replace(")","")+"}{"+result+"}";
                    cellColorPackage = true;
                }
                //check cell color
                if(cell.style.backgroundColor != "white" && cell.style.backgroundColor != "rgb(255, 255, 255)" && cell.style.backgroundColor != ""){
                    const color = Exporter.priv.getColor(cell.style.backgroundColor)
                    if(color.includes(",")){
                        result = "\\cellcolor[RGB]{"+color+"}"+result;
                    } else {
                        result = "\\cellcolor{"+color+"}"+result;
                    }

                    cellColorPackage = true;
                }
                let multiRowProblem = false;
                //check multirow
                if(cell.rowSpan > 1){
                    result = "\\multirow{" + cell.rowSpan + "}{*}{" + result + "}";
                    multiRowPackage = true;
                    if(result.includes("\\cellcolor")) multiRowProblem = true;
                }

                if(multiRowProblem){
                    const textCellContent = cell.textContent
                    result = result.replace(textCellContent, "");
                    minusRowSpanCols.push((i+cell.rowSpan-1)+":"+j);
                    minusRowSpanSpec.push([cell.rowSpan, textCellContent]);
                }
                //check multicol

                var id = cell.id.split(":")[1];
                var columnTextAlign = Exporter.priv.TextAlignInColumn(specificColumns[id][0]);

                var cellTextAlign = cell.style.verticalAlign != ""? cell.style.verticalAlign : cell.style.textAlign;


                let border = (cellTextAlign != columnTextAlign) ? Exporter.priv.TextInCell(cellTextAlign) : specificColumns[id];
                

                if(cell.colSpan > 1){
                    //let border = "l";
                    if(allBorders || verticalBorders) if(j == 0) border = "|"+border+"|"; else border = border+"|";
                    else if(vheader[j + cell.colSpan] == 1) border = border + "|";
                    result = "\\multicolumn{" + cell.colSpan + "}{" + border + "}{" + result + "}";
                    j += cell.colSpan-1;
                } 
                else if(vlines.length > 0){
                    if(vlines[i][j] == 1){
                        if(j+1 == tableCols && (vlines[i][tableCols] == 1 || vheader[tableCols] == 1)){
                            //last cell
                            result = "\\multicolumn{1}{|"+border+"|}{"+result+"}";
                        } else {
                            result = "\\multicolumn{1}{|"+border+"}{"+result+"}";
                        }
                    }

                }
                //funkcja odpowiedzialna za zmianę justowania tekstu w komórce => jeśli text align w komórce jest inny niż w górnym pasku
                if(cellTextAlign != columnTextAlign && !result.includes("\\multicolumn")){
                    //wywala sie gdy mamy ustawione p, m, b
                    /*var cellAlign = cell.style.verticalAlign;
                    console.log(cellTextAlign);
                    alert(cellAlign);*/
                    result = "\\multicolumn{1}{"+Exporter.priv.TextInCell(cellTextAlign)+"}{"+result+"}";
                }

                row.push(result);
            } else {
                const shift = Exporter.priv.getColsInMR(i, j);
                if(shift != null){
                    const parentColor = Exporter.priv.getParentColor(i,j);
                    let cellColor = "";
                    if(parentColor != "white" && parentColor != "rgb(255, 255, 255)" && parentColor != ""){
                        cellColor += "\\cellcolor";
                        const getColor = Exporter.priv.getColor(parentColor);
                        if(getColor.includes(",")){
                            cellColor += "[RGB]{"+getColor+"}";
                        } else {
                            cellColor += "{"+getColor+"}";
                        }
                    }
                    const mrIdx = minusRowSpanCols.indexOf(i+":"+j);
                    let minusrow = cellColor;
                    if(mrIdx >= 0){
                        minusrow = "\\multirow{-"+minusRowSpanSpec[mrIdx][0]+"}{*}{"+cellColor+minusRowSpanSpec[mrIdx][1]+"}";
                    }
                    if(shift == 1){
                        row.push(minusrow);
                    } else{
                        var element = null;
                        var a = 1;
                        while(!element){
                            var tempElement = document.getElementById(Number(i)-a+":"+j);
                            if(tempElement !== null){
                                if(tempElement.rowSpan > 1){
                                    element = tempElement;
                                }
                            }
                            a++;
                            console.log("here");
                        }
                        var columnTextAlign = Exporter.priv.TextAlignInColumn(specificColumns[element.id.split(":")[0]][0]);
                        var cellTextAlign = element.style.verticalAlign != "" ? element.style.verticalAlign : element.style.textAlign;
                        let border = (cellTextAlign != columnTextAlign) ? Exporter.priv.TextInCell(cellTextAlign) : specificColumns[element.id.split(":")[0]];
                        //let border = "l";
                        if(allBorders || verticalBorders) if(j == 0) border = "|"+border+"|"; else border = border+"|";
                            row.push("\\multicolumn{" + shift + "}{" + border + "}{"+minusrow+"}");
                    }
                }
            }
        }
        if((allBorders == true || horizontalBorders == true) && !noHorizontalLines.includes(i) || (hlines.length > 1 && hlines[i+1].countElement(1) == tableCols)){
            code.push(row.join(" & ") + "\\\\"+ heightValue + "\\hline");
        }
        else if(noHorizontalLines.includes(i)){
            let clines = "";
            const clinesTab = Exporter.priv.getClines(i);
            for(let c = 0; c < clinesTab.length; c++) clines += "\\cline{"+clinesTab[c]+"}";
            code.push(row.join(" & ") + "\\\\"+ heightValue + clines);
        } else if(hlines[i+1].includes(1)){
            let clines = "";
            const clinesTab = Exporter.priv.getClinesFromArray(hlines[i+1]);
            for(let c = 0; c < clinesTab.length; c++) clines += "\\cline{"+clinesTab[c]+"}";
            code.push(row.join(" & ") + "\\\\"+ heightValue + clines );
        }
        else
            code.push(row.join(" & ") + "\\\\" + heightValue);
        console.log(minusRowSpanCols);
        console.log(minusRowSpanSpec);
        console.log();
    }
    code.push("\\end{tabular}");	
	//dopisanie caption i label na końcu
	if(document.getElementById("caption").value.length > 0 && titlePlace == "bottom"){
		code.push("\\caption{" + Exporter.priv.specialCharacters(document.getElementById("caption").value) + "}");
	}
	if(document.getElementById("label").value.length > 0){
		code.push("\\label{" + Exporter.priv.removeSpecialCharacters(document.getElementById("label").value) + "}");
	}
    code.push("\\end{table}");
    console.log(code.join("\n"));

    tabelaZaznaczonych = [];
    pierwszaKomorka = null;
    ostatniaKomorka = null;
    ostatniaEdytowana = null;

    var preambule = Exporter.priv.packagesInfo(multiRowPackage,cellColorPackage);
    var newCode = preambule + code.join("\n");
	Exporter.priv

    //show
    document.getElementById("copyCode").style.display = "block";
    document.querySelector("#latexCode").textContent = newCode;
    Prism.highlightElement(document.querySelector("#latexCode"));
    document.querySelector("#latexCode").parentElement.style.display = "block";
}

Exporter.priv = function(){}

Exporter.priv.createTableHeader = function(cols, allBorders, verticalBorders, horizontalBorders, borderRow, vlines){
    let code = "\\begin{tabular}{";
    var text = "l";
    var specificColumns = [...contentToolBar];
    if(allBorders == true || verticalBorders == true){
        for(var i = 0 ; i < specificColumns.length; i++){
            specificColumns[i] = "|" + specificColumns[i];
        }
    }
    for(let i = 0; i < cols; i++){
        if(!verticalBorders){
            if(vlines[i] == 1) code += "|"+specificColumns[i];
            else code += specificColumns[i];
        } else code += specificColumns[i];
    }

    if(allBorders==true || verticalBorders == true || vlines[cols] == 1)code+="|";
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

Exporter.priv.getColor = function(color){
    let transparency = false;
    if(color.includes("rgba(")) transparency = true;

    if(color.includes("#")){
        color = color.replace("#", "");
        const colorIdx = colorHTMLCodes.indexOf(color);
        if(colorIdx >= 0){
            return colorNames[colorIdx];
        } else {
            const colorVal = colorRGBCodes[colorHTMLCodes.indexOf(color)].split(",");
            for(let c = 0; c < colorVal.length; c++)
                colorVal[c] *= 255;
            return colorVal.join(",");
        }
    } else {
        var sep = color.indexOf(",") > -1 ? "," : " ";
        color = color.substr(4).split(")")[0].split(sep);
        color[0] = color[0].replace("(","");

        let checkColor = (parseInt(color[0])/255).toFixed(2)+"," + (parseInt(color[1])/255).toFixed(2)+ "," + (parseInt(color[2])/255).toFixed(2);
        checkColor = checkColor.replaceAll("0.00", "0").replaceAll("1.00", "1");
        const colorIdx = colorRGBCodes.indexOf(checkColor);

        if(colorIdx >= 0){
            if(transparency){
                transparency = color[3].split('.')[1];
                if(transparency.length == 1) transparency = parseInt(transparency) * 10;
                return colorNames[colorIdx]+"!"+transparency;
            } else {
                return colorNames[colorIdx];
            }
        } else {
            return color[0]+","+color[1]+","+color[2];
        }
    }
}

Exporter.priv.getParentColor = function(row, col){
    for(let i = row - 1; i >= 0; i--){
        const cell = document.getElementById(i+":"+col);
        if(cell != null){
            if(cell.rowSpan > 1){
                return cellsColorTable[i][col];
            }
        }
    }
    return null;
}

Exporter.priv.getTextSize = function(size){
    switch(size){
        case "8px": return "\\tiny";
        case "11px": return "\\scriptsize";
        case "12px": return "\\footnotesize";
        case "13px": return "\\small";
        case "15px": return "\\normalsize";
        case "16px": return "\\large";
        case "19px": return "\\Large";
        case "23px": return "\\LARGE";
        case "26px": return "\\huge";
        case "33px": return "\\Huge";
        default: return "\\scriptsize";
    }
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
    //initialize arrays
    const hlines = new Array(rows + 1);
    const vlines = new Array(rows);
    for(let i = 0; i < rows + 1; i++){
        hlines[i] = new Array(cols);
    }
    for(let i = 0; i < rows; i++){
        vlines[i] = new Array(cols + 1);
    }
    //check cells
    for(let i = 0; i < rows; i++){
        for(let j = 0; j < cols; j++){
            const cell = document.getElementById(i+":"+j);
            if(cell != null){
                for(let m = 0; m < cell.colSpan; m++){
                    //horizontal
                    if(cell.style.borderTopStyle == "solid"){
                        hlines[i][j+m] = 1;
                    }
                    if(cell.style.borderBottomStyle == "solid"){
                        hlines[i+cell.rowSpan][j+m] = 1;
                    }
                }
                //vertical
                if(cell.style.borderLeftStyle == "solid"){
                    vlines[i][j] = 1;
                }
                if(cell.style.borderRightStyle == "solid"){
                    vlines[i][j+cell.colSpan] = 1;
                }
            }
        }
    }
    //console.log(hlines);
    //console.log(vlines);
    return [hlines, vlines];
}

//modify array with id of lines witch can be replaced with | in header
Exporter.priv.mergeVlines = function(vlines){
    const header = new Array(vlines[0].length);
    for(let j = 0; j < vlines[0].length; j++){
        let merge = true;
        for(let i = 0; i < vlines.length; i++){
            if(vlines[i][j] != 1){
                merge = false;
                break;
            }
        }
        if(merge){
            header[j] = 1;
            for(let i = 0; i < vlines.length; i++){
                vlines[i][j] = 0;
            }
        }
    }
    return header;
}

document.querySelector("#genCode a").addEventListener("click", Exporter.genLatexCode);

Exporter.priv.TextAlignInColumn = function(text){
    switch(text){
        case "l" : return "left";
        case "c" : return "center";
        case "r" : return "right";
        case "p" : return "bottom";
        case "m" : return "middle";
        case "b" : return "top";
        default:
            alert("Przekazany tekst: "+text);
    }
}

Exporter.priv.TextInCell = function(char){
    switch(char){
        case "left" : return "l";
        case "center" : return "c";
        case "right" : return "r";
        case "bottom" : return "p";
        case "middle" : return "m";
        case "top" : return "b";
        default:
            alert("Przekazany znak: "+char);
    }
}

Exporter.priv.specialCharacters = function(result){
	let specialCharacters = "";
	for(let i=0; i < result.length; i++){
		if(result[i] == "$" || result[i] == "&" || result[i] == "%" || result[i] == "#" || 
			result[i] == "_" || result[i] == "{" || result[i] == "}"){
			specialCharacters += "\\" + result[i];
		}
		else if(result[i] == "^" || result[i] == "~"){
			specialCharacters += "\\" + result[i] + "{}";
		}
		else if(result[i] == "\\"){
			specialCharacters += "$\\backslash$";
		}
		else{
			specialCharacters += result[i];
		}
	}
	return specialCharacters;
}

Exporter.priv.removeSpecialCharacters = function(result){
	let textWithoutSpecialCharacters = "";
	for(let i=0; i < result.length; i++){
		if(result[i] == "$" || result[i] == "&" || result[i] == "%" || result[i] == "#" || 
			result[i] == "_" || result[i] == "{" || result[i] == "}" || result[i] == "^" || 
			result[i] == "~" || result[i] == "\\"){
			textWithoutSpecialCharacters += "";
		}
		else{
			textWithoutSpecialCharacters += result[i];
		}
	}
	return textWithoutSpecialCharacters;
}

Exporter.saveLatexCode = function(){
    var latexCode = document.querySelector("#latexCode").textContent;
    if(latexCode.length > 0){
        var file = new Blob([latexCode], {type: "text/plain"});
        var element = document.createElement("a");
        element.href = URL.createObjectURL(file);
        var caption = document.getElementById("caption").value.length > 0 ? "_"+document.getElementById("caption").value.replace(" ", "_") : "";
        element.download = "tabela_latex"+caption+".tex";
        element.click();
        element.href = URL.revokeObjectURL(file);
        element.remove();
    }
    else{
        ShowCustomAlert("Wygeneruj kod LateX, żeby móc go zapisać.")
    }
}

Exporter.saveHTMLCode = function(){
    var table = document.getElementById("mainTable") ? document.getElementById("mainTable").outerHTML : "";
    if(table.length > 0){

        var tableText = "";
        for(var i = 0; i < table.length; i++){
            tableText += table[i];
            if(table[i] == ">"){
                tableText += "\n";
            }
            if(table[i + 1] == "<" && table[i + 2] == "/"){
                tableText += "\n";
            }
        }
        var file = new Blob([tableText], {type: "text/plain"});
        var element = document.createElement("a");
        element.href = URL.createObjectURL(file);
        element.download = "tabela_latex_HTML.txt";
        element.click();
        element.href = URL.revokeObjectURL(file);
        element.remove();
    }
    else{
        ShowCustomAlert("Utwórz tabele, żeby móc ją zapisać.")
    }
}

Exporter.priv.packagesInfo = function(multiRowPackage,cellColorPackage){
    var tableInfo = [];
    if(multiRowPackage || cellColorPackage){
        tableInfo.push("% Dodaj poniższe, wymagane pakiety do preambuły pliku:")
        if(multiRowPackage){
            tableInfo.push("% \\usepackage{multirow}");
        }
        if(cellColorPackage){
            tableInfo.push("% \\usepackage[table,xcdraw]{xcolor}");
            tableInfo.push("% Jeśli używasz klasy Beamer, przekaż tylko \"xcolor=table\", czyli \\documentclass[xcolor=table]{beamer}");
        }
        tableInfo.push("");
    }
    return tableInfo.join("\n")
}