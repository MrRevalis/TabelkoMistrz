var wybranaKomorka;


function CreateTable(x, y){
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

function TextItalic(){
  if(wybranaKomorka != null){
    document.execCommand("italic");
  }
}

$(document).ready(function(){
  $(".tab-btn").click(function(){
    $(".tab-btn").removeClass("active");
    $(this).addClass("active");
    $(".tab-content").css("display", "none");
    $(this).parent().children(".tab-content").css("display", "block");
  });
  //add table tooltip
  createAddTable();
  $("#addTableBox .cell").hover(function(){
    const temp = $(this).attr("id").split('x');
    const row = Number(temp[1]);
    const cell = Number(temp[2]);
    //updtae msg
    $("#aTBL").text("Wstaw tabelę "+(row+1)+"x"+(cell+1));
    //add border
    for(let i = 0; i <= row; i++){
      for(let j = 0; j <= cell; j++){
        $("#aTBCx"+i+"x"+j).addClass("active");
      }
    }
    //remove border rows
    for(let i = 9; i > row; i--){
      for(let j = 9; j >= 0; j--){
        $("#aTBCx"+i+"x"+j).removeClass("active");
      }
    }
    //cols
    for(let i = 9; i > cell; i--){
      for(let j = 9; j >= 0; j--){
        $("#aTBCx"+j+"x"+i).removeClass("active");
      }
    }
  });
  $("#addTableBox").mouseleave(function(){
    $("#addTableBox .cell").removeClass("active");
    //updtae msg
    $("#aTBL").text("Wstaw tabelę");
  });
  $("#addTableBox .cell").click(function(){
    const temp = $(this).attr("id").split('x');
    const row = Number(temp[1]);
    const col = Number(temp[2]);
    CreateTable(row + 1, col + 1);
  });
  $("#aTBa").click(function(){
    const rows = $("#aTBr").val();
    const cols = $("#aTBc").val();
    CreateTable(rows, cols);
  });
  //end add table tooltip
});

function createAddTable(){
  for(let i = 0; i<10;i++){
    $("#addTableBox").append("<div class='row'></div>");
  }
  $("#addTableBox .row").each(function(idx, item){
    for(let i = 0; i < 10; i++){
      $(item).append("<a class='cell' id ='aTBCx"+idx+"x"+i+"'></a>");
    }
  });
}
