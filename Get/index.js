const { auth } = require('firebase-admin');
const wits = require('./get')


module.exports = async function (context, req) {

    console.log("TYPE: ", req.params.type);
    const param = req.params.type
    if (param === 'all') {
        return await wits.getAllWits(req, context)
    } else if (param === 'by_userid') {
        return await wits.getByUserId(req, context)
    }
    
}