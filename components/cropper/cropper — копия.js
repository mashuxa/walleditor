"use strict";
const APP_NAME = "PhotoWalls";
const LIMIT_VAR = 25;
const POSITION_START_BORDERS = 50;
const NEW_IMG_NAME = "photo_walls_editor_image.png";
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let fileInput = document.getElementById("fileInput");
let canvasImg, canvasImgWidth, canvasImgHeight;
let cursorPositionX, cursorPositionY;
let animationId;
let scaleK;
let x1, x2, y1, y2;
let imgSettings = {
    filterBrightness: 1,
    filterContrast: 1,
    filterHueRotate: 0,
    filterSaturate: 1,
    filterGrayscale: 0,
    filterSepia: 0,
    filterInvert: 0,
    filterBlur: 0,
    filterOpacity: 1,
    x1: POSITION_START_BORDERS,
    y1: POSITION_START_BORDERS
};
let plusIntervalId, minusIntervalId;

//<<<<<<< MAIN >>>>>>>//
function showPreloader() {
    let preloader = document.createElement("img");
    preloader.id = "preloader";
    preloader.src = "img/ui/preloader.svg";
    document.querySelector(".canvas-wrapper").appendChild(preloader);
}

function hidePreloader() {
    document.getElementById("preloader").remove();
}


//загрузить картинку
function loadImg() {
    let isContinueChange = true;
    if (canvasImg) {
        isContinueChange = confirm("The current image will be overwritten. Are you sure you want to continue?");
    }
    if (isContinueChange && fileInput.files[0]) {
        showPreloader();
        // вызываем функццию для получения img и передаем blob объект полученный из fileInput.
        blobToImg(fileInput.files[0]).then(img => {
            canvasImg = img;
            canvasImgWidth = canvasImg.width;
            canvasImgHeight = canvasImg.height;
            canvas.width = canvasImgWidth;
            canvas.height = canvasImgHeight;
            imgSettings.x2 = canvasImgWidth - imgSettings.x1;
            imgSettings.y2 = canvasImgHeight - imgSettings.y1;
            drawCanvas();
            document.querySelector(".btn_download").addEventListener("click", downloadImg);
            document.querySelector(".btn_apply").addEventListener("click", applyAll);
            document.querySelector(".btn_reset").addEventListener("click", resetCssFilters);
            canvas.style.backgroundImage = "none";
            hidePreloader();
        });
        document.body.querySelectorAll('[type="range"]').forEach((el) => {
            el.disabled = false;
        });
    }
}

// Получаем ссылку из blob объекта для картинки и загружаем её
function blobToImg(blob) {
    return new Promise(resolve => {
        let img = new Image();
        img.onload = () => resolve(img);
        img.src = URL.createObjectURL(blob);
    }, reject => {
        alert("Error!");
    });
}

fileInput.addEventListener("change", loadImg);

// перерисовка канваса
function drawCanvas() {
    ctx.clearRect(0, 0, canvasImgWidth, canvasImgHeight);
    ctx.drawImage(canvasImg, 0, 0);
    applyCssFilters();
    ctx.beginPath();
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.lineTo(0, 0);
    ctx.lineTo(canvasImgWidth, 0);
    ctx.lineTo(canvasImgWidth, canvasImgHeight);
    ctx.lineTo(0, canvasImgHeight);
    ctx.lineTo(0, 0);
    ctx.lineTo(imgSettings.x1, imgSettings.y1);
    ctx.lineTo(imgSettings.x1, imgSettings.y2);
    ctx.lineTo(imgSettings.x2, imgSettings.y2);
    ctx.lineTo(imgSettings.x2, imgSettings.y1);
    ctx.lineTo(imgSettings.x1, imgSettings.y1);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeRect(imgSettings.x1, imgSettings.y1, imgSettings.x2 - imgSettings.x1, imgSettings.y2 - imgSettings.y1);
}

// вызов плавной анимации
function animation() {
    animationId = requestAnimationFrame(animation);
    drawCanvas();
}

//скачать картинку
function downloadImg() {
    let a = document.createElement("a");
    a.href = canvasImg.src;
    a.download = NEW_IMG_NAME;
    a.dispatchEvent(new MouseEvent("click"));
}

//<<<<<<< end MAIN >>>>>>>/


//<<<<<<< ZOOM >>>>>>>/
//ДОРАБОТАТЬ по ТАЧ СОБЫТИЯМ
document.forms.tools.btnPlus.addEventListener("mousedown", () => {
    if (canvasImg) {
        canvas.style.width = canvas.offsetWidth + 5 + "px";
        canvas.style.maxWidth = "none";
        plusIntervalId = setInterval(function () {
            canvas.style.width = canvas.offsetWidth + 5 + "px";
        }, 20);
    }
});
document.forms.tools.btnPlus.addEventListener("mouseup", () => {
    clearInterval(plusIntervalId);
});
document.forms.tools.btnMinus.addEventListener("mousedown", () => {
    if (canvasImg) {
        canvas.style.width = canvas.offsetWidth - 5 + "px";
        minusIntervalId = setInterval(function () {
            canvas.style.width = canvas.offsetWidth - 5 + "px";
        }, 20);
    }
});
document.forms.tools.btnMinus.addEventListener("mouseup", () => {
    clearInterval(minusIntervalId);
});
document.forms.tools.btnReset.addEventListener("mousedown", () => {
    if (canvasImg) {
        canvas.style.maxWidth = "100%";
        canvas.style.width = canvasImgWidth + "px";
    }
    // drawCanvas();
});
//<<<<<<< end ZOOM >>>>>>>/

//<<<<<<<BORDERS & PROPORTIONS for crop >>>>>>>/
canvas.addEventListener("mousedown", function (e) {
    if (canvasImg) {
        animationId = requestAnimationFrame(animation);
        scaleK = canvas.width / canvas.offsetWidth;
        cursorPositionX = e.offsetX * scaleK;
        cursorPositionY = e.offsetY * scaleK;
// Определяем куда был клик и какие стороны меняем
        if (cursorPositionX < imgSettings.x1 + LIMIT_VAR && cursorPositionX > imgSettings.x1 - LIMIT_VAR && cursorPositionY < imgSettings.y1 + LIMIT_VAR && cursorPositionY > imgSettings.y1 - LIMIT_VAR) {
            x1 = y1 = true;
        } else if (cursorPositionX < imgSettings.x2 + LIMIT_VAR && cursorPositionX > imgSettings.x2 - LIMIT_VAR && cursorPositionY < imgSettings.y1 + LIMIT_VAR && cursorPositionY > imgSettings.y1 - LIMIT_VAR) {
            x2 = y1 = true;
        } else if (cursorPositionX < imgSettings.x2 + LIMIT_VAR && cursorPositionX > imgSettings.x2 - LIMIT_VAR && cursorPositionY < imgSettings.y2 + LIMIT_VAR && cursorPositionY > imgSettings.y2 - LIMIT_VAR) {
            x2 = y2 = true;
        } else if (cursorPositionX < imgSettings.x1 + LIMIT_VAR && cursorPositionX > imgSettings.x1 - LIMIT_VAR && cursorPositionY < imgSettings.y2 + LIMIT_VAR && cursorPositionY > imgSettings.y2 - LIMIT_VAR) {
            x1 = y2 = true;
        } else if (cursorPositionX < imgSettings.x1 + LIMIT_VAR && cursorPositionX > imgSettings.x1 - LIMIT_VAR && cursorPositionY > imgSettings.y1 + LIMIT_VAR && cursorPositionY < imgSettings.y2 - LIMIT_VAR) {
            x1 = true;
        } else if (cursorPositionX < imgSettings.x2 + LIMIT_VAR && cursorPositionX > imgSettings.x2 - LIMIT_VAR && cursorPositionY > imgSettings.y1 + LIMIT_VAR && cursorPositionY < imgSettings.y2 - LIMIT_VAR) {
            x2 = true;
        } else if (cursorPositionY < imgSettings.y1 + LIMIT_VAR && cursorPositionY > imgSettings.y1 - LIMIT_VAR && cursorPositionX > imgSettings.x1 + LIMIT_VAR && cursorPositionX < imgSettings.x2 - LIMIT_VAR) {
            y1 = true;
        } else if (cursorPositionY < imgSettings.y2 + LIMIT_VAR && cursorPositionY > imgSettings.y2 - LIMIT_VAR && cursorPositionX > imgSettings.x1 + LIMIT_VAR && cursorPositionX < imgSettings.x2 - LIMIT_VAR) {
            y2 = true;
        } else if (cursorPositionX > imgSettings.x1 + LIMIT_VAR && cursorPositionX < imgSettings.x2 - LIMIT_VAR && cursorPositionY > imgSettings.y1 + LIMIT_VAR && cursorPositionY < imgSettings.y2 - LIMIT_VAR) {
            x1 = y1 = x2 = y2 = true;
        }
        canvas.addEventListener("mousemove", borderResize);
    } else {
        document.getElementById("fileInput").dispatchEvent(new MouseEvent("click"));
    }
});
canvas.addEventListener("mouseup", function (e) {
    cancelAnimationFrame(animationId);
    canvas.removeEventListener("mousemove", borderResize);
    x1 = x2 = y1 = y2 = 0;
});
canvas.addEventListener("mouseout", function (e) {
    cancelAnimationFrame(animationId);
    canvas.removeEventListener("mousemove", borderResize);
});

//меняем координаты при движении мышки
function borderResize(e) {
    cursorPositionX = e.offsetX * scaleK;
    cursorPositionY = e.offsetY * scaleK;
    if (x1 && x2 && y1 && y2) {
        imgSettings.x1 = Math.max((imgSettings.x1 + e.movementX), 0);
        imgSettings.x2 = Math.min((imgSettings.x2 + e.movementX), canvasImgWidth);
        imgSettings.y1 = Math.max((imgSettings.y1 + e.movementY), 0);
        imgSettings.y2 = Math.min((imgSettings.y2 + e.movementY), canvasImgHeight);
        return;
    }
    if (y1) {
        imgSettings.y1 = Math.max(cursorPositionY, 0);
    }
    if (y2) {
        imgSettings.y2 = Math.min(cursorPositionY, canvasImgHeight);
    }
    if (x1) {
        imgSettings.x1 = Math.max(cursorPositionX, 0);
    }
    if (x2) {
        imgSettings.x2 = Math.min(cursorPositionX, canvasImgWidth);
    }
}

function drawByProportions(propWidth, propHeight) {
    let borderWidth = canvasImgWidth;
    let borderHeight = (canvasImgWidth / propWidth) * propHeight;
    if (borderHeight > canvasImgHeight) {
        borderHeight = canvasImgHeight;
        borderWidth = (borderHeight / propHeight) * propWidth;
    }
    imgSettings.x1 = (canvasImgWidth - borderWidth) / 2;
    imgSettings.x2 = imgSettings.x1 + borderWidth;
    imgSettings.y1 = (canvasImgHeight - borderHeight) / 2;
    imgSettings.y2 = imgSettings.y1 + borderHeight;
    drawCanvas();
}

document.forms.tools.btn1x1.addEventListener("click", () => {
    drawByProportions(1, 1);
});
document.forms.tools.btn4x3.addEventListener("click", () => {
    drawByProportions(4, 3);
});
document.forms.tools.btn16x9.addEventListener("click", () => {
    drawByProportions(16, 9);
});
document.forms.tools.proportionsWidth.addEventListener("keyup", () => {
    let valWidth = document.forms.tools.proportionsWidth.value;
    let valHeight = document.forms.tools.proportionsHeight.value;
    if (valWidth && valHeight) {
        drawByProportions(valWidth, valHeight);
    }
});
document.forms.tools.proportionsHeight.addEventListener("keyup", () => {
    let valWidth = document.forms.tools.proportionsWidth.value;
    let valHeight = document.forms.tools.proportionsHeight.value;
    if (valWidth && valHeight) {
        drawByProportions(valWidth, valHeight);
    }
});
//<<<<<<< end PROPORTIONS for crop >>>>>>>/


//<<<<<<< FILTERS >>>>>>>/
function applyCssFilters() {
    canvas.style.filter = "brightness(" + imgSettings.filterBrightness + ")" + " contrast(" + imgSettings.filterContrast + ")" + " hue-rotate(" + imgSettings.filterHueRotate + "deg)" + " saturate(" + imgSettings.filterSaturate + ")" + " grayscale(" + imgSettings.filterGrayscale + ")" + " sepia(" + imgSettings.filterSepia + ")" + " invert(" + imgSettings.filterInvert + ")" + " blur(" + imgSettings.filterBlur + "px)" + " opacity(" + imgSettings.filterOpacity + ")";
}

function resetCssFilters() {
    imgSettings.filterBrightness = 1;
    imgSettings.filterContrast = 1;
    imgSettings.filterHueRotate = 0;
    imgSettings.filterSaturate = 1;
    imgSettings.filterGrayscale = 0;
    imgSettings.filterSepia = 0;
    imgSettings.filterInvert = 0;
    imgSettings.filterBlur = 0;
    imgSettings.filterOpacity = 1;
    document.getElementById("filterBrightness").value = 1;
    document.getElementById("filterContrast").value = 1;
    document.getElementById("filterHueRotate").value = 0;
    document.getElementById("filterSaturate").value = 1;
    document.getElementById("filterGrayscale").value = 0;
    document.getElementById("filterSepia").value = 0;
    document.getElementById("filterInvert").value = 0;
    document.getElementById("filterBlur").value = 0;
    document.getElementById("filterOpacity").value = 1;
}

//применяем фильтры
function applyJsFilters() {
    ctx.filter = "brightness(" + imgSettings.filterBrightness + ")" + " contrast(" + imgSettings.filterContrast + ")" + " hue-rotate(" + imgSettings.filterHueRotate + "deg)" + " saturate(" + imgSettings.filterSaturate + ")" + " grayscale(" + imgSettings.filterGrayscale + ")" + " sepia(" + imgSettings.filterSepia + ")" + " invert(" + imgSettings.filterInvert + ")" + " blur(" + imgSettings.filterBlur + "px)" + " opacity(" + imgSettings.filterOpacity + ")";
}

function resetJsFilters() {
    ctx.filter = "brightness(1) contrast(1) hue-rotate(0) saturate(1) grayscale(0) sepia(0) invert(0) blur(0) opacity(1)";
}

function applyAll() {
    new Promise(resolve => {
        showPreloader();
        canvasImgWidth = imgSettings.x2 - imgSettings.x1;
        canvasImgHeight = imgSettings.y2 - imgSettings.y1;
        canvas.width = canvasImgWidth;
        canvas.height = canvasImgHeight;
        ctx.clearRect(0, 0, canvasImgWidth, canvasImgHeight);
        applyJsFilters();
        ctx.drawImage(canvasImg, imgSettings.x1, imgSettings.y1, canvasImgWidth, canvasImgHeight, 0, 0, canvasImgWidth, canvasImgHeight);
        let dataUrl = canvas.toDataURL();
        let newImg = new Image();
        newImg.onload = () => resolve(newImg);
        newImg.src = dataUrl;
    }, reject => {
        alert("Error!");
    }).then(newImg => {
        canvasImg = newImg;

        imgSettings.x1 = imgSettings.y1 = 20;
        imgSettings.y2 = canvasImgHeight - imgSettings.y1;
        imgSettings.x2 = canvasImgWidth - imgSettings.x1;


        resetCssFilters();
        resetJsFilters();
        drawCanvas();
        hidePreloader();
    });
}

document.forms.tools.querySelectorAll("input[type='range']").forEach((el) => {
    el.addEventListener("click", () => {
        imgSettings[el.id] = Number(el.value);
        drawCanvas();
    });
    el.addEventListener("mousedown", () => {
        if (canvasImg) {
            animationId = requestAnimationFrame(animation);
        }
    });
    el.addEventListener("mousemove", () => {
        if (canvasImg) {
            imgSettings[el.id] = Number(el.value);
        }
    });
    el.addEventListener("mouseup", () => {
        drawCanvas();
        cancelAnimationFrame(animationId);
    });
});
//<<<<<<< end FILTERS >>>>>>>/


//<<<<<<< IndexedDB >>>>>>>/
// На всякий случай проверка
let indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
let IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
if (!window.indexedDB) {
    window.alert("Sorry, but your browser doesn't support saving images. You can update it and repeat again, or save this image on your PC.");
}


const DB_NAME = "photoWall";
const DB_VERSION = 1;
const STORE_NAME = "myGallary";
let objectStore;
class IMG {
    constructor(img){
        this.id = Date.now();
        this.src = img.src;
        this.x1 = 0;
        this.y1 = 0;
        this.x2 = this.x1+ img.width;
        this.y2 = this.y1+ img.height;
    }
}


function openObjectStore(dbName, dbVersion, objectStoreName) {
    return new Promise(resolve => {

        let request = indexedDB.open(dbName, dbVersion);
        let db;
        let objectStore;

        request.onupgradeneeded = function (event) {
            console.log("upgradeneeded");
            db = event.target.result;
            if(!db.objectStoreNames.contains(objectStoreName)){
                objectStore = db.createObjectStore(STORE_NAME, { keyPath: "id" });
            }
        };
        request.onsuccess = function (event) {
            console.log("success");
            db = event.target.result;
            let transaction = db.transaction([STORE_NAME], "readwrite");
            objectStore = transaction.objectStore(STORE_NAME);
            resolve(objectStore);
        };

        request.onerror = function (event) {
            alert("Error: " + event.target.errorCode);
        };
    });
}

// Пуш картинки в db
document.getElementById("btnSaveImg").addEventListener("click", () => {
    if (canvasImg) {
        let currentImgSrc = canvasImg.src;

        openObjectStore(DB_NAME, DB_VERSION, STORE_NAME).then(objectStore => {
            let img = new IMG(canvasImg);
            objectStore.add(img);
            console.log(objectStore);
        });

    }
});


//<<<<<<< end IndexedDB >>>>>>>/