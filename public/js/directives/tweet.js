(function(angular){
  'use strict';

  angular
  .module('twitStream')
  .directive('tweet', Tweet);

  function Tweet(){
    var directive = {
      restrict: 'E',
      scope: true,
      replace: true,
      templateUrl: '/partial/tweet_template.html'
    };

    return directive;
  }

})(angular);
