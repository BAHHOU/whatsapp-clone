const express = require('express');
const mongoose = require('mongoose');
const Messages = require ('./dbMessages.js');
const Pusher = require("pusher");
const cors = require("cors");

const { default: dbMessages } = require('./dbMessages');

//app config
const app = express();

const port = process.env.PORT || 9000
//middleware
app.use(express.json());
app.use(cors());

const pusher = new Pusher({
  appId: "1200916",
  key: "acb22997e17c15977fa6",
  secret: "9fababd02fb204d80ef5",
  cluster: "eu",
  useTLS: true
});


//api routes
app.get('/',(req,res)=>{
    res.status(200).send("hello")
});

app.get('/messages/sync',(req, res) => {

  Messages.find((err, data) => {
    if (err) {
        res.status(500).send(err)
    }else {
      res.status(201).send(data)
    }
  })
})

app.post('/messages/new',(req, res) => {
  const dbMessage =req.body

  Messages.create(dbMessage, (err, data) => {
    if (err) {
        res.status(500).send(err)
    }else {
      res.status(201).send(`new message created: \n ${data}`)
    }
  })
})

//listener
app.listen(port,()=>console.log(`listening to port ${port}`))

//db config
const connection_url = 'mongodb+srv://admin:bApuR4vVybf6c65O@cluster0.d7x5k.mongodb.net/whatsappdb?retryWrites=true&w=majority'
mongoose.connect(connection_url, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const db = mongoose.connection;

db.once("open", () => {
  console.log('DB is connected');

  const msgCollection = db.collection("messagecontents");
  const changeStream = msgCollection.watch();

  changeStream.on("change", (change) => {
    console.log("A change occured", change);

    if (change.operationType === "insert") {
      const messageDetails = change.fullDocument;
      pusher.trigger("messages", "inserted", {
        name: messageDetails.name,
        message: messageDetails.message, 
        timestamp: messageDetails.timestamp,
        received: messageDetails.received
      }); 
    } else {

    }
  });

});


//api endpoint



//database info bApuR4vVybf6c65O