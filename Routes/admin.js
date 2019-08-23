//Módulos e constantes
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../Models/Categoria');
const Categoria = mongoose.model('categorias');
require('../Models/Postagem');
const Postagem = mongoose.model('postagens');
const {isAdmin} = require('../helpers/isAdmin');
//Rotas

/*                                               PRINCIPAL                                               */


//Principal
router.get('/', isAdmin, (req, res) => {
    res.render('admin/index');
});

//Posts
router.get('/posts', isAdmin,(req, res) => {
    res.send('Pagina de posts');
});

/*                                               CATEGORIAS                                               */


//Listagem de categorias
router.get('/categorias', isAdmin, (req, res) => {
    Categoria.find().then((categorias) => {
        res.render('admin/categorias', {categorias: categorias});
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao listar as categorias');
        res.redirect('/admin');
    });
});

//Adcionar categorias
router.get('/categorias/add', isAdmin, (req, res) => {
    res.render('admin/addcategorias');
});

router.post('/categorias/nova', isAdmin, (req, res) => {

    var erros = [];

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: 'Nome invalido'});
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: 'Slug invalido'});
    }

    if(erros.length > 0){
        res.render('admin/addcategorias', {erros: erros})
    }else{
        new Categoria({
            nome: req.body.nome,
            slug: req.body.slug,
        }).save().then(() => {
            req.flash('success_msg', 'Categoria criada com sucesso!');
            res.redirect('/admin/categorias');
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao salvar a categoria!');
            res.redirect('/admin');
        });
    }
});

//Redireciona a categoria de acordo com seu id no mongoDB
router.get('/categorias/edit/:id', isAdmin,  (req, res) => {
    Categoria.findOne({_id:req.params.id}).then((categoria) => {
        res.render('admin/editcategorias', {categoria: categoria})
    }).catch((err) => {
        req.flash('error_msg', 'Esta categoria nao existe');
        res.redirect('/admin/categorias');
    });

});

//Editar categoria
router.post('/categorias/edit',  isAdmin, (req, res) => {
    Categoria.findOne({_id: req.body.id}).then((categoria) => {
        categoria.nome = req.body.nome;
        categoria.slug = req.body.slug;

        categoria.save().then((result) => {
            req.flash('success_msg', 'Categoria editada com sucesso!');
            res.redirect('/admin/categorias');
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao editar a categoria!');
            res.redirect('/admin/categorias');
        });
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao editar a categoria');
        res.redirect('/admin/categorias');
    });
});

//Deletar categoria
router.post('/categorias/deletar',  isAdmin, (req, res) => {
    Categoria.deleteOne({_id: req.body.id}).then(() => {
        req.flash('success_msg', 'Categoria deletada com sucesso!');
        res.redirect('/admin/categorias');
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao deletar a categoria ' + err);
        res.redirect('/admin/categorias');

    });
});

/*                                               POSTAGEM                                               */


//Direciona para a rota de postagens
router.get('/postagens', isAdmin,  (req, res) => {
    Postagem.find().populate('categoria').sort({data: 'desc'}).then((postagens) => {
        res.render('admin/postagens', {postagens: postagens});
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao listar as postagens');
        res.redirect('/admin');
    });

});

//Redirecionar para a pagina de adcionar postagens
router.get('/postagens/add', isAdmin,  (req, res) => {
    Categoria.find().then((categorias) => {
        res.render('admin/addpostagem', {categorias: categorias});
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao carregar o formulario!');
        res.redirect('/admin');
    });

});

//Adcionar postagem
router.post('/postagens/nova',  isAdmin, (req, res) => {
    var erros = [];

    if(req.body.categoria == 0 )
    erros.push({texto: 'Categoria invalida, registre uma categoria'})

    if(erros.length > 0){
        res.render('admin/addpostagem',{erros: erros});
    }else{
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        };

        new Postagem(novaPostagem).save().then(() => {
            req.flash('success_msg', 'Postagem criada com sucesso');
            res.redirect('/admin/postagens');
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro durante o salvamento da postagem');
            res.redirect('/admin/postagens');
        });
    }
});

//Redireciona a postagem de acordo com seu id(postagem) no mongoDB
router.get('/postagens/edit:id', isAdmin, (req, res) => {
    Postagem.findOne({_id: req.params.id}).then((postagem) => {
        Categoria.find().then((categorias) => {
            res.render('admin/editpostagens', {categorias: categorias, postagem: postagem});
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao listar as categorias OBS: CATEGORIA-EDICAO');
            res.redirect('/admin/postagens');
        });
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao carregar o formulario de edicao OBS: POSTAGEM-EDICAO');
        res.redirect('/admin/postagens');
    });
});

//Editar postagem
router.post('/postagens/edit',  isAdmin, (req, res) => {
    Postagem.findOne({_id: req.body.id}).then((postagem) => {
        postagem.titulo = req.body.titulo,
        postagem.slug = req.body.slug,
        postagem.descricao = req.body.descricao,
        postagem.conteudo = req.body.conteudo,
        postagem.categoria = req.body.categoria

        postagem.save().then(() => {
            req.flash('success_msg', 'Postagem editada com sucesso!');
            res.redirect('/admin/postagens');
        }).catch((err) => {
            req.flash('error_msg', 'Erro interno');
            res.redirect('/admin/postagens');
        });

    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao salvar a edicao');
        res.redirect('/admin/postagens');
    });
});

//Deletar postagem
router.get('/postagens/deletar/:id', isAdmin,  (req, res) => {
    Postagem.remove({_id: req.params.id}).then(() => {
        req.flash('success_msg', 'Postagem deletada com sucesso!');
        res.redirect('/admin/postagens');
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro interno');
        res.redirect('/admin/postagens');
    });
});


//Export
module.exports = router;
