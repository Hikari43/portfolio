const contentWrapper = document.getElementById('content-container');
const content = document.getElementById('content');

contentWrapper.addEventListener('wheel', function(event) {
    content.scrollTop += event.deltaY;
});