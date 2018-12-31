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

module.exports = function() {
    return PlataformasDAO;
};
