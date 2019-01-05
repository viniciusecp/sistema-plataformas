module.exports = function(application) {
    application.get('/form_add_plataforma', function(req, res){
        application.app.controllers.admin.plataforma.formulario_adicionar_plataforma(application, req, res);
    });

    application.post('/plataforma/salvar', function(req, res){
        application.app.controllers.admin.plataforma.plataforma_salvar(application, req, res);
    });

    application.get('/plataformas', function(req, res){
        application.app.controllers.admin.plataforma.getPlataformas(application, req, res);
    });

    application.post('/plataforma/deletar', function(req, res){
        application.app.controllers.admin.plataforma.plataforma_deletar(application, req, res);
    });
}
