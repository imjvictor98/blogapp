if(process.env.NODE_ENV == 'production'){
    module.exports ={
        mongoURI: "imjvictor98:<casa35615589>@cluster0-tsl45.mongodb.net/test?retryWrites=true&w=majority"
    }
}else{
    module.exports = {
        mongoURI: 'mongodb://localhost/blogapp'
    }
}