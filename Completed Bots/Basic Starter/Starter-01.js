try{
	if(scope.BOT === undefined){
		scope.BOT = (function(){
			var DATA,SCOUT,REPORTER,ENFORCER;
			function init(){
				try{
					DATA = {UNITS:{},BUILDINGS:{},SUPPLY:{},FLAGS:{}};
					/*--------------------------------------- */
					SCOUT = (function(data){
						var DATA=data,map,money,allUnits=DATA.UNITS,allBuildings=DATA.BUILDINGS,supply=DATA.SUPPLY,diplom=DATA.DIPLOMACY;
						function observe(){
							try{
								/* Fill Up Data Structures with raw information, map/units/buildings/diplomacy */
								if(!map){
									analyzeDiplomacy();
									analyzeMap();
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
					})(DATA);
					/*--------------------------------------- */
					REPORTER = (function(data){
						var DATA = data,allUnits,supply=DATA.SUPPLY,flags=DATA.FLAGS,diplom;
						function orient(){
							try{
								/* Understand raw information into simpler data structure */
								/* That helps with recognizing changes */
								diplom = DATA.DIPLOMACY;
								areEnemiesInOurTerritory();
								doWeNeedMoreSupply();
							}catch(Pokemon){
								console.log('Error in orient:\n'+Pokemon);
							}
						}
						function areEnemiesInOurTerritory(){
							var enemies = diplom.enemies,epn,en,i,j,d,dist=DATA.MAP.distance,unit,
								bx = diplom.myBase.x,by=diplom.myBase.y,closeDistance = 7, mediumDistance = 20;
							try{
								//iterate through each enemy unit
								//check their distance to base
								flags.enemyAround = false;
								flags.enemyInBase = false;
								for(epn in enemies){
									if(enemies.hasOwnProperty(epn)){
										en = enemies[epn];
										for(i=0,j=en.workers.length;i<j;i++){
											unit = en.workers[i];
											d = dist(unit.getX(),unit.getY(),bx,by);
											if(d<=mediumDistance){
												flags.enemyAround = true;
												if(d<=closeDistance){
													flags.enemyInBase = true;
													return;
												}
											}
										}
										for(i=0,j=en.army.length;i<j;i++){
											unit = en.army[i];
											d = dist(unit.getX(),unit.getY(),bx,by);
											if(d<=mediumDistance){
												flags.enemyAround = true;
												if(d<=closeDistance){
													flags.enemyInBase = true;
													return;
												}
											}
										}
									}
								}
							}catch(Pokemon){
								console.log('Error in areEnemiesInOurTerritory() :\n'+Pokemon);
							}
						}
						function doWeNeedMoreSupply() {
							try{
								var capped = (supply.max == supply.cap),
									overproduce = (supply.current + supply.producing >= supply.max);
								flags.needSupply = (!capped && overproduce);
							}catch(Pokemon){
								console.log('Error in doWeNeedMoreSupply() :\n'+Pokemon);
							}
						}
						return{
							orient:orient
						};
					})(DATA);
					/*--------------------------------------- */
					ENFORCER = (function(data){
						var DATA = data,allUnits,allBuildings,money,diplom,map,flags=DATA.FLAGS,selectedBase;
						function act(){
							try{
								diplom = DATA.DIPLOMACY;
								allUnits = DATA.UNITS;
								allBuildings = DATA.BUILDINGS;
								money = DATA.MONEY;
								map = DATA.MAP;
								/* Chose execute commands in effective way, micro units, place buildings */
								militaryActions();
								economyActions();
							}catch(Pokemon){
								console.log('Error in act:\n'+Pokemon);
							}
						}
						function militaryActions() {
							try{
								/* HARDCODE - Villager ALL-IN Rush */
								//flags.enemyAround;
								if(flags.enemyInBase){
									allInRush();
								}
							}catch(Pokemon){
								console.log('Error in militaryActions() :\n'+Pokemon);
							}
						}
						function economyActions() {
							try{
								trainWorker();
								assignIdleWorkersToGoldmines();
							}catch(Pokemon){
								console.log('Error in economyActions() :\n'+Pokemon);
							}
						}
						function assignIdleWorkersToGoldmines(){
							var iddlers = [],allWorkers = allUnits.myWorkers,base,gm,baseMines = diplom.BaseMines,gms,
								g_w={},i=0,j,fewestNumber,fewestGM;
							try{
								for(j=allWorkers.length;i<j;i++){
									if(allWorkers[i].unit.order.name==="Stop"){
										iddlers.push(allWorkers[i]);
									}
								}
								if(iddlers.length > 0){
									for(base in baseMines){
										if(baseMines.hasOwnProperty(base)){
											gms = baseMines[base];//list of gold mines
											for(i=0,j=gms.length;i<j;i++){
												gm = gms[i];//id of GoldMine
												g_w[gm] = map.GoldWorkers[gm];
											}
										}
									}
									for(i=0,j=iddlers.length;i<j;i++){
										//find with fewest number
										fewestNumber=47;
										for(gm in g_w){
											if(g_w.hasOwnProperty(gm)){
												if(g_w[gm] < fewestNumber){
													fewestNumber = g_w[gm];
													fewestGM = gm;
												}
											}
										}
										if(!fewestGM){return;}
										// -> add Worker to it
										map.GoldWorkers[fewestGM]++;
										g_w[fewestGM]++;
										scope.order("Mine", [iddlers[i]], {unit: map.GOLDMINES[fewestGM]});
									}
								}
							}catch(Pokemon){
								console.log('Error in assignIdleWorkersToGoldmines() :\n'+Pokemon);
							}
						}
						function allInRush(){
							try{
								diplom=DATA.DIPLOMACY;
								if(!selectedBase){
									for(var e in diplom.enemies){
										if(diplom.enemies.hasOwnProperty(e)){
											selectedBase = diplom.enemies[e].base;
										}
									}
								}
								allUnits = DATA.UNITS;
								scope.order("AMove",allUnits.myWorkers,selectedBase);
								scope.order("AMove",allUnits.myArmy,selectedBase);
							}catch(Pokemon){
								console.log('Error in allInRush() :\n'+Pokemon);
							}
						}
						function trainWorker(){
							try{
								var castles = allBuildings.bases,credit=money.previous;
								for(var i=0,j=castles.length;credit>=50 && i<j;i++){
									if(!castles[i].getUnitTypeNameInProductionQueAt(1)){
										scope.order("Train Worker",[castles[i]]);
										credit -= 50;
									}
								}
								money.previous = credit;
							}catch(Pokemon){
								console.log('Error in trainWorker() :\n'+Pokemon);
							}
						}
						return{
							act:act
						};
					})(DATA);
					/*--------------------------------------- */
				}catch(Pokemon){
					console.log('Error in initApp:\n'+Pokemon);
				}
			}
			function makeMove(){
				SCOUT.observe();
				REPORTER.orient();
				ENFORCER.act();
			}
			return{
				init:init,
				makeMove:makeMove
			};
		})();
		scope.BOT.init();
	}else{
		scope.BOT.makeMove();
	}
}catch(Pokemon){
	console.log(Pokemon);
}