function Exporter(){}
Exporter.Foo = function(){
    console.log("hello world");
}

Exporter.genLatexCode = function(){
    wybranaKomorka = null;
    WyczyscStyl();
    const table = document.getElementById("mainTable");
    const rows = table.rows.length;

    let code = [];
    code.push("\\begin{table}");
    code.push(Exporter.priv.createTableHeader(tableCols));
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

                //check text color
                if(cell.style.color != ""){
                    result = "\\textcolor[RGB]{"+cell.style.color.replace("rgb(","").replace(")","")+"}{"+result+"}";
                }
                //check cell color
                if(cell.style.backgroundColor != "white"){
                    result = "\\cellcolor[RGB]{"+cell.style.backgroundColor.replace("rgb(","").replace(")","")+"}"+result;
                }
                //check multirow
                if(cell.rowSpan > 1){
                    result = "\\multirow{" + cell.rowSpan + "}{*}{" + result + "}";
                }
                //check multicol
                if(cell.colSpan > 1){
                    result = "\\multicolumn{" + cell.colSpan + "}{l}{" + result + "}";
                    j += cell.colSpan-1;
                }
                row.push(result);
            } else {
                const shift = Exporter.priv.getColsInMR(i, j);
                if(shift != null){
                    if(shift == 1){
                        row.push("");
                    } else{
                        row.push("\\multicolumn{" + shift + "}{l}{}");
                    }
                }
            }
        }
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

Exporter.priv.createTableHeader = function(cols){
    let code = "\\begin{tabular}{";
    for(let i = 0; i < cols; i++) code += "l";
    code += "}";
    return code;
}

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

document.querySelector("#genCode a").addEventListener("click", Exporter.genLatexCode);
