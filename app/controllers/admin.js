module.exports.formulario_adicionar_horario = function(application, req, res){
    if (req.session.autorizado !== true) { res.redirect("/index?msg=Usuário precisa estar conectado para acessar essa área!");  return; }

    var dados_pag_pesquisa = req.query;

    var msg = '';
    if(req.query.msg != '') msg = req.query.msg;

    var connection = application.config.dbConnection;
    var PlataformasDAO = new application.app.models.PlataformasDAO(connection);

    var callbackPlataformas = function(errPlataformas, resultPlataformas){
        resultPlataformas.toArray( function(errArrayPlataformas, resultArrayPlataformas){
            res.render("admin/form_add_horario", { empresa: req.session.empresa, plataformas: resultArrayPlataformas, msg: msg, dados_pag_pesquisa: dados_pag_pesquisa });
        });
    };
    PlataformasDAO.getPlataformas(callbackPlataformas);

}

module.exports.horario_salvar = function(application, req, res){
    if (req.session.autorizado !== true) { res.json({'status': 'Usuário precisa estar conectado para acessar essa área!'}); return; }

    var dadosForm = req.body;

    req.assert('empresa', 'Empresa é obrigatório').notEmpty();
    req.assert('rota', 'Rota é obrigatório').notEmpty();
    req.assert('tipo', 'Tipo é obrigatório').notEmpty();
    if (dadosForm.tipo == 'Normal') {
        req.assert('qnt_insercoes', 'Número de inserções é obrigatório').notEmpty();
    }
    req.assert('horario', 'Horário é obrigatório').notEmpty();
    req.assert('plataforma', 'Plataforma é obrigatório').notEmpty();

    var erros = req.validationErrors();
    if(erros){
        res.redirect("/form_add_horario?msg=A");
        return;
    }

    dadosForm.horario = new Date(dadosForm.horario);

    var connection = application.config.dbConnection;
    var HorariosDAO = new application.app.models.HorariosDAO(connection);

    // Verificar se já não há salvado no horário
    var intervaloSuperior = new Date(dadosForm.horario.getTime()+1800000); // verificar 30 minutos antes e depois
    var intervaloInferior = new Date(dadosForm.horario.getTime()-1800000);

    dadosForm.intervaloSuperior = intervaloSuperior;
    dadosForm.intervaloInferior = intervaloInferior;

    var callbackPesquisa = function (err, result){
        result.toArray( function (errArray, resultArray) {
            if (resultArray.length > 0) {
                res.json({'status': 'Conflito de horario', 'horarios_cadastrados': resultArray});
                return;
            } else {
                delete dadosForm['intervaloSuperior'];
                delete dadosForm['intervaloInferior'];
                salvar_documento(dadosForm, res, HorariosDAO);
            }
        });
    };

    if (dadosForm.tipo == 'Normal') {
        var qnt_insercoes = dadosForm.qnt_insercoes;

        var intervaloSuperiorArray = [];
        var intervaloInferiorArray = [];

        for (var i = 0; i < qnt_insercoes; i++) {
            var dados = JSON.parse(JSON.stringify(dadosForm));
            dados.intervaloSuperior = new Date(dados.intervaloSuperior);
            dados.intervaloInferior = new Date(dados.intervaloInferior);
            intervaloSuperiorArray.push(dados.intervaloSuperior);
            intervaloInferiorArray.push(dados.intervaloInferior);

            var proxintervaloSuperior = dadosForm.intervaloSuperior.getTime()+86400000;
            var proxintervaloInferior = dadosForm.intervaloInferior.getTime()+86400000;
            var newDateSuperior = new Date(proxintervaloSuperior);
            var newDateInferior = new Date(proxintervaloInferior);
            dadosForm.intervaloSuperior = newDateSuperior;
            dadosForm.intervaloInferior = newDateInferior;
        }

        dadosForm.intervaloSuperior = intervaloSuperiorArray;
        dadosForm.intervaloInferior = intervaloInferiorArray;

        HorariosDAO.getPesquisaInserçãoMultipla(dadosForm, callbackPesquisa);
    } else {
        HorariosDAO.getPesquisaInserção(dadosForm, callbackPesquisa);
    }
}

module.exports.horario_deletar = function(application, req, res){
    if (req.session.autorizado !== true) { res.json({'status': 'Usuário precisa estar conectado para acessar essa área!'}); return; }

    var _id = req.body._id;

    var connection = application.config.dbConnection;
    var HorariosDAO = new application.app.models.HorariosDAO(connection);

    var callback = function(err, result) {
        if(err){
            console.log(err);
            res.json({'status' : 'erro'});
        } else {
            res.json({'status' : 'Deletado com sucesso'});
        }
    };
    HorariosDAO.deleteHorario(_id, callback);
}

module.exports.formulario_adicionar_usuario = function(application, req, res){
    if (req.session.autorizado !== true) { res.redirect("/index?msg=Usuário precisa estar conectado para acessar essa área!");  return; }

    var connection = application.config.dbConnection;
    var EmpresasDAO = new application.app.models.EmpresasDAO(connection);

    var callback = function(err, result) {
        result.toArray( function(errArray, resultArray){
            res.render("admin/form_add_usuario", { empresas: resultArray });
        });
    };
    EmpresasDAO.getEmpresas(callback);
}

module.exports.usuario_salvar = function(application, req, res){
    if (req.session.autorizado !== true) { res.json({'status': 'Usuário precisa estar conectado para acessar essa área!'}); return; }

    var dadosForm = req.body;

    req.assert('empresa', 'Empresa é obrigatório').notEmpty();
    req.assert('nome_completo', 'Nome completo é obrigatório').notEmpty();
    req.assert('usuario', 'Usuário é obrigatório').notEmpty();
    req.assert('senha', 'Senha é obrigatório').notEmpty();

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
            var usuario = [];if (req != true) {
        res.render("index", { msg: 'Usuário precisa estar conectado para acessar essa área!' });
    }
            usuario.push(dadosForm);
            UsuariosDAO.inserirUsuario(usuario, callbackInserir);
        });
    };
    UsuariosDAO.pesquisarExistente( dadosForm, callback );
}

function salvar_documento(dadosForm, res, HorariosDAO){
    var callback = function(err, result) {
        if(err){
            res.json({'status' : 'erro'});
        } else {
            res.json({'status' : 'Inclusão realizada com sucesso'});
        }
    };

    var docs = [];

    if (dadosForm.tipo == 'Normal') {
        var qnt_insercoes = dadosForm.qnt_insercoes;
        delete dadosForm['qnt_insercoes'];

        for (var i = 0; i < qnt_insercoes; i++) {
            var dados = JSON.parse(JSON.stringify(dadosForm));
            dados.horario = new Date(dados.horario);
            docs.push(dados);

            var proxDia = dadosForm.horario.getTime()+86400000;
            var newDate = new Date(proxDia);
            dadosForm.horario = newDate;
        }
    } else {
        delete dadosForm['qnt_insercoes'];
        docs.push(dadosForm);
    }
    HorariosDAO.insertHorario(docs, callback);
}
