var dateFormat = require('dateformat');
var moment = require('moment');

module.exports.index = function(application, req, res){

    var connection = application.config.dbConnection;
    var HorariosDAO = new application.app.models.HorariosDAO(connection);
    var PlataformasDAO = new application.app.models.PlataformasDAO(connection);

    var callback = function(err, result) {
        result.toArray( function(errArray, resultArray){

            for (var i = 0; i < resultArray.length; i++){
                resultArray[i].horario = dateFormat(resultArray[i].horario, "dd/mm/yyyy, hh:MM");
            }

            res.render("index", { horarios: resultArray });
        });
    }
    HorariosDAO.get10UltimosHorarios(callback);
}

module.exports.horario_pesquisar = function(application, req, res){
    var dadosForm = req.body;

    req.assert('horario', 'Horário é obrigatório').notEmpty();

    var erros = req.validationErrors();
    if(erros){
        res.send('error');
        return;
    }

    dadosForm.horario = new Date(dadosForm.horario);

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

                    var plataformasLivres = getPlataformas(resultArrayPlataformas);

                    // retirar plataformas ocupadas do array das plataformas livres
                    for(var i = 0; i < plataformasOcupadas.length; i++){
                        plataformasLivres.splice( plataformasLivres.indexOf(plataformasOcupadas[i]) , 1);
                    }

                    /*for (var i = 0; i < resultArrayHorarios.length; i++){
                        console.log(resultArrayHorarios[i].horario);
                        var m = moment(resultArrayHorarios[i].horario);
                        m.format('h:mm:ss');
                        resultArrayHorarios[i].horario = m;
                        console.log(resultArrayHorarios[i].horario);

                    }*/

                    res.send({ horarios: resultArrayHorarios, plataformasLivres: plataformasLivres});
                });
            };
            PlataformasDAO.getPlataformas(callbackPlataformas);

        });
    };
    HorariosDAO.getPesquisa(dadosForm, callbackHorarios);

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
