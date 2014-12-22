(function() {

    describe('Tests alog pv', function() {
        it('typeof alog', function(done) {
            assert.equal(typeof alog, 'function');
            done();
        });
        it('alog set / get', function(done) {
            alog('set', 'name', 'zswang');
            alog('get', 'name', function(value) {
                assert.equal(value, 'zswang');
                done();
            });
        });
    });

}).call(this);
