/**
 * BUILDINGS
 * -----------------------------------------------------------------------------
 */
var building = {};
building.outline = function(coords) {
  //this.id = id;
  this.coords = coords;
  this.relationId;
  this.name;
  this.polygon;

  /** Draw outline with popup "Enter..." **/
  this.draw = function() {
    this.polygon = new L.Polygon(this.coords)
    .addTo(api.layer.outlines)
    .on('click', function() {
      api.loadBuilding(this.relationId, this);
    }, this);

    new L.marker(this.center())
    .addTo(api.layer.pins)
    .on('click', function() {
      map.setView(this.getLatLng(), 17);
    });
  }

  this.drawInside = function(){
    new L.Polygon(this.coords,{color:'#B7C0BF',opacity:'1',fillOpacity:'1'}).addTo(api.layer.building).bringToBack();
  }


  /** Center of outline **/
  this.center = function() {
    return this.polygon.getBounds().getCenter();
  }
}

building.building = function(id, name, levels, outline) {
  this.id = id;
  this.name = name;
  this.outline = outline;
  this.levels = levels.sort(function(a, b){ return a.level.localeCompare( b.level) } );
  this.shell;

  this.levelIds = new Array();
  this.levels.forEach(function(l){
    this.levelIds[l.id] = l.level;
  }, this );

  this.currentType = 'All';

  this.currentLevel = this.levels[0].level;
  this.getLevelPerId = function(idRoom){
    var arr = [] ;
    api.building.levels.forEach(function(l){
      l.rooms.forEach(function(r){
        if(idRoom == r.id)
          arr.push(l.level);
      })
    })
    return arr.sort();
  }
  /** Return level n **/
  this.getLevel = function(n) {
    return this.levels.filter(function(l){ return ((l.level == n) || (l.id == n)) ; }).pop();
  }

  this.draw = function() {
    api.id['building'] = this.id;
    this.drawLevelSwitcher();
    if (this.drawLevel()) {
      $('#indoor-navigation').show();
      $('.tools').show();
    }
  };

  /** Draw level n and write list of rooms **/
  this.drawLevel = function(n) {
    if (typeof n === 'undefined') { n = this.currentLevel; }
    var level = this.getLevel(n);
    if (level != undefined) {
      api.layer.building.clearLayers();
      api.layer.decoration.clearLayers();
      if(typeof api.all_outlines[this.id] !== "undefined" && api.all_outlines[this.id] != null ){
        var outlines =[];
        api.all_outlines[this.id].forEach(function(o){
          outlines = outlines.concat(o.coords);
          o.drawInside() ;
        });
        var bounds = L.polyline(outlines).getBounds();
        if((map.getZoom() < 18) || !bounds.intersects(map.getBounds()))
          map.fitBounds(bounds);
      }
      level.draw();
      api.building.closePopup();
      $('#indoor-rooms').html(level.list());
      api.building.currentLevel = n;
      api.building.updateLevelSwitcher();

      api.layer.reloadBuilding();
      api.id['level'] = level.id;
      return true;
    }
    alert("Something went wrong (no level " + n + ")!");
    //api.loadShell();
    return false;
  };

  /**
   * Draw level switcher
   */
  this.drawLevelSwitcher = function() {
    //add text
    $('#indoor-navigation h3').text(this.name);
    $('#indoor-escape button').attr('title', translate('Close'));
    $('#indoor-list-btn button').attr('title', translate('Show list of rooms'));

    var txt = '<div class="btn-group" data-toggle="buttons">';
    api.building.levels.forEach(function(level) {
      l = level.level ;
      txt += '<label class="btn" id="indoor-levels-' + l + '" onclick="api.building.drawLevel(' + l + ');"><input type="radio">' + l + '</label>';
    });
    txt += '</div>';
    $("#indoor-levels").html(txt);
  };


  this.updateLevelSwitcher = function(){
    api.building.levels.forEach(function(l) {
      $('#indoor-levels-'+l.level).removeClass('active');  
    });	
    $('#indoor-levels-'+api.building.currentLevel).addClass('active');  	
  }

  /** Show popup for selected room in the list. Here because of shorter addr. **/
  this.getRoom = function(idRoom, idLevel) {
    var ok = false; 
    var levels;
    if(idLevel == null || idLevel == 'null')
      levels = api.building.levels;
    else
      levels = [api.building.getLevel(idLevel)];

    var room;
    levels.forEach(function(level) {
      var cpt = 0;
      while(!ok && cpt < level.rooms.length){
        if(level.rooms[cpt].id == idRoom){
          ok = true;
          room = level.rooms[cpt];
        }
        cpt++;	
      }
    });
    return room;
  };

  this.closePopup = function() {
    if (api.id['room'] != null){
      if (!map.hasLayer(api.layer.decoration))
        api.layer.building.removeLayer(this.getRoom(api.id['room'], null).lab.hideLabel());
      else
        this.getRoom(api.id['room'], null).lab.unflash();
    }
    api.room = null;
    api.id['room'] = null;
  };
  this.popup = function(level_, room_) {
    this.closePopup(); 

    var room = this.getRoom(room_, level_);
    map.setView(room.center());
    if (!map.hasLayer(api.layer.decoration))
      room.lab.addTo(api.layer.building);   
    room.lab.showLabel();
    room.lab.flash();
    api.id['room'] = room.id;
    if (room.ref != null)
      api.room = room.ref;
  };
};

building.level = function(id, level, rooms) {
  this.id = id;
  this.level = level;

  this.rooms = rooms;
  this.pois = new Array();

  this.shell; //@TODO
  this.coords;
  this.name = "?";

  /** Write list of all room on level **/
  this.list = function() {
    var tmp = new Array();
    for(var k in this.rooms){
      if(this.rooms[k].ref != null || this.rooms[k].name != null)
        tmp.push(this.rooms[k]);
    }

    tmp.sort(function(a, b) {
      var nameA, nameB;
      var refA, refB;
      if (a.name == null && b.name == null && a.ref != null && b.ref != null){
        refA = a.ref.toLowerCase();
        refB = b.ref.toLowerCase();

        if (refA < refB){
          return -1;
        }
        if (refA > refB){
          return 1;}
      }else{
        if (a.name == null)
          nameA = "~";
        else
          nameA = a.name.toLowerCase();
        if (b.name == null)
          nameB = "~";
        else
          nameB = b.name.toLowerCase();
        if (nameA < nameB)
          return -1;
        if (nameA > nameB)
          return 1;
      }

      return 0;
    });

    var txt = '';
    for (var i in tmp)
      if (tmp[i] != null && tmp[i].label() != null)
        if (api.building.currentType == 'All' || tmp[i].category == api.building.currentType)
          txt += '<div class="indoor-list-room" onclick="api.building.popup(\'' + this.id + '\',\'' + tmp[i].id + '\')">' + tmp[i].label() + '</div>';

    if (txt == '') {
      if (api.building.currentType == 'All')
        txt += '<em>' + translate('Empty floor') + '</em>';
      else
        txt += '<em>' + translate('None on this floor') + '</em>';
    }
    return txt;
  };

  /** Draw level **/
  this.draw = function() {
    //      api.layer.building.clearLayers();
    for (var i in this.rooms)
      if (this.rooms[i] !== null)
        this.rooms[i].draw();
    for (var i in this.pois)
      if (this.pois[i] !== null)
        this.pois[i].draw();
  };
};

building.room = function(id, coords) {
  this.id = id;
  this.coords = coords;
  this.name;
  this.ref;
  this.type;      // corridor,room...
  this.category;  // fashion,home,health...
  this.shop;      // value of amenity=* or shop=*
  this.access;
  this.capacity;
  this.contact = {};
  this.opening_hours;
  this.verticalpassage;
  this.polygon;
  this.range ;
  this.lab;

  /** Draw room **/
  this.draw = function() {
    var helper = this;
    var coor = this.coords
    if (this.inners != undefined)
      coor = [this.coords].concat(this.inners);

    this.polygon = new L.Polygon(coor, {
      smoothFactor: 0.2,
      clickable: this.clickable(),
      weight: this.weight(),
      color: this.color(),
      fillOpacity: 0.4
    })
//    .bindLabel(this.label())
    .addTo(api.layer.building)
    .on('click', function() {
      api.building.popup(null,this.id);
    }, this);
    if (this.label() != null) {
      this.lab = L.marker(this.center(), {icon: L.divIcon({className: 'null', iconSize: null})})
      .bindLabel('<span style="color:black" title="'+translate('Click to get more informations...')+'">'+this.label(false)+'</span>', {noHide: true, clickable: true})
      .addTo(api.layer.decoration)
      .showLabel() ;

      this.lab.label.on('click', function() {
        api.building.getRoom(this.id, null).modal();
      }, this);
      this.lab.unflash = function(){
        var label = this.getLabel();
        label.setContent(label._content.replace(/red/, "black"));
      };
      this.lab.flash = function(){
        var label = this.getLabel();
        label.setContent(label._content.replace(/black/, "red"));
      };
    } ;
    if(this.shop == "toilets"){
      L.marker(this.center(), {clickable:false, icon: L.icon({iconUrl: 'img/toilets.png', iconSize:[20,20]})}).addTo(api.layer.decoration);
    };
    if(this.type == "verticalpassage"){
      var room = this ;
      var icon = 'img/stairs.png';
      if(this.verticalpassage == "elevator") 
        icon = 'img/elevator.png';
      if(this.access == "emergency")
        icon = 'img/sortie_secours.png';
      L.marker(this.center(), {clickable:true, icon: L.icon({iconUrl: icon, iconSize:[30,30]})}).addTo(api.layer.decoration).on('click', function() {
        var content = "";
        var addNumToString = function(n){
          return (parseInt(api.building.currentLevel) + n).toString()
        }
        var makeButton = function(dir) {
          var txt;
          if(dir > 0)
            txt = "Up";
          else
            txt = "Down";
          var l = addNumToString(dir);
          return '<button onclick="api.building.drawLevel('+ l +');map.closePopup()">'+translate('Go ' + txt)+'</button>';
        }
        var str = room.range;
        if(str != null){
          var patt = new RegExp(/^(-?[0-9]+)\s*(to|-|;)\s*(-?[0-9]+)$/) ;
          var res = str.match(patt) ;
          if(parseInt(res[1]) <= (parseInt(api.building.currentLevel)-1))
            content += makeButton(-1);
          if(parseInt(res[3]) >= (parseInt(api.building.currentLevel)+1))
            content += makeButton(1);
        }else{
          if(api.building.getLevelPerId(room.id).indexOf(addNumToString(-1)) != -1)
            content += makeButton(-1);
          if(api.building.getLevelPerId(room.id).indexOf(addNumToString(1)) != -1)
            content += makeButton(1);
        }	
        if(content =="")
          content= translate('This stairway goes nowhere') ;
        L.popup().setLatLng(room.center(room)).setContent(content).openOn(map);
      });
    };
    if(this.shop == "bicycle_parking"){
      L.marker(this.center(), {clickable:false, icon: L.icon({iconUrl: 'img/parking_velos.png', iconSize:[30,30]})}).addTo(api.layer.decoration);
    };
    // if (this.type == "corridor")
    //   this.polygon;//.bringToBack();

    for (var i in this.coords) {
      if (this.coords[i].entrance == 'main') {
        new L.circleMarker(this.coords[i], {
          radius: 3,
          weight: 2,
          clickable: false,
          color: 'blue',
          fillOpacity: 1
        })
        .addTo(api.layer.building);
      }
      if (this.coords[i].entrance != null) {
        new L.circleMarker(this.coords[i], {
          radius: (this.coords[i].entrance == 'main') ? 4 : 2,
          weight: 2,
          clickable: false,
          color: 'green',
          fillOpacity: 1
        })
        .addTo(api.layer.decoration);
      }
      if (this.coords[i].door != null) {
        new L.circleMarker(this.coords[i], {
          radius: 2,
          weight: 2,
          clickable: false,
          color: '#666',
          fillOpacity: 0.8
        })
        .addTo(api.layer.decoration);
      }
    }
  }

  //formatted label
  this.label = function(color) {
    var txt = "";
    if ( typeof color === 'undefined') { txt = '<span style="color:' + this.color() + '">■</span> ' } ;
    if (this.name != undefined && this.ref != undefined)
      return txt + this.name + ' (' + this.ref + ')';
    if (this.name == undefined && this.ref != undefined)
      return txt + this.ref;
    if (this.name != undefined)
      return txt + this.name;
    return null;
  }

  this.modal = function() {
    if( this.name != null)
      $('#indoor-window-header').html(this.name);
    else
      $('#indoor-window-header').html(this.ref);

    // Text to be displayed in modal window
    var window_text = "<h4>"+translate("Informations")+" :</h4>\n<ul>\n";
    if(this.capacity != null)
      window_text += "<li>"+translate("Capacity")+" : "+ this.capacity +"</li>\n" ;
    if(this.access != null)
      window_text += "<li>"+translate("Access")+" : "+ this.access +"</li>\n" ;

    window_text += "</ul>\n";
    $('#indoor-window-text').html(window_text);
    $('#indoor-window').modal();
  }

  /** Color for room **/
  this.color = function() {
    switch (this.type) {
      case 'corridor':
        case 'hall':
        {
        if (this.access == "private")
          return '#bb9696';
        return '#FCFAE1';
      }
      case 'verticalpassage':
        return '#5C0515';
      case 'room':
        {
        if (this.access == "private")
          return '#997a7a';
        else
          return '#B9121B';
      }
    }
    return '#aaa';
  }

  /** Click or not **/
  this.clickable = function() {
    if ((this.type == 'corridor') || (this.type == 'hall') || (this.name == null && this.ref == null))
      return false;
    return true;
  }

  /** Color for room **/
  this.weight = function() {
    switch (this.type) {
      case 'hall':
        case 'corridor':
        return 1;
      case 'verticalpassage':
        case 'elevator':
        return 0;
    }
    return 2;
  }

  /** Center of room outline **/
  this.center = function() {
    return this.polygon.getBounds().getCenter()
    /*
    var sumLat = 0, sumLon = 0;
    for (var i in this.coords) {
      sumLat += this.coords[i].lat;
      sumLon += this.coords[i].lng;
    }
    return new L.LatLng(sumLat / this.coords.length, sumLon / this.coords.length);
   */
  }
}

building.poi = function(id, coords, type, name) {
  this.id = id;
  this.coords = coords;
  this.type = type;
  this.name = name;
  this.marker = new L.marker([this.coords.lat, this.coords.lng]);
  this.circle = new L.circle([this.coords.lat, this.coords.lng], 0.5, {
    weight: 2,
    color: '#666',
    fillOpacity: 0.4
  });
  this.current;

  this.icon = function() {
    switch (this.type) {
      case 'atm' :
        return 'img/pois/atm.png';
      case 'office' :
        return 'img/pois/info.png';
      case 'telephone' :
        return 'img/pois/tel.png';
      case 'vending_machine' :
        return 'img/pois/vmachine.png';
      default :
        return null;
    }
  }

  this.draw = function() {
    var helper = this;
    //circle - no name
    if (this.icon() == null || map.getZoom() < 20) {
      if (this.current != 2) {
        this.current = 2;
        api.layer.building.removeLayer(this.marker);
        this.circle.addTo(api.layer.building);
        this.circle.on('click', function() {
          helper.modal()
        });
      }
    } else {
      if (this.current != 1) {
        this.current = 1;
        api.layer.building.removeLayer(this.circle);
        this.marker.setIcon(L.icon({
          iconUrl: this.icon(),
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        }));
        this.marker.bindLabel(this.name);
        this.marker.addTo(api.layer.building);
        this.marker.on('click', function() {
          helper.modal()
        });
      }
    }
  }

  this.modal = function() {
    $('#indoor-window-header').html(this.name == undefined ? "<em>no name</em>" : this.name);
    $('#indoor-window-text').html("<h4>Type</h4>" + this.type);
    $("#indoor-window-link").attr("href", "http://www.openstreetmap.org/browse/node/" + this.id);

    var href = "http://localhost:8111/load_and_zoom";
    href += "?left=" + String(parseFloat(this.coords.lng) - 0.001);
    href += "&right=" + String(parseFloat(this.coords.lng) + 0.001);
    href += "&top=" + String(parseFloat(this.coords.lat) + 0.001);
    href += "&bottom=" + String(parseFloat(this.coords.lat) - 0.001);
    href += "&select=node" + this.id;

    $("#indoor-window-josm").click(function() {
      if (document.exitFullscreen)
        document.exitFullscreen();
      else if (document.mozCancelFullScreen)
        document.mozCancelFullScreen();
      else if (document.webkitCancelFullScreen)
        document.webkitCancelFullScreen();
      $('#josm-iframe').attr("src", href);
    });
    $('#indoor-window').modal();
  }
}

