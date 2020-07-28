import React, { useEffect, useState, useContext } from 'react';
import Tone from 'tone';
import CurrentUsersList from './CurrentUsersList';
import HistoryContext from '../HistoryContext';

const Welcome = () => {
  const {
    socket,
    username,
    setSyneHistory,
    currentUsers
  } = useContext(HistoryContext);
  const [syneStatus, setSyneStatus] = useState('Click and say something to begin!');
  const [syneText, setSyneText] = useState('');
  const [backgroundColor1, setBackgroundColor1] = useState('white');
  const [backgroundColor2, setBackgroundColor2] = useState('white');
  const [noteRegister, setNoteRegister] = useState(2);
  const [isListening, setIsListening] = useState(false);
  const [isSyneBotOn, setIsSyneBotOn] = useState(false);

  // Set array of possible notes
  const naturalNotes = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
  const flatNotes = naturalNotes.map((note) => note + ' flat');
  const sharpNotes = naturalNotes.map((note) => note + ' sharp');
  const notes = naturalNotes.concat(flatNotes, sharpNotes).sort();

  // Set object of possible colors
  const colors = {
    a: '#abc4ab',
    b: '#cdcdff',
    c: '#ffb399',
    d: '#ffe166',
    e: '#d6d6c2',
    f: '#e59a9a',
    g: '#ffb84d',
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
          setSyneStatus('Listening...');
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

  const synth = new Tone.Synth().toMaster();

  useEffect(() => {
    recognition.start();
    
    // Web socket listener for new remotely added note
    socket.on('note added', (data) => {
      synth.triggerAttackRelease(data.note, '10');
      setSyneHistory(data.history);
      setBackgroundColor2(data.color);
    });

    // Voice input listener to generate new note and change background color
    recognition.onresult = (e) => {
      const note = e.results[0][0].transcript.toLowerCase();
      setSyneStatus('Listening...');
      setSyneText(`Received input: ${note.toUpperCase()}`);

      const randomIdx = getRandomInt(7);
      let noteToPlay = naturalNotes[randomIdx];
      let newColor = colors[noteToPlay];

      if (notes.includes(note)) {
        noteToPlay = note;
        newColor = colors[note];

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
      socket.emit('add note', {
        fullNote,
        newColor,
        username,
        message: note,
      });
      synth.triggerAttackRelease(fullNote, '10');
      setBackgroundColor1(backgroundColor2);
      setBackgroundColor2(newColor);
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
    synth,
    recognition,
    syneStatus,
    naturalNotes,
    notes,
    colors,
    backgroundColor2,
    setSyneHistory,
    socket,
    username,
  ]);

  useEffect(() => {
    setIsListening(true);

    // Clean-up function to close voice recognition
    return () => {
      if (isListening) {
        recognition.stop();
        setIsListening(false);
      }
    };
  }, []);

  const users = currentUsers.filter((user) => user.username !== username);

  const syneBotButtonText = isSyneBotOn ? 'say bye to' : 'wave with';
  const toggleSyneBot = () => {
    if (isSyneBotOn) {
      socket.emit('disconnect synebot');
      setIsSyneBotOn(false);
    } else {
      socket.emit('add synebot');
      setIsSyneBotOn(true);
    }
  };

  return (
    <div
      id="welcome"
      onClick={handleClick}
      style={{
        backgroundImage: `linear-gradient(315deg, ${backgroundColor2} 0%, ${backgroundColor1} 70%)`,
      }}
    >
      <h2>Welcome, {username}!</h2>
      <h3 id="wave">Start speaking to make sounds.</h3>
      <CurrentUsersList users={users} />
      <button id="synebot" onClick={toggleSyneBot}>Click to {syneBotButtonText} SyneBot</button>
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
