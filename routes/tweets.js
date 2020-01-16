const Twitter = require('twitter');

module.exports = (app, io) => {
    let twitter = new Twitter({
      consumer_key: "e9uCo1auvbCV6OzwY1v1RrY0V",
      consumer_secret: "sIRWmVlVmRGkcGPqULtJm7cemyEPPCRfiRaTEgubEKtNt3dEo4",
      access_token_key: "1196817803996782594-Ll9zDsNboy10XBKUBijNBP7YRQBlEl",
      access_token_secret: "nyvgEQ9fUVXI0Jcd8C3Ty41fwVYfJGyA5JDZ56TOE9Xdd"
    });

    let socketConnection;
    let twitterStream;

    app.locals.searchTerm = 'javascript'; //Default search term for twitter stream.
    app.locals.showRetweets = false; //Default

    /**
     * Resumes twitter stream.
     */
    const stream = () => {
        console.log('Resuming for ' + app.locals.searchTerm);
        twitter.stream('statuses/filter', { track: app.locals.searchTerm }, (stream) => {
            stream.on('data', (tweet) => {
                sendMessage(tweet);
            });

            stream.on('error', (error) => {
                console.log(error);
            });

            twitterStream = stream;
        });
    }

    /**
     * Sets search term for twitter stream.
     */
    app.post('/setSearchTerm', (req, res) => {
        let term = req.body.term;
        app.locals.searchTerm = term;
        twitterStream.destroy();
        stream();
    });

    /**
     * Pauses the twitter stream.
     */
    app.post('/pause', (req, res) => {
        console.log('Pause');
        twitterStream.destroy();
    });

    /**
     * Resumes the twitter stream.
     */
    app.post('/resume', (req, res) => {
        console.log('Resume');
        stream();
    });

    //Establishes socket connection.
    io.on("connection", socket => {
        socketConnection = socket;
        stream();
        socket.on("connection", () => console.log("Client connected"));
        socket.on("disconnect", () => console.log("Client disconnected"));
    });

    /**
     * Emits data from stream.
     * @param {String} msg 
     */
    const sendMessage = (msg) => {
        if (msg.text.includes('RT')) {
            return;
        }
        socketConnection.emit("tweets", msg);
    }
};