const cropTool = (function () {
  let _root = null;
  let _desk = null;
  let _operateBox;
  let _cropFrameBox;
  let _topBarBox;
  let _bottomBarBox;

  let _plateImageBox;
  let _resizeHanlde;
  let _currentImg;

  let _windowWidth;
  let _windowHeight;

  let _originImgWidth;
  let _originImgHeight;
  let _tempImageWidth;
  let _tempImageHeight;
  let _tempPlateImageBoxLeft;
  let _tempPlateImageBoxTop;
  let _originViewRatio;
  let _cropping = false;
  let _resizing = false;

  //结果数据缓存
  let _bs64;
  let _blob;
  //add drag listening
  function _whenDragHappens(domElement, progressFn, completeFn) {
    let originX;
    let originY;
    let target;
    const targetStyle = {
      left: 0,
      top: 0,
      width: 0,
      height: 0,
    };
    function moveFn(event) {
      event.stopPropagation();
      const distanceX = event.clientX - originX;
      const distanceY = event.clientY - originY;
      const offsetDis = {
        x: distanceX,
        y: distanceY,
      };
      progressFn(targetStyle, offsetDis, target);
    }
    function upFn(event) {
      event.stopPropagation();
      document.removeEventListener("mousemove", moveFn);
      document.removeEventListener("mouseup", upFn);
      completeFn();
    }
    domElement.addEventListener("mousedown", function (event) {
      //记录鼠标按下的位置
      originX = event.clientX;
      originY = event.clientY;
      target = event.target;
      const computedStyle = getComputedStyle(domElement);
      targetStyle.left = parseFloat(computedStyle.left);
      targetStyle.top = parseFloat(computedStyle.top);
      targetStyle.width = parseFloat(computedStyle.width);
      targetStyle.height = parseFloat(computedStyle.height);
      event.preventDefault(); //知识点
      event.stopPropagation();
      document.addEventListener("mousemove", moveFn);
      document.addEventListener("mouseup", upFn);
    });
  }
  //拉伸、压缩
  function enableResize() {}
  function _addDragToDom(targetEle) {}
  function _initRatio() {
    if (_windowWidth >= _originImgWidth) {
      _originViewRatio = 1;
    } else {
      _originViewRatio = _windowWidth / _originImgWidth;
    }
  }
  function _updateImageViewSize() {
    _currentImg.style.width = _originImgWidth * _originViewRatio + "px";
    _currentImg.style.height = _originImgHeight * _originViewRatio + "px";

    //记录目前的视觉尺寸、更新
    _tempImageWidth = _originImgWidth * _originViewRatio;
    _tempImageHeight = _originImgHeight * _originViewRatio;
  }
  function _centeredImage() {
    //需要对底片的视觉尺寸判断，
    //对可视区做出适配、置中
    const computedStyle = getComputedStyle(_plateImageBox);

    const leftValue =
      parseFloat(computedStyle.width) < _windowWidth
        ? (_windowWidth - parseFloat(computedStyle.width)) / 2
        : 0;
    const topValue =
      parseFloat(computedStyle.height) < _windowHeight
        ? (_windowHeight - parseFloat(computedStyle.height)) / 2
        : 0;

    _plateImageBox.style.left = leftValue + "px";
    _plateImageBox.style.top = topValue + "px";
  }
  function _updateCropFrameViewSize() {
    //如果有底片，设置尺寸显示为底片视觉尺寸的80%
    if (_currentImg) {
      const computedStyle = getComputedStyle(_plateImageBox);
      _cropFrameBox.style.width = parseFloat(computedStyle.width) * 0.5 + "px";
      _cropFrameBox.style.height =
        parseFloat(computedStyle.height) * 0.5 + "px";
    } else {
      //没有则默认设置
      _cropFrameBox.style.width = "200px";
      _cropFrameBox.style.height = "200px";
    }
  }
  function _centeredCropFrame() {
    const computedStylePlateImage = getComputedStyle(_plateImageBox);
    console.log(computedStylePlateImage.left);
    setTimeout(() => {
      console.log(computedStylePlateImage.left);
    }, 0);
    const computedStyleCropFrame = getComputedStyle(_cropFrameBox);
    //有底片,居中，否则就从底片的起点开始
    if (_currentImg) {
      const disXFromCropToPlateImage =
        (parseFloat(computedStylePlateImage.width) -
          parseFloat(computedStyleCropFrame.width)) /
        2;
      const disYFromCropToPlateImage =
        (parseFloat(computedStylePlateImage.height) -
          parseFloat(computedStyleCropFrame.height)) /
        2;
      console.log(
        parseFloat(computedStylePlateImage.left),
        disXFromCropToPlateImage
      );
      _cropFrameBox.style.left =
        parseFloat(computedStylePlateImage.left) +
        disXFromCropToPlateImage +
        "px";
      _cropFrameBox.style.top =
        parseFloat(computedStylePlateImage.top) +
        disYFromCropToPlateImage +
        "px";
    } else {
      _cropFrameBox.style.left = computedStylePlateImage.left;
      _cropFrameBox.style.top = computedStylePlateImage.top;
    }
  }
  function _showCropFrameSize() {
    const computedStyle = getComputedStyle(_cropFrameBox);
    const width = parseFloat(computedStyle.width);
    const height = parseFloat(computedStyle.height);
    console.log(_originViewRatio);
    _cropFrameBox.querySelector(".value_W").innerText = (
      width / _originViewRatio
    ).toFixed(2);
    _cropFrameBox.querySelector(".value_H").innerText = (
      height / _originViewRatio
    ).toFixed(2);
  }
  function _showOriginSize() {
    _plateImageBox.querySelector(
      ".value_W"
    ).innerText = _originImgWidth.toFixed(2);
    _plateImageBox.querySelector(
      ".value_H"
    ).innerText = _originImgHeight.toFixed(2);
  }
  function _updateImagePlateImageBoxPos() {
    //记录图片的视觉尺寸,以及底片的位置
    _tempImageWidth = parseFloat(_currentImg.style.width);
    _tempImageHeight = parseFloat(_currentImg.style.height);
    _tempPlateImageBoxLeft = parseFloat(_plateImageBox.style.left);
    _tempPlateImageBoxTop = parseFloat(_plateImageBox.style.top);
  }
  function enableCrop() {
    //打开剪切的控制开关,并关闭视图
    _cropFrameBox.style.display = "block";
    _cropping = true;
  }
  function disableCrop() {
    _cropFrameBox.style.display = "none";
    _cropping = false;
  }
  function enableResize() {
    _resizeHanlde.style.display = "block";
    _resizing = true;
  }
  function disableResize() {
    _resizeHanlde.style.display = "none";
    _resizing = false;
  }
  function zoomIn() {
    if (_originViewRatio > 0) {
      _originViewRatio -= 0.1;
    }
    _updateImageViewSize();
    _showCropFrameSize();
  }
  function zoomOut() {
    _originViewRatio += 0.1;
    _updateImageViewSize();
    _showCropFrameSize();
  }
  function download() {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = _originImgWidth;
    canvas.height = _originImgHeight;

    context.drawImage(
      _currentImg,
      0,
      0,
      _originImgWidth,
      _originImgHeight,
      0,
      0,
      _originImgWidth,
      _originImgHeight
    );
    const bs64 = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = bs64;
    a.download = "newfile.png";
    a.click();
  }
  function execCrop() {
    //生成bs64,然后根据此bs64创建新的图片元素

    const cropSize = {
      width: parseFloat(_cropFrameBox.style.width) / _originViewRatio,
      height: parseFloat(_cropFrameBox.style.height) / _originViewRatio,
    };
    const cropPoint = {
      x:
        (parseFloat(_cropFrameBox.style.left) -
          parseFloat(_plateImageBox.style.left)) /
        _originViewRatio,
      y:
        (parseFloat(_cropFrameBox.style.top) -
          parseFloat(_plateImageBox.style.top)) /
        _originViewRatio,
    };
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = cropSize.width;
    canvas.height = cropSize.height;

    context.drawImage(
      _currentImg,
      cropPoint.x,
      cropPoint.y,
      cropSize.width,
      cropSize.height,
      0,
      0,
      cropSize.width,
      cropSize.height
    );
    //缓存bs64
    const bs64 = (_bs64 = canvas.toDataURL("image/png"));
    canvas.toBlob(function (blobObj) {
      _blob = blobObj;
    });
    const newImg = document.createElement("img");
    newImg.src = bs64;
    insertImage(newImg);
  }
  function insertImage(fileOrImgElement) {
    if (_currentImg) {
      //先移除图片
      _plateImageBox.removeChild(_currentImg);
      _currentImg = null;
    }
    if (fileOrImgElement instanceof File) {
      let fileReader = new FileReader();
      fileReader.readAsDataURL(fileOrImgElement);
      fileReader.onload = function (event) {
        const dataUrl = event.target.result;
        //复制一个img标签保存
        _currentImg = document.createElement("img");
        _currentImg.src = dataUrl;
        _currentImg.onload = function () {
          //记录图片的原始尺寸
          _originImgWidth = _currentImg.width;
          _originImgHeight = _currentImg.height;
          //根据屏幕尺寸初始化比例尺、比例尺初始化图形视觉尺寸、居中图片
          _initRatio();
          _updateImageViewSize();
          _centeredImage();
          _updateCropFrameViewSize(); //根据原始尺寸和比例尺按百分比或者默认计算好剪切框的尺寸
          _centeredCropFrame();
          _showCropFrameSize();

          //显示原始尺寸
          _showOriginSize();
          _updateImagePlateImageBoxPos();
        };
        _plateImageBox.appendChild(_currentImg);
      };
    } else {
      //复制一个img标签保存
      _currentImg = document.createElement("img");
      _currentImg.src = fileOrImgElement.src;
      _currentImg.onload = function () {
        //记录图片的原始尺寸
        _originImgWidth = _currentImg.width;
        _originImgHeight = _currentImg.height;
        //根据屏幕尺寸初始化比例尺、比例尺初始化图形视觉尺寸、居中图片
        _initRatio();
        _updateImageViewSize();
        _centeredImage();
        _updateCropFrameViewSize(); //根据原始尺寸和比例尺按百分比或者默认计算好剪切框的尺寸
        _centeredCropFrame();
        _showCropFrameSize();
        //显示原始尺寸
        _showOriginSize();
        _updateImagePlateImageBoxPos();
      };
      _plateImageBox.appendChild(_currentImg);
    }
  }
  function resizeImage(ratio) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = _originImgWidth * ratio;
    canvas.height = _originImgHeight * ratio;

    context.drawImage(
      _currentImg,
      0,
      0,
      _originImgWidth,
      _originImgHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );
    const bs64 = (_bs64 = canvas.toDataURL("image/png"));
    canvas.toBlob(function (blobObj) {
      _blob = blobObj;
    });
    const newImg = document.createElement("img");
    newImg.src = bs64;
    return newImg;
  }
  function output(type,callback) {
    if (!_bs64 || !_blob) {
      //如果没有发生剪切或拉伸行为，则将原图处理后返回
      console.log(_currentImg);
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = _originImgWidth;
      canvas.height = _originImgHeight;

      context.drawImage(
        _currentImg,
        0,
        0,
        _originImgWidth,
        _originImgWidth,
        0,
        0,
        _originImgWidth,
        _originImgWidth
      );
      //缓存bs64
      _bs64 = canvas.toDataURL("image/png");
      canvas.toBlob(function (blobObj) {
        _blob = blobObj;
        if (type === "bs64") {
          callback(_bs64);
        } else if (type === "blob") {
          callback(_blob);
        }
      });
    }else{
      if (type === "bs64") {
        callback(_bs64);
      } else if (type === "blob") {
        callback(_blob);
      }
    }
  }
  function init(selector) {
    _windowWidth = window.innerWidth;
    _windowHeight = window.innerHeight;
    _root = document.querySelector(selector);
    //insert layout
    _root.innerHTML = `<div class="crop_layout">
            <div class="desktop">
                <div class="operate-box">
                    <div class="plate_image-box">
                        <div class="resize-box" style="display:none;">
                          <div class="resize_corner_top_left"></div>
                          <div class="resize_corner_top_right"></div>
                          <div class="resize_corner_bottom_left"></div>
                          <div class="resize_corner_bottom_right"></div>
                          <!-- 悬浮框展示剪切框大小 -->
                          <div class="tooltip_box">
                              <div>
                                  <span class="key">W</span>
                                  <span>:</span>
                                  <span class="value_W">0</span> PX
                              </div>
                              <div>
                                  <span class="key">H</span>
                                  <span>:</span>
                                  <span class="value_H">0</span> PX
                              </div>
                          </div>
                        </div>
                    </div>
                    <div class="crop_cropFrame" style="display:none;">
                    <!-- 悬浮框展示剪切框大小 -->
                    <div class="tooltip-box">
                      <div>
                        <span class="key">W</span>
                        <span>:</span>
                        <span class="value_W">0</span> PX
                      </div>
                      <div>
                        <span class="key">H</span>
                        <span>:</span>
                        <span class="value_H">0</span> PX
                      </div>
                    </div>
                    <!-- 填充盒子，撑起框的样式 -->
                    <div class="frame-box">
                        <div class="horizontal"></div>
                        <div class="vertical"></div>
                    </div>
                    
                    <!-- 线上的四个中位点 -->
                    <div class="inline_dot-box">
                        <div class="inline_dot left"></div>
                        <div class="inline_dot right"></div>
                        <div class="inline_dot top"></div>
                        <div class="inline_dot bottom"></div>
                    </div>
                    
                    <!-- 覆盖技术:遮盖住前面所有的同级元素，可忽略其他兄弟元素的事件... -->
                    <!-- 操作句柄 盒子-->
                    <div class="handle-box">
                        <div class="resize_line_left"></div>
                        <div class="resize_line_right"></div>
                        <div class="resize_line_top"></div>
                        <div class="resize_line_bottom"></div>
        
                        <div class="resize_corner_top_left"></div>
                        <div class="resize_corner_top_right"></div>
                        <div class="resize_corner_bottom_left"></div>
                        <div class="resize_corner_bottom_right"></div>
                    </div>
                </div>
                </div>
                <div class="top_bar-box">
                  <button class="execute iconfont icon-tick"></button>
                  <button class="download iconfont icon-upload_icon"></button>
                  <button class="close iconfont icon-Close"></button>
                </div>
                <div class="bottom_bar-box">
                  <button class="zoom-out iconfont icon-plus"></button>
                  <button class="zoom-in iconfont icon-suoxiao"></button>
                  <button class="crop iconfont icon-crop"></button>
                  <button class="resize iconfont icon-lashen"></button>
                </div>
            </div>
        </div>`;
    _root.style.display = "none"; //默认关闭
    //记录容器元素
    _desk = _root.querySelector(".desktop");
    _operateBox = _root.querySelector(".operate-box");
    _plateImageBox = _root.querySelector(".plate_image-box");
    _topBarBox = _root.querySelector(".top_bar-box");
    _bottomBarBox = _root.querySelector(".bottom_bar-box");
    _cropFrameBox = _root.querySelector(".crop_cropFrame");
    _resizeHanlde = _root.querySelector(".resize-box");
    //添加剪切的drag事件
    _whenDragHappens(
      _cropFrameBox,
      function (targetStyle, offsetDis, target) {
        if (target.classList.contains("handle-box")) {
          _cropFrameBox.style.left = targetStyle.left + offsetDis.x + "px";
          _cropFrameBox.style.top = targetStyle.top + offsetDis.y + "px";
        } else {
          //几个方向键
          switch (target.className) {
            case "resize_line_left":
              //互补left值和width值
              _cropFrameBox.style.left = targetStyle.left + offsetDis.x + "px";
              _cropFrameBox.style.width =
                targetStyle.width - offsetDis.x + "px";
              break;
            case "resize_line_top":
              //互补top值和height值
              _cropFrameBox.style.top = targetStyle.top + offsetDis.y + "px";
              _cropFrameBox.style.height =
                targetStyle.height - offsetDis.y + "px";
              break;
            case "resize_line_right":
              //改变width值
              _cropFrameBox.style.width =
                targetStyle.width + offsetDis.x + "px";
              break;
            case "resize_line_bottom":
              //改变height值
              _cropFrameBox.style.height =
                targetStyle.height + offsetDis.y + "px";
              break;
            case "resize_corner_top_left":
              //改变宽度、高度、left、top
              _cropFrameBox.style.left = targetStyle.left + offsetDis.x + "px";
              _cropFrameBox.style.top = targetStyle.top + offsetDis.y + "px";
              _cropFrameBox.style.width =
                targetStyle.width - offsetDis.x + "px";
              _cropFrameBox.style.height =
                targetStyle.height - offsetDis.y + "px";
              break;
            case "resize_corner_top_right":
              //改变宽度、高度、top
              _cropFrameBox.style.top = targetStyle.top + offsetDis.y + "px";
              _cropFrameBox.style.width =
                targetStyle.width + offsetDis.x + "px";
              _cropFrameBox.style.height =
                targetStyle.height - offsetDis.y + "px";
              break;
            case "resize_corner_bottom_left":
              //left width height
              _cropFrameBox.style.left = targetStyle.left + offsetDis.x + "px";
              _cropFrameBox.style.width =
                targetStyle.width - offsetDis.x + "px";
              _cropFrameBox.style.height =
                targetStyle.height + offsetDis.y + "px";
              break;
            case "resize_corner_bottom_right":
              //高度、宽度
              _cropFrameBox.style.width =
                targetStyle.width + offsetDis.x + "px";
              _cropFrameBox.style.height =
                targetStyle.height + offsetDis.y + "px";
              break;
          }
          //根据剪切框的大小和底片的ratio比例折算剪切框的大小
          _showCropFrameSize();
        }
      },
      function () {
        //completed
      }
    );
    //添加resize的drag事件
    _whenDragHappens(
      _resizeHanlde,
      function (targetStyle, offsetDis, target) {
        const className = target.className;
        if (className.indexOf("resize_corner") === 0) {
          const _tempRatio = _tempImageWidth / _tempImageHeight;
          switch (className) {
            case "resize_corner_top_left":
              //修改left,top，width，height
              _currentImg.style.width = _tempImageWidth - offsetDis.x + "px";
              _plateImageBox.style.left =
                _tempPlateImageBoxLeft + offsetDis.x + "px";
              _currentImg.style.height =
                _tempImageHeight - offsetDis.x / _tempRatio + "px";
              _plateImageBox.style.top =
                _tempPlateImageBoxTop + offsetDis.x / _tempRatio + "px";
              break;
            case "resize_corner_top_right":
              //修改left,top，width，height
              _currentImg.style.width = _tempImageWidth + offsetDis.x + "px";
              _currentImg.style.height =
                _tempImageHeight + offsetDis.x / _tempRatio + "px";
              _plateImageBox.style.top =
                _tempPlateImageBoxTop - offsetDis.x / _tempRatio + "px";
              break;
            case "resize_corner_bottom_left":
              //修改left,top，width，height
              _currentImg.style.width = _tempImageWidth - offsetDis.x + "px";
              _plateImageBox.style.left =
                _tempPlateImageBoxLeft + offsetDis.x + "px";
              _currentImg.style.height =
                _tempImageHeight - offsetDis.x / _tempRatio + "px";
              break;
            case "resize_corner_bottom_right":
              //修改left,top，width，height
              _currentImg.style.width = _tempImageWidth + offsetDis.x + "px";
              _currentImg.style.height =
                _tempImageHeight + offsetDis.x / _tempRatio + "px";
              break;
          }
          //计算缩放比例，更新原始尺寸的显示
          const currentWidth =
            _tempImageWidth + offsetDis.x > 0
              ? _tempImageWidth + offsetDis.x
              : 0;
          const currentRatio = currentWidth / _tempImageWidth;

          _plateImageBox.querySelector(".value_W").innerText = (
            _originImgWidth * currentRatio
          ).toFixed(2);
          _plateImageBox.querySelector(".value_H").innerText = (
            _originImgHeight * currentRatio
          ).toFixed(2);
        }
      },
      function () {
        //计算拉伸前后的视觉尺寸差别，然后以图片真实尺寸为基本重新生成一个图片。
        const currentWidth = parseFloat(_currentImg.style.width);
        const ratio = currentWidth / _tempImageWidth;
        //生成一个新的图片替换原来的图片
        const newImg = resizeImage(ratio);
        insertImage(newImg);
      }
    );
    //添加resize事件
    window.onresize = function () {
      _windowWidth = window.innerWidth;
      _windowHeight = window.innerHeight;
      //   _initRatio();
      //   _updateImageViewSize();
      _centeredImage();
    };
    //添加缩放按钮点击事件
    _desk.addEventListener("click", function (event) {
      let classList = event.target.classList;
      if (classList.contains("zoom-in")) {
        zoomIn();
      } else if (classList.contains("zoom-out")) {
        zoomOut();
      } else if (classList.contains("crop")) {
        enableCrop();
        disableResize();
      } else if (classList.contains("resize")) {
        disableCrop();
        enableResize();
        _updateImagePlateImageBoxPos();
      } else if (classList.contains("execute")) {
        if (_cropping) {
          execCrop();
        }
        disableResize();
        //关闭剪切框
        disableCrop();
      } else if (classList.contains("download")) {
        download();
      } else if (classList.contains("close")) {
        close();
        _workstation.onclose && _workstation.onclose();
      }
    });
    //记录工作台对象
    _workstation = {
      insertImage,
      enableCrop,
      disableCrop,
      enableResize,
      disableResize,
      zoomIn,
      zoomOut,
      output,
      open,
      close,
      // forward,
      // backward,
      // destroy
    };

    return _workstation;
  }
  function open() {
    _root.style.display = "block";
  }
  function close() {
    _root.style.display = "none";
  }
  return {
    init: init,
  };
})();
