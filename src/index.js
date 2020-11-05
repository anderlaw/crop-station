function initDragEvent() {
  let beginX;
  let beginY;
  let leftAlready;
  let topAlready;
  let cropFrame = document.querySelector(".crop-frame");
  cropFrame.addEventListener("dragstart", (e) => {
    beginX = e.clientX;
    beginY = e.clientY;
    leftAlready = parseFloat(getComputedStyle(cropFrame).left);
    topAlready = parseFloat(getComputedStyle(cropFrame).top);
  });
  cropFrame.addEventListener("drag", (e) => {
    let currentX = e.clientX;
    let currentY = e.clientY;
    cropFrame.style.left = leftAlready + currentX - beginX + "px";
    cropFrame.style.top = topAlready + currentY - beginY + "px";
  });
  cropFrame.addEventListener("dragend", (e) => {
    let currentX = e.clientX;
    let currentY = e.clientY;
    cropFrame.style.left = leftAlready + currentX - beginX + "px";
    cropFrame.style.top = topAlready + currentY - beginY + "px";
  });
}
//调整剪切框的大小
function initCropEvent() {
  let cropFrame = document.querySelector(".crop-frame");
  let startX;
  let startY;
  let cropWidthAlready;
  let cropHeightAlready;
  let cropLeftAlready;
  let cropTopAlready;
  function recordOriginProp() {
    startX = event.clientX;
    startY = event.clientY;
    cropWidthAlready = parseFloat(getComputedStyle(cropFrame).width);
    cropHeightAlready = parseFloat(getComputedStyle(cropFrame).height);
    cropTopAlready = parseFloat(getComputedStyle(cropFrame).top);
    cropLeftAlready = parseFloat(getComputedStyle(cropFrame).left);
  }
  function handleSolidCheck(solidEle, disX, disY) {
    //判断是哪条边
    let classList = solidEle.classList;
    if (classList.contains("right")) {
      //右边,直接调整宽度即可
      cropFrame.style.width = cropWidthAlready + disX + "px";
    } else if (classList.contains("left")) {
      //左边,调整宽度和left
      cropFrame.style.width = cropWidthAlready - disX + "px";
      cropFrame.style.left = cropLeftAlready + disX + "px";
    } else if (classList.contains("bottom")) {
      //下面,调整高度
      cropFrame.style.height = cropHeightAlready + disY + "px";
    } else if (classList.contains("top")) {
      //上面。调整高度和top
      cropFrame.style.height = cropHeightAlready - disY + "px";
      cropFrame.style.top = cropTopAlready + disY + "px";
    }
  }
  function handleDoubleCheck(doubleEle, disX, disY) {
    //判断是哪个角
    let classList = doubleEle.classList;
    if (classList.contains("en")) {
        console.log('东北')
      //东北,宽高、top
      cropFrame.style.width = cropWidthAlready + disX + "px";
      cropFrame.style.height = cropHeightAlready - disY + "px";
      cropFrame.style.top = cropTopAlready + disY + "px";
    } else if (classList.contains("es")) {
      //东南,宽高
      cropFrame.style.width = cropWidthAlready + disX + "px";
      cropFrame.style.height = cropHeightAlready + disY + "px";
    } else if (classList.contains("wn")) {
      //西北，宽高，top,left
      cropFrame.style.width = cropWidthAlready - disX + "px";
      cropFrame.style.height = cropHeightAlready - disY + "px";
      cropFrame.style.left = cropLeftAlready + disX + "px";
      cropFrame.style.top = cropTopAlready + disY + "px";
    } else if (classList.contains("ws")) {
      //西南。宽高left
      cropFrame.style.width = cropWidthAlready - disX + "px";
      cropFrame.style.height = cropHeightAlready + disY + "px";
      cropFrame.style.left = cropLeftAlready + disX + "px";
    }
  }
  //四条线剪切
  document.querySelectorAll(".solid-boundry").forEach((solidEle) => {
    solidEle.addEventListener("dragstart", (event) => {
      recordOriginProp();
      event.stopPropagation();
    });
    solidEle.addEventListener("drag", (event) => {
      let disX = event.clientX - startX;
      let disY = event.clientY - startY;
      handleSolidCheck(solidEle, disX, disY);
      event.stopPropagation();
    });
    solidEle.addEventListener("dragend", (event) => {
      let disX = event.clientX - startX;
      let disY = event.clientY - startY;
      handleSolidCheck(solidEle, disX, disY);
      event.stopPropagation();
    });
  });

  //四个角剪切
  document.querySelectorAll(".double-boundry").forEach((doubleEle) => {
    doubleEle.addEventListener("dragstart", (event) => {
      recordOriginProp();
      event.stopPropagation();
    });
    doubleEle.addEventListener("drag", (event) => {
      let disX = event.clientX - startX;
      let disY = event.clientY - startY;
      handleDoubleCheck(doubleEle, disX, disY);
      event.stopPropagation();
    });
    doubleEle.addEventListener("dragend", (event) => {
      let disX = event.clientX - startX;
      let disY = event.clientY - startY;
      handleDoubleCheck(doubleEle, disX, disY);
      event.stopPropagation();
    });
  });
}
//copy图片并下载
function copyDownimgEle(imgEle) {
  const src = imgEle.src;
  //拷贝一份图片的备份
  const newImg = document.createElement("img");
  newImg.src = src;
  document.body.appendChild(newImg);

  newImg.onload = function () {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = newImg.width;
    canvas.height = newImg.height;

    context.drawImage(
      newImg,
      0,
      0,
      newImg.width,
      newImg.height,
      0,
      0,
      canvas.width,
      canvas.height
    );
    const bs64 = canvas.toDataURL("image/jpeg");

    const aEle = document.createElement("a");
    aEle.href = bs64;
    aEle.download = "image.jpg";
    aEle.click();
    // document.body.appendChild(aEle)
  };
}
