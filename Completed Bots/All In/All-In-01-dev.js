try{
	if(scope.BOT === undefined){
		scope.BOT = (function(){
			var DATA,SCOUT,REPORTER,GENERAL,ENFORCER;
			function init(){
				try{
					DATA = {UNITS:{},BUILDINGS:{},SUPPLY:{}};
					/* Add TechTree and BuildOrders into DATA */
					/*--------------------------------------- */
					SCOUT=(function(data){var DATA=data,map,money,allUnits=DATA.UNITS,allBuildings=DATA.BUILDINGS,supply=DATA.SUPPLY,diplom=DATA.DIPLOMACY;
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
										//console.log('[Scout] observed.');
									}catch(Pokemon){
										console.log('Error in observe:\n'+Pokemon);
									}
								}
								function analyzeMap(){
									try{
										map = {};
										/* Analyze Map into walkable/build-able regions */
										/* decide if map is big/med/small, open or with obstacles */
										/* also if there are plenty resources, medium or scarce */
										/* Store where is Home Location and give it a radius */
										DATA.MAP = map;
									}catch(Pokemon){
										console.log('Error in analyzeMap() :\n'+Pokemon);
									}
								}
								function analyzeDiplomacy() {
									try{
										diplom = {};
										diplom.myNumber = scope.getMyPlayerNumber();
										diplom.myTeam = scope.getMyTeamNumber();
										diplom.myBase = scope.getStartLocationForPlayerNumber(diplom.myNumber);
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
											}
										}
										DATA.DIPLOMACY = diplom;
									}catch(Pokemon){
										console.log('Error in analyzeDiplomacy() :\n'+Pokemon);
									}
								}
								function calculateIncome(){
									try{
										if(!money){
											/* Initialize data structure for calculating income between steps */
											money = {};
											/* Result will be used for Measurement */
											DATA.MONEY = money;
										}else{
											/* Calculate Raw income, current gold, spendings, average on last 10 seconds */
										}
									}catch(Pokemon){
										console.log('Error in calculateIncome() :\n'+Pokemon);
									}
								}
								function checkUnits() {
									try{
										/* for all players 
												count (non)military units into good data structure
										*/
										allUnits.myWorkers = scope.getUnits({player:diplom.me,type:"Worker"});
										//console.log("My workers: "+JSON.stringify(allUnits.myWorkers));
										allUnits.myArmy = scope.getUnits({player:diplom.me,notOfType:"Worker"});
										/* Our Units - alive and training */
									}catch(Pokemon){
										console.log('Error in checkUnits() :\n'+Pokemon);
									}
								}
								function checkBuildings(allBuildings) {
									try{
										/* for all players 
												count buildings into good data structure
										*/
										/* Our Buildings - completed and in-progress */
									}catch(Pokemon){
										console.log('Error in checkBuildings() :\n'+Pokemon);
									}
								}
								function checkSupply() {
									try{
										/* 
											supply.current = 0;
											supply.available = 0;
											supply.producing = 0;
										 */
									}catch(Pokemon){
										console.log('Error in checkSupply() :\n'+Pokemon);
									}
								}
								return{
									observe:observe
								};})(DATA);
					/*--------------------------------------- */
					REPORTER= (function(data){var DATA = data,allUnits = DATA.UNITS,supply = DATA.SUPPLY;
								function orient(){
									try{
										/* Understand raw information into simpler data structure */
										/* That helps with recognizing changes */
										areWeScouting();
										areEnemiesInOurTerritory();
										areEnemiesStrong();
										doWeNeedMoreSupply();
										//console.log('[Reporter] oriented');
									}catch(Pokemon){
										console.log('Error in orient:\n'+Pokemon);
									}
								}

								function areWeScouting() {
									try{
										/* how many assigned scouts ? */
										/* is enemy explored (first scouting,location) ? */
										/* currentScout.currentRegion is safe ? */
									}catch(Pokemon){
										console.log('Error in areWeScouting() :\n'+Pokemon);
									}
								}

								function areEnemiesInOurTerritory(){
									try{
										//console.log('All Units:\n'+JSON.stringify(allUnits));
									}catch(Pokemon){
										console.log('Error in areEnemiesInOurTerritory() :\n'+Pokemon);
									}
								}

								function areEnemiesStrong(){
									try{
										/* if there are more enemies than threshold */
										/* if it's dangerous outside */
									}catch(Pokemon){
										console.log('Error in areEnemiesStrong() :\n'+Pokemon);
									}
								}

								function doWeNeedMoreSupply() {
									try{
										/* check if not max supply */
										/* check if next production is possible */
										/* supply.needSupply = true;//or false */
									}catch(Pokemon){
										console.log('Error in doWeNeedMoreSupply() :\n'+Pokemon);
									}
								}

								return{
									orient:orient
								};})(DATA);
					/*--------------------------------------- */
					GENERAL= (function(data){var DATA = data,globalMap = DATA.MAP,buildOrder = DATA.BuildOrder;
								function decide(){
									try{
										/* Chose combat strategy, build order, behavior */
										if(!buildOrder){
											chooseBuildOrder();
										}
										makeMilitaryCommands();
										makeEconomyCommands();
									}catch(Pokemon){
										console.log('Error in decide:\n'+Pokemon);
									}
								}
								function chooseBuildOrder() {
									try{
										buildOrder = {};
										/* Depends on Map Analysis and current resources */
										DATA.BuildOrder = buildOrder;
									}catch(Pokemon){
										console.log('Error in chooseBuildOrder() :\n'+Pokemon);
									}
								}
								function makeMilitaryCommands() {
									try{
										/* Chose if Attack, Retreat or Defend */
										/* And where (on map/region) to focus */
									}catch(Pokemon){
										console.log('Error in makeMilitaryCommands() :\n'+Pokemon);
									}
								}
								function makeEconomyCommands() {
									try{
										/* Depends on buildOrder and current status */
										/* results is priority list of Build / Train / Research tasks */
									}catch(Pokemon){
										console.log('Error in makeEconomyCommands() :\n'+Pokemon);
									}
								}
								return{
									decide:decide
								};})(DATA);
					/*--------------------------------------- */
					ENFORCER = (function(data){var DATA = data,allUnits,diplom,selectedBase;
									function act(){
										try{
											/* Chose execute commands in effective way, micro units, place buildings */
											scoutingActions();
											militaryActions();
											economyActions();
										}catch(Pokemon){
											console.log('Error in act:\n'+Pokemon);
										}
									}
									function scoutingActions() {
										try{

										}catch(Pokemon){
											console.log('Error in scoutingActions() :\n'+Pokemon);
										}
									}
									function militaryActions() {
										try{
											/* HARDCODE - Villager ALL-IN Rush */
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
											console.log('Error in militaryActions() :\n'+Pokemon);
										}
									}
									function economyActions() {
										try{
											/* make a list of available workers, list of tasks, resources */
											/* while (enough resources and enough workers) 
													if task is not being executed
														execute Build Order task 
														(assign a worker to that task)
														subtract resources from pool
												assign remaining workers to jobs
													if not jet doing their job
											 */
										}catch(Pokemon){
											console.log('Error in economyActions() :\n'+Pokemon);
										}
									}
									return{
										act:act
									};})(DATA);
					/*--------------------------------------- */
				}catch(Pokemon){
					console.log('Error in initApp:\n'+Pokemon);
				}
			}

			function makeMove(){
				SCOUT.observe();
				REPORTER.orient();
				GENERAL.decide();
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