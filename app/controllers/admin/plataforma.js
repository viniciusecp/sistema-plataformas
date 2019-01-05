module.exports.formulario_adicionar_plataforma = function(application, req, res){
    if (req.session.autorizado !== true) { res.redirect("/index?msg=Usuário precisa estar conectado para acessar essa área!");  return; }

    if (req.session.tipo_usuario !== 'administrador') { res.redirect("/index?msg=Usuário precisa ser administrador para acessar essa área!");  return; }

    res.render("admin/plataforma/form_add_plataforma");
}

module.exports.plataforma_salvar = function(application, req, res){
    if (req.session.autorizado !== true) { res.json({'status': 'Usuário precisa estar conectado para acessar essa área!'}); return; }

    if (req.session.tipo_usuario !== 'administrador') { res.redirect("/index?msg=Usuário precisa ser administrador para acessar essa área!");  return; }

    var dadosForm = req.body;

    req.assert('plataforma', 'Plataforma é obrigatório').notEmpty();

    var erros = req.validationErrors();
    if(erros){
        res.json({'status' : 'Erro de validacao', erros: erros});
        return;
    }

    var connection = application.config.dbConnection;
    var PlataformasDAO = new application.app.models.PlataformasDAO(connection);

    var callbackInserir = function(errInserir, resultInserir) {
        if(errInserir){
            console.log(errInserir);
            res.json({'status' : 'erro'});
        } else {
            res.json({'status' : 'Inclusão realizada com sucesso'});
        }
    }
    var plataforma = Array( dadosForm );
    PlataformasDAO.inserirPlataforma(plataforma, callbackInserir);
}

module.exports.getPlataformas = function(application, req, res){
    if (req.session.autorizado !== true) { res.redirect("/index?msg=Usuário precisa estar conectado para acessar essa área!");  return; }

    if (req.session.tipo_usuario !== 'administrador') { res.redirect("/index?msg=Usuário precisa ser administrador para acessar essa área!");  return; }

    var connection = application.config.dbConnection;
    var PlataformasDAO = new application.app.models.PlataformasDAO(connection);

    var callback = function(err, result) {
        result.toArray( function(errArray, resultArray){
            res.render("admin/plataforma/plataformas", { plataformas: resultArray });
        });
    };
    PlataformasDAO.getPlataformas(callback);
}

module.exports.plataforma_deletar = function(application, req, res){
    if (req.session.autorizado !== true) { res.json({'status': 'Usuário precisa estar conectado para acessar essa área!'}); return; }

    if (req.session.tipo_usuario !== 'administrador') { res.redirect("/index?msg=Usuário precisa ser administrador para acessar essa área!");  return; }

    var _id = req.body._id;

    var connection = application.config.dbConnection;
    var PlataformasDAO = new application.app.models.PlataformasDAO(connection);

    var callback = function(err, result) {
        if(err){
            console.log(err);
            res.json({'status' : 'erro'});
        } else {
            res.json({'status' : 'Deletado com sucesso'});
        }
    };
    PlataformasDAO.deletePlataforma(_id, callback);
}
