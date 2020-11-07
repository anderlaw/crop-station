const CropTool = (function () {
  let outerContainer = null;
  let imgSourceEle = null; //传入img标签
  let imgSourceWidth;
  let imgSourceHeight;
  let cropImgWidth = 0;
  let cropImgHeight = 0;
  let cropImgWidthTxt = '';
  let cropImgHeightTxt = '';
  let OuterContainerSelector = null;
  let cropFrameEle = null;
  let xAxisValueEle = null;
  let yAxisValueEle = null;
  let pictureWidthEle = null
  let pictureHeightEle = null
  let zoomLevel = 1;
  function _open(){
    outerContainer.classList.add('open');//打开遮罩
  }
  function _close(){
    outerContainer.classList.remove('open');//打开遮罩
  }
  function mountDOMStructure(selector,imgEle) {
    OuterContainerSelector = selector;
    outerContainer = document.querySelector(selector);
    
    _open();
    document.querySelector(selector).innerHTML = `
        <div class="top-bar">
          <div class="meta-info">
            <span>material picture:</span>
            <span class="origin-picture-width">0</span>
            <span> * </span>
            <span class="origin-picture-height">0</span>
            <span>crop-board:</span>
            <span class="x-axis-value">0</span>
            <span> * </span>
            <span class="y-axis-value">0</span>
          </div>
          
          <div class="right-btns">
            <button class="btn-ok"></button>
          </div>
        </div>
      <div class="img-frame">
        <div class="crop-frame" draggable="true">
          <div class="shadow"></div>
          <div draggable="true" class="solid-boundry right"></div>
          <div draggable="true" class="solid-boundry left"></div>
          <div draggable="true" class="solid-boundry top"></div>
          <div draggable="true" class="solid-boundry bottom"></div>
          <div draggable="true" class="double-boundry en"></div>
          <div draggable="true" class="double-boundry es"></div>
          <div draggable="true" class="double-boundry wn"></div>
          <div draggable="true" class="double-boundry ws"></div>
          <div class="crop-dashed dashed-v"></div>
          <div class="crop-dashed dashed-h"></div>
          <div class="center-boundry top"></div>
          <div class="center-boundry left"></div>
          <div class="center-boundry bottom"></div>
          <div class="center-boundry right"></div>
        </div>
      </div>

      <div class="bottom-bar">
        <span>调整图形大小</span>
        <button class="zoom-in"></button>
        <button class="zoom-out"></button>
      </div>
        `;
    //查找并保存容器的引用
    //图片
    imgSourceEle = imgEle;
    document.querySelector(
      OuterContainerSelector + " .img-frame"
    ).appendChild(imgSourceEle);

    imgSourceEle.onload = function () {
      imgSourceWidth = imgSourceEle.width;
      imgSourceHeight = imgSourceEle.height;
      showMaterialPicSize();
    };
    //显示图片素材尺寸的元素
    pictureWidthEle = document.querySelector('.origin-picture-width')
    pictureHeightEle = document.querySelector('.origin-picture-height')
    //x,y轴插值的元素引用
    xAxisValueEle = document.querySelector(
      OuterContainerSelector + " .x-axis-value"
    );
    yAxisValueEle = document.querySelector(
      OuterContainerSelector + " .y-axis-value"
    );
    //剪切框
    cropFrameEle = document.querySelector(
      OuterContainerSelector + " .crop-frame"
    );
    //计算一次剪切到的图片大小
    calculateCropImgSize()
    showCropImgSize()
  }
  function resizeImg() {
    console.log(zoomLevel, imgSourceWidth, imgSourceHeight);
    imgSourceEle.width = imgSourceWidth * zoomLevel;
    imgSourceEle.height = imgSourceHeight * zoomLevel;
  }
  function showMaterialPicSize(){
    pictureWidthEle.innerText = imgSourceWidth
    pictureHeightEle.innerText = imgSourceHeight
  }
  function showCropImgSize() {
    xAxisValueEle.innerText = cropImgWidthTxt;
    yAxisValueEle.innerText = cropImgHeightTxt;
  }
  function calculateCropImgSize() {
    const computedStyle = getComputedStyle(cropFrameEle);
    cropImgWidthTxt = (parseFloat(computedStyle.width) / zoomLevel).toFixed(2);
    cropImgHeightTxt = (parseFloat(computedStyle.height) / zoomLevel).toFixed(2);
    cropImgWidth = (parseFloat(computedStyle.width) / zoomLevel);
    cropImgHeight = (parseFloat(computedStyle.height) / zoomLevel);
  }
  function initEvents() {
    //拖拽变量
    let startX;
    let startY;
    let cropFrameCurrentLeft;
    let cropFrameCurrentTop;
    let cropFrameCurrentWidth;
    let cropFrameCurrentHeight;
    function _recordCropFrameProps() {
      const computedStyle = getComputedStyle(cropFrameEle);
      cropFrameCurrentLeft = parseFloat(computedStyle.left);
      cropFrameCurrentTop = parseFloat(computedStyle.top);
      cropFrameCurrentWidth = parseFloat(computedStyle.width);
      cropFrameCurrentHeight = parseFloat(computedStyle.height);
    }
    function initFourSolidLineEvents() {
      if (!OuterContainerSelector) {
        throw "please check the container selector";
      }
      function _handleSolidCheck(solidEle, disX, disY) {
        //判断是哪条边
        let classList = solidEle.classList;
        if (classList.contains("right")) {
          //右边,直接调整宽度即可
          cropFrameEle.style.width = cropFrameCurrentWidth + disX + "px";
        } else if (classList.contains("left")) {
          //左边,调整宽度和left
          cropFrameEle.style.width = cropFrameCurrentWidth - disX + "px";
          cropFrameEle.style.left = cropFrameCurrentLeft + disX + "px";
        } else if (classList.contains("bottom")) {
          //下面,调整高度
          cropFrameEle.style.height = cropFrameCurrentHeight + disY + "px";
        } else if (classList.contains("top")) {
          //上面。调整高度和top
          cropFrameEle.style.height = cropFrameCurrentHeight - disY + "px";
          cropFrameEle.style.top = cropFrameCurrentTop + disY + "px";
        }
        calculateCropImgSize();
        showCropImgSize();
      }
      document
        .querySelectorAll(OuterContainerSelector + " .solid-boundry")
        .forEach((solidEle) => {
          solidEle.addEventListener("dragstart", (event) => {
            startX = event.clientX;
            startY = event.clientY;
            _recordCropFrameProps();
            event.stopPropagation();
          });
          solidEle.addEventListener("drag", (event) => {
            let disX = event.clientX - startX;
            let disY = event.clientY - startY;
            _handleSolidCheck(solidEle, disX, disY);
            event.stopPropagation();
          });
          solidEle.addEventListener("dragend", (event) => {
            let disX = event.clientX - startX;
            let disY = event.clientY - startY;
            _handleSolidCheck(solidEle, disX, disY);
            event.stopPropagation();
          });
        });
    }
    function initFourCornerEvents() {
      if (!OuterContainerSelector) {
        throw "please check the container selector";
      }
      function _handleDoubleCheck(doubleEle, disX, disY) {
        //判断是哪个角
        let classList = doubleEle.classList;
        if (classList.contains("en")) {
          console.log("东北");
          //东北,宽高、top
          cropFrameEle.style.width = cropFrameCurrentWidth + disX + "px";
          cropFrameEle.style.height = cropFrameCurrentHeight - disY + "px";
          cropFrameEle.style.top = cropFrameCurrentTop + disY + "px";
        } else if (classList.contains("es")) {
          //东南,宽高
          cropFrameEle.style.width = cropFrameCurrentWidth + disX + "px";
          cropFrameEle.style.height = cropFrameCurrentHeight + disY + "px";
        } else if (classList.contains("wn")) {
          //西北，宽高，top,left
          cropFrameEle.style.width = cropFrameCurrentWidth - disX + "px";
          cropFrameEle.style.height = cropFrameCurrentHeight - disY + "px";
          cropFrameEle.style.left = cropFrameCurrentLeft + disX + "px";
          cropFrameEle.style.top = cropFrameCurrentTop + disY + "px";
        } else if (classList.contains("ws")) {
          //西南。宽高left
          cropFrameEle.style.width = cropFrameCurrentWidth - disX + "px";
          cropFrameEle.style.height = cropFrameCurrentHeight + disY + "px";
          cropFrameEle.style.left = cropFrameCurrentLeft + disX + "px";
        }
        calculateCropImgSize();
        showCropImgSize();
      }
      document.querySelectorAll(".double-boundry").forEach((doubleEle) => {
        doubleEle.addEventListener("dragstart", (event) => {
          startX = event.clientX;
          startY = event.clientY;
          _recordCropFrameProps();
          event.stopPropagation();
        });
        doubleEle.addEventListener("drag", (event) => {
          let disX = event.clientX - startX;
          let disY = event.clientY - startY;
          _handleDoubleCheck(doubleEle, disX, disY);
          event.stopPropagation();
        });
        doubleEle.addEventListener("dragend", (event) => {
          let disX = event.clientX - startX;
          let disY = event.clientY - startY;
          _handleDoubleCheck(doubleEle, disX, disY);
          event.stopPropagation();
        });
      });
    }
    function initCropFrameDragEvent() {
      cropFrameEle.addEventListener("dragstart", (e) => {
        startX = e.clientX;
        startY = e.clientY;
        cropFrameCurrentLeft = parseFloat(getComputedStyle(cropFrameEle).left);
        cropFrameCurrentTop = parseFloat(getComputedStyle(cropFrameEle).top);
      });
      cropFrameEle.addEventListener("drag", (e) => {
        let currentX = e.clientX;
        let currentY = e.clientY;
        cropFrameEle.style.left =
          cropFrameCurrentLeft + currentX - startX + "px";
        cropFrameEle.style.top = cropFrameCurrentTop + currentY - startY + "px";
      });
      cropFrameEle.addEventListener("dragend", (e) => {
        let currentX = e.clientX;
        let currentY = e.clientY;
        cropFrameEle.style.left =
          cropFrameCurrentLeft + currentX - startX + "px";
        cropFrameEle.style.top = cropFrameCurrentTop + currentY - startY + "px";
      });
    }
    function initBtnClickEvents() {
      document
        .querySelector(OuterContainerSelector + " .bottom-bar > .zoom-in")
        .addEventListener("click", (e) => {
          //点击
          zoomLevel += 0.1;
          resizeImg();
          calculateCropImgSize();
          showCropImgSize();
        });
      document
        .querySelector(OuterContainerSelector + " .bottom-bar > .zoom-out")
        .addEventListener("click", (e) => {
          //点击
          zoomLevel = zoomLevel - 0.1 <= 0 ? 0.1 : zoomLevel - 0.1;
          resizeImg();
          calculateCropImgSize();
          showCropImgSize();
        });
      document
        .querySelector(OuterContainerSelector + " .btn-ok")
        .addEventListener("click", (e) => {
          //处理图片
          dealAfterCrop();
        });
    }
    function dealAfterCrop() {
      //计算剪切起点
      const imgComputedStyle = getComputedStyle(imgSourceEle)
      const cropFrameComputedStyle = getComputedStyle(cropFrameEle)
      let cropStartX = (parseFloat(cropFrameComputedStyle.left)-parseFloat(imgComputedStyle.left))/zoomLevel
      let cropStartY = (parseFloat(cropFrameComputedStyle.top)-parseFloat(imgComputedStyle.top))/zoomLevel
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = cropImgWidth;
      canvas.height = cropImgHeight;

      context.drawImage(
        imgSourceEle,
        cropStartX,
        cropStartY,
        cropImgWidth,
        cropImgHeight,
        0,
        0,
        cropImgWidth,
        cropImgHeight
      );
      console.log(`crop position:${cropStartX} * ${cropStartY}`)
      console.log(`img-size:${cropImgWidth} * ${cropImgHeight}`)
      const bs64 = canvas.toDataURL("image/jpeg");
      canvas.toBlob(blob=>{
        const file = new File([blob],'img.png')
        CropTool.croped && CropTool.croped({
          file,
          bs64
        })
      })
      // const aEle = document.createElement("a");
      // aEle.href = bs64;
      // aEle.download = "image.jpg";
      // aEle.click();
    }
    initFourSolidLineEvents();
    initFourCornerEvents();
    initCropFrameDragEvent();
    initBtnClickEvents();
  }
  function _getBase64EleFromFile(file,callback){
    const fileReader = new FileReader()
    fileReader.readAsDataURL(file)
    fileReader.onload = function(event){
      const bs64 = event.target.result
      const newImg = document.createElement('img')
      newImg.src = bs64
      callback(newImg)
    }
  }
  function _copyImgEle(imgEle){
    const newImg = document.createElement('img');
    newImg.src = imgEle.src;
    return newImg
  }
  function getCropResults(){

  }
  return {
    init(selecor,imgEleOrFile) {


      if(imgEleOrFile instanceof File){
        //文件
        //处理为bs64格式的图片
        _getBase64EleFromFile(imgEleOrFile,newImg=>{
          mountDOMStructure(selecor,newImg);
          initEvents();
        })
      }else if(imgEleOrFile instanceof Image){
        //图片元素,拷贝一份
        mountDOMStructure(selecor,_copyImgEle(imgEleOrFile));
        initEvents();
      }
      
    },
    //替换图片
    close(){
      _close()
    }
  };
})();
