const { db } = require('../service.shared/Repository/Firebase/admin')

exports.getAllWits = (request, response) => {
    
    return db
    .collection('wits')
    .orderBy('created', 'desc')
    .get()
    .then(async (data) => {
        let wits = [];

        for (let witData of data.docs) {
            let wit = witData.data()
            // created by
            let created_by_user = await wit.created_by.get()
            let {profileImage, displayName, idtoken } = (await created_by_user.data())
            wit.created_by = {profileImage, displayName, idtoken}
            
            // movie
            if (wit.movieTags !== undefined) {
                let movies = []
                for (let movieDoc of wit.movieTags) {
                    movieDoc = await movieDoc.get()
                    let movieId = movieDoc.id
                    let {movieName} = (await movieDoc.data())
                    let movie = {movieId: movieId, movieName: movieName}
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
        }
        
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
    const limit = 10
    const userId = request.query.userId;
    let startAfter = request.query.startAfter;
    
    if (startAfter === undefined || startAfter === '') {
        startAfter = new Date().toISOString()
    }

    return db
    .collection('wits')
    .where('created_by', '==', db.doc('users/' + userId))
    .orderBy('created', 'desc')
    .limit(limit) 
    .startAfter(startAfter)
    .get()
    .then(async (data) => {
        let wits = [];
        console.log("size:", data.docs.length);
        for (let witData of data.docs) {
            let wit = witData.data()
            wit.id = witData.id
            // created by
            let created_by_user = await wit.created_by.get()
            let {profileImage, displayName, idtoken } = (await created_by_user.data())
            wit.created_by = {profileImage, displayName, idtoken}
            
            // movie
            if (wit.movieTags !== undefined) {
                let movies = []
                for (let movieDoc of wit.movieTags) {
                    movieDoc = await movieDoc.get()
                    let movieId = movieDoc.id
                    let {movieName} = (await movieDoc.data())
                    let movie = {movieId: movieId, movieName: movieName}
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
        }
        
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