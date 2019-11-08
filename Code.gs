//function doGet(request) {
//  return HtmlService.createTemplateFromFile('Page')
//      .evaluate();
//  
//    SpreadsheetApp.getUi() // Or DocumentApp or SlidesApp or FormApp.
//      .showSidebar(html);
//}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
      .getContent();
}


//function onOpen() {
//  SpreadsheetApp.getUi() // Or DocumentApp or SlidesApp or FormApp.
//      .createMenu('Custom Menu')
//      .addItem('Show sidebar', 'showSidebar')
//      .addToUi();
//}
function onOpen(){
  SpreadsheetApp.getUi()
  .createMenu('⚕')
  .addItem('side effects', 'showSidebar')
  .addToUi();
  }
function showSidebar() {
  var html = HtmlService.createTemplateFromFile('Page');

  html.data = sideEffects ( );

  SpreadsheetApp.getUi().showSidebar(html.evaluate().setWidth(300));
}

var ss = SpreadsheetApp.getActiveSpreadsheet();
var sheet = ss.getActiveSheet();
var url = 'https://rxnav.nlm.nih.gov/REST/';



var readRange = function (row, column, numRows, numColumns, values){
  var range = sheet.getRange(row, column, numRows, numColumns);
 
  Logger.log(range);
}
var readDataOneCell = function (row, col) {
  return sheet.getRange(row, col).getValue();  
}

var writeData = function (row,col,value) {
  
  sheet.getRange(row, col).setValue(value);
}



var drugNameLookUp = function (){
 // writeData(3,5,"…");
  var url2 = url 
    + 'rxcui'
    + '?name='
    + encodeURIComponent(query);
  try {
     var response = UrlFetchApp.fetch(url2, {'muteHttpExceptions': true});
  } catch (e){
    Logger.log(e);
  } 
    
   
  var document = XmlService.parse(response);
  var rxnormId = document.getDescendants().pop();
  writeData(3,5,rxnormId);
 
  return !rxnormId ? "Query unsuccessful." : rxnormId;
}

var fetchJsonList = function() {
  var url3 = url 
    + 'interaction/interaction.json'
    + '?rxcui='
    + encodeURIComponent(drugNameLookUp()); // + '&sources=ONCHigh';
  
  var res = UrlFetchApp.fetch(url3, {'muteHttpExceptions': true} );
  var json = res.getContentText();
  return JSON.parse(json);
}

function sideEffects ( ) {
  
  var JSON = fetchJsonList();
  var secondSearch = readDataOneCell(4,3);
  var interactionTypeArray = JSON.interactionTypeGroup[0].interactionType;
  var interactionPairArray = JSON.interactionTypeGroup[0].interactionType[0].interactionPair;
  var searchedFor = JSON.interactionTypeGroup[0].interactionType[0].interactionPair[0].interactionConcept[0].minConceptItem.name;
  var interacted = JSON.interactionTypeGroup[0].interactionType[0].interactionPair[0].interactionConcept[1].minConceptItem.name;
  var list = '<h3>Searching for <em>' + searchedFor + '</em></h3><ul>';
  for (i in interactionPairArray) {
    if( secondSearch.toLowerCase().trim() === "" ) { 
        if (i == 0) {
          list += '<li>' + interactionPairArray[i].description + '</li>';
        
      } else if ( interactionPairArray[i].description.toLowerCase().trim() !== interactionPairArray[i-1].description.toLowerCase().trim()){
        list += '<li>' + interactionPairArray[i].description + '</li>';
      }
    } else if ( secondSearch.toLowerCase().trim() === interacted.toLowerCase().trim() ) { 
      list += '<li>' + interactionPairArray[i].description + '</li>';
   
    // Logger.log("Description: "
              // + interactionPairArray[i].description + "\n" 
              // + interactionPairArray.length);
              // + " MinName: "
              // + interactionPairArray[i].interactionConcept[0].minConceptItem.name
              // + " sourceName: "
              // + interactionPairArray[i].interactionConcept[0].sourceConceptItem.name) ;

    }
  }
  list += '</ul>';
  Logger.log(list);
  //writeData( 5, 5 ,i+1,twoDee );
  return list;
}



var query = readDataOneCell(3,3);


