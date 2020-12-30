function Importer(){}

Importer.loadCsvFile = async function(file){
    const data = await file.text();
    const lines = data.split("\r\n"); //.split("\n\r").split("\n").split("\r");
    return lines;
}

Importer.loadTable = function(lines){
    const x = lines.length - 1;
    const y = lines[0].split(',').length;
    CreateTable(x,y);

    for(let i = 0; i < x; i++){
        const row = lines[i].split(',');
        for(let j = 0; j < y; j++){
            document.getElementById(i+":"+j).textContent = row[j];
        }
    }
}

Importer.loadCsv = async function(){
    const lines = await Importer.loadCsvFile(document.getElementById("csvfileinput").files[0]);
    Importer.loadTable(lines);
    openCsvModal.close();
}

var openCsvModal = new tingle.modal({
    footer: true,
    stickyFooter: false,
    closeMethods: ['overlay', 'button', 'escape'],
    closeLabel: "Zamknij"
});

Importer.openCsvModal = function(){
    
    openCsvModal.setContent('<input type="file" id="csvfileinput" onchange="Importer.loadCsv(this)" />');
    openCsvModal.open();
}