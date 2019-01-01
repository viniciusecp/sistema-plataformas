module.exports.formulario_adicionar_horario = function(application, req, res){

    var dados_pag_pesquisa = req.query;

    var msg = '';
    if(req.query.msg != ''){
        msg = req.query.msg;
    }

    var connection = application.config.dbConnection;
    var EmpresasDAO = new application.app.models.EmpresasDAO(connection);
    var PlataformasDAO = new application.app.models.PlataformasDAO(connection);

    var callbackEmpresas = function(errEmpresas, resultEmpresas) {
        resultEmpresas.toArray( function(errArrayEmpresas, resultArrayEmpresas){

            var callbackPlataformas = function(errPlataformas, resultPlataformas){
                resultPlataformas.toArray( function(errArrayPlataformas, resultArrayPlataformas){
                    res.render("admin/form_add_horario", { empresas: resultArrayEmpresas, plataformas: resultArrayPlataformas, msg: msg, dados_pag_pesquisa: dados_pag_pesquisa});
                });
            };
            PlataformasDAO.getPlataformas(callbackPlataformas);

        });
    };
    EmpresasDAO.getEmpresas(callbackEmpresas);
}

module.exports.horario_salvar = function(application, req, res){
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

    /*
    // Verificar se já não há salvado no horário
    var intervaloSuperior = new Date(dadosForm.horario.getTime()+1740000); // verificar 29 minutos antes e depois
    var intervaloInferior = new Date(dadosForm.horario.getTime()-1740000);

    dadosForm.intervaloSuperior = intervaloSuperior;
    dadosForm.intervaloInferior = intervaloInferior;

    var callbackPesquisa = function (err, result){
        result.toArray( function (errArray, resultArray) {
            console.log(resultArray);
            if (resultArray.length > 0) {
                console.log('este horario bate com as seguinte já cadastrados: ');
                console.log(resultArray);
            }
            res.send('asdhfasudfh');
        });
    };
    HorariosDAO.getPesquisaInserção(dadosForm, callbackPesquisa);
    console.log('passou');

    delete dadosForm['intervaloSuperior'];
    delete dadosForm['intervaloInferior'];
    */



    // Salvar documento
    var callback = function(err, result) {
        res.redirect("/");
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
