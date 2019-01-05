module.exports.formulario_adicionar_usuario = function(application, req, res){
    if (req.session.autorizado !== true) { res.redirect("/index?msg=Usuário precisa estar conectado para acessar essa área!");  return; }

    if (req.session.tipo_usuario !== 'administrador') { res.redirect("/index?msg=Usuário precisa ser administrador para acessar essa área!");  return; }

    var connection = application.config.dbConnection;
    var EmpresasDAO = new application.app.models.EmpresasDAO(connection);

    var callback = function(err, result) {
        result.toArray( function(errArray, resultArray){
            res.render("admin/usuario/form_add_usuario", { empresas: resultArray });
        });
    };
    EmpresasDAO.getEmpresas(callback);
}

module.exports.usuario_salvar = function(application, req, res){
    if (req.session.autorizado !== true) { res.json({'status': 'Usuário precisa estar conectado para acessar essa área!'}); return; }

    if (req.session.tipo_usuario !== 'administrador') { res.redirect("/index?msg=Usuário precisa ser administrador para acessar essa área!");  return; }

    var dadosForm = req.body;

    req.assert('empresa', 'Empresa é obrigatório').notEmpty();
    req.assert('nome_completo', 'Nome completo é obrigatório').notEmpty();
    req.assert('usuario', 'Usuário é obrigatório').notEmpty();
    req.assert('senha', 'Senha é obrigatório').notEmpty();
    // tipo sempre estará selecionado por ser type radio, o primeiro já vem selecioando

    var erros = req.validationErrors();
    if(erros){
        res.json({'status' : 'Erro de validacao', erros: erros});
        return;
    }

    var connection = application.config.dbConnection;
    var UsuariosDAO = new application.app.models.UsuariosDAO(connection);

    var callback = function(err, result) {
        result.toArray( function(errArray, resultArray){

            if(resultArray[0] != undefined){
                res.json({'status' : 'Usuario ja cadastrado'});
                return;
            }

            var callbackInserir = function(errInserir, resultInserir) {
                if(errInserir){
                    console.log(errInserir);
                    res.json({'status' : 'erro'});
                } else {
                    res.json({'status' : 'Inclusão realizada com sucesso'});
                }
            }
            var usuario = Array( dadosForm );
            UsuariosDAO.inserirUsuario(usuario, callbackInserir);
        });
    };
    UsuariosDAO.pesquisarExistente( dadosForm, callback );
}

module.exports.getUsuarios = function(application, req, res){
    if (req.session.autorizado !== true) { res.redirect("/index?msg=Usuário precisa estar conectado para acessar essa área!");  return; }

    if (req.session.tipo_usuario !== 'administrador') { res.redirect("/index?msg=Usuário precisa ser administrador para acessar essa área!");  return; }

    var connection = application.config.dbConnection;
    var UsuariosDAO = new application.app.models.UsuariosDAO(connection);

    var callback = function(err, result) {
        result.toArray( function(errArray, resultArray){
            res.render("admin/usuario/usuarios", { usuarios: resultArray });
        });
    };
    UsuariosDAO.getUsuarios(callback);
}

module.exports.usuario_deletar = function(application, req, res){
    if (req.session.autorizado !== true) { res.json({'status': 'Usuário precisa estar conectado para acessar essa área!'}); return; }

    if (req.session.tipo_usuario !== 'administrador') { res.redirect("/index?msg=Usuário precisa ser administrador para acessar essa área!");  return; }

    var _id = req.body._id;

    var connection = application.config.dbConnection;
    var UsuariosDAO = new application.app.models.UsuariosDAO(connection);

    var callback = function(err, result) {
        if(err){
            console.log(err);
            res.json({'status' : 'erro'});
        } else {
            res.json({'status' : 'Deletado com sucesso'});
        }
    };
    UsuariosDAO.deleteUsuario(_id, callback);
}
