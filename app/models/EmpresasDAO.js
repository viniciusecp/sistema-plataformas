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

module.exports = function() {
    return EmpresasDAO;
};
