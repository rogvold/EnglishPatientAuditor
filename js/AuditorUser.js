/**
 * Created by sabir on 25.07.14.
 */

var UserTools = function(){
    var self= this;
    this.currentUser = undefined;
    this.logoutLink = 'index.html';
    this.userAnswers = undefined;

    this.audioManager = undefined;

    this.currentExercise = undefined;
    this.currentExerciseItems = undefined;


    this.currentAuditorUserExercise = undefined;
    this.currentUserAnswers = undefined;
    this.currentExerciseItemNumber = undefined;

    this.controlsEnabled = true;


    this.init = function(){
        self.initParse();
    }

    this.initParse = function(){
        var applicationId = "wScS5DrZJ6N5OyU8JNGZhveTipuPc92M9g7CuF42";
        var javaScriptKey = "UY4ehoFXuP2G4wgIwmnUP78eqlwuVoNHDkO64esO";
        Parse.initialize(applicationId, javaScriptKey);
    }


    // user commons



//    login

    this.prepareLogoutLink = function(){
        $('.logoutLink').bind('click', function(){
            Parse.User.logOut();
            window.location.href = self.logoutLink;
        });
        $('.userName').text(Parse.User.current().get('firstName') + ' ' + Parse.User.current().get('lastName'));
    }

    this.checkIfLoggenIn = function(){
        if (Parse.User.current() == null){
            window.location.href = self.logoutLink;
            return;
        }
    }

    this.prepareLoginPage = function(){
        self.prepareLoginForm();
    }

    this.prepareLoginForm = function(){
        if (Parse.User.current() != null){
            window.location.href = 'home.html';
            return;
        }
        $('#signInButton').bind('click', function(){
            var email = $('#email').val().trim();
            var password = $('#password').val().trim();
            Parse.User.logIn(email, password, {
                success: function(user) {
                    window.location.href = 'home.html';
                },
                error: function(user, error) {
                    if (error.code = 101){
                        alert('incorrect authorization data');
                        return;
                    }

                }
            });
        });
    }





    // home page

    this.prepareHomePage = function(){
        self.currentUser = Parse.User.current();
        if (self.currentUser == null){
            window.location.href = self.logoutLink;
            return;
        }
        self.prepareLogoutLink();
    }

    // classes page
    this.prepareClassesPage = function(){
        self.currentUser = Parse.User.current();
        if (self.currentUser == null){
            window.location.href = self.logoutLink;
            return;
        }
        self.prepareLogoutLink();
        self.loadClassesTable();
    }

    this.loadClassesTable = function(){
        console.log('loading exercises');
        var AuditorExercise = Parse.Object.extend("AuditorExercise");
        console.log(AuditorExercise);
        var q = new Parse.Query(AuditorExercise);
        console.log(q);
        q.equalTo('status', 'active');
        q.limit(1000);
        q.find(function(results){
            var s ='<tr><td><b>name</b></td><td><b>description</b></td></tr>';
            for (var i in results){
                var ex = results[i];
                s+= '<tr><td><a href="class.html?id=' + ex.id +'" >' + ex.get('name') +'</a></td><td>' + ex.get('description') +'</td></tr>';
            }
            $('#classesTable').html(s);
            $('#classesTable').show();
        });
    }

    //   class page

    this.prepareClassPage = function(){
        console.log('preparing class page');
        self.currentUser = Parse.User.current();
        if (self.currentUser == null){
            window.location.href = self.logoutLink;
            return;
        }
        self.prepareRecorderBlock();
        self.prepareLogoutLink();
        self.loadAuditorUserExercise();
        self.initFinishButton();
        self.initUserCommentBlock();

    }



    this.loadAuditorUserExercise = function(){
        var exId = gup('id');
        if (exId == undefined || exId == ''){
            window.location.href = 'classes.html';
            return;
        }
        console.log(exId);
        Parse.Cloud.run("getAuditorUserExercise", {
            exerciseId: exId,
            userId: self.currentUser.id
        }, {
            success: function(result){
                console.log(result);
                self.currentAuditorUserExercise = result.exercise;
                self.currentUserAnswers = result.userAnswers;
                self.currentExerciseItemNumber = 0;
                console.log(self.currentAuditorUserExercise);
                self.initCommentBlock();

                $('.className').text(result.exercise.get('name'));
                $('.classDescription').text(result.exercise.get('description'));
                if (result.exercise.get('status') == 'finished'){
                    $('#recorderBlock').hide();
                    $('#exerciseStatus').show();
                }
                self.generateExerciseNumbersBlock(self.answerItemSelected);
                self.answerItemSelected(0);
                self.updateFinishBlock();
            },
            error: function(error){
                console.log('error');
                console.log(error);
                //window.location.href = 'classes.html';
            }
        });
    }

    this.prepareClassBlock = function(exercise, userAnswers){

    }

    this.generateExerciseNumbersBlock = function(clickCallback){
        var s = '';
        var userAnswers = self.currentUserAnswers;
        if (userAnswers == undefined){
            return '';
        }
        for (var i in userAnswers){
            var item = userAnswers[i];
            var isAnswered = (item.get('status') == 'answered');
            s+= '<span class="col-lg-1 col-sm-1 col-md-1 numberClickLinkWrapper"><a class="numberClickLink ' + ((isAnswered == true) ? 'answered' : '') + '"  href="javascript: void(0);" data-num="' + i +'" >' + (+i + 1) + '</a></span>';
        }
        $('#numberBlock').html(s);
        $('.numberClickLink').bind('click', function(){
            if (self.audioManager.status == 'recording'){
                return;
            }
            $('.numberClickLink').removeClass('selected');
            $('.numberClickLink').addClass('selected');
            var num = $(this).attr('data-num');
            clickCallback(num);
        });
        $('#prevButton').bind('click', function(){
            var num = $('.numberClickLink.selected').attr('data-num');
            num = +num;
            if (num == 0){
                return;
            }
            clickCallback(Math.max(num - 1, 0));
        });
        $('#nextButton').bind('click', function(){
            var num = $('.numberClickLink.selected').attr('data-num');
            num = +num;
            if (num == self.currentUserAnswers.length - 1){
                return;
            }
            clickCallback(Math.min(num + 1, self.currentUserAnswers.length - 1));
        });
    }

    this.prepareLeftQuestionBlock = function(vimeoId, text){ // it can be either video or text
        console.log('prepareLeftQuestionBlock: vimeoId = ' + vimeoId + ' text = ' + text);
        $('#classIframe').hide();
        $('#classText').hide();
        if (vimeoId != undefined && vimeoId != '' && vimeoId != 'undefined'){
            var vimeoSrc = 'http://player.vimeo.com/video/' + vimeoId +'?title=0&byline=0&portrait=0';
            $('#classIframe').show();
            $('#classIframe').attr('src', vimeoSrc);
            return;
        }
        $('#classText').show();
        $('#classText').html(text);

    }

    this.updateQuestionBlock = function(vimeoId, text, transcript, status){
        var isAnswered = (status == 'answered');

        //preparing iframe
//        var vimeoSrc = 'http://player.vimeo.com/video/' + vimeoId +'?title=0&byline=0&portrait=0';
//        $('#classIframe').attr('src', vimeoSrc);

        // -- end preparing iframe

        console.log('updateQuestionBlock: vimeoId = ' + vimeoId + ' text = ' + text + ' transcript = ' + transcript + ' status = ' + status);

        self.prepareLeftQuestionBlock(vimeoId, text);


        $('#itemTranscript').html(transcript);
        self.prepareCommentBlock();
        //$('#itemStatus').text(status);
        var ans = self.currentUserAnswers[self.currentExerciseItemNumber];
        $('#myAnswerBlock').hide();
        if (isAnswered){
            var audLink = 'http://auditor.englishpatient.ru/recorder/uploads/' + ans.get('audioLink') + '.wav';
            $('#userAnswerAudio').attr('src', audLink);
            $('#myAnswerBlock').show();
            $('a.numberClickLink[data-num="' + (+self.currentExerciseItemNumber ) +'"]').addClass('answered');
            $('#myAnswerBlock a.downloadLink').attr('href', audLink);
        }
    }

    this.prepareCommentBlock = function(){
        $('#itemComment').hide();
        var item = self.currentUserAnswers[self.currentExerciseItemNumber];
        var comment = item.get('comment');
        if (comment == undefined || comment == '' || comment.replace(' ','') == ''){
            return;
        }
        $('p.commentText').html(comment);
        $('p.commentText').hide();
        $('#itemComment').show();

        var cm = '';
        cm+= (isVoidParseString(item.get("vocComment")) ? '' : (item.get("vocComment") + '<br/> <br/>' ));
        cm+= (isVoidParseString(item.get("grammarComment")) ? '' : (item.get("grammarComment") + '<br/> <br/>' ));
        cm+= (isVoidParseString(item.get("backgroundComment")) ? '' : (item.get("backgroundComment") + '<br/> <br/>' ));
        $('#extraCommentsBlock').hide();
        if (cm != ''){
            $('#extraCommentsBlock').show();
            $('#extraComments').html(cm);
        }
        var uc = (isVoidParseString(item.get('userComment')) ? '' : item.get('userComment'));
        $('#userCommentField').val(uc);
    }

    this.initUserCommentBlock = function(){
        $('#userCommentSubmitButton').bind('click', function(){
            var userText = $('#userCommentField').val().trim();
            var ans = self.currentUserAnswers[self.currentExerciseItemNumber];
            ans.set('userComment', userText);
            var link = $(this);
            link.attr('disabled', true);
            link.html('saving...');
            ans.save().then(function(){
//                alert('your comment has been saved');
                link.removeAttr('disabled');
                link.html('Save');
            });
            // TODO:
        });
    }



    this.answerItemSelected = function(num){
        console.log('answerItemSelected: num = ' + num);
        if ((self.audioManager.status == 'recording') && (self.controlsEnabled == true)){
            return;
        }
        self.currentExerciseItemNumber = num;
        var ans = self.currentUserAnswers[num];

        console.log(ans);
        self.updateQuestionBlock(ans.get('vimeoId'), ans.get('text'), ans.get('transcript'), ans.get('status'));
        $('.numberClickLink').removeClass('selected');
        $('.numberClickLink[data-num="' + num +'"]').addClass('selected');
    }

    this.answerOnExercise = function(userAnswer){

    }

    this.prepareRecorderBlock = function(){
        self.audioManager = new AudioManager();
        self.audioManager.init();
        self.audioManager.base = 'recorder/';
        self.initSaveButton();
    }

    this.initSaveButton = function(){

        $('#saveButton').bind('click', function(){
            if ((self.audioManager.status == 'recording') && (self.controlsEnabled == true)){
                alert('please stop recording before saving');
                return;
            }
            var ans = self.currentUserAnswers[self.currentExerciseItemNumber];
            var fileName = ans.id + (new Date()).getTime();
            $(this).text('saving...');
            $(this).attr('disabled', 'disabled');
            self.audioManager.uploadAudio(fileName, function(){
                $('#saveButton').text('Save');
                $('#saveButton').removeAttr('disabled');
                $('#saveButton').hide();
                ans.set('audioLink', fileName);
                ans.set('status', 'answered');
                ans.save().then(function(savedAns){
                    if (savedAns == undefined){
                        return;
                    }
                    self.currentUserAnswers[self.currentExerciseItemNumber] = savedAns;
                    self.answerItemSelected(self.currentExerciseItemNumber);
                    self.updateFinishBlock();
                });
            });
        });
        self.audioManager.onRecordingStarted = function(){
            $('#saveButton').hide();
        }
        self.audioManager.onRecordingFinished = function(){
            $('#saveButton').show();
        }

    }

    this.updateFinishBlock = function(){
        var n = 0;
        var list = self.currentUserAnswers;
        for (var i in list){
            var ans = list[i];
            if (ans.get('status') == 'answered'){
                n++;
            }
        }
        if (n == list.length){
            if (self.currentAuditorUserExercise.get('status') == 'active'){
                $('#finishExerciseBlock').show();
            }
        }
    }

    this.initFinishButton = function(){
        $('#finishExerciseButton').bind('click', function(){
            self.currentAuditorUserExercise.set('status', 'finished');
            self.currentAuditorUserExercise.save().then(function(){
                window.location.href = window.location.href;
                return;
            });
        });
    }

    this.initCommentBlock = function(){
        if (self.currentAuditorUserExercise.get('teacherStatus') != 'checked'){
            return;
        }
        $('#teacherComment').text(self.currentAuditorUserExercise.get('teacherComment'));
        $('#teacherCommentBlock').show();

    }



}


function gup(name){
    name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regexS = "[\\?&]"+name+"=([^&#]*)";
    var regex = new RegExp( regexS );
    var results = regex.exec( window.location.href );
    if( results == null )    return "";
    else return results[1];
}


function isVoidParseString(s){
    return (s == undefined || s == '' || s == 'undefined');
}