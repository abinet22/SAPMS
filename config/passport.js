const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const db = require('../models');
const Op = db.Sequelize.Op;

module.exports = function (passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'username' }, async (username, password, done) => {
      try {
        let user = await db.User.findOne({
          where: {
            [Op.or]: [
              {
                email: username,
              },
              {
                username: username,
              },
            ],
          },
        });

        if (!user) {
          let targetGroupUser = await db.TargetGroup.findOne({
            where: {
              username: username,
            },
          });

          if (!targetGroupUser) {
            return done(null, false, { message: 'Invalid Credential' });
          }

          const isMatch = await bcrypt.compare(password, targetGroupUser.password);

          if (isMatch) {
            return done(null, targetGroupUser);
          } else {
            return done(null, false, { message: 'Password incorrect' });
          }
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, { message: 'Password incorrect' });
        }
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    db.User.findOne({ where: { id: id } })
      .then((user) => {
        if (user) {
          done(null, user);
        } else {
          db.TargetGroup.findOne({ where: { id: id } })
            .then((targetGroupUser) => {
              done(null, targetGroupUser);
            })
            .catch((error) => {
              done(error);
            });
        }
      })
      .catch((error) => {
        done(error);
      });
  });
};