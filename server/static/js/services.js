/**
 * Created by ian on 14.02.15.
 */

var janeServices = angular.module('janeServices', ['ngResource']);

janeServices.factory('Scene',

    function($resource, $cacheFactory){

        var myCache = $cacheFactory('Scene');
        var title = "";

        var scene = $resource('/static/json_model/:scene.json', {scene:'@scene'}, {
            query: {
                method:'GET',
                isArray: false,
                format: 'json',
                cache: true,

                transformResponse: function(data, header) {
                    var content =[];
                    var parts = [];
                    data = JSON.parse(data);
                    var cumulativeLength = 0;
                    for (var i = 0; i < data.scene.parts.length; i++) {
                        parts.push({'id': data.scene.code + '_' + data.scene.parts[i].keyword, 'length': data.scene.parts[i].content.length}); // 'length': data.scene.parts[i].content.length});
                        for (var a = 0; a < data.scene.parts[i].content.length; a++) {
                            data.scene.parts[i].content[a].index = cumulativeLength;
                            content.push(data.scene.parts[i].content[a]);
                            cumulativeLength++;
                        }
                    }

                    myCache.put('script', content);
                    myCache.put('parts', parts);
                    myCache.put('duration', 0);
                    title = data.scene.name;
                    return {content:content, title:title};
                }
            }
        });

        return scene;
    }
);

janeServices.factory('Play',

    function($resource, $cacheFactory){
      console.log('Play service');
        return function(movieInfo){
            var data = $cacheFactory.get('Scene').get('script');
            var parts = $cacheFactory.get('Scene').get('parts');
            var cumulativeTotal = 0;
            var playList = [];
            var title = {};
            title.title = movieInfo.title;
            title.generated = movieInfo.generated;
            title.duration = Math.floor(movieInfo.length/60) + ' min ' + Math.floor(movieInfo.length%60) + ' sec';
            title.user = movieInfo.user;
            title.camera = movieInfo.cameraChanges;
            title.dialogue = movieInfo.dialogueChanges;
            title.actors = 'Jake\t Paul Downey\nJohn\t Colin Mace';
            title.script = 'Ian Flitman';

            for(var b=0; b<parts.length;b++){
                var converstationFolder = parts[b].id.substr(0,parts[b].id.indexOf('_'));
                var partFolder = parts[b].id.substr(parts[b].id.indexOf('_')+1);
                for(var c = cumulativeTotal; c < cumulativeTotal + parts[b].length; c++){
                    var $currentRow = $('#row_' + data[c].index);
                    var files = $currentRow.attr('data-file').split(',');
                    for(var i=0; i < files.length; i++){
                        console.log(converstationFolder + '/' + partFolder + '/' + files[i]);
                        playList.push(converstationFolder + '/' + partFolder + '/' + files[i]);
                    }

                }
                cumulativeTotal +=parts[b].length;
            }

            console.log(JSON.stringify(playList));
            //console.log(JSON.stringify(title));
            console.log('Play service called');
            /*return {
                'title': JSON.stringify(['title': movieInfo.title, '']),
                'playlist': JSON.stringify(playList)
            }*/
        }
    }
);

janeServices.factory('LinkToCut',
    function($resource, $cacheFactory){
        return function(link) {
            var parts = $cacheFactory.get('Scene').get('parts');
            var partid = link.substr(0, link.lastIndexOf('_'));
            var cutIndex = Number(link.substr(link.lastIndexOf('_')+1));
            var cumulativeTotal = 0;
            for(var a = 0; a < parts.length; a++){
                if(parts[a].id == partid){
                    return cumulativeTotal + cutIndex;
                }
                cumulativeTotal += parts[a].length;
            }
        }
    }
);

janeServices.factory('DurationControl',
    function($resource, $cacheFactory){
        var length = $cacheFactory.get('Scene').get('duration');
        var myCache = $cacheFactory('Scene');
        return function(time){
            length += time;
            myCache.put('duration', length);
        }
    }
);


