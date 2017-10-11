const expect = require('expect');

var jeocsvlib = require('./../jeocsvlib');


describe('Geocsvlib', () => {
    it('Should push data into the pipleline', () => {
        var spy = expect.createSpy();
        jeocsvlib.pushData(5, spy);
        expect(jeocsvlib.pipeline).toContain(5);
        expect(spy).toHaveBeenCalledWith(jeocsvlib.pipeline);
    });
});
