var BOT = (function(){

	var DATA,SCOUT,REPORTER,GENERAL,ENFORCER;

	function init(){
		try{
			DATA = {UNITS:{},BUILDINGS:{},SUPPLY:{},FLAGS:{}};
			/* Add TechTree and BuildOrders into DATA */
			SCOUT = new Scout(DATA);
			REPORTER = new Reporter(DATA);
			GENERAL = new General(DATA);
			ENFORCER = new Enforcer(DATA);
		}catch(Pokemon){
			alert('Error in initApp:\n'+Pokemon);
		}
	}

	function makeMove(){
		var end,start = +new Date();
		SCOUT.observe();
		REPORTER.orient();
		GENERAL.decide();
		ENFORCER.act();
		end = +new Date();
		console.log('Step took: '+(end-start)+' milliseconds to execute');
	}

	return{
		init:init,
		makeMove:makeMove
	};
})();
window.addEventListener("load", BOT.init);