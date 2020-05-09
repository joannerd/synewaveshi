import React, { useEffect, useState } from 'react';
import Tone from 'tone';
import CurrentUsersList from './CurrentUsersList';

const Welcome = ({ username, currentUsers, socket }) => {
  const isChrome =
    !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);

  if (!isChrome) {
    window.confirm(
      'Web Speech API is currently only compatible with Google Chrome and Microsoft Edge. Click OK to view the browser compatibility chart.'
    );
    window.location.href =
      'https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API#Browser_compatibility';
  }

  // Default component state
  const [syneStatus, setSyneStatus] = useState('Click and say a note to begin.');
  const [syneText, setSyneText] = useState('');
  const [backgroundColor1, setBackgroundColor1] = useState('');
  const [backgroundColor2, setBackgroundColor2] = useState('');
  const [noteRegister, setNoteRegister] = useState(2);

  // Set array of possible notes
  const naturalNotes = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
  const flatNotes = naturalNotes.map((note) => note + ' flat');
  const sharpNotes = naturalNotes.map((note) => note + ' sharp');
  const notes = naturalNotes.concat(flatNotes, sharpNotes).sort();

  // Set object of possible colors
  const colors = {
    a: '#d6f5d6',
    b: '#e6e6ff',
    c: '#ffd9cc',
    d: '#ffeb99',
    e: '#f5f5f0',
    f: '#e59a9a',
    g: '#ffcc80',
  };

  // Set voice recognition grammar list
  const grammar = 'grammar notes; public <note> = ' + notes.join(' | ') + ' ;';
  const speechRecognitionList = new window.webkitSpeechGrammarList();
  speechRecognitionList.addFromString(grammar, 
  1);

  // Create voice recognition object
  const recognition = new window.webkitSpeechRecognition();
  recognition.grammars = speechRecognitionList;
  recognition.continuous = false;
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;


  const handleClick = () => {
    window.navigator.permissions.query({ name: 'microphone' })
      .then(res => {
        if (res.state === 'granted') {
          setSyneStatus('Syne is listening...');
        } else {
          recognition.stop();
          setSyneStatus('Please enable microphone access.');
        }
      });
  };

  const changeNoteRegister = (e) => setNoteRegister(e.target.value);
  
  const getRandomInt = (max) => {
    return Math.floor(Math.random() * Math.floor(max));
  };

  useEffect(() => {
    recognition.start();
    const synth = new Tone.Synth().toMaster();
    
    // Web socket listener for new remotely added note
    socket.on('note added', (data) => {
      console.log(`Added note: ${data.note}!`);
      synth.triggerAttackRelease(data.note, '10');
    });

    // Voice input listener to generate new note and change background color
    recognition.onresult = (e) => {
      const note = e.results[0][0].transcript.toLowerCase();

      setSyneStatus('Syne is listening...');
      setSyneText(`Received input: ${note.toUpperCase()}`);

      const randomIdx = getRandomInt(7);
      let noteToPlay = naturalNotes[randomIdx];
      let newColor = colors[noteToPlay];

      if (notes.includes(note)) {
        noteToPlay = note;
        
        if (note.split(' ').length !== 1) {
          const noteParts = note.split(' ');

          const flatToSharp = {};
          naturalNotes.forEach((note, i) => {
            const key = note + ' flat';
            const value = i === 0 ? 'g#' : naturalNotes[i - 1] + '#';
            flatToSharp[key] = value;
          });

          newColor = colors[noteParts[0]];
          noteToPlay = (noteParts[1] === 'sharp')
            ? noteParts[0] + '#'
            : flatToSharp[note];
        }
      }

      const fullNote = noteToPlay + noteRegister;
      socket.emit('add note', fullNote);
      synth.triggerAttackRelease(fullNote, '10');

      setBackgroundColor1(backgroundColor2);
      setBackgroundColor2(newColor);

      console.log('Confidence: ' + e.results[0][0].confidence);
    };

    recognition.onspeechend = () => setSyneStatus('Click to speak again.');

    recognition.onnomatch = () => {
      setSyneText("Syne didn't recognize that note.");
    };

    recognition.onerror = (e) => {
      if (e.error !== 'aborted')
        setSyneText(`Error occurred in recognition: ${e.error}.`);
    };
  }, [
    noteRegister,
    socket,
    recognition,
    syneStatus,
    naturalNotes,
    notes,
    colors,
  ]);

  const users = currentUsers.filter((user) => user.username !== username);

  return (
    <div
      id="welcome"
      onClick={handleClick}
      style={{
        backgroundImage: `linear-gradient(315deg, ${backgroundColor2} 0%, ${backgroundColor1} 70%)`,
      }}
    >
      <h2>Welcome, {username}!</h2>
      <h3 id="wave">Click to begin waving.</h3>
      <CurrentUsersList users={users} />

      <h3>Low or High</h3>
      <h4>Current selected note register: {noteRegister}</h4>
      <input
        type="range"
        min="1"
        max="7"
        value={noteRegister}
        onChange={changeNoteRegister}
      />

      <h3>{syneStatus}</h3>
      <div id="syne" style={{ backgroundColor: backgroundColor2 }}>
        {syneText}
      </div>
    </div>
  );
};

export default Welcome;
