module.exports = function(application) {
    application.get('/form_add_usuario', function(req, res){
        application.app.controllers.admin.usuario.formulario_adicionar_usuario(application, req, res);
    });

    application.post('/usuario/salvar', function(req, res){
        application.app.controllers.admin.usuario.usuario_salvar(application, req, res);
    });

    application.get('/usuarios', function(req, res){
        application.app.controllers.admin.usuario.getUsuarios(application, req, res);
    });

    application.post('/usuario/deletar', function(req, res){
        application.app.controllers.admin.usuario.usuario_deletar(application, req, res);
    });
}
