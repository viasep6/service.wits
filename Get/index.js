const wits = require('./get')


module.exports = async function (context, req) {

    await wits.getAllWits(req, context)
}