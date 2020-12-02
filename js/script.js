var wybranaKomorka;
var myszNacisnieta = false;
var tabelaZaznaczonych = [];
var pierwszaKomorka;
var ostatniaKomorka;
var ostatniaEdytowana;

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
            cell.style.background = "gray";
            cell.setAttribute("contenteditable","false");

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
          if(myszNacisnieta != true){
            WyczyscStyl();
            ShowPosition(this.id);
          }
        };
    }

    //Wykrycie czy lewy przycisk myszy został naciśnięty
    table.addEventListener("mousedown", function(event){
      console.log("Mysz nacisnieta");
      if(myszNacisnieta == false){
        if(event.target.id != "mainTable" && event.target.id){
          //Wyczyszczenie styli do podstawowych
          WyczyscStyl();
          //Wyczyszczenie tabelii zaznaczonych (na przyszłość, aktualnie nie wiem po co xD)
          tabelaZaznaczonych = [];
          //Zapisanie pierwszej zaznaczonej komórki
          pierwszaKomorka = event.target.id;
          //Zmiana koloru, na kolor zaznaczenie
          ZmienKolor(pierwszaKomorka);
          myszNacisnieta = true;
        }
      }
    })

    table.addEventListener("mousemove", function(event){
      if(myszNacisnieta){
        console.log("Mysz sie porusza");
        //Jeśli target nie jest pusty oraz nie jest tabelką to wykonujemy zaznaczenie
        if(event.target.id != null && event.target.id != "mainTable"){
            WyczyscStyl();
            ostatniaKomorka = event.target.id;
            var aktualnaKomorka = event.target.id.split(":");
            ZaznaczenieKomorek(pierwszaKomorka.split(":"), aktualnaKomorka);
        }
      }
    })
    //Kończymy zaznaczać i tym samym przez tabele "tabelaZaznaczonych" mamy dostęp do ID zaznaczonych
    table.addEventListener("mouseup", function(){
      console.log("Mysz nie jest nacisnieta");
      myszNacisnieta = false;
    })

    table.addEventListener("dblclick", function(event){
      console.log("edytujesz");
      if(ostatniaEdytowana != null){
        document.getElementById(ostatniaEdytowana).setAttribute("contenteditable","false");
        ostatniaEdytowana = event.target.id;
      }
      else{
        ostatniaEdytowana = event.target.id;
      }
      document.getElementById(ostatniaEdytowana).setAttribute("contenteditable","true");
      document.getElementById(ostatniaEdytowana).focus();
    })
}

//Wykonuje zaznaczenie komórek,
function ZaznaczenieKomorek(poczatkowyPunkt, aktualnyPunkt){

  var xMin = Math.min(poczatkowyPunkt[0], aktualnyPunkt[0]);
  var xMax = Math.max(poczatkowyPunkt[0], aktualnyPunkt[0]);
  var yMin = Math.min(poczatkowyPunkt[1], aktualnyPunkt[1]);
  var yMax = Math.max(poczatkowyPunkt[1], aktualnyPunkt[1]);

  tabelaZaznaczonych = [];

  for(var x = xMin; x <= xMax; x++){
    for(var y = yMin; y <= yMax; y++){
      tabelaZaznaczonych.push(x+":"+y);
      ZmienKolor(x+":"+y);
    }
  }
}

function ZmienKolor(id){
  var element = document.getElementById(id);
  if(element != null){
    element.style.background = "yellow";
  }
}

function WyczyscStyl(){
  var table = document.getElementById("mainTable");
    for (var i = 0; i < table.rows.length; i++) {
        for (var j = 0; j < table.rows[i].cells.length; j++)
        table.rows[i].cells[j].style.background = "gray";
    }
}

function ShowPosition(id){

    if(wybranaKomorka != null){
        document.getElementById(wybranaKomorka).style.background = "gray";
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

function ScalKomorki(){
  /*document.getElementById(pierwszaKomorka).rowSpan = "2";
  document.getElementById(pierwszaKomorka).colSpan = "2";*/

  if(pierwszaKomorka != null && ostatniaKomorka != null){
    console.log(pierwszaKomorka);
    console.log(ostatniaKomorka);
  
    //Usuwanie komorek z roznicy pomiedzy pierwsza a ostatnia
    //Tekst pozostaje tylko w komorce startowej
    //Dodajemy rowspan i colspan w Math.abs(roznica ostatnia i pierwsza po x i y)
    var tekst = pierwszaKomorka.split(":");
    var tekst2 = ostatniaKomorka.split(":");
    var table = document.getElementById("mainTable");
  
    var roznicaX = Math.abs(tekst[0] - tekst2[0]);
    var roznicaY = Math.abs(tekst[1] - tekst2[1]);
  
    var xMin = Math.min(tekst[0], tekst2[0]);
    var xMax = Math.max(tekst[0], tekst2[0]);
    var yMin = Math.min(tekst[1], tekst2[1]);
    var yMax = Math.max(tekst[1], tekst2[1]);
  
  
  
    var tekst = document.getElementById(pierwszaKomorka).innerHTML;
    /*console.log(xMin);
    console.log(xMax);
    console.log(yMin);
    console.log(yMax);*/
  
    for(var x = xMin; x <= xMax; x++){
      for(var y = yMin; y <= yMax; y++){
        if(x+":"+y != xMin+":"+yMin){
          document.getElementById(x+":"+y).remove();
        }
      }
    }
    console.log(xMax - xMin + 1);
    console.log(yMax - yMin + 1);
    console.log("skad zaczac "+ xMin+":"+yMin);
    document.getElementById(xMin+":"+yMin).rowSpan = xMax - xMin + 1;
    document.getElementById(xMin+":"+yMin).colSpan = yMax - yMin + 1;
    document.getElementById(xMin+":"+yMin).innerHTML = tekst;
    WyczyscStyl();
    tabelaZaznaczonych = [];
    pierwszaKomorka = null;
    ostatniaKomorka = null;
  }
}

function RozdzielKomorki(){
  console.log("Rozdziel");
  if(tabelaZaznaczonych.length > 0){
    //We are using here all highlighted cells (color yellow)
    console.log("rozdziel zaznaczone komorki => zolty kolor");
    for(var i = 0; i < tabelaZaznaczonych.length; i++){
      SplitCell(tabelaZaznaczonych[i]);
    }
    tabelaZaznaczonych = [];
  }
  else if(wybranaKomorka != null){
    //We are using only one highlighted cell (color green)
    console.log("rozdziel wybrana komorke => zielony kolor");
    SplitCell(wybranaKomorka);
    wybranaKomorka = null;
  } 
}

function SplitCell(element){
  //Get amount of rowsSpan and colSpan of this element
  var rows = document.getElementById(element).rowSpan;
  var cols = document.getElementById(element).colSpan;
  //Split ID by ":" to array, easier to use
  var elementID = element.split(":");
  //Get mainTable 
  var table = document.getElementById("mainTable");
  //Get text of this element, to not lose him, during changes
  var text = document.getElementById(element).innerHTML;
  //Delete this element
  document.getElementById(element).remove();

  //Create new element from id of this element to id + rows and id + cols
  //
  for (var i = elementID[0]; i < Number(elementID[0]) + Number(rows) ; i++) {
    for (var j = elementID[1]; j < Number(elementID[1]) + Number(cols); j++){
      //Add new cell to specific index
      var cell = table.rows[i].insertCell(j);
      //Add style and functions to this cell
      AddPropertiesToCell(cell, i, j);

    }
  }
  //Write there text from element
  document.getElementById(element).innerHTML = text;
}

function AddPropertiesToCell(cell, i, j){
  cell.id = i +":" + j;
  cell.style.background = "gray";
  cell.setAttribute("contenteditable","false");
  cell.onclick = function () {
    if(myszNacisnieta != true){
      WyczyscStyl();
      ShowPosition(this.id);
    }
  }
}

function InsertColumn(side){
  if(wybranaKomorka == null) return;
  const coords = wybranaKomorka.split(":");
  const table = document.getElementById("mainTable");
  //check collision
  checkMergeCollide(coords[0], coords[1], side, table);

  let colID = parseInt(coords[1]);
  if(side == 'r') colID+=document.getElementById(wybranaKomorka).colSpan;
  //change ids
  for (let i = 0; i < table.rows.length; i++) {
    for (let j = colID; j < table.rows[i].cells.length; j++){
      let cCell = table.rows[i].cells[j].id.split(":");
      table.rows[i].cells[j].id = i+":"+(parseInt(cCell[1])+2);
    }
  }
  //add cell
  for(let i = 0; i < parseInt(coords[0]); i++){
    //console.log("f:"+i);
    let cell = table.rows[i].insertCell(colID);
    cell.id = i +":" + colID;
    cell.style.background = "gray";
    cell.setAttribute("contenteditable","false");
  }

  //console.log(coords[0] + " "+colID);
  let ecell = table.rows[parseInt(coords[0])].insertCell(colID);
  ecell.id = parseInt(coords[0]) +":" + colID;
  ecell.style.background = "gray";
  ecell.setAttribute("contenteditable","false");

  for(let i = parseInt(coords[0])+1; i < table.rows.length; i++){
    //console.log("l:"+i);
    let cell = table.rows[i].insertCell(colID);
    cell.id = i +":" + colID;
    cell.style.background = "gray";
    cell.setAttribute("contenteditable","false");
  }
  wybranaKomorka = null;
  WyczyscStyl();
  AddFunction();
}

function InsertRow(side){
  if(wybranaKomorka == null) return;
  const coords = wybranaKomorka.split(":");
  const table = document.getElementById("mainTable");
  let rowID = parseInt(coords[0]);
  if(side == 'd') rowID+=document.getElementById(wybranaKomorka).rowSpan;
  //check merged cells
  checkMergeCollide(coords[0], coords[1], side, table);
  //change ids
  for (let i = rowID; i < table.rows.length; i++) {
      for (let j = 0; j < table.rows[i].cells.length; j++){
        let cCell = table.rows[i].cells[j].id.split(":");
        table.rows[i].cells[j].id = (parseInt(cCell[0])+1)+":"+j;
      }
  }
  table.insertRow(rowID);
  let sampleRow = 0;
  if(rowID == 0) sampleRow++;
  //add cells
  for(let i = 0; i < table.rows[sampleRow].cells.length; i++){
    let cell = table.rows[rowID].insertCell(i);
    cell.id = rowID + ":" + i;
    cell.style.background = "gray";
    cell.setAttribute("contenteditable","false");
  }
  wybranaKomorka = null;
  WyczyscStyl();
  AddFunction();
}

function checkMergeCollide(row, col, side, table){
  let errorCells = [];
  let collision = false;

  switch(side){
    case "l":
      //from row to 0
      for(let i = row; i >=0; i--){
        for(let j = col-1; j >= 0; j--){
          let cell = document.getElementById(i+":"+j);
          if(cell == null) continue;
          if(cell.colSpan > 1){
            if(j + cell.colSpan > col){
              errorCells.push([i, j]);
            }
          }
        }
      }
      //from row + 1 to rows.length
      for(let i = row + 1; i < table.rows.length; i++){
        for(let j = col-1; j >= 0; j--){
          let cell = document.getElementById(i+":"+j);
          if(cell == null) continue;
          if(cell.colSpan > 1){
            if(j + cell.colSpan > col){
              errorCells.push([i, j]);
            }
          }
        }
      }
    break;
    case "r":
      //from row to 0
      for(let i = row - 1; i >=0; i--){
        for(let j = 0; j < table.rows[i].cells.length; j++){
          if(j <= col){
            //console.log(i+":"+j);
            if(table.rows[i].cells[j].colSpan > 1){
              if(j + table.rows[i].cells[j].colSpan - 1 > col){
                errorCells.push([i, j]);
              }
            }
          }
        }
      }
      //from row + 1 to rows.length
      for(let i = row + 1; i < table.rows.length; i++){
        for(let j = 0; j < table.rows[i].cells.length; j++){
          if(j >= col){
            if(table.rows[i].cells[j].colSpan > 1){
              if(j + table.rows[i].cells[j].colSpan - 1 > col){
                errorCells.push([i, j]);
              }
            }
          }
        }
      }
    break;
    case "u":
      for(let i = 0; i < row; i++){
        for(let j = 0; j < table.rows[i].cells.length; j++){
          if(table.rows[i].cells[j].rowSpan > 1){
            if(table.rows[i].cells[j].rowSpan + i > row){
              errorCells.push([i, j]);
            }
          }
        }
      }
      // for(let j = 0; j < table.rows[0].cells.length; j++){
      //   if(j == col) continue;
      //   for(let i = 0; i < row; i++){
      //     console.log(i+":"+j);
      //     if(table.rows[i].cells[j].rowSpan > 1){
      //       if(table.rows[i].cells[j].rowSpan + i > row){
      //         errorCells.push([i, j]);
      //       }
      //     }
      //   }
      // }
    break;
  }
  console.log(errorCells);
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
