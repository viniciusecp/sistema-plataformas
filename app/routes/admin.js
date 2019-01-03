module.exports = function(application) {
    application.get('/form_add_horario', function(req, res){
        application.app.controllers.admin.formulario_adicionar_horario(application, req, res);
    });

    application.post('/horario/salvar', function(req, res){
        application.app.controllers.admin.horario_salvar(application, req, res);
    });

    application.post('/horario/deletar', function(req, res){
        application.app.controllers.admin.horario_deletar(application, req, res);
    });

    application.get('/form_add_usuario', function(req, res){
        application.app.controllers.admin.formulario_adicionar_usuario(application, req, res);
    });

    application.post('/usuario/salvar', function(req, res){
        application.app.controllers.admin.usuario_salvar(application, req, res);
    });
}
