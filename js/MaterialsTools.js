/**
 * Created by sabir on 05.08.14.
 */

var MaterialsTools = function(){
    var self = this;
    self.materials = [];

    this.initParse = function(){
        var applicationId = "wScS5DrZJ6N5OyU8JNGZhveTipuPc92M9g7CuF42";
        var javaScriptKey = "UY4ehoFXuP2G4wgIwmnUP78eqlwuVoNHDkO64esO";
        Parse.initialize(applicationId, javaScriptKey);
    }


    this.init = function(){
        self.initParse();
        self.initCreateMaterialForm();
        self.loadAllMaterials(function(){});
    }


    this.loadAllMaterials = function(callback){
        var VideoMaterial = Parse.Object.extend('VideoMaterial');
        var q = new Parse.Query(VideoMaterial);
        q.limit(1000);
        q.descending('createdAt');
        q.find(function(results){
            self.materials = results;
            self.drawMaterialsTable();
            callback();
        });

    }


    this.drawMaterialsTable = function(){
        var list = self.materials;
        var s = '';
        s+='<tr><td>image</td><td><b>Name</b></td><td><b>creation date</b></td><td><b>text</b></td><td><b>grammar</b></td><td><b>vocabulary</b></td><td><b>background</b></td><td><b>application</b></td><td><b>tags</b></td><td><b>duration</b></td><td>Command</td></tr>';
        for (var i in list){
            var item = list[i];
            s+='<tr data-id="' + item.id +'" ><td><a href="http://vimeo.com/' + vimeoId +'" target="_blank" ><img style="height: 100px;" src="' + item.get('imgSrc') +'"/></a> </td><td><input class="materialsTableName" data-id="' + item.id +'" value="' + item.get('name') +'" type="text" /></td><td>' + item.get('createdAt') +'</td><td><textarea class="materialsTableText" data-id="' + item.id +'" >' + item.get('text')+ '</textarea></td><td><textarea class="materialsTableGrammar" data-id="' + item.id +'" >' + item.get('grammar')+ '</textarea></td><td><textarea class="materialsTableVocabulary" data-id="' + item.id +'"   >' + item.get('vocabulary') +'</textarea></td><td><textarea class="materialsTableGeneralInfo" data-id="' + item.id +'"  >' + item.get('generalInfo')+ '</textarea></td><td>' + item.get('application')+ '</td><td><textarea class="materialsTableTags" data-id="' + item.id +'"  >' + item.get('tags')+ '</textarea></td><td>' + item.get('duration')+ '</td><td><button class="materialsTableUpdateButton" data-id="' + item.id +'" >update</button><button data-id="' + item.id +'" class="materialsTableDeleteButton" >delete</button></td></tr>';
        }
        $('#materialsTable').html(s);
        self.prepareTableButtons();
        $('#materialsTable').show();
    }

    this.prepareTableButtons = function(){
        $('.materialsTableUpdateButton').bind('click', function(){
            var id = $(this).attr('data-id');
            var name = $('.materialsTableName[data-id=' + id +']').val().trim();
            var text = $('.materialsTableText[data-id=' + id +']').val().trim();
            var grammar = $('.materialsTableGrammar[data-id=' + id +']').val().trim();
            var vocabulary = $('.materialsTableVocabulary[data-id=' + id +']').val().trim();
            var generalInfo = $('.materialsTableGeneralInfo[data-id=' + id +']').val().trim();
            var tags = $('  .materialsTableTags[data-id=' + id +']').val().trim();
            var VideoMaterial = Parse.Object.extend('VideoMaterial');
            var q = new Parse.Query(VideoMaterial);
            q.get(id, {
                success: function(m){
                    m.set('name', name);
                    m.set('text', text);
                    m.set('grammar', grammar);
                    m.set('vocabulary', vocabulary);
                    m.set('generalInfo', generalInfo);
                    m.set('tags', tags);
                    m.save().then(function(){
                        alert('saved');
                    });
                }
            });
        });

        $('.materialsTableDeleteButton').bind('click', function(){
            var id = $(this).attr('data-id');
            var VideoMaterial = Parse.Object.extend('VideoMaterial');
            var q = new Parse.Query(VideoMaterial);
            q.get(id, function(m){
                m.destroy().then(function(){
                    alert('material has been destroyed');
                    $('tr[data-id=' + id +']').css('visibility', 'hidden');
                });
            });
        });
    }

    this.initCreateMaterialForm = function(){
        $('#createButton').bind('click', function(){
            var name = $('#name').val().trim();
            var vimeoId = $('#vimeoId').val().trim();
            var text = $('#text').val().trim();
            var grammar = $('#grammar').val().trim();
            var vocabulary = $('#vocabulary').val().trim();
            var generalInfo = $('#generalInfo').val().trim();
            var application = $('input[name=application]:checked').val();
            var tags = $('#tags').val().trim();
            self.createMaterial(name, vimeoId, text, grammar, vocabulary, generalInfo,  application, tags, function(){
                window.location.href = window.location.href;
            });
        });
    }

    this.createMaterial = function(name, vimeoId, text, grammar, vocabulary, generalInfo, application, tags, callback){
        self.getVideoInfo(vimeoId, function(data){
             var imgSrc = data[0].thumbnail_large;
             var duration = data[0].duration;
             var VideoMaterial = Parse.Object.extend('VideoMaterial');
             var m = new VideoMaterial();
             m.set('name', name);
             m.set('vimeoId', vimeoId);
             m.set('text', text);
             m.set('grammar', grammar);
             m.set('vocabulary', vocabulary);
             m.set('generalInfo', generalInfo);
             m.set('application', application);
             m.set('tags', tags);
             m.set('imgSrc', imgSrc);
             m.set('duration', duration);
             m.save().then(function(){
                 callback();
             });
        });

    }

    this.getVideoInfo = function(vimeoId, callback){
        $.ajax({
            url: 'http://vimeo.com/api/v2/video/' + vimeoId + '.json',
            dataType: 'JSON',
            success: function(data){
                console.log(data);
                callback(data);
            }
        });
    }


}