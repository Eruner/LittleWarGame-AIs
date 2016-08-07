## LittleWarGame custom AI Bots
A repository for making AI Bots for a web game [Little War Game](http://www.littlewargame.com/)

### About Game
LWG is a web-based, real-time strategy, where you mine gold, create buildings, create army of Soldiers/Archers/Dragons.. and fight other players online.  

### How to run own AI in LWG game

1. Login to game
2. On top-left corner is `Options` icon (looks like hamburger or 6 squares)
3. In Options click `Load Custom AI`
4. Select a JavaScript file from your computer (location of custom AI)
5. If successfully loaded, click `X`. Otherwise you probably got a syntax error. You can repeat for loading more bots.
6. Click `Play vs CPU` and select preferred map
7. Add/Drag&Move/Remove players as you wish and click `Start` button
8. Enjoy battle

### How to develop your own bot
* You will need just Text Editor for writing, I recommend [Notepad++](https://notepad-plus-plus.org/) or [Sublime Text](https://www.sublimetext.com/)
* Read official article - [The Littlewargame AI API](http://littlewargame.com/blog/tag/ai/)
* (Optionally) Use [JSHint](http://jshint.com/) for fixing Javascript syntax errors
* (Optionally) Desire to write bot that will defeat other AIs or even yourself

### How to contribute
Here are a few ways you can contribute or compete:
* Copy and continue from one of Completed Bots
* Upload your unique bot. (so people can fight your bot or make AI duels to see which one is better)
* Complete some of TODOs listed below

### TODO List
* **[Tool]** Make output function that will print DATA.MONEY into console, in format which is usefull for statistics (e.g. gold per second, per game...). Modify `calculateIncome()` function if needed.
* **[Feature]** Implement `areEnemiesStrong()` function, which will create/set a Flag to true, when AI sees (way) more enemy military units than it owns. This flag will be used by General to choose attack/defend strategy.
* **[Feature]** Add to `Reporter` a new function that will be triggered from `orient()` and will fill up flags to track if we have None/Low/Medium/High/Tons of money+income. General and Enforcer will build/expand/recruit/research/halt production according to these flags.
* **[Static Data]** Write JSON Tree structure of LWG Units, Buildings and Researches, with their dependencies
* **[Hardcode]** Build Order in JSON for `General`. It should be a list of commands or goals, like ["Build House", "Build Barracks", "Train Soldier", "Keep Training Archers"..]. Once we have a Build Order, we can build a logic that will take an item from this list and `Enforcer` will remove it once it's completed.
* **[High Level Pseudocode]** Build Order Execution - make an algorithm/logic/pseudocode of how `General` and `Enforcer` should work with build orders, unit production and ungrade researchs. It can be also in form of unimplemented functions (should not break existing code)
* **[Feature]** Assign one unit as a scout. `scoutingActions()` will apply on this unit and `areWeScouting()` will return true as long as this unit is scouting and alive.
* **[Feature]** Implement into `scoutingActions()` to force Scout run away from enemy military units and enemy Towers. Otherwise it should go to enemy base (hardcode for now)
