{
/* FOR EACH BUILDING IN THIS ARRAY */
	var unit = '[object Object]';
	var equals = function(a) {
		return a && this.unit == a.unit; };
	var getValue = function(a) {
		return this.unit[a]; };
	var getFieldValue = function(a) {
		return this.unit.type[a]; };
	var getCurrentHP = function() {
		return this.unit.hp; };
	var getX = function() {
		return this.unit.pos.px; };
	var getY = function() {
		return this.unit.pos.py; };
	var getTypeName = function() {
		return this.unit.type.name; };
	var getOwnerNumber = function() {
		return this.unit.owner.number; };
	var getTeamNumber = function() {
		return this.unit.owner.team.number; };
	var getRemainingBuildTime = function() {
		return(this.unit.queue && this.unit.queue[0]) ? (this.unit.queueFinish - ticksCounter) : -1; };
	var getUnitTypeNameInProductionQueAt = function(a) {
		return(this.unit.queue && this.unit.queue[a - 1]) ? this.unit.queue[a - 1].name : null ;};
	var isUnderConstruction = function() {
		return this.unit.isUnderConstruction; };
	var isNeutral = function() {
		return this.unit.owner.team.number === 0; };
	var getCurrentOrderName = function() {
		if(!this.unit.type.isUnit || !this.unit.order) {
			return null ;}
		return this.unit.order.name; }; 
/* UNIVERSAL Function */
	var contains = function(b) {
		for(var a = 0; a < this.length; a++) {
			if(this[a] == b) {
				return true; } }
		return false; };
	var erease = function(b) {
		for(var a = 0; a < this.length; a++) {
			if(this[a] == b) { this.splice(a, 1);
				return true; } 
			}
		return false; }; 
}