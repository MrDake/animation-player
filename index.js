const info = {
    canvasSide: 862,
    paintTool: '',
    isMouseDown: false,
    lineWidth: 20,
    currentColor: '',
    currentCoordinates: [],
    frameBuffer: [],
    frameNumber: 1,
    fps:12,
    isFsMode: 1,
};

function resizer() {
    info.canvasSide = Math.floor(window.innerHeight * 0.92);
};
resizer();

function renderCanvas(element, frameNumber, scaleX, scaleY) {
    const mc = element.getContext('2d');
    const arr = info.frameBuffer[frameNumber - 1];

    if (info.frameBuffer.length < 1) {
        return;
    };

    arr.forEach(stroke => {
        let x = stroke[0]*scaleX;
        let y = stroke[1]*scaleY;
        let color = stroke[2];
        let width = stroke[3]*scaleY;

        mc.lineWidth = width;
        mc.strokeStyle = color;
        mc.lineTo(x, y);
        mc.stroke();
    
        mc.beginPath();
        mc.arc(x, y, width / 2, 0, Math.PI * 2);
        mc.fillStyle = color;
        mc.fill(); 
    
        mc.beginPath();
        mc.moveTo(x, y);
    });
};

function clearCanvas() {
    mc.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    info.currentCoordinates = [];
};

function saveFrame() {
    info.frameBuffer.push(info.currentCoordinates);
};

function saveAnimation() {
    localStorage.removeItem('movie');
    localStorage.setItem('movie', JSON.stringify(info.frameBuffer));
};

function createFrame(frameNum) {
    const frameToolBox = document.getElementById('frame-tool-box');
    const frame = document.createElement('div');
    frame.className = 'frame-card';
    frame.id = `frame-card-${frameNum}`;
    frame.innerHTML = 
    `<canvas class="frame-canvas" width="140px" height="140px" id="frame-${frameNum}"></canvas>
    <div class="frame-tool-box__frame-number center" id="frame-number">${frameNum}</div>
    <button class="frame-tool-box__button-dell-frame" id="button-dell-frame"><i class="far fa-trash-alt"></i></button>
    <button class="frame-tool-box__button-clone-frame" id="button-clone-frame"><i class="far fa-copy"></i></button>`;
    frameToolBox.insertBefore(frame, frameToolBox.children[1]);
    
    const element = document.getElementById(`frame-${frameNum}`);
    renderCanvas(element, frameNum, 140 / info.canvasSide, 140 / info.canvasSide);
};

function animateFS() {   
    let frameNmber = 1;
    const viewer = document.getElementById(`fs-canvas`);
    const vc = viewer.getContext('2d');
    
    function step() {
        setTimeout(function() {
            requestAnimationFrame(step);
            const bufferLength = info.frameBuffer.length;
            if (frameNmber > bufferLength) {
                frameNmber = 1;
            }
            vc.clearRect(0, 0, info.canvasSide, info.canvasSide); 
            renderCanvas(viewer, (frameNmber), 1, 1);
            frameNmber +=1;
        }, 1000 / info.fps);
    };
    step();
};

function animate() {   
    let frameNmber = 1;
    const viewer = document.getElementById(`viewer`);
    const vc = viewer.getContext('2d');
    
    function step() {
        setTimeout(function() {
            requestAnimationFrame(step);
            const bufferLength = info.frameBuffer.length;
            if (frameNmber > bufferLength) {
                frameNmber = 1;
            }
            vc.clearRect(0, 0, viewer.width, viewer.height);
            renderCanvas(viewer, (frameNmber), 140 / info.canvasSide, 140 / info.canvasSide);
            frameNmber +=1;
        }, 1000 / info.fps);
    };
    step();
};

function addFrame() {
    saveFrame();
    const frameNum = info.frameBuffer.length;
    createFrame(frameNum);
    clearCanvas();
};

function dellFrame(frameNumber) {
    const dellIndex = frameNumber - 1;
    info.frameBuffer.splice(dellIndex, 1);
    const frameToolBox = document.getElementById('frame-tool-box');
    while (frameToolBox.children.length > 1) {
        frameToolBox.removeChild(frameToolBox.lastChild);
    };
    info.frameBuffer.forEach((item, index) => {
       createFrame(index + 1);
    });
};

let fschange = (document.onwebkitfullscreenchange)? 'onwebkitfullscreenchange':(document.onfullscreenchange)?
'onfullscreenchange': (document.onmozfullscreenchange)?
'onmozfullscreenchange': (document.MSFullScreenChange)?
'MSFullscreenChange': null;
if(fschange){
    document[fschange] = toggleFull;
}

function cloneFrame(frameNumber) {
    info.frameBuffer.push(info.frameBuffer[frameNumber-1]);
    frameNumber = info.frameBuffer.length; 
    createFrame(frameNumber);
};

function goFullScreen(e){
    if(!document.fullscreenElement){
        const wraper = document.createElement('div');
        wraper.setAttribute('class', 'viewer-wraper center');
        wraper.setAttribute('id', 'viewer-wraper');
        wraper.innerHTML = '<canvas class="fs-canvas" id="fs-canvas" width="862px" height="862px"></canvas>';
        document.body.appendChild(wraper);
        animateFS();
        wraper.requestFullscreen();
        wraper.addEventListener('dblclick', outFullScreen);

        wraper.addEventListener('fullscreenchange', () => {
            // console.log('engaged fullscreenchange event');
            // console.log('info.isFsMode = '+info.isFsMode);
            if (info.isFsMode % 2 == 0) {
                const wraper = document.getElementById('viewer-wraper');
                const parent = wraper.parentNode;
                parent.removeChild(wraper);
                
            }
            info.isFsMode += 1;
            // console.log('info.isFsMode after checking = '+info.isFsMode);
        });
    } 
}

function outFullScreen(){
    if( document.fullscreenEnabled){
        document.exitFullscreen();
        const wraper = document.getElementById('viewer-wraper');
        const parent = wraper.parentNode;
        parent.removeChild(wraper);
    }      
}

function toggleFullscreen() {
    let elem = document.getElementById("viewer");
  
    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(err => {
        alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
}


//! section for Eventlisteners


const paitToolBox = document.getElementById('paint-tool-box');   
paitToolBox.addEventListener('click', (e) => {
    const target =  e.target.closest('.paint-tool-button');
    if (target) {
        const targetId = target.id
        if (targetId !== 'color-input') {
            info.paintTool = targetId;
            for (let i = 0; i < target.parentNode.children.length; i += 1)
            target.parentNode.children[i].classList.remove('active-button');
            target.classList.toggle('active-button');
        }
    };
})

const colorInput = document.getElementById('color-input');

const mainCanvas = document.getElementById('main-canvas');
const mc = mainCanvas.getContext('2d');

mainCanvas.height = info.canvasSide;
mainCanvas.width = info.canvasSide;

mainCanvas.addEventListener('mousedown', (e) => {
    info.currentColor = colorInput.value;
    if(info.paintTool === 'pen') {
        info.isMouseDown = true;
    };
})

mainCanvas.addEventListener('mouseup', (e) => {
    if(info.paintTool === 'pen') {
        info.isMouseDown = false;
        mc.beginPath();
        info.currentCoordinates.push('mouseup');
    };
})

mainCanvas.addEventListener('mouseleave', (e) => {
    if(info.paintTool === 'pen') {
        info.isMouseDown = false;
        mc.beginPath();
        info.currentCoordinates.push('mouseup');
    };
})

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,   
        y: evt.clientY - rect.top
    };
}

mainCanvas.addEventListener('mousemove', (e) => {
    mc.lineWidth = info.lineWidth;
    if(info.isMouseDown) {
        let cordinates = getMousePos(mainCanvas, e);  

        info.currentCoordinates.push([cordinates.x, cordinates.y, info.currentColor, info.lineWidth]);

        mc.strokeStyle = info.currentColor;
        mc.lineTo(cordinates.x, cordinates.y);
        mc.stroke();

        mc.beginPath();
        mc.arc(cordinates.x, cordinates.y, info.lineWidth / 2, 0, Math.PI * 2);
        mc.fillStyle = info.currentColor;
        mc.fill(); 

        mc.beginPath();
        mc.moveTo(cordinates.x, cordinates.y);
    };
});

const frameToolBox = document.getElementById('frame-tool-box');    
frameToolBox.addEventListener('click', (e) => {
    const target = e.target.closest('button');
    let frameNumber;
    if(e.target.closest('div')) {
        frameNumber = +e.target.closest('div').innerText;
    };
    switch (target.id) {
        case 'add-frame':
            addFrame();
            break;
        case 'button-dell-frame':
            dellFrame(frameNumber);
            break;
        case 'button-clone-frame':
            cloneFrame(frameNumber);
            break;
    }
});

const fpsMeter = document.getElementById('fps-changer');   
const fpsMonitor = document.getElementById('fps-monitor');
fpsMeter.addEventListener('mousemove', () => {
    // console.log(fpsMeter.value);
    info.fps = fpsMeter.value
    fpsMonitor.innerText = `FPS ${info.fps}`;

});

document.addEventListener('keydown', (e) => {
    // e.preventDefault();
    console.log('e keycode ='+e.keyCode);
    if (e.keyCode == 83) { // S save
        saveAnimation();
    };
    if (e.keyCode == 69) { // E edit
        clearCanvas();
        info.currentCoordinates = info.frameBuffer[info.frameBuffer.length - 1];
        renderCanvas(mainCanvas, info.frameBuffer.length, 1, 1);
        
    };
    if (e.keyCode == 67) { // C clear
        clearCanvas();
    };
    if (e.keyCode == 77) { // M make frame
        addFrame()
    }
});

const viewer = document.getElementById(`viewer`);
viewer.addEventListener('click', goFullScreen);

const paintToolBox = document.getElementById('paint-tool-box');
paintToolBox.setAttribute('data-title', `C -  clears canvas; M - makes frame from current canvas;`);

animate();



