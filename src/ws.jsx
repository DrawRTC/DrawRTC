import React from 'react';
import { useState } from 'react';
// import { initializeApp } from "firebase/compat/app";
// import { getFirestore } from "firebase/compat/firestore";
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
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

let peerConnection = new RTCPeerConnection(servers);
const dataChannel = peerConnection.createDataChannel('drawingchannel');

// Initialize Firebase
// connect to database
firebase.initializeApp(firebaseConfig);
const firestore = firebase.firestore();

// create RTCPeerConnection

const Test = (props) => {

  const [sdp, setSDP] = useState('');

  // Event handler for receiving messages on the data channel
  function handleDataChannelMessage(event) {
    // Retrieve the received drawing data
    const receivedDataString = event.data;

    // Convert the JSON string back to an object
    const receivedDrawingData = JSON.parse(receivedDataString);

    // Process the received drawing data
    // ...
    console.log('drawing data: ', receivedDrawingData);
  }

  async function onSubmitOffer(e) {
    try {
      console.log('creating offer');
      console.log(peerConnection);
      // Assuming you have the drawing data object
      const drawingData = {
        lastPoint,
        x: e.offsetX,
        y: e.offsetY,
        force: force,
        color: color || 'green'
      };

      // Set up event handler for receiving data on the data channel
      dataChannel.onmessage = handleDataChannelMessage;

      // Convert the drawing data to JSON string
      const drawingDataString = JSON.stringify(drawingData);

      // Send the drawing data through the data channel
      dataChannel.send(drawingDataString);
      //In firestore db, there's a collection of calls that stores the offer/answer SDPs objects from each peer
      //each call document contains a subcollection for 'answer' candidates and 'offer' ICE candidates


      //Send the SDP offer to db
      const callDoc = firestore.collection('calls').doc();
      const offerCandidates = callDoc.collection('offerCandidates');
      const answerCandidates = callDoc.collection('answerCandidates');
      console.log('CallDoc: ', callDoc.id);

      //Create SDP offer
      const offerDesc = await peerConnection.createOffer();
      //set the local description in pc object - represents the session description for the local peer
      await peerConnection.setLocalDescription(offerDesc);

      const offer = {
        sdp: offerDesc.sdp,
        type: offerDesc.type,
      };

      await callDoc.set({ offer });

      //add offerer's candidates to db
      peerConnection.onicecandidate = event => {
        console.log('adding ice offer candidate', event.candidate);
        event.candidate && offerCandidates.add(event.candidate.toJSON());
      };

      // peerConnection.addEventListener('icecandidate', (event) => {
      //   if (event.candidate) {
      //     // ICE candidate is available
      //     console.log('ICE candidate:', event.candidate);
      //     offerCandidates.add(event.candidate.toJSON());
      //   }
      // });

      //Listen for remote answer from db
      //Accesses collection of that call document and attaches a listener (snapshot) which listens for changes to the document's data in real time
      callDoc.onSnapshot((snapshot) => {
        console.log('listening for remote user from db');
        const data = snapshot.data();
        if (!peerConnection.currentRemoteDescription && data?.answer) {
          const answerDescription = new RTCSessionDescription(data.answer);
          pc.setRemoteDescription(answerDescription);
        }
      });

      //Listen for remote ICE answer candidates from answerer
      answerCandidates.onSnapshot(snapshot => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            console.log('adding ice answer candidate');
            const iceCandidate = new RTCIceCandidate(change.doc.data());
            peerConnection.addIceCandidate(iceCandidate);
          }
        });
      });

    } catch (err) { console.log('Error occurred in onSubmitOffer: ', err); }
  }

  async function onSubmitAnswer(e) {

    try {
      console.log('sending an answer');
      const callId = sdp; //sdp is the collection ID of a call document that someone input
      const callDoc = firestore.collection('calls').doc(callId);
      const offerCandidates = callDoc.collection('offerCandidates');
      const answerCandidates = callDoc.collection('answerCandidates');

      //add answerer's candidates to db
      peerConnection.onicecandidate = event => {
        event.candidate && answerCandidates.add(event.candidate.toJSON());
      };
      //get the offer sdp from db
      //and set it to remote description of pc object - represents the session description from remote peer
      const callData = (await callDoc.get()).data();
      const offerDescription = callData.offer;
      await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

      //Create sdp answer
      const answerDescription = await pc.createAnswer();
      await pc.setLocalDescription(answerDescription);

      const answer = {
        type: answerDescription.type,
        sdp: answerDescription.sdp,
      };

      await callDoc.update({ answer });

      //Listen for remote ICE candidates from offerer
      offerCandidates.onSnapshot(snapshot => {
        snapshot.docChanges().forEach((change) => {
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
    try {
      //broadcast message through data channel
      // const dataChannel = peerConnection.createDataChannel('drawingChannel');
      console.log('Broadcasting message');

    } catch (err) { console.log('Error occurred in broadCastMessage: ', err); }
  }

  return (
    <div className='flex justify-center items-center'>
      <button onClick={onSubmitOffer} type='button' className="p-2 rounded-md border border-black">Create offer</button>
      <div id='answerDiv'>
        <label id='answerLabel' >BoardID: </label>
        <input id='answerInput' value={`${sdp}`} onChange={(e) => { console.log(sdp); setSDP(e.target.value); }} type="text" />
        <button id='answerButton' onSubmit={onSubmitAnswer} type='button' className="p-2 rounded-md border border-blue">Submit Report</button>
      </div>
      <button type='button' className="p-2 rounded-md border border-red" onClick={broadcastMessage}>Broadcast Message</button>
    </div>
  );
};

export default Test;