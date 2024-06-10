const random_walk = function(p){
    let directions;
    let line_length, line_weight, line_length_factor;
    let draw_count;
    let interval;
    let dx, dy;
    let direction_x, direction_y;
    let bg_color, line_color;
    let line_s_hist, line_e_hist, alpha_hist;
    let alpha_decay;
    let width_factor;
    let height_bias;

    p.setup = function(){
        canvas = p.createCanvas(window.innerWidth, window.innerHeight);
        canvas.position(0, 0);
        canvas.style('z-index','-1');
        directions = [
            [ 1,  0],
            [ 0,  1],
            [-1,  0],
            [ 0, -1]
        ];
        line_length_factor = 0.03
        line_length = Math.min(p.width, p.height) * line_length_factor;
        height_bias = p.height * 0.25;
        console.assert(height_bias > 1);
        line_weight = 0.4;
        draw_count  = 0;
        interval    = 1.;
        dx          = 0;
        dy          = 0;
        line_s_hist = [];
        line_e_hist = [];
        alpha_hist  = [];
        alpha_decay = 5;
        width_factor  = 0.5;
        if(window.innerWidth < 550){
            width_factor = 0.35;
        }
        s_x = p.width * width_factor  / 2;
        s_y = (p.height - height_bias) / 2 + height_bias;
        bg_color    = p.color('#159B8B');
        line_color  = p.color('#FFFFFF');
    }

    p.draw = function(){
        p.background(bg_color);
        let direction_ind = Math.floor(Math.random() * 4);

        if(draw_count % interval == 0){
            draw_count = 0;
            direction_x = line_length * directions[direction_ind][0];
            direction_y = line_length * directions[direction_ind][1];
            dx = direction_x / interval;
            dy = direction_y / interval;
        }

        let remove_count = 0;
        for(let i=0; i<alpha_hist.length; i++){
            alpha_hist[i] -= alpha_decay;
            if(alpha_hist[i] < 0){
                remove_count += 1;
            }
        }
        for(let i=0; i<remove_count; i++){
            line_s_hist.shift();
            line_e_hist.shift();
            alpha_hist.shift();
        }
        
        line_s_hist.push([s_x, s_y]);
        line_e_hist.push([s_x + dx, s_y + dy]);
        alpha_hist.push(255);

        p.strokeWeight(line_weight);
        for(let i=0; i<line_s_hist.length ;i++){
            p.stroke(line_color, alpha_hist[i]);
            p.line(
                line_s_hist[i][0], line_s_hist[i][1] + height_bias, 
                line_e_hist[i][0], line_e_hist[i][1] + height_bias);
        }
        s_x += dx;
        s_y += dy;

        if(s_x < 0 || p.width * width_factor < s_x || s_y < 0 || p.height < s_y + height_bias){
            s_x = Math.random() * (p.width * width_factor);
            s_y = Math.random() * (p.height - height_bias);
            // console.log(p.width * width_factor);
        }
        draw_count += 1;
    }

    p.windowResized = function(){
        p.resizeCanvas(window.innerWidth, window.innerHeight);
        line_length = Math.min(p.width, p.height) * line_length_factor;
        height_bias = p.height * 0.25;
        if(window.innerWidth < 550){
            width_factor = 0.35;
        }
        else{
            width_factor = 0.5;
        }
    }
}

new p5(random_walk, "background_container");
