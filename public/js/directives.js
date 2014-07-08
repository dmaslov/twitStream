App
.directive('tweet', function(){
  return {
    restrict: 'E',
    scope: true,
    replace: true,
    templateUrl: '/partial/tweet_template.html'
  };
});
