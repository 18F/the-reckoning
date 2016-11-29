'use strict';

const assert           = require('assert');
const acceptanceHelper = require('../support/acceptance-helper');
const userDelete       = require('../../app/models/persistence/user-delete');
const userCreate       = require('../../app/models/persistence/user-create');

describe('signing in and out flows:', () => {
  beforeEach((done) => {
    acceptanceHelper.startServer(done);
  });

  afterEach((done) => {
    acceptanceHelper.stopServer(done);
  });

  it('viewing a protected page and not signed in will redirect to sign in', (done) => {
    acceptanceHelper
      .get('/dashboard')
      .end((err, res) => {
        if (err) { return done(err); }
        assert.deepEqual(res.redirects, ['http://localhost:' + acceptanceHelper.port + '/sign-in']);
        done();
      });
  });

  it('viewing the sign in page', (done) => {
    acceptanceHelper
      .get('/sign-in')
      .end((err, res) => {
        if (err) { return done(err); }
        assert(res.text.includes('Sign in'));
        done();
      });
  });

  describe('when user exists', () => {
    let email, password;

    beforeEach((done) => {
      email = 'email-y@GMAIL.com';
      password = 's3kr3tz';

      userDelete
        .all()
        .then(() => {
          return userCreate({
            email: email,
            password: password
          });
        })
        .then(() => { done(); })
        .catch(done);
    });

    it('and the email and password match the database, the user will be signed in', (done) => {
      acceptanceHelper
        .postForm('/sign-in', {email: email, password: password})
        .end((err, res) => {
          if (err) { return done(err); }
          assert(res.text.includes('signed in as ' + email));
          done();
        });
    });
  });
});