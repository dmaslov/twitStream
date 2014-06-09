describe('Controllers Tests:', function(){
    describe('StreamController', function(){
        'use strict';

        beforeEach(module('twitStream'));

        it('should be inited', inject(function($controller, $rootScope){
            var StreamController = $controller('StreamController', {$scope: $rootScope});
            expect(StreamController).toBeDefined();
        }));
    });


    describe('FavoritesController', function(){
        'use strict';

        beforeEach(module('twitStream'));

        it('should be inited', inject(function($controller, $rootScope){
            var FavoritesController = $controller('FavoritesController', {$scope: $rootScope});
            expect(FavoritesController).toBeDefined();
        }));
    });
});
