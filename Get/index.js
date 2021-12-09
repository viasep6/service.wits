const auth = require('../service.shared/Repository/Firebase/auth')
const wits = require('./get')


module.exports = async function (context, req) {
    console.log("TYPE: ", req.params.type);
    const param = req.params.type
    if (param === 'by_userid') {
        await wits.getByUserId(req, context)
    } else if (param === 'by_feed') {
        await auth(req, context, wits.getByFeed)
    } else if (param === 'by_movie') {
        await wits.getByMovie(req, context)
    }
    
}