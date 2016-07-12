var recordedBlobs;
var sourceBuffer;
var mediaRecorder;

var mediaSource=mediaSource = new MediaSource();
mediaSource.addEventListener('sourceopen', handleSourceOpen, false);
function handleSourceOpen(event) {
    console.log('MediaSource opened');
    sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
    console.log('Source buffer: ', sourceBuffer);
}

var video=document.getElementById("video");
var videoRecord=document.getElementById("video-record");

var buttonRecord=document.getElementById("toggle-record");
buttonRecord.addEventListener("mousedown", toggleRecord);

var buttonPlayback=document.getElementById("playback");
buttonPlayback.addEventListener("mousedown", playback);

var buttonDownload=document.getElementById("download");
buttonDownload.addEventListener("mousedown", download);

var warningArea=document.getElementById("warningArea");

var isSecureOrigin= (location.protocol ==="https:" || location.host==="localhost");
if(!isSecureOrigin) {
    var mainContainer=document.getElementById("mainContainer");
    mainContainer.style.setProperty("visibility", "hidden");
    mainContainer.style.setProperty("display", "none");
    
    var warning=document.createElement("p");
    warning.innerHTML="HTTPS is required to use this site";
    warning.style.setProperty("color", "#ff0000");
    warningArea.appendChild(warning);
}

function toggleRecord() {
    var startText="Start Recording",
        stopText="Stop Recording";
    if(buttonRecord.textContent==startText) {
        startRecord();
        buttonRecord.textContent="Stop Recording";
        buttonPlayback.disabled=true;
    } else {
        stopRecord();
        buttonRecord.textContent=startText;
        buttonPlayback.disabled=false;
        buttonDownload.disabled=false;
    }
}

var constraints={ audio: true, video:true };

// Use this options when needed only sounds.
// var constraints={ audio: true, video:false };

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

navigator.getUserMedia(constraints, successCallback, errorCallback);
function successCallback(stream) {
    window.stream=stream;
    if(window.URL) {
        video.src=window.URL.createObjectURL(stream);
    } else {
        video.src=stream;
    }    
}
function errorCallback(msg) {
    warningArea.innerHTML="Something went wrong. Please reload the page. Do not forget to accept for using mic/video permission.";
}


function startRecord() {
    console.log("start recording");
    var options={
        mimeType: 'video/webm',
        audioBitsPerSecond : 128000,
        videoBitsPerSecond : 2500000
    };
    recordedBlobs=[];
    try {
        mediaRecorder=new MediaRecorder(window.stream, options);
    } catch (error0) {
        console.log("[Unable to create MediaRecorder object] ", error0);
        try {
            options = {mimeType: 'video/webm,codecs=vp9', bitsPerSecond: 100000}; 
            mediaRecorder=new MediaRecorder(window.stream, options);
        } catch (error1) {
            console.log("[Your Browser has not been supporting MedeaRecorder w/ this options] ", options, error1);
            try {
                options="video/vp8";
                mediaRecorder=new MediaRecorder(window.stream, options);
            } catch (error2) {
                console.log("[Your Browser has not been supporting MediaRecorder yet] ", error2);
            }
        }
    }
    console.log("[Recording by this options] ", options, mediaRecorder);
    mediaRecorder.onstop=handleStop;
    mediaRecorder.ondataavailable=handleDataAvailable;
    mediaRecorder.start(10);

    function handleDataAvailable(event) {
        if (event.data && event.data.size > 0) {
            recordedBlobs.push(event.data);
        }
    }
    function handleStop(event) {
        console.log('Recorder stopped: ', event);
    }
}

function stopRecord() {
    mediaRecorder.stop();
    console.log('Recorded Blobs: ', recordedBlobs);
    videoRecord.controls=true;
}

function playback(){
    console.log("playback");
    var buffer=new Blob(recordedBlobs, {type: 'video/webm'});
    videoRecord.src=window.URL.createObjectURL(buffer);
}

function download() {
    console.log("download");
    var blob = new Blob(recordedBlobs, {type: 'video/webm'});
    var url = window.URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = getDateTime() + ".webm";
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 100);


    function getDateTime() {
        var date=new Date();

        var y = date.getFullYear();
        var mo = date.getMonth()+1;
        var d = date.getDate();
        var h = date.getHours();
        var m = date.getMinutes();
        var s = date.getSeconds();

        return y+""+mo+""+d+""+h+""+m+""+s; 
    }

}

