/*
		try{
			
		}catch(Pokemon){
			console.log('Error in function_name() :\n'+Pokemon);
		}
*/
function Scout(data){

	var DATA = data,map,money,allUnits = DATA.UNITS,allBuildings = DATA.BUILDINGS,supply = DATA.SUPPLY,diplom=DATA.DIPLOMACY;

	function observe(){
		try{
			/* Fill Up Data Structures with raw information, map/units/buildings/diplomacy */
			if(!map){
				analyzeMap();
				analyzeDiplomacy();
			}
			calculateIncome();
			checkUnits();
			checkBuildings();
			checkSupply();
		}catch(Pokemon){
			console.log('Error in observe:\n'+Pokemon);
		}
	}

	function analyzeDiplomacy(){
		try{
			diplom = {};
			diplom.myNumber = scope.getMyPlayerNumber();
			diplom.myTeam = scope.getMyTeamNumber();
			diplom.myBase = scope.getStartLocationForPlayerNumber(diplom.myNumber);
			if(!diplom.myBase){
				var myCastle = scope.getBuildings({player:diplom.myNumber,type:"Castle"})[0];
				diplom.myBase = {x:myCastle.getX(),y:myCastle.getY()};
			}
			var mapHeight=scope.getMapHeight(),mapWidth=scope.getMapWidth(),
				guessX=mapWidth-diplom.myBase.x,guessY=mapHeight-diplom.myBase.y;
			diplom.allies = {};
			diplom.enemies = {};
			var allPlayers = scope.getArrayOfPlayerNumbers(),playerNr,playerTeam,player;
			for(var i=0,j=allPlayers.length;i<j;i++){
				playerNr = allPlayers[i];
				if(playerNr != diplom.myNumber){
					playerTeam = scope.getTeamNumber(playerNr);
					if(playerTeam == diplom.myTeam){
						diplom.allies[playerNr] = {};
						player = diplom.allies[playerNr];
					}else{
						diplom.enemies[playerNr] = {};
						player = diplom.enemies[playerNr];
					}
					player.base = scope.getStartLocationForPlayerNumber(playerNr);
					if(!player.base){
						player.base = {x:guessX,y:guessY};
					}
					player.goldmines = [];
				}
			}
			DATA.DIPLOMACY = diplom;
		}catch(Pokemon){
			console.log('Error in analyzeDiplomacy() :\n'+Pokemon);
		}
	}

	function analyzeMap(){
		try{
			map = {GOLDMINES:{}};
			map.distance = function(x1, y1, x2, y2){
				return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
			};
			DATA.MAP = map;
			supply.cap = scope.player.supplyCap;
			/* Analyze Map into walkable/build-able regions */
			/* decide if map is big/med/small, open or with obstacles */
			/* also if there are plenty resources, medium or scarce */
			/* Store where is Home Location and give it a radius */
			analyzeGoldMines(scope.getBuildings({type:"Goldmine"}));
		}catch(Pokemon){
			console.log('Error in analyzeMap() :\n'+Pokemon);
		}
	}

	function analyzeGoldMines(allGoldMines) {
		try{
			var gm,gmu,gms=map.GOLDMINES,myGM,myGMid,baseX=diplom.myBase.x,baseY=diplom.myBase.y;
			diplom.myGoldMines = [];
			diplom.BaseMines = {};
			map.GoldWorkers = {};
			for(var i=0,j=allGoldMines.length;i<j;i++){
				gm = allGoldMines[i];
				myGM = {};
				myGM.x = gm.getX();
				myGM.y = gm.getY();
				gmu = gm.unit;
				myGM.unit = gmu;
				myGM.gold = gmu.gold;
				myGMid = gmu.id;
				myGM.id = myGMid;
				myGM.distance = map.distance(myGM.x,myGM.y,baseX,baseY);
				myGM.player = findClosestPlayer(myGM.x,myGM.y,myGM.distance,myGMid);
				gms[myGMid] = myGM;
			}
		}catch(Pokemon){
			console.log('Error in analyzeGoldMines() :\n'+Pokemon);
		}
	}

	function findClosestPlayer(x,y,defaultDistance,id){
		var currentDistance,closesDistance = defaultDistance,closestPlayer = diplom.myNumber,playerNum,playerBase,winner="me";
		try{
			for(playerNum in diplom.allies){
				if(diplom.allies.hasOwnProperty(playerNum)){
					playerBase = diplom.allies[playerNum].base;
					currentDistance = map.distance(x,y,playerBase.x,playerBase.y);
					if(currentDistance < closesDistance){
						closesDistance = currentDistance;
						closestPlayer = playerNum;
						winner = "ally";
					}
				}
			}
			for(playerNum in diplom.enemies){
				if(diplom.enemies.hasOwnProperty(playerNum)){
					playerBase = diplom.enemies[playerNum].base;
					currentDistance = map.distance(x,y,playerBase.x,playerBase.y);
					if(currentDistance < closesDistance){
						closesDistance = currentDistance;
						closestPlayer = playerNum;
						winner = "enemy";
					}
				}
			}
			switch(winner){
				case "me":
					diplom.myGoldMines.push(id);
					map.GoldWorkers[id] = 0;
					if(closesDistance < 15){
						diplom.BaseMines[diplom.myBase] = diplom.BaseMines[diplom.myBase] || [];
						diplom.BaseMines[diplom.myBase].push(id);
					}
					break;
				case "ally":
					diplom.allies[closestPlayer].goldmines.push(id);
					break;
				case "enemy":
					diplom.enemies[closestPlayer].goldmines.push(id);
					break;
			}
		}catch(Pokemon){
			console.log('Error in findClosestPlayer() :\n'+Pokemon);
		}
		return closestPlayer;
	}

	function calculateIncome(){
		try{
			if(!money){
				/* Initialize data structure for calculating income between steps */
				money = {};
				money.previous = scope.getGold();
				money.incomeHistory = [];
				money.totalHistory = [];
				/* Result will be used for Measurement */
				DATA.MONEY = money;
			}
			/* Calculate Raw income, current gold, spendings, average on last 10 seconds */
			money.now = scope.getGold();
			money.income = money.now - money.previous;
			money.incomeHistory.push(money.income);
			money.totalHistory.push(money.now);
			money.previous = money.now;
		}catch(Pokemon){
			console.log('Error in calculateIncome() :\n'+Pokemon);
		}
	}

	function checkUnits(){
		var ens = diplom.enemies,en,epn,als=diplom.allies,al,aln;
		try{
			for(epn in ens){
				if(ens.hasOwnProperty(epn)){
					en = ens[epn];
					en.workers = scope.getUnits({player:epn,type:"Worker"});
					en.army = scope.getUnits({player:epn,notOfType:"Worker"});
				}
			}
			for(aln in als){
				if(als.hasOwnProperty(aln)){
					al = als[aln];
					al.workers = scope.getUnits({player:aln,type:"Worker"});
					al.army = scope.getUnits({player:aln,notOfType:"Worker"});
				}
			}
			allUnits.myWorkers = scope.getUnits({player:DATA.DIPLOMACY.me,type:"Worker"});
			allUnits.myArmy = scope.getUnits({player:DATA.DIPLOMACY.me,notOfType:"Worker"});
		}catch(Pokemon){
			console.log('Error in checkUnits() :\n'+Pokemon);
		}
	}

	function checkBuildings() {
		try{
			/* for all players 
					count buildings into good data structure
			*/
			/* Our Buildings - completed and in-progress */
			console.log('my buildings:'+JSON.stringify(scope.player.buildings));
			allBuildings.bases = scope.getBuildings({player:diplom.myNumber,type:"Castle"});
			allBuildings.rax = scope.getBuildings({player:diplom.myNumber,type:"Barracks"});
			allBuildings.forges = scope.getBuildings({player:diplom.myNumber,type:"Forge"});
		}catch(Pokemon){
			console.log('Error in checkBuildings() :\n'+Pokemon);
		}
	}

	function checkSupply() {
		try{
			supply.current = scope.getCurrentSupply();
			supply.max = scope.getMaxSupply();
			supply.available = supply.max - supply.current;
			supply.producing = 0;
			var bases=allBuildings.bases,raxs=allBuildings.rax;
			for(var a=0,b=bases.length;a<b;a++){
				if(bases[a].getUnitTypeNameInProductionQueAt(1)){
					supply.producing++;
				}
			}
			for(var c=0,d=raxs.length;c<d;c++){
				if(raxs[c].getUnitTypeNameInProductionQueAt(1)){
					supply.producing += 2;
				}
			}
		}catch(Pokemon){
			console.log('Error in checkSupply() :\n'+Pokemon);
		}
	}

	return{
		observe:observe
	};
}