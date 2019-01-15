var dateFormat = require('dateformat');

module.exports.index = function(application, req, res){

    var usuarioAutenticado = false;
    if(req.session.autorizado === true) { usuarioAutenticado = true; }

    var msg = '';
    if (req.query.msg) { msg = req.query.msg; }

    var connection = application.config.dbConnection;
    var HorariosDAO = new application.app.models.HorariosDAO(connection);

    var callback = function(err, result) {
        result.toArray( function(errArray, resultArray){

            for (var i = 0; i < resultArray.length; i++){
                resultArray[i].horario = dateFormat(resultArray[i].horario, "dd/mm/yyyy, HH:MM");
            }

            res.render("index", {
                horarios: resultArray,
                usuarioAutenticado: usuarioAutenticado,
                nome_completo: req.session.nome_completo,
                msg: msg
            });
        });
    }
    HorariosDAO.get10UltimosHorarios(callback);
}

module.exports.calendar = function(application, req, res){

    var connection = application.config.dbConnection;
    var HorariosDAO = new application.app.models.HorariosDAO(connection);

    var intervaloInferior = new Date();   // busca a partir do dia atual
    intervaloInferior.setHours(0,0,0,0);
    var intervaloSuperior = new Date(new Date().setDate(new Date().getDate() + 2));
    var dados = { intervaloSuperior: intervaloSuperior, intervaloInferior: intervaloInferior};

    var callback = function(err, result) {
        result.toArray( function(errArray, resultArray){

            if (errArray) {
                res.json({'status' : 'erro'});
            } else {
                res.json({ horarios: resultArray});
            }

        });
    }
    HorariosDAO.getHorariosCalendar(dados, callback);
}

module.exports.horario_pesquisar = function(application, req, res){
    var dadosForm = req.body;

    req.assert('horario', 'Horário é obrigatório').notEmpty();

    var erros = req.validationErrors();
    if(erros){
        res.send('error');
        return;
    }

    dadosForm.horario = new Date(formatarData(dadosForm.horario));

    var intervaloSuperior = new Date(dadosForm.horario.getTime()+1800000); // verificar 30 minutos antes e depois
    var intervaloInferior = new Date(dadosForm.horario.getTime()-1800000);

    dadosForm.intervaloSuperior = intervaloSuperior;
    dadosForm.intervaloInferior = intervaloInferior;

    var connection = application.config.dbConnection;
    var HorariosDAO = new application.app.models.HorariosDAO(connection);
    var PlataformasDAO = new application.app.models.PlataformasDAO(connection);

    var callbackHorarios = function(errHorarios, resultHorarios) {
        resultHorarios.toArray( function(errArrayHorarios, resultArrayHorarios){

            var plataformasOcupadas = getPlataformas(resultArrayHorarios);

            var callbackPlataformas = function(errPlataformas, resultPlataformas){
                resultPlataformas.toArray( function (errArrayPlataformas, resultArrayPlataformas) {

                    var todasPlataformas = getPlataformas(resultArrayPlataformas);

                    var plataformasLivres = getPlataformasLivres(todasPlataformas, plataformasOcupadas);

                    // ordenar vetor para melhor apresentação na tela
                    plataformasLivres.sort(function(a,b) { return a - b; });

                    res.send({ horarios: resultArrayHorarios, plataformasLivres: plataformasLivres});
                });
            };
            PlataformasDAO.getPlataformas(callbackPlataformas);

        });
    };
    HorariosDAO.getPesquisa(dadosForm, callbackHorarios);
}

module.exports.autenticar = function(application, req, res){
    var dadosForm = req.body;

    req.assert('usuario', 'Usuário não pode ser vazio').notEmpty();
    req.assert('senha', 'Senha não pode ser vazio').notEmpty();

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
                req.session.autorizado = true;

                req.session.empresa = resultArray[0].empresa;
                req.session.tipo_usuario = resultArray[0].tipo_usuario;
                req.session.nome_completo = resultArray[0].nome_completo;
                req.session.usuario = resultArray[0].usuario;
            }

            if(req.session.autorizado){
                res.json({ 'status' : 'Usuario autenticado com sucesso', nome_completo: req.session.nome_completo });
            } else {
                res.json({ 'status' : 'Usuario ou senha incorretos' });
            }
        });
    }
    UsuariosDAO.autenticar(dadosForm, callback);
}

module.exports.sair = function(application, req, res){
    req.session.destroy( function(err){
        res.redirect('/');
    });
}

function getPlataformas(json){
    var plataformasOcupadasAux = [];
    for(var i = 0; i < json.length; i++){
        plataformasOcupadasAux.push(json[i].plataforma);
    }
    var plataformasOcupadas = plataformasOcupadasAux.filter( function(i, j) {
        return plataformasOcupadasAux.indexOf(i) == j;
    });
    return plataformasOcupadas;
}

function getPlataformasLivres(todasPlataformas, plataformasOcupadas){
    // ordenar para indeces ficarem nos seus lugares "corretos"
    plataformasOcupadas.sort(function(a,b) { return a - b; });

    var indexPlataformasOcupadas = [];
    for(var i = 0; i < plataformasOcupadas.length; i++){
        for (var j = 0; j < todasPlataformas.length; j++) {
            if (plataformasOcupadas[i] == todasPlataformas[j]) {
                indexPlataformasOcupadas.push(j);
            }
        }
    }
    for (var i = indexPlataformasOcupadas.length; i > 0; i--) {
        todasPlataformas.splice(indexPlataformasOcupadas[i - 1], 1);
    }
    return todasPlataformas;
}

function formatarData(datetime){
    // por no formato yyyy/mm/dd HH:mm
    var dia = datetime.split('/')[0];
    var mes = datetime.split('/')[1];
    var ano = datetime.split('/')[2].split(' ')[0];
    var horario = datetime.split(' ')[1];
    return (ano + '-' + mes + '-' + dia + ' ' + horario);
}
