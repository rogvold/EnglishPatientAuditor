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






}