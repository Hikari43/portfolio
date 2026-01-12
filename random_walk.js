const random_walk = function(p){
    let directions;
    let line_length, line_weight, line_length_factor;
    let draw_count;
    let interval;
    let bg_color, line_color;
    let line_s_hist, line_e_hist, alpha_hist;
    let alpha_decay;
    let width_factor;
    let height_bias;
    let walkers; // 複数のウォーカーを管理
    let num_walkers = 2; // ウォーカーの数

    p.setup = function(){
        canvas = p.createCanvas(window.innerWidth, window.innerHeight);
        canvas.position(0, 0);
        canvas.style('z-index','1');
        canvas.style('pointer-events', 'none');  // クリック無効化
        directions = [
            [ 1,  0],
            [ 0,  1],
            [-1,  0],
            [ 0, -1]
        ];
        line_length_factor = 0.03
        line_length = Math.min(p.width, p.height) * line_length_factor;
        height_bias = 0;
        console.assert(height_bias > 1);
        line_weight = 0.3;
        draw_count  = 0;
        interval    = 3.;
        line_s_hist = [];
        line_e_hist = [];
        alpha_hist  = [];
        alpha_decay = 3;
        width_factor  = 1.0;
        if(window.innerWidth < 550){
            width_factor = 1.0;
        }
        
        // 複数のウォーカーを初期化
        walkers = [];
        for(let i = 0; i < num_walkers; i++){
            walkers.push({
                x: Math.random() * p.width,
                y: Math.random() * p.height,
                dx: 0,
                dy: 0,
                draw_count: 0
            });
        }
        
        // bg_color    = p.color('#159B8B');
        line_color  = p.color('#696969');
    }

    p.draw = function(){
        // p.background(bg_color);
        p.background(0, 0);
        p.clear();

        // 各ウォーカーを更新
        for(let w = 0; w < walkers.length; w++){
            let walker = walkers[w];
            let direction_ind = Math.floor(Math.random() * 4);

            if(walker.draw_count % interval == 0){
                walker.draw_count = 0;
                let direction_x = line_length * directions[direction_ind][0];
                let direction_y = line_length * directions[direction_ind][1];
                walker.dx = direction_x / interval;
                walker.dy = direction_y / interval;
            }

            line_s_hist.push([walker.x, walker.y]);
            line_e_hist.push([walker.x + walker.dx, walker.y + walker.dy]);
            alpha_hist.push(255);

            walker.x += walker.dx;
            walker.y += walker.dy;

            // 範囲外に出たらリセット
            if(walker.x < 0 || p.width < walker.x || 
               walker.y < 0 || p.height < walker.y){
                walker.x = Math.random() * p.width;
                walker.y = Math.random() * p.height;
            }
            walker.draw_count += 1;
        }

        // 透明度を減衰
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

        // 全ての線を描画
        p.strokeWeight(line_weight);
        for(let i=0; i<line_s_hist.length ;i++){
            p.stroke(line_color, alpha_hist[i]);
            p.line(
                line_s_hist[i][0], line_s_hist[i][1], 
                line_e_hist[i][0], line_e_hist[i][1]);
        }
    }

    p.windowResized = function(){
        p.resizeCanvas(window.innerWidth, window.innerHeight);
        line_length = Math.min(p.width, p.height) * line_length_factor;
        height_bias = 0;
        if(window.innerWidth < 550){
            width_factor = 1.0;
        }
        else{
            width_factor = 1.0;
        }
    }
}

new p5(random_walk, "random_walk");
