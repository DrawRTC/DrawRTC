import firebase from "firebase/app";
import 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCgZ1Ifkw7Q9ftoSM9EDAN3o1IhWbgOtb4",
  authDomain: "drawrtcfirebase.firebaseapp.com",
  projectId: "drawrtcfirebase",
  storageBucket: "drawrtcfirebase.appspot.com",
  messagingSenderId: "779485702996",
  appId: "1:779485702996:web:90919257d1eaa86cfcf6c1",
  measurementId: "G-MFYF2JS3YV"
};
const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};

// Initialize Firebase
// if (!firebase.apps.length) {
const fBApp = firebase.initializeApp(firebaseConfig);
// }
//connect to database
const firestore = firebase.firestore();

//create RTCPeerConnection
let peerConnection = new RTCPeerConnection(servers);

const Test = () => {

  const [sdp, setSDP] = useState('');

  async function onSubmitOffer(e) {
    e.preventDefault();
    try {
      //Create SDP offer
      const offer = await peerConnection.createOffer();
      //set the local description in pc object - represents the session description for the local peer
      await peerConnection.setLocalDescription(offer);

      //In firestore db, there's a collection of calls that stores the offer/answer SDPs objects from each peer
      //each call document contains a subcollection for 'answer' candidates and 'offer' ICE candidates

      //Send the SDP offer to db
      const callDoc = firestore.collection('calls').doc();
      const offerCandidates = callDoc.collection('offer');
      const answerCandidates = callDoc.collection('answer');
      await callDoc.set({ offer: offer });

      //add offerer's candidates to db
      peerConnection.onicecandidate = event => {
        event.candidate && offerCandidates.add(event.candidate.toJSON());
      };

      //Listen for remote answer from db
      //Accesses collection of that call document and attaches a listener (snapshot) which listens for changes to the document's data in real time
      callDoc.onSnapshot(snapshot => {
        const answer = snapshot.data()?.answer;
        if (!peerConnection.currentRemoteDescription && answer) {
          peerConnection.setRemoteDescription(answer);
        }
      });

      //Listen for remote ICE answer candidates from answerer
      answerCandidates.onSnapshot(snapshot => {
        snapshot.docChanges.forEach(change => {
          if (change.type === 'added') {
            const iceCandidate = new RTCIceCandidate(change.doc.data());
            peerConnection.addIceCandidate(iceCandidate);
          }
        });
      });

    } catch (err) { console.log('Error occurred in onSubmitOffer: ', err); }
  }

  async function onSubmitAnswer(e) {
    e.preventDefault();

    try {
      const callId = sdp; //sdp is the collection ID of a call document that someone input
      const callDoc = firestore.collection('calls').doc(callId);
      const offerCandidates = callDoc.collection('offer');
      const answerCandidates = callDoc.collection('answer');

      //add answerer's candidates to db
      peerConnection.onicecandidate = event => {
        event.candidate && answerCandidates.add(event.candidate.toJSON());
      };
      //get the offer sdp from db
      //and set it to remote description of pc object - represents the session description from remote peer
      const offerDescription = await callDoc.get().data().offer;
      await peerConnection.setRemoteDescription(offerDescription);

      //Create sdp answer
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      //Send the sdp answer to db
      await callDoc.update({ answer: answer });

      //Listen for remote ICE candidates from offerer
      offerCandidates.onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
          if (change.type === 'added') {
            let data = change.doc.data();
            peerConnection.addIceCandidate(new RTCIceCandidate(data));
          }
        });
      });

      setSDP('');
    } catch (err) { console.log('Error occurred in onSubmitAnswer: ', err); }
  }


  async function broadcastMessage(e) {
    e.preventDefault();
    try {
      //broadcast message through data channel
      const dataChannel = peerConnection.createDataChannel('drawingChannel');


    } catch (err) { console.log('Error occurred in broadCastMessage: ', err); }
  }

  return (
    <div className='flex justify-center items-center'>
      <button type='button' className="p-2 rounded-md border border-black" onClick={onSubmitOffer}>Create offer</button>
      <form onSubmit={onSubmitAnswer} id='answerForm'>
        <label id='answerLabel' >BoardID: </label>
        <input id='answerInput' value={`${sdp}`} onChange={(e) => { setSDP(e.target.value); }} type="text" />
        <button id='answerButton' type='button' className="p-2 rounded-md border border-blue">Submit Report</button>
      </form>
      <button type='button' className="p-2 rounded-md border border-red" onClick={broadcastMessage}>Broadcast Message</button>
    </div>
  );
};

export default Test;