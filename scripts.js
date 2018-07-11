
var video = document.querySelector('.player');
var canvas = document.querySelector('.photo');
var ctx = canvas.getContext('2d');
var strip = document.querySelector('.strip');
var snap = document.querySelector('.snap');


// Les navigateurs plus anciens pourraient ne pas implémenter mediaDevices, donc nous avons défini un objet videt
if (navigator.mediaDevices === undefined) {
  navigator.mediaDevices = {};
}

// Certains navigateurs implémentent partiellement mediaDevices. Nous ne pouvons pas simplement assigner un obje
//avec getUserMedia car il écraserait les propriétés existantes.
// Ici, nous allons simplement ajouter la propriété getUserMedia si elle est manquante.
if (navigator.mediaDevices.getUserMedia === undefined) {
  navigator.mediaDevices.getUserMedia = function(constraints) {

    // D'abord, prenez connaissance de l'héritage de getUserMedia, si présent
    var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    // Certains navigateurs ne l'implémentent pas - renvoyer une promesse rejetée avec une erreur
    //garder une interface cohérente
    if (!getUserMedia) {
      return Promise.reject(new Error("getUserMedia n'est pas implémenté dans ce navigateur"));
    }

    // Sinon, retournez l'appel à l'ancien navigateur. GetUserMedia avec une promesse
    return new Promise(function(resolve, reject) {
      getUserMedia.call(navigator, constraints, resolve, reject);
    });
  }
}

navigator.mediaDevices.getUserMedia({ audio: false, video: true })
.then(function(stream) {
  // Les anciens navigateurs peuvent ne pas avoir srcObject
  if ("srcObject" in video) {
    video.srcObject = stream;
  } else {
    //Évitez d'utiliser cela dans les nouveaux navigateurs, car il s'en va
    video.src = window.URL.createObjectURL(stream);
  }
  video.onloadedmetadata = function(e) {
    video.play();
  };
})
.catch(function(err) {
  console.log(err.name + ": " + err.message);
});

/* Repeoduire la vidéo dans le canvas */
function paintToCanvas () {
var width = video.videoWidth;
var height = video.videoHeight;
canvas.width = width ;
canvas.height = height;
/* On définit la largeur et la hauteur du canvas, par rapport a la hauteur et la largeur du flux de la webcam */
 /*return setInterval(() => {
    
    let pixels = ctx.getImageData(0, 0, width, height)
    //editer les  pixels
    pixels = redEffect(pixels)
    //inserer  les pixels dans le  canvas
    ctx.putImageData(pixels, 0, 0 )
  }, 16)
}
function redEffect(pixels){  
  for(let i = 0; i < pixels.data.length; i += 4) {
    pixels.data[i] = pixels.data[i] + 100 //red value
    pixels.data[i + 1] = pixels.data[i+ 1] - 50 //green value
    pixels.data[i + 2] = pixels.data[i + 2] * 0.5 //red value
  }
  return pixels */


  // filtre 3D
    return setInterval(() => {
    ctx.drawImage(video, 0, 0, width, height)
    //take the pixels out of the image
    let pixels = ctx.getImageData(0, 0, width, height)
    //edit the pixels
    pixels = rgbSplit(pixels)
    //add ghosting illusion
    ctx.globalAlpha = 0.4
    //insert the pixels back into the canvas
    ctx.putImageData(pixels, 0, 0 )
  }, 16)
}
function rgbSplit(pixels){  
  for(let i = 0; i < pixels.data.length; i += 4) {
    pixels.data[i - 150] = pixels.data[i] //red value
    pixels.data[i + 100] = pixels.data[i+ 1] //green value
    pixels.data[i - 550] = pixels.data[i + 2] //blue value
  }
  return pixels
}
video.addEventListener('canplay', paintToCanvas);


function takePhoto() {
 snap.currentTime = 0;
 snap.play();

 var data = canvas.toDataURL('images/jpeg');
 var link = document.createElement('a');
 link.href = data; 
 link.setAttribute('download', 'awesome');
 link.textContent = 'download Image';
 link.innerHTML =`<img src="${data}" alt="Awesome screenshot">`
strip.insertBefore(link, strip.firsChild)
}


function greenScreen(pixels) {  
  //object to hold min & max 'green'
  const levels = {};

  //grab the sliders from the HTML
  document.querySelectorAll('.rgb input').forEach((input) => {
    levels[input.name] = input.value;
  });

  //massive for loop. If it's between the min/max values then set the alpha to 0
  for (i = 0; i < pixels.data.length; i = i + 4) {
    red = pixels.data[i + 0];
    green = pixels.data[i + 1];
    blue = pixels.data[i + 2];
    alpha = pixels.data[i + 3];

    if (red >= levels.rmin
      && green >= levels.gmin
      && blue >= levels.bmin
      && red <= levels.rmax
      && green <= levels.gmax
      && blue <= levels.bmax) {
      // take it out!
      pixels.data[i + 3] = 0;
    }
  }

  return pixels;
}




















