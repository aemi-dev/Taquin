// push a new environment in games List
function createEnvironment() {
	display.personals.clear();
    display.solutions.clear();
    games.push( new Environment( getWidth(), getHeuristics() ) );
}

// Clear HTML Element Content
Element.prototype.clear = function() {
	this.innerHTML = "";
};


// Get Computed Style of an Element
Element.prototype.getStyle = function( ...properties ) {
	let styles = {};
	if ( properties.length ) {
		for ( let property of properties ) {
			styles[property] = window.getComputedStyle( this ).getPropertyValue( property );
		}
	} else {
		for ( let property in window.getComputedStyle( this ) ) {
			const value = window.getComputedStyle( this ).getPropertyValue( property );
			if ( value ) {
				styles[property] = value;
			}
		}
	}
	return styles;
};


// Dispatch Play Event to an Element
Element.prototype.play = function()
{
	this.dispatchEvent( played );
};


// Display Taquin in e parameter/Element
Taquin.prototype.displayIn = function( e ) {
	const width = this.environment.sizes[0],
	g = document.createElement( "div" );
	g.classList.add( "game", `w-${width}` );
	for ( let value of this.sequence ) {
		let c = document.createElement( "div" );
		if ( value == 0 ) {
			c.classList.add( "case", "vide" );
		} else {
			c.classList.add( "case" );
		}
		c.setAttribute( 'style',`font-size:${
			( e.offsetWidth - parseInt( e.getStyle( "padding-left" )['padding-left'] ) * 2 ) / ( width * 2 )
			}px;` );
		c.innerHTML = value != 0 ? value : "";
		g.appendChild( c );
	}
	e.innerHTML = "";
	e.appendChild( g );
};



// Display Taquin informations
Taquin.prototype.informations = function( g=undefined, i=undefined, d=undefined, m=undefined ) {
	if ( !g ) { g = display.coups; }
	if ( !i ) { i = display.inversions; }
	if ( !m ) { m = display.manhattan; }
	if ( !d ) { d = display.desordre; }
	g.innerHTML = this.g;
	i.innerHTML = parseInt( this.inv ).toString();
	m.innerHTML = parseInt( this.man ).toString();
	d.innerHTML = parseInt( this.dis ).toString();
};

function moveBlock( taquin, index ) {
	let block = document.createElement("div"),
		idBlock = document.createElement("div"),
		nameBlock = document.createElement("div"),
		wayBlock = document.createElement("div"),
		infoBlock = document.createElement("div"),
		taquinBlock = document.createElement("div");
	block.classList.add("moveBlock");
	idBlock.classList.add("idBlock");
	nameBlock.classList.add("nameBlock");
	wayBlock.classList.add("wayBlock");
	infoBlock.classList.add("infoBlock");
	taquinBlock.classList.add("taquinBlock");
	let identifiant = index.toString(),
		moveName,
		waySymbol,
		manhattan = taquin.man.toString(),
		desordre = taquin.dis.toString(),
		inversions = taquin.inv.toString();
	if (taquin.g > 0) {
		switch (taquin.path.slice(-1)) {
			case "L":
				moveName = "Gauche";
				waySymbol = "&larr;";
				break;
			case "R":
				moveName = "Droite";
				waySymbol = "&rarr;";
				break;
			case "U":
				moveName = "Haut";
				waySymbol = "&uarr;";
				break;
			case "D":
				moveName = "Bas";
				waySymbol = "&darr;";
				break;
			default:
				break;
		}
	} else {
		moveName = "Racine";
		waySymbol = "";
	}
	idBlock.innerHTML = identifiant;
	nameBlock.innerHTML = moveName;
	wayBlock.innerHTML = waySymbol;
	infoBlock.innerHTML += `<div class="dataBlock"><span class="datas">${manhattan}</span><span class="title">manhattan</span></div>`;
	infoBlock.innerHTML += `<div class="dataBlock"><span class="datas">${desordre}</span><span class="title">désordre</span></div>`;
	infoBlock.innerHTML += `<div class="dataBlock"><span class="datas">${inversions}</span><span class="title">inversions</span></div>`;
	taquin.displayIn(taquinBlock);
	block.appendChild(idBlock);
	block.appendChild(nameBlock);
	block.appendChild(wayBlock);
	block.appendChild(infoBlock);
	block.appendChild(taquinBlock);
	block.addEventListener("click", function activate() {
		block.classList.toggle("active");
	}, false);
	return block;
}

function saveIn( e, taquin ) {
	let next = moveBlock(taquin,taquin.environment.moves.length-1);
	e.appendChild(next);
}

// Display solutions moves
function expandIn( e ) {
	e.innerHTML = "";
	let solutions = games.last().end.last().traceroute();
	solutions = solutions.slice(games.last().moves.last().g);
	Array.from(solutions).forEach( (solution,index) => {
		e.appendChild(moveBlock(solution,index));
	} );
}


Array.from( document.getElementsByClassName("toggler") ).forEach( ( e ) => {
	e.addEventListener( "click", () => {
		e.classList.toggle( "active" );
	}, false );
} );


const getWidth = () => {
	let width = parseInt( controls.width.value );
	if ( width < 3 ) {
		width = 3;
	}
	if ( width > 4 ) {
		if (getSearch() != "idaStar") {
			controls.expand.disabled = true;
		}
		else if (width > 5) {
			controls.expand.disabled = true;
		}
	} else {
		controls.expand.disabled = false;
	}
	if ( width > 10 ) {
		width = 10;
	}
	controls.width.value = width;
	return width;
},
getHeuristics = () => {
	let heuristics = [];
	for ( let element of controls.heuristics )
	{
		if ( element.checked )
		{
			heuristics.push( parseInt( element.value ) );
		}
	}
	return heuristics;
},
getSearch = () => {
	for ( let element of controls.searches )
	{
		if ( element.checked )
		{
			return element.value;
		}
	}
};


// Create Width Button EventListener
controls.create.addEventListener( "click", function ()
{
	document.body.classList.remove( "win" );
	createEnvironment( getWidth(), getHeuristics() );
	display.taquin.play();
}, false );


// Increment Width Button EventListener
controls.increment.addEventListener("click", function () {
	if ( controls.width.value < 10 ) {
		if (controls.width.value > 3) {
			controls.searches[0].disabled = true;controls.searches[0].checled = false;
			controls.searches[1].checked = true;
		}
		controls.width.value++;
	}
	controls.create.click();
	display.taquin.play();
}, false );


// Decrement Width Button EventListener
controls.decrement.addEventListener("click", function ()
{
	if ( controls.width.value > 3 ) {
		if (controls.width.value < 7) {
			controls.expand.disabled = false;
			if (controls.width.value < 6 ) {
				controls.searches[0].disabled = false;
			}
		}
		controls.width.value--;
	}
	controls.create.click();
	display.taquin.play();
}, false );


// Expand Button EventListener
controls.expand.addEventListener("click", function()
{
	if ( games.last().sizes[0] <= 5 )
	{
		let env = games.last();
		env.weightings = getHeuristics();
		let result = env.expand( getSearch() );
		if (result) {expandIn( display.solutions );}
	}
}, false );


// Update Taquin EventListener
display.taquin.addEventListener( "moved", function()
{
	if (games.last().moves.length==1) {
		display.personals.clear();
    	display.solutions.clear();
	}
	let taquin = games.last().moves.last();
	taquin.displayIn( display.taquin );
	taquin.informations();
	saveIn(display.personals,taquin);
}, false );


// Swipe Listening Function
swipedetect( display.taquin, function( direction )
{
	if ( !( document.body.classList.contains( "win" ) ) )
	{
		let move;
		switch ( direction )
		{
			case "left":
				move = games.last().moves.last().findMoves( true ).includes( "L" ) ? "L" : undefined;
				break;
			case "up":
				move = games.last().moves.last().findMoves( true ).includes( "U" ) ? "U" : undefined;
				break;
			case "right":
				move = games.last().moves.last().findMoves( true ).includes( "R" ) ? "R" : undefined;
				break;
			case "down":
				move = games.last().moves.last().findMoves( true ).includes( "D" ) ? "D" : undefined;
				break;
			default:
				return;
		}
		if ( move )
		{
			games.last().play( move );
		}
	}
} );


// Keydown EventListener
document.onkeydown = function handlekeydown( e )
{
	if ( !( document.body.classList.contains( "win" ) ) )
	{
		let move;
		switch ( e.keyCode )
		{
			case 13: // Enter
				e.preventDefault();
				controls.create.click();
				break;
			case 37: // Left
				e.preventDefault();
				move = games.last().moves.last().findMoves( true ).includes( "L" ) ? "L" : undefined;
				break;
			case 38: // Up
				e.preventDefault();
				move = games.last().moves.last().findMoves( true ).includes( "U" ) ? "U" : undefined;
				break;
			case 39: // Right
				e.preventDefault();
				move = games.last().moves.last().findMoves( true ).includes( "R" ) ? "R" : undefined;
				break;
			case 40: // Down
				e.preventDefault();
				move = games.last().moves.last().findMoves( true ).includes( "D" ) ? "D" : undefined;
				break;
			default:
				return;
		}
		if ( move )
		{
			games.last().play( move );
		}
	}
};


// Window Onload Taquin Generation
window.onload = function ()
{
	controls.create.click();
};
