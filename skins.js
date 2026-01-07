//health bars and inventory is dynamic, so not handling in apply skin
const skin_colors = {
    damage: "red",
    human: {
        team1:{
            head_inner: "yellow",
            head_outer: "black",
            body_inner: "orange",
            body_outer: "black",
            armor_inner: "goldenRod",
            armor_outer: "gold",
        },
        team2:{
            head_inner: "pink",
            head_outer: "black",
            body_inner: "purple",
            body_outer: "black",
            armor_inner: "Indigo",
            armor_outer: "Fuchsia",
        },
    },
    sword: {
        blade_inner: "PowderBlue",
        blade_outer: "RoyalBlue",
        holder_inner: "brown",
        holder_outer: "chocolate",
    },
    tree: {
        wood_inner: "brown",
        wood_outer: "chocolate",
        leafs_inner: "green",
        leafs_outer: "lime",
    },
    apple: {
        inner: "red",
        outer: "darkred",
    },
    wall: {
        inner: "gray",
        outer: "dimgray",
    },
    healthbar: {
        inner: "lime",
        outer: "black"
    }
};

function draw_sword(ctx, canvas_sizes){
    const width = canvas_sizes.width;
    const height = canvas_sizes.height;
    const min = Math.min(width, height);
     //--human params recalculation--
    const body_radius = min/5;
    const body_x = width/2;
    const body_y = height/2+(height/4);
    //------------------------------
    const blade_width = min/13;
    const blade_height = min/3;
    const blade_x = body_x+(body_radius*1.75)-(blade_width/2);
    const blade_y = body_y-(blade_height*1.25);
    const holder1_width = blade_width;
    const holder1_height = blade_height/2;
    const holder1_x = blade_x;
    const holder1_y = blade_y+blade_height;
    const holder2_width = blade_width*3;
    const holder2_height = blade_height/4;
    const holder2_x = blade_x-blade_width;
    const holder2_y = blade_y+blade_height;
    ctx.beginPath();
    ctx.fillStyle = skin_colors.sword.blade_inner;
    ctx.strokeStyle = skin_colors.sword.blade_outer;
    ctx.lineWidth = 4;
    ctx.fillRect(blade_x, blade_y, blade_width, blade_height);
    ctx.strokeRect(blade_x, blade_y, blade_width, blade_height);
    ctx.beginPath();
    ctx.fillStyle = skin_colors.sword.holder_inner;
    ctx.strokeStyle = skin_colors.sword.holder_outer;
    ctx.fillRect(holder1_x, holder1_y, holder1_width, holder1_height);
    ctx.strokeRect(holder1_x, holder1_y, holder1_width, holder1_height);
    ctx.beginPath();
    ctx.fillStyle = skin_colors.sword.holder_inner;
    ctx.strokeStyle = skin_colors.sword.holder_outer;
    ctx.fillRect(holder2_x, holder2_y, holder2_width, holder2_height);
    ctx.strokeRect(holder2_x, holder2_y, holder2_width, holder2_height);
}

function draw_human_at(x, y, ctx, canvas_sizes, team = 'team1', armor = false){
    if(!(team in skin_colors.human)) team = 'team1';
    const width = canvas_sizes.width;
    const height = canvas_sizes.height;
    const min = Math.min(width, height);
    const body_radius = min/5;
    const head_radius = min/7;
    const body_x = x;
    const body_y = y+(height/4);
    const head_x = x;
    const head_y = body_y-(body_radius*1.5);
    ctx.beginPath();
    ctx.fillStyle = skin_colors.human[team].body_inner;
    ctx.strokeStyle = skin_colors.human[team].body_outer;
    ctx.lineWidth = 4;
    ctx.arc(body_x, body_y, body_radius, 0, Math.PI*2, false);
    ctx.fill();
    ctx.stroke();
    if(armor){
        const armor_points = [
            {
                x: body_x-body_radius, 
                y: body_y-body_radius
            },
            {
                x: body_x+body_radius, 
                y: body_y-body_radius
            },
            {
                x: body_x, 
                y: body_y+body_radius
            },
        ];
        ctx.beginPath();
        ctx.fillStyle = skin_colors.human[team].armor_inner;
        ctx.strokeStyle = skin_colors.human[team].armor_outer;
        ctx.moveTo(armor_points[0].x, armor_points[0].y);
        ctx.lineTo(armor_points[1].x, armor_points[1].y);
        ctx.lineTo(armor_points[2].x, armor_points[2].y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
    ctx.beginPath();
    ctx.fillStyle = skin_colors.human[team].head_inner;
    ctx.strokeStyle = skin_colors.human[team].head_outer;
    ctx.lineWidth = 4;
    ctx.arc(head_x, head_y, head_radius, 0, Math.PI*2, false);
    ctx.fill();
    ctx.stroke();
    if(armor){
        ctx.beginPath();
        ctx.fillStyle = skin_colors.human[team].armor_inner;
        ctx.strokeStyle = skin_colors.human[team].armor_outer;
        ctx.arc(head_x, head_y, head_radius*1.25, Math.PI, Math.PI*2, false);
        ctx.fill();
        ctx.stroke();
    }
}

function draw_apple_at(x, y, ctx, canvas_sizes, scale=1){
    if(scale < 0.1) scale = 0.1;
    const width = canvas_sizes.width;
    const height = canvas_sizes.height;
    const min = Math.min(width, height);
    const apple_radius = min/6*scale;
    const leaf_radius = apple_radius/2;
    const leaf_offset_x = apple_radius / 2;
    const leaf_offset_y = apple_radius;
    //apple
    ctx.beginPath();
    ctx.fillStyle = skin_colors.apple.inner;
    ctx.strokeStyle = skin_colors.apple.outer;
    ctx.lineWidth = 4;
    ctx.arc(x, y, apple_radius, Math.PI*3/2, Math.PI*2, true);
    ctx.fill();
    ctx.stroke();
    //leaf
    ctx.beginPath();
    ctx.fillStyle = skin_colors.apple.inner;
    ctx.strokeStyle = skin_colors.apple.outer;
    ctx.lineWidth = 4;
    ctx.arc(x+leaf_offset_x, y-leaf_offset_y, leaf_radius, Math.PI/2, Math.PI*2, true);
    ctx.fill();
    ctx.stroke();
}

function draw_tree_at(x, y, ctx, canvas_sizes, apples = 0){
    const width = canvas_sizes.width;
    const height = canvas_sizes.height;
    const min = Math.min(width, height);
    const wood_width = (min/9)*2;
    const wood_height = height-((height/4)*2);
    const wood_x = x-(wood_width/2);
    const wood_y = y-(wood_height/2);
    const leafs_radius = (height-wood_height)/2;
    const leafs_x = x;
    const leafs_y = y-(wood_height/2);
    ctx.beginPath();
    ctx.fillStyle = skin_colors.tree.wood_inner;
    ctx.strokeStyle = skin_colors.tree.wood_outer;
    ctx.lineWidth = 4;
    ctx.fillRect(wood_x, wood_y, wood_width, wood_height);
    ctx.strokeRect(wood_x, wood_y, wood_width, wood_height);
    ctx.beginPath();
    ctx.fillStyle = skin_colors.tree.leafs_inner;
    ctx.strokeStyle = skin_colors.tree.leafs_outer;
    ctx.arc(leafs_x, leafs_y, leafs_radius, 0, Math.PI*2, false);
    ctx.fill();
    ctx.stroke();
    if(apples < 0 || apples > 4) apples = 0;
    let obj = {
        width: leafs_radius,
        height: leafs_radius,
    };
    switch(apples){
        case 0:
            break
        case 1:
            draw_apple_at(leafs_x, leafs_y, ctx, obj);
            break
        case 2:
            draw_apple_at(leafs_x-(leafs_radius/2), leafs_y, ctx, obj);
            draw_apple_at(leafs_x+(leafs_radius/2), leafs_y, ctx, obj);
            break
        case 3:
            draw_apple_at(leafs_x-(leafs_radius/2), leafs_y-(leafs_radius/2), ctx, obj);
            draw_apple_at(leafs_x+(leafs_radius/2), leafs_y-(leafs_radius/2), ctx, obj);
            draw_apple_at(leafs_x, leafs_y+(leafs_radius/2), ctx, obj);
            break
        case 4:
            draw_apple_at(leafs_x-(leafs_radius/2), leafs_y-(leafs_radius/2), ctx, obj);
            draw_apple_at(leafs_x+(leafs_radius/2), leafs_y-(leafs_radius/2), ctx, obj);
            draw_apple_at(leafs_x-(leafs_radius/2), leafs_y+(leafs_radius/2), ctx, obj);
            draw_apple_at(leafs_x+(leafs_radius/2), leafs_y+(leafs_radius/2), ctx, obj);
            break
    }
}

function draw_wall(ctx, canvas_sizes){
    const width = canvas_sizes.width;
    const height = canvas_sizes.height;
    const factor = 0.75;
    const wall_width = width * factor;
    const wall_height = height * factor;
    const wall_x = (width-wall_width)/2;
    const wall_y = (height-wall_height)/2;
    ctx.beginPath();
    ctx.fillStyle = skin_colors.wall.inner;
    ctx.strokeStyle = skin_colors.wall.outer;
    ctx.lineWidth = 6;
    ctx.fillRect(wall_x, wall_y, wall_width, wall_height);
    ctx.strokeRect(wall_x, wall_y, wall_width, wall_height);
}

function draw_wood(ctx, canvas_sizes){
    const width = canvas_sizes.width;
    const height = canvas_sizes.height;
    const min = Math.min(width, height);
    const center_x = width/2;
    const center_y = height/2;
    const radius = min/10;
    const offset = radius*2;
    ctx.beginPath();
    ctx.fillStyle = skin_colors.tree.wood_inner;
    ctx.arc(center_x-offset, center_y, radius, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.fillRect(center_x-offset, center_y-radius, offset*2, radius*2);
    ctx.beginPath();
    ctx.fillStyle = skin_colors.tree.wood_outer;
    ctx.arc(center_x+offset, center_y, radius, 0, Math.PI*2);
    ctx.fill();
}

function apply_skin(ctx, canvas_sizes, type){
    const width = canvas_sizes.width;
    const height = canvas_sizes.height;
    ctx.beginPath();
    switch(type){
        case "damage":
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = skin_colors.damage;
            ctx.fillRect(0, 0, width, height);
            ctx.globalAlpha = 1;
            break
        case "humanTeam1":
            draw_human_at(width/2, height/2, ctx, canvas_sizes, 'team1');
            break
        case "armoredHumanTeam1":
            draw_human_at(width/2, height/2, ctx, canvas_sizes, 'team1', true);
            break
        case "humanTeam2":
            draw_human_at(width/2, height/2, ctx, canvas_sizes, 'team2');
            break
        case "armoredHumanTeam2":
            draw_human_at(width/2, height/2, ctx, canvas_sizes, 'team2', true);
            break
        case "sword":
            draw_sword(ctx, canvas_sizes);
            break
        case "1apple":
            draw_apple_at(width/2, height/2, ctx, canvas_sizes);
            break
        case "2apples":
            draw_apple_at(width/3, height/2, ctx, canvas_sizes);
            draw_apple_at((width/3)*2, height/2, ctx, canvas_sizes);
            break
        case "3apples":
            draw_apple_at(width/3, height/4, ctx, canvas_sizes);
            draw_apple_at((width/3)*2, height/4, ctx, canvas_sizes);
            draw_apple_at(width/2, (height/4)*3, ctx, canvas_sizes)
            break
        case "4apples":
            draw_apple_at(width/3, height/4, ctx, canvas_sizes);
            draw_apple_at((width/3)*2, height/4, ctx, canvas_sizes);
            draw_apple_at(width/3, (height/4)*3, ctx, canvas_sizes);
            draw_apple_at((width/3)*2, (height/4)*3, ctx, canvas_sizes);
            break;
        case "empty tree":
            draw_tree_at(width/2, height/2, ctx, canvas_sizes);
            break
        case "1apple tree":
            draw_tree_at(width/2, height/2, ctx, canvas_sizes, 1);
            break
        case "2apples tree":
            draw_tree_at(width/2, height/2, ctx, canvas_sizes, 2);
            break
        case "3apples tree":
            draw_tree_at(width/2, height/2, ctx, canvas_sizes, 3);
            break
        case "4apples tree":
            draw_tree_at(width/2, height/2, ctx, canvas_sizes, 4);
            break
        case "wall":
            draw_wall(ctx, canvas_sizes);
            break
        case "wood":
            draw_wood(ctx, canvas_sizes);
            break
    }
}

function apply_healthbar(ctx, canvas_sizes, health, maxHealth){
    const width = canvas_sizes.width;
    const height = canvas_sizes.height;
    const from = {
        x: width*0.1,
        y: height*0.9,
    };
    const to = {
        x: width*0.9,
        y: height*0.9,
    }
    ctx.beginPath();
    ctx.strokeStyle = skin_colors.healthbar.outer;
    ctx.lineCap = "round";
    ctx.lineWidth = 7;
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.strokeStyle = skin_colors.healthbar.inner;
    ctx.lineCap = "round";
    ctx.lineWidth = 4;
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(from.x + (to.x - from.x) * (health / maxHealth), to.y);
    ctx.stroke();
}