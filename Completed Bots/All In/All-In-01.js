try{
	if(scope.BOT === undefined){
		scope.BOT = (function(){
			var DATA,SCOUT,ENFORCER;
			function init(){
				try{
					DATA = {UNITS:{},BUILDINGS:{},SUPPLY:{}};
					SCOUT=(function(data){var DATA=data,map,money,allUnits=DATA.UNITS,allBuildings=DATA.BUILDINGS,supply=DATA.SUPPLY,diplom=DATA.DIPLOMACY;
								function observe(){
									try{
										if(!map){
											analyzeMap();
											analyzeDiplomacy();
										}
										calculateIncome();
										checkUnits();
									}catch(Pokemon){
										console.log('Error in observe:\n'+Pokemon);
									}
								}
								function analyzeMap(){
									try{
										map = {};
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
								return{
									observe:observe
								};})(DATA);
					/*--------------------------------------- */
					ENFORCER = (function(data){var DATA = data,allUnits,diplom,selectedBase;
									function act(){
										try{
											militaryActions();
										}catch(Pokemon){
											console.log('Error in act:\n'+Pokemon);
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