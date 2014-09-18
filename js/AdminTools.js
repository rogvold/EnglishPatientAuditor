/**
 * Created by sabir on 23.07.14.
 */

var AdminTools = function(){
    var self = this;
    this.currentGroup = undefined;
    this.currentExercise = undefined;

    this.init = function(){
        self.initParse();
    }

    this.initParse = function(){
        var applicationId = "wScS5DrZJ6N5OyU8JNGZhveTipuPc92M9g7CuF42";
        var javaScriptKey = "UY4ehoFXuP2G4wgIwmnUP78eqlwuVoNHDkO64esO";
        Parse.initialize(applicationId, javaScriptKey);
    }

    this.prepareUsersPage = function(){
        self.initCreateUserForm();
        self.loadUsersList();
    }

    this.prepareGroupsPage = function(){
        self.initCreateUserGroupForm();
        self.loadGroupsList();
    }

    this.prepareGroupPage = function(){
        self.loadCurrentGroupInfo();
    }

    this.initCreateUserForm = function(){
        $('#createUserButton').bind('click', function(){
            var email = $('#email').val().trim();
            var password = $('#password').val().trim();
            var firstName = $('#firstName').val().trim();
            var lastName = $('#lastName').val().trim();
            var userType = $('input[name=userType]:checked').val();
            self.createUser(email, password, userType, firstName, lastName, function(){
               window.location.href = window.location.href;
            });
        });
    }

    this.initCreateUserGroupForm = function(){
        $('#createGroupButton').bind('click', function(){
            var name = $('#groupName').val().trim();
            var description = $('#groupDescription').val().trim();
            self.createUserGroup(name, description, function(){
                window.location.href = window.location.href;
            });
        });
    }

    this.loadUsersList = function(){
        var query = new Parse.Query(Parse.User);
        query.equalTo('status', 'active');
        query.descending('userType');
        query.ascending('lastName');
        query.ascending('firstName');
        query.limit(1000);
        query.find({
            success: function(results){
                self.drawUsersTable(results);
            }
        });
    }


    this.drawUsersTable = function(parseUsers){
        var list = parseUsers;
        var s = '';
        s+='<tr><td><b>email</b></td><td><b>Name</b></td><td><b>user type</b></td><td><b>status</b></td></tr>';
        for (var i in list){
            var user = list[i];
            s+='<tr><td>' + user.get('email') +'</td><td>' + user.get('firstName') +' ' + user.get('lastName') + '</td><td>' + user.get('userType') +'</td><td>' + user.get('status')+ '</td></tr>';
        }
        $('#usersTable').html(s);
        $('#usersTable').show();
    }

    this.createUser = function(email, password, userType, firstName, lastName, callback){
        console.log('name=' + name +';email=' + email + ';password=' + password + ';firstName=' + firstName + ';lastName=' + lastName + '; userType=' + userType);
        var user = new Parse.User();
        user.set('email', email);
        user.set('password', password);
        user.set('userPassword', password);
        user.set('username', email);
        user.set('userType', userType);
        user.set('firstName', firstName);
        user.set('lastName', lastName);
        user.set('status', 'active');
        user.signUp(null,{
            success: function(user){
                window.location.href = window.location.href;
            },
            error: function(user, error){
                alert("Error: " + error.code + " " + error.message);
            }
        });

    }




//    groups stuff


    this.loadGroupsList = function(){
        var AuditorUserGroup = Parse.Object.extend('AuditorUserGroup');
        var query = new Parse.Query(AuditorUserGroup);
        query.ascending('name');
        query.limit(1000);
        query.find(function(results){
            self.drawGroupsTable(results);
        });
    }


    this.createUserGroup = function(name, description, callback){
        var AuditorUserGroup = Parse.Object.extend('AuditorUserGroup');
        var query = new Parse.Query(AuditorUserGroup);
        query.equalTo(name);
        query.limit(1);
        query.find(function(results){
            if (results!=undefined && results.length != 0){
                alert('group with specified name has already been created');
                return;
            }
            var group = new AuditorUserGroup();
            group.set('name', name);
            group.set('description', description);
            group.set('status', 'active');
            group.save().then(function(){
                callback();
            });
        });
    }

    this.drawGroupsTable = function(parseGroups){
        var list = parseGroups;
        var s = '';
        s+='<thead><tr><td>Name</td><td>Description</td><td>Status</td></tr></thead>';
        s+='<tbody>';
        for (var i in list){
            var group = list[i];
            s+='<tr><td><a target="_blank" href="group.html?id=' + group.id +'">' + group.get('name') +'</a></td><td>' + group.get('description') + '</td><td>' + group.get('status')+ '</td></tr>';
        }
        s+='</tbody>';
        $('#groupsTable').html(s);
        $('#groupsTable').show();
    }


    this.loadCurrentGroupInfo = function(){
        var groupId = gup('id');
        if (groupId == undefined){

        }
        var AuditorUserGroup = Parse.Object.extend("AuditorUserGroup");
        var query = new Parse.Query(AuditorUserGroup);
        query.get(groupId, {
            success: function(group) {
                console.log('group is loaded');
                console.log(group);
                $('.groupName').html(group.get("name"));
                self.currentGroup = group;
                self.loadAllUsersGroupList();
                self.loadUsersInGroup();
            },
            error: function(object, error) {
                window.location.href = 'groups.html';
            }
        });
    }

    this.loadUsersInGroup = function(){
        var relation = self.currentGroup.relation('containsUser');
        var q = relation.query();
        q.equalTo('status', 'active');
        q.limit(1000);
        q.find({
            success: function(list){
                if (list == undefined || list.length == 0){
                    return;
                }
                self.drawGroupUsersTable(list);
            }
        });
    }

    this.drawGroupUsersTable = function(parseUsers){
        var list = parseUsers;
        var s = '';
        s+='<tr><td><b>email</b></td><td><b>Name</b></td><td><b>user type</b></td><td><b>status</b></td><td>command</td></tr>';
        for (var i in list){
            var user = list[i];
            s+='<tr><td>' + user.get('email') +'</td><td><span>' + user.get('firstName') +' ' + user.get('lastName') + '</span></td><td>' + user.get('userType') +'</td><td>' + user.get('status')+ '</td><td><span><a href="javascript:void(0);" class="userRemoveButton" data-userId="' + user.id +'" >remove</a></span></td></tr>';
        }
        $('#groupUsersTable').html(s);
        $('#groupUsersTable').show();
        $('.userRemoveButton').bind('click', function(){
            var userId = $(this).attr('data-userId');
            var q = new Parse.Query(Parse.User);
            q.get(userId, function(u){
                var relation = self.currentGroup.relation("containsUser");
                self.currentGroup.save().then(function(){
                    var relation = self.currentGroup.relation('containsUser');
                    relation.remove(u);
                    self.currentGroup.save().then(function(){
                        window.location.href = window.location.href;
                    });

                });
            });

        });
    }

    this.addUserToGroup = function(groupId, userId){
        //todo: implement
    }

    this.loadAllUsersGroupList = function(){
        var query = new Parse.Query(Parse.User);
        query.equalTo('status', 'active');
        query.descending('userType');
        query.ascending('lastName');
        query.ascending('firstName');
        query.limit(1000);
        query.find(function(results){
            var s = '';
            for (var i in results){
                var user = results[i];
                s+='<li><span> <b>' + user.get("firstName") + ' ' + user.get("lastName") + '</b> | ' + user.get("email") + ' | <a href="javascript:void(0);" class="addUserButton" data-userId="' + user.id + '" >add</a></span></li>';
            }
            $('#allUsersList').html(s);
            $('.addUserButton').bind('click', function(){
                var userId = $(this).attr('data-userId');
                var q = new Parse.Query(Parse.User);
                q.get(userId, function(u){
                    var relation = self.currentGroup.relation("containsUser");
                    relation.add(u);
                    self.currentGroup.save().then(function(){
                        window.location.href = window.location.href;
                    });
                });


            });
        });

    }

//    exercises management

    this.prepareExercisesPage = function(){
        $('#createExerciseButton').bind('click', function(){
            var name = $('#exName').val().trim();
            var description = $('#exDescription').val().trim();
            self.createNewExercise(name, description);
        });
        self.loadAllExercises();
    }


    this.loadAllExercises = function(){
        console.log('loading exercises');
        var AuditorExercise = Parse.Object.extend("AuditorExercise");
        console.log(AuditorExercise);
        var q = new Parse.Query(AuditorExercise);
        console.log(q);
        q.equalTo('status', 'active');
        q.limit(1000);
        console.log('before find occured');
        q.find(function(results){
            var s ='<tr><td><b>name</b></td><td><b>description</b></td><td><b>status</b></td><td><b>command</b></td></tr>';
            for (var i in results){
                var ex = results[i];
                s+= '<tr><td><a href="exercise.html?id=' + ex.id +'" >' + ex.get('name') +'</a></td><td>' + ex.get('description') +'</td><td>' + ex.get('status') + '</td><td><a class="removeExerciseButton" href="javascript: void(0);" data-exId="' + ex.id +'" >remove</a></td></tr>';
            }
            $('#exercisesTable').html(s);
            $('#exercisesTable').show();
            $('.removeExerciseButton').bind('click', function(){
                var exId = $(this).attr('data-exId');
                var query = new Parse.Query(Parse.Object.extend('AuditorExercise'));
                query.get(exId,{
                    success: function(exer){
                        exer.destroy().then(function(){
                            window.location.href = window.location.href;
                        });
                    }
                });
            });
        });
    }

    this.createNewExercise = function(name, description){
        if (name == undefined){
            return;
        }
        var AuditorExercise = Parse.Object.extend("AuditorExercise");
        var q = new Parse.Query(AuditorExercise);
        q.limit(1);
        q.equalTo('status', 'active');
        q.equalTo('name', name);
        q.find(function(results){
            if (results.length != 0){
                alert('exercise with specified name exists in the system. Please be sure that name is unique');
                return;
            }
            var ex = new AuditorExercise();
            ex.set('name', name);
            ex.set('showTranscript', true);
            ex.set('description', description);
            ex.set('status', 'active');
            ex.save().then(function(){
                window.location.href = 'exercise.html#addNewItemPanel';
            });
        });
    }

    // exercise management

    this.prepareCurrentExercise = function(){
        self.loadCurrentExerciseInfo();

    }

    this.loadCurrentExerciseInfo = function(){
        var exId = gup('id');
        if (exId == null || exId == ''){
            window.location.href = 'exercises.html';
            return;
        }
        var AuditorExercise = Parse.Object.extend("AuditorExercise");
        var query = new Parse.Query(AuditorExercise);
        query.equalTo('status', 'active');
        query.get(exId, {
            success: function(exercise){
                self.currentExercise = exercise;
                $('.exerciseName').text(exercise.get('name'));
                $('#settingsExerciseName').val(exercise.get('name'));
                $('#settingsExerciseDescription').val(exercise.get('description'));
                self.loadExerciseItems();
                self.prepareNewItemForm();
                self.prepareExerciseSettingsForm();
            },
            error: function(){
                window.location.href = 'exercises.html';
            }
        });
    }

    this.prepareExerciseSettingsForm = function(){
        var showTranscript = self.currentExercise.get('showTranscript');
        $('#showTranscriptCheckbox').prop('checked', showTranscript);
        $('#saveExerciseSettingsButton').bind('click', function(){
            showTranscript = $('#showTranscriptCheckbox').is(':checked');
            self.currentExercise.set('showTranscript', showTranscript);
            self.currentExercise.set('description', $('#settingsExerciseDescription').val().trim());
            self.currentExercise.save().then(function(exer){
                window.location.href = window.location.href;
            });
        });
    }

    this.loadExerciseItems = function(){
        var relation = self.currentExercise.relation("containsItem");
        var query = relation.query();
        query.equalTo('status', 'active');
        query.ascending('number');
        query.find(function(results){
            var s ='<tr>' +
                '<td><b>#</b></td>' +
                '<td><b>video</b></td>' +
                '<td><b>text</b></td>' +
                '<td><b>transcript</b></td>' +
                '<td><b>comment</b></td>' +
                '<td><b>vocabulary comment</b></td>' +
                '<td><b>grammar comment</b></td>' +
                '<td><b>background comment</b></td>' +
                '<td><b>command</b></td>' +
                '</tr>';
            for (var i in results){
                var item = results[i];
                s+= '<tr>' +
                    '<td><b>' + item.get('number') +'</b></td>' +
                    '<td style="width: 320px;">' + getEmbeddedVideoHtml(item.get('vimeoId'), item.get('text'), 320, 220) +'<input class="vimeoIdInput" data-itemId="' + item.id + '" type="text" value="' + item.get('vimeoId') +'" /></td>' +
                    '<td><textarea data-itemId="' + item.id +'" rows="7" cols="30" style="" class="form-control textTextarea" >' + (item.get('text') == undefined ? '' : item.get('text')) +'</textarea></td>' +
                    '<td><textarea data-itemId="' + item.id +'" rows="7" style="" class="form-control transcriptTextarea" >' + item.get('transcript') +'</textarea></td>' +
                    '<td><textarea data-itemId="' + item.id +'" rows="7" style=""  data-itemId="' + item.id +'"  class="form-control commentTextarea" >' + (item.get('comment') == undefined ? '' : item.get('comment')) +'</textarea></td>' +

                    '<td><textarea data-itemId="' + item.id +'" rows="7" style=""  data-itemId="' + item.id +'"  class="form-control vocCommentTextarea" >' + (item.get('vocComment') == undefined ? '' : item.get('vocComment')) +'</textarea></td>' +
                    '<td><textarea data-itemId="' + item.id +'" rows="7" style=""  data-itemId="' + item.id +'"  class="form-control grammarCommentTextarea" >' + (item.get('grammarComment') == undefined ? '' : item.get('grammarComment')) +'</textarea></td>' +
                    '<td><textarea data-itemId="' + item.id +'" rows="7" style=""  data-itemId="' + item.id +'"  class="form-control backgroundCommentTextarea" >' + (item.get('backgroundComment') == undefined ? '' : item.get('backgroundComment')) +'</textarea></td>' +


                    '<td><button class="updateTranscriptButton btn btn-info" data-itemId="' + item.id +'" >update</button> <br/><br/><button class="removeExerciseItemButton btn btn-danger" data-itemId="' + item.id +'" >delete</button></td>' +
                    '</tr>';
            }
            $('#exerciseItemsTable').html(s);
            $('#exerciseItemsTable').show();
            self.initDeleteAndEditItemButton();
        });
    }

    this.initDeleteAndEditItemButton = function(){
        $('.removeExerciseItemButton').bind('click', function(){
            if (!confirm('Are you sure?')){
                return;
            }
            var itemId = $(this).attr('data-itemId');
            var relation = self.currentExercise.relation('containsItem');
            var query = new Parse.Query(Parse.Object.extend('AuditorExerciseItem'));
            query.get(itemId, {
                success: function(item){
                    relation.remove(item);
                    self.currentExercise.save().then(function(){
                        window.location.href = window.location.href;
                    });
                }
            });
        });

        $('.updateTranscriptButton').bind('click', function(){
            var itemId = $(this).attr('data-itemId');
            var transcript = $('textarea.transcriptTextarea[data-itemId="' + itemId + '"]').val().trim();
            var comment = $('textarea.commentTextarea[data-itemId="' + itemId + '"]').val().trim();


            var vocComment = $('textarea.vocCommentTextarea[data-itemId="' + itemId + '"]').val().trim();
            var grammarComment = $('textarea.grammarCommentTextarea[data-itemId="' + itemId + '"]').val().trim();
            var backgroundComment = $('textarea.backgroundCommentTextarea[data-itemId="' + itemId + '"]').val().trim();



            var vimId = $('input.vimeoIdInput[data-itemId="' + itemId +'"]').val().trim();
            var text = $('textarea.textTextarea[data-itemId="' + itemId + '"]').val().trim();

            if ((text == '' || text == undefined) && (vimId == '' || vimId == undefined)){
                alert('you should specify vimeoId or text');
                return;
            }

            console.log('comment = ' + comment);
            var relation = self.currentExercise.relation('containsItem');
            var query = new Parse.Query(Parse.Object.extend('AuditorExerciseItem'));
            query.get(itemId, {
                success: function(item){
                    item.set('transcript', transcript);
                    item.set('comment', comment);

                    item.set('vocComment', vocComment);
                    item.set('grammarComment', grammarComment);
                    item.set('backgroundComment', backgroundComment);


                    item.set('vimeoId', vimId);
                    item.set('text', text);
                    item.save().then(function(){
                        alert('updated');

                    });
                }
            });
        });

    }

    this.prepareNewItemForm = function(){
        $('#createItemButton').bind('click', function(){
            var vimeoId = $('#exerciseVimeoId').val().trim();
            console.log('vimeoId = ' + vimeoId);
            var transcript = $('#exerciseTranscript').val().trim();
            var comment = $('#exerciseComment').val().trim();

            var vocComment = $('#vocComment').val().trim();
            var grammarComment = $('#grammarComment').val().trim();
            var backgroundComment = $('#backgroundComment').val().trim();

            var text = $('#exerciseText').val().trim();
            if ((vimeoId == undefined || vimeoId == '') && (text == undefined || text == '')){
                alert('vimeoId or text should be specified');
                return;
            }

            var AuditorExerciseItem = Parse.Object.extend("AuditorExerciseItem");
            var item = new AuditorExerciseItem();
            if ((vimeoId != undefined) && (vimeoId != '')){
                item.set('vimeoId', vimeoId);
            }
            if ((text != undefined) && (text != '')){
                item.set('text', text);
            }
            item.set('transcript', transcript);
            item.set('comment', comment);

            item.set('vocComment', vocComment);
            item.set('grammarComment', grammarComment);
            item.set('backgroundComment', backgroundComment);

            item.set('status', 'active');
            item.set('number', $('#exerciseItemsTable tr').length);
            item.save().then(function(){
                var relation = self.currentExercise.relation('containsItem');
                relation.add(item);
                self.currentExercise.save().then(function(){
                    window.location.href = 'http://' + window.location.hostname + window.location.pathname + '?id=' + gup('id') + '' ;
//                    window.location.href = 'http://' + window.location.hostname + window.location.pathname + '?id=' + gup('id') + '#addNewItemPanel' ;
                });
            });
        });
    }
}

function gup(name){
    name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regexS = "[\\?&]"+name+"=([^&#]*)";
    var regex = new RegExp( regexS );
    var results = regex.exec( window.location.href );
    if( results == null )    return "";
    else    return results[1];
}

function getEmbeddedVideoHtml(vimeoId, text, width, height){
    width = (width == undefined ? 320 : width);
    height = (height == undefined ? 220 : height);
    if (vimeoId == undefined || vimeoId == '' || vimeoId == 'undefined'){
        return '<span style="display: inline-block; width: ' + width +'px; height: ' + height +'px; background-color: black; color: white;">' + text + '</span>';
    }
    var s = '<iframe style=\'width: ' + width+'px; height: ' + height +'px;\'  src="//player.vimeo.com/video/' + vimeoId + '?title=0&amp;byline=0&amp;portrait=0" width="' + width +'" height="' + height +'" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';
    return s;
}