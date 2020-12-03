var wybranaKomorka;
var myszNacisnieta = false;
var tabelaZaznaczonych = [];
var pierwszaKomorka;
var ostatniaKomorka;
var ostatniaEdytowana;

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
								element.setAttributeNS("style.border", value2);
							}
							else{
								element.setAttributeNS("style.border", value1);
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
    wybranaKomorka = null;
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
  WyczyscStyl();
  //AddFunction();
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
