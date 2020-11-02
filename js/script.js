var wybranaKomorka;


function CreateTable(){
    var x = prompt("Podaj ilosc wierszy");
    var y = prompt("Podaj ilość kolumn");

    document.getElementById("body").innerHTML = "";

    var gdzieUmiescic = document.getElementById("body");

    var elemTable = document.createElement("table");
    elemTable.id = "mainTable";
    var elemBody = document.createElement("tbody");


    for(var i = 0; i<x; i++){
        var row = document.createElement("tr");

        for(var j=0; j<y; j++){
            var cell = document.createElement("td");
            cell.id = i +":" + j;
            var text = document.createTextNode(" ");

            var inputElement = document.createElement("div");
            inputElement.id="input"+i+":"+j;
            inputElement.setAttribute("contenteditable","true");
            
            /*cell.appendChild(text);*/
            cell.appendChild(inputElement);

            cell.setAttribute("bgcolor", "gray");

            row.appendChild(cell)
        }
        elemBody.appendChild(row);
    }
    elemTable.appendChild(elemBody);
    gdzieUmiescic.appendChild(elemTable);



    AddFunction();
}



function AddFunction(){
    var table = document.getElementById("mainTable");
    for (var i = 0; i < table.rows.length; i++) {
        for (var j = 0; j < table.rows[i].cells.length; j++)
        table.rows[i].cells[j].onclick = function () {
            ShowPosition(this.id);
        };
    }
}

function ShowPosition(id){

    if(wybranaKomorka != null){
        document.getElementById(wybranaKomorka).style.background = "";
    }
    var text = id;
    //alert(text.charAt(0) + ":" + text.charAt(2));

    wybranaKomorka = text;
    document.getElementById(text).style.background = "green";
}

function AddBorder(){
    var table = document.getElementById("mainTable");
    if(table != null){
        table.style.border = "1px solid black";
    }
}

function WybranaKomorka(){
    alert(wybranaKomorka);
}

function AddBorderCell(){
    if(wybranaKomorka != null){
        document.getElementById(wybranaKomorka).style.border = "3px solid red";
    }
}

function TextColor(){
    if(wybranaKomorka != null){
        document.getElementById("input"+wybranaKomorka).style.color = "white";
    }
}

function TextBold(){
    if(wybranaKomorka != null){
        document.getElementById("input"+wybranaKomorka).style.fontWeight = "bold";
    }
}