var wybranaKomorka;
var myszNacisnieta = false;
var tabelaZaznaczonych = [];
var cellsColorTable;
var pierwszaKomorka;
var ostatniaKomorka;
var ostatniaEdytowana;
let tableCols; //ilosc kolumn w tabeli
const fontSizeTable = ["6","8","9","10","11","12","14","17","20","25"];

//Tabela z kolorami, żeby jak chcemy w przyszłości mieć ich więcej wystarczy tu je dodać (petla dziala do rozmiaru tej tabeli)
var colorTable = ["#FF0000", "#00FF00", "#0000FF", "#00FFFF", "#FF00FF", "#FFFF00", "#FF8000", "#800080", "#BF0040", "#BF8040", "#FFBFBF", "#808000", "#000000", "#404040", "#808080", "#BFBFBF", "#008080", "#BFFF00"];

//Zmienna odpowiedzialna za kolor obramowania tabelii i tekstu
var borderColor = "#000000";
var textColor = "#000000";

function CreateTable(x, y){
    //if user add smaller table
    wybranaKomorka = null;
    myszNacisnieta = false;
    tabelaZaznaczonych = [];
    pierwszaKomorka = null;
    ostatniaKomorka = null;
    ostatniaEdytowana = null;
    contentToolBar = [];
    heightTooBarArray = [];
    withWidth = false;
    tableCols = parseInt(y);

    document.getElementById("body").innerHTML = "";
    document.getElementById("toolBarContainer").innerHTML = "";
    document.getElementById("heightToolBar").innerHTML = "";
    document.getElementById("copyCode").style.display = "none";
    document.querySelector("#latexCode").textContent = "";
    document.querySelector("#latexCode").parentElement.style.display = "none";
    document.getElementById("horizontalEdges").classList.remove("borderChecked");
    document.getElementById("verticalEdges").classList.remove("borderChecked");
    document.getElementById("allEdges").classList.remove("borderChecked");

    var gdzieUmiescic = document.getElementById("body");

    var elemTable = document.createElement("table");
    elemTable.id = "mainTable";
    var elemBody = document.createElement("tbody");


    for(var i = 0; i<x; i++){
        var row = document.createElement("tr");

        for(var j=0; j<y; j++){
            var cell = document.createElement("td");
            cell.id = i +":" + j;
            cell.style.background = "#FFFFFF";
            cell.style.border = "1px dashed black";
            cell.style.fontSize = Converter_pt_px("11pt");
            cell.style.textAlign = "left";
            cell.setAttribute("contenteditable","false");

            //Testowe, zeby zobaczyc ID => latwiej mi się kontroluje 
            cell.innerHTML = cell.id;

            row.appendChild(cell);
        }
        elemBody.appendChild(row);
    }
    elemTable.appendChild(elemBody);
    gdzieUmiescic.appendChild(elemTable);
    SaveCellsColors();
    AddFunction();
    GenerateToolBar();
    GenerateHeightToolBar(x);

    document.getElementById("textContainerTop").style.display = "block";
    document.getElementById("textContainerBottom").style.display = "block";
    document.getElementById("caption").value = "";
    document.getElementById("label").value = "";

    gdzieUmiescic.addEventListener("mousedown", function(){
      WyczyscStyl();
      if(wybranaKomorka){
        document.getElementById(wybranaKomorka).setAttribute("contenteditable","false");
      }
      wybranaKomorka = "";
    })

  document.addEventListener("keydown", MovingInTable)
}


//Dodanie funkcjonalności do komórki tabeli
function AddFunction(){
    var table = document.getElementById("mainTable");
    for (var i = 0; i < table.rows.length; i++) {
        for (var j = 0; j < table.rows[i].cells.length; j++){
          table.rows[i].cells[j].onclick = function () {
            if(myszNacisnieta != true){
              WyczyscStyl();
              ShowPosition(this.id);
              BorderViewFunction(this.id);
              CheckFontSettings(this.id);
              CheckTextAlignSettings(this.id);
              OptionChangeSize(this.id);
              ChangeColorInBox(this.id);
              CheckMerged(this.id);
              CheckColorInCell(this.id);
            }
          };
          table.rows[i].cells[j].addEventListener("keydown", function(event){
            if(event.key == "Escape"){
              this.setAttribute("contenteditable","false");
            }
          })
        }
    }

    //Wykrycie czy lewy przycisk myszy został naciśnięty
    table.addEventListener("mousedown", function(event){
      WyczyscStyl();
      SaveCellsColors()
      if(myszNacisnieta == false){
        if(event.target.id != "mainTable" && event.target.id){
          //Wyczyszczenie styli do podstawowych
          WyczyscStyl();
          tabelaZaznaczonych = [];
          //Zapisanie pierwszej zaznaczonej komórki
          pierwszaKomorka = event.target.id;
          ostatniaKomorka = event.target.id;
          //Zmiana koloru, na kolor zaznaczenie
          ZmienKolor(pierwszaKomorka);
          myszNacisnieta = true;
        }
      }
    })

    table.addEventListener("mousemove", function(event){
      if(myszNacisnieta){
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
      myszNacisnieta = false;

      //Zmieniamy opcje wyświetlania dla ostatniej zaznaczonej komorki przed zakonczeniem zaznaczania
      BorderViewFunction(ostatniaKomorka);
      CheckFontSettings(ostatniaKomorka);
      CheckTextAlignSettings(ostatniaKomorka);
      OptionChangeSize(ostatniaKomorka);
      ChangeColorInBox(ostatniaKomorka);
      CheckMerged(ostatniaKomorka);
      CheckColorInCell(ostatniaKomorka);
      wybranaKomorka = null;
    })

    table.addEventListener("dblclick", function(event){
      if(ostatniaEdytowana != null){
        document.getElementById(ostatniaEdytowana).setAttribute("contenteditable","false");
        ostatniaEdytowana = event.target.id;
      }
      else{
        ostatniaEdytowana = event.target.id;
      }
      document.getElementById(ostatniaEdytowana).setAttribute("contenteditable","true");
      SetCarretPosition(document.getElementById(ostatniaEdytowana),document.getElementById(ostatniaEdytowana).innerHTML.length);
      document.getElementById(ostatniaEdytowana).focus();
    })
}

//Wykonuje zaznaczenie komórek,
function ZaznaczenieKomorek(poczatkowyPunkt, aktualnyPunkt){
	wybranaKomorka = null;

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
//Zmiana koloru zaznaczonej/zaznaczonych komórek (żółtawy kolor)
function ZmienKolor(id){
  var element = document.getElementById(id);
  if(element != null){
    element.style.background = "#BEF72C";
  }
}

//Przywrócenie starych kolorów, po zakończeniu zaznaczania (usuwamy kolor zaznaczenia)
function WyczyscStyl(){
  var table = document.getElementById("mainTable");
  if(!table)return;
    for (var i = 0; i < table.rows.length; i++) {
        for (var j = 0; j < table.rows[i].cells.length; j++){
          table.rows[i].cells[j].style.backgroundColor = cellsColorTable[i][j];
        }
    }
}

//Aktualnie wybrana komórka
function ShowPosition(id){
    if(wybranaKomorka != null){
      var element = wybranaKomorka.split(":");
      document.getElementById(wybranaKomorka).style.backgroundColor = cellsColorTable[element[0]][element[1]];
    }
    wybranaKomorka = id;
    document.getElementById(id).style.backgroundColor = "#BEF72C";
}

function AddBorder(){
    var table = document.getElementById("mainTable");
    if(table != null){		
      if(table.style.border == "1px solid black"){
        table.style.border = "0px solid black";
      }
      else{
        table.style.border = "1px solid black";
      }
    }
	
}

function ScalKomorki(){
  if(pierwszaKomorka != null && ostatniaKomorka != null){

    RozdzielKomorki()

    //Usuwanie komorek z roznicy pomiedzy pierwsza a ostatnia
    //Tekst pozostaje tylko w komorce startowej
    //Dodajemy rowspan i colspan w Math.abs(roznica ostatnia i pierwsza po x i y)
    var tekst = pierwszaKomorka.split(":");
    var tekst2 = ostatniaKomorka.split(":");
  
    var xMin = Math.min(tekst[0], tekst2[0]);
    var xMax = Math.max(tekst[0], tekst2[0]);
    var yMin = Math.min(tekst[1], tekst2[1]);
    var yMax = Math.max(tekst[1], tekst2[1]);
  
    var tekst = document.getElementById(pierwszaKomorka).innerHTML;
  
    for(var x = xMin; x <= xMax; x++){
      for(var y = yMin; y <= yMax; y++){
        if(x+":"+y != xMin+":"+yMin){
          //document.getElementById(x+":"+y).remove();
          document.getElementById(x+":"+y).style.display = "none";
          document.getElementById(x+":"+y).id = "";
        }
      }
    }
    document.getElementById(xMin+":"+yMin).rowSpan = Math.abs(xMax - xMin + 1);
    document.getElementById(xMin+":"+yMin).colSpan = Math.abs(yMax - yMin + 1);
    document.getElementById(xMin+":"+yMin).innerHTML = tekst;
    document.getElementById(xMin+":"+yMin).style.height = (Number(Math.abs(xMax - xMin + 1)) * 5)+"vh";
    
    WyczyscStyl();

    wybranaKomorka = null;
    tabelaZaznaczonych = [];
    pierwszaKomorka = null;
    ostatniaKomorka = null;
  }
}


//Wyjasnienie dlaczego są dwie funkcje o tej samej nazwie tylko w innym jezyku:
//Generalnie poniższa funkcja decyduje czy mamy zaznaczone wiele komorek czy tylko jedna
function RozdzielKomorki(){
  if(tabelaZaznaczonych.length > 0){
    //We are using here all highlighted cells (color yellow)
    for(var i = 0; i < tabelaZaznaczonych.length; i++){
      if(CheckSpans(tabelaZaznaczonych[i])){
        SplitCell(tabelaZaznaczonych[i]);
        ClearCheckMerged(tabelaZaznaczonych[i]);
      }
    }
    tabelaZaznaczonych = [];
  }
  else if(wybranaKomorka != null){
    //We are using only one highlighted cell (color green)
    if(CheckSpans(wybranaKomorka)){
      SplitCell(wybranaKomorka);
      ClearCheckMerged(wybranaKomorka);
      wybranaKomorka = null;
    }
  } 
}

function CheckSpans(elementID){
  var element = document.getElementById(elementID);
  if(element.colSpan > 1 || element.rowSpan > 1){
    return true;
  }
  else{
    return false;
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
  //var text = document.getElementById(element).innerHTML;
  //Delete this element
  //document.getElementById(element).remove();

  document.getElementById(element).rowSpan = 1;
  document.getElementById(element).colSpan = 1;
  document.getElementById(element).style.height = "5vh";
  //Create new element from id of this element to id + rows and id + cols
  //
  for (var i = elementID[0]; i < Number(elementID[0]) + Number(rows) ; i++) {
    for (var j = elementID[1]; j < Number(elementID[1]) + Number(cols); j++){
      //Add new cell to specific index
      //https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableRowElement/insertCell
      /*if(j > table.rows[i].childElementCount){
        var cell = table.rows[i].insertCell(-1);
      }
      else{
        var cell = table.rows[i].insertCell(j);
      }
      AddPropertiesToCell(cell, i, j);*/
      table.rows[i].cells[j].style.display = "";
      table.rows[i].cells[j].id = i+":"+j;
      table.rows[i].cells[j].innerHTML = i+":"+j;
    }
  }
  //Write there text from element
  //Wyrzucam tekst, żeby było widać ID 
  //document.getElementById(element).innerHTML = text;
}

function AddPropertiesToCell(cell, i, j){
  cell.id = i +":" + j;
  cell.setAttribute("contenteditable","false");
  cell.innerHTML = cell.id;
  cell.style.border = "1px dashed black";
  cell.style.textAlign = "left";
  cell.style.fontSize = Converter_pt_px("11pt");
  cell.onclick = function () {
    if(myszNacisnieta != true){
      WyczyscStyl();
      ShowPosition(this.id);
      CheckMerged(this.id);
    }
  }
}

function InsertColumn(side){
  if(wybranaKomorka == null){
    if(tabelaZaznaczonych.length > 0){
      alert(tabelaZaznaczonych[0]);
      alert(tabelaZaznaczonych[tabelaZaznaczonych.length - 1]);
      switch(side){
        case "l": wybranaKomorka = tabelaZaznaczonych[0];break;
        case "r": wybranaKomorka = tabelaZaznaczonych[tabelaZaznaczonych.length - 1];break;
      }
      tabelaZaznaczonych = [];
      ostatniaKomorka = "";
    }
    else{
      return;
    }
  }
  if(!wybranaKomorka) return;
  const coords = wybranaKomorka.split(":");
  const table = document.getElementById("mainTable");
  //check collision
  let collision = checkMergeCollide(coords[0], coords[1], side, table);
  if(collision.length > 0){
    if(!confirm("Wstawienie kolumny spowoduje rozdzielenie niektórych komórek! Kontunuować?")) return;
    else {
      for(let c = 0; c < collision.length; c++){
        SplitCell(collision[c][0]+":"+collision[c][1]);
      }
    }
  }
  WyczyscStyl();
  let colID = parseInt(coords[1]);
  if(side == 'r') colID+=document.getElementById(wybranaKomorka).colSpan;

  AddToToolBar(colID);

  if(colID == tableCols){
    for(let i = 0; i < table.rows.length; i++){
      let cell = table.rows[i].insertCell(table.rows[i].cells.length);
      AddPropertiesToCell(cell, i, table.rows[i].cells.length-1);
    }
  } else {
    //change ids
    for (let i = 0; i < table.rows.length; i++) {
      for (let j = 0; j < table.rows[i].cells.length; j++){
        let cCell = table.rows[i].cells[j].id.split(":");
        if(parseInt(cCell[1]) >= colID)
          table.rows[i].cells[j].id = i+":"+(parseInt(cCell[1])+1);
      }
    }
    //add cell
    for(let i = 0; i < table.rows.length; i++){
      for(let j = 0; j < table.rows[i].cells.length; j++){
        let cCell = table.rows[i].cells[j].id.split(":");
        if(parseInt(cCell[1]) > colID){
          const nCell = table.rows[i].insertCell(j);
          AddPropertiesToCell(nCell, i, colID);
          break;
        }
      }
    }
    SaveCellsColors()
  }
  tableCols++;
  wybranaKomorka = null;
  WyczyscStyl();
  ChangeBorderColor();
  //AddFunction();
}

function InsertRow(side){
  if(wybranaKomorka == null){
    if(tabelaZaznaczonych.length > 0){
      alert(tabelaZaznaczonych[0]);
      alert(tabelaZaznaczonych[tabelaZaznaczonych.length - 1]);
      switch(side){
        case "u": wybranaKomorka = tabelaZaznaczonych[0];break;
        case "d": wybranaKomorka = tabelaZaznaczonych[tabelaZaznaczonych.length - 1];break;
      }
      tabelaZaznaczonych = [];
      ostatniaKomorka = "";
    }
    else{
      return;
    }
  }
  if(!wybranaKomorka) return;
  const coords = wybranaKomorka.split(":");
  const table = document.getElementById("mainTable");
  let rowID = parseInt(coords[0]);
  if(side == 'd') rowID+=document.getElementById(wybranaKomorka).rowSpan;
  //check merged cells
  let collision = checkMergeCollide(rowID, coords[1], side, table);
  if(collision.length > 0){
    if(!confirm("Wstawienie wiersza spowoduje rozdzielenie niektórych komórek! Kontunuować?")) return;
    else {
      for(let c = 0; c < collision.length; c++){
        SplitCell(collision[c][0]+":"+collision[c][1]);
      }
    }
  }
  WyczyscStyl();
  //change ids
  for (let i = rowID; i < table.rows.length; i++) {
      for (let j = 0; j < table.rows[i].cells.length; j++){
        let cCell = table.rows[i].cells[j].id.split(":");
        table.rows[i].cells[j].id = (parseInt(cCell[0])+1)+":"+parseInt(cCell[1]);
      }
  }
  const x = tableCols;
  table.insertRow(rowID);
  //add cells
  for(let i = 0; i < x; i++){
    let cell = table.rows[rowID].insertCell(i);
    AddPropertiesToCell(cell, rowID, i);
  }
  AddToHeightBar(rowID);
  wybranaKomorka = null;
  SaveCellsColors();
  WyczyscStyl();
  ChangeBorderColor();
  //AddFunction();
}

function deleteColumn(){
  if(wybranaKomorka == null){
    if(ostatniaKomorka != null && tabelaZaznaczonych.length > 0){
      wybranaKomorka = ostatniaKomorka;
      tabelaZaznaczonych = [];
      ostatniaKomorka = "";
    }
    else{
      return;
    }
  }
  if(!wybranaKomorka) return;
  const coords = wybranaKomorka.split(":");
  const table = document.getElementById("mainTable");
  const colID = parseInt(coords[1]);
  //check collision
  let collision = checkMergeCollide(coords[0], coords[1], "l", table);
  collision = collision.concat(checkMergeCollide(coords[0], coords[1], "r", table));
  if(collision.length > 0){
    if(!confirm("Usunięcie kolumny spowoduje rozdzielenie niektórych komórek! Kontunuować?")) return;
    else {
      for(let c = 0; c < collision.length; c++){
        SplitCell(collision[c][0]+":"+collision[c][1]);
      }
    }
  }
  //delete
  for(let i = 0; i < table.rows.length; i++){
    for(let j = 0; j < table.rows[i].cells.length; j++){
      if(parseInt(table.rows[i].cells[j].id.split(":")[1]) == colID){
        table.rows[i].deleteCell(j);
      }
    }
  }
  //change ids
  for(let i = 0; i < table.rows.length; i++){
    for(let j = 0; j < table.rows[i].cells.length; j++){
      let cCell = table.rows[i].cells[j].id.split(":");
      if(parseInt(cCell[1]) > colID){
        table.rows[i].cells[j].id = parseInt(cCell[0])+":"+(parseInt(cCell[1]-1));
      }
    }
  }
  RemoveFromToolBar(colID);
  tableCols--;
  wybranaKomorka = null;
  SaveCellsColors();
  WyczyscStyl();
}

function deleteRow(){
  if(wybranaKomorka == null){
    if(ostatniaKomorka != null && tabelaZaznaczonych.length > 0){
      wybranaKomorka = ostatniaKomorka;
      tabelaZaznaczonych = [];
      ostatniaKomorka = "";
    }
    else{
      return;
    }
  }
  if(!wybranaKomorka) return;
  const coords = wybranaKomorka.split(":");
  const table = document.getElementById("mainTable");
  let rowID = parseInt(coords[0]);
  //check merged cells
  let collision = checkMergeCollide(rowID, coords[1], "u", table);
  collision = collision.concat(checkMergeCollide(rowID, coords[1], "d", table));
  if(collision.length > 0){
    if(!confirm("Usunięcie wiersza spowoduje rozdzielenie niektórych komórek! Kontunuować?")) return;
    else {
      for(let c = 0; c < collision.length; c++){
        SplitCell(collision[c][0]+":"+collision[c][1]);
      }
    }
  }
  table.deleteRow(rowID);
  RemoveFromHeightBar(rowID);
  //change ids
  for(let i = rowID; i < table.rows.length; i++){
    for(let j = 0; j < table.rows[i].cells.length; j++){
      let cCell = table.rows[i].cells[j].id.split(":");
      table.rows[i].cells[j].id = (parseInt(cCell[0])-1)+":"+parseInt(cCell[1]);
    }
  }
  wybranaKomorka = null;
  SaveCellsColors();
  WyczyscStyl();
}

function checkMergeCollide(row, col, side, table){
  let errorCells = [];
  let collision = false;

  switch(side){
    case "l":
      for(let i = 0; i < table.rows.length; i++){
        if(i == row) continue;
        for(let j = 0; j < col; j++){
          let cell = document.getElementById(i+":"+j);
          if(cell == null) continue;
          if(cell.colSpan > 1){
            if(j + cell.colSpan > col){
              errorCells.push([i,j]);
            }
          }
        }
      }
    break;
    case "r":
      for(let i = 0; i < table.rows.length; i++){
        if(i == row) continue;
        for(let j = 0; j <= col; j++){
          let cell = document.getElementById(i+":"+j);
          if(cell == null) continue;
          if(cell.colSpan > 1){
            if(j + cell.colSpan - 1 > col){
              errorCells.push([i,j]);
            }
          }
        }
      }
    break;
    case "u":
      for(let i = 0; i < row; i++){
        for(let j = 0; j < table.rows[i].cells.length; j++){
          let cell = table.rows[i].cells[j];
          if(cell.rowSpan > 1){
            if(cell.rowSpan + i > row){
              errorCells.push([i, parseInt(cell.id.split(":")[1])]);
            }
          }
        }
      }
    break;
    case "d":
      if(row < table.rows.length){
        for(let i = 0; i <= row; i++){
          for(let j = 0; j < table.rows[i].cells.length; j++){
            let cell = table.rows[i].cells[j];
            if(cell.rowSpan > 1){
              if(cell.rowSpan + i > row){
                errorCells.push([i, parseInt(cell.id.split(":")[1])]);
              }
            }
          }
        }
      }
    break;
  }
  return errorCells;
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


//Dodanie kolorow 
window.onload = function(){
  //Uchwyt do głownego elementu zawierajaca liste kolorow
  var mainContainer = document.getElementById("cellColor");
  for(var i=0; i < colorTable.length; i++){
    var element = document.createElement("a");
    element.value = colorTable[i];
    element.style.backgroundColor = colorTable[i];
    //element.classList.add("colorCellStyle");
    element.classList.add("colorCellStyleDiv");
    element.onclick = function(){
      var colorValue = this.value;
      if(wybranaKomorka != null){
        document.getElementById(wybranaKomorka).style.backgroundColor = colorValue;
        var position = wybranaKomorka.split(":");
        cellsColorTable[position[0]][position[1]] = colorValue;
      }
      if(tabelaZaznaczonych.length > 0){
        for(var i=0; i<tabelaZaznaczonych.length; i++){
          if(document.getElementById(tabelaZaznaczonych[i])){
            document.getElementById(tabelaZaznaczonych[i]).style.backgroundColor = colorValue;
          }
          var position = tabelaZaznaczonych[i].split(":");
          cellsColorTable[position[0]][position[1]] = colorValue;
        }
      }
      
      document.getElementById("cellColorText").style.backgroundColor = colorValue;
      document.getElementById("cellColorText").style.color = colorValue;

      document.getElementById("cellColorWriter").value = colorValue;
      document.getElementById("cellColorPicker").value = colorValue;
      
    }

    mainContainer.appendChild(element);
  }
  CreateColorCreator(mainContainer, "cell");

  var secondContainer = document.getElementById("tableBorderColors");
  for(var i=0; i < colorTable.length; i++){
    var element = document.createElement("div");
    element.style.backgroundColor = colorTable[i];
    element.id = colorTable[i];
    element.classList.add("colorCellStyleDiv");

    element.onclick = function(){
      borderColor = this.id;
      document.getElementById("borderColorText").style.color = borderColor;
      document.getElementById("borderColorText").style.backgroundColor = borderColor;
      //Zmiana koloru obramowania istniejącego
      ChangeBorderColor();
    }
    secondContainer.appendChild(element);
  }

  CreateColorCreator(secondContainer, "border");



  var textColorContainer = document.getElementById("tableTextColors");
  for(var i=0; i < colorTable.length; i++){
    var element = document.createElement("div");
    element.style.backgroundColor = colorTable[i];
    element.id = colorTable[i];
    element.classList.add("colorCellStyleDiv");

    element.onclick = function(){
      textColor = this.id;
      document.getElementById("textColorText").style.color = textColor;
      document.getElementById("textColorText").style.backgroundColor = textColor;
      ChangeTextColors();
    }
    textColorContainer.appendChild(element);
  }

  CreateColorCreator(textColorContainer, "text");

  //Tworzenia listy z wielkością czcionek
  var textSizeElement = document.getElementById("fontSize");
  for(var i = 0; i < fontSizeTable.length; i++){
    var element = document.createElement("option");
    element.value=fontSizeTable[i];
    var optionText = document.createTextNode(fontSizeTable[i]+"pt");
    element.appendChild(optionText);
    textSizeElement.appendChild(element);

    if(fontSizeTable[i] == 11){
      element.selected = true;
    }
  }

  document.getElementById("cellColorPicker").value = "#ffffff";
  document.getElementById("cellColorWriter").value = "#ffffff";
}

//Zaznaczenie zmienia kolor i należało by przywrócić do tego co było wcześniej
//Dlatego przed pierwszym zaznaczeniem, funkcja będzie zapisywała w tabeli stan kolorów każdej z komórki
//A po odznaczeniu wykorzystując funkcje "WyczyscStyl()" przywrócimy kolory do pierwotnego stanu
function SaveCellsColors(){
  var table = document.getElementById("mainTable");

  cellsColorTable = new Array(table.rows.length);

  for (var i = 0; i < table.rows.length; i++) {

    cellsColorTable[i] = new Array(table.rows[i].cells.length);

      for (var j = 0; j < table.rows[i].cells.length; j++){
        //table.rows[i].cells[j].style.background = "gray";
        cellsColorTable[i][j] = table.rows[i].cells[j].style.backgroundColor;
      }
  }
}

//Funkcja odpowiedzialna za dodanie obramowania do wybranej komorki(tylko jedna => moze byc scalona)
//Ponownie kliknięcie powoduje że dane obramowanie znika
//<!-- LEWO, GORA, PRAWO, DOL-->
function AddBorderToCell(borderValue){

  var element = document.getElementById(wybranaKomorka);
  if(element != null){
    AddingBorder(element, borderValue);
  }
  else if(tabelaZaznaczonych.length > 0){
    for(var i = 0; i < tabelaZaznaczonych.length ; i++){
      AddingBorder(document.getElementById(tabelaZaznaczonych[i]), borderValue);
    }
  }
  CheckTableBorder();
}

function AddingBorder(element, borderValue){
  var tablePosition = ["Left", "Top", "Right", "Bottom"];

  var bordersTable = tablePosition.map(function(x){
    return element.style["border"+x+"Style"];
  })

  if(borderValue.every(function(x){return x == 1})){
    for(var i = 0 ; i < tablePosition.length; i++){
      var position = "border"+tablePosition[i];
      element.style[position] = "1px solid "+borderColor;
    }
  }
  else{
    for(var i = 0 ; i < tablePosition.length; i++){

      if(borderValue[i] == 1){
        var position = "border"+tablePosition[i];
        if(bordersTable[i] == "dashed"){
          element.style[position] = "1px solid "+borderColor;
        }
        else{
          element.style[position] = "1px dashed black";
        }
      }
    }
  }
  BorderViewFunction(element.id);
}

function DecideCellsToClear(){
  var element = document.getElementById(wybranaKomorka);
  if(element != null){
    ClearBorderFromCell(element);
  }
  else if(tabelaZaznaczonych.length > 0){
    for(var i = 0; i < tabelaZaznaczonych.length ; i++){
      ClearBorderFromCell(document.getElementById(tabelaZaznaczonych[i]));
    }
  }
}

function ClearBorderFromCell(element){
  var tablePosition = ["Left", "Top", "Right", "Bottom"];

  var bordersTable = tablePosition.map(function(x){
    return element.style["border"+x+"Style"];
  })

  for(var i = 0; i < tablePosition.length; i++){
    var position = "border"+tablePosition[i];
    element.style[position] = "1px dashed black";
    BorderViewFunction(element.id);
  }
}

function BorderViewFunction(id){
  ClearBorderView();
  var element = document.getElementById(id);
  var tablePosition = ["Top", "Right", "Bottom", "Left"];
  var amount = 0;

  var bordersTable = tablePosition.map(function(x){
    return element.style["border"+x+"Style"];
  })

  for(var i = 0; i < tablePosition.length; i++){
    if(bordersTable[i] == "solid"){
      switch(tablePosition[i]){
        case "Top": document.getElementById("topBorder").classList.add("borderChecked");break;
        case "Right": document.getElementById("rightBorder").classList.add("borderChecked");break;
        case "Bottom": document.getElementById("bottomBorder").classList.add("borderChecked");break;
        case "Left": document.getElementById("leftBorder").classList.add("borderChecked");break;
      }
      amount++;
    }
  }
  if(amount == 4){
    document.getElementById("allBorders").classList.add("borderChecked");
  }
}

//Wyczyszczenie ustawien obramowania komorki
function ClearBorderView(){
  document.getElementById("allBorders").classList.remove("borderChecked");
  document.getElementById("topBorder").classList.remove("borderChecked");
  document.getElementById("rightBorder").classList.remove("borderChecked");
  document.getElementById("bottomBorder").classList.remove("borderChecked");
  document.getElementById("leftBorder").classList.remove("borderChecked");
}

var horizontal = false;
var vertical = false;
function TableBorderChange(borderValues){
  var mainTable = document.getElementById("mainTable");
  if(!mainTable)return;
  var cells = mainTable.querySelectorAll("td");

  //ClearTableBorder();

  if(borderValues.every(x => x == 1)){
    if(horizontal) horizontal = false;
    if(vertical) vertical = false;
  }

  if(borderValues[0] == 1){
    if(horizontal){
      for(var i = 0; i < cells.length ; i++){
        cells[i].style.borderTop = "1px dashed black";
        cells[i].style.borderBottom = "1px dashed black";
      }
      horizontal = false;
      document.getElementById("horizontalEdges").classList.remove("borderChecked");
    } else{
      for(var i = 0; i < cells.length ; i++){
        cells[i].style.borderTop = "1px solid "+borderColor;
        cells[i].style.borderBottom = "1px solid "+borderColor;
      }
      horizontal = true;
      document.getElementById("horizontalEdges").classList.add("borderChecked");
    }
  }
  

  if(borderValues[1] == 1){
    if(vertical){
      for(var i = 0; i < cells.length ; i++){
        cells[i].style.borderLeft = "1px dashed black";
        cells[i].style.borderRight = "1px dashed black";
      }
      vertical = false;
      document.getElementById("verticalEdges").classList.remove("borderChecked");
    } else {
      for(var i = 0; i < cells.length ; i++){
        cells[i].style.borderLeft = "1px solid "+borderColor;
        cells[i].style.borderRight = "1px solid "+borderColor;
      }
      vertical = true;
      document.getElementById("verticalEdges").classList.add("borderChecked");
    }
  }

  if(horizontal == true && vertical == true){
    document.getElementById("allEdges").classList.add("borderChecked");
  }
  else{
    document.getElementById("allEdges").classList.remove("borderChecked");
  }
}

function ClearTableBorder(){
  var mainTable = document.getElementById("mainTable");
  var cells = mainTable.querySelectorAll("td");
  for(var i = 0; i < cells.length ; i++){
    cells[i].style.border = "1px dashed black";
  }
  document.getElementById("horizontalEdges").classList.remove("borderChecked");
  document.getElementById("verticalEdges").classList.remove("borderChecked");
  document.getElementById("allEdges").classList.remove("borderChecked");
  vertical = false;
  horizontal = false;
}

//Ustawienie aktualnie wpisywanej czcionki na BOLD
//Potem można się pobawić że jak jest zaznaczony tekst i zostanie naciśnięty ten guzik do zmienia czcionke tego tekstu
function FontBold(element){
  var items = (wybranaKomorka ? wybranaKomorka.split(" ") : tabelaZaznaczonych);
  if(items){
    for(var i = 0; i < items.length; i++){
      var choosenCell;
      if(document.getElementById(items[i])){
        choosenCell = document.getElementById(items[i])
      }
      else{
        continue;
      }
      var cellStyle = window.getComputedStyle(choosenCell);
      //wybranaKomorka
      var actualFontWeight = cellStyle.getPropertyValue("font-weight");
      //Rodzic
      var aElement = element.parentElement;
      //400 oznacza normalną czcionke
      if(actualFontWeight == 400){
        aElement.classList.add("settingChoosen");
        choosenCell.style.fontWeight = "bold";
      }
      else{
        aElement.classList.remove("settingChoosen");
        choosenCell.style.fontWeight = "400";
      }
    }
  }
}

function ItalicFont(element){
  var items = (wybranaKomorka ? wybranaKomorka.split(" ") : tabelaZaznaczonych);
  if(items){
    for(var i = 0; i < items.length; i++){
      var choosenCell;
      if(document.getElementById(items[i])){
        choosenCell = document.getElementById(items[i])
      }
      else{
        continue;
      }
      var cellStyle = window.getComputedStyle(choosenCell);
      //wybranaKomorka
      var actualFontItalic = cellStyle.getPropertyValue("font-style");
      //Rodzic
      var aElement = element.parentElement;
      if(actualFontItalic == "normal"){
        aElement.classList.add("settingChoosen");
        choosenCell.style.fontStyle = "italic";
      }
      else{
        aElement.classList.remove("settingChoosen");
        choosenCell.style.fontStyle = "normal";
      }
    }
  }
}

function UnderLineFont(element){
  var items = (wybranaKomorka ? wybranaKomorka.split(" ") : tabelaZaznaczonych);
  if(items){
    for(var i = 0; i < items.length; i++){
      var choosenCell;
      if(document.getElementById(items[i])){
        choosenCell = document.getElementById(items[i])
      }
      else{
        continue;
      }
      var cellStyle = window.getComputedStyle(choosenCell);
      //wybranaKomorka
      var actualFontUnderline = cellStyle.getPropertyValue("text-decoration");
      //Rodzic
      var aElement = element.parentElement;
      if(actualFontUnderline.includes("underline")){
        aElement.classList.remove("settingChoosen");
        choosenCell.style.textDecoration = "none";
      }
      else{
        aElement.classList.add("settingChoosen");
        choosenCell.style.textDecoration = "underline";
      }
    }
  }
}

function CheckFontSettings(id){
  var element = document.getElementById(id);
  var elementStyles = window.getComputedStyle(element);

  var actualFontUnderline = elementStyles.getPropertyValue("text-decoration");
  var actualFontItalic = elementStyles.getPropertyValue("font-style");
  var actualFontWeight = elementStyles.getPropertyValue("font-weight");

  var underlineButton = document.getElementsByClassName("fas fa-underline")[0].parentElement;
  var italicButton = document.getElementsByClassName("fas fa-italic")[0].parentElement;
  var weightButton = document.getElementsByClassName("fas fa-bold")[0].parentElement;

  if(actualFontUnderline.includes("underline")){
    underlineButton.classList.add("settingChoosen");
  }else{
    underlineButton.classList.remove("settingChoosen");
  }

  if(actualFontItalic == "italic"){
    italicButton.classList.add("settingChoosen");
  }else{
    italicButton.classList.remove("settingChoosen");
  }

  if(actualFontWeight == "700"){
    weightButton.classList.add("settingChoosen");
  }else{
    weightButton.classList.remove("settingChoosen");
  }
}


function ChangeTextAlign(alignSettings){
  var items = (wybranaKomorka ? wybranaKomorka.split(" ") : tabelaZaznaczonych);
  if(items){
    for(var j = 0; j < items.length; j++){
      var element;
      if(document.getElementById(items[j])){
        element = document.getElementById(items[j])
      }
      else{
        continue;
      }
      var position = alignSettings.indexOf("1",0);

      var leftButton = document.getElementsByClassName("fas fa-align-left")[0].parentElement;
      var centerButton = document.getElementsByClassName("fa fa-align-center")[0].parentElement;
      var rightButton = document.getElementsByClassName("fa fa-align-right")[0].parentElement;
      //var justifyButton = document.getElementsByClassName("fas fa-align-justify")[0].parentElement;

      //var buttonArray = Array.of(leftButton, centerButton, rightButton, justifyButton)
      var buttonArray = Array.of(leftButton, centerButton, rightButton);
      for(var i = 0 ; i < buttonArray.length ; i++){
        buttonArray[i].classList.remove("settingChoosen");
      }

      switch(position){
        case 0 : 
          element.style.textAlign = "left";
          element.style.verticalAlign = "";
          leftButton.classList.add("settingChoosen");
          break;

        case 1 : 
          element.style.textAlign = "center";
          element.style.verticalAlign = "";
          centerButton.classList.add("settingChoosen");
          break;

        case 2 : 
          element.style.textAlign = "right";
          element.style.verticalAlign = "";
          rightButton.classList.add("settingChoosen");
          break;

        /*case 3 : 
          element.style.textAlign = "justify";
          element.style.verticalAlign = "baseline";
          justifyButton.classList.add("settingChoosen");
          break;*/
      }
    }
  }
}


function CheckTextAlignSettings(id){
  var element = document.getElementById(id);
  var elementStyles = window.getComputedStyle(element);

  var actualTextAlign = elementStyles.getPropertyValue("text-align");

  var leftButton = document.getElementsByClassName("fas fa-align-left")[0].parentElement;
  var centerButton = document.getElementsByClassName("fa fa-align-center")[0].parentElement;
  var rightButton = document.getElementsByClassName("fa fa-align-right")[0].parentElement;
  //var justifyButton = document.getElementsByClassName("fas fa-align-justify")[0].parentElement;

  //var buttonArray = Array.of(leftButton, centerButton, rightButton, justifyButton)

  var buttonArray = Array.of(leftButton, centerButton, rightButton)
  for(var i = 0 ; i < buttonArray.length ; i++){
    buttonArray[i].classList.remove("settingChoosen");
  }

  switch(actualTextAlign){
    case "left":
      leftButton.classList.add("settingChoosen");
      break;

    case "center":
      centerButton.classList.add("settingChoosen");
      break;

    case "right":
      rightButton.classList.add("settingChoosen");
      break;

    /*case "justify":
      justifyButton.classList.add("settingChoosen");
      break;*/
  }
}


function ChangeTextSize(){
  var element = document.getElementById("fontSize");
  var textSize = element.options[element.selectedIndex].text;

  var items = (wybranaKomorka ? wybranaKomorka.split(" ") : tabelaZaznaczonych);
  if(items){
    for(var i = 0; i < items.length; i++){
      var choosenCell;
      if(document.getElementById(items[i])){
        choosenCell = document.getElementById(items[i])
      }
      else{
        continue;
      }
      choosenCell.style.fontSize = Converter_pt_px(textSize);
    }
  }
}

function OptionChangeSize(id){
  var element = document.getElementById(id);
  var elementStyles = window.getComputedStyle(element);
  var fontSize = elementStyles.getPropertyValue("font-size");
  var actualTextSize = Converter_px_pt(fontSize);
  var options = document.getElementById("fontSize").options;
  for(var i = 0; i < options.length ; i++){
    if(options[i].text == actualTextSize){
      document.getElementById("fontSize").selectedIndex = i;
      break;
    }
  }
}

function ChangeTextColors(){
  if(wybranaKomorka != null){
    var element = document.getElementById(wybranaKomorka);
    element.style.color = textColor;
  }
  if(tabelaZaznaczonych.length > 0){
    for(var i=0; i<tabelaZaznaczonych.length; i++){
      if(document.getElementById(tabelaZaznaczonych[i])){
        var element = document.getElementById(tabelaZaznaczonych[i]);
        element.style.color = textColor;
      }
    }
  }
  document.getElementById("textColorWriter").value = textColor;
  document.getElementById("textColorPicker").value = textColor;
}

function ChangeColorInBox(id){
  var element = document.getElementById(id);
  var elementStyles = window.getComputedStyle(element);

  var actualTextColor = elementStyles.getPropertyValue("color");

  var box = document.getElementById("textColorText");
  box.style.background = actualTextColor;
  box.style.color = actualTextColor;

  textColor = RGBToHex(actualTextColor);

  document.getElementById("textColorWriter").value = textColor;
  document.getElementById("textColorPicker").value = textColor;
}


function ChangeBorderColor(){
  var mainTable = document.getElementById("mainTable");
  if(!mainTable)return;
  var cells = mainTable.querySelectorAll("td");

  /*if(horizontal == true){
    for(var i = 0; i < cells.length ; i++){
      cells[i].style.borderTop = "1px solid "+borderColor;
      cells[i].style.borderBottom = "1px solid "+borderColor;
    }
  }
  if(vertical == true){
    for(var i = 0; i < cells.length ; i++){
      cells[i].style.borderLeft = "1px solid "+borderColor;
      cells[i].style.borderRight = "1px solid "+borderColor;
    }
  }*/
  var borderParts = ["borderLeft","borderTop","borderRight","borderBottom"];
  for(var i = 0; i < cells.length ; i++){
    for(var j = 0; j < borderParts.length; j++){
      var borderValue = cells[i].style[borderParts[j]].split(" ");
      if(borderValue[1] == "solid"){
        cells[i].style[borderParts[j]] = "1px solid "+borderColor;
      }
    }
  }
  document.getElementById("borderColorWriter").value = borderColor;
  document.getElementById("borderColorPicker").value = borderColor;
}

function ChangeBorderCollapse(variable){
  var table = document.getElementById("mainTable");
  if(!table)return;
  switch(variable){
    case 0 : table.style.borderCollapse = "collapse"; break;
    case 1 : table.style.borderCollapse = "separate"; break;
  }
}

function CheckMerged(id){
  var element = document.getElementById(id);
  var button = document.getElementById("mergeCells");
  if(element.rowSpan > 1 || element.colSpan > 1){
    button.classList.add("buttonChecked");
  }
  else{
    button.classList.remove("buttonChecked");
  }
}

function ClearCheckMerged(id){
  var button = document.getElementById("mergeCells");
  button.classList.remove("buttonChecked");
}

//zlicza wystepowanie elementu
Array.prototype.countElement = function(element){
  let count = 0;
  for(let i = 0; i < this.length; i++)
    if(this[i] == element) count++;
  return count;
}


//Zawiera listę wszystkich opcji co do kolumn
var contentToolBar = [];

var withWidth = false;
//Czesc do generowania paska z specyfikacja kolumn
function GenerateToolBar(){
  var amountColumns = tableCols || 0;
  if(amountColumns == 0) return;
  var container = document.getElementById("toolBarContainer");
  var table = document.createElement("table");
  table.id = "toolBarTable";
  var tbody = document.createElement("tbody");
  var row = document.createElement("tr");

  contentToolBar = [];
  for(var i = 0; i < amountColumns; i++){
    contentToolBar[i] = "l";
    var cell = document.createElement("td");
    cell.innerHTML = contentToolBar[i];
    cell.id = i;
    cell.setAttribute("contenteditable","true");
    
    cell.addEventListener("input", ToolBarInput,false);

    cell.addEventListener("focusout", ToolBarFocusOut, false);

    cell.addEventListener("keydown", ToolBarKeyDown, false)

    cell.addEventListener("focus", function(event){
      SetCarretPosition(this, this.innerHTML.length);
    })

    row.appendChild(cell);
  }
  tbody.appendChild(row);
  table.appendChild(tbody);
  container.appendChild(table);
}

function ToolBarInput(event){
    var patternFirst = new RegExp("^[lcr]");
    var patternSecond = new RegExp("^[pmb]");
    var patternThird = new RegExp("^[pmb]{.*}$");

    var text  = this.innerHTML;
    var firstLetter = text[0];

    if(firstLetter == null) return;
    if(firstLetter.match(patternFirst)){
      this.innerHTML = firstLetter;
      withWidth = false;
      SetCarretPosition(this, 1)
      contentToolBar[this.id] = firstLetter;
    }
    else if(firstLetter.match(patternSecond) && withWidth == false){
      withWidth = true;
      this.innerHTML = firstLetter + "{}";
      SetCarretPosition(this, this.innerHTML.length - 1)
    }
    else if(withWidth == false){
      this.innerHTML = "";
    }

    if(withWidth == true){
      if(!text.match(patternThird)){
        this.innerHTML = firstLetter + "{}";
        SetCarretPosition(this, this.innerHTML.length - 1)
      }
    }
}

function ToolBarFocusOut(event){
  var text = this.innerHTML;
      text = text.replace(",",".");
      this.innerHTML = text;

      if(text.length == 0){
        this.innerHTML = "l";
        contentToolBar[this.id] = this.innerHTML;
      }
      else if(text.length == 1) {
        contentToolBar[this.id] = this.innerHTML;
      }
      else{
        var textWidth = this.innerHTML.substr(2, this.innerHTML.length - 3).replace(" ","");
        var width = Number(textWidth.substr(0, textWidth.length - 2));
        var unit = textWidth.substr(textWidth.length - 2, 2);
        if(textWidth.includes("\textwidth")){
          contentToolBar[this.id] = this.innerHTML;
        }
        else{
          var unitsArray = ["in", "mm", "cm", "pt", "em" ,"ex"];
          console.log(unitsArray.includes(unit));
          console.log(Number.isFinite(width));
          if(unitsArray.includes(unit) && Number.isFinite(width)){
            contentToolBar[this.id] = this.innerHTML;
          }
          else{
            this.innerHTML = "l";
            contentToolBar[this.id] = this.innerHTML;
          }
        }
      }
      ChangeCellsTextAlign(this.id, this.innerHTML[0]);
}

function ToolBarKeyDown(event){
  var key = event.key;

      if(key === "Backspace") { 
        var carretIndex = getCaretCharacterOffsetWithin(this);
        var text = this.innerHTML;
        if(text[carretIndex - 1] == "{" || text[carretIndex - 1] == "}"){
          event.preventDefault();
          this.innerHTML = text[0];
          SetCarretPosition(this, 1);
        }
      }

      if(key === "Enter") { 
        event.preventDefault();
      }

      if(key === "Tab"){
        event.preventDefault();
        var fieldID = Number(this.id);
        document.getElementById((Number(fieldID) + 1 < contentToolBar.length) ? Number(fieldID) + 1 : 0).focus();
      }
}

function AddToToolBar(index){
  var tempArray = [];
  for(var i = 0; i < contentToolBar.length + 1; i++){
    if(i == index){
      tempArray.push("l");
    }
    tempArray.push(contentToolBar[i]);
  }
  contentToolBar = tempArray;

  var table = document.getElementById("toolBarTable");
  var cell = table.rows[0].insertCell(index);
  cell.innerHTML = contentToolBar[index];
  cell.id = index;
  cell.setAttribute("contenteditable","true");
  cell.addEventListener("input", ToolBarInput,false);

  cell.addEventListener("focusout", ToolBarFocusOut, false);

  cell.addEventListener("keydown", ToolBarKeyDown, false)

  cell.addEventListener("focus", function(event){
    SetCarretPosition(this, this.innerHTML.length);
  })
  ChangeID();
}

function RemoveFromToolBar(index){
  var table = document.getElementById("toolBarTable");
  table.rows[0].deleteCell(index);
  contentToolBar.splice(index, 1);
  ChangeID();
}

function ChangeID(){
  var table = document.getElementById("toolBarTable");
  var elements = table.rows[0].cells;
  for(var i = 0; i < elements.length; i++){
    elements[i].id = i;
  }
}


function getCaretCharacterOffsetWithin(element) {
  var caretOffset = 0;
  var doc = element.ownerDocument || element.document;
  var win = doc.defaultView || doc.parentWindow;
  var sel;
  if (typeof win.getSelection != "undefined") {
      sel = win.getSelection();
      if (sel.rangeCount > 0) {
          var range = win.getSelection().getRangeAt(0);
          var preCaretRange = range.cloneRange();
          preCaretRange.selectNodeContents(element);
          preCaretRange.setEnd(range.endContainer, range.endOffset);
          caretOffset = preCaretRange.toString().length;
      }
  } else if ( (sel = doc.selection) && sel.type != "Control") {
      var textRange = sel.createRange();
      var preCaretTextRange = doc.body.createTextRange();
      preCaretTextRange.moveToElementText(element);
      preCaretTextRange.setEndPoint("EndToEnd", textRange);
      caretOffset = preCaretTextRange.text.length;
  }
  return caretOffset;
}

function SetCarretPosition(element, position){
  var range = document.createRange();
  var sel = window.getSelection();
  
  range.setStart(element.childNodes[0], position);
  range.collapse(true);
  
  sel.removeAllRanges();
  sel.addRange(range);
}


function CheckTableBorder(){
  var table = document.getElementById("mainTable");
  if(!table)return;
  var allHorizontal = true;
  var allVertical = true;

  for(var i = 0; i < table.rows.length; i++){
    for(var j = 0; j < table.rows[i].cells.length; j++){

      var element = table.rows[i].cells[j];

      var tablePosition = ["Left", "Top", "Right", "Bottom"];

      var bordersTable = tablePosition.map(function(x){
        return element.style["border"+x+"Style"];
      })

      if(bordersTable[0] == "dashed" || bordersTable[2] == "dashed"){
        allVertical = false;
      }

      if(bordersTable[1] == "dashed" || bordersTable[3] == "dashed"){
        allHorizontal = false;
      }

    }
  }
  document.getElementById("allEdges").classList.remove("borderChecked");
  document.getElementById("verticalEdges").classList.remove("borderChecked");
  document.getElementById("horizontalEdges").classList.remove("borderChecked");
  vertical = false;
  horizontal = false;
  
  if(allHorizontal == true && allVertical == true){
    document.getElementById("allEdges").classList.add("borderChecked");
  }

  if(allHorizontal == true){
    document.getElementById("horizontalEdges").classList.add("borderChecked");
    horizontal = true;
  }

  if(allVertical == true){
    document.getElementById("verticalEdges").classList.add("borderChecked");
    vertical = true;
  }

}
//https://tex.stackexchange.com/questions/35293/p-m-and-b-columns-in-tables
function ChangeCellsTextAlign(column, text){
  var patternFirst = new RegExp("^[lcr]");
  var patternSecond = new RegExp("^[pmb]");
  var textAlign = (function(text){
    switch(text){
      case "l" : return "left";
      case "c" : return "center";
      case "r" : return "right";
      case "p" : return "bottom";
      case "m" : return "middle";
      case "b" : return "top";
    }
  })(text);
  var table = document.getElementById("mainTable");
  for(var i = 0; i < table.rows.length; i++){
      var element = document.getElementById(i+":"+column) || null;
      if(element != null){
        if(text.match(patternFirst)){
          element.style.textAlign = textAlign;
          element.style.verticalAlign = ""
        }
        else if(text.match(patternSecond)){
          element.style.textAlign = "center";
          element.style.verticalAlign = textAlign;
        }
      }
  }
}

var heightTooBarArray = [];
function GenerateHeightToolBar(height){
  if(height == 0) return;

  var container = document.getElementById("heightToolBar");
  var table = document.createElement("table");
  table.id = "heightToolBarTable";
  var tbody = document.createElement("tbody");
  heightTooBarArray = [];

  for(var i = 0; i < height; i++){
    var row = document.createElement("tr");
    var cell = document.createElement("td");
    heightTooBarArray[i] = "[0ex]"
    cell.id = "h:"+i;
    cell.innerHTML = "0ex";
    cell.setAttribute("contenteditable","true");

    cell.addEventListener("input", CellInput, false);
    cell.addEventListener("focusin", RemoveUnit, false);
    cell.addEventListener("focusout", AddUnit, false);

    row.appendChild(cell);

    tbody.appendChild(row);
  }
  table.appendChild(tbody);
  container.appendChild(table);
}

function AddToHeightBar(index){
  var newArray = [];
  for(var i = 0; i < heightTooBarArray.length + 1; i++){
    if(i == index){
      newArray.push("[0ex]");
    }
    newArray.push(heightTooBarArray[i]);
  }
  heightTooBarArray = [...newArray];
  alert(heightTooBarArray);
  var table = document.getElementById("heightToolBarTable");
  var row = table.insertRow(index);
  var cell = row.insertCell(0);
  cell.innerHTML = heightTooBarArray[index].replace("[","").replace("]","");
  cell.addEventListener("input", CellInput, false);
  cell.addEventListener("focusin", RemoveUnit, false);
  cell.addEventListener("focusout", AddUnit, false);
  cell.setAttribute("contenteditable","true");

  ChangeIDHeight();
}

function ChangeIDHeight(){
  var table = document.getElementById("heightToolBarTable");
  for(var i = 0; i < table.rows.length; i++){
      var element = table.rows[i].cells[0];
      element.id = "h:"+i;
  }
}

function RemoveFromHeightBar(index){
  var table = document.getElementById("heightToolBarTable");
  table.deleteRow(index);
  heightTooBarArray.splice(index, 1);
  ChangeIDHeight();
}

function CellInput(event){
  var regex = new RegExp("/^-?\d+\.?\d*$/");
  var text = this.innerHTML;

  if(text.length == 2 && text[0] === "0" && !isNaN(parseInt(text[1]))){
    text = text.substr(1, text.length - 1);
    this.innerHTML = text;
  }

  if(!text.match(regex)){
    var newString = text.replace(/[^-?\d+\.?\d*$/]/, "");
    this.innerHTML = newString;
    if(newString.length > 0){
      SetCarretPosition(this, newString.length);
    }
  }
}

const unit = "ex";
function RemoveUnit(event){
  this.innerHTML = this.innerHTML.substr(0, this.innerHTML.length-2);
}

function AddUnit(event){
  if(this.innerHTML.length == 0){
    this.innerHTML = "0";
  }
  this.innerHTML = this.innerHTML + unit;

  var cellID = this.id.split(":")[1];
  heightTooBarArray[cellID] = "["+this.innerHTML+"]";
}

function isNumber(value) 
{
   return typeof value === 'number' && isFinite(value);
}

function Converter_pt_px(value){
  switch(value){
    case "6pt": return "8px";
    case "8pt": return "11px";
    case "9pt": return "12px";
    case "10pt": return "13px";
    case "11pt": return "15px";
    case "12pt": return "16px";
    case "14pt": return "19px";
    case "17pt": return "23px";
    case "20pt": return "26px";
    case "25pt": return "33px";
    default: return "15px";
  }
}

function Converter_px_pt(value){
  switch(value){
    case "8px": return "6pt";
    case "11px": return "8pt";
    case "12px": return "9pt";
    case "13px": return "10pt";
    case "15px": return "11pt";
    case "16px": return "12pt";
    case "19px": return "14pt";
    case "23px": return "17pt";
    case "26px": return "20pt";
    case "33px": return "25pt";
    default: return "11pt";
  }
}


function CheckValue() {
  var element = this;
  var text = element.value ? element.value : "";
  for (var i = 0; i < text.length; i++) {
    var char = text[i];

    if (/^[0-9A-F]$/i.test(char)) {
      element.value = "#" + element.value.substring(1, element.value.length);
    } else {
      element.value = "#" + element.value.slice(1, i) + element.value.slice(i + 1);
    }
  }
  ChangeColor(element);
}

function ChangeColor(element) {
  var color = element.value;
  var elementName = element.getAttribute("name");
	if (color.length == 7) {

    switch(elementName){
      case "border": borderColor = color; break;
      case "text" : textColor = color; break;
      case "cell" : colorValue = color; break;
    }

    document.getElementById(elementName+"ColorPicker").value = color;
    document.getElementById(elementName+"ColorText").style.color = color;
    document.getElementById(elementName+"ColorText").style.backgroundColor = color;
    switch(elementName){
      case "border": ChangeBorderColor(); break;
      case "text" : ChangeTextColors(); break;
      case "cell" : ChangeCellBackground(); break;
    }
    
	}
}

function ColorPickerChange(color, elementName) {
  switch(elementName){
    case "border": borderColor = color;;break;
    case "text" :  textColor = color ;break;
    case "cell" : colorValue = color; break;
  }

  document.getElementById(elementName+"ColorPicker").value = color;
  document.getElementById(elementName+"ColorText").style.color = color;
  document.getElementById(elementName+"ColorText").style.backgroundColor = color;
  document.getElementById(elementName+"ColorWriter").value = color;

  switch(elementName){
    case "border": ChangeBorderColor(); break;
    case "text" : ChangeTextColors(); break;
    case "cell" : ChangeCellBackground(); break;
  }
}

function CreateColorCreator(container, type){
  var p = document.createElement("p");
  p.innerHTML = "Wpisz lub stworz ulubiony kolor";
  p.classList.add("tip");
  container.appendChild(p);

  var input = document.createElement("input");
  input.type = "text";
  input.id = type+"ColorWriter";
  input.addEventListener("input", CheckValue, false);
  input.name = type;
  input.maxLength = "7";
  input.value = "#000000";
  container.appendChild(input);

  var inputColor = document.createElement("input");
  inputColor.type = "color";
  inputColor.value = "#000000";
  inputColor.id = type+"ColorPicker";
  inputColor.name = "color";
	inputColor.addEventListener("change", function(){ColorPickerChange(this.value, type)}, false);
  inputColor.addEventListener("input", function(){ColorPickerChange(this.value, type)}, false);

  container.appendChild(inputColor);
}

function ChangeCellBackground(){
  if(wybranaKomorka != null){
    document.getElementById(wybranaKomorka).style.backgroundColor = colorValue;
    var position = wybranaKomorka.split(":");
    cellsColorTable[position[0]][position[1]] = colorValue;
  }
  if(tabelaZaznaczonych.length > 0){
    for(var i=0; i<tabelaZaznaczonych.length; i++){
      document.getElementById(tabelaZaznaczonych[i]).style.backgroundColor = colorValue;
      var position = tabelaZaznaczonych[i].split(":");
      cellsColorTable[position[0]][position[1]] = colorValue;
    }
  }
}

function CheckColorInCell(id){
  var position = id.split(":");
  var color = RGBToHex(cellsColorTable[position[0]][position[1]]);

  document.getElementById("cellColorText").style.backgroundColor = color;
  document.getElementById("cellColorText").style.color = color;

  document.getElementById("cellColorWriter").value = color;
  document.getElementById("cellColorPicker").value = color;
}

function RGBToHex(rgb) {

  var sep = rgb.indexOf(",") > -1 ? "," : " ";
  rgb = rgb.substr(4).split(")")[0].split(sep);
  rgb[0] = rgb[0].replace("(","");
  
  var r = (+rgb[0]).toString(16),
      g = (+rgb[1]).toString(16),
      b = (+rgb[2]).toString(16);

  if (r.length == 1)
    r = "0" + r;
  if (g.length == 1)
    g = "0" + g;
  if (b.length == 1)
    b = "0" + b;

  return "#" + r + g + b;
}

var titlePlace = "bottom";
var parentID;
function onDragOver(event){
  event.preventDefault();
}

function onDrop(ev){
  ev.preventDefault();
  var data = ev.dataTransfer.getData("text");
  if(ev.target.id != parentID){
    if(ev.target.id == "textContainerBottom"){
      var parent = document.getElementById("bottom");
      parent.prepend(document.getElementById(data));
      parentID = "";
      titlePlace = "bottom";
    }
    else if(ev.target.id == "textContainerTop"){
      var element = ev.target;
      element.innerHTML = "";
      var table = document.createElement("table");
      var tbody = document.createElement("tbody");
      tbody.appendChild(document.getElementById(data));
      table.appendChild(tbody);
      element.appendChild(table);
      parentID = "";
      titlePlace = "top";
    }
  }
  document.getElementById("textContainerBottom").classList.remove("dropzone");
  document.getElementById("textContainerTop").classList.remove("dropzone");
}

function onDrag(event){
  event.dataTransfer.setData("text", event.target.id);
  parentID = document.getElementById(event.target.id).parentNode.parentNode.parentNode.id;
  if(parentID == "textContainerBottom"){
    document.getElementById("textContainerTop").classList.add("dropzone");
  }else if(parentID == "textContainerTop"){
    document.getElementById("textContainerBottom").classList.add("dropzone");
  }
}

function onDragEnd(event){
  document.getElementById("textContainerBottom").classList.remove("dropzone");
  document.getElementById("textContainerTop").classList.remove("dropzone");
}

//https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API
function CopyToClipboard(){
  var text = document.querySelector("#latexCode").textContent;
  if(!text) return;
  navigator.clipboard.writeText(text).then(function(){
    document.getElementById("copyCodeTip").style.display = "block";
    document.getElementById("copyCodeTip").innerHTML = "Tabela skopiowana";
  }, function(){
    document.getElementById("copyCodeTip").style.display = "block";
    document.getElementById("copyCodeTip").innerHTML = "Błąd kopiowania";
  })
}

function HideMessage(){
  var element = document.getElementById("copyCodeTip");
  element.style.display != "none" ? (element.style.display = "none"): "";
  document.getElementById("copyCodeTip").innerHTML = "Skopiuj kod tabeli";
}

function ShowHelp(){
  var element = document.getElementById("copyCodeTip");
  element.style.display = "block";
  //document.getElementById("copyCodeTip").innerHTML = "Skopiuj kod tabeli";
}


function ShowCustomAlert(message){
  var modal = new tingle.modal({
    footer: true,
    stickyFooter: false,
    closeMethods: ['overlay', 'button', 'escape'],
    closeLabel: "Close",
    cssClass: ['customAlert'],
    beforeClose: function() {
        return true;
    }
});

  var element = document.createElement("h1");
  element.innerHTML = message;
  modal.setContent(element);

  modal.addFooterBtn('OK', 'customButton', function() {
      modal.close();
  });
  modal.open();

}

function Help(domain){
	var modalHelp = new tingle.modal({
		footer: true,
		stickyFooter: false,
		closeMethods:['overlay', 'button', 'escape'],
		closeLabel: "Close",
		cssClass: ['helper'],
		beforeClose: function(){
			return true;
		}
	});
	
	var helperContent = "<h1>Help " + domain + "</h1>";
	if(domain == "Plik"){
		helperContent += "<h5>• Otwórz - po najechaniu na tę opcję wyświetlone zostaną możliwości utworzenia tabeli na podstawie wcześniej utworzonego kodu LaTeX lub poprzez wybranie pliku z rozszerzeniem .csv. Aby importować tabele wystarczy kliknąć interesującą nas opcję, a następnie wybrać odpowiedni plik lub wprowadzić kod LaTeX.</h5>";
		helperContent += "<h5>• Zapisz - po najechaniu na tę opcję wyświetlone zostaną możliwości zapisania (pobrania) wygenerowanego kodu dla utworzonej przez użytkownika tabeli. Dostępne opcję to .txt oraz .tex. Aby zapisać tabele wystarczy kliknąć interesującą nas opcję.</h5>";
		helperContent += "<h5>• Utwórz tabelę - istnieją dwie możliwości utworzenia tabeli - kliknięcie interesującej nas wielkości tabeli na podstawie pomocniczej tabelki lub wybranie odpowiadającego rozmiaru tabeli poprzez wpisanie, zwiększenie/zmniejszenie ilości wierszy/kolumn oraz dodanie tabeli przyciskiem +.</h5>";
	}
	else if(domain == "Narzędzia główne"){
		helperContent += "<h5>• Przyciski edycji tekstu - wybranie jednego z sześciu przycisków (pogrubienie, kursywa, podkreślenie, wyrównanie do lewej/środka/prawej) aktywuje daną opcję dla zaznaczonej komórki.</h5>";
		helperContent += "<h5>• Wielkość czcionki - wybranie wielkości czcionki dla komórki odbywa się za pomocą listy rozwijanej.</h5>";
		helperContent += "<h5>• Kolor czcionki - dostępnych jest 18 kolorów podstawowych oraz możliwość stworzenia własnego koloru poprzez wpisanie jego wartości w postaci heksadecymalnej lub kliknięcie znacznika koloru i wybranie interesującej nas opcji.</h5>";
	}
	else if(domain == "Edycja"){
		helperContent += "<h5>• Wstawiania wiersza/kolumny - w zależności od wybrania opcji po lewej/prawej lub na górze/dole wstawiany jest wiersz/kolumna od zaznaczonej komórki.</h5>";		
		helperContent += "<h5>• Usunięcie wiersza/kolumny - usuwa wiersz/kolumnę wybranej komórki.</h5>";
	}
	else if(domain == "Komórka"){
		helperContent += "<h5>• Kolor komórki - dostępnych jest 18 kolorów podstawowych oraz możliwość stworzenia własnego koloru poprzez wpisanie jego wartości w postaci heksadecymalnej lub kliknięcie znacznika koloru i wybranie interesującej nas opcji.</h5>";
		helperContent += "<h5>• Scal komórki - scala zaznaczone komórki zgodnie z zasadami tworzenia tabel LaTeX zachowując opcje wybrane dla komórki, od której rozpoczęto zaznaczanie.</h5>";
		helperContent += "<h5>• Rozdziel komórki - rozdziela wybraną, scaloną wcześniej komórkę resetując jej ustawienia i zawartość.</h5>";
    helperContent += "<h5>• Krawędzie komórki - wyświetla listę dostępnych obramowań, które możemy wybrać dla komórki klikając interesujące nas opcje.</h5>";	
    helperContent += "<h5>• Zakończenie edycji komórki - kliknij klawisz Escape, żeby zakończyć edycje.</h5>";	
	}
	else if(domain == "Tabela"){
		helperContent += "<h5>• Krawędzie tabeli - wyświetla listę dostępnych obramowań, które możemy wybrać dla komórki klikając interesujące nas opcje.</h5>";
    helperContent += "<h5>• Kolor obramowania - dostępnych jest 18 kolorów podstawowych oraz możliwość stworzenia własnego koloru poprzez wpisanie jego wartości w postaci heksadecymalnej lub kliknięcie znacznika koloru i wybranie interesującej nas opcji.</h5>";
    helperContent += "<h5>• Poruszanie się po tabeli - po wybraniu komórki można poruszać się po tabeli z wykorzystaniem klawiszu strzałek.</h5>";
	}
	else{ //Inne
		helperContent += "<h5>• Edycja komórek - wymagane pojedyncze kliknięcie aby dodawać atrybuty oraz podwójne, aby dodawać tekst.</h5>";	
		helperContent += "<h5>• Wyrównanie kolumny - znajdujące się ponad tabelą opcje wyrównania całej kolumny udostępnia możliwość wyrównania do lewej l, środka (poziomo) c, prawej r oraz góry p{Xcm}, środka (pionowo) m{Xcm}, dołu b{Xcm} (X - ilość centymetrów).</h5>";
		helperContent += "<h5>• Wysokość wiersza - znajdujące się po prawej stronie tabeli opcje wysokości wiersza można zmieniać poprzez wpisanie interesującej nas liczby ex'ów.</h5>";
		helperContent += "<h5>• Podpis tabeli - interaktywny podpis tabeli znajdujący się docelowo pod tabelą może zostać przeniesiony ponad tabelę wykorzystując narzędzie Drag & Drop (przeciągnij & upuść).</h5>";
		helperContent += "<h5>• Odnośnik tabeli - nie obsługuje znaków specjalnych LaTeX.</h5>";
		helperContent += "<h5>• Generuj kod LaTeX - kliknięcie generuje kod LaTeX tabeli istniejącej w trakcie kliknięcia.</h5>";
		helperContent += "<h5>• Kopiuj do schowka - kopiuje wygenerowany kod LaTeX do schowka (zalecane kopiowanie za pomocą przycisku).</h5>";	
		}
	
	modalHelp.setContent(helperContent);
	
	modalHelp.open();
}

function MovingInTable(event){
  if(event.key == "ArrowUp" || event.key == "ArrowLeft" || event.key == "ArrowRight" || event.key == "ArrowDown"){
    var actualElement = wybranaKomorka ? wybranaKomorka : ostatniaKomorka;
    if(actualElement){
      var styleEditable = document.getElementById(actualElement).getAttribute("contenteditable");
      if(styleEditable == "false"){
        var position = actualElement.split(":");
        var rowspan = document.getElementById(actualElement).rowSpan - 1;
        var colspan = document.getElementById(actualElement).colSpan - 1;
        switch(event.key){
          case "ArrowUp": ;position[0] = Number(position[0]) - 1; break;
          case "ArrowDown": position[0] = Number(position[0]) + 1 + Number(rowspan); break;
          case "ArrowLeft": position[1] = Number(position[1]) - 1; break;
          case "ArrowRight": position[1] = Number(position[1]) + 1 + Number(colspan); break;
        }
        var newID = position[0]+":"+position[1];
        if(document.getElementById(newID)){
          document.getElementById(newID).click();
          wybranaKomorka = newID;
        }
      }
    }
  }
}