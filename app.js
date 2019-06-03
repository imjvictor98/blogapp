//Módulos e constantes
require('./Models/Postagem');
require('./Models/Categoria');
const express = require('express');
const handlebars = require('express-handlebars');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const admin = require('./Routes/admin');
const moment = require('moment');
const Postagem = mongoose.model('postagens');
const Categoria = mongoose.model('categorias');
const usuario = require('./Routes/usuario');
const passport = require('passport');
require('./config/auth')(passport);
const db = require('./config/db');
//Variavel de ambient do heroku
const PORT = process.env.PORT || 8081;

//Configurações
//Sessao
app.use(session({
  secret: 'cursodenode', //uma chave pra gerar uma sessao
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//Middleaware
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});
//BodyParser
app.use(bodyparser.urlencoded({
  extended: true
}));
app.use(bodyparser.json());

//Handlebars
app.engine('handlebars', handlebars({
  defaultLayout: 'main',
  helpers: {
      formatDate: (date) => {
          return moment(date).format('DD/MM/YYYY');
      }
  }
})); //layouts dir para dizer onde estao as paginas ded layout
app.set('view engine', 'handlebars'); //motor do template: handlebars
//se você estiver usando ejs, por exemplo, essa única linha será suficiente
//(embora você geralmente também tenha uma segunda chamada para app.set que define o
//diretório onde procurar por arquivos de visualização)
//Public

app.use(express.static(path.join(__dirname + 'public')));

//Mongoose
mongoose.Promise = global.Promise;
mongoose.connect(db.mongoURI, {useNewUrlParser: true}).then((result) => {
  console.log(`Conectado ao mongo!`);
}).catch((err) => {
  console.log(`Erro ao se conectar + ${err}!`);
});

//Rotas
app.use('/admin', admin);
app.use('/usuarios', usuario);

//Homepage
app.get('/', (req, res) => {
    Postagem.find().populate('categoria').sort({data: 'desc'}).then((postagens) => {
        res.render('index', {postagens: postagens});
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro interno');
        res.redirect('/404');
    });
});

//Error 404
app.get('/404', (req, res) => {
    res.send('ERRO 404');
});

//Redirecionar o 'leia mais' de cada postagem
app.get('/postagem/:slug', (req, res) => {
    Postagem.findOne({slug: req.params.slug}).then((postagem) => {
        if(postagem){
            res.render('postagem/index', {postagem: postagem});
        }else{
            req.flash('error_msg', 'Esta postagem nao existe');
            res.redirect('/');
        }
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro interno');
        res.redirect('/');
    });
});

//Categorias
app.get('/categorias', (req, res) => {
    Categoria.find().then((categorias) => {
        res.render('categorias/index', {categorias: categorias});
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro interno');
        res.redirect('/');
    });

});

//Listar todos os posts relacionado a determinada categoria de acordo com seu slug
app.get('/categorias/:slug', (req, res) => {
    Categoria.findOne({slug: req.params.slug}).then((categoria) => {
        if(categoria){
            Postagem.find({categoria: categoria._id}).then((postagens) => {
              res.render('categorias/postagens.handlebars', {postagens: postagens, categoria: categoria});
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro ao listar as postagens');
                res.redirect('/categorias');
            });
          }else{
              req.flash('error_msg', 'Esta categoria nao existe');
              res.redirect('/categorias');
          }
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao carregar a pagina desta categoria');
        res.redirect('/categorias');
    });
});
//Outros
app.listen(PORT, () => {
  console.log('Servidor local rodando na porta:' + PORT);
});
