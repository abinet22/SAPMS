const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const db = require('../models');
const Op = db.Sequelize.Op;

module.exports = function (passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'username' }, async (username, password, done) => {
      try {
        let user = await db.User.findOne({
          where: { username: username },
        });

        if (!user) {
          let targetGroupUser = await db.TargetGroup.findOne({
            where: { username: username },
          });

          if (!targetGroupUser || !(await bcrypt.compare(password, targetGroupUser.password))) {
            return done(null, false, { message: 'Invalid Credentials' });
          }

          return done(null, targetGroupUser);
        }

        if (!(await bcrypt.compare(password, user.password))) {
          return done(null, false, { message: 'Invalid Credentials' });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(async function (id, done) {
    try {
      let user = await db.User.findOne({ where: { id: id } });

      if (user) {
        return done(null, user);
      }

      let targetGroupUser = await db.TargetGroup.findOne({ where: { id: id } });

      if (targetGroupUser) {
        return done(null, targetGroupUser);
      }

      return done(null, false);
    } catch (error) {
      return done(error);
    }
  });
};
