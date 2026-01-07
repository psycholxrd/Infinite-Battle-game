const canvas = document.getElementById('canvas');
const main_ctx = canvas.getContext('2d');
const canvas_cont = document.querySelector("#container");

const GRID_BOXES = {
    horizontal: 10,
    vertical: 8,
};

const scale = {
    vertical: Math.floor(canvas.height/GRID_BOXES.vertical),
    horizontal: Math.floor(canvas.width/GRID_BOXES.horizontal),
}

class Cell{
    constructor(x, y){
        this.pos = {
            x:x,
            y:y,
        };
        this.size = {
            width: scale.horizontal,
            height: scale.vertical,
        };
        this.skins = [];
        this.healthbar = false;
        this.canvas = new OffscreenCanvas(this.size.width, this.size.height);
        this.ctx = this.canvas.getContext('2d');
    }
    clean(where="self"){
        switch(where){
            case "self":
                this.ctx.clearRect(0, 0, this.size.width, this.size.height);
                break
            case "main":
                main_ctx.clearRect(this.pos.x, this.pos.y, this.size.width, this.size.height);
                break
        }
        this.skins.length = 0;
    }
    apply_background(){
        this.ctx.fillStyle = "darkgreen";
        this.ctx.fillRect(0, 0, this.size.width, this.size.height);
    }
    redraw(){
        main_ctx.beginPath();
        main_ctx.drawImage(this.canvas, this.pos.x, this.pos.y);
    }
    reset(){
        this.clean("main");
        this.clean("self");
        this.apply_background();
        this.redraw();
    }
    draw_skin(type){
        if(this.skins.includes(type)){
            return console.warn('this skin was already applied');
        }else{
            apply_skin(this.ctx, this.size, type);
            this.redraw();
            this.skins.push(type);
        }
    }
    draw_skins(types){
        for(let i = 0; i < types.length; i++){
            if(this.skins.includes(types[i])){
                console.warn('this skin was already applied', types[i]);
                continue;
            }else{
                apply_skin(this.ctx, this.size, types[i]);
                this.skins.push(types[i]);
            }
        }
        this.redraw();
    }
    draw_health_bar(health, maxHealth){
        if(health === maxHealth){
            if(this.skins.length === 0){
                this.reset();
                this.healthbar = false;
                return;
            }
            let temp_skins = [];
            for(let i = 0; i < this.skins.length; i++){
                temp_skins.push(this.skins[i]);
            }
            this.reset();
            this.healthbar = false;
            this.draw_skins(temp_skins);
        }else{
            apply_healthbar(this.ctx, this.size, health, maxHealth);
            this.healthbar = true;
            this.redraw();
        }
    }
}

let grid = [];

function createGrid(){
    grid.length = 0;
    for(let i = 0; i < GRID_BOXES.horizontal; i++){
        grid.push(new Array(GRID_BOXES.vertical));
        for(let j = 0; j < GRID_BOXES.vertical; j++){
            grid[i][j] = new Cell(i*scale.horizontal, j*scale.vertical);
        }
    }
}

function draw_grid(){
    main_ctx.beginPath();
    for(let i = 0; i < grid.length; i++){
        for(let j = 0; j < grid[i].length; j++){
            let cell = grid[i][j];
            let ctx = cell.ctx;
            ctx.fillStyle = "darkgreen";
            ctx.fillRect(0, 0, cell.size.width, cell.size.height);
            ctx.fillStyle = 'white';
            ctx.fillText(`(${i}, ${j})`, cell.size.width/2, cell.size.height/2);
            ctx.strokeStyle = 'lime';
            ctx.strokeRect(0, 0, cell.size.width, cell.size.height);
            main_ctx.drawImage(cell.canvas, cell.pos.x, cell.pos.y);
        }
    }
}

function get_cell(x, y) {
    if (grid[x] && grid[x][y]) {
        return grid[x][y];
    }
    return -1;
}

function get_grid_size(){
    return grid.length * grid[0].length;
}

function init(){
    createGrid();
    draw_grid();
}
init();