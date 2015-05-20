/**
 * Created by ian on 10.02.15.
 */

angular.module('janeFilters', [])
    .filter('camera', function () {
        return function (input) {

            var camera_code_start = input.lastIndexOf('_') + 1;
            var camera_code_end = input.lastIndexOf('.mp4') + 2;
            var camera_code = input.substr(camera_code_start, input.length - camera_code_end);

            switch (camera_code) {
                case 'cn':
                case 'ce':
                    return 'near';
                case 'co':
                case 'ca':
                    return 'face';
                case '2s':
                    return 'wide';
                case '2o':
                    return 'wide right';
                case '2a':
                    return 'wide left';
                case '2m':
                    return 'mixed';
                default:
                    return 'not sure';
            }

            return camera_code;
        };

    })

    .filter('durationTotal', function () {
        return function (input) {
            var duration = 0;
            for (var a = 0; a < input.length; a++) {
                duration += input[a].duration
            }

            return (duration / 1000).toFixed(2)

        };
    })

    .filter('seqCamera', function(){
        return function(input){
            var cameraStr = "";
            var duration = 0;
            for (var a = 0; a < input.length; a++) {
                var camera_code_start = input[a].file.lastIndexOf('_') + 1;
                var camera_code = input[a].file.substr(camera_code_start);
                camera_code = camera_code.substr(0,2);
                duration += input[a].duration;
                switch (camera_code) {
                case 'cn':
                    (a==0)? cameraStr= '(near John': cameraStr += ', near John';
                        break;
                case 'ce':
                    (a==0)? cameraStr= '(near Jake': cameraStr += ', near Jake';
                        break;
                case 'co':
                    (a==0)? cameraStr= '(John\'s face': cameraStr += ', John\'s face';
                        break;
                case 'ca':
                    (a==0)? cameraStr= '(Jake\'s face': cameraStr += ', Jake\'s face';
                        break;
                case '2s':
                    (a==0)? cameraStr= '(wide': cameraStr += ', wide';
                        break;
                case '2o':
                    (a==0)? cameraStr= '(wide right': cameraStr += ', wide right';
                        break;
                case '2a':
                    (a==0)? cameraStr= '(wide left': cameraStr += ', wide left';
                        break;
                default:
                    (a==0)? cameraStr= '(not sure': cameraStr += ', not sure';
                }
            }

            cameraStr +=")\u00A0\u00A0" + duration.toFixed(2) + ' sec';
            return { 'camera': cameraStr, 'duration': duration }
        }
    })

    .filter('dbIds', function(){
        return function(input){
            var ids = [];
            for(var a = 0; a < input.length; a++){
                ids.push(input[a].file)
            }

            return ids.toString()
        }
    })

    .filter('uppercasePause', function(){
        return function(input){
            return input.charAt(0).toUpperCase() + input.slice(1) + ' pause ';
        }
    })

    .filter('ordinal', function(){
        return function(input){
            switch(input){
                case 1:
                    return '1st';
                case 2:
                    return '2nd';
                case 3:
                    return '3rd';
                case 4:
                    return '4th';
                default:
                    return input;
            }
        }
    })

    .filter('speaker', function($cacheFactory){

        var getSpeaker = function(entry){
            switch(entry.type){
                case 'ALTERNATIVE_FREE':
                case 'ALTERNATIVE_PAIRED':
                    return entry.options[0].speaker;
                    break;
                case 'DEFAULT':
                    return entry.speaker;
                    break;
                case 'PAIRED_PARENT':
                    return entry.children[0].options[0].speaker;
                    break;
                case 'ALTERNATIVE_PARENT':
                case 'ALTERNATIVE_PAIRED_PARENT':
                    return entry.children[0].options[0].speaker;
                    break;
                default:
                    return 'nobody found as speaker';
            }
        };

        return  function(index) {
            var data = $cacheFactory.get('Scene').get('script');

            var currentSpeaker = getSpeaker(data[index]);
            var lastSpeaker = getSpeaker(data[index-1]);
            if(currentSpeaker != lastSpeaker){
                lastSpeaker = currentSpeaker;
                return currentSpeaker + ": ";
            }else{
                return('\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0');
            }

        }


    });
