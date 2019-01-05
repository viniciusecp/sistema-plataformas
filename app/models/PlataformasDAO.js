var ObjectID = require('mongodb').ObjectId;

function PlataformasDAO(connection) {
    this._connection = connection;
}

PlataformasDAO.prototype.getPlataformas = function(callback) {
    var dados = {
        operacao: "consultar",
        documento: {},
        collection: "plataformas",
        callback: callback
    };
    this._connection(dados);
};

PlataformasDAO.prototype.inserirPlataforma = function(plataforma, callback) {
    var dados = {
        operacao: "inserir",
        documento: plataforma,
        collection: "plataformas",
        callback: callback
    };
    this._connection(dados);
};

PlataformasDAO.prototype.deletePlataforma = function(_id, callback){
    var dados = {
        operacao: "deletar",
        documento: { _id: ObjectID(_id) },
        collection: "plataformas",
        callback: callback
    };
    this._connection(dados);
};

module.exports = function() {
    return PlataformasDAO;
};
