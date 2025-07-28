var scope = scope || null;
try{
	if(!scope){
		console.log('Scope is not initialized');
		return;
	}
	var me = scope.getMyPlayerNumber();
	var enemy = me % 2 + 1;
	if(!scope['BOT-' + me]){
		scope['BOT-' + me] = (function(){
			var DATA;
			function init() {
				try{
					DATA = {FLAGS:[]};
					DATA.START_LOCATION = scope.getStartLocationForPlayerNumber(me);
					DATA.ENEMY_LOCATION = scope.getStartLocationForPlayerNumber(enemy);
					DATA.MINES = sortMinesByDistance(DATA.START_LOCATION);
					DATA.START_CASTLE = scope.getBuildings({type:"Castle", player: me, onlyFinshed: true});
					everybodyGoesToFirstMine();
					DATA.GOALS = [
						'First House',
						'Forward Workers',
						'First Double Den',
						'Post Rush',
						'End Game'
					];
				}catch(Pokemon){
					console.log('Error during init:\n'+Pokemon);
				}
			}
			function makeMove(){
				try{
					DATA.BUILDED = markTilesTakenByBuildings();
					switch(DATA.GOALS[DATA.FLAGS.length]){
					case 'First House':
						buildFirstHouse();
						break;
					case 'Forward Workers':
						send2WorkersForward();
						giveWorkToIdleWorkders();
						break;
					case 'First Double Den':
						buildTwoDens();
						giveWorkToIdleWorkders();
						break;
					case 'Post Rush':
						trainWolfs();
						trainWorders();
						attack();
						goToEndGame();
						break;
					case 'End Game':
						trainWolfs();
						trainWorders();
						attack();
						giveWorkToIdleWorkders();
						makeHouseIfNeeded();
						break;
					}
				}catch(Pokemon){
					console.log('Error during makeMove:\n'+Pokemon);
				}
			}
			/********** BUILD ORDER **********/
			function sortMinesByDistance(targetLocation){
				var allMines = scope.getBuildings({type: "Goldmine"});
				var setOfMines = {};
				for(var i = 0, max = allMines.length; i < max; i++){
					var oneMine = allMines[i];//scope.getGroundDistance does not work
					var hisDistance = distance(oneMine.getX(), oneMine.getY(), targetLocation.x, targetLocation.y);
					if(setOfMines[hisDistance]){
						setOfMines[hisDistance].push(oneMine);
					}else{
						setOfMines[hisDistance] = [oneMine];
					}
				}
				var allDistances = Object.keys(setOfMines).filter(Number).sort(function(a, b){return a-b;});
				var sortedMines = [];
				for(var j = 0; j < allDistances.length; j++){
					sortedMines = sortedMines.concat(setOfMines[allDistances[j]]);
				}
				return sortedMines;
			}
			function everybodyGoesToFirstMine(){
				var allWorkers = scope.getUnits({type: "Worker", player: me});
				var closestMine = DATA.MINES[0];
				scope.order("Mine", allWorkers, {unit: closestMine});
				scope.order("Moveto", DATA.START_CASTLE, {unit: closestMine});
			}
			function markTilesTakenByBuildings(){
				var CACHE = {};
				var allBuildings = scope.getBuildings({player: me});
				allBuildings.forEach(function(oneBuilding){
					var bx = oneBuilding.getX();
					var by = oneBuilding.getY();
					var a = -3, b = -3;
					if(2*bx == 2*Math.round(bx)){//coordinate is while number, it means 3x3 building
						a = -2;
						b = -2;
					}else{//coordinate is .5 number, it means 4x4 building
						bx = Math.round(bx);
						by = Math.round(by);
					}
					for(; a < 3; a++){
						for(; b < 3; b++){
							var tile = {x: bx + a, y: by +b};
							CACHE[tileId(tile)] = true;
						}
					}
				});
				//mark tiles taken by Mines
				DATA.MINES.forEach(function(oneMine){
					var mx = Math.round(oneMine.getX()+0.5);
					var my = Math.round(oneMine.getY()+0.5);
					for(var c = -2; c < 3; c++){
						for(var d = -2; d < 3; d++){
							var mineTile = {x: mx + c, y: my + d};
							CACHE[tileId(mineTile)] = true;
						}
					}
				});
				return CACHE;
			}
			function buildFirstHouse(){
				var houses = scope.getBuildings({type:"House", player: me});
				if(houses.length > 0){//we are already building house
					DATA.FLAGS.push('First House');
					return;
				}
				var allWorkers = scope.getUnits({type: "Worker", player: me});
				var mineLocation = {//we want first house near Mine
					x: Math.round(DATA.MINES[0].getX()),
					y: Math.round(DATA.MINES[0].getY())
				};
				var houseLocation;
				if(scope.getGold() == 115 ){//premove worker to building location
					houseLocation = findNearestSpotFor3x3Building(mineLocation);
					if(houseLocation){
						scope.order("Move",[allWorkers[0]], houseLocation);
					}
				}
				if(scope.getGold() < 120){
					return;
				}
				houseLocation = findNearestSpotFor3x3Building(mineLocation);
				if(houseLocation){
					scope.order("Build House",[allWorkers[0]], houseLocation);
					scope.order("Mine", [allWorkers[0]], {unit: DATA.MINES[0]}, true);
				}
			}
			function send2WorkersForward(){
				var allWorkers = scope.getUnits({type: "Worker", player: me});
				var availableDuo = [];
				for(var i = 0; i < allWorkers.length; i++){
					var oneWorker = allWorkers[i];
					if(oneWorker.getCurrentOrderName() == 'Repair'){
						continue;//making a building counts as repairing
					}
					availableDuo.push(oneWorker);
					if(availableDuo.length == 2){
						break;
					}
				}
				scope.order("AMove", availableDuo, DATA.ENEMY_LOCATION);
				DATA.FLAGS.push('Forward Workers');
			}
			function giveWorkToIdleWorkders(){
				var idleWorkders = scope.getUnits({type: "Worker", player: me, order: "Stop"});
				if(idleWorkders.length > 0){
					scope.order("Mine",idleWorkders,{unit: DATA.MINES[0]});
				}
			}
			function buildTwoDens(){
				var dens = scope.getBuildings({type:"Wolves Den", player: me});
				if(dens.length > 1){
					DATA.FLAGS.push('First Double Den');
					return;
				}
				if(dens.length == 1){//only one started making den
					makeSecondDenAnyway();
					return;
				}
				var houses = scope.getBuildings({type:"House", player: me, onlyFinshed: true});
				if(houses.length < 1 || scope.getGold() < 200){
					return;//wait for finished house and enough money
				}
				var forwarders = scope.getUnits({type: "Worker", player: me, order:"AMove"});
				if(forwarders.length < 2){
					makeSecondDenAnyway();
					return;
				}
				//place den around first worker
				var firstCoordinates = {
					x : Math.round(forwarders[0].getX()),
					y : Math.round(forwarders[0].getY())
				};
				var firstDenSpot = findNearestSpotFor3x3Building(firstCoordinates);
				//make area around this den taken
				for(var a = -3; a < 4; a++){
					for(var b = -3; b < 4; b++){
						var takenTile = {
							x: firstDenSpot.x + a,
							y: firstDenSpot.y + b
						};
						DATA.BUILDED[tileId(takenTile)] = true;
					}
				}
				//place den around second worker
				var secondCoordinates = {
					x : Math.round(forwarders[1].getX()),
					y : Math.round(forwarders[1].getY())
				};
				var secondDenSpot = findNearestSpotFor3x3Building(secondCoordinates);
				//send commands to make two dens, then to continue attack
				scope.order("Build Wolves Den",[forwarders[0]],firstDenSpot);
				scope.order("Build Wolves Den",[forwarders[1]],secondDenSpot);
				scope.order("AMove", forwarders, DATA.ENEMY_LOCATION, true);
			}
			function makeSecondDenAnyway(){
				var forwarders = scope.getUnits({type: "Worker", player: me, order:"AMove"});
				if(forwarders.length == 0){return;}
				var firstCoordinates = {
					x : Math.round(forwarders[0].getX()),
					y : Math.round(forwarders[0].getY())
				};
				var firstDenSpot = findNearestSpotFor3x3Building(firstCoordinates);
				scope.order("Build Wolves Den",[forwarders[0]],firstDenSpot);
				scope.order("AMove", forwarders, DATA.ENEMY_LOCATION, true);
			}
			function trainWolfs(){
				var dens = scope.getBuildings({type:"Wolves Den", player: me, onlyFinshed: true});
				if(!dens.length){
					return;
				}
				var allMoney = scope.getGold();
				var wolfCost = 45;
				var availableSupply = scope.getMaxSupply() - scope.getCurrentSupply();
				for(var i = 0, max = dens.length; i < max; i++){
					var oneDen = dens[i];
					var inQueue = oneDen.getUnitTypeNameInProductionQueAt(1);
					if(!inQueue && allMoney >= wolfCost && availableSupply >= 2){
						availableSupply -= 2;
						scope.order("Train Wolf", [oneDen]);
						allMoney -= wolfCost;
					}
				}
			}
			function trainWorders(){
				if(scope.getGold() < 50){
					return;
				}
				var miners = scope.getUnits({type: "Worker", player: me, order: "Mine"});
				if(miners.length >= 10){//that is enough
					return;
				}
				var castles = scope.getBuildings({type:"Castle", player: me, onlyFinshed: true});
				var availableSupply = scope.getMaxSupply() - scope.getCurrentSupply();
				for(var i = 0, max = castles.length; i < max; i++){
					var oneCastle = castles[i];
					var inQueue = oneCastle.getUnitTypeNameInProductionQueAt(1);
					if(!inQueue && availableSupply > 2){//keep supply for 1 wolf
						availableSupply--;
						scope.order("Train Worker", [oneCastle]);
					}
				}
			}
			function attack(){
				var fightingUnits = scope.getUnits({notOfType: "Worker", player: me});
				if(!fightingUnits.length){return;}
				scope.order("AMove", fightingUnits, DATA.ENEMY_LOCATION);
			}
			function goToEndGame(){
				var dens = scope.getBuildings({type:"Wolves Den", player: me, onlyFinshed: true});
				if(dens.length > 1){//we have 2 finished dens, that was our goal
					DATA.FLAGS.push('Post Rush');
				}
			}
			function makeHouseIfNeeded(){
				if(scope.getGold() < 100){
					return;
				}
				var finishedHouses = scope.getBuildings({type:"House", player: me, onlyFinshed: true});
				var allHouses = scope.getBuildings({type:"House", player: me});
				if(allHouses.length > finishedHouses.length){
					return;//new house is in progress 
				}
				var availableSupply = scope.getMaxSupply() - scope.getCurrentSupply();
				var allCastles = scope.getBuildings({type:"Castle", player: me, onlyFinshed: true});
				var allDens = scope.getBuildings({type:"Wolves Den", player: me, onlyFinshed: true});
				availableSupply -= 2 * (allCastles.length + 2 * allDens.length);
				if(availableSupply > 0){
					return;//enough supply for production
				}
				var houseLocation = findNearestSpotFor3x3Building(DATA.START_LOCATION);
				var allWorkers = scope.getUnits({type: "Worker", player: me, order:"Mine"});
				if(houseLocation && allWorkers.length > 0){
					scope.order("Build House",[allWorkers[0]], houseLocation);
				}
			}
			/********** MATH MAGIC **********/
			function distance(x1, y1, x2, y2){
				return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
			}
			function tileId(tile){//my way to generate unique key per each tile
				return 'x'+tile.x+'y'+tile.y;
			}
			function findNearestSpotFor3x3Building(startLocation){
				var VISITED_TILES = {};
				//Don't build next to Mines
				var mX = DATA.MINES[0].getX() - 1.5;
				var mY = DATA.MINES[0].getX() - 1.5;
				for(var a = 0; a < 4; a++){
					for(var b = 0; b < 4; b++){
						var mineId = tileId({x:mX+a,y:mY+b});
						VISITED_TILES[mineId] = true;
					}
				}
				//Don't build between first Castle and first Mine
				var middleX = Math.round((DATA.MINES[0].getX() + DATA.START_CASTLE[0].getX())/2);
				var middleY = Math.round((DATA.MINES[0].getY() + DATA.START_CASTLE[0].getY())/2);
				for(var c = -2; c < 3;c++){
					for(var d = -2; d < 3; d++){
						VISITED_TILES[tileId({x:middleX+c,y:middleY+d})] = true;
					}
				}
				//Search for a good spots near starting location
				var goodSpots = spotSearch(makeNextTiles(startLocation.x,startLocation.y), VISITED_TILES);
				if(goodSpots){
					var randomTileNumber = Math.floor(Math.random()*goodSpots.length);
					return goodSpots[randomTileNumber];
				}
			}
			function makeNextTiles(tileX,tileY){
				var newTiles = [];
				if(tileY > 2){//Tile above
					newTiles.push({x: tileX, y:tileY - 1});
				}
				if(scope.getMapHeight() - 2 > tileY){//Tile bellow
					newTiles.push({x: tileX, y:tileY + 1});
				}
				if(tileX > 2){//Tile to the left
					newTiles.push({x: tileX - 1, y:tileY});
				}
				if(scope.getMapWidth() - 2 > tileX){//Tile to the right
					newTiles.push({x: tileX + 1, y:tileY});
				}
				return newTiles;
			}
			function spotSearch(tilesToVisit, visitedTiles){
				var GOOD_SPOTS = [];
				var counter = 0;//to not go infinitely, max 30 tiles away
				while(GOOD_SPOTS.length == 0 && counter < 30)
				{
					tilesToVisit.forEach(function(oneTile){
						visitedTiles[tileId(oneTile)] = true;
						if(is3x3Buidable(oneTile.x, oneTile.y)){
							GOOD_SPOTS.push(oneTile);
						}
					});
					if(GOOD_SPOTS.length > 0){
						return GOOD_SPOTS;
					}
					var newTilesToVisit = [];
					tilesToVisit.forEach(function(oneTile){
						newTilesToVisit = newTilesToVisit.concat(makeNextTiles(oneTile.x, oneTile.y));
					});
					tilesToVisit = filterOnlyNewTiles(newTilesToVisit, visitedTiles);
					counter++;
				}
				return;//no good spot for building found
			}
			function is3x3Buidable(x,y){
				for(var a = -1; a < 2; a++){
					for(var b = -1; b < 2; b++){
						if(!scope.positionIsPathable(x + a, y + b)){
							return false;
						}
						if(scope.fieldIsRamp(x + a, y + b)){
							return false;
						}
						var tile = {x: x+a, y: y+b};
						if(DATA.BUILDED[tileId(tile)]){
							return false;
						}
					}
				}
				return true;
			}
			function filterOnlyNewTiles(newTiles, visitedTiles){
				return newTiles.filter(function(oneTile){
					return !visitedTiles[tileId(oneTile)];
				});
			}
			return{
				init:init,
				makeMove:makeMove
			};
		})();
		scope['BOT-' + me].init();
	}else{
		scope['BOT-' + me].makeMove();
	}
}catch(Pokemon){
	console.log(Pokemon);
}