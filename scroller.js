const contentWrapper = document.getElementById('content-container');
const content = document.getElementById('content');

contentWrapper.addEventListener('wheel', function(event) {
    content.scrollTop += event.deltaY;
});

let startY;
let startTime;
let lastMoveY;
let lastMoveTime;
let velocityY = 0;
let isScrolling = false;

contentWrapper.addEventListener('touchstart', function(event) {
    startY = event.touches[0].pageY;
    startTime = Date.now();
    lastMoveY = startY;
    lastMoveTime = startTime;
    isScrolling = true;
    velocityY = 0;
}, { passive: true });

contentWrapper.addEventListener('touchmove', function(event) {
    const currentY = event.touches[0].pageY;
    const currentTime = Date.now();
    const deltaY = startY - currentY;

    content.scrollTop += deltaY;

    // 速度の計算
    velocityY = (lastMoveY - currentY) / (currentTime - lastMoveTime);

    lastMoveY = currentY;
    lastMoveTime = currentTime;

    startY = currentY; // 現在の位置を新しい開始位置として更新
}, { passive: true });

contentWrapper.addEventListener('touchend', function(event) {
    isScrolling = false;
    console.log('Start');
    requestAnimationFrame(inertiaScroll);
}, { passive: true });

function inertiaScroll() {
    console.log('isScrolling', isScrolling);
    console.log('velocityY', velocityY);
    if (!isScrolling && Math.abs(velocityY) > 0.01) {
        content.scrollTop += velocityY * 20; // 速度に応じてスクロール
        velocityY *= 0.95; // 摩擦による減速

        requestAnimationFrame(inertiaScroll);
    }
}


document.addEventListener('touchmove', function(event) {
    event.preventDefault();
}, { passive: false });

content.addEventListener('touchmove', function(event) {
    event.stopPropagation();
}, { passive: false });

content.addEventListener('touchstart', function(event) {
    const startY = event.touches[0].pageY;
    const startScrollTop = content.scrollTop;

    content.addEventListener('touchmove', function(event) {
        const currentY = event.touches[0].pageY;
        const deltaY = startY - currentY;
        content.scrollTop = startScrollTop + deltaY;
    }, { passive: false });
}, { passive: false });