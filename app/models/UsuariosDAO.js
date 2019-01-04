var crypto = require('crypto');

function UsuariosDAO(connection) {
    this._connection = connection;
}

UsuariosDAO.prototype.pesquisarExistente = function(usuario, callback) {
    var dados = {
        operacao: "consultar",
        documento: {
            usuario: usuario.usuario
        },
        collection: "usuarios",
        callback: callback
    };
    this._connection(dados);
};

UsuariosDAO.prototype.inserirUsuario = function(usuario, callback) {
    var senha_criptografada = crypto.createHash("md5").update(usuario[0].senha).digest("hex");
    usuario[0].senha = senha_criptografada;

    var dados = {
        operacao: "inserir",
        documento: usuario,
        collection: "usuarios",
        callback: callback
    };
    this._connection(dados);
};

UsuariosDAO.prototype.autenticar = function(usuario, callback) {
    var senha_criptografada = crypto.createHash("md5").update(usuario.senha).digest("hex");
    usuario.senha = senha_criptografada;

    var dados = {
        operacao: "consultar",
        documento: usuario,
        collection: "usuarios",
        callback: callback
    };
    this._connection(dados);
};

module.exports = function() {
    return UsuariosDAO;
};
