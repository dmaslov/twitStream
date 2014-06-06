describe('factory: StreamStatus', function(){
    'use strict';

    var StreamStatus;

    beforeEach(module('twitStream'));

    beforeEach(inject(function($injector) {
        StreamStatus = $injector.get('StreamStatus');
    }));

    it('should be initted', function(){
        expect(StreamStatus).toBeDefined();
    });

    it('should have a get method', function(){
        expect(angular.isFunction(StreamStatus.get)).toBe(true);
    });

    it('should have a set method', function(){
        expect(angular.isFunction(StreamStatus.set)).toBe(true);
    });

    it('should return value', function(){
        StreamStatus.set('key', 'value');
        var value = StreamStatus.get('key');
        expect(value).toBe('value');
    });

    it('should return undefined if key doesnt exists', function(){
        StreamStatus.set('key', 'value');
        var value = StreamStatus.get('key2');
        expect(value).toBe(undefined);
    });
});

describe('factory: Storage', function(){
    'use strict';
});

describe('factory: Socket', function(){
    'use strict';
});

describe('factory: Tweet', function(){
    'use strict';
});
