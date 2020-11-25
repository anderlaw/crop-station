# crop station
> A simple and easy-to-use front-end cutting tool

### Environments support

- `IE11+`
- currently only support `PC browser`,it will support `mobile browser` in the future.
### How to build
```bash
npm install
cd crop-station && npm run build
```
then checkout the dist directory which includes `crop-station.min.css`and `crop-station.min`

### API
- **open**: open the crop window
- **insertImage**: insert image onto the crop station
- **onclose**: a call function which contains the results of image,contains `bs64`and `file` 
### How to use

First we need to generate an instance of `CropStation`

```javascript
const mycropstation = new CropStation(selector)
```

Then we can pass an image to `insertImage`method to initialize the station that we may use in the future.
we must pass either an `image element` or `file object`

```javascript
mycropstation.insertImage(imgElementOrFile)
```

Then we need to open the crop-station to crop

```javascript
mycropstation.open()
```

when we finished all the manipulation, we can click the **close** on the right of the crop window to close it,at this time callback function `onclose` will be called, we can get access to `base64` or `file` of the cropped result.  

```javascript
mycropstation.onclose = function(result){
    console.log('base 64 result here:',result.bs64)
    console.log('file result here:',result.file)
}

```
### example
