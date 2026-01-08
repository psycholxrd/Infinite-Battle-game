let map_grid = [];
/*
let entities = {
    humanTeam1: [],
    humanTeam2: [],
    trees: [],
    apples: [],
    walls: [],
    wood: []
}
*/

const HEALTH = {
    human: 500,
    armored_human: 1250,
    tree: 250,
    wall: 1000,
}
const DAMAGE = {
    human: 50,
    sword: 200,
}
const CAPACITY_LIMIT = {
    apples: {
        min: 1,
        max: 4
    },
    tree_apples: {
        min: 1,
        max: 16
    }
}
const HEAL_PER_APPLE = 75;

function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}

function replace_skin_from_cell(cell, from, to){
    let skins = [];
    for(let i = 0; i < cell.skins.length; i++){
        if(cell.skins[i] === from){
            skins.push(to);
        }else{
            skins.push(cell.skins[i]);
        }
    }
    cell.reset();
    cell.draw_skins(skins);
}

function remove_entity_from_cell(entity){
    if(!entity.exists) return console.warn('Entity was not spawned');
    const cell = entity.current_cell;
    let skins = [];
    let offset = 0;
    for(let i = 0; i < cell.skins.length; i++){
        if(cell.skins[i] === entity.active_skin){
            offset = -1;
            continue;
        };
        skins[i+offset] = cell.skins[i];
    }
    let {x, y} = entity.grid_position;
    let grid_entities = map_grid[x][y];
    let entity_i = grid_entities.indexOf(entity);
    if(entity_i === -1) return console.warn('Entity not found???');
    map_grid[x][y].splice(entity_i, 1);
    cell.reset();
    cell.draw_skins(skins);
}

function create_map_grid(){
    map_grid.length = 0;
    for(let i = 0; i < GRID_BOXES.horizontal; i++){
        let arr = new Array(GRID_BOXES.vertical);
        for(let j = 0; j < arr.length; j++){
            arr[j] = [];
        };
        map_grid.push(arr);
    }
}

class Entity{
    constructor(x, y, type, skins){
        if(x < 0 || x >= GRID_BOXES.horizontal) throw new Error('INVALID X AT ENTITY CONSTRUCTOR');
        if(y < 0 || y >= GRID_BOXES.vertical) throw new Error('INVALID Y AT ENTITY CONSTRUCTOR');
        this.grid_position = {
            x: x,
            y: y,
        };
        this.type = type;
        this.skins = skins;
        this.exists = 0;
        this.current_cell, this.active_skin;
    }
    spawn(){
        if(this.exists) return console.log('Entity already exists');
        const { x, y } = this.grid_position;
        this.current_cell = get_cell(x, y);
        map_grid[x][y].push(this);
        this.exists = 1;
    }
    despawn(){
        if(!this.exists) return console.log('nothing to despawn');
        remove_entity_from_cell(this);
        this.current_cell = undefined;
        this.active_skin = undefined;
        this.exists = 0;
    }
    has_cell_other_skin(ignore_index){
        let bool = false;
        if(this.current_cell && this.skins[ignore_index]){ 
            for(let i = 0; i < this.skins.length; i++){
                if(i===ignore_index) continue;
                if(this.current_cell.skins.includes(this.skins[i])){
                    bool = true;
                    break;
                }
            }
        }
        return bool;
    }
    render(skin_index){
        //console.log('inside render skin:', this.skins[skin_index]);
        if(!this.exists) return console.log('Entity was not spawned yet');
        if(this.current_cell && this.skins[skin_index]){
            if(this.has_cell_other_skin(skin_index)){
                this.current_cell.reset();
                this.current_cell.draw_skin(this.skins[skin_index]);
            }else{
                this.current_cell.draw_skin(this.skins[skin_index]);
            }
            this.active_skin = this.skins[skin_index];
        }
    }
}

class Wood extends Entity{
    constructor(x, y){
        super(x, y, 'wood', ['wood']);
    }
    logical_render(){
        this.render(0);
    }
}

class Apple extends Entity{
    constructor(x, y, count=1){
        (count > CAPACITY_LIMIT.apples.min && count <= CAPACITY_LIMIT.apples.max)?null:count = CAPACITY_LIMIT.apples.min;
        super(x, y, 'apple', ['1apple', '2apples', '3apples', '4apples']);
        this.count = count;
    }
    logical_render(new_count=this.count){
        (new_count > 0 && new_count <= 4)?null:new_count = 1;
        if(!this.exists){
            this.spawn();
            this.render(new_count-1);
        }else{
            replace_skin_from_cell(this.current_cell, this.skins[this.count-1], this.skins[new_count-1]);
            this.active_skin = this.skins[new_count-1];
        }
        this.count = new_count;
    }
}

class Tree extends Entity{
    constructor(x, y, capacity=16){
        (capacity > CAPACITY_LIMIT.tree_apples.min && capacity <= CAPACITY_LIMIT.tree_apples.max)?null:capacity = CAPACITY_LIMIT.tree_apples.min;
        super(x, y, 'tree', ['empty tree', '1apple tree', '2apples tree', '3apples tree', '4apples tree']);
        this.capacity = capacity;
        this.health = HEALTH.tree;
        this.amount = this.capacity;
    }
    get_available_spots(){
        if(!this.exists) return console.log('Tree was not spawned yet');
        const { x, y } = this.grid_position;
        let spots_to_check = [
            {
                x: x,
                y: y-1
            },
            {
                x: x-1,
                y: y,
            },
            {
                x: x,
                y: y+1,
            },
            {
                x: x+1,
                y: y,
            }
        ]
        let is_spot_available = (x, y) => {
            if(!map_grid[x] || !map_grid[x][y]) return false;
            const _entities = map_grid[x][y];
            if(_entities.length == 0) return true;
            if(_entities.length > 0 && _entities.length < 4){
                for(let _entity of _entities){
                    if(_entity instanceof Human || _entity instanceof Sword) continue;
                    if(_entity instanceof Apple){
                        if(_entity.count < 4){
                            continue;
                        }else{
                            return false;
                        }
                    }else{
                        return false;
                    }
                }
            }else{
                return false;
            }
            return true;
        }
        return spots_to_check.filter(({x, y}) => is_spot_available(x, y));
    }
    has_entities_apple(_entities){
        for(let _entity of _entities){
            if(_entity instanceof Apple) return true;
        }
        return false;
    }
    get_apple_entity(_entities){
        for(let _entity of _entities){
            if(_entity instanceof Apple) return _entity;
        }
        console.warn('no apple entity found!');
        return -1;
    }
    get_precentage(){
        return (100/this.capacity)*this.amount;
    }
    get_closest_percent() {
        let percentage = this.get_precentage();
        const targets = [0, 25, 50, 75, 100];

        let closestIndex = 0;
        let smallestDiff = Infinity;

        for (let i = 0; i < targets.length; i++) {
            let diff = Math.abs(targets[i] - percentage);
            if (diff < smallestDiff) {
                smallestDiff = diff;
                closestIndex = i;
            }
        }

        return closestIndex;
    }
    logical_render(){
        this.render(this.get_closest_percent());
    }
    update_healthbar(){
        if(!this.exists) return;
        this.current_cell.draw_health_bar(this.health, HEALTH.tree);
    }
    recieve_damage(damage){
        if(!this.exists) return;
        this.health -= damage;
        if(this.health <= 0){
            let {x, y} = this.grid_position;
            this.despawn();
            let wd = new Wood(x, y);
            wd.spawn();
            wd.logical_render();
            return
        }
        this.update_healthbar();
    }
    drop_an_apple(){
        if(!this.exists) return;
        let before_percent = this.get_closest_percent();
        if(this.amount === 0) return console.log('no apples left to drop');
        let free_spots = this.get_available_spots();
        if(free_spots.length == 0) return console.warn('no free spots available, canceling...');
        let spot = free_spots[0];
        let _entities = map_grid[spot.x][spot.y];
        let _entity;
        let existed_before = 0;
        if(_entities.length == 0 || (_entities.length == 1 && _entities[0] instanceof Human) || (_entities.length == 2 && _entities[0] instanceof Human && _entities[1] instanceof Sword)){
            _entity = new Apple(spot.x, spot.y, 1);
            existed_before = 0;
        }else if(this.has_entities_apple(_entities)){
            _entity = this.get_apple_entity(_entities);
            existed_before = 1;
        }
        if(!(_entity instanceof Apple)) throw new Error('Entity that was confirmed to be an Apple, actually is not one, logical error!');
        _entity.logical_render(_entity.count+existed_before);
        this.amount--;
        if(before_percent != this.get_closest_percent()){
            this.logical_render();
        }
        return _entity;
    }
}

class Sword extends Entity{
    constructor(x, y, owner){
        super(x, y, 'sword', ['sword']);
        if(!(owner instanceof Human)) throw new Error('expected Human as owner!');
        this.owner = owner;
    }
    logical_render(){
        this.render(0);
    }
}

class Human extends Entity{
    constructor(x, y, team=1){
        (team === 1 || team === 2)?null:team=1;
        super(x, y, 'human', [`humanTeam${team}`, `armoredHumanTeam${team}`]);
        this.team = team;
        this.health = HEALTH.human;
        this.damage = DAMAGE.human;
        this.armored = 0;
        this.has_sword = 0;
        this.sword;
        this.inventory = [0, 0, 0]; //apples, seeds, wood
    }
    logical_render(){
        this.render(!this.armored?0:1);
    }
    create_and_render_sword(){
        if(this.has_sword) return false;
        const { x, y } = this.grid_position;
        this.sword = new Sword(x, y, this);
        this.sword.spawn();
        this.sword.render(0);
        this.has_sword = 1;
        this.damage = DAMAGE.sword;
        return true;
    }
    create_and_render_armor(){
        if(this.armored) return false;
        this.armored = 1;
        this.logical_render();
        if(this.sword)this.sword.logical_render();
        this.health = HEALTH.armored_human;
        return true;
    }
    logical_armor(){
        if(!this.exists) return console.log('Human was not spawned yet');
        if(this.inventory[2] > 0){
            let output = this.create_and_render_armor();
            if(output)this.inventory[2]--;
        }else{
            console.warn('not enough wood to craft armor');
        }
    }
    logical_sword(){
        if(!this.exists) return console.log('Human was not spawned yet');
        if(this.inventory[2] > 0){
            let output = this.create_and_render_sword();
            if(output)this.inventory[2]--;
        }else{
            console.warn('not enough wood to craft sword');
        }
    }
    get_neighbour_spots(){
        if(!this.exists) return console.log('Human was not spawned yet');
        const { x, y } = this.grid_position;
        let spots_to_check = [
            {
                x: x,
                y: y-1
            },
            {
                x: x-1,
                y: y,
            },
            {
                x: x,
                y: y+1,
            },
            {
                x: x+1,
                y: y,
            }
        ]
        let spot_exists = (spot) => (map_grid[spot.x] && map_grid[spot.x][spot.y]);
        return spots_to_check.filter(spot_exists);
    }
    is_in_neighbour_spots(spot){
        let n_spots = this.get_neighbour_spots();
        for(let n_spot of n_spots){
            if(n_spot.x === spot.x && n_spot.y === spot.y) return true;
        }
        return false;
    }
    filter_moving_spots(spots){
        let is_moving_spot = (spot) => {
            let _entities = map_grid[spot.x][spot.y];
            for(let _entity of _entities){
                if(!(_entity instanceof Apple) && !(_entity instanceof Wood)) return false;
            }
            return true;
        };
        return spots.filter(is_moving_spot);
    }
    filter_attacking_spots(spots){
        let is_attacking_spot = (spot) => {
            let _entities = map_grid[spot.x][spot.y];
            if(_entities.length === 0) return false;
            for(let _entity of _entities){
                if(
                    !(_entity instanceof Human && _entity.team != this.team) &&
                    !(_entity instanceof Tree) &&
                    !(_entity instanceof Wall) &&
                    !(_entity instanceof Sword)
                ){
                    return false;
                }
            }
            return true;
        };
        return spots.filter(is_attacking_spot);
    }
    filter_empty_spots(spots){
        let is_empty_spot = (spot) => {
            let _entities = map_grid[spot.x][spot.y];
            return _entities.length === 0;
        };
        return spots.filter(is_empty_spot);
    }
    move_to(spot){
        if(!this.exists) return;
        if(this.is_in_neighbour_spots(spot)){
            this.despawn();
            this.grid_position.x = spot.x;
            this.grid_position.y = spot.y;
            this.spawn();
            this.logical_render();
            if(this.has_sword){
                this.sword.despawn();
                this.sword.grid_position.x = spot.x;
                this.sword.grid_position.y = spot.y;
                this.sword.spawn();
                this.sword.logical_render();
            }
        }else{
            console.warn('the spot you chose to move to, is not part of neighbour spots');
        }
    }
    update_healthbar(){
        if(this.armored){
            this.current_cell.draw_health_bar(this.health, HEALTH.armored_human);
        }else{
            this.current_cell.draw_health_bar(this.health, HEALTH.human);
        }
    }
    recieve_damage(damage){
        if(!this.exists) return;
        this.health -= damage;
        if(this.health <= 0){
            if(this.has_sword) this.sword.despawn();
            this.despawn();
            return;
        }
        this.update_healthbar();
    }
    eat_apple(){
        if(
            this.inventory[0] <= 0 ||
            (this.armored & this.health === HEALTH.armored_human) ||
            (!this.armored & this.health === HEALTH.human)
        ) return;
        this.inventory[0]--;
        this.health += HEAL_PER_APPLE;
        if(this.armored){
            if(this.health > HEALTH.armored_human) this.health = HEALTH.armored_human;
        }else{
            if(this.health > HEALTH.human) this.health = HEALTH.human;
        }
        this.update_healthbar();
    }
    attack(spot){
        if(!this.exists) return;
        if(this.is_in_neighbour_spots(spot)){
            let {x, y} = spot;
            let _entities = map_grid[x][y];
            let target_entity;
            for(let _entity of _entities){
                if(_entity.health && _entity.recieve_damage){
                    target_entity = _entity;
                    break;
                }
            }
            if(!target_entity) return console.warn('no entity found to attack');
            target_entity.recieve_damage(this.damage);
        }else{
            console.warn('the spot you chose to attack, is not part of neighbour spots');
        }
    }
    plant(spot){
        if(!this.exists) return;
        if(this.inventory[1] === 0) return console.warn('missing seeds');
        if(this.is_in_neighbour_spots(spot)){
            let {x, y} = spot;
            let count = getRandomInt(CAPACITY_LIMIT.tree_apples.min, CAPACITY_LIMIT.tree_apples.max);
            let t = new Tree(x, y, count);
            t.spawn();
            t.logical_render();
            this.inventory[1]--;
        }else{
            console.warn('the spot you chose to plant, is not part of neighbour spots');
        }
    }
    apple_to_seed(){
        if(!this.exists) return;
        if(this.inventory[0] === 0) return console.warn('missing apples');
        this.inventory[0]--;
        this.inventory[1]++;
    }
    collect_apples(){
        if(!this.exists) return;
        let {x, y} = this.grid_position;
        let _entities = map_grid[x][y];
        let apple_entity;
        //check if apples even are there
        for(let _entity of _entities){
            if(_entity instanceof Apple){
                apple_entity = _entity;
                break
            }
        }
        if(!apple_entity) return console.log('no apples in your spot');
        this.inventory[0] += apple_entity.count;
        apple_entity.despawn();
    }
    collect_wood(){
        if(!this.exists) return;
        let {x, y} = this.grid_position;
        let _entities = map_grid[x][y];
        let wood_entity;
        //check if wood even is there
        for(let _entity of _entities){
            if(_entity instanceof Wood){
                wood_entity = _entity;
                break
            }
        }
        if(!wood_entity) return console.log('no wood in your spot');
        this.inventory[2] += 1;
        wood_entity.despawn();
    }
    get_available_spots(){
        let neighbour_spots = this.get_neighbour_spots();
        return {
            move_spots: this.filter_moving_spots(neighbour_spots),
            plant_spots: this.filter_empty_spots(neighbour_spots),
            attack_spots: this.filter_attacking_spots(neighbour_spots),
        }
    }
    get_decision_conditions(){
        let s = this.get_available_spots();
        let {x, y} = this.grid_position;
        let has_apples = map_grid[x][y].some(e => e instanceof Apple);
        let has_wood = map_grid[x][y].some(e => e instanceof Wood);
    
        return {
            inventory_conditions: {
                can_eat_apple: this.inventory[0] > 0,
                can_create_seed: this.inventory[0] > 0,
                can_plant: this.inventory[1] > 0 && s.plant_spots.length > 0,
                can_craft_armor: this.inventory[2] > 0 && !this.armored,
                can_craft_sword: this.inventory[2] > 0 && !this.has_sword,
            },
            spot_conditions: {
                can_collect_apples: has_apples,
                can_collect_wood: has_wood,
                can_move: s.move_spots.length > 0,
                can_attack: s.attack_spots.length > 0,
            }
        };
    }
    get_decisions(){
        if(!this.exists) return;
        const conds = this.get_decision_conditions();
        const s = this.get_available_spots();
        const decision_name_map = {
            inventory_conditions: {
                can_eat_apple: ['EAT_APPLE', undefined],
                can_create_seed: ['CREATE_SEED', undefined],
                can_plant: ['PLANT', s.plant_spots],
                can_craft_armor: ['CRAFT_ARMOR', undefined],
                can_craft_sword: ['CRAFT_SWORD', undefined],
            },
            spot_conditions: {
                can_collect_apples: ['COLLECT_APPLES', undefined],
                can_collect_wood: ['COLLECT_WOOD', undefined],
                can_move: ['MOVE', s.move_spots],
                can_attack: ['ATTACK', s.attack_spots],
            }
        }
        let decisions = [];
        for(let key1 in decision_name_map){
            for(let key2 in decision_name_map[key1]){
                if(conds[key1][key2]) decisions.push(decision_name_map[key1][key2]);
            }
        }
        return decisions;
    }
    execute(decision = 'NOTHING', spot){
        if(!this.exists) return;
        switch(decision){
            case 'EAT_APPLE':
                this.eat_apple();
                break
            case 'CREATE_SEED':
                this.apple_to_seed();
                break
            case 'PLANT':
                if(spot) this.plant(spot);
                break
            case 'CRAFT_ARMOR':
                this.logical_armor();
                break
            case 'CRAFT_SWORD':
                this.logical_sword();
                break
            case 'COLLECT_APPLES':
                this.collect_apples();
                break
            case 'COLLECT_WOOD':
                this.collect_wood();
                break
            case 'MOVE':
                if(spot) this.move_to(spot);
                break
            case 'ATTACK':
                if(spot) this.attack(spot);
                break
            case 'NOTHING':
                break;
        }
    }
}

class Wall extends Entity{
    constructor(x, y){
        super(x, y, 'wall', ['wall']);
        this.health = HEALTH.wall;
    }
    logical_render(){
        this.render(0);
    }
    update_healthbar(){
        this.current_cell.draw_health_bar(this.health, HEALTH.wall);
    }
    recieve_damage(damage){
        this.health -= damage;
        if(this.health <= 0){
            this.despawn();
            return;
        }
        this.update_healthbar();
    }
}

function random_decision(human){
    let decisions = human.get_decisions();
    if(!decisions || decisions.length === 0) return;
    
    let decision_index = getRandomInt(0, decisions.length);
    let decision = decisions[decision_index];
    let decision_name = decision[0];
    let decision_spot = decision[1] ? decision[1][getRandomInt(0, decision[1].length)] : undefined;
    human.execute(decision_name, decision_spot);
}

function random_spawn(entity_class, team=1){
    let spots = get_free_spots();
    let spot = spots[getRandomInt(0, spots.length)];
    let entity;
    if(entity_class === Human){
        entity = new entity_class(spot.x, spot.y, team);
    }else{
        entity = new entity_class(spot.x, spot.y);
    }
    entity.spawn();
    entity.logical_render();
    return entity;
}

function init2(){
    create_map_grid();
}
init2();