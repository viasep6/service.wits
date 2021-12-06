const { db } = require('../service.shared/Repository/Firebase/admin')


exports.postWit = (request, response) => {
    // TODO: validate input

    if (request.body.text.trim() === '') {
		return response.status(400).JSON.stringify({ body: 'Must not be empty' });
    }
    
    const newItem = {
        created: new Date().toISOString(),
        created_by: request.user.idtoken,
        text: request.body.text, // max 300
        movieTags: request.body.movieTags, // movieid
        userTags: request.body.userTags, // userid
        roars: [] // userid

    }

    return db
        .collection('wits')
        .add(newItem)
        .then((doc)=>{
            const responseItem = newItem;
            responseItem.id = doc.id;
            response.res = {
                // return: 200, /* Default is 200 */
                body: JSON.stringify(responseItem)
            };
        })
        .catch((err) => {
			response.status(500).JSON.stringify({ error: 'Something went wrong' });
			console.error(err);
		});
}

