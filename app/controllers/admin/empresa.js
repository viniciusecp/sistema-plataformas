module.exports.formulario_adicionar_empresa = function(application, req, res){
    if (req.session.autorizado !== true) { res.redirect("/index?msg=Usuário precisa estar conectado para acessar essa área!");  return; }

    if (req.session.tipo_usuario !== 'administrador') { res.redirect("/index?msg=Usuário precisa ser administrador para acessar essa área!");  return; }

    res.render("admin/empresa/form_add_empresa");
}

module.exports.empresa_salvar = function(application, req, res){
    if (req.session.autorizado !== true) { res.json({'status': 'Usuário precisa estar conectado para acessar essa área!'}); return; }

    if (req.session.tipo_usuario !== 'administrador') { res.redirect("/index?msg=Usuário precisa ser administrador para acessar essa área!");  return; }

    var dadosForm = req.body;

    req.assert('nome', 'Nome é obrigatório').notEmpty();

    var erros = req.validationErrors();
    if(erros){
        res.json({'status' : 'Erro de validacao', erros: erros});
        return;
    }

    var connection = application.config.dbConnection;
    var EmpresasDAO = new application.app.models.EmpresasDAO(connection);

    var callbackInserir = function(errInserir, resultInserir) {
        if(errInserir){
            console.log(errInserir);
            res.json({'status' : 'erro'});
        } else {
            res.json({'status' : 'Inclusão realizada com sucesso'});
        }
    }
    var empresa = Array( dadosForm );
    EmpresasDAO.inserirEmpresa(empresa, callbackInserir);
}

module.exports.getEmpresas = function(application, req, res){
    if (req.session.autorizado !== true) { res.redirect("/index?msg=Usuário precisa estar conectado para acessar essa área!");  return; }

    if (req.session.tipo_usuario !== 'administrador') { res.redirect("/index?msg=Usuário precisa ser administrador para acessar essa área!");  return; }

    var connection = application.config.dbConnection;
    var EmpresasDAO = new application.app.models.EmpresasDAO(connection);

    var callback = function(err, result) {
        result.toArray( function(errArray, resultArray){
            res.render("admin/empresa/empresas", { empresas: resultArray });
        });
    };
    EmpresasDAO.getEmpresas(callback);
}

module.exports.empresa_deletar = function(application, req, res){
    if (req.session.autorizado !== true) { res.json({'status': 'Usuário precisa estar conectado para acessar essa área!'}); return; }

    if (req.session.tipo_usuario !== 'administrador') { res.redirect("/index?msg=Usuário precisa ser administrador para acessar essa área!");  return; }

    var _id = req.body._id;

    var connection = application.config.dbConnection;
    var EmpresasDAO = new application.app.models.EmpresasDAO(connection);

    var callback = function(err, result) {
        if(err){
            console.log(err);
            res.json({'status' : 'erro'});
        } else {
            res.json({'status' : 'Deletado com sucesso'});
        }
    };
    EmpresasDAO.deleteEmpresa(_id, callback);
}
