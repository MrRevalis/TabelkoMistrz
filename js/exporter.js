function Exporter(){}
Exporter.Foo = function(){
    console.log("hello world");
}

Exporter.genLatexCode = function(){
    const table = document.getElementById("mainTable");
    const rows = table.rows.length;

    let code = [];
    code.push("\\begin{table}");
    code.push(Exporter.priv.createTableHeader(tableCols));
    for(let i = 0; i < rows; i++){
        let row = [];
        for(let j = 0; j < tableCols; j++){
            row.push(Exporter.priv.getCell(i,j));
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

Exporter.priv.getCell = function(i, j){
    const cell = document.getElementById(i+":"+j);
    if(cell == null) return "";
    else {
        let result = cell.textContent;
        //check color
        if(cell.style.color != ""){
            result = "\\textcolor[RGB]{"+cell.style.color.replace("rgb(","").replace(")","")+"}{"+result+"}";
        }
        return result;
    }
}

document.querySelector("#genCode a").addEventListener("click", Exporter.genLatexCode);
