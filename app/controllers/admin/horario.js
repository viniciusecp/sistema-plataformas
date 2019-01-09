var ObjectID = require('mongodb').ObjectId;
var dateFormat = require('dateformat');

module.exports.formulario_adicionar_horario = function(application, req, res){
    if (req.session.autorizado !== true) { res.redirect("/index?msg=Usuário precisa estar conectado para acessar essa área!");  return; }

    var dados_pag_pesquisa = req.query;

    var msg = '';
    if(req.query.msg != '') msg = req.query.msg;

    var connection = application.config.dbConnection;
    var PlataformasDAO = new application.app.models.PlataformasDAO(connection);
    var EmpresasDAO = new application.app.models.EmpresasDAO(connection);

    var callbackPlataformas = function(errPlataformas, resultPlataformas){
        resultPlataformas.toArray( function(errArrayPlataformas, resultArrayPlataformas){

            if (req.session.tipo_usuario === 'administrador') {

                var callbackEmpresas = function(errEmpresas, resultEmpresas){
                    resultEmpresas.toArray( function(errArrayEmpresas, resultArrayEmpresas){
                        res.render("admin/horario/form_add_horario", {
                            empresas: resultArrayEmpresas,
                            empresa_usuario: req.session.empresa,
                            plataformas: resultArrayPlataformas,
                            msg: msg,
                            dados_pag_pesquisa: dados_pag_pesquisa
                        });
                    });
                };
                EmpresasDAO.getEmpresas(callbackEmpresas);

            } else {
                var empresas = Array( { nome: req.session.empresa} );
                res.render("admin/horario/form_add_horario", {
                    empresas: empresas,
                    empresa_usuario: req.session.empresa,
                    plataformas: resultArrayPlataformas,
                    msg: msg,
                    dados_pag_pesquisa: dados_pag_pesquisa
                });
            }
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
        res.json({'status': 'Erro de validacao', erros: erros});
        return;
    }

    dadosForm.horario = new Date(dadosForm.horario);
    dadosForm.usuario_criacao = req.session.usuario;

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
                salvar_documento(dadosForm, res, HorariosDAO, application);
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

function salvar_documento(dadosForm, res, HorariosDAO, application){
    var docs = [];

    var callback = function(err, result) {
        if(err){
            res.json({'status' : 'erro'});
        } else {
            res.json({'status' : 'Inclusão realizada com sucesso'});
        }
    };

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

        // Gerar documento referente a esta inserção em lote e capturar o id
        var connection = application.config.dbConnection;
        var HorariosLoteDAO = new application.app.models.HorariosLoteDAO(connection);

        var dadosInsercaoLote = JSON.parse(JSON.stringify(docs[0]));
        delete dadosInsercaoLote['horario'];
        dadosInsercaoLote.horario_inicio = docs[0].horario;
        dadosInsercaoLote.horario_final = docs[docs.length-1].horario;
        dadosInsercaoLote = Array(dadosInsercaoLote);

        var callbackHorariosLote = function(err, result){
            if (err) {
                console.log(err);
                res.json({'status' : 'erro'});
                return;
            } else {
                var id_lote = result.ops[0]._id;
                for (var i = 0; i < qnt_insercoes; i++) {
                    docs[i].id_lote = ObjectID(id_lote);
                }

                // Então inserir com o id do lote em cada documento de docs
                HorariosDAO.insertHorario(docs, callback);
            }
        }
        HorariosLoteDAO.insertHorarioLote(dadosInsercaoLote, callbackHorariosLote);

    } else {
        delete dadosForm['qnt_insercoes'];
        docs.push(dadosForm);
        HorariosDAO.insertHorario(docs, callback);
    }
}

module.exports.horario_deletar = function(application, req, res){
    if (req.session.autorizado !== true) { res.json({'status': 'Usuário precisa estar conectado para acessar essa área!'}); return; }

    var _id = req.body._id;
    var usuario_criador = req.body.criador;

    if (req.session.tipo_usuario == 'comum' && req.session.usuario != usuario_criador) {
        res.json({'status' : 'So usuario administrador ou criador'});
        return;
    }

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

// ################################################################ HORÁRIOS LOTE

module.exports.getHorariosLote = function(application, req, res){
    if (req.session.autorizado !== true) { res.redirect("/index?msg=Usuário precisa estar conectado para acessar essa área!");  return; }

    var connection = application.config.dbConnection;
    var HorariosLoteDAO = new application.app.models.HorariosLoteDAO(connection);

    var callback = function(err, result) {
        result.toArray( function(errArray, resultArray){

            for (var i = 0; i < resultArray.length; i++){
                resultArray[i].horario_inicio = dateFormat(resultArray[i].horario_inicio, "dd/mm/yyyy, HH:MM");
                resultArray[i].horario_final = dateFormat(resultArray[i].horario_final, "dd/mm/yyyy, HH:MM");
            }

            res.render("admin/horario/horarios_lote", { horarios_lote: resultArray });
        });
    };
    HorariosLoteDAO.getHorariosLote(callback);
}

module.exports.horario_lote_deletar = function(application, req, res){
    if (req.session.autorizado !== true) { res.json({'status': 'Usuário precisa estar conectado para acessar essa área!'}); return; }

    var _id = req.body._id;
    var usuario_criador = req.body.criador;

    if (req.session.tipo_usuario == 'comum' && req.session.usuario != usuario_criador) {
        res.json({'status' : 'So usuario administrador ou criador'});
        return;
    }

    var connection = application.config.dbConnection;
    var HorariosDAO = new application.app.models.HorariosDAO(connection);
    var HorariosLoteDAO = new application.app.models.HorariosLoteDAO(connection);

    var callback = function(err, result) {
        if(err){
            console.log(err);
            res.json({'status' : 'erro'});
        } else {

            var callbackHorariosLote = function(errHorariosLote, resultHorariosLote){
                if (err) {
                    console.log(err);
                    res.json({'status' : 'erro'});
                } else {
                    res.json({'status' : 'Deletado com sucesso'});
                }
            };
            HorariosLoteDAO.deleteHorarioLote(_id, callbackHorariosLote);
        }
    };
    // neste momento _id está representa o id do lote de cada registro de horario salvo
    HorariosDAO.deleteHorariosLote(_id, callback);
}
