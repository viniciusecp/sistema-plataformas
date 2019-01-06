var ObjectID = require('mongodb').ObjectId;

function HorariosDAO(connection) {
    this._connection = connection;
}

HorariosDAO.prototype.getHorariosLote = function(callback) {
    var dados = {
        operacao: "consultar",
        documento: {},
        collection: "horarios_lote",
        callback: callback
    };
    this._connection(dados);
};

HorariosDAO.prototype.insertHorarioLote = function(dadosForm, callback) {
    var dados = {
        operacao: "inserir",
        documento: dadosForm,
        collection: "horarios_lote",
        callback: callback
    };
    this._connection(dados);
};


HorariosDAO.prototype.deleteHorarioLote = function(_id, callback){
    var dados = {
        operacao: "deletar",
        documento: { _id: ObjectID(_id) },
        collection: "horarios_lote",
        callback: callback
    };
    this._connection(dados);
};

module.exports = function() {
    return HorariosDAO;
};
