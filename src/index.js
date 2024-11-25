const express = require('express');
const morgan = require('morgan');
const path = require('path');
const { create } = require('express-handlebars');
const session = require('express-session');
const validator = require('express-validator');
const passport = require('passport');
const flash = require('connect-flash');
const MySQLStore = require('express-mysql-session')(session);
const bodyParser = require('body-parser');

const { database } = require('./keys');

//Initializations
const app = express();
require('./lib/passport');

//Settings
app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));
const exphbs = create({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    partialsDir: path.join(__dirname, 'views', 'partials'),
    extname: '.hbs',
    helpers: require('./lib/handlebars')
  });

app.engine('.hbs', exphbs.engine); 
app.set('view engine', '.hbs');

//Middlewares
app.use(flash());
app.use(morgan('dev'));
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use(session({
    secret: 'ian',
    resave: false,
    saveUninitialized: false,
    store: new MySQLStore(database)
  }));
app.use(passport.initialize());
app.use(passport.session());

//Global variables
app.use((req, res, next) => {
    app.locals.message = req.flash('message');
    app.locals.success = req.flash('success');
    app.locals.user = req.user;
    next();
  });
  

//Routes 
app.use(require('./routes/index'));
app.use(require('./routes/authentication'));

 
 
//Public
app.use(express.static(path.join(__dirname,'public')));

//Starting server 
app.listen(app.get('port'), () => {
    console.log('Server on port', app.get('port'));
})