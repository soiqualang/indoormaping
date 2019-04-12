function translate(token) {
  var result ;
  if (navigator.browserLanguage){
    var language = navigator.browserLanguage;
  }else{
    var language = navigator.language; 
  }
  if((typeof translation[token] === 'undefined') || (language.indexOf('en') > -1)){
    console.log("No translation found in " + language + " for : "+token);
    return token;
  }
  $.each(translation[token], function(k,v){
    if(language.indexOf(k) > -1){
      result = v ;
    }
  });
  return result;
}
var translation = {
  /* 
   * Website 
   * -------------------------------------------------------------------------
   */
  'This stairway goes nowhere':{
    'fr': 'Cet escalier ne va nul part',
    'it': 'Questa scala va da nessuna parte',
    'pl': 'To idzie donikąd schody'
  },
  'Locate' :{
    'fr': 'Localiser',
  },
  'Go Up' :{
    'fr': 'Monter',
    'it': 'Salire',
    'pl': 'Wzrost'
  },
  'Go Down':{
    'fr': 'Descendre',
    'it': 'Scendere',
    'pl': 'Spadać'
  },
  'Show list of rooms': {
     'fr': 'Montrer la liste des salles'
  },
  'Click to get more informations...': {
    'fr': 'Cliquez pour plus  d\'informations...'
  },
  'Capacity': {
    'fr': 'Capacité'
  },
  'Informations' :{
    'fr': 'Informations',
    'it': 'Informazioni',
    'pl': 'Informacje'
  },
  'Description' :{
    'fr' : 'Description',
    'it' : 'Descrizione',
    'pl' : 'Opis'
  },
  'Model implementation' :{
    'fr' : 'Implementation Modele',
    'it' : 'Implementazione del modello',
    'pl' : 'Implementacja modelu'
  },
  'Contact' :{
    'de' : 'Kontakt',
    'fr' : 'Contact',
    'it' : 'Contatti',
    'pl' : 'Kontakt'
  },
  'All' :{
    'de' : 'Alle',
    'fr' : 'Tout',
    'it' : 'Tutti',
    'pl' : 'Wszystko'
  },

  'More' :{
    'de' : 'Mehr',
    'fr' : 'Plus',
    'it' : 'Altro',
    'pl' : 'Więcej'
  },

  'Map' :{
    'de' : 'Karte',
    'fr' : 'Carte',
    'it' : 'Mappa',
    'pl' : 'Mapa'
  },
  'Click to load buildings' :{
    'fr' : 'Cliquer pour charger les batiments',
    'pl' : 'Kliknij aby załadować budynki'
  },
  '<strong>Zoom in</strong> to load buildings' :{
    'fr' : '<strong>Zoomer</strong> pour charger les bâtiments',
    'it' : '<strong>Ingrandisci lo zoom</strong> per caricare gli edifici',
    'pl' : '<strong>Przybliż mapę</strong> aby pobrać elementy'
  },

  /* 
   * Navigation 
   * -------------------------------------------------------------------------
   */

  'Navigation' :{
    'fr' : 'Navigation',
    'it' : 'Navigazione',
    'pl' : 'Nawigacja'
  },

  // Shops
  'WC' :{
    'de': 'WC',
    'fr': 'WC',
    'it': 'WC',
    'pl': 'Ubikacja'
  },
  'Elevator' : {
    'fr': 'Ascenseur',
    'it': 'Sollevamento',
    'pl': 'wyciąg'
  },
  'Stairs' : {
    'fr': 'Escaliers',
    'it': "Scala",
    'pl': 'Schody',
  },

  // empty
  'Empty floor' : {
    'fr' : 'Etage vide',
    'it' : 'Piano vuoto',
    'pl' : 'Puste piętro'
  },
  'None on this floor' : {
    'fr' : 'Rien sur cette etage' ,
    'it' : 'Niente su questo piano',
    'pl' : 'Brak na piętrze'
  }, 

  /* 
   * Modal 
   * -------------------------------------------------------------------------
   */

  'Type' : {
    'fr' : 'Type',
    'it' : 'Tipo',
    'pl' : 'Typ'
  },

  'Edit in JOSM' : {
    'fr' : 'Editer avec JOSM',
    'it' : 'Modifica in JOSM',
    'pl' : 'Edytuj w JOSM'
  },

  'Close': {
    'fr' : 'Fermer',
    'it' : 'Chiudi',
    'pl' : 'Zamknij',
  },

  /*
   * Contacts section
   */

  'email' : {
    'fr' : 'mél',
    'it' : 'email',
    'pl' : 'email',
  },

  'fax' : {
    'fr' : 'fax',
    'it' : 'fax',
    'pl' : 'fax',
  },

  'phone' : {
    'fr' : 'tél',
    'it' : 'tel',
    'pl' : 'tel',
  },

  'website' : {
    'fr' : 'site',
    'it' : 'sito',
    'pl' : 'www',
  },

  /*
   * Opening hours section
   *
   */
  'Opening hours' : {
    'fr' : 'Horaires d\'ouverture',
    'it' : 'Orari di apertura',
    'pl' : 'Godziny otwarcia',
  },

  'closed' : {
    'fr' : 'fermé',
    'it' : 'chiuso',
    'pl' : 'zamknięte',
  },

  // date format as used by jquery-dateFormat plugin: http://archive.plugins.jquery.com/project/jquery-dateFormat
  'dd/MM/yyyy' : {
    'fr' : 'dd-MM-yyyy',
    'it' : 'dd/MM/yyyy',
    'pl' : 'dd.MM.yyyy',
  },

  // time format as used by jquery-dateFormat plugin: http://archive.plugins.jquery.com/project/jquery-dateFormat
  'hh:mm a' : {
    'fr' : 'HH:mm',
    'it' : 'HH:mm',
    'pl' : 'HH:mm',
  },

  /* 
   * Popup 
   * -------------------------------------------------------------------------
   */
  'Open in OSM' : {
    'fr' : 'Ouvrir dans OSM',
    'it' : 'Apri in OSM',
    'pl' : 'Zobacz w OSM'
  },
  'Enter' : {
    'de' : 'Betreten',
    'fr' : 'Entrer',
    'it' : 'Entra',
    'pl' : 'Wejdź'
  },

  /* 
   * Misc
   * -------------------------------------------------------------------------
   */
  'no name': {
    'fr' : 'pas de nom',
    'it' : 'senza nome',
    'pl' : 'brak nazwy'
  }
};
