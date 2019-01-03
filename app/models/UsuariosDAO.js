var crypto = require('crypto');

function UsuariosDAO(connection) {
    this._connection = connection;
}

UsuariosDAO.prototype.pesquisarExistente = function(usuario, callback) {
    var senha_criptografada = crypto.createHash("md5").update(usuario.senha).digest("hex");
    usuario.senha = senha_criptografada;

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

UsuariosDAO.prototype.autenticar = function(usuario, req, res) {
    var senha_criptografada = crypto.createHash("md5").update(usuario.senha).digest("hex");
    usuario.senha = senha_criptografada;

    var dados = {
        operacao: "consultar",
        documento: usuario,
        collection: "usuarios",
        callback: function(err, result) {
            result.toArray( function(errArray, resultArray){
                if(resultArray[0] != undefined){
                    req.session.autorizado = true;

                    req.session.usuario = resultArray[0].usuario;
                    req.session.casa = resultArray[0].casa;
                }

                if(req.session.autorizado){
                    res.redirect("jogo");
                } else {
                    res.render("index", {
                        validacao : [
                            {msg: 'Usuário ou senha inválidos'}
                        ],
                        dadosForm : {}
                    });
                }
            });
        }
    };
    this._connection(dados);
};

module.exports = function() {
    return UsuariosDAO;
};
