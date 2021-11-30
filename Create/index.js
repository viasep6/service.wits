const wits = require('./create')
const auth = require('../service.shared/Repository/Firebase/auth')


module.exports = async function (context, req) {
    await auth(req, context, wits.postWit)
}