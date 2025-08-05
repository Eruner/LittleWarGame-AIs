var scope = scope || null;
try{
	if(!scope){
		console.log('Scope is not initialized');
		return;
	}
	var me = scope.getMyPlayerNumber();
	//var enemy = me % 2 + 1;
	if(!scope['BOT-' + me]){
		scope['BOT-' + me] = (function(){
			var DATA;
			function init() {
				try{
					DATA = {FLAGS:[]};
					DATA.START_CASTLE = scope.getBuildings({type:"Castle", player: me, onlyFinshed: true})[0];
					DATA.MINES = sortMinesByDistance(DATA.START_CASTLE);
					DATA.FORTRESS = scope.getBuildings({type:"Fortress of the King", player: me, onlyFinshed: true})[0];
					everybodyGoesTotheirMine();
					rallyToNextMine();
					//console.log(DATA.FORTRESS);
					DATA.TECH = {
						"Increase Wolf Rate" : [100, 2],
						"Increase Snake Rate" : [125, 4],
						"Increase Soldier Rate" : [200, 8],
						"Increase Archer Rate" : [200, 8],
						"Increase Gyrocraft Rate" : [250, 12],
						"Increase Mage Rate" : [300, 18],
						"Increase Priest Rate" : [350, 25],
						"Increase Knight Rate" : [400, 32],
						"Increase Werewolf Rate" : [500, 50],
						"Increase Dragon Rate" : [500, 50],
						"Increase Ballista Rate" : [500, 50],
						"Increase Catapult Rate" : [600, 80]
					};
				}catch(Pokemon){
					console.log('Error during init:\n'+Pokemon);
				}
			}
			function makeMove(){
				try{
					observe();
					researchGyrocrafts();
				}catch(Pokemon){
					console.log('Error during makeMove:\n'+Pokemon);
				}
			}
			function observe(){
				DATA.GOLD = scope.getGold();
			}
			/********** BUILD ORDER **********/
			function sortMinesByDistance(targetLocation){
				var allMines = scope.getBuildings({type: "Goldmine"});
				var setOfMines = {};
				for(var i = 0, max = allMines.length; i < max; i++){
					var oneMine = allMines[i];//scope.getGroundDistance does not work
					var hisDistance = distance(oneMine.getX(), oneMine.getY(), targetLocation.getX(), targetLocation.getY());
					if(hisDistance > 20){
						continue;
					}
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
			function everybodyGoesTotheirMine(){
				DATA.CURRENT_MINE = 0;
				var allWorkers = scope.getUnits({type: "Worker", player: me});
				for(var i = 0, max = allWorkers.length; i < max; i++){
					var oneWorker = allWorkers[i];
					DATA.CURRENT_MINE = i % DATA.MINES.length;
					var targetMine = DATA.MINES[DATA.CURRENT_MINE];
					scope.order("Mine", [oneWorker], {unit: targetMine});
				}
			}
			function rallyToNextMine(){
				DATA.CURRENT_MINE = (DATA.CURRENT_MINE + 1) % DATA.MINES.length;
				var targetMine = DATA.MINES[DATA.CURRENT_MINE];
				scope.order("Moveto", DATA.START_CASTLE, {unit: targetMine});
			}
			/********** ADVANCE **********/
			function researchGyrocrafts() {
				if(DATA.GOLD >= DATA.TECH["Increase Gyrocraft Rate"][0]){
					scope.order("Increase Gyrocraft Rate" ,[DATA.FORTRESS]);
					DATA.TECH["Increase Gyrocraft Rate"][0] += DATA.TECH["Increase Gyrocraft Rate"][1];
					console.log('Increase Gyrocraft Rate');
				}
			}
			/********** MATH MAGIC **********/
			function distance(x1, y1, x2, y2){
				return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
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