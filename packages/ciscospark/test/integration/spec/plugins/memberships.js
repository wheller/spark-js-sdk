/**!
 *
 * Copyright (c) 2015-2016 Cisco Systems, Inc. See LICENSE file.
 */

import {assert} from '@ciscospark/test-helper-chai';
import sinon from '@ciscospark/test-helper-sinon';
import testUsers from '@ciscospark/test-helper-test-users';
import spark from '../../..';

describe(`ciscospark`, function() {
  this.timeout(60000);
  describe(`#memberships`, () => {
    const memberships = [];

    let user1;
    before(() => {
      return testUsers.create({count: 1})
        .then((users) => {
          user1 = users[0];
        });
    });

    afterEach(() => {
      return Promise.all(memberships.map((membership) => {
        return spark.memberships.remove(membership)
          .catch((reason) => {
            console.error(`Failed to delete membership`, reason);
          });
      }))
        .then(() => {
          while (memberships.length) {
            memberships.pop();
          }
        });
    });

    let room;
    beforeEach(() => {
      return spark.rooms.create({title: `Cisco Spark Test Room`})
        .then((r) => {
          room = r;
        });
    });

    describe(`#create()`, () => {
      it(`creates a membership by user id`, () => {
        return spark.memberships.create({
          roomId: room.id,
          personId: user1.id
        })
          .then((membership) => {
            assert.isMembership(membership);
          });
      });

      it(`creates a membership by user email`, () => {
        return spark.memberships.create({
          roomId: room.id,
          personEmail: user1.email
        })
          .then((membership) => {
            assert.isMembership(membership);
          });
      });

      it(`creates a membership and sets moderator status`, () => {
        return spark.memberships.create({
          roomId: room.id,
          personId: user1.id,
          isModerator: true
        })
          .then((membership) => {
            assert.isMembership(membership);
            assert.isTrue(membership.isModerator);
          });
      });
    });

    describe(`#get()`, () => {
      let membership;
      before(() => {
        // this could be in parallel once KMS always sends new keys
        return spark.rooms.create({title: `Membership A`})
          .then((room) => {
            return Promise.all([
              room,
              spark.rooms.create({title: `Membership B`})
            ]);
          })
          .then((rooms) => {
            const room = rooms[0];
            return spark.memberships.create({
              roomId: room.id,
              personId: user1.id
            });
          })
          .then((m) => {
            membership = m;
          });
      });

      it(`retrieves a single membership`, () => {
        return spark.memberships.get(membership)
          .then((m) => {
            assert.deepEqual(m, membership);
          });
      });
    });

    describe(`#list()`, () => {
      let room;
      before(() => {
        // this could be in parallel once KMS always sends new keys
        return spark.rooms.create({title: `Membership A`})
          .then((room) => {
            return Promise.all([
              room,
              spark.rooms.create({title: `Membership B`})
            ]);
          })
          .then((rooms) => {
            room = rooms[0];
            return spark.memberships.create({
              roomId: room.id,
              personId: user1.id
            });
          });
      });

      it(`retrieves all memberships for a room`, () => {
        return spark.memberships.list({roomId: room.id})
          .then((memberships) => {
            assert.isDefined(memberships);
            assert.isAbove(memberships.length, 0);
            for (const membership of memberships) {
              assert.isMembership(membership);
              assert.equal(membership.roomId, room.id);
            }
          });
      });

      it(`retrieves a bounded set of memberships for a room`, () => {
        const spy = sinon.spy();
        return spark.memberships.list({roomId: room.id, max: 1})
          .then((memberships) => {
            assert.lengthOf(memberships, 1);
            return (function f(page) {
              for (const membership of page) {
                spy(membership.id);
              }

              if (page.hasNext()) {
                return page.next().then(f);
              }

              return Promise.resolve();
            }(memberships));
          })
          .then(() => {
            assert.calledTwice(spy);
          });
      });

      it(`retrieves all room memberships for a user`, () => {
        return spark.memberships.list({
          personId: spark.$user.id,
          roomId: room.id
        })
          .then((memberships) => {
            const membership = memberships.items[0];
            return spark.memberships.list({
              personEmail: spark.$user.email
            })
              .then((memberships) => {
                assert.isDefined(memberships);
                assert.isAbove(memberships.length, 0);
                for (const membership of memberships) {
                  assert.isMembership(membership);
                  assert.equal(membership.personEmail, spark.$user.email);
                }
                assert.include(memberships.items, membership);
              });
          });
      });

      it(`retrieves a bounded set of memberships for a user`, () => {
        const spy = sinon.spy();
        return spark.memberships.list({personId: spark.$user.id, max: 1})
          .then((memberships) => {
            assert.lengthOf(memberships, 1);
            return (function f(page) {
              for (const membership of page) {
                assert.equal(membership.personEmail, spark.$user.email);
                spy(membership.id);
              }

              if (page.hasNext()) {
                return page.next().then(f);
              }

              return Promise.resolve();
            }(memberships));
          })
          .then(() => {
            assert.isAbove(spy.callCount, 0);
          });
      });

    });

    describe(`#update()`, () => {
      let membership;
      before(() => {
        return spark.rooms.create({title: `Membership E`})
          .then((room) => {
            return spark.memberships.create({
              roomId: room.id,
              personId: user1.id
            });
          })
          .then((m) => {
            membership = m;
          });
      });

      it(`updates the membership's moderator status`, () => {
        assert.isFalse(membership.isModerator);
        membership.isModerator = true;
        return spark.memberships.update(membership)
          .then((m) => {
            assert.deepEqual(m, membership);
            assert.isTrue(m.isModerator);
          });
      });
    });

    describe(`#remove()`, () => {
      let membership, room;
      before(() => {
        return spark.rooms.create({title: `Membership E`})
          .then((r) => {
            room = r;
            return spark.memberships.create({
              roomId: room.id,
              personId: user1.id
            });
          })
          .then((m) => {
            membership = m;
          });
      });

      it(`deletes a single membership`, () => {
        return spark.memberships.remove(membership)
          .then((body) => {
            assert.notOk(body);
            return spark.memberships.list(room);
          })
          .then((memberships) => {
            assert.notInclude(memberships, membership);
          });
      });
    });
  });
});
