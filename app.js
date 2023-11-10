const express = require('express');
const res = require('express/lib/response');
const passport = require('passport');
const session = require('express-session');
const crypto = require('crypto');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

const generateSecretKey = () => {
    return crypto.randomBytes(32).toString('hex');
};

const secretKey = generateSecretKey();

function printDiamond(height) {
    if (height % 2 === 0) {
      return "Please provide an odd height for the diamond.";
    }
  
    let alphabet = 'FORMULAQSOLUTIONS';
    let currentCharIndex = 0;
    let diamondPattern = '';
  
    // Upper half of the diamond
    for (let i = 0; i < height / 2; i++) {
      let row = '';
  
      for (let j = 0; j < height / 2 - i; j++) {
        row += ' ';
      }
  
      for (let j = 0; j < 2 * i + 1; j++) {
        row += alphabet[currentCharIndex];
        currentCharIndex = (currentCharIndex + 1) % alphabet.length;
      }
  
      diamondPattern += row + '\n';
    }
  
    // Lower half of the diamond
    for (let i = Math.floor(height / 2) - 1; i >= 0; i--) {
      let row = '';
  
      for (let j = 0; j < height / 2 - i; j++) {
        row += ' ';
      }
  
      for (let j = 0; j < 2 * i + 1; j++) {
        row += alphabet[currentCharIndex];
        currentCharIndex = (currentCharIndex + 1) % alphabet.length;
      }
  
      diamondPattern += row + '\n';
    }
    return diamondPattern;
  }
  
app.use(session({
    secret: secretKey,
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: '200406499600-rvi7kbec856rcnndvj9ibln0lgt4pu79.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: 'http://localhost:3000/auth/google/callback'
}, (accessToken, refreshToken, profile, save) => {
    return save(null, profile);
}));

passport.serializeUser((user, save) => {
    save(null, user);
});

passport.deserializeUser((obj, save) => {
    if (obj && obj.shouldClearSession) {
        req.session.destroy((err) => {
            save(err, obj);
        });
    } else {
        save(null, obj);
    }
});

app.get('/', (req, res) => {
    res.send('<a href="/auth/google">Sign In with Google</a>');
});

app.get('/auth/google',
    passport.authenticate('google', {
        scope: ['profile', 'email']
    }));

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/profile');
    });

app.get('/profile', (req, res) => {
    const user = req.user;
    const profileImage = user.photos && user.photos.length > 0 ? user.photos[0].value : null;
    const currentTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
    res.send(`
        ${profileImage ? `<img src="${profileImage}" alt="Profile Image" style="width: 100px; height: 100px;">` : ''}
        <h3>Hello ${user.displayName}
        <a href="/logout">[Sign out]</a>
        </h3>
        <h3>You are signed in with the email ${user.emails[0].value}</h3>
        <p>Current Indian Time : ${currentTime}</p>
        <hr>
        <form action="/display" method="post">
            <label for="numberOfLines">Number of Lines:</label>
            <input type="number" id="numberOfLines" name="numberOfLines" max="100" required>
            <button type="submit">Display</button>
        </form>
    `)
})

app.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});

app.use(bodyParser.urlencoded({ extended: true }));


app.post('/display', (req, res) => {
    const numberOfLines = parseInt(req.body.numberOfLines);

    if (isNaN(numberOfLines) || numberOfLines <= 0 || numberOfLines > 100) {
        res.send('Please provide a valid number of lines.');
    } else {
        const diamondPattern = printDiamond(numberOfLines);
        res.send(`<pre>${diamondPattern}</pre>`);
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});