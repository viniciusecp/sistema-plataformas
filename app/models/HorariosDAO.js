var ObjectID = require('mongodb').ObjectId;

function HorariosDAO(connection) {
    this._connection = connection;
}

HorariosDAO.prototype.get10UltimosHorarios = function(callback) {
    var dados = {
        operacao: "get10UltimosHorarios",
        documento: {},
        collection: "horarios",
        callback: callback,
        options: { 'limit' : 10, 'sort' : [['_id', -1]] }
    };
    this._connection(dados);
};

HorariosDAO.prototype.insertHorario = function(dadosForm, callback) {
    var dados = {
        operacao: "inserir",
        documento: dadosForm,
        collection: "horarios",
        callback: callback
    };
    this._connection(dados);
};

HorariosDAO.prototype.getPesquisa = function(dadosForm, callback) {

    var dados = {
        operacao: "consultar",
        documento: {
            horario: {$gt: dadosForm.intervaloInferior, $lt: dadosForm.intervaloSuperior}
        },
        collection: "horarios",
        callback: callback
    };
    this._connection(dados);
};

HorariosDAO.prototype.getPesquisaInserção = function(dadosForm, callback) {

    var dados = {
        operacao: "consultar",
        documento: {
            plataforma: dadosForm.plataforma,
            horario: {$gt: dadosForm.intervaloInferior, $lt: dadosForm.intervaloSuperior}
        },
        collection: "horarios",
        callback: callback
    };
    this._connection(dados);
};

HorariosDAO.prototype.getPesquisaInserçãoMultipla = function(dadosForm, callback) {

    var arrayQuery = [];
    for(var i = 0; i < dadosForm.qnt_insercoes; i++){
        var json = {
            horario: {$gt: dadosForm.intervaloInferior[i], $lt: dadosForm.intervaloSuperior[i]},
            plataforma: dadosForm.plataforma
        };
        arrayQuery.push(json);
    }

    var dados = {
        operacao: "consultar",
        documento: {
            $or: arrayQuery
        },
        collection: "horarios",
        callback: callback
    };
    this._connection(dados);
};

HorariosDAO.prototype.deleteHorario = function(_id, callback){
    var dados = {
        operacao: "deletar",
        documento: { _id: ObjectID(_id) },
        collection: "horarios",
        callback: callback
    };
    this._connection(dados);
};

module.exports = function() {
    return HorariosDAO;
};
