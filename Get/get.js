const { db } = require('../service.shared/Repository/Firebase/admin')

exports.getAllWits = (request, response) => {
    
    return db
    .collection('wits')
    .orderBy('createdAt', 'desc')
    .get()
    .then((data) => {
        let wits = [];
        data.forEach((doc) => {
            wits.push({
                witId: doc.id,
                title: doc.data().title,
                body: doc.data().body,
                createdAt: doc.data().createdAt,
            });
        });
        response.res = {
            // status: 200, /* Defaults to 200 */
            body: JSON.stringify(wits)
        };
        
    })
    .catch((err) => {
        console.error(err);
        response.status(500).JSON.stringify({ error: err.code});
    });

}


exports.getByUserId = (request, response) => {
    const userId = request.query.userId;

    return db
    .collection('wits')
    .where('created_by', '==', userId)
    .orderBy('created', 'desc')
    .get()
    .then( (querySnapshot) => {

        return response.res.json(JSON.stringify(querySnapshot.docs.map(doc => {
            let wit = doc.data()
            console.log(wit);
            wit.movieTags.forEach(e => {
                wit.movieTags.push(e.get())
            })
            return wit
        })))
    })
    .catch((err) => {
        console.error(err);
        return response.status(500).JSON.stringify({ error: err.code});
    });

}