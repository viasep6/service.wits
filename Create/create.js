const { db, admin } = require('../service.shared/Repository/Firebase/admin')


exports.postWit = (request, response) => {

    if (request.body.text.trim() === '') {
		return response.status(400).JSON.stringify({ body: 'Must not be empty' });
    }
    
    const newItem = {
        created: new Date().toISOString(),
        created_by: db.doc('users/' +request.user.idtoken),
        text: request.body.text, // max 300
        roars: [] // userid

    }

    if (request.body.userTags && request.body.userTags.length > 0) {
        let userTagsRef = [];
        request.body.userTags.forEach(element => {
            // { <displayName>}
            userTagsRef.push(db.collection('users').where('displayName', '===', element).limit(1).get().docs[0])
        });
        newItem.userTags = userTagsRef
    }

    if (request.body.movieTags && request.body.movieTags.length > 0) {
        let movieTagsRef = [];
        for (let tag of request.body.movieTags) {        
            // { movieId: <id>, title: <title>}
            db.doc('movies/' + tag.movieId).set( {
                title: tag.title
            }, {merge: true})
            movieTagsRef.push(db.doc('movies/' + tag.movieId))
        }
        newItem.movieTags = movieTagsRef
    }
    return db
        .collection('wits')
        .add(newItem)
        .then(async (data) => {
            let wits = [];
            
            let wit = await data.get()
            wit = wit.data()

            wit.id = data.id
            // created by
            let created_by_user = await wit.created_by.get()
            let {profileImage, displayName, idtoken} = (await created_by_user.data())
            wit.created_by = {profileImage, displayName, idtoken}
            
            // user
            if (wit.userTags !== undefined) {
                let users = []
                for (let userDoc of wit.userTags) {
                    userDoc = await userDoc.get()
                    let idtoken = userDoc.id;
                    let {displayName, profileImage} = (await userDoc.data())
                    let user = {idtoken: idtoken, displayName: displayName, profileImage: profileImage}

                    users.push(user);
                }
                wit.userTags = users;
            }

            // movie
            if (wit.movieTags !== undefined) {
                let movies = []
                
                for (let movieDoc of wit.movieTags) {
                    movieDoc = await movieDoc.get()
                    let movieId = movieDoc.id
                    let {title} = (await movieDoc.data())
                    let movie = {movieId: movieId, title: title}
                
                    movies.push(movie)
                }
                wit.movieTags = movies
            }



            // roar
            if (wit.roars !== undefined) {
                let roars = []
                for (let roarDoc of wit.roars) {
                    roarDoc = await roarDoc.get()
                    let {displayName, idtoken } = (await roarDoc.data())
                    let roar = {displayName: displayName, idtoken: idtoken}
                    roars.push(roar)
                }
                wit.roars = roars;
            }

            wits.push(wit)
            
            // update wit counter
            await db.doc('users/' + idtoken).update({
                witCount: admin.firestore.FieldValue.increment(1)
            })
            
            response.res = {
                // status: 200, /* Defaults to 200 */
                body: JSON.stringify(wits)
            };
        
        })
        .catch((err) => {
			response.status(500).JSON.stringify({ error: 'Something went wrong' });
			console.error(err);
		});
}

exports.roarWit = async (request, response) => {

    const witId = request.query.roarWit

    const wit = await db.doc('wits/' + witId).get()
    const roarUser = db.doc('users/' + request.user.idtoken)
    const roars = wit.data().roars.map(x => x.id);

    // check if user has roared the wit
    if (roars.includes(request.user.idtoken)) {
        db.doc('wits/' + witId).update( {
            roars: admin.firestore.FieldValue.arrayRemove(roarUser)
        })
    } else {
        db.doc('wits/' + witId).update( {
            roars: admin.firestore.FieldValue.arrayUnion(roarUser)
        })
    }

    return response.res = {
        body: "ok"
    }
}