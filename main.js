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
    }
  };
});

app.controller('List', function($scope) {
  $scope.clips = [];

  $scope.setKey = function(index) {
    var clip = $scope.clips[index];
    clip.setting = true;
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
});
