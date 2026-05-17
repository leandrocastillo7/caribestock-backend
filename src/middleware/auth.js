module.exports = (req, res, next) => {
  console.log('Middleware de autenticación ejecutado');
  next();
};