var wybranaKomorka;
var myszNacisnieta = false;
var tabelaZaznaczonych = [];
var cellsColorTable;
var pierwszaKomorka;
var ostatniaKomorka;
var ostatniaEdytowana;

//Zmienna odpowiedzialna za kolor obramowania tabelii
var borderColor = "#000000";

function CreateTable(x, y){
    //if user add smaller table
    wybranaKomorka = null;
    myszNacisnieta = false;
    tabelaZaznaczonych = [];
    pierwszaKomorka=null;
    ostatniaKomorka=null;
    ostatniaEdytowana=null;

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
            cell.style.background = "white";
            cell.style.border = "1px dashed "+borderColor;

            cell.setAttribute("contenteditable","false");

            row.appendChild(cell)
        }
        elemBody.appendChild(row);
    }
    elemTable.appendChild(elemBody);
    gdzieUmiescic.appendChild(elemTable);
    SaveCellsColors();
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
            BorderViewFunction(this.id);
            CheckFontSettings(this.id);
            CheckTextAlignSettings(this.id)
          }
        };
    }

    //Wykrycie czy lewy przycisk myszy został naciśnięty
    table.addEventListener("mousedown", function(event){
      console.log("Mysz nacisnieta");
      WyczyscStyl();
      SaveCellsColors()
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

function ZmienKolor(id){
  var element = document.getElementById(id);
  if(element != null){
    element.style.background = "#BEF72C";
  }
}

/*function WyczyscStyl(){
  var table = document.getElementById("mainTable");
    for (var i = 0; i < table.rows.length; i++) {
        for (var j = 0; j < table.rows[i].cells.length; j++){
          //table.rows[i].cells[j].style.background = "gray";
        }
    }
}*/

function WyczyscStyl(){
  var table = document.getElementById("mainTable");
    for (var i = 0; i < table.rows.length; i++) {
        for (var j = 0; j < table.rows[i].cells.length; j++){
          table.rows[i].cells[j].style.backgroundColor = cellsColorTable[i][j];
          //console.log(cellsColorTable[i][j]);
        }
    }
}

function ShowPosition(id){

    if(wybranaKomorka != null){
      var element = wybranaKomorka.split(":");
      document.getElementById(wybranaKomorka).style.background = cellsColorTable[element[0]][element[1]];
    }
    var text = id;
    //alert(text.charAt(0) + ":" + text.charAt(2));

    wybranaKomorka = text;
    document.getElementById(text).style.background = "#BEF72C";
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

function WybranaKomorka(){
    alert(wybranaKomorka);
}

function AddBorderCell(){
	let color1 = "3px solid red";
	let color2 = "0px solid black";
	
    if(wybranaKomorka != null){
		if(document.getElementById(wybranaKomorka).style.border == color1){
			document.getElementById(wybranaKomorka).style.border = color2;
		}
		else{
			document.getElementById(wybranaKomorka).style.border = color1;
		}
    }
	else if(tabelaZaznaczonych != null){	//zmiana stylu dla zaznaczonych komórek	
		
		let attribute = "style.border";
			
		//ManyCellsChange(attribute, color1, color2);   -- nie działa - problem z setAttribute ??
		//FUNKACJA DZIAŁA!!! NA POTRZEBY TESTÓW JEST WYŁĄCZONA
		if(pierwszaKomorka != null && ostatniaKomorka != null){
			var text1 = pierwszaKomorka.split(":");
			var text2 = ostatniaKomorka.split(":");
  
			var xMin = Math.min(text1[0], text2[0]);
			var xMax = Math.max(text1[0], text2[0]);
			var yMin = Math.min(text1[1], text2[1]);
			var yMax = Math.max(text1[1], text2[1]);  
  
			var text1 = document.getElementById(pierwszaKomorka).innerHTML;
  
			for(var x = xMin; x <= xMax; x++){
				for(var y = yMin; y <= yMax; y++){
					try{ //potrzebny ze względu na scalone komórki
						if(document.getElementById(x+":"+y).style.border == color1){
							document.getElementById(x+":"+y).style.border = color2;
						}
						else{
							document.getElementById(x+":"+y).style.border = color1;
						}
					}catch(error){}
				}
			}
		}
		
		/*
		WyczyscStyl();
		wybranaKomorka = null;
		tabelaZaznaczonych = [];
		pierwszaKomorka = null;
		ostatniaKomorka = null;*/
		
	}
	
}

function ManyCellsChange(attributeName, value1, value2){	
	
	
	if(pierwszaKomorka != null && ostatniaKomorka != null){
			var text1 = pierwszaKomorka.split(":");
			var text2 = ostatniaKomorka.split(":");
  
			var xMin = Math.min(text1[0], text2[0]);
			var xMax = Math.max(text1[0], text2[0]);
			var yMin = Math.min(text1[1], text2[1]);
			var yMax = Math.max(text1[1], text2[1]);  
  
  
			for(var x = xMin; x <= xMax; x++){
					for(var y = yMin; y <= yMax; y++){
						try{ //potrzebny ze względu na scalone komórki
							element = document.getElementById(x+":"+y);
							let attribute = element.getAttribute(attributeName);
							console.log(attribute + " aaaa");
							console.log(element.getAttribute("style.border") + " bbbb");
							
							if(attribute == value1){
								element.setAttribute("style.border", value2);
							}
							else{
								element.setAttribute("style.border", value1);
							}
							//console.log(document.getElementById(x+":"+y).style.border + " bbbb");
						}catch(error){}
					}
				}
			
			//style.border
			/*if(attributeName == "style.border"){
				for(var x = xMin; x <= xMax; x++){
					for(var y = yMin; y <= yMax; y++){
						try{ //potrzebny ze względu na scalone komórki
							let attribute = document.getElementById(x+":"+y).getAttribute(attributeName);
							if(document.getElementById(x+":"+y).style.border == value1){
								document.getElementById(x+":"+y).style.border = value2;
							}
							else{
								document.getElementById(x+":"+y).style.border = value1;
							}
						}catch(error){}
					}
				}
			}
			else{
				for(var x = xMin; x <= xMax; x++){
					for(var y = yMin; y <= yMax; y++){
						try{ //potrzebny ze względu na scalone komórki
							let attribute = document.getElementById(x+":"+y).getAttribute(attributeName);
							console.log(attribute + " aaaa");
							console.log(document.getElementById(x+":"+y).style.border + " bbbb");
						
							if(attribute == value1){
								document.getElementById(x+":"+y).setAttribute(attributeName,value2);
							}
							else{
								document.getElementById(x+":"+y).setAttribute(attributeName,value1);
							}
							//console.log(document.getElementById(x+":"+y).style.border + " bbbb");
						}catch(error){}
					}
				}
			}*/
			
			
	
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
  if(pierwszaKomorka != null && ostatniaKomorka != null){
    console.log(pierwszaKomorka);
    console.log(ostatniaKomorka);

    RozdzielKomorki()


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
  
    for(var x = xMin; x <= xMax; x++){
      for(var y = yMin; y <= yMax; y++){
        if(x+":"+y != xMin+":"+yMin){
          document.getElementById(x+":"+y).remove();
        }
      }
    }
    document.getElementById(xMin+":"+yMin).rowSpan = xMax - xMin + 1;
    document.getElementById(xMin+":"+yMin).colSpan = yMax - yMin + 1;
    document.getElementById(xMin+":"+yMin).innerHTML = tekst;
    
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
  //cell.style.background = "gray";
  cell.setAttribute("contenteditable","false");
  cell.style.border = "1px dashed black";
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
  let collision = checkMergeCollide(coords[0], coords[1], side, table);
  if(collision.length > 0){
    if(!confirm("Wstawienie kolumny spowoduje rozdzielenie niektórych komórek! Kontunuować?")) return;
    else {
      for(let c = 0; c < collision.length; c++){
        SplitCell(collision[c][0]+":"+collision[c][1]);
      }
    }
  }

  let colID = parseInt(coords[1]);
  if(side == 'r') colID+=document.getElementById(wybranaKomorka).colSpan;

  if(colID == getTableWidth(table)){
    for(let i = 0; i < table.rows.length; i++){
      let cell = table.rows[i].insertCell(table.rows[i].cells.length);
      AddPropertiesToCell(cell, i, table.rows[i].cells.length-1);
    }
  } else {
    //change ids
    console.log("col:" + colID);
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
  
  wybranaKomorka = null;
  WyczyscStyl();
  //AddFunction();
}

function InsertRow(side){
  if(wybranaKomorka == null) return;
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
        //console.log("Trza rozdzielić: " + collision[c][0]+":"+collision[c][1]);
        SplitCell(collision[c][0]+":"+collision[c][1]);
      }
    }
  }
  //change ids
  for (let i = rowID; i < table.rows.length; i++) {
      for (let j = 0; j < table.rows[i].cells.length; j++){
        let cCell = table.rows[i].cells[j].id.split(":");
        table.rows[i].cells[j].id = (parseInt(cCell[0])+1)+":"+parseInt(cCell[1]);
      }
  }
  const x = getTableWidth(table);
  table.insertRow(rowID);
  //add cells
  for(let i = 0; i < x; i++){
    let cell = table.rows[rowID].insertCell(i);
    AddPropertiesToCell(cell, rowID, i);
  }
  wybranaKomorka = null;
  SaveCellsColors();
  WyczyscStyl();
  //AddFunction();
}

function deleteColumn(){
  if(wybranaKomorka == null) return;
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
  wybranaKomorka = null;
  WyczyscStyl();
}

function deleteRow(){
  if(wybranaKomorka == null) return;
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
        //console.log("Trza rozdzielić: " + collision[c][0]+":"+collision[c][1]);
        SplitCell(collision[c][0]+":"+collision[c][1]);
      }
    }
  }
  table.deleteRow(rowID);
  //change ids
  for(let i = rowID; i < table.rows.length; i++){
    for(let j = 0; j < table.rows[i].cells.length; j++){
      let cCell = table.rows[i].cells[j].id.split(":");
      table.rows[i].cells[j].id = (parseInt(cCell[0])-1)+":"+parseInt(cCell[1]);
    }
  }
  wybranaKomorka = null;
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
        console.log("sprawdzam");
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
  console.log(errorCells);
  return errorCells;
}

function getTableWidth(table){
  let ids = [];
  for(let i = 0; i < table.rows.length; i++){
    ids.push(parseInt(table.rows[i].cells[table.rows[i].cells.length - 1].id.split(":")[1]));
  }
  return Math.max(...ids)+1;
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
  //Tabela z kolorami, żeby jak chcemy w przyszłości mieć ich więcej wystarczy tu je dodać (petla dziala do rozmiaru tej tabeli)
  var colorTable = ["#FF0000", "#0000FF", "#FFFF00", "#808080", "#008000"]
  for(var i=0; i < colorTable.length; i++){
    var element = document.createElement("a");
    element.value = colorTable[i];
    element.style.backgroundColor = colorTable[i];
    element.classList.add("colorCellStyle");

    element.onclick = function(){
      var colorValue = this.value;
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

    mainContainer.appendChild(element);
  }

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
    }
    secondContainer.appendChild(element);
  }

}

//Otwarcie jest burdel
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
  BorderViewFunction(wybranaKomorka)
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
  var cells = mainTable.querySelectorAll("td");

  ClearTableBorder();

  if(borderValues[0] == 1){
    for(var i = 0; i < cells.length ; i++){
      cells[i].style.borderTop = "1px solid "+borderColor;
      cells[i].style.borderBottom = "1px solid "+borderColor;
    }
    horizontal = true;
    document.getElementById("horizontalEdges").classList.add("borderChecked");
  }
  else{
    horizontal = false;
    document.getElementById("horizontalEdges").classList.remove("borderChecked");
  }

  if(borderValues[1] == 1){
    for(var i = 0; i < cells.length ; i++){
      cells[i].style.borderLeft = "1px solid "+borderColor;
      cells[i].style.borderRight = "1px solid "+borderColor;
    }
    vertical = true;
    document.getElementById("verticalEdges").classList.add("borderChecked");
  }
  else{
    vertical = false;
    document.getElementById("verticalEdges").classList.remove("borderChecked");
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
}

//Ustawienie aktualnie wpisywanej czcionki na BOLD
//Potem można się pobawić że jak jest zaznaczony tekst i zostanie naciśnięty ten guzik do zmienia czcionke tego tekstu
function FontBold(element){
  var choosenCell = document.getElementById(wybranaKomorka);
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

function ItalicFont(element){
  var choosenCell = document.getElementById(wybranaKomorka);
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

function UnderLineFont(element){
  var choosenCell = document.getElementById(wybranaKomorka);
  var cellStyle = window.getComputedStyle(choosenCell);
  //wybranaKomorka
  var actualFontUnderline = cellStyle.getPropertyValue("text-decoration");
  //Rodzic
  var aElement = element.parentElement;

  if(actualFontUnderline == "rgb(0, 0, 0)"){
    aElement.classList.add("settingChoosen");
    choosenCell.style.textDecoration = "underline";

  }
  else{

    aElement.classList.remove("settingChoosen");
    choosenCell.style.textDecoration = "none";

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

  if(actualFontUnderline == "underline rgb(0, 0, 0)"){
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
  var position = alignSettings.indexOf("1",0);
  var element = document.getElementById(wybranaKomorka);

  var leftButton = document.getElementsByClassName("fas fa-align-left")[0].parentElement;
  var centerButton = document.getElementsByClassName("fa fa-align-center")[0].parentElement;
  var rightButton = document.getElementsByClassName("fa fa-align-right")[0].parentElement;
  var justifyButton = document.getElementsByClassName("fas fa-align-justify")[0].parentElement;

  var buttonArray = Array.of(leftButton, centerButton, rightButton, justifyButton)

  for(var i = 0 ; i < buttonArray.length ; i++){
    buttonArray[i].classList.remove("settingChoosen");
  }

  switch(position){
    case 0 : 
      element.style.textAlign = "left";
      leftButton.classList.add("settingChoosen");
      break;

    case 1 : 
      element.style.textAlign = "center";
      centerButton.classList.add("settingChoosen");
      break;

    case 2 : 
      element.style.textAlign = "right";
      rightButton.classList.add("settingChoosen");
      break;

    case 3 : 
      element.style.textAlign = "justify";
      justifyButton.classList.add("settingChoosen");
      break;
  }
}


function CheckTextAlignSettings(id){
  var element = document.getElementById(id);
  var elementStyles = window.getComputedStyle(element);

  var actualTextAlign = elementStyles.getPropertyValue("text-align");

  var leftButton = document.getElementsByClassName("fas fa-align-left")[0].parentElement;
  var centerButton = document.getElementsByClassName("fa fa-align-center")[0].parentElement;
  var rightButton = document.getElementsByClassName("fa fa-align-right")[0].parentElement;
  var justifyButton = document.getElementsByClassName("fas fa-align-justify")[0].parentElement;

  var buttonArray = Array.of(leftButton, centerButton, rightButton, justifyButton)

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

    case "justify":
      justifyButton.classList.add("settingChoosen");
      break;
  }
}