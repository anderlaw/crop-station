const CropStation = (function () {
  //此处写可以复用，跟实例无关的工具函数
  function _close() {
    this._root.style.display = "none";
  }
  function _open() {
    this._root.style.display = "block";
  }
  /**
   *切换执行、取消按钮的显示与隐藏
   * @param {boolean} visibility
   */
  function _switchExecuteCancelBtnVisible(visibility) {
    if (visibility) {
      this._desk.querySelector(
        ".execute"
      ).style.display = this._desk.querySelector(".cancel").style.display =
        "inline-block";
    } else {
      this._desk.querySelector(
        ".execute"
      ).style.display = this._desk.querySelector(".cancel").style.display =
        "none";
    }
  }
  /**
   * 显示、并初始化剪切框的位置、和toolTip映射大小。
   */
  function _showCropBox() {
    this._cropBox.style.display = 'block';
    //根据图片的视图尺寸（默认60%）
    this._cropBox.style.width =
      parseFloat(this._plateImageBox.style.width) * 0.6 + "px";
    this._cropBox.style.height =
      parseFloat(this._plateImageBox.style.height) * 0.6 + "px";
    //初始化剪切框的位置（居中）
    this._cropBox.style.left =
      parseFloat(this._plateImageBox.style.left) +
      parseFloat(this._plateImageBox.style.width) * (1 - 0.6) /2+
      "px";
    this._cropBox.style.top =
      parseFloat(this._plateImageBox.style.top) +
      parseFloat(this._plateImageBox.style.height) * (1 - 0.6) /2+
      "px";

    //根据剪切框的大小，显示toolTip 内容
    _updateCropSizeToolTip.call(this,'crop')
  }
  function _hideCropBox() {
    this._cropBox.style.display = 'none';
  }

  /**
   * @param {string} type:"crop"|"resize"
   */
  function _updateCropSizeToolTip(type) {
    //
    /**
     * 显示剪切框代表的真实图片大小:
     * 1.剪切框的像素尺寸
     * 2.图片展示尺寸与真实尺寸的比例尺
     *
     * 显示拉伸图片的真实大小：
     * 1.图片的像素尺寸
     * 2.图片展示尺寸与真实尺寸的比例尺
     */
    if(type === 'crop'){
      //剪切提示
      this._cropBox.querySelector(".value_W").innerText = (
        parseFloat(this._cropBox.style.width) / this.ratio
      ).toFixed(2);
      this._cropBox.querySelector(".value_H").innerText = (
        parseFloat(this._cropBox.style.height) / this.ratio
      ).toFixed(2);
    }
  }
  /**
   * 根据提供的图片元信息，计算显示尺寸和比例尺
   * @param {{width:number,height:number}} imageMeta
   */
  /**
   * 根据比例尺更新底片盒子的尺寸
   */
  function _updatePlateImageSize() {
    //根据最新的比例尺适配底片盒子
    this._plateImageBox.style.width =
      this._imageMetaSize.width * this.ratio + "px";
    this._plateImageBox.style.height =
      this._imageMetaSize.height * this.ratio + "px";
  }
  /**
   * 
   * @param {HTMLElement} imageEle 图片元素
   * @param {{x:number,y:number}} beginPos 起始位置
   * @param {{width:number,height:number}} sizeObj 生成的图片大小
   * @param {Function({file,bs64})} callback 回调函数
   */
  function _imageTobs64AndFile(imageEle,beginPos,sizeObj,callback){
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = sizeObj.width;
    canvas.height = sizeObj.height;
    context.drawImage(
      imageEle,
      beginPos.x,
      beginPos.y,
      canvas.width,
      canvas.height,
      0,
      0,
      canvas.width,
      canvas.height
    );
    const _bs64 = canvas.toDataURL("image/jpeg",.5);
    canvas.toBlob(function (blobObj) {
      const _file = new File([blobObj],'new-image.png')
      callback && callback({
        file:_file,
        bs64:_bs64
      })
    },"image/jpeg",.5);
  }

  /**
   * 剪切图片
   */
  function _cropImage(){
    //计算剪切框对应真实尺寸
    const width = parseFloat(this._cropBox.style.width)/this.ratio;
    const height = parseFloat(this._cropBox.style.height)/this.ratio;
    //计算剪切起点位置(剪切框的left减去底片的left)
    const beginX = parseFloat(this._cropBox.style.left) - parseFloat(this._plateImageBox.style.left)
    const beginY = parseFloat(this._cropBox.style.top) - parseFloat(this._plateImageBox.style.top)
    
    _imageTobs64AndFile(this._image,{
      x:beginX,
      y:beginY
    },{
      width:width,
      height:height
    },(result)=>{
      //缓存bs64、file
      this._bs64 = result.bs64
      this._file = result.file

      //将新图片插入到底片中
      const newImg = document.createElement("img");
      newImg.src = this._bs64;
      _updateImage.call(this,newImg)
    })
  }
  /**
   * 结合图片metaSize、可视区的尺寸初始化比例尺
   */
  function _initRatio() {
    //计算比例尺
    if (window.innerWidth >= this._imageMetaSize.width) {
      this.ratio = 1;
    } else {
      this.ratio = window.innerWidth / this._imageMetaSize.width;
    }
  }
  /**
   * 居中底片盒子
   */
  function _alignPlateImageCenter() {
    //底片居中处理
    const resolveOffsetLeft =
      (window.innerWidth - parseFloat(this._plateImageBox.style.width)) / 2;
    const resolveOffsetTop =
      (window.innerHeight - parseFloat(this._plateImageBox.style.height)) / 2;
    this._plateImageBox.style.left =
      (resolveOffsetLeft >= 0 ? resolveOffsetLeft : 0) + "px";
    this._plateImageBox.style.top =
      (resolveOffsetTop >= 0 ? resolveOffsetTop : 0) + "px";
  }
  /**
   * 根据原本的样式添加相应的行内样式
    方便后续操作
    只针对定位元素
   * @param {HTMLElement} domElement 
   */
  function _convertToInlineStyle(domElement) {
    //
    const computedStyle = window.getComputedStyle(domElement);
    if (
      computedStyle.position != "absolute" &&
      computedStyle.position != "fixed"
    ) {
      throw "you should only convert position element";
    }
    domElement.style.left = isNaN(parseFloat(computedStyle.left))
      ? "0px"
      : computedStyle.left;
    domElement.style.top = isNaN(parseFloat(computedStyle.top))
      ? "0px"
      : computedStyle.top;
    domElement.style.width = isNaN(parseFloat(computedStyle.width))
      ? "0px"
      : computedStyle.width;
    domElement.style.height = isNaN(parseFloat(computedStyle.height))
      ? "0px"
      : computedStyle.height;
  }
  //拖拽函数
  /**
   *
   * @param {HTMLElement} inlineStyledElement
   * @param {Function} progressFn
   * @param {Function} completeFn
   */
  function _whenDragHappens(inlineStyledElement,
    startFn,
    progressFn,
    completeFn) {
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
      const distanceObj = {
        x: distanceX,
        y: distanceY,
      };
      progressFn(targetStyle, distanceObj, target);
    }
    function upFn(event) {
      event.stopPropagation();
      document.removeEventListener("mousemove", moveFn);
      document.removeEventListener("mouseup", upFn);
      completeFn && completeFn();
    }
    inlineStyledElement.addEventListener("mousedown", function (event) {
      //记录鼠标按下的位置
      originX = event.clientX;
      originY = event.clientY;
      target = event.target;
      targetStyle.left = parseFloat(inlineStyledElement.style.left);
      targetStyle.top = parseFloat(inlineStyledElement.style.top);
      targetStyle.width = parseFloat(inlineStyledElement.style.width);
      targetStyle.height = parseFloat(inlineStyledElement.style.height);
      //第二个入参开始函数返回值记录
      startFn && Object.assign(targetStyle,{
        data:startFn()
      })

      event.preventDefault(); //知识点
      event.stopPropagation();
      document.addEventListener("mousemove", moveFn);
      document.addEventListener("mouseup", upFn);
    });
  }
  /**
   * 根据入参计算图片的meta数据（尺寸），返回一个原始尺寸的img对象。
   * 文件对象或者img标签元素
   * @param {File | HTMLImageElement} fileOrImageElement
   * @param {({element:HTMLImageElement,width:number,height:number})} callback
   */
  function _computeImageMetaInfo(fileOrImageElement, callback) {
    if (fileOrImageElement instanceof File) {
      let fileReader = new FileReader();
      fileReader.readAsDataURL(fileOrImageElement);
      fileReader.onload = function (event) {
        //新建一个img标签
        const newImg = document.createElement("img");
        newImg.src = event.target.result;
        newImg.onload = function () {
          callback &&
            callback({
              element: newImg,
              width: newImg.width,
              height: newImg.height,
            });
        };
      };
    } else if (fileOrImageElement instanceof Image) {
      //新建一个img标签
      const newImg = document.createElement("img");
      newImg.onload = function () {
        callback &&
          callback({
            element: newImg,
            width: newImg.width,
            height: newImg.height,
          });
      };
      newImg.src = fileOrImageElement.src;
    }
  }
  /**
   * 供外部调用、暴露接口
   * @param { File | HTMLImageElement } fileOrImageElement
   * @param {HTMLElement} operate
   */
  function insertImage(fileOrImageElement) {
    //移除当前的图片
    if (this._image) {
      this._plateImageBox.removeChild(this._image);
      this._image = null;
    }
    //获得图片的元数据信息
    _computeImageMetaInfo(fileOrImageElement, (metaInfo) => {
      //先缓存图片元信息
      this._imageMetaSize = {
        width: metaInfo.width,
        height: metaInfo.height,
      };
      //根据图片信息、屏幕尺寸初始化比例尺
      _initRatio.call(this);
      //初始化图形视觉尺寸
      _updatePlateImageSize.call(this);
      //居中图片
      _alignPlateImageCenter.call(this);

      this._plateImageBox.appendChild((this._image = metaInfo.element));

      //根据图片生成bs64、file并缓存
      _imageTobs64AndFile(metaInfo.element,{
        x:0,
        y:0
      },{
        width:metaInfo.width,
        height:metaInfo.height
      },(result)=>{
        //缓存bs64,file
        this._bs64 = result.bs64;
        this._file = result.file;
      })
    });
  }
  /**
   * 内部使用，用于替换底片
   * @param {*} imageElement 
   */
  function _updateImage(imageElement){
    //移除当前的图片
    if (this._image) {
      this._plateImageBox.removeChild(this._image);
      this._image = null;
    }
    //获得图片的元数据信息
    _computeImageMetaInfo(imageElement, (metaInfo) => {
      //先缓存图片元信息
      this._imageMetaSize = {
        width: metaInfo.width,
        height: metaInfo.height,
      };
      //根据图片信息、屏幕尺寸初始化比例尺
      _initRatio.call(this);
      //初始化图形视觉尺寸
      _updatePlateImageSize.call(this);
      //居中图片
      _alignPlateImageCenter.call(this);

      this._plateImageBox.appendChild((this._image = metaInfo.element));
    });
  }
  function _zoomIn() {
    //修改比例尺
    this.ratio = this.ratio <= 0.1 ? 0 : this.ratio - 0.1;
    _updatePlateImageSize.call(this);
    _alignPlateImageCenter.call(this);
  }
  function _zoomOut() {
    //修改比例尺
    this.ratio += 0.1;
    _updatePlateImageSize.call(this);
    _alignPlateImageCenter.call(this);
  }
  /**
   * 
   */
  return function (selector) {
    const _root = document.querySelector(selector);
    //准备DOM
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
                      <div class="crop-box" style="display:none;">
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
                    <div class="btn-group">
                      <button style="display:none;" class="execute iconfont icon-tick"></button>
                      <button style="display:none;" class="cancel iconfont icon-cancel"></button>
                    </div>
                    <button class="close iconfont icon-Close"></button>
                  </div>
                  
                  <div class="bottom_bar-box">
                    <button class="zoom-out iconfont icon-plus"></button>
                    <button class="zoom-in iconfont icon-suoxiao"></button>
                    <button class="crop iconfont icon-crop"></button>
                  </div>
              </div>
          </div>`;
    //缓存引用
    //根节点
    this._root = _root;
    //桌面（操作区+上下控制按钮组）
    this._desk = _root.querySelector(".desktop");
    //操作区
    this._operate = _root.querySelector(".operate-box");
    //底片盒子
    this._plateImageBox = this._operate.querySelector(".plate_image-box");
    //剪切盒子
    this._cropBox = this._operate.querySelector(".crop-box");
    //拉伸盒子
    this._resizeBox = this._operate.querySelector(".resize-box");
    //默认关闭
    _close.call(this);
    //挂载实例方法
    this.open = _open.bind(this);
    this.insertImage = insertImage;
    //拖拽事件监听
    //初始剪切框拖拽监听
    _convertToInlineStyle(this._cropBox);
    _whenDragHappens(this._cropBox,null,(targetStyle, offsetDis, target) =>{
      let _cropBox = this._cropBox;
      //移动自身
      if (target.classList.contains("handle-box")) {
        _cropBox.style.left = targetStyle.left + offsetDis.x + "px";
        _cropBox.style.top = targetStyle.top + offsetDis.y + "px";
      } else {
        //几个方向键
        switch (target.className) {
          case "resize_line_left":
            //互补left值和width值
            _cropBox.style.left = targetStyle.left + offsetDis.x + "px";
            _cropBox.style.width = targetStyle.width - offsetDis.x + "px";
            break;
          case "resize_line_top":
            //互补top值和height值
            _cropBox.style.top = targetStyle.top + offsetDis.y + "px";
            _cropBox.style.height = targetStyle.height - offsetDis.y + "px";
            break;
          case "resize_line_right":
            //改变width值
            _cropBox.style.width = targetStyle.width + offsetDis.x + "px";
            break;
          case "resize_line_bottom":
            //改变height值
            _cropBox.style.height = targetStyle.height + offsetDis.y + "px";
            break;
          case "resize_corner_top_left":
            //改变宽度、高度、left、top
            _cropBox.style.left = targetStyle.left + offsetDis.x + "px";
            _cropBox.style.top = targetStyle.top + offsetDis.y + "px";
            _cropBox.style.width = targetStyle.width - offsetDis.x + "px";
            _cropBox.style.height = targetStyle.height - offsetDis.y + "px";
            break;
          case "resize_corner_top_right":
            //改变宽度、高度、top
            _cropBox.style.top = targetStyle.top + offsetDis.y + "px";
            _cropBox.style.width = targetStyle.width + offsetDis.x + "px";
            _cropBox.style.height = targetStyle.height - offsetDis.y + "px";
            break;
          case "resize_corner_bottom_left":
            //left width height
            _cropBox.style.left = targetStyle.left + offsetDis.x + "px";
            _cropBox.style.width = targetStyle.width - offsetDis.x + "px";
            _cropBox.style.height = targetStyle.height + offsetDis.y + "px";
            break;
          case "resize_corner_bottom_right":
            //高度、宽度
            _cropBox.style.width = targetStyle.width + offsetDis.x + "px";
            _cropBox.style.height = targetStyle.height + offsetDis.y + "px";
            break;
        }
        //更新剪切框像素的toolTip
        _updateCropSizeToolTip.call(this,'crop');
      }
    });
    //window的resize事件
    window.addEventListener('resize',()=>{
      //居中图片
      _alignPlateImageCenter.call(this);
    })
    //按钮控制栏事件绑定
    this._desk.addEventListener("click", (event) => {
      let classList = event.target.classList;
      if (classList.contains("zoom-in")) {
        _zoomIn.call(this);
        //更新剪切框像素的toolTip
        _updateCropSizeToolTip.call(this,'crop');
        
      } else if (classList.contains("zoom-out")) {
        _zoomOut.call(this);
        //更新剪切框像素的toolTip
        _updateCropSizeToolTip.call(this,'crop');
      } else if (classList.contains("crop")) {
        _showCropBox.call(this);
        _switchExecuteCancelBtnVisible.call(this,true);
      } else if (classList.contains("execute")) {
        //确定 执行剪切
        _cropImage.call(this);
        //隐藏剪切框
        _hideCropBox.call(this)
        // 隐藏操作按钮
        _switchExecuteCancelBtnVisible.call(this,false);
      } else if (classList.contains("cancel")) {
        //取消剪切
        _hideCropBox.call(this);
        // 隐藏操作按钮
        _switchExecuteCancelBtnVisible.call(this,false);
      } else if (classList.contains("close")) {
        _close.call(this);
        this.onclose && this.onclose({
          file:this._file,
          bs64:this._bs64
        })
      }
    });
  };
})();
