const express = require('express');
const res = require('express/lib/response');
const passport = require('passport');
const session = require('express-session');
const crypto = require('crypto');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();
const PORT = 3000;

const generateSecretKey = () => {
    return crypto.randomBytes(32).toString('hex');
};

const secretKey = generateSecretKey();

app.use(session({
    secret: secretKey, 
    esave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID:'200406499600-rvi7kbec856rcnndvj9ibln0lgt4pu79.apps.googleusercontent.com',
    clientSecret:'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',
    callbackURL:'http://localhost:3000/auth/google/callback'
},(accessToken, refreshToken, profile, save) =>{
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

app.get('/', (req,res) => {
    res.send('<a href="/auth/google">Sign In with Google</a>');
});

app.get('/auth/google', 
    passport.authenticate('google', {
        scope: ['profile', 'email']
    }));

app.get('/auth/google/callback',
    passport.authenticate('google', {failureRedirect:'/'}),
    (req, res) => {
        res.redirect('/profile');
});

app.get('/profile', (req, res) => {
    const user = req.user;
    const currentTime = new Date().toLocaleString('en-US', {timeZone: 'Asia/Kolkata'});
    res.send(`
        <h3>Hello ${user.displayName}
        <a href="/logout">[Sign out]</a>
        </h3>
        <h3>You are signed in with the email ${user.emails[0].value}</h3>
        <p>Current Indian Time : ${currentTime}</p>
    `)
})

app.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});