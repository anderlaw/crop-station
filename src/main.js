const Workstation = (function () {
  let _currentImage;
  let _workstation = {
    ref: null, //引用
    width:0,
    height:0,
  }; //工作站容器元素的引用
  let _resourcePool = []; //
  let _plateImage = {
    ref: null,
    ratio: 1,
    realWidth: 0,
    realHeight: 0,
    left:0,
    top:0
  };
  let _cropFrame = {
    ref: null,
    realWidth: 0,
    realHeight: 0,
    left:0,
    top:0
  };
  function _cookDom(selector) {
    //挂载DOM结构
    const container = document.querySelector(selector);
    container.innerHTML = `<div class="crop_workstation"></div>`;
    const workstation = container.querySelector(".crop_workstation");
    //计算工作台的尺寸
    workstationWidth = parseFloat(getComputedStyle(workstation).width)
    workstationHeight = parseFloat(getComputedStyle(workstation).height)
    workstation.style.display = "none";//隐藏工作台
    //初始化UI
    workstation.innerHTML = `
    <div class="crop_desktop">
        <div class="crop_plateImage">
            <div class="resize"></div>
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
        <div class="crop_cropFrame">

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
            <!-- 填充盒子，撑起框的样式 -->
            <div class="fill_box">
                <div class="horizontal"></div>
                <div class="vertical"></div>
            </div>
            
            <!-- 四个方向的点 -->
            <div class="inline-dot_box">
                <div class="inline-dot left"></div>
                <div class="inline-dot right"></div>
                <div class="inline-dot top"></div>
                <div class="inline-dot bottom"></div>
            </div>
            
            <!-- 知识点：覆盖技术 -->
            <!-- 四面八方 -->
            <div class="cover-child_box">
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
    <div class="crop_topbar">

    </div>
    <div class="crop_bottombar">

    </div>
</div>  
    `;
    
    //保存引用及工作台的尺寸
    _plateImage.ref = container.querySelector(".crop_plateImage");
    _cropFrame.ref = container.querySelector(".crop_cropFrame");
    _workstation.ref = workstation;
    _workstation.width = workstationWidth;
    _workstation.height = workstationHeight;
  }
  function _initPlateImage() {
    //如果图片尺寸宽度小于工作桌面的宽度，则居中展示
    const computedStylePlate = getComputedStyle(_plateImage.ref);
    const plateImgWidth = parseFloat(computedStylePlate.width);
    const plateImgHeight = parseFloat(computedStylePlate.height);
    _plateImage.realWidth = plateImgWidth;
    _plateImage.realHeight = plateImgHeight;

    if (plateImgWidth < _workstation.width) {
      _plateImage.ref.style.left = (_workstation.width - plateImgWidth) / 2 + "px";
    }

    if (plateImgHeight < _workstation.height) {
      _plateImage.ref.style.top = (_workstation.height - plateImgHeight) / 2 + "px";
    }
  }
  function _initCropFrame() {
    //设置剪切框的默认大小，等于底片图片的大小
  }
  function followMouse(target, originPos, offsetDis) {}
  function _whenDragHappens(domElement, fn) {
    let originX;
    let originY;
    let eventTarget;
    const originPos = {
      left: 0,
      top: 0,
      width: 0,
      height: 0,
    };
    function moveFn(event) {
      const distanceX = event.clientX - originX;
      const distanceY = event.clientY - originY;
      const offsetDis = {
        x: distanceX,
        y: distanceY,
      };
      fn(originPos, offsetDis, eventTarget);
    }
    function upFn() {
      document.removeEventListener("mousemove", moveFn);
      document.removeEventListener("mouseup", upFn);
    }
    domElement.addEventListener("mousedown", function (event) {
      //记录鼠标按下的位置
      originX = event.clientX;
      originY = event.clientY;
      eventTarget = event.target;
      const computedStyle = getComputedStyle(domElement);
      originPos.left = parseFloat(computedStyle.left);
      originPos.top = parseFloat(computedStyle.top);
      originPos.width = parseFloat(computedStyle.width);
      originPos.height = parseFloat(computedStyle.height);

      event.preventDefault(); //知识点
      document.addEventListener("mousemove", moveFn);
      document.addEventListener("mouseup", upFn);
    });
  }
  //修改图片的尺寸
  function _resizeImage(newSize){
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = newSize.width;
      canvas.height = newSize.height;
      _plateImage.ref.querySelector('.value_W').innerText = newSize.width.toFixed(2);
      _plateImage.ref.querySelector('.value_H').innerText = newSize.height.toFixed(2);
      context.drawImage(
        _currentImage,
        0,
        0,
        _plateImage.realWidth,
        _plateImage.realHeight,
        0,
        0,
        newSize.width,
        newSize.height
      );
      const bs64 = canvas.toDataURL("image/png");
      const newImg = document.createElement('img');
      newImg.src = bs64;
      _resourcePool.push(newImg);
      _plateImage.ref.removeChild(_workstation.ref.querySelector('img'))
      _plateImage.ref.appendChild(newImg)
      
      // const a = document.createElement('a')
      // a.href = bs64;
      // a.download = "image.jpg";
      // a.click()
  }
  //workstation
  function init(selector) {
    //装载DOM
    _cookDom(selector);

    //设置底片的拖拽
    _whenDragHappens(_plateImage.ref, function (originPos, offsetDis, target) {
      if (target.classList.contains("resize")) {
        //等比例改变图片本身尺寸。只需要改变图片的大小即可
        const width = originPos.width + offsetDis.x;
        const xyRatio = _plateImage.realWidth/_plateImage.realHeight;
        const height = width / xyRatio;
        _resizeImage({
          width:width,
          height:height,
        })
      }else if(target.tagName.toLowerCase() === 'img'){
        //拖拽

        //记录位置信息
        _plateImage.left = originPos.left + offsetDis.x;
        _plateImage.top = originPos.top + offsetDis.y

        //设置left.top到对应的位置
        _plateImage.ref.style.left = _plateImage.left + "px";
        _plateImage.ref.style.top = _plateImage.top + "px";
      }
      

    });
    //设置剪切框的拖拽,本身的拖拽和一些边界线的拉伸。

    _whenDragHappens(_cropFrame.ref, function (originPos, offsetDis, target) {
      // const cropAllowDragClassNameArr = [];
      if (target.classList.contains("cover-child_box")) {
        _cropFrame.ref.style.left = originPos.left + offsetDis.x + "px";
        _cropFrame.ref.style.top = originPos.top + offsetDis.y + "px";
      } else {
        //几个方向键
        switch (target.className) {
          case "resize_line_left":
            //互补left值和width值
            _cropFrame.ref.style.left = originPos.left + offsetDis.x + "px";
            _cropFrame.ref.style.width = originPos.width - offsetDis.x + "px";
            break;
          case "resize_line_top":
            //互补top值和height值
            _cropFrame.ref.style.top = originPos.top + offsetDis.y + "px";
            _cropFrame.ref.style.height = originPos.height - offsetDis.y + "px";
            break;
          case "resize_line_right":
            //改变width值
            _cropFrame.ref.style.width = originPos.width + offsetDis.x + "px";
            break;
          case "resize_line_bottom":
            //改变height值
            _cropFrame.ref.style.height = originPos.height + offsetDis.y + "px";
            break;
          case "resize_corner_top_left":
            //改变宽度、高度、left、top
            _cropFrame.ref.style.left = originPos.left + offsetDis.x + "px";
            _cropFrame.ref.style.top = originPos.top + offsetDis.y + "px";
            _cropFrame.ref.style.width = originPos.width - offsetDis.x + "px";
            _cropFrame.ref.style.height = originPos.height - offsetDis.y + "px";
            break;
          case "resize_corner_top_right":
            //改变宽度、高度、top
            _cropFrame.ref.style.top = originPos.top + offsetDis.y + "px";
            _cropFrame.ref.style.width = originPos.width + offsetDis.x + "px";
            _cropFrame.ref.style.height = originPos.height - offsetDis.y + "px";
            break;
          case "resize_corner_bottom_left":
            //left width height
            _cropFrame.ref.style.left = originPos.left + offsetDis.x + "px";
            _cropFrame.ref.style.width = originPos.width - offsetDis.x + "px";
            _cropFrame.ref.style.height = originPos.height + offsetDis.y + "px";
            break;
          case "resize_corner_bottom_right":
            //高度、宽度
            _cropFrame.ref.style.width = originPos.width + offsetDis.x + "px";
            _cropFrame.ref.style.height = originPos.height + offsetDis.y + "px";
            break;
        }
        //根据剪切框的大小和底片的ratio比例折算剪切框的大小
        _cropFrame.realWidth = parseFloat(getComputedStyle(_cropFrame.ref).width)/_plateImage.ratio
        _cropFrame.realHeight = parseFloat(getComputedStyle(_cropFrame.ref).height)/_plateImage.ratio
        //更新剪切框的尺寸展示
        _cropFrame.ref.querySelector('.value_W').innerText = _cropFrame.realWidth.toFixed(2)
        _cropFrame.ref.querySelector('.value_H').innerText = _cropFrame.realHeight.toFixed(2)
      }
    });
  }
  //操作桌面 desktop

  //function
  function cpImgtoDom(image){
    const newImg = document.createElement("img");
    newImg.src = image.src;
    newImg.style.display = "none"
    document.body.appendChild(newImg);
    _currentImage = newImg
  }
  //insert image
  function insertImage(imageEleOrFile) {
    //统一以文件的形式存储
    if (imageEleOrFile instanceof File) {
      //文件对象
      const fileReader = new FileReader();
      fileReader.readAsDataURL(imageEleOrFile);
      fileReader.onload = function (event) {
        const bs64 = event.target.result;
        const newImg = document.createElement("img");
        newImg.src = bs64;
        _plateImage.ref.appendChild(newImg);
        //初始化底片位置
        newImg.onload = function () {
          _initPlateImage()
        };
        cpImgtoDom(newImg)
      };
    } else if (imageEleOrFile instanceof Image) {
      //img
      const newImg = document.createElement("img");
      newImg.src = imageEleOrFile.src;
      _plateImage.ref.appendChild(newImg);
      newImg.onload = function () {
        _initPlateImage()
      };
      
      cpImgtoDom(newImg)
    }
    // if(_resourcePool.length >= 5){
    //   _resourcePool.shift()
    // }
    // const currentFile = '';
    // _resourcePool.push(currentFile)
  }
  //切换剪切框
  function _switchCropFrame(display) {
    _cropFrame.ref.style.display = display;
  }
  // function
  function setVisibility(visible) {
    if (visible) {
      _workstation.ref.style.display = "block";
    } else {
      _workstation.ref.style.display = "none";
    }
  }
  /* return workstation */
  return {
    init,
    insertImage,
    setVisibility: setVisibility,
  };
})();
