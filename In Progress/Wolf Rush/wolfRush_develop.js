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
					//console.log('First Mine is at '+DATA.MINES[0].getX()+';'+DATA.MINES[0].getY());
					//console.log('First Castle is at '+DATA.START_CASTLE[0].getX()+';'+DATA.START_CASTLE[0].getY());
					firstCommand();
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
			function firstCommand(){
				var allWorkers = scope.getUnits({type: "Worker", player: me});
				var closestMine = DATA.MINES[0];
				scope.order("Mine", allWorkers, {unit: closestMine});
				scope.order("Moveto", DATA.START_CASTLE, {unit: closestMine});
			}
			function distance(x1, y1, x2, y2){
				return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
			}
			function makeMove(){
				try{
					//console.log('makeMove '+DATA.GOALS[DATA.FLAGS.length]);
					DATA.BUILDED = markBuildingTiles();
					switch(DATA.GOALS[DATA.FLAGS.length]){
					case 'First House':
						buildFirstHouse();
						break;
					case 'Forward Workers':
						sendWorkerForward();
						giveWorkToIdleWorkders();
						break;
					case 'First Double Den':
						buildFirstDen();
						giveWorkToIdleWorkders();
						break;
					case 'Post Rush':
						produceWolfs();
						produceWorders();
						attack();
						postRush();
						break;
					case 'End Game':
						produceWolfs();
						produceWorders();
						attack();
						giveWorkToIdleWorkders();
						makeHouseIfNeeded();
						//makeDenIfPossible();
					}
					/*
					sendWorkerForward();
					buildFirstHouse();
					produceWorders();
					buildFirstDen();
					produceWolfs();
					attack();
					postRush();
					endGame();
					*/
					//sayWhereIsWorker();
				}catch(Pokemon){
					console.log('Error during makeMove:\n'+Pokemon);
				}
			}
			function markBuildingTiles(){
				var CACHE = {};
				//use tileId(tile)
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
			}/*
			function findClosestWorkerToEnemy(targetBase){
				//find closest worker
				var maxDistance;
				var allWorkers = scope.getUnits({type: "Worker", player: me});
				var closestWorker;
				for(var i = 0, max = allWorkers.length; i < max; i++){
					var oneWorker = allWorkers[i];
					var hisCenter = scope.getCenterOfUnits([oneWorker]);
					var hisDistance = distance(hisCenter.x, hisCenter.y, targetBase.x, targetBase.y);
					if(!maxDistance){
						maxDistance = hisDistance;
						closestWorker = oneWorker;
						continue;
					}
					if(hisDistance < maxDistance){
						maxDistance = hisDistance;
						closestWorker = oneWorker;
					}
				}
				return closestWorker;
			}*/
			function buildFirstHouse() {
				var houses = scope.getBuildings({type:"House", player: me});
				if(houses.length > 0){//we are already building house
					DATA.FLAGS.push('First House');
					scope.chatMsg('Making first house.');
					return;
				}
				var allWorkers = scope.getUnits({type: "Worker", player: me});
				var mineLocation = {
					x: Math.round(DATA.MINES[0].getX()),
					y: Math.round(DATA.MINES[0].getY())
				};
				var houseLocation;
				if(scope.getGold() == 115 ){
					houseLocation = findNearestSpotFor3x3Building(mineLocation);
					if(houseLocation){
						scope.order("Move",[allWorkers[0]], houseLocation);
					}else{
						scope.order("Move",[allWorkers[0]],{x: DATA.START_LOCATION.x, y:DATA.START_LOCATION.y+4});
					}
				}
				if(scope.getGold() < 120){
					return;
				}
				houseLocation= findNearestSpotFor3x3Building(mineLocation);
				if(houseLocation){
					scope.order("Build House",[allWorkers[0]], houseLocation);
					console.log('Building house at ['+houseLocation.x+';'+houseLocation.y+']');
				}else{
					scope.order("Build House",[allWorkers[0]],{x: DATA.START_LOCATION.x, y:DATA.START_LOCATION.y+4});
				}
				scope.order("Mine", [allWorkers[0]], {unit: DATA.MINES[0]}, true);
			}
			function sendWorkerForward(){
				var allWorkers = scope.getUnits({type: "Worker", player: me});
				//DATA.ENEMY_LOCATION
				var availableDuo = [];
				for(var i = 0; i < allWorkers.length; i++){
					var oneWorker = allWorkers[i];
					var currentOrder = oneWorker.getCurrentOrderName();
					if(currentOrder == 'Repair'){
						continue;
					}
					availableDuo.push(oneWorker);
					if(availableDuo.length == 2){
						break;
					}
				}
				//var targetBase = scope.getStartLocationForPlayerNumber(enemy);
				scope.order("AMove", availableDuo, DATA.ENEMY_LOCATION);
				scope.chatMsg('Sending worker forward.');
				DATA.FLAGS.push('Forward Workers');
			}
			function produceWorders(){
				if(scope.getGold() < 50){
					return;
				}
				var miners = scope.getUnits({type: "Worker", player: me, order: "Mine"});
				if(miners.length >= 10){
					return;
				}

				var castles = scope.getBuildings({type:"Castle", player: me, onlyFinshed: true});
				var availableSupply = scope.getMaxSupply() - scope.getCurrentSupply();
				for(var i = 0, max = castles.length; i < max; i++){
					var oneCastle = castles[i];
					var inQueue = oneCastle.getUnitTypeNameInProductionQueAt(1);
					if(!inQueue && availableSupply > 2){
						availableSupply--;
						scope.order("Train Worker", [oneCastle]);
						scope.chatMsg('Training a worker');
					}
				}
			}
			function buildFirstDen(){
				var dens = scope.getBuildings({type:"Wolves Den", player: me});
				if(dens.length > 1){
					DATA.FLAGS.push('First Double Den');
					scope.chatMsg('Making double den.');
					console.log('Rush Time = '+scope.getCurrentGameTimeInSec());
					return;
				}
				if(dens.length == 1){
					makeSecondDenAnyway();
					return;
				}
				var houses = scope.getBuildings({type:"House", player: me, onlyFinshed: true});
				if(houses.length > 0 && scope.getGold() >= 200){
					var forwarders = scope.getUnits({type: "Worker", player: me, order:"AMove"});
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
					var secondCoordinates = {
						x : Math.round(forwarders[1].getX()),
						y : Math.round(forwarders[1].getY())
					};
					var secondDenSpot = findNearestSpotFor3x3Building(secondCoordinates);
					console.log('First Den at ['+firstDenSpot.x+';'+firstDenSpot.y+']');
					console.log('Second Den at ['+secondDenSpot.x+';'+secondDenSpot.y+']');
					scope.order("Build Wolves Den",[forwarders[0]],firstDenSpot);
					//scope.order("Build Wolves Den",[forwarders[0]],{x: forwarders[0].getX()-4, y:forwarders[0].getY()+1});
					scope.order("Build Wolves Den",[forwarders[1]],secondDenSpot);
					//scope.order("Build Wolves Den",[forwarders[1]],{x: forwarders[1].getX()+2, y:forwarders[1].getY()+2});
					scope.order("AMove", forwarders, DATA.ENEMY_LOCATION, true);
				}
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
			function produceWolfs(){
				var allMoney = scope.getGold();
				var wolfCost = 45;
				var dens = scope.getBuildings({type:"Wolves Den", player: me, onlyFinshed: true});
				if(!dens.length){
					return;
				}
				var availableSupply = scope.getMaxSupply() - scope.getCurrentSupply();
				for(var i = 0, max = dens.length; i < max; i++){
					var oneDen = dens[i];
					var inQueue = oneDen.getUnitTypeNameInProductionQueAt(1);
					if(!inQueue && allMoney >= wolfCost && availableSupply > 1){
						availableSupply -= 2;
						scope.order("Train Wolf", [oneDen]);
						allMoney -= wolfCost;
					}
				}
			}
			function attack(){
				var fightingUnits = scope.getUnits({notOfType: "Worker"});
				if(!fightingUnits.length){return;}
				//var targetBase = scope.getStartLocationForPlayerNumber(enemy);
				scope.order("AMove", fightingUnits, DATA.ENEMY_LOCATION);
			}
			function postRush(){
				var dens = scope.getBuildings({type:"Wolves Den", player: me, onlyFinshed: true});
				if(dens.length > 1){
					DATA.FLAGS.push('Post Rush');
					scope.chatMsg('Entering end game.');
				}
			}
			function giveWorkToIdleWorkders(){
				var idleWorkders = scope.getUnits({type: "Worker", player: me, order: "Stop"});
				if(idleWorkders.length > 0){
					scope.order("Mine",idleWorkders,{unit: DATA.MINES[0]});
				}
			}
			function makeHouseIfNeeded(){
				if(scope.getGold() < 100){return;}
				var finishedHouses = scope.getBuildings({type:"House", player: me, onlyFinshed: true});
				var allHouses = scope.getBuildings({type:"House", player: me});
				if(allHouses.length > finishedHouses.length){return;}
				var availableSupply = scope.getMaxSupply() - scope.getCurrentSupply();
				var allCastles = scope.getBuildings({type:"Castle", player: me, onlyFinshed: true});
				var allDens = scope.getBuildings({type:"Wolves Den", player: me, onlyFinshed: true});
				availableSupply -= 2*(allCastles.length + 2 * allDens.length);
				if(availableSupply <= 0){
					var houseLocation = findNearestSpotFor3x3Building(DATA.START_LOCATION);
					var allWorkers = scope.getUnits({type: "Worker", player: me, order:"Mine"});
					if(houseLocation){
						scope.order("Build House",[allWorkers[0]], houseLocation);
						console.log('Building house at ['+houseLocation.x+';'+houseLocation.y+']');
					}else{
						console.log('no location for house');
					}
				}
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
			function makeNextTiles(tileX,tileY){
				var newTiles = [];
				if(tileY > 2){
					newTiles.push({x: tileX, y:tileY - 1});
				}
				if(scope.getMapHeight() - 2 > tileY){
					newTiles.push({x: tileX, y:tileY + 1});
				}
				if(tileX > 2){
					newTiles.push({x: tileX - 1, y:tileY});
				}
				if(scope.getMapWidth() - 2 > tileX){
					newTiles.push({x: tileX + 1, y:tileY});
				}
				return newTiles;
			}
			function filterOnlyNewTiles(newTiles, visitedTiles){
				return newTiles.filter(function(oneTile){
					return !visitedTiles[tileId(oneTile)];
				});
			}/*
			function addTilesToVisited(newTiles, visitedTiles){
				newTiles.forEach(function(oneTile){
					visitedTiles[tileId(oneTile)] = true;
				});
			}*/
			function tileId(tile){
				return 'x'+tile.x+'y'+tile.y;
			}

			function findNearestSpotFor3x3Building(startLocation){
				// we make empty cache of visited tiles
				var CACHE = {};
				// cache tiles where is mine
				var mX = DATA.MINES[0].getX() - 1.5;
				var mY = DATA.MINES[0].getX() - 1.5;
				for(var a = 0; a < 4; a++){
					for(var b = 0; b < 4; b++){
						var mineId = tileId({x:mX+a,y:mY+b});
						CACHE[mineId] = true;
					}
				}
				var middleX = Math.round((DATA.MINES[0].getX() + DATA.START_CASTLE[0].getX())/2);
				var middleY = Math.round((DATA.MINES[0].getY() + DATA.START_CASTLE[0].getY())/2);
				for(var c = -2; c < 3;c++){
					for(var d = -2; d < 3; d++){
						CACHE[tileId({x:middleX+c,y:middleY+d})] = true;
					}
				}
				var goodSpots = spotSearch(makeNextTiles(startLocation.x,startLocation.y), CACHE);
				if(goodSpots){
					var randomTileNumber = Math.floor(Math.random()*goodSpots.length);
					return goodSpots[randomTileNumber];
				}else{
					console.log('no good spot found');
				}
			}

			function spotSearch(tilesToVisit, visitedTiles){
				var GOOD_SPOTS = [];
				var counter = 0;
				while(GOOD_SPOTS.length == 0 && counter < 30){
					tilesToVisit.forEach(function(oneTile){
						visitedTiles[tileId(oneTile)] = true;
						if(is3x3Buidable(oneTile.x, oneTile.y)){
							GOOD_SPOTS.push(oneTile);
						}else{
							//console.log('bad spot');
						}
					});
					if(GOOD_SPOTS.length > 0){
						//console.log('FOUND GOOOOOD SPOTS');
						//console.log(GOOD_SPOTS);
						return GOOD_SPOTS;
					}
					var newTilesToVisit = [];
					tilesToVisit.forEach(function(oneTile){
						newTilesToVisit = newTilesToVisit.concat(makeNextTiles(oneTile.x, oneTile.y));
					});
					tilesToVisit = filterOnlyNewTiles(newTilesToVisit, visitedTiles);
					counter++;
				}
				console.log('NOWHERE TO BUILD!');
				return;
			}

			function makeDenIfPossible(){
				if(scope.getGold() < 110){return;}
				var finishedDens = scope.getBuildings({type:"Wolves Den", player: me, onlyFinshed: true});
				var allDens = scope.getBuildings({type:"Wolves Den", player: me});
				if(allDens.length > finishedDens.length){return;}
				if(allDens.length > 2){return;}
				var denLocation = findNearestSpotFor3x3Building(DATA.START_LOCATION);
				var allWorkers = scope.getUnits({type: "Worker", player: me, order:"Mine"});
				if(denLocation){
					scope.order("Build Wolves Den",[allWorkers[0]], denLocation);
					console.log('Building Den at ['+denLocation.x+';'+denLocation.y+']');
					scope.order("Mine", [allWorkers[0]], {unit: DATA.MINES[0]}, true);
				}
			}/*
			function sayWhereIsWorker(){
				var targetBase = scope.getStartLocationForPlayerNumber(enemy);
				var closestWorker = findClosestWorkerToEnemy(targetBase);
				var x = closestWorker.getX();
				var y = closestWorker.getY();
				scope.chatMsg('Worker at ['+x+', '+y+']');
			}*/
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