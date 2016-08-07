/*
		try{
			
		}catch(Pokemon){
			console.log('Error in function_name() :\n'+Pokemon);
		}
*/
function General(data){

	var DATA = data,buildOrder = DATA.BuildOrder;

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
	};
}