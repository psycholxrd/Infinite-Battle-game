class gameInstance {
    constructor(map, grid) {
        this.entities = {
            humans1: [],
            humans2: [],
            trees: [],
            apples: [],
            swords: [],
            walls: [],
        };
        this.map = map;
        this.grid = grid;
        this.map_generated = false;
    }
    get_free_spots(){
        let result = [];
        if(this.map.length === 0) return result;
        for(let i = 0; i < this.map.length; i++){
            for(let j = 0; j < this.map[i].length; j++){
                if(this.map[i][j].length === 0) result.push({x:i,y:j});
            }
        }
        return result;
    }
    resetMap(){
        const keys = Object.keys(this.entities);
        for(let key of keys){
            for(let entity of this.entities[key]){
                entity.despawn();
            }
            this.entities[key].length = 0;
        }
    }
    generateMap(TREES_PER_TEAM, HUMANS_TEAM_1, HUMANS_TEAM_2, WALLS_PER_TEAM){
        if(this.map_generated) return console.log('map already generated');
        let left_to_generate = {
            trees: TREES_PER_TEAM,
            humans1: HUMANS_TEAM_1,
            humans2: HUMANS_TEAM_2,
            walls: WALLS_PER_TEAM
        };
        let generate_entity = (entityType, key, extraArgs=[]) => {
            if(![Apple, Sword, Tree, Human, Wall].includes(entityType)) return console.log('invalid entity type');
            if(left_to_generate[key]===undefined || this.entities[key]===undefined) return console.log('invalid key for entity generation');
            if(left_to_generate[key] <= 0) return console.log(`you already generated all ${key}`);
            let free_spots = this.get_free_spots();
            if(free_spots.length === 0) return console.log(`no free spots for ${key}`);
            let spot = free_spots[Math.floor(Math.random() * free_spots.length)];
            let new_entity = new entityType(spot.x, spot.y, ...extraArgs);
            new_entity.spawn();
            new_entity.logical_render();
            left_to_generate[key]--;
            this.entities[key].push(new_entity);
        }
        let generate_Tree = () => {
            generate_entity(Tree, 'trees');
        }
        let generate_Human = (team) => {
            generate_entity(Human, `humans${team}`, [team]);
        }
        let generate_Wall = () => {
            generate_entity(Wall, 'walls');
        }
        while(left_to_generate.trees > 0) generate_Tree();
        while(left_to_generate.humans1 > 0) generate_Human(1);
        while(left_to_generate.humans2 > 0) generate_Human(2);
        while(left_to_generate.walls > 0) generate_Wall();
        this.map_generated = true;
        console.log(this.entities);
    }
    onTick(){
        this.entities.trees.forEach(tree => {if(tree.amount > 0)tree.drop_an_apple()});
        //Human decision making logic...
    }
}

// Example usage:
const game = new gameInstance(map_grid, grid);
game.generateMap(10, 5, 5, 10);
const tc = new TimeController();
const gc = new GameClock(tc, game.onTick.bind(game));
gc.start();