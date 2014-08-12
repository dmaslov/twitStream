describe('Directives Tests:', function(){
    var element;

    beforeEach(module('twitStream', 'Templates'));

    beforeEach(function(){
      inject(function($compile, $rootScope, $injector) {
          var Tweet = $injector.get('Tweet');
          var $scope = $rootScope;
          $scope.tweet = Tweet.parse(tweetObj);
          element = angular.element('<tweet></tweet>');
          $compile(element)($scope);
          $scope.$digest();
      });
    });

    afterEach(function(){
      element = null;
    });

    describe('Tweet Element', function(){
      it('should contain html', function(){
        expect(element.html()).not.toEqual(false);
        expect(element.html()).not.toBeUndefined();
      });

      it('should contain mock values', function(){
        expect(element.find('img').attr('src')).toEqual(tweetObj.user.profile_image_url);
      });
    });
});
