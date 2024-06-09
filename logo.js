const logo = function(p){
    let cur_texts;
    let textsize;
    let emp_i, emp_j;
    let traj_vecs;
    let n_rows, n_cols;
    let draw_count;
    let interval;
    let canvas;

    p.windowResized = function(){
        if(p.windowWidth < 550){
            p.resizeCanvas(135, 135);
            canvas.style('margin',  '3%');
        }
        else{
            p.resizeCanvas(200, 200);
            canvas.style('margin',  '1.5%');
        }
    }

    p.setup = function(){
        if(p.windowWidth < 550){
            canvas = p.createCanvas(135, 135);
            canvas.style('margin',  '3%');
        }
        else{
            canvas =p.createCanvas(200, 200);
            canvas.style('margin',  '1.5%');
        }
        canvas.position(0, 0);
        canvas.style('padding', '0');
        canvas.style('padding-left', '1%');
        draw_count = 0;
        interval   = 15;
        cur_texts = [
            ['H', '.', 'O', 'T', 'S', 'U', 'K', 'A'],
            ['H', '.', 'O', 'T', 'S', 'U', 'K', 'A'],
            ['H', '.', 'O', 'T', 'S', 'U', 'K', 'A'],
            ['H', '.', 'O', 'T', 'S', 'U', 'K', 'A'],
            ['H', '.', 'O', 'T', 'S', 'U', 'K', 'A'],
            ['H', '.', 'O', 'T', 'S', 'U', 'K', 'A'],
            ['H', '.', 'O', 'T', 'S', 'U', 'K', 'A'],
        ];  
        n_rows = cur_texts.length;
        n_cols = cur_texts[0].length;
        for(let i=0; i < n_rows; i++){
            if(i - 1 >= 0) cur_texts[i][i-1] = '';
            cur_texts[i][i]   = '';
            if(i + 1 < n_cols) cur_texts[i][i+1] = '';
        }
        
        traj_vecs = [];
        p.textFont('Raleway, sans-serif');
        emp_i = Math.floor(n_rows / 2);
        emp_j = Math.floor(n_cols / 2);
    }
    p.draw = function(){
        textsize = Math.min(p.width, p.height) * 0.15;
        p.background(0,0);
        p.clear();
        p.stroke(p.color('#FFFFFF'));
        p.noFill();
        p.strokeWeight(2);
        // p.rect(0, 0, p.width, p.height);
        p.fill(p.color('#FFFFFF'));
        p.textSize(textsize);
        p.strokeWeight(0);
        if(traj_vecs.length == 0){
            traj_vecs = get_trajectory(n_rows, n_cols, emp_j, emp_i);
        }
        
        for(let i=0; i < n_rows; i++){
            for(let j=0; j < n_cols; j++){
                let x, y;
                if(j == traj_vecs[0][0] && i == traj_vecs[0][1]){
                    x = (j - (j - emp_j) * sigmoid(10 * draw_count / interval - 5)) * textsize * 0.75;
                    y = (i - (i - emp_i) * sigmoid(10 * draw_count / interval - 5)) * textsize * 0.8 + textsize;
                }
                else{
                    x = j * (textsize * 0.75);
                    y = i * textsize * 0.8 + textsize;
                }

                if(i == emp_i && j == emp_j){
                    p.text('', x, y);
                }
                else{
                    p.text(cur_texts[i][j], x, y);
                }
            }
        }
        draw_count += 1;
        if(draw_count % interval == 0 || cur_texts[traj_vecs[0][1]][traj_vecs[0][0]] == ''){
            draw_count = 0;
            [cur_texts[emp_i][emp_j], cur_texts[traj_vecs[0][1]][traj_vecs[0][0]]] = [cur_texts[traj_vecs[0][1]][traj_vecs[0][0]], cur_texts[emp_i][emp_j]];
            emp_i = traj_vecs[0][1];
            emp_j = traj_vecs[0][0];
            traj_vecs.shift();
        }
    }
    function get_trajectory(n_rows, n_cols, s_x ,s_y){
        const directions = [
            [ 1,  0],
            [ 0,  1],
            [-1,  0],
            [ 0, -1]
        ];
        let avail_ind = [];
        if(s_x == 0){
            avail_ind.push(0);
            if(s_y != 0) avail_ind.push(3);
            if(s_y != n_rows - 1) avail_ind.push(1);
        }
        else if(s_x == n_cols - 1){
            avail_ind.push(2);
            if(s_y != 0) avail_ind.push(3);
            if(s_y != n_rows - 1) avail_ind.push(1);
        }
        else if(s_y == 0){
            avail_ind.push(1);
            if(s_x != 0) avail_ind.push(2);
            if(s_x != n_cols - 1) avail_ind.push(0);
        }
        else if(s_y == n_rows - 1){
            avail_ind.push(2);
            if(s_x != 0) avail_ind.push(2);
            if(s_x != n_cols - 1) avail_ind.push(0);
        }
        else{
            avail_ind = [0, 1, 2, 3];
        }
        const micro_dir_ind = avail_ind[Math.floor(Math.random() * avail_ind.length)];
        let dx = directions[micro_dir_ind][0];
        let dy = directions[micro_dir_ind][1];
        const turn_val = Math.random() < 0.5 ? -1 : 1;
        let trajectories = [];
        while(is_in_range(s_x, s_y, n_cols, n_rows)){
            trajectories.push([s_x, s_y]);
            while(is_in_range(s_x + dx, s_y + dy, n_cols, n_rows)){
                s_x += dx;
                s_y += dy;
                trajectories.push([s_x, s_y]);
            }
            if(dx == 0){
                s_x += turn_val;
            }
            else if(dy == 0){
                s_y += turn_val;
            }
            dx *= -1;
            dy *= -1;
        }
        trajectories = trajectories.concat(trajectories.slice(0, trajectories.length - 1).reverse());
        return trajectories.slice(1, trajectories.length);
    }
    
    function is_in_range(x, y, w, h){
        return 0 <= x && x < w && 0 <= y && y < h;
    }
    
    function sigmoid(x){
        return 1/(1+Math.exp(-x));
    }
    

}

new p5(logo, "logo_container");