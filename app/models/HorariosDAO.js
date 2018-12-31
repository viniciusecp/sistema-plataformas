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
            //plataforma: dadosForm.plataforma,
            horario: {$gt: dadosForm.intervaloInferior, $lt: dadosForm.intervaloSuperior}
        },
        collection: "horarios",
        callback: callback
    };
    this._connection(dados);
};

module.exports = function() {
    return HorariosDAO;
};
