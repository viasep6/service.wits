const { db } = require('../service.shared/Repository/Firebase/admin')

async function getFromUserTags(wit) {
    let users = [];
    for (let userDoc of wit.userTags) {
        userDoc = await userDoc.get();
        let idtoken = userDoc.id;
        let {displayName, profileImage} = (await userDoc.data());
        let user = {idtoken: idtoken, displayName: displayName, profileImage: profileImage};

        users.push(user);
    }
    return users;
}

async function getFromMovieTags(wit) {
    let movies = [];
    for (let movieDoc of wit.movieTags) {
        movieDoc = await movieDoc.get();
        let movieId = movieDoc.id;
        let {title} = (await movieDoc.data());
        let movie = {movieId: movieId, title: title};
        movies.push(movie);
    }
    return movies;
}

async function getRoarDetails(wit) {
    let roars = [];
    for (let roarDoc of wit.roars) {
        roarDoc = await roarDoc.get();
        let {displayName, idtoken} = (await roarDoc.data());
        let roar = {displayName: displayName, idtoken: idtoken};
        roars.push(roar);
    }
    return roars;
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
        for (let witData of data.docs) {
            let wit = witData.data()
            wit.id = witData.id
            // created by
            let created_by_user = await wit.created_by.get()
            let {profileImage, displayName, idtoken} = (await created_by_user.data())
            wit.created_by = {profileImage, displayName, idtoken}
            
            // user
            if (wit.userTags !== undefined) {
                let {users} = await getFromUserTags(wit);
                wit.userTags = users;
            }

            // movie
            if (wit.movieTags !== undefined) {
                let {movies} = await getFromMovieTags(wit);
                wit.movieTags = movies
            }

            // roar
            if (wit.roars !== undefined) {
                let {roars} = await getRoarDetails(wit);
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



/*
    Returns all wits by user and all wits from subscribed movies
    limited 10, startAfter <iso string date>
*/
exports.getByFeed = async (request, response) => {

    const limit = 10
    const userId = request.user.idtoken
    let startAfter = request.query.startAfter;

    if (startAfter === undefined || startAfter === '') {
        startAfter = new Date().toISOString()
    }
    
    const docs = []
    const user = db.doc('users/' + userId)
    
    const witsByUser = await db.collection('wits').where('created_by', '==', user)
        .orderBy('created', 'desc').limit(limit)
        .startAfter(startAfter)
        .get()
    docs.push(...witsByUser.docs)

    const movies = await db.collection('movies')
    .where('followers', 'array-contains', user)
    .get()

    for (let doc of movies.docs) {
        const witsByMovie = await db.collection('wits')
        .where('movieTags', 'array-contains', db.doc('movies/' + doc.id))
        .orderBy('created', 'desc')
        .limit(limit)
        .startAfter(startAfter)
        .get()

        docs.push(...witsByMovie.docs)
    }

    const wits = []
    for (let witData of docs) {
        let wit = witData.data()
        wit.id = witData.id
        // created by
        let created_by_user = await wit.created_by.get()
        let {profileImage, displayName, idtoken } = (await created_by_user.data())
        wit.created_by = {profileImage, displayName, idtoken}
        
        // movie
        if (wit.movieTags !== undefined) {
            let {movies, movieDoc} = await getFromMovieTags(wit);
            wit.movieTags = movies
        }

        // roar
        if (wit.roars !== undefined) {
            let {roars, roarDoc} = await getRoarDetails(wit);
            wit.roars = roars;
        }

        wits.push(wit)
    }

    let witsToReturn = getUnique(wits, 'id').sort(function(a, b) {
        return new Date(b.created) - new Date(a.created);
    }).slice(0, limit);

    response.res = {
        // status: 200, /* Defaults to 200 */
        body: JSON.stringify(witsToReturn)
    };




}


exports.getByMovie = async (request, response) => {

    const limit = 10
    let startAfter = request.query.startAfter;
    let movieId = request.query.movieId;

    if (startAfter === undefined || startAfter === '') {
        startAfter = new Date().toISOString()
    }
    
   

    const movies = await db.collection('wits')
    .where('movieTags', 'array-contains', db.doc('movies/' + movieId))
    .orderBy('created', 'desc')
    .limit(limit) 
    .startAfter(startAfter)
    .get()

    const wits = []
    for (let witData of movies.docs) {
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
    }

    response.res = {
        // status: 200, /* Defaults to 200 */
        body: JSON.stringify(wits)
    };




}



function getUnique(arr, comp) {

    // store the comparison  values in array
    const unique =  arr.map(e => e[comp])

    // store the indexes of the unique objects
    .map((e, i, final) => final.indexOf(e) === i && i)

    // eliminate the false indexes & return unique objects
    .filter((e) => arr[e]).map(e => arr[e]);

    return unique;
}