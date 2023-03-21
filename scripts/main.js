// Function to read the quote of the day from Firestore "quotes" collection
// Input param is the String representing the day of the week, aka, the document name
// displays the quote based in input param string "tuesday", "monday", etc. 
function readQuote( day ) {
    db.collection( "quotes" ).doc( day ).onSnapshot( doc => {
        console.log("inside");
        console.log( doc.data() );
        document.getElementById( "quote-goes-here" ).innerHTML = doc.data().quote;
    } )
}
// Comment out the next line (we will call this function from doAll())
// readQuote("tuesday");       
// readQuote("tuesday");        //calling the function

function insertNameFromFirestore(){
    // to check if the user is logged in:
    firebase.auth().onAuthStateChanged(user =>{
        if (user){
           console.log(user.uid); // let me to know who is the user that logged in to get the UID
           currentUser = db.collection("users").doc(user.uid); // will to to the firestore and go to the document of the user
           currentUser.get().then(userDoc=>{
               //get the user name
               var userName= userDoc.data().name;
               console.log(userName);
               //$("#name-goes-here").text(userName); //jquery
               document.getElementById("name-goes-here").innerText=userName;
           })    
       }    
    })
}
//  ()


//------------------------------------------------------------------------------
// Input parameter is a string representing the collection we are reading from
//------------------------------------------------------------------------------
function displayCardsDynamically(collection) {
    let cardTemplate = document.getElementById("hikeCardTemplate");

    db.collection(collection)
        .orderBy("hike_time") //sort by name
        .limit(2)
        .get() //the collection called "hikes"
        .then(allHikes => {
            //var i = 1;  //Optional: if you want to have a unique ID for each hike
            allHikes.forEach(doc => { //iterate thru each doc
                var title = doc.data().name; // get value of the "name" key
                var details = doc.data().details; // get value of the "details" key
                var hikeCode = doc.data().code; //get unique ID to each hike to be used for fetching right image
                var hikeLength = doc.data().length; //gets the length field
                var docID = doc.id;
                let newcard = cardTemplate.content.cloneNode(true);

                //update title and text and image etc.
                newcard.querySelector('.card-title').innerHTML = title;
                //newcard.querySelector('.card-length').innerHTML = hikeLength + "km";
                newcard.querySelector('.card-text').innerHTML = details;
                newcard.querySelector('.card-image').src = `./images/${hikeCode}.jpg`; //Example: NV01.jpg
                newcard.querySelector('a').href = "eachHike.html?docID=" + docID;

                //NEW LINE: update to display length, duration, last updated
                newcard.querySelector('.card-length').innerHTML =
                    "Length: " + doc.data().length + " km <br>" +
                    "Duration: " + doc.data().hike_time + "min <br>" +
                    "Last updated: " + doc.data().last_updated.toDate().toLocaleDateString();

                //NEW LINES: next 2 lines are new for demo#11
                //this line sets the id attribute for the <i> tag in the format of "save-hikdID" 
                //so later we know which hike to bookmark based on which hike was clicked
                newcard.querySelector('i').id = 'save-' + docID;
                // this line will call a function to save the hikes to the user's document             
                newcard.querySelector('i').onclick = () => saveBookmark(docID);

                currentUser.get().then(userDoc => {
                    //get the user name
                    var bookmarks = userDoc.data().bookmarks;
                    if (bookmarks.includes(docID)) {
                       document.getElementById('save-' + docID).innerText = 'bookmark';
                    }
              })
                //Finally done modifying newcard
                //attach to gallery, Example: "hikes-go-here"
                document.getElementById(collection + "-go-here").appendChild(newcard);

                //i++;   //Optional: iterate variable to serve as unique ID
            })
        })
}

// displayCardsDynamically("hikes");  //input param is the name of the collection

//Global variable pointing to the current user's Firestore document
var currentUser;   

//Function that calls everything needed for the main page  
function doAll() {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            currentUser = db.collection("users").doc(user.uid); //global
            console.log(currentUser);

            // figure out what day of the week it is today
            const weekday = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
            const d = new Date();
            let day = weekday[d.getDay()];

            // the following functions are always called when someone is logged in
            readQuote(day);
            insertNameFromFirestore();
            displayCardsDynamically("hikes");
        } else {
            // No user is signed in.
            console.log("No user is signed in");
            window.location.href = "login.html";
        }
    });
}
doAll();

//-----------------------------------------------------------------------------
// This function is called whenever the user clicks on the "bookmark" icon.
// It adds the hike to the "bookmarks" array
// Then it will change the bookmark icon from the hollow to the solid version. 
//-----------------------------------------------------------------------------
function saveBookmark(hikeDocID) {
    currentUser.set({
            bookmarks: firebase.firestore.FieldValue.arrayUnion(hikeDocID)
        }, {
            merge: true
        })
        .then(function () {
            console.log("bookmark has been saved for: " + currentUser);
            var iconID = 'save-' + hikeDocID;
            //console.log(iconID);
						//this is to change the icon of the hike that was saved to "filled"
            document.getElementById(iconID).innerText = 'bookmark';
        });
}