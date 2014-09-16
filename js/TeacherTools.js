/**
 * Created by sabir on 28.07.14.
 */

var TeacherTools = function(){
    var self = this;


    this.init = function(){
        self.initParse();
    }

    this.initParse = function(){
        var applicationId = "wScS5DrZJ6N5OyU8JNGZhveTipuPc92M9g7CuF42";
        var javaScriptKey = "UY4ehoFXuP2G4wgIwmnUP78eqlwuVoNHDkO64esO";
        Parse.initialize(applicationId, javaScriptKey);
    }


    this.prepareCheckListPage = function(){
        Parse.Cloud.run("getUncheckedExercises", {}, {
            success: function(results){
                console.log(results);
                self.generateUncheckedExercisesHtml(results);
            }
        });
    }


    this.generateUncheckedExercisesHtml = function(results){
        var s = '';
        for (var i in results){
            s+= self.generateUncheckedTableExercises(results[i]) + '<hr/>';
        }
        if (s == ''){
            s = 'nothing to do';
        }
        $('#checkListBlock').html(s);
        $('.commentButton').bind('click', function(){
            var userExId = $(this).attr('data-userExId');
            var comment = $('.commentTextarea[data-userExId="' + userExId +'"]').val().trim();
            if (comment == undefined || comment == ''){
                alert('comment is empty');
                return;
            }
            var AuditorUserExercise = Parse.Object.extend('AuditorUserExercise');
            var q = new Parse.Query(AuditorUserExercise);
            q.get(userExId, {
                success: function(ex){
                    ex.set('teacherComment', comment);
                    ex.set('teacherStatus', 'checked');
                    ex.save().then(function(){
                        alert('commented');
                        window.location.href = window.location.href;
                        return;
                    });
                }
            });
        });
        $('.unfinishButton').bind('click', function(){
            if (confirm('Are you sure, bro?') == false){
                return;
            }
            var userExId = $(this).attr('data-userExId');
            var AuditorUserExercise = Parse.Object.extend('AuditorUserExercise');
            var q = new Parse.Query(AuditorUserExercise);
            q.get(userExId, {
                success: function(ex){
                    ex.set('teacherStatus', 'notChecked');
                    ex.set('status', 'active');
                    ex.save().then(function(){
                        window.location.href = window.location.href;
                        return;
                    });
                }
            });
        });
    }

    this.generateUncheckedTableExercises = function(item){
        var s = '<h3>' + item.user.get('firstName') + ' ' + item.user.get('lastName') + '</h3> <h4>' + item.exercise.get('name') + ' </h4><br/>';
        s+= '<table class="table" ><tr><th>#</th><th>vimeoId</th><th>transcript</th><th>user answer</th></tr>';
        var list = item.answers;
        for (var i in list){
            var ans = list[i];
            var audLink = 'http://auditor.englishpatient.ru/recorder/uploads/' + ans.get('audioLink') + '.wav';
            s+='<tr><td>' + (1 + +i) +'</td><td><a href="http://vimeo.com/' + ans.get('vimeoId') +'" target="_blank" >' + ans.get('vimeoId') +'</a></td><td>' + ans.get('transcript') +'</td><td><audio controls="" src="' + audLink + '" ></audio></td></tr>';
        }
        s+='</table> <br/>';

        s+='<textarea placeholder="Comment" class="form-control commentTextarea"  data-userExId="' + item.exercise.id +'" ></textarea>'
        s+='<br/>';
        s+='<div style="text-align: right;" ><button data-userExId="' + item.exercise.id +'"  class="btn btn-success commentButton " >Leave comment</button></div>';
        s+='<br/>';
        s+='<div style="text-align: right;" ><button data-userExId="' + item.exercise.id +'"  class="btn btn-danger unfinishButton " >UNFINISH</button></div>';
        return s;
    }



}