/*
		try{
			
		}catch(Pokemon){
			console.log('Error in function_name() :\n'+Pokemon);
		}
*/
function Reporter(data){

	var DATA = data,allUnits,supply,flags,diplom;

	function orient(){
		try{
			flags = DATA.flags;
			allUnits = DATA.UNITS;
			diplom = DATA.DIPLOMACY;
			money=DATA.MONEY;
			/* Understand raw information into simpler data structure */
			/* That helps with recognizing changes */
			areWeScouting();
			areEnemiesInOurTerritory();
			areEnemiesStrong();
			doWeNeedMoreSupply();
			areWeRich();
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
			supply = DATA.SUPPLY;
			/* check if not max supply */
			var capped = (supply.max == supply.cap),
				overproduce = (supply.current + supply.producing >= supply.max);
			flags.needSupply = (!capped && overproduce);
		}catch(Pokemon){
			console.log('Error in doWeNeedMoreSupply() :\n'+Pokemon);
		}
	}

	function areWeRich() {
		try{
			
		}catch(Pokemon){
			console.log('Error in areWeRich() :\n'+Pokemon);
		}
	}

	return{
		orient:orient
	};
}