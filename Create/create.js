const { db } = require('../service.shared/Repository/Firebase/admin')


exports.postWit = (request, response) => {
    // TODO: validate input
    console.log(request.body.title);

    if (request.body.body.trim() === '') {
		return response.status(400).JSON.stringify({ body: 'Must not be empty' });
    }
    
    if(request.body.title.trim() === '') {
        return response.status(400).JSON.stringify({ title: 'Must not be empty' });
    }
    
    const newItem = {
        title: request.body.title,
        body: request.body.body,
        createdAt: new Date().toISOString()
    }
    return db
        .collection('wits')
        .add(newItem)
        .then((doc)=>{
            const responseItem = newItem;
            responseItem.id = doc.id;
            response.res = {
                // status: 200, /* Defaults to 200 */
                body: JSON.stringify(responseItem)
            };
        })
        .catch((err) => {
			response.status(500).JSON.stringify({ error: 'Something went wrong' });
			console.error(err);
		});
}

