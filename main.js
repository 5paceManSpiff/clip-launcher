var app = angular.module('clip-launcher', []);

app.directive('fileReader', function($rootScope) {
  return {
    restrict: 'A',
    link: function(scope, element, attr) {
      element.bind('change', function(e) {
        var files = e.target.files;
        $rootScope.$broadcast('files', files);
      });
    }
  };
});

app.directive('audioClip', function($rootScope) {
  return {
    restrict: 'E',
    scope: {src: '=src'},
    link: function(scope, element, attr) {
      var audio = angular.element('<audio controls></audio>');
      var source = angular.element('<source>');
      source.attr('type', scope.src.type);
      source.attr('src', scope.src.data);
      audio.append(source);
      element.append(audio);
      scope.src.audio = audio[0];
    }
  };
});

app.directive('keyBinding', function($document, $rootScope) {
  return {
    restrict: 'E',
    scope: {src: '=src'},
    replace: true,
    template: '<button class="button" ng-click="setKey()">{{src.key}}</button>',
    link: function(scope, element, attr) {
      scope.setKey = function() {
        $rootScope.$broadcast('setting-key');
        element.addClass('button-primary');
        $document.one('keypress', function(e) {
          scope.src.key = e.code;
          $rootScope.$broadcast('set-key', scope.src);
          scope.$apply();
          element.removeClass('button-primary');
        });
      };

      scope.src.toggleColor = function() {
        element.toggleClass('button-primary');
      };
    }
  };
})

app.controller('List', function($document, $scope) {
  $scope.clips = [];
  $scope.playing = false;
  $scope.state = 'Play';

  $scope.toggleState = function() {
    if ($scope.playing) {
      $scope.state = 'Play';
    } else {
      $scope.state = 'Pause';

      angular.forEach($scope.clips, function(clip) {
        clip.startTime = clip.audio.currentTime;
      });
    }

    $scope.playing = !$scope.playing;
  };

  $scope.$on('files', function(e, files) {
    angular.forEach(files, function(file) {

      var reader = new FileReader();

      reader.onload = function(fileEvent) {
        file.data = fileEvent.target.result;
        $scope.clips.push(file);
        $scope.$apply();
      };

      reader.readAsDataURL(file);
    });
  });

  $scope.$on('setting-key', function(e) {
    angular.forEach($scope.clips, function(clip) {
      if (!clip.audio.paused) {
        clip.audio.pause();
      }
    });

    if ($scope.playing) {
      $scope.toggleState();
    }
  });

  $document.on('keydown', function(e) {
    if ($scope.playing) {
      angular.forEach($scope.clips, function(clip) {
        if (clip.key && e.code == clip.key) {
          if (!clip.toggled) {
            clip.toggleColor();
          }

          clip.toggled = true;
          clip.audio.play();
        }
      });
    }
  });

  $document.on('keyup', function(e) {
    if ($scope.playing) {
      angular.forEach($scope.clips, function(clip) {
        if (clip.key && e.code == clip.key) {
          clip.toggleColor();
          clip.toggled = false;
          clip.audio.pause();
          clip.audio.currentTime = clip.startTime;
        }
      });
    }
  });
});
