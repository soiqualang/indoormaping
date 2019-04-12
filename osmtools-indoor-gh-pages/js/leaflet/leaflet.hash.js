(function(window) {
	var HAS_HASHCHANGE = (function() {
		var doc_mode = window.documentMode;
		return ('onhashchange' in window) &&
			(doc_mode === undefined || doc_mode > 7);
	})();

	L.Hash = function(map) {
		this.onHashChange = L.Util.bind(this.onHashChange, this);
		if (map) {
			this.init(map);
		}
	};

	L.Hash.prototype = {
		map: null,
		lastHash: null,
		parseHash: function(hash) {
			if(hash.indexOf('#') == 0) {
				hash = hash.substr(1);
			}
			var args = hash.split("&");
			for(var i in args) {
				if(args[i].search("lat=") != -1) var lat = parseFloat(args[i].substring(4,args[i].length));
        else if(args[i].search("lon=") != -1) var lon = parseFloat(args[i].substring(4,args[i].length));
				else if(args[i].search("z=") != -1) var zoom = parseInt(args[i].substring(2,args[i].length));
				else if(args[i].search("id_room=") != -1) var id_room = parseInt(args[i].substring(8,args[i].length));
				else if(args[i].search("id_level=") != -1) var id_level = parseInt(args[i].substring(9,args[i].length));
				else if(args[i].search("id_building=") != -1) var id_building = parseInt(args[i].substring(12,args[i].length));
				else if(args[i].search("room=") != -1) var room = args[i].substring(5,args[i].length);
			}
			if ( !( isNaN(lat) || isNaN(lon) ) ) {
				var center = new L.LatLng(lat, lon);
			}
			return {
				center: center,
				zoom: zoom,
				room: room,
				id_building: id_building,
				id_level: id_level,
				id_room: id_room
			};
		},
		formatHash: function(map) {
			var center = map.getCenter(),
			zoom = map.getZoom(),
			precision = Math.max(0, Math.ceil(Math.log(zoom) / Math.LN2));
			var txt = "";
			if (api.room != null) 
				txt = txt + "&room="+ api.room ; 
			if (api.id['building'] != null) 
				txt = txt + "&id_building="+ api.id['building'] ; 
			if (api.id['level'] != null) 
				txt = txt + "&id_level="+ api.id['level'] ; 
			if (api.id['room'] != null) 
				txt = txt + "&id_room="+ api.id['room'] ; 
			return "#lat=" + center.lat.toFixed(precision) + "&lon=" + center.lng.toFixed(precision) + "&z=" + zoom + txt ;
		},
		formatHashOsm: function(map) {
			var obj = "",
			center = map.getCenter(),
			zoom = map.getZoom(),
			precision = Math.max(0, Math.ceil(Math.log(zoom) / Math.LN2));

			if (api.id['room'] != null)
				obj = "way/" + api.id['room'] ;
			else if (api.id['level'] != null)
				obj = "relation/" + api.id['level'] ;
			else if (api.id['building'] != null)
				obj = "relation/" + api.id['building'] ;

			return "http://www.openstreetmap.org/"+ obj +"#map=" + 
			[zoom,
				center.lat.toFixed(precision),
				center.lng.toFixed(precision)
			].join("/");

		},

		init: function(map) {
			this.map = map;
			this.map.on("moveend", this.onMapMove, this);

			// reset the hash
			this.lastHash = null;
			this.onHashChange();

			if (!this.isListening) {
				this.startListening();
			}
		},

		remove: function() {
			this.map = null;
			if (this.isListening) {
				this.stopListening();
			}
		},

		onMapMove: function(map) {
			// bail if we're moving the map (updating from a hash),
			// or if the map has no zoom set

			if (this.movingMap || this.map.getZoom() === 0) {
				return false;
			}

			var hash = this.formatHash(this.map);
			if (this.lastHash != hash) {
				location.replace(hash);
				$("#osm_org")[0].href = this.formatHashOsm(this.map);
				this.lastHash = hash;
			}
		},

		movingMap: false,
		update: function() {
			var hash = location.hash;
			if (hash === this.lastHash) {
				// console.info("(no change)");
				return;
			}
			var parsed = this.parseHash(hash);
			if (parsed) {
				// console.log("parsed:", parsed.zoom, parsed.center.toString());
				this.movingMap = true;
				if(parsed.room != null && parsed.room != ""){
					api.room = parsed.room;
					this.map.setView(parsed.center, parsed.zoom);
					api.loadRoom(parsed.center.lat,parsed.center.lng,parsed.room)
				}else if(parsed.id_building != null && parsed.id_building != "")
					api.loadBuilding(parsed.id_building, parsed.id_level, parsed.id_room);
				else{
					if (api.room != null) {
						api.building.closePopup();
						api.layer.reloadBuilding(true);
						api.room = null;
					}
					if(parsed.center != null && parsed.zoom != null)
            this.map.setView(parsed.center, parsed.zoom);
				}
				this.movingMap = false;
				//alert(parsed.room);
			} else {
				// console.warn("parse error; resetting:", this.map.getCenter(), this.map.getZoom());
				this.onMapMove(this.map);
			}
		},

		// defer hash change updates every 100ms
		changeDefer: 100,
		changeTimeout: null,
		onHashChange: function() {
			// throttle calls to update() so that they only happen every
			// `changeDefer` ms
			if (!this.changeTimeout) {
				var that = this;
				this.changeTimeout = setTimeout(function() {
					that.update();
					that.changeTimeout = null;
				}, this.changeDefer);
			}
		},

		isListening: false,
		hashChangeInterval: null,
		startListening: function() {
			if (HAS_HASHCHANGE) {
				L.DomEvent.addListener(window, "hashchange", this.onHashChange);
			} else {
				clearInterval(this.hashChangeInterval);
				this.hashChangeInterval = setInterval(this.onHashChange, 50);
			}
			this.isListening = true;
		},

		stopListening: function() {
			if (HAS_HASHCHANGE) {
				L.DomEvent.removeListener(window, "hashchange", this.onHashChange);
			} else {
				clearInterval(this.hashChangeInterval);
			}
			this.isListening = false;
		}
	};
})(window);
