const wits = require('./create')
const auth = require('../service.shared/Repository/Firebase/auth')


module.exports = async function (context, req) {
    console.log("TYPE: ", req.params.type);
    console.log("query: ", req.query);
    if (req.query.roarWit){
        await auth(req, context, wits.roarWit)
    } else {
        await auth(req, context, wits.postWit)
    }
    
}