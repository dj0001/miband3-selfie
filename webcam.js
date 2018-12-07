//webcam goes here
document.querySelector('select').onchange=function(){start(this.value)}
document.querySelector('#shot').oncontextmenu=function(e){e.preventDefault();if(this.textContent=="start") {this.textContent="stop";capture()} else {this.textContent="start";clearTimeout(t)}}
document.querySelector('#shot').onclick=function(){console.log('shot');clearTimeout(t);capture()}

var upload=false
var res=""
var w, ofont="12px Arial", ocolor="rgba(255,255,255,0.8)", Z=1.41, K=0.866  //edit here w=640 ;"webcam.htm?5" runs 5 minutes
var img = new Image(); //img.src = "overlay.png"  //your overlay image
var oimg = new Image(); //oimg.src = "offline.jpg"  //your offline image
var wo  //fixed second shot

var tstop = new Date(new Date().getTime() + location.search.slice(1)*60*1000); document.querySelector('#shot').title=(location.search)?tstop:"upload"
var changed=1, n=1, own="", t
 var video = document.querySelector("#videoElement");

    var canvas = document.querySelector('canvas');
    var ctx = canvas.getContext('2d');
    var ftg=document.getElementsByName("ft")[0]; if(!canvas.toBlob) ftg.options[1].disabled=true; 
    var imgData0 = ctx.getImageData(0,0,1,1);
    if (w) {video.width=w; wo=w}
     
    function capture() {
      var e=document.getElementsByName("effect")[0].selectedIndex;
      var ft=ftg.options[ftg.selectedIndex].text  //
      var k = (e==4)?K:1
      if (!w) {w=video.videoWidth; wo=w}; w=((document.getElementById("sz").checked)?0.5:1)*wo
      h=video.videoHeight/video.videoWidth*w;  //aspect  if (video.videoHeight)
      canvas.width=(e==3)?h:w; canvas.height=(e==3)?w:h*k;
      
      //ctx.clearRect(0,0,w,h);
      var z = (e==2)?Z:1  //var z=1  //var z=document.getElementsByName("zoom")[0].value
      if (e==3) {ctx.translate(h,0); ctx.rotate(90*Math.PI/180)}  //if (rotate) 
      
      ctx.drawImage(video,video.videoWidth*(1-1/z)/2,video.videoHeight/2*(1-1/z+1-k),video.videoWidth/z,video.videoHeight/z*k,0, 0, w, h*k);
      if (img.src) ctx.drawImage(img,0,0)  // (img,0,0,w,h)
      if (location.search && oimg.src && new Date() >= tstop) ctx.drawImage(oimg,0,0,w,h)
      ctx.font=ofont;ctx.fillStyle=ocolor; ctx.shadowColor="black";ctx.shadowBlur=1;  //own=v[2]  //your var (ini)
      ctx.fillText(document.getElementsByName("overlay")[0].value.replace("%D",new Date()).replace("%d",new Date().toLocaleString()).replace("%o",own),10,h*k-10);  //draw time overlay

      if (e==1) {  //document.getElementById("bw").checked
      var imgData=ctx.getImageData(0,0,w,h);  //grayscale
      var data = imgData.data;
        for(var i = 0; i < data.length; i += 4) {
          var brightness = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
          data[i] = brightness; // red
          data[i + 1] = brightness; // green
          data[i + 2] = brightness; // blue
        }
      ctx.putImageData(imgData,0,0); }


    function lightness(r, g, b) {return (Math.min(r, g, b) + Math.max(r, g, b)) / 255 * 50;}
    
       if (document.getElementById("md").checked || e==5) {  //motion dedection
      var imgData=ctx.getImageData(0,0,w,h); var data = imgData.data; var data0 = imgData0.data
      changed=0
        for(var i = 0; i < data.length; i += 4) {
         data0[i + 3] = ( Math.abs(lightness(data[i], data[i + 1], data[i + 2]) - lightness(data0[i], data0[i + 1], data0[i + 2])) >= 15 )  //sensity
          changed += data0[i + 3]
        data0[i + 3] *= 255;  // Full opacity for changes
        data0[i] = data0[i + 1] = data0[i + 2] = 0;  // Set color to black
        }
        var toleranz = 0.1  // %
        changed=changed/imgData.data.length*4*100
        if (changed >= toleranz) console.log(new Date().toLocaleString()+" "+Math.ceil(changed)+"%"); else changed=0  //Motion events
        if (e==5) ctx.putImageData(imgData0,0,0);  //uncommend to view motion
        imgData0=imgData
         }

      //upload
            var fp = document.getElementsByName("fname")[0].value.replace("%n",n); n++  //number files
            var uri="./"; var fn=fp
            var tmp = /(.*\/)(.*)/.exec(fp); if(tmp) {uri=tmp[1]; fn=tmp[2]}
            var xhr = new XMLHttpRequest();
            //var fd = new FormData();      
            xhr.open("POST", uri, true);
            
                xhr.onreadystatechange = function() {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    document.getElementById("log").href = fn+"."+ft; document.getElementById("log").title=new Date()
                    } }


//if (!HTMLCanvasElement.prototype.toBlob) {}  //removed

            canvas.toBlob(
    function (blob) {
        // the blob is the jpeg file
        var fd = new FormData();
        fd.append('file', blob, fn+"."+ft);  // Initiate a multipart/form-data upload

        if (upload && changed) xhr.send(fd);  //
        link.href=URL.createObjectURL(blob)
        link.download=fn+"."+ft  //
    }
    ,'image/'+ft  //jpeg
);

t = setTimeout(function(){capture()},document.getElementsByName("update")[0].value*1000);  //capture 5s      
      if (location.search && new Date() > tstop) {clearTimeout(t);document.querySelector('#shot').textContent="start"}
}


// List cameras
navigator.mediaDevices.enumerateDevices()
.then(function(devices) {
  devices.forEach(function(device) {
if (device.kind === 'videoinput') {
var option = document.createElement("option");
option.value = device.deviceId;
option.text = device.label || "camera"+document.querySelector("select").length
document.querySelector("select").add(option);
}
  });
})
.catch(function(err) {
  console.log(err.name + ": " + err.message);
});

function start(constr) {
if (video.srcObject) video.srcObject.getVideoTracks()[0].stop()
constr = navigator.webkitGetUserMedia? {mandatory:{sourceId: constr}} : {deviceId: {exact: constr}}
if(document.getElementById("res").value=="HD") constr={width:{ideal: 1280},height:{ideal: 720}}  //{constr.width={ideal: 1280}; constr.height={ideal: 720}}
  if (!navigator.mediaDevices.getUserMedia) {  //chrome51
navigator.webkitGetUserMedia({video: constr}, function(stream){video.src = URL.createObjectURL(stream)}, function(e){console.log(e)})
  } else
navigator.mediaDevices.getUserMedia({video: constr})
  .then(stream => {video.srcObject = stream})  //chrome52
  .catch(error => {console.log(error)});
}

function test(v) {own=v.main.temp+"°C"}  //your var (jsonp)
function update() {
var script = document.createElement('script');
//script.src = "http://api.openweathermap.org/data/2.5/weather?q=Augsburg,de&units=metric&callback=test"  //your text file to overlay
document.head.replaceChild(script,document.getElementsByTagName("script")[0]) 
setTimeout(function(){update()},10*60000)}; //update()
