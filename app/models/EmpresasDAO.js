var ObjectID = require('mongodb').ObjectId;

function EmpresasDAO(connection) {
    this._connection = connection;
}

EmpresasDAO.prototype.getEmpresas = function(callback) {
    var dados = {
        operacao: "consultar",
        documento: {},
        collection: "empresas",
        callback: callback
    };
    this._connection(dados);
};

EmpresasDAO.prototype.inserirEmpresa = function(empresa, callback) {
    var dados = {
        operacao: "inserir",
        documento: empresa,
        collection: "empresas",
        callback: callback
    };
    this._connection(dados);
};

EmpresasDAO.prototype.deleteEmpresa = function(_id, callback){
    var dados = {
        operacao: "deletar",
        documento: { _id: ObjectID(_id) },
        collection: "empresas",
        callback: callback
    };
    this._connection(dados);
};

module.exports = function() {
    return EmpresasDAO;
};
