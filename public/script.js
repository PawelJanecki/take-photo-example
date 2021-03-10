var width = 320;
var height = 0;

var streaming = false;

var video = document.getElementById("video");
var canvas = document.getElementById("canvas");
var photo = document.getElementById("photo");
var startButton = document.getElementById("startButton");
var switchFlashlight = document.getElementById("switchFlashlight");

var imageCapture;


// video streaming
navigator.mediaDevices
  .getUserMedia({
    audio: false,
    video: {
      width: {
        ideal: 1280
      },
      height: {
        ideal: 1024,
      },
      facingMode: 'environment',
      // advanced: {
      //   torch: true
      // }
    },
  })
  .then((stream) => {
    video.srcObject = stream;

    const track = stream.getVideoTracks()[0];

    imageCapture = new ImageCapture(track);
    
    const photoCapabilities = imageCapture.getPhotoCapabilities()
      .then(() => {
        const btn = document.getElementById("switchFlashlight");
        btn.addEventListener('click', () => {
          let torchState = photoCapabilities.torch;
          track.applyConstraints({
            advanced: [{
              // todo: make switch to support torch
              torch: !torchState
            }]
          })
        })
      })

    video.play();
  })
  .catch((err) => {
    console.log("An error occurred: " + err);
  });

// method to avoid blocking until video begins to flow
video.addEventListener(
  "canplay",
  () => {
    if (!streaming) {
      height = video.videoHeight / (video.videoWidth / width);

      video.setAttribute("width", width);
      video.setAttribute("height", height);

      canvas.setAttribute("width", width);
      canvas.setAttribute("height", height);

      streaming = true;
    }
  },
  false
);

// handle click on button

startButton.addEventListener(
  "click",
  (ev) => {
    takePicture();
    ev.preventDefault();
  },
  false
);

// switchFlashlight.addEventListener(
//   "click",
//   (ev) => {
//     useTorch();
//     ev.preventDefault();
//   },
//   false
// )

clearPhoto()

// clearing the photo box
function clearPhoto() {
  var context = canvas.getContext('2d');
  context.fillStyle = "#AAA";
  context.fillRect(0, 0, canvas.width, canvas.height);

  var data = canvas.toDataURL('image/png');
  photo.setAttribute('src', data);
}

// taking the photo
function takePicture() {
  // console.log('taking picture...');
  // var context = canvas.getContext('2d');
  // if (width & height) {
  //   canvas.width = width;
  //   canvas.height = height;
  //   context.drawImage(video, 0, 0, width, height);

  //   var data = canvas.toDataURL('src', data);
  //   photo.setAttribute('src', data);
  // } else {
  //   clearPhoto();
  // }

  imageCapture.takePhoto()
    .then(blob => createImageBitmap(blob))
    .then(imageBitmap => {
      drawCanvas(canvas, imageBitmap)
    })
}

function useTorch() {
  // const photoCapabilities = imageCapture.getPhotoCapabilities()
  //   .then(() => {
  //     imageCapture.getVideoTracks()[0].applyConstraints({
  //       advanced: [{ torch: true }]
  //     })
  //   })
}

function drawCanvas(canvas, img) {
  canvas.width = getComputedStyle(canvas).width.split('px')[0];
  canvas.height = getComputedStyle(canvas).height.split('px')[0];
  let ratio = Math.min(canvas.width / img.width, canvas.height / img.height);
  let x = (canvas.width - img.width * ratio) / 2;
  let y = (canvas.height - img.height * ratio) / 2;
  clearPhoto();
  canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height, x, y, img.width * ratio, img.height * ratio);
}

async function getDevices() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  console.log('devices: ', devices);
}
