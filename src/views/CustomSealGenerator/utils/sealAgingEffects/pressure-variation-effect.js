// 抽象压力不均的文字绘制
export function drawPressureUnevenText(text, xStart, yPosition, baseColor, minOpacity, maxOpacity) {
    ctx.textAlign = 'left'; 
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${r*0.16}px "FangSong", "STFangsong", serif`;
    
    let x = xStart;
    for (let char of text) {
        const opacity = minOpacity + Math.random() * (maxOpacity - minOpacity);
        ctx.fillStyle = `rgba(${baseColor},${opacity})`;
        ctx.fillText(char, x, yPosition);
        x += ctx.measureText(char).width;
    }
}

// 抽象压力不均的五角星绘制
export function drawPressureUnevenStar(centerX, centerY, radius, colorBase, minAlpha, maxAlpha) {
    ctx.save();
    ctx.globalAlpha = minAlpha + Math.random()*(maxAlpha - minAlpha);
    ctx.translate(centerX, centerY);
    ctx.fillStyle = colorBase;
    ctx.beginPath();
    for (let i=0; i<5; i++) {
        let a = Math.PI/2 + i*Math.PI*2/5;
        let x = Math.cos(a)*radius*0.12, y = -Math.sin(a)*radius*0.12;
        if(i===0) ctx.moveTo(x,y);
        else ctx.lineTo(x,y);
        a += Math.PI/5;
        x = Math.cos(a)*radius*0.12*0.4; y = -Math.sin(a)*radius*0.12*0.4;
        ctx.lineTo(x,y);
    }
    ctx.closePath(); 
    ctx.fill(); 
    ctx.restore();
}