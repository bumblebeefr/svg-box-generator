var layer = document.getElementById("layer1");

var TabTools = {
	/**
	 * Genere les elements d'un polygone
	 * svg pour des encoche d'approximativement
	 * <tab_width>, sur un longueur de <length>,
	 * pour un materiau d'epaisseur <thickness>.
	 *
	 * Options :
	 *  - direction : 0 haut de la face, 1 droite de la face, 2 bas de la face, 3 gauche de la face.
	 *  - firstUp : Indique si l'on demarre en haut d'un crenau (true) ou en bas du crenau (false - defaut)
	 *  - lastUp : Indique si l'on fin en haut d'un crenau (true) ou en bas du crenau (false - defaut)
	 **/
	tabs: function (length, tab_width, thickness, options) {

		//options management
		var opt = {
			direction: 0,
			firstUp: false,
			lastUp: false,
			inverted: false,
			backlash: 0,
			cutOff: false

		};
		if (typeof options === 'object') {
			for (k in options) {
				opt[k] = options[k];
			}
		}
		if (typeof opt.backlash != 'number') {
			opt.backlash = 0;
		}

		//Calcultate tab size and number
		var nb_tabs = Math.floor(length / tab_width);
		nb_tabs = nb_tabs - 1 + (nb_tabs % 2);
		var tab_real_width = length / nb_tabs;

		//Check if no inconsistency on tab size and number
		console.debug(["Pour une largeur de", length, "et des encoches de", tab_width, "=> Nombre d'encoches :", nb_tabs, "Largeur d'encoche : ", tab_real_width].join(" "));

		if (tab_real_width <= thickness * 1.5) {
			var msg = ["Attention les encoches resultantes ne sont pas assez larges au vue de l'epasseur de votre materiaux (", largeur_encoche, " &lt; ", materiau, "). Merci d'utiliser une taille d'encoches coherente avec votre boite"].join(" ");
			alert(msg);
			throw (msg);
		}

		if (nb_tabs <= 1) {
			var msg = ["Attention vous n'aurez aucune encoche sur cette longeur, c'est une mauvaise idée !!! Indiquez une taill d'encoche correcte pour votre taille de boite"].join(" ");
			alert(msg);
			throw (msg);
		}

		return TabTools._rotate_path(TabTools._generate_tabs_path(tab_real_width, nb_tabs, thickness, options), opt.direction);

	},

	_generate_tabs_path: function (tab_width, nb_tabs, thickness, options) {
		console.debug((options.cutOff ? "generate path with cuttof" : "generate path without cutoff"));
		//Generate path
		var points = [];
		for (var i = 1; i <= nb_tabs; i++) {
			if (options.inverted) {
				if (i % 2 == 1) { //gap
					if (i != 1 || !options.firstUp) {
						points.push([0, thickness]);
					}
					if (i == 1 || i == nb_tabs) {
						points.push([tab_width - (options.cutOff ? thickness : 0) - (0.5 * options.backlash), 0]);
					} else {
						points.push([tab_width - options.backlash, 0]);
					}
					if (i != nb_tabs || !options.lastUp) {
						points.push([0, -thickness]);
					}
				} else { //tab
					points.push([tab_width + options.backlash, 0]);
				}

			} else {
				if (i % 2 == 1) { //tab
					if (i != 1 || !options.firstUp) {
						points.push([0, -thickness]);
					}
					if (i == 1 || i == nb_tabs) {
						points.push([tab_width - (options.cutOff ? thickness : 0) + (0.5 * options.backlash), 0]);
					} else {
						points.push([tab_width + options.backlash, 0]);
					}
					if (i != nb_tabs || !options.lastUp) {
						points.push([0, thickness]);
					}
				} else { //gap
					points.push([tab_width - options.backlash, 0]);
				}
			}

		}
		return points;
	},

	_rotate_path: function (points, direction) {
		switch (direction) {
		case 1:
			return points.map(function (point) {
				return [-point[1], point[0]];
			});
		case 2:
			return points.map(function (point) {
				return [-point[0], -point[1]];
			});
		case 3:
			return points.map(function (point) {
				return [point[1], -point[0]];
			});
		default:
			return points;
		}
	}
};
var SvgTools = {
	mm2px: function (arr) {
		console.log(typeof arr);
		if (typeof arr == 'array' || typeof arr == 'object') {
			return arr.map(function (point) {
				return point.map(function (coord) {
					return coord * 90 / 25.4;
				});
			});
		}
		if (typeof arr == 'number') {
			return arr * 90 / 25.4;
		}

	},

	toPathString: function (arr) {
		return arr.map(function (point) {
			return point.join(",")
		}).join(" ");
	},
	addPath: function (str, id, _x, _y) {
		var shape = document.createElement("path");
		shape.setAttribute("style", "fill:#ffffff;stroke:#ff0000");
		shape.setAttribute("id", id);
		shape.setAttribute("transform", "translate(" + SvgTools.mm2px(_x) + "," + (SvgTools.mm2px(_y)) + ")");
		shape.setAttribute("d", "m " + str + " z");
		layer.appendChild(shape);
	},
	clearPathAndLink: function () {
		var out = document.getElementById("out");
		out.innerHTML = "Chargement...";
		layer.innerHTML = "";
	},
	downloadLink: function (width, depth, height, thickness) {
		var aFileParts = ['<?xml version="1.0" encoding="UTF-8" standalone="no"?>', document.getElementById("svg").innerHTML];
		var oMyBlob = new Blob(aFileParts, {
			type: 'image/svg+xml '
		});
		var out = document.getElementById("out");
		out.innerHTML = "";
		var link = document.createElement("a");
		link.innerHTML = (["⎘ Télécharger le fichier pour une boite de", width, "x", depth, "x", height, "en", thickness, "mm d'epaisseur"].join(" "));
		link.setAttribute("href", URL.createObjectURL(oMyBlob));
		link.setAttribute("download", ["box_", width, "x", depth, "x", height, "_", thickness, "mm.svg"].join(""));
		out.appendChild(link);
		link.click();
	},
	setDocumentSize: function (width, depth, height, thickness) {
		document.getElementById("box").setAttribute("height", SvgTools.mm2px(depth + 2 * height + 4 * thickness));
		document.getElementById("box").setAttribute("width", SvgTools.mm2px(2 * Math.max(width, depth) + 3 * thickness));
	}
};

var Box = {
	_bottom: function (width, depth, tab_width, thickness, backlash) {
		console.debug("_bottom");
		var points = [[0, 0]];
		points.push.apply(points, TabTools.tabs(width, tab_width, thickness, {
			direction: 0,
			backlash: backlash,
			firstUp: true,
			lastUp: true
		}));
		points.push.apply(points, TabTools.tabs(depth, tab_width, thickness, {
			direction: 1,
			backlash: backlash,
			firstUp: true,
			lastUp: true
		}));
		points.push.apply(points, TabTools.tabs(width, tab_width, thickness, {
			direction: 2,
			backlash: backlash,
			firstUp: true,
			lastUp: true
		}));
		points.push.apply(points, TabTools.tabs(depth, tab_width, thickness, {
			direction: 3,
			backlash: backlash,
			firstUp: true,
			lastUp: true
		}));
		return points;
	},
	_front_without_top: function (width, height, tab_width, thickness, backlash) {
		console.debug("_front_without_top");
		var points = [[0, 0], [width, 0]];
		points.push.apply(points, TabTools.tabs(height - thickness, tab_width, thickness, {
			direction: 1,
			backlash: backlash,
			firstUp: true,
			lastUp: true
		}));
		points.push.apply(points, TabTools.tabs(width, tab_width, thickness, {
			direction: 2,
			backlash: backlash,
			firstUp: true,
			lastUp: true,
			inverted: true
		}));
		points.push.apply(points, TabTools.tabs(height - thickness, tab_width, thickness, {
			direction: 3,
			backlash: backlash,
			firstUp: true,
			lastUp: true
		}));
		return points;
	},
	_front_with_top: function (width, height, tab_width, thickness, backlash) {
		console.debug("_front_with_top");
		var points = [[0, thickness]];

		points.push.apply(points, TabTools.tabs(width, tab_width, thickness, {
			direction: 0,
			backlash: backlash,
			firstUp: true,
			lastUp: true,
			inverted: true
		}));
		points.push.apply(points, TabTools.tabs(height - (thickness * 2), tab_width, thickness, {
			direction: 1,
			backlash: backlash,
			firstUp: true,
			lastUp: true
		}));
		points.push.apply(points, TabTools.tabs(width, tab_width, thickness, {
			direction: 2,
			backlash: backlash,
			firstUp: true,
			lastUp: true,
			inverted: true
		}));
		points.push.apply(points, TabTools.tabs(height - (thickness * 2), tab_width, thickness, {
			direction: 3,
			backlash: backlash,
			firstUp: true,
			lastUp: true
		}));
		return points;
	},
	_side_without_top: function (depth, height, tab_width, thickness, backlash) {
		console.debug("_side_without_top");
		var points = [[thickness, 0], [depth - (4 * thickness), 0]];
		points.push.apply(points, TabTools.tabs(height - thickness, tab_width, thickness, {
			direction: 1,
			backlash: backlash,
			firstUp: true,
			lastUp: true,
			inverted: true
		}));
		points.push.apply(points, TabTools.tabs(depth, tab_width, thickness, {
			direction: 2,
			backlash: backlash,
			firstUp: true,
			lastUp: true,
			inverted: true,
			cutOff: true
		}));
		points.push.apply(points, TabTools.tabs(height - thickness, tab_width, thickness, {
			direction: 3,
			backlash: backlash,
			firstUp: true,
			lastUp: true,
			inverted: true
		}));
		return points;
	},
	_side_with_top: function (depth, height, tab_width, thickness, backlash) {
		console.debug("_side_with_top");
		var points = [[thickness, thickness]];
		points.push.apply(points, TabTools.tabs(depth, tab_width, thickness, {
			direction: 0,
			backlash: backlash,
			firstUp: true,
			lastUp: true,
			inverted: true,
			cutOff: true
		}));
		points.push.apply(points, TabTools.tabs(height - (2 * thickness), tab_width, thickness, {
			direction: 1,
			backlash: backlash,
			firstUp: true,
			lastUp: true,
			inverted: true
		}));
		points.push.apply(points, TabTools.tabs(depth, tab_width, thickness, {
			direction: 2,
			backlash: backlash,
			firstUp: true,
			lastUp: true,
			inverted: true,
			cutOff: true
		}));
		points.push.apply(points, TabTools.tabs(height - (2 * thickness), tab_width, thickness, {
			direction: 3,
			backlash: backlash,
			firstUp: true,
			lastUp: true,
			inverted: true
		}));
		return points;
	},
	withTop: function (width, depth, height, tab_size, thickness, backlash) {
		SvgTools.clearPathAndLink();
		SvgTools.addPath(SvgTools.toPathString(SvgTools.mm2px(Box._bottom(width, depth, tab_size, thickness, backlash))), 'bottom', (1 * thickness), (1 * thickness));
		SvgTools.addPath(SvgTools.toPathString(SvgTools.mm2px(Box._bottom(width, depth, tab_size, thickness, backlash))), 'top', (2 * thickness + width), (1 * thickness));
		SvgTools.addPath(SvgTools.toPathString(SvgTools.mm2px(Box._front_with_top(width, height, tab_size, thickness, backlash))), 'font', (2 * thickness + width), (2 * thickness + depth));
		SvgTools.addPath(SvgTools.toPathString(SvgTools.mm2px(Box._front_with_top(width, height, tab_size, thickness, backlash))), 'back', (1 * thickness), (2 * thickness + depth));
		SvgTools.addPath(SvgTools.toPathString(SvgTools.mm2px(Box._side_with_top(depth, height, tab_size, thickness, backlash))), 'left_side', (2 * thickness + depth), (3 * thickness + depth + height));
		SvgTools.addPath(SvgTools.toPathString(SvgTools.mm2px(Box._side_with_top(depth, height, tab_size, thickness, backlash))), 'right_side', (1 * thickness), (3 * thickness + depth + height));
		SvgTools.setDocumentSize(width, depth, height, thickness);
		SvgTools.downloadLink(width, depth, height, thickness);
	},
	withoutTop: function (width, depth, height, tab_size, thickness, backlash) {
		SvgTools.clearPathAndLink();
		SvgTools.addPath(SvgTools.toPathString(SvgTools.mm2px(Box._bottom(width, depth, tab_size, thickness, backlash))), 'bottom', (1 * thickness), (1 * thickness));
		SvgTools.addPath(SvgTools.toPathString(SvgTools.mm2px(Box._front_without_top(width, height, tab_size, thickness, backlash))), 'font', (2 * thickness + width), (2 * thickness + depth));
		SvgTools.addPath(SvgTools.toPathString(SvgTools.mm2px(Box._front_without_top(width, height, tab_size, thickness, backlash))), 'back', (1 * thickness), (2 * thickness + depth));
		SvgTools.addPath(SvgTools.toPathString(SvgTools.mm2px(Box._side_without_top(depth, height, tab_size, thickness, backlash))), 'left_side', (2 * thickness + depth), (3 * thickness + depth + height));
		SvgTools.addPath(SvgTools.toPathString(SvgTools.mm2px(Box._side_without_top(depth, height, tab_size, thickness, backlash))), 'right_side', (1 * thickness), (3 * thickness + depth + height));
		SvgTools.setDocumentSize(width, depth, height, thickness);
		SvgTools.downloadLink(width, depth, height, thickness);
	}
};


function value_of(id) {
	var v = parseFloat(document.getElementById(id).value);
	if (isNaN(v)) {
		throw (id + " is not a number : " + document.getElementById(id).value);
	} else {
		return v;
	}
}

function generate_box() {
	try {
		if (document.getElementById('closed').checked) {
			Box.withTop(value_of('width'), value_of('depth'), value_of('height'), value_of('tabs'), value_of('thickness'), value_of('backlash'));
		} else {
			Box.withoutTop(value_of('width'), value_of('depth'), value_of('height'), value_of('tabs'), value_of('thickness'), value_of('backlash'));
		}
	} catch (e) {
		console.error(e);
		document.getElementById("out").innerHTML = "";
		alert('Impossible de générer la boite demandée');

	}
}
