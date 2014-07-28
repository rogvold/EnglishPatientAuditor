/**
 * Created by sabir on 27.07.14.
 */

var AudioManager = function(){
    var self = this;
    this.base = '';

    this.recordAudioButton = undefined;
    this.stopRecordingButton = undefined;

    this.progress = undefined;
    this.percentage = undefined;
    this.audio = undefined;

    this.recorder = undefined;

    this.audioStream = undefined;

    this.fileName = undefined;

    this.status = 'recordingIsNotStarted';

    this.onRecordingFinished = undefined;
    this.onRecordingStarted = undefined;

    //statuses: recordingIsNotStarted, recording, recordingFinished

    this.init = function(){
        self.audio = getByID('record-audio');
        self.progress = getByID('progress');
        self.percentage = getByID('percentage');
        self.recordAudioButton = getByID('recordAudioButton');
        self.stopRecordingAudioButton = getByID('stopRecordingAudioButton');
        self.initHtmlBindings();
    }

    this.initHtmlBindings = function(){
        self.initRecordButton();
        self.initStopRecordingButton();
    }


    this.initRecordButton = function(){
        self.recordAudioButton.onclick = function() {
            if (!self.audioStream)
                navigator.getUserMedia({audio: true, video: false}, function (stream) {
                    if (window.IsChrome) stream = new window.MediaStream(stream.getAudioTracks());
                    self.audioStream = stream;

                    self.audio.src = URL.createObjectURL(self.audioStream);
                    self.audio.muted = true;
                    self.audio.play();

                    // "audio" is a default type
                    self.recorder = window.RecordRTC(stream, {
                        type: 'audio'
                    });
                    self.recorder.startRecording();
                    if (self.onRecordingStarted !=undefined){
                        self.onRecordingStarted();
                    }
                    self.status = 'recording';

                }, function () {
                });
            else {
                self.audio.src = URL.createObjectURL(self.audioStream);
                self.audio.muted = true;
                self.audio.play();
                if (self.recorder) {
                    self.recorder.startRecording();
                    if (self.onRecordingStarted !=undefined){
                        self.onRecordingStarted();
                    }
                }

            }

            window.isAudio = true;
            this.disabled = true;
            self.stopRecordingAudioButton.disabled = false;
        }
    }

    this.initStopRecordingButton = function(){
        self.stopRecordingAudioButton.onclick = function() {
            this.disabled = true;
            self.recordAudioButton.disabled = false;
            self.audio.src = '';

            if (self.recorder)
                self.recorder.stopRecording(function(url) {
                    self.audio.src = url;
                    self.audio.muted = false;
                    self.audio.play();
                    if (self.onRecordingFinished !=undefined){
                        self.onRecordingFinished();
                    }
                    self.status = 'recordingFinished';
                });

        };
    }

    this.uploadAudio = function(fileName, callback){
        self.fileName = fileName;
        self.status = 'recordingIsNotStarted';
        self.PostBlob(self.recorder.getBlob(), fileName + '.wav', function(){
            console.log('uploading');
            callback();
        });
    }

    this.xhr = function(url, data, callback) {
        var request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            if (request.readyState == 4 && request.status == 200) {
                callback(request.responseText);
            }
        };

        if(url.indexOf('delete.php') == -1) {
            request.upload.onloadstart = function() {
                self.percentage.innerHTML = 'Upload started...';
            };

            request.upload.onprogress = function(event) {
                self.progress.max = event.total;
                self.progress.value = event.loaded;
                self.percentage.innerHTML = 'Upload Progress ' + Math.round(event.loaded / event.total * 100) + "%";
            };

            request.upload.onload = function() {
                self.percentage.innerHTML = '';
            };
        }
        request.open('POST', url);
        request.send(data);
    }


    this.PostBlob = function(blob, fileName, callback) {
        // FormData
        var formData = new FormData();
        formData.append('audio-filename', fileName);
        formData.append('audio-blob', blob);

        // POST the Blob using XHR2
        self.progress.style.visibility = 'visible';
        self.xhr(self.base +  'save.php', formData, function(fileURL) {
            var mediaElement = document.createElement('audio');
            var source = document.createElement('source');
            var href = location.href.substr(0, location.href.lastIndexOf('/') + 1) + self.base;
            source.src = href + fileURL;
            source.type = !!navigator.mozGetUserMedia ? 'audio/ogg': 'audio/wav';
            mediaElement.appendChild(source);
            mediaElement.controls = true;
            //mediaElement.play();
            self.progress.style.visibility = 'hidden';
            callback();
        });
    }


}

function getByID(id) {
    return document.getElementById(id);
}