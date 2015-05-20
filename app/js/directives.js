/**
 * Created by ian on 07.02.15.
 */
var scriptBoxWidgets = angular.module('scriptBoxWidgets', ['ui.bootstrap', 'janeFilters']);

var capitaliseFirstLetter = function (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

var toggleCollapse = function (val, $scope) {
    $('#collapse_' + val).collapse('toggle');
    var $icon = $('#icon_' + val + '> i');
    if ($icon.hasClass('fa-chevron-right')) {
        $icon.addClass('fa-chevron-down').removeClass('fa-chevron-right');
        $('#row_' + $scope.cut.index).addClass('placementborder');
        $('#row_' + ($scope.cut.index + 1)).addClass('nextrowline');
    } else {
        $icon.addClass('fa-chevron-right').removeClass('fa-chevron-down');
        $('#row_' + $scope.cut.index).removeClass('placementborder');
        $('#row_' + ($scope.cut.index + 1)).removeClass('nextrowline');
    }
};

var cameraTxtFromCode = function (input) {
    var camera_code_start = input.lastIndexOf('_') + 1;
    var camera_code = input.substr(camera_code_start);
    var camtext = "";

    switch (camera_code) {
        case 'cn':
        case 'ce':
            camtext = 'near';
            break;
        case 'co':
        case 'ca':
            camtext = 'face';
            break;
        case '2s':
            camtext = 'wide';
            break;
        case '2o':
            camtext = 'wide right';
            break;
        case '2a':
            camtext = 'wide left';
            break;
        default:
            camtext = 'not sure';
    }

    return camtext; //{code: camera_code, text: camtext};
};

var setCamera = function ($camera, sources) {
    var camera_num = sources.length;
    var chosen_camera = Math.floor(Math.random() * camera_num);
    var source = sources[chosen_camera];
    var camtext = cameraTxtFromCode(source.file);
    //var camtext = cameraVals.text;
    //var cameracode = cameraVals.code;
    cameraCss($camera, camtext);
    $camera.text(camtext);

    if (camera_num == 1)$camera.attr('disabled', true);

    return chosen_camera;
};

var cameraCss = function ($camera, camtext) {
    if (camtext.indexOf('wide') > -1) {
        if ($camera.hasClass('closecam')) {
            $camera.removeClass('closecam');
        }
        $camera.addClass('widecam')
    } else {
        if ($camera.hasClass('widecam')) $camera.removeClass('widecam');
        $camera.addClass('closecam')
    }
};

var cameraToggle = function (sources, index, $camera, $row) {
    var newIndex = (index == 0)? 1: 0;
    var filename = sources[newIndex].file;
    var camtext = cameraTxtFromCode(filename);
    //var camtext = cameraVals.text;
    $camera.text(camtext);
    cameraCss($camera, camtext);
    $row.attr('data-file', filename);
    return newIndex;
};

var getSeqFiles = function (input) {
    var files = [];
    for (var a = 0; a < input.length; a++) {
        files.push(input[a].file)
    }
    return files.toString();
};

var rowEnter = function (rowArray) {
    return function () {
        for (var i = 0, len = rowArray.length; i < len; i++) {
            rowArray[i].css('background-color', '#ebeded');
        }
    };
};

var rowLeave = function (rowArray) {
    return function () {
        for (var i = 0, len = rowArray.length; i < len; i++) {
            rowArray[i].css('background-color', '#fbfdff');
        }
    }
};

scriptBoxWidgets.directive('ctoriaFree', ['cameraFilter', 'speakerFilter', function (camera, speaker) {
    return {
        restrict: 'E',
        scope: {
            src_index: '@',
            file: '@dataFile',
            selected: '@dataSelectedPosition',
            cut: '=',
            duration: '@'
        },
        templateUrl: 'templates/ctoria-free.html',
        controller: function ($scope, $element) {

            $scope.fold = function (val) {
                toggleCollapse(val, $scope);
            };

            $scope.optionClick = function (val) {
                var $option = $('#' + val);
                var opt_txt = $option.text();
                $scope.selected = $option.attr('data-position');
                var $row = $('#row_' + $scope.cut.index);
                var sources = $scope.cut.options[$scope.selected - 1].sources;
                var oldDuration =  $scope.duration;
                $row.attr('data-file', sources[$scope.src_index].file);
                $scope.duration = sources[$scope.src_index].duration;

                var $choice = $("[data-cut-id=" + $scope.cut.index + "]");
                var $speaker = $("[speaker-cut-id=" + $scope.cut.index + "]");
                $speaker.text(speaker($scope.cut.index));
                $choice.text(opt_txt);
                $scope.$root.$broadcast('lengthChange', $scope.duration - oldDuration);
                $scope.$root.$broadcast('incrementDialogueChanges');

                $('#collapse_' + $scope.cut.index).collapse('toggle');
                $('#icon_' + $scope.cut.index + '> i').addClass('fa-chevron-right').removeClass('fa-chevron-down');
                if ($choice.attr('data-selected-position') != 0) {
                    $('#' + $scope.cut.index + '_opt_' + $choice.attr('data-selected-position')).prop("disabled", false).toggleClass('optionbtn-disabled');
                    $row.removeClass('placementborder');
                    $('#row_' + ($scope.cut.index + 1)).removeClass('nextrowline');
                }

                $option.prop("disabled", true).toggleClass('optionbtn-disabled');
                $choice.attr('data-selected-position', $option.attr('data-position'));
            }
        },

        link: function (scope, $element, $attr) {

            $element.ready(function () {
                var $row = $('#row_' + scope.cut.index);
                var choice_pos = Math.floor((Math.random() * scope.cut.options.length)) + 1;
                scope.selected = choice_pos;
                var $choice = $("[data-cut-id=" + scope.cut.index + "]");
                var $speaker = $("[speaker-cut-id=" + scope.cut.index + "]");
                $choice.attr('data-selected-position', choice_pos);
                var $camera = $('#camera_' + scope.cut.index);
                var sources = scope.cut.options[choice_pos - 1].sources;
                scope.src_index = setCamera($camera, sources);
                $row.attr('data-file', sources[scope.src_index].file);
                scope.duration = sources[scope.src_index].duration;
                scope.$root.$broadcast('lengthChange', scope.duration);

                var $option = $('#' + scope.cut.index + '_opt_' + choice_pos);
                var opt_txt = $option.text();

                $speaker.text(speaker(scope.cut.index));
                $choice.text(opt_txt);
                $option.prop("disabled", true).toggleClass('optionbtn-disabled');

                $choice.on('mouseenter', rowEnter([$row]));
                $choice.on('mouseleave', rowLeave([$row]));
                $camera.on('click', function () {
                    var sources = scope.cut.options[scope.selected - 1].sources;
                    scope.src_index = cameraToggle(sources, scope.src_index, $camera, $row);
                    var oldDuration = scope.duration;
                    scope.duration = sources[scope.src_index].duration;
                    scope.$root.$broadcast('lengthChange', scope.duration - oldDuration);
                    scope.$root.$broadcast('incrementCameraChanges');
                });
            });
        }
    }
}]);

scriptBoxWidgets.directive('ctoriaPairedChildFree', ['cameraFilter', 'speakerFilter', function (camera, speaker, $rootScope) {
    return {
        restrict: 'E',
        scope: {
            db_id: '@dataDbId',
            selected: '@dataSelectedOption',
            index: '=',
            cut: '='
        },
        templateUrl: 'templates/ctoria-paired-child-free.html',
        controller: function ($scope, $element, $rootScope) {

            $scope.fold = function (val) {
                $('#collapse_' + val).collapse('toggle');
                if ($('#icon_' + val + '> i').hasClass('fa-chevron-right')) {
                    $('#icon_' + val + '> i').addClass('fa-chevron-down').removeClass('fa-chevron-right');
                    $('#row_' + $scope.index + '_child_' + $scope.cut.position).addClass('placementborder');
                    $('#row_' + $scope.index + '_child_' + ($scope.cut.position + 1)).addClass('nextrowline');
                } else {
                    $('#icon_' + val + '> i').addClass('fa-chevron-right').removeClass('fa-chevron-down');
                    $('#row_' + $scope.index + '_child_' + $scope.cut.position).removeClass('placementborder');
                    $('#row_' + $scope.index + '_child_' + ($scope.cut.position + 1)).removeClass('nextrowline');
                }
            };

            $scope.optionClick = function (val) {
                var $option = $('#' + val);
                var opt_txt = $option.text();
                var $child_choice = $("[data-cut-id=" + $scope.index + '_child_' + $scope.cut.position + "]");
                var $choice = $("[data-cut-id=" + $scope.index + "]");
                $scope.pairedVal = $scope.cut.position;
                $choice.text(opt_txt);
                $child_choice.text(opt_txt);

                $('#collapse_' + $scope.index + '_child_' + $scope.cut.position).collapse('toggle');
                $('#icon_' + $scope.index + '> i').addClass('fa-chevron-right').removeClass('fa-chevron-down');
                $('#icon_' + $scope.index + '_child_' + $scope.cut.position + '> i').addClass('fa-chevron-right').removeClass('fa-chevron-down');
                $('#' + $scope.index + '_child_' + $scope.cut.position + '_opt_' + $scope.selectedChild).prop("disabled", false).toggleClass('optionbtn-disabled');
                $scope.selectedChild = $option.attr('data-position');
                $option.prop("disabled", true).toggleClass('optionbtn-disabled');
                $child_choice.attr('data-selected-option', $option.attr('data-position'));

                $('#row_' + $scope.index + '_child_' + $scope.cut.position).removeClass('placementborder');
                $('#row_' + $scope.index + '_child_' + ($scope.cut.position + 1)).removeClass('nextrowline');

                if ($scope.$parent.cut.arguments.pos > 1) {
                    $rootScope.$broadcast($scope.index + '_pairedSelected', $scope.cut.position);
                }
            };

            $element.ready(function () {
                var $row = $('#row_' + $scope.index + '_child_' + $scope.cut.position);
                var choice_pos = Math.floor((Math.random() * $scope.cut.options.length) + 1);
                $scope.selectedChild = choice_pos;
                var $choice = $("[data-cut-id=" + $scope.index + '_child_' + $scope.cut.position + "]");
                $choice.attr('data-selected-option', choice_pos);
                var $camera = $('#camera_' + $scope.index);
                var sources = $scope.cut.options[choice_pos - 1].sources;
                $scope.src_index = setCamera($camera, sources);

                var $option = $('#' + $scope.index + '_child_' + $scope.cut.position + '_opt_' + choice_pos);
                var opt_txt = $option.text();
                $choice.text(opt_txt);
                $option.prop("disabled", true).toggleClass('optionbtn-disabled');

                $choice.on('mouseenter', rowEnter([$row]));
                $choice.on('mouseleave', rowLeave([$row]));

                $rootScope.$broadcast($scope.index + '_childReady');
            });
        },

        link: function (scope, $element, $attr, $rootScope) {

        }
    }
}]);

scriptBoxWidgets.directive('ctoriaDefault', ['cameraFilter', function (camera) {
    return {
        restrict: 'E',
        scope: {
            src_index: '@',
            cut: '=',
            duration: '@'
        },
        templateUrl: 'templates/ctoria-default.html',
        link: function (scope, $element, $attr) {
            $element.ready(function () {
                var $row = $('#row_' + scope.cut.index);
                var $camera = $('#camera_' + scope.cut.index);
                var sources = scope.cut.sources;
                scope.src_index = setCamera($camera, sources);
                $row.attr('data-file', sources[scope.src_index].file);
                scope.duration = sources[scope.src_index].duration;
                scope.$root.$broadcast('lengthChange', scope.duration);

                $camera.on('click', function () {
                    scope.src_index = cameraToggle(scope.cut.sources, scope.src_index, $camera, $row);
                    var oldDuration = scope.duration;
                    scope.duration = scope.cut.sources[scope.src_index].duration;
                    scope.$root.$broadcast('lengthChange', scope.duration - oldDuration);
                    scope.$root.$broadcast('incrementCameraChanges');
                });
            });
        }
    }
}]);

scriptBoxWidgets.directive('ctoriaSeqSet', ['seqCameraFilter', function (seqCamera) {
    return {
        restrict: 'E',
        scope: {
            cut: '=',
            //db_ids: '@',
            dataSelectedPosition: '@',
            duration: '@',
            setName: '@'
        },
        templateUrl: 'templates/ctoria-seq-set.html',
        controller: function ($scope, $element, $document) {

            $scope.pauseClick = function (setName, seqChosen) {
                if(setName != $scope.setName){
                    $('[set-cut-id=' + $scope.cut.index + '_seq_' + $scope.setName + ']').css('color', '#333');
                    $scope.setName = setName;
                    $('[set-cut-id=' + $scope.cut.index + '_seq_' + $scope.setName + ']').css('color', '#ed6a43');
                }
                var $row = $('#row_' + $scope.cut.index);
                var $choice = $("[data-cut-id=" + $scope.cut.index + "]");
                var $pauseOpt = $('#' + $scope.cut.index + '_' + setName + '_' + seqChosen);
                var oldDuration = $scope.duration;
                var pauseTxt = $pauseOpt.attr('set-name');
                $scope.duration = Number($pauseOpt.attr('data-duration'));
                $choice.text(pauseTxt);
                $("[camera-cut-id=" + $scope.cut.index + "]").text($pauseOpt.text());
                var oldSelection = $choice.attr('data-selected-position');
                $choice.attr('data-selected-position', $scope.cut.index + '_' + setName + '_' + seqChosen);
                $('#collapse_' + $scope.cut.index).collapse('toggle');
                $scope.foldSeq(setName);
                $('#icon_' + $scope.cut.index + '> i').addClass('fa-chevron-right').removeClass('fa-chevron-down');
                $pauseOpt.prop("disabled", true).toggleClass('optionbtn-disabled');
                $('#' + oldSelection).prop("disabled", false).toggleClass('optionbtn-disabled');
                $row.removeClass('placementborder');
                $row.attr('data-file', $pauseOpt.attr('data-file'));
                $('#row_' + ($scope.cut.index + 1)).removeClass('nextrowline');
                $scope.$root.$broadcast('lengthChange', $scope.duration - oldDuration);
                $scope.$root.$broadcast('incrementCameraChanges', true);
            };

            $scope.fold = function (val) {
                toggleCollapse(val, $scope)
            };

            $scope.foldSeq = function (seq_name) {
                $('#collapse_' + $scope.cut.index + '_seq_' + seq_name).collapse('toggle');
                var $row = $('#row_' + $scope.cut.index + '_seq_' + seq_name);
                var $icon = $('#icon_' + $scope.cut.index + '_seq_' + seq_name + '> i');
                if ($icon.hasClass('fa-chevron-right')) {
                    $icon.addClass('fa-chevron-down').removeClass('fa-chevron-right');
                    $row.addClass('seqsetline');
                } else {
                    $icon.addClass('fa-chevron-right').removeClass('fa-chevron-down');
                    $row.removeClass('seqsetline');
                }
            };
        },
        link: function (scope, $element, $attr, initData) {
            $element.ready(function () {
                var $choice = $("[data-cut-id=" + scope.cut.index + "]");
                var $cameraDesc = $("[camera-cut-id=" + scope.cut.index + "]");
                var $row = $('#row_' + scope.cut.index);
                $choice.on('mouseenter', rowEnter([$row, $choice]));
                $choice.on('mouseleave', rowLeave([$row, $choice]));

                var $shortbut = $('#row_' + scope.cut.index + '_seq_' + scope.cut.sets[0].name);
                var $short = $('[set-cut-id=' + scope.cut.index + '_seq_' + scope.cut.sets[0].name + ']');
                var $medium = $('#row_' + scope.cut.index + '_seq_' + scope.cut.sets[1].name);
                var $mediumbut = $('[set-cut-id=' + scope.cut.index + '_seq_' + scope.cut.sets[1].name + ']');
                var $long = $('#row_' + scope.cut.index + '_seq_' + scope.cut.sets[2].name);
                var $longrow = $('[set-cut-id=' + scope.cut.index + '_seq_' + scope.cut.sets[2].name + ']');

                $shortbut.on('mouseenter', rowEnter([$shortbut, $short]));
                $shortbut.on('mouseleave', rowLeave([$shortbut, $short]));
                $medium.on('mouseenter', rowEnter([$medium, $mediumbut]));
                $medium.on('mouseleave', rowLeave([$medium, $mediumbut]));
                $long.on('mouseenter', rowEnter([$long, $longrow]));
                $long.on('mouseleave', rowLeave([$long, $longrow]));

                $cameraDesc.on('mouseenter', rowEnter([$row, $choice]));
                $cameraDesc.on('mouseleave', rowLeave([$row, $choice]));

                var setNames = ["short", "medium", "long"];
                var setChosen = Math.floor(Math.random() * 3);
                var seqChosen = Math.floor(Math.random() * scope.cut.sets[setChosen].seqs.length);
                var cameraVals = seqCamera(scope.cut.sets[setChosen].seqs[seqChosen]);

                scope.setChoice = setChosen;
                scope.seqChoice = seqChosen;
                scope.setName = setNames[setChosen];
                $('[set-cut-id=' + scope.cut.index + '_seq_' + scope.setName + ']').css('color', '#ed6a43');
                $choice.attr('data-selected-position', scope.cut.index + '_' + setNames[setChosen] + '_' + seqChosen);
                //$('#row_' + scope.cut.index + '_' + setNames[setChosen] + '_' + seqChosen).prop("disabled", true).toggleClass('optionbtn-disabled');
                $('#' + scope.cut.index + '_' + setNames[setChosen] + '_' + seqChosen).prop("disabled", true).toggleClass('optionbtn-disabled');
                $choice.text(capitaliseFirstLetter(setNames[setChosen]) + ' pause'); //\u00A0\u00A0\u00A0\u00A0' + cameraStr);
                $cameraDesc.text(cameraVals.camera);
                scope.duration = cameraVals.duration;
                scope.$root.$broadcast('lengthChange', scope.duration);
                $('#row_' + scope.cut.index).attr('data-file', getSeqFiles(scope.cut.sets[setChosen].seqs[seqChosen]));

                if (!initData.widthset) {
                  // console.log(initData.lastInteraction);
                 //console.log($('#row_' + scope.cut.index).attr('width'))
                 $('.scriptbox').css('width', $('#row_' + scope.cut.index).width() + 35);
                 initData.widthset = true;
                 }
            })
        }
    }
}]);

scriptBoxWidgets.directive('ctoriaParent', ['cameraFilter', '$compile', function (camera, $compile) {

    return {
        restrict: 'E',
        scope: {
            db_id_other: '@',
            cut: '=',
            selected: '@dataSelectedPosition',
            selectedChild: '@dataSelectedChild',
            duration: '@',
            src_index: '@',
            src_index_other: '@'
        },

        templateUrl: 'templates/ctoria-parent.html',

        controller: function ($scope, $element, $attrs, $rootScope) {
            var childReadyCount = 0;
            $scope.fold = function (val) {
                $('#collapse_' + val).collapse('toggle');
                if ($('#icon_' + val + '> i').hasClass('fa-chevron-right')) {
                    $('#icon_' + val + '> i').addClass('fa-chevron-down').removeClass('fa-chevron-right');
                    if ($scope.cut.children[$attrs.selectedPosition - 1].type == 'ALTERNATIVE_COMPOUND') {
                        $('#row_' + $scope.cut.index + '_sel').addClass('nextselectline');
                    } else {
                        console.log('just fuck off for now')
                    }
                    $('#row_' + ($scope.cut.index + 1)).addClass('nextrowline');
                } else {
                    $('#icon_' + val + '> i').addClass('fa-chevron-right').removeClass('fa-chevron-down');
                    if ($scope.cut.children[$attrs.selectedPosition - 1].type == 'ALTERNATIVE_COMPOUND') {
                        $('#row_' + $scope.cut.index + '_sel').removeClass('nextselectline');
                    } else {
                        console.log('just screw yourself for now')
                    }
                    $('#row_' + ($scope.cut.index + 1)).removeClass('nextrowline');
                }
            };

            $scope.$on($scope.cut.index + '_childReady', function (e, val) {
                childReadyCount++;
                if (childReadyCount == $scope.cut.children.length) {
                    var choice_pos = Math.floor((Math.random() * ($scope.cut.children.length - 1))) + 1;
                    //var choice_pos = Math.floor((Math.random() * $scope.cut.children.length));
                    $scope.selectedChild = choice_pos;
                    //console.log($scope.cut.children[choice_pos].type);
                    var child_type = $scope.cut.children[choice_pos].type;

                    switch (child_type) {
                        case 'ALTERNATIVE_COMPOUND':
                            //child selection values
                            var $defSel = $('#def_' + $scope.cut.index + '_child_' + choice_pos);
                            var $optSel = $("[data-cut-id=" + $scope.cut.index + "_child_" + choice_pos + "]");
                            var selectedOpt = $optSel.attr('data-selected-position');
                            $attrs.selectedPosition = Number(selectedOpt);

                            //def placement button choice rows
                            var $def_row = $('#row_' + $scope.cut.index);
                            $def_row.attr('data-ctoria-type', 'CHILD_COMPOUND');
                            var $def_choice = $("[data-cut-id=" + $scope.cut.index + "]");
                            $def_choice.attr('data-cut-id', 'def_' + $scope.cut.index);

                            $def_choice.on('mouseenter', rowEnter([$def_row]));
                            $def_choice.on('mouseleave', rowLeave([$def_row]));

                            $def_row.css('background-color', '#fbfdff');

                            $def_choice.removeClass('placementbtn').addClass('defaultbtn pull-left');
                            $optSel.css('color', '#ed6a43');
                            $defSel.css('color', '#ed6a43');
                            $def_choice.text($defSel.text());
                            $def_choice.css('padding-left', '0px');

                            var def_sources = $scope.cut.children[$scope.selectedChild - 1].default.sources;
                            var $def_camera = $('#camera_' + $scope.cut.index);
                            $scope.src_index = setCamera($def_camera, def_sources);
                            $scope.duration = def_sources[$scope.src_index].duration;
                            $def_row.attr('data-file', def_sources[$scope.src_index].file);

                            var html_opt_div = "<div class='container'><div id=row_" + $scope.cut.index + "_sel class='row col-md-6'  data-db-id='0' data-camera-code='0' style='background-color: #fbfdff;border-left: 1px solid #c6c7d2;'><div speaker-cut-id=" + $scope.cut.index + " class='col-md-1 speakertxt' 'style='padding-left: 0px;padding-top: 5px'></div><div  class ='col-md-9 compoundoption'><p class='default-text'></p></div><div class='col-md-2'><button id=camera_sel_" + $scope.cut.index + " db_id='0' ng-click='optCameraToggle()' class='pull-right camerabtn'>camera</button></div></div></div>";
                            var opt_div = $compile(html_opt_div)($scope, function (opt_div, $scope) {
                                var $def_row = $('#row_' + $scope.cut.index);
                                opt_div.find('p').text($optSel.text());
                                $('#row_' + $scope.cut.index).parent().after(opt_div);
                                var sel_sources = $scope.cut.children[choice_pos - 1].options[selectedOpt - 1].sources;
                                var $camera_sel = $('#camera_sel_' + $scope.cut.index);
                                $scope.src_index_other =  setCamera($camera_sel, sel_sources);
                                $scope.duration +=  sel_sources[$scope.src_index_other].duration;
                                $def_row.attr('data-file',$def_row.attr('data-file') + ',' + sel_sources[$scope.src_index_other].file);
                                $scope.$root.$broadcast('lengthChange', $scope.duration);
                                var $opt_row = $('#row_' + $scope.cut.index + '_sel');

                                $camera_sel.on('click', function () {
                                    var sources = $scope.cut.children[$scope.selectedChild - 1].options[$attrs.selectedPosition - 1].sources;
                                    var oldDuration = sources[$scope.src_index_other].duration;
                                    var datafiles = $def_row.attr('data-file').split(',');
                                    $scope.src_index_other = cameraToggle(sources, $scope.src_index_other, $camera_sel, $opt_row);
                                    var newDuration = sources[$scope.src_index_other].duration;
                                    datafiles[1] = sources[$scope.src_index_other].file;
                                    $def_row.attr('data-file', datafiles.toString());
                                    $scope.$root.$broadcast('lengthChange', newDuration - oldDuration);
                                    $scope.$root.$broadcast('incrementCameraChanges');
                                });
                            });

                            $def_camera.on('click', function () {
                                var $def_row = $('#row_' + $scope.cut.index);
                                var sources = $scope.cut.children[$scope.selectedChild - 1].default.sources;
                                var oldDuration = sources[$scope.src_index].duration;
                                var datafiles = $def_row.attr('data-file').split(',');
                                $scope.src_index = cameraToggle(sources, $scope.src_index, $def_camera, $def_row);
                                var newDuration = sources[$scope.src_index].duration;
                                datafiles[0] = sources[$scope.src_index].file;
                                $def_row.attr('data-file', datafiles.toString());
                                $scope.$root.$broadcast('lengthChange', newDuration - oldDuration);
                                $scope.$root.$broadcast('incrementCameraChanges');
                            });

                            $scope.$on($scope.cut.index + '_childSelected', function (e, val) {
                                var $def_row = $('#row_' + $scope.cut.index);
                                var $opt_row = $('#row_' + $scope.cut.index + '_sel');

                                var $old_def = $('#def_' + $scope.cut.index + '_child_' + $scope.selectedChild);
                                var $old_choice = $("[data-cut-id=" + $scope.cut.index + '_child_' + $scope.selectedChild + "]");
                                $old_def.css('color', '#333');
                                $old_choice.css('color', '#333');
                                var datafiles = $def_row.attr('data-file').split(',');
                                var old_def_sources = $scope.cut.children[$scope.selectedChild - 1].default.sources;
                                var old_sel_sources = $scope.cut.children[$scope.selectedChild - 1].options[$attrs.selectedPosition - 1].sources;
                                var oldDuration  = old_def_sources[$scope.src_index].duration + old_sel_sources[$scope.src_index_other].duration;

                                $scope.selectedChild = val;

                                var $new_def = $('#def_' + $scope.cut.index + '_child_' + $scope.selectedChild);
                                var $new_choice = $("[data-cut-id=" + $scope.cut.index + '_child_' + $scope.selectedChild + "]");
                                $new_def.css('color', '#ed6a43');
                                $new_choice.css('color', '#ed6a43');
                                var $def = $("[data-cut-id=def_" + $scope.cut.index + "]");
                                $def.text($new_def.text());
                                $scope.$root.$broadcast('incrementDialogueChanges');
                                var $sel = $('#row_' + $scope.cut.index + '_sel');
                                $sel.find('p').text($new_choice.text());
                                $scope.$root.$broadcast('incrementDialogueChanges');

                                var def_sources = $scope.cut.children[$scope.selectedChild - 1].default.sources;
                                datafiles[0] = def_sources[$scope.src_index].file;
                                var duration = def_sources[$scope.src_index].duration;

                                $attrs.selectedPosition = Number($new_choice.attr('data-selected-position'));
                                var sel_sources = $scope.cut.children[$scope.selectedChild - 1].options[$attrs.selectedPosition - 1].sources;
                                datafiles[1] = sel_sources[$scope.src_index_other].file;
                                duration += sel_sources[$scope.src_index_other].duration;
                                $def_row.attr('data-file', datafiles.toString());
                                $scope.$root.$broadcast('lengthChange', duration - oldDuration);
                                $scope.fold($scope.cut.index);
                            });
                            break;

                        default:
                            console.log('default case in Parent Camera switch case');
                            break;
                    }

                    childReadyCount = 0;
                }
            });
        },

        link: function (scope, $element, $attr) {
        }
    }
}]);

scriptBoxWidgets.directive('ctoriaCompound', function () {
    var custom_html = '<div>alternative compound {{cut.index}}</div>';
    return {
        restrict: 'E',
        scope: true,
        template: custom_html,

        controller: function ($scope, $element, $document) {
        },

        link: function (scope, $element, $attr) {
        }
    }
});

scriptBoxWidgets.directive('ctoriaChildCompound', ['cameraFilter', 'speakerFilter', function (camera, speaker, $rootScope) {
    return {
        restrict: 'E',
        scope: {
            db_id: '@dataDbId',
            selected: '@dataSelectedPosition',
            cameraText: '@dataCameraText',
            cut: '=',
            index: '='
        },

        templateUrl: 'templates/ctoria-child-compound.html',

        controller: function ($scope, $element, $document, $rootScope) {

            $scope.fold = function (val) {
                $('#collapse_' + val).collapse('toggle');
                if ($('#def_icon_' + val + '> i').hasClass('fa-chevron-right')) {
                    $('#def_icon_' + val + '> i').addClass('fa-chevron-down').removeClass('fa-chevron-right');
                    $('#row_opt_' + $scope.index + '_child_' + $scope.cut.position).addClass('nextselectline');
                } else {
                    $('#def_icon_' + val + '> i').addClass('fa-chevron-right').removeClass('fa-chevron-down');
                    $('#row_opt_' + $scope.index + '_child_' + $scope.cut.position).removeClass('nextselectline');
                }
            };

            $scope.optionClick = function (val) {
                var $option = $('#' + val);
                var opt_txt = $option.text();
                var $choice = $("[data-cut-id=" + $scope.index + '_child_' + $scope.cut.position + "]");
                $choice.text(opt_txt);

                $('#collapse_' + $scope.index + '_child_' + $scope.cut.position).collapse('toggle');
                $('#def_icon_' + $scope.index + '_child_' + $scope.cut.position + '> i').addClass('fa-chevron-right').removeClass('fa-chevron-down');
                console.log($scope.selected);
                $('#' + $scope.index + '_child_' + $scope.cut.position + '_opt_' + $scope.selected).prop("disabled", false).toggleClass('optionbtn-disabled');
                $scope.selected = Number($option.attr('data-position'));
                $option.prop("disabled", true).toggleClass('optionbtn-disabled');
                $choice.attr('data-selected-position', $option.attr('data-position'));

                $rootScope.$broadcast($scope.index + '_childSelected', $scope.cut.position);
            };

            $element.ready(function () {
                var choice_pos = Math.floor((Math.random() * $scope.cut.options.length) + 1);
                $scope.selected = choice_pos;
                var $choice = $("[data-cut-id=" + $scope.index + '_child_' + $scope.cut.position + "]");
                $choice.attr('data-selected-position', choice_pos);
                var def_sources = $scope.cut.default.sources;
                var $def_camera = $('#camera_' + $scope.index);
                $scope.src_index = setCamera($def_camera, def_sources);

                var $option = $('#' + $scope.index + '_child_' + $scope.cut.position + '_opt_' + choice_pos);
                var opt_txt = $option.text();
                $choice.text(opt_txt);
                $option.prop("disabled", true).toggleClass('optionbtn-disabled');

                $def_choice = $('#def_' + $scope.index + '_child_' + $scope.cut.position);
                var $def_row = $('#row_def_' + $scope.index + '_child_' + $scope.cut.position);

                $def_choice.on('mouseenter', rowEnter([$def_row]));
                $def_choice.on('mouseleave', rowLeave([$def_row]));

                $rootScope.$broadcast($scope.index + '_childReady');
            });
        },

        link: function (scope, $element, $attr) {
        }
    }
}]);

scriptBoxWidgets.directive('ctoriaPairedParent', ['cameraFilter', 'speakerFilter', 'LinkToCut', function (camera, speaker, LinkToCut, $rootScope) {
    return {
        restrict: 'E',
        scope: {
            cut: '=',
            selectedChild: '@dataSelectedChild',
            selectedOption: '@dataSelectedOption',
            src_index: '@',
            duration: '@',
            childReadyCount: '@',
            initialised: '@'
        },
        templateUrl: 'templates/ctoria-paired-parent.html',

        controller: function ($scope, $element, $attrs) {
            $scope.childReadyCount = 0;
            $scope.initialised = false;
            $scope.fold = function (val) {
                toggleCollapse(val, $scope)
            };

            var processChildren = function(){
                var $row = $('#row_' + $scope.cut.index);
                var $camera = $('#camera_' + $scope.cut.index);
                var $optSel = $("[data-cut-id=" + $scope.cut.index + "_child_" + Number($attrs.selectedChild) + "]");
                $scope.selectedOption = Number($optSel.attr('data-selected-option'));
                var sources = $scope.cut.children[Number($attrs.selectedChild) - 1].options[$scope.selectedOption - 1].sources;
                $scope.src_index = setCamera($camera, sources);
                $scope.duration = sources[$scope.src_index].duration;
                $row.attr('data-file', sources[$scope.src_index].file);
                var $choice = $("[data-cut-id=" + $scope.cut.index + "]");
                var $speaker = $("[speaker-cut-id=" + $scope.cut.index + "]");
                $optSel.css('color', '#ed6a43');
                $speaker.text(speaker($scope.cut.index));
                $choice.text($optSel.text());
                $scope.$root.$broadcast('lengthChange', $scope.duration);
                $scope.childReadyCount = 0;

                $camera.on('click', function () {
                    var sources = $scope.cut.children[$attrs.selectedChild - 1].options[$scope.selectedOption - 1].sources;
                    var oldDuration = $scope.duration;
                    $scope.src_index = cameraToggle(sources, $scope.src_index, $camera, $row);
                    $scope.duration = sources[$scope.src_index].duration;
                    $scope.$root.$broadcast('lengthChange', $scope.duration - oldDuration);
                    $scope.$root.$broadcast('incrementCameraChanges');
                });

            };

            if ($scope.cut.arguments.pos < $scope.cut.arguments.total) {
                $rootScope.$broadcast($scope.cut.index, $attrs.selectedChild);
            }

            if ($scope.cut.arguments.pos > 1) {
                $scope.previous = LinkToCut($scope.cut.arguments.prev);
                $scope.$on($scope.previous, function (e, data) {
                    $attrs.selectedChild = data;
                    $scope.initialised = true;
                    if ($scope.childReadyCount == $scope.cut.children.length){
                        processChildren();
                    }
                });

                $scope.$on($scope.previous + '_pairedSelected', function (e, data) {
                    console.log('previous pos change: ' + data + ', heard in pos: ' + $scope.cut.arguments.pos);
                    var $row = $('#row_' + $scope.cut.index);
                    var $old_optSel = $("[data-cut-id=" + $scope.cut.index + "_child_" + $attrs.selectedChild + "]");
                    $old_optSel.css('color', '#000000');
                    $attrs.selectedChild = data;
                    var $camera = $('#camera_' + $scope.cut.index);
                    var $optSel = $("[data-cut-id=" + $scope.cut.index + "_child_" + $attrs.selectedChild + "]");
                    $optSel.css('color', '#ed6a43');
                    $scope.selectedOption = Number($optSel.attr('data-selected-option'));
                    var sources = $scope.cut.children[$attrs.selectedChild - 1].options[$scope.selectedOption - 1].sources;
                    $scope.src_index = setCamera($camera, sources);
                    var oldDuration = $scope.duration;
                    $scope.duration = sources[$scope.src_index].duration;
                    $row.attr('data-file', sources[$scope.src_index].file);
                    var $choice = $("[data-cut-id=" + $scope.cut.index + "]");
                    var $speaker = $("[speaker-cut-id=" + $scope.cut.index + "]");
                    $speaker.text(speaker($scope.cut.index));
                    $choice.text($optSel.text());
                    $choice.removeClass('placementborder');
                    $row.removeClass('placementborder');
                    $('#row_' + ($scope.cut.index + 1)).removeClass('nextrowline');
                    $scope.$root.$broadcast('lengthChange', $scope.duration - oldDuration);
                    $scope.$root.$broadcast('incrementDialogueChanges');
                });

                $scope.$on($scope.cut.index + '_pairedSelected', function (e, val) {
                    var $row = $('#row_' + $scope.cut.index);
                    var $old_child_choice = $("[data-cut-id=" + $scope.cut.index + '_child_' + $attrs.selectedChild + "]");
                    $old_child_choice.css('color', '#000000');
                    $attrs.selectedChild = val;
                    var $new_child_choice = $("[data-cut-id=" + $scope.cut.index + '_child_' + $attrs.selectedChild + "]");
                    $new_child_choice.css('color', '#ed6a43');
                    var $camera = $('#camera_' + $scope.cut.index);
                    $scope.selectedOption = Number($new_child_choice.attr('data-selected-option'));
                    var sources = $scope.cut.children[$attrs.selectedChild - 1].options[$scope.selectedOption - 1].sources;
                    $scope.src_index = setCamera($camera, sources);
                    var oldDuration = $scope.duration;
                    $scope.duration = sources[$scope.src_index].duration;
                    $row.attr('data-file', sources[$scope.src_index].file);
                    $('#collapse_' + $scope.cut.index).collapse('toggle');
                    $row.removeClass('placementborder');
                    $('#row_' + ($scope.cut.index + 1)).removeClass('nextrowline');
                    $scope.$root.$broadcast('lengthChange', $scope.duration - oldDuration);
                    $scope.$root.$broadcast('incrementDialogueChanges');
                })
            }

            $scope.$on($scope.cut.index + '_childReady', function (e, val) {
                $scope.childReadyCount++;
                if ($scope.childReadyCount == $scope.cut.children.length & $scope.initialised) {
                    processChildren();
                }
            })
        },

        link: function (scope, $element, $attrs) {
            $element.ready(function () {
                var $choice = $("[data-cut-id=" + scope.cut.index + "]");
                var $row = $('#row_' + scope.cut.index);
                $choice.on('mouseenter', rowEnter([$row]));
                $choice.on('mouseleave', rowLeave([$row]));
            });
        }
    }
}]);

scriptBoxWidgets.directive('ctoriaPairedFree', ['cameraFilter', 'speakerFilter', 'LinkToCut', function (camera, speaker, LinkToCut) {
    return {
        restrict: 'E',
        scope: {
            src_index: '@',
            selected: '@dataSelectedPosition',
            cut: '=',
            duration: '@'
        },
        templateUrl: 'templates/ctoria-paired-free.html',
        controller: function ($scope, $element, $rootScope, $attrs) {
            $scope.fold = function (val) {
                toggleCollapse(val, $scope)
            };

            $scope.optionClick = function (val) {
                var $row = $('#row_' + $scope.cut.index);
                var $option = $('#' + val);
                var opt_txt = $option.text();
                var $choice = $("[data-cut-id=" + $scope.cut.index + "]");
                var $speaker = $("[speaker-cut-id=" + $scope.cut.index + "]");
                $speaker.text(speaker($scope.cut.index));
                $choice.text(opt_txt);
                var sources = $scope.cut.options[$option.attr('data-position') - 1].sources;
                $row.attr('data-file', sources[$scope.src_index].file);
                var oldDuration = $scope.duration;
                $scope.duration = sources[$scope.src_index].duration;
                $scope.$root.$broadcast('lengthChange', $scope.duration - oldDuration);
                $scope.$root.$broadcast('incrementDialogueChanges');

                $('#collapse_' + $scope.cut.index).collapse('toggle');
                $('#icon_' + $scope.cut.index + '> i').addClass('fa-chevron-right').removeClass('fa-chevron-down');
                if ($choice.attr('data-selected-position') != 0) {
                    $('#' + $scope.cut.index + '_opt_' + $choice.attr('data-selected-position')).prop("disabled", false).toggleClass('optionbtn-disabled');
                    $('#row_' + $scope.cut.index).removeClass('placementborder');
                    $('#row_' + ($scope.cut.index + 1)).removeClass('nextrowline');
                }
                $option.prop("disabled", true).toggleClass('optionbtn-disabled');
                $choice.attr('data-selected-position', $option.attr('data-position'));
                console.log($attrs.selectedPosition);
                $attrs.selectedPosition = $option.attr('data-position');
                console.log($attrs.selectedPosition);

                if ($scope.cut.arguments.pos < $scope.cut.arguments.total) {
                    $scope.$root.$broadcast($scope.cut.index + '_pairedSelected', $attrs.selectedPosition);
                }
            };

            if ($scope.cut.arguments.pos < $scope.cut.arguments.total) {
                $scope.next = LinkToCut($scope.cut.arguments.next);
                $scope.$on($scope.next + '_pairedSelected', function (e, val) {
                    var $row = $('#row_' + $scope.cut.index);
                    console.log('paired change heard: ' + val);
                    var $choice = $("[data-cut-id=" + $scope.cut.index + "]");
                    $('#' + $scope.cut.index + '_opt_' + $choice.attr('data-selected-position')).prop("disabled", false).toggleClass('optionbtn-disabled');
                    var $option = $('#' + $scope.cut.index + '_opt_' + val);
                    var new_opt_txt = $option.text();
                    $scope.selected = $attrs.selectedPosition = val;
                    var sources = $scope.cut.options[$attrs.selectedPosition-1].sources;
                    var oldDuration = $scope.duration;
                    $scope.duration = sources[$scope.src_index].duration;
                    $row.attr('data-file', sources[$scope.src_index].file);
                    $choice.attr('data-selected-position', val);
                    var $speaker = $("[speaker-cut-id=" + $scope.cut.index + "]");
                    $speaker.text(speaker($scope.cut.index));
                    $choice.text(new_opt_txt);
                    $('#' + $scope.cut.index + '_opt_' + $choice.attr('data-selected-position')).prop("disabled", false).toggleClass('optionbtn-disabled');
                    $scope.$root.$broadcast('lengthChange', $scope.duration - oldDuration);
                    $scope.$root.$broadcast('incrementDialogueChanges');
                });
            }

            $element.ready(function () {
                var $row = $('#row_' + $scope.cut.index);
                var choice_pos = Math.floor((Math.random() * $scope.cut.options.length) + 1);
                $scope.selected = $attrs.selectedPosition = choice_pos;
                var $choice = $("[data-cut-id=" + $scope.cut.index + "]");
                var $speaker = $("[speaker-cut-id=" + $scope.cut.index + "]");
                $choice.attr('data-selected-position', choice_pos);
                var $camera = $('#camera_' + $scope.cut.index);
                var sources = $scope.cut.options[choice_pos - 1].sources;
                $scope.src_index = setCamera($camera, sources);
                $scope.duration = sources[$scope.src_index].duration;
                $row.attr('data-file', sources[$scope.src_index].file);
                $scope.$root.$broadcast('lengthChange', $scope.duration);

                if ($scope.cut.arguments.pos == 1) {
                    $scope.$root.$broadcast($scope.cut.index, choice_pos);
                }

                var $option = $('#' + $scope.cut.index + '_opt_' + choice_pos);
                $speaker.text(speaker($scope.cut.index));
                var opt_txt = $option.text();
                $choice.text(opt_txt);
                $option.prop("disabled", true).toggleClass('optionbtn-disabled');

                $choice.on('mouseenter', rowEnter([$row]));
                $choice.on('mouseleave', rowLeave([$row]));

                $camera.on('click', function () {
                    var $row = $('#row_' + $scope.cut.index);
                    var sources = $scope.cut.options[$scope.selected - 1].sources;
                    var oldDuration = $scope.duration;
                    $scope.src_index = cameraToggle(sources, $scope.src_index, $camera, $row);
                    $scope.duration = sources[$scope.src_index].duration;
                    //$row.attr('data-file', sources[$scope.src_index].file);
                    $scope.$root.$broadcast('lengthChange', $scope.duration - oldDuration);
                    $scope.$root.$broadcast('incrementCameraChanges');
                });
            });
        },

        link: function (scope, $element, $attr, $scope) {
        }
    }
}]);

scriptBoxWidgets.directive('ctoriaControl', ['Play', function (Play) {
    return {
        restrict: 'E',
        scope: {
            title: '@',
            generated: '@',
            first: '@',
            last: '@',
            user: '@'
        },
        templateUrl: 'templates/ctoria-control.html',
        controller: function ($scope, $element) {
            $scope.dialogueChanges = 0;
            $scope.cameraChanges = 0;
            $scope.length = 0;
            $scope.user = 'Anonymous user';

            $scope.$on('incrementDialogueChanges', function () {
                $scope.dialogueChanges++;
                //console.log(initData.lastInteraction);
                //initData.lastInteraction = new Date().getUTCMilliseconds();
                //console.log(initData.lastInteraction);
                //$scope.$apply();
            });

            $scope.$on('incrementCameraChanges', function (e, apply) {
                $scope.cameraChanges++;
                //initData.lastInteraction = new Date().getUTCMilliseconds());
                //console.log(initData.lastInteraction);
                if(apply==undefined)$scope.$apply();
            });

            $scope.$on('lengthChange', function(e, diff){
                $scope.length += diff
                console.log('length: ' + $scope.length.toFixed(2));
                var mins = Math.floor($scope.length/60);
                var secs = $scope.length%60;
                $('#duration').text('\u00A0\u00A0\u00A0\u00A0\u00A0' + mins + '\u00A0min\u00A0' + Math.floor(secs) + '\u00A0secs');
                if( isNaN($scope.length)){
                    console.log('problemo')
                }
            });
        },
        link: function (scope, $element, $attr) {
            $element.ready(function () {
                console.log(scope.title);
                var $play = $('#play');
                $play.on('click', function () {
                    Play(scope);
                });
            })
        }
    }
}]);