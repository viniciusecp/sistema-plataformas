module.exports = function(application) {
    application.get('/', function(req, res){
        application.app.controllers.index.index(application, req, res);
    });

    application.post('/horario/pesquisar', function(req, res){
        application.app.controllers.index.horario_pesquisar(application, req, res);
    });
}
