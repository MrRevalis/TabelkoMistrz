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
    let vlines = [];
    let vheader = []; //wher to put | when generating header
    if(!allBorders || !horizontalBorders || !verticalBorders){
        const borders = Exporter.priv.getBorders(table.rows.length, tableCols);
        hlines = borders[0];
        vlines = borders[1];
        vheader = Exporter.priv.mergeVlines(vlines);
    }

    var specificColumns = [...contentToolBar];


    let code = [];
    var colorName = (function(text){
        switch(text){
          case "#000000" : return "black";
          case "#FF0000" : return "red";
          case "#0000FF" : return "blue";
          case "#FFFF00" : return "yellow";
          case "#808080" : return "gray";
          case "#008000" : return "green";
        }
      })(borderColor);

    if(colorName != "black"){
        code.push("\\arrayrulecolor{"+colorName+"}");
    }
    code.push("\\begin{table}");
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
				result = Exporter.priv.specialCharacters(result);
				
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
                result = fontType+"{"+result+"}";

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
                    if(shift == 1){
                        row.push("");
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
                        row.push("\\multicolumn{" + shift + "}{" + border + "}{}");
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
    }
    code.push("\\end{tabular}");	
	//dopisanie caption i label na końcu
	if(document.getElementById("caption").value.length > 0){
		code.push("\\caption{" + document.getElementById("caption").value + "}");
	}
	if(document.getElementById("label").value.length > 0){
		code.push("\\label{" + document.getElementById("label").value + "}");
	}
    code.push("\\end{table}");
    console.log(code.join("\n"));
	
	Exporter.priv

    //show
    document.querySelector("#latexCode").textContent = code.join("\n");
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