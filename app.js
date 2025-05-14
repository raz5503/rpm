let video = document.getElementById("video");
let output = document.getElementById("output");
let FPS = 30;
let lastTimestamp = 0;
let revolutions = 0;

function onOpenCvReady() {
  // Initialize the webcam
  navigator.mediaDevices.getUserMedia({ video: true }).then(function (stream) {
    video.srcObject = stream;
    video.play();
    processVideo();
  }).catch(function (err) {
    console.log("Error accessing webcam: " + err);
  });
}

function processVideo() {
  let cap = new cv.VideoCapture(video);
  let frame = new cv.Mat(video.height, video.width, cv.CV_8UC4);
  let gray = new cv.Mat(video.height, video.width, cv.CV_8UC1);
  let circles = new cv.Mat();

  // Function to detect the RPM
  function detect() {
    cap.read(frame);
    cv.cvtColor(frame, gray, cv.COLOR_RGBA2GRAY);
    cv.GaussianBlur(gray, gray, new cv.Size(15, 15), 0);
    
    // Detect circles using HoughCircles (for circular meter discs)
    cv.HoughCircles(gray, circles, cv.HOUGH_GRADIENT, 1, 100, 100, 30, 50, 200);
    
    // If a circle is detected, calculate the RPM
    if (circles.cols > 0) {
      let circle = circles.data32F;
      let currentTimestamp = Date.now();
      
      if (lastTimestamp > 0 && currentTimestamp - lastTimestamp < 1000) {
        revolutions++;
      }
      lastTimestamp = currentTimestamp;

      // Calculate RPM
      let rpm = revolutions * 60;
      output.textContent = "RPM: " + rpm;
    }

    // Draw the detected circle
    for (let i = 0; i < circles.cols; i++) {
      let x = circle[i * 3];
      let y = circle[i * 3 + 1];
      let radius = circle[i * 3 + 2];
      cv.circle(frame, new cv.Point(x, y), radius, [255, 0, 0, 255], 2);
    }

    cv.imshow('canvas', frame);
    setTimeout(detect, 1000 / FPS);
  }

  detect();
}
