/*
		try{
			
		}catch(Pokemon){
			console.log('Error in function_name() :\n'+Pokemon);
		}
*/
function Enforcer(data){

	var DATA = data,allUnits,allBuildings,money,diplom,map,flags=DATA.FLAGS,selectedBase;

	function act(){
		try{
			diplom = DATA.DIPLOMACY;
			allUnits = DATA.UNITS;
			allBuildings = DATA.BUILDINGS;
			money = DATA.MONEY;
			map = DATA.MAP;
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
			if(flags.enemyInBase){
				allInRush();
			}
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
			if(!selectedBase){
				for(var e in diplom.enemies){
					if(diplom.enemies.hasOwnProperty(e)){
						selectedBase = diplom.enemies[e].base;
					}
				}
			}
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
}