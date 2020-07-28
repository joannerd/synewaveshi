import React, { useEffect, useState, useContext, useRef } from 'react';
import Tone from 'tone';
import CurrentUsersList from './CurrentUsersList';
import HistoryContext from '../HistoryContext';
import { naturalNotes, notes, colors, getRandomInt } from './util';

const Welcome = () => {
  const {
    socket,
    username,
    setSyneHistory,
    currentUsers
  } = useContext(HistoryContext);
  const syneBotClick = useRef();
  const users = currentUsers.filter((user) => user.username !== username);
  const [isSyneBotOn, setIsSyneBotOn] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [synth, setSynth] = useState(null);
  const [syneBotInterval, setSyneBotInterval] = useState(null);

  const [syneStatus, setSyneStatus] = useState('Say something or click to begin!');
  const [syneText, setSyneText] = useState('');
  const [backgroundColor1, setBackgroundColor1] = useState('white');
  const [backgroundColor2, setBackgroundColor2] = useState('white');
  const [noteRegister, setNoteRegister] = useState(2);
  const changeNoteRegister = (e) => setNoteRegister(e.target.value);

  useEffect(() => {
    // Set voice recognition grammar list
    const grammar = 'grammar notes; public <note> = ' + notes.join(' | ') + ' ;';
    const speechRecognitionList = new window.webkitSpeechGrammarList();
    speechRecognitionList.addFromString(grammar, 1);

    // Create voice recognition object
    const newRecognition = new window.webkitSpeechRecognition();
    newRecognition.grammars = speechRecognitionList;
    newRecognition.continuous = false;
    newRecognition.lang = 'en-US';
    newRecognition.interimResults = false;
    newRecognition.maxAlternatives = 1;

    newRecognition.start();
    setRecognition(newRecognition);

    const newSynth = new Tone.Synth().toMaster();
    setSynth(newSynth);

    // Clean-up function to close voice recognition
    return () => {
      if (recognition) recognition.stop();
    };
    // eslint-disable-next-line
  }, []);

  const handleClick = () => {
    window.navigator.permissions.query({ name: 'microphone' })
      .then(res => {
        if (res.state === 'granted') {
          const randomIdx = getRandomInt(7);
          let noteToPlay = naturalNotes[randomIdx];
          let newColor = colors[noteToPlay];

          const fullNote = noteToPlay + noteRegister;
          socket.emit('add note', {
            fullNote,
            newColor,
            username,
            message: noteToPlay,
          });

          synth.triggerAttackRelease(fullNote, '3');
          setBackgroundColor1(backgroundColor2);
          setBackgroundColor2(newColor);

          setSyneStatus('Listening...');
        } else {
          recognition.stop();
          setSyneStatus('Please enable microphone access.');
        }
      });
  };

  useEffect(() => {
    if (recognition) {
      // Web socket listener for new remotely added note
      socket.on('note added', (data) => {
        synth.triggerAttackRelease(data.note, '3');
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

        synth.triggerAttackRelease(fullNote, '3');
        setBackgroundColor1(backgroundColor2);
        setBackgroundColor2(newColor);
      };

      recognition.onspeechend = () => setSyneStatus('Click or speak again.');

      recognition.onnomatch = () => {
        setSyneText("Syne didn't recognize that note.");
      };

      recognition.onerror = (e) => {
        if (e.error !== 'aborted')
          setSyneText(`Error occurred in recognition: ${e.error}.`);
      };
    }
  }, [
    noteRegister,
    recognition,
    synth,
    syneStatus,
    backgroundColor2,
    setSyneHistory,
    socket,
    username,
  ]);

  const syneBotButtonText = isSyneBotOn ? 'say bye to' : 'wave with';
  const toggleSyneBot = () => {
    if (isSyneBotOn) {
      clearInterval(syneBotInterval);
      socket.emit('disconnect synebot');
      setIsSyneBotOn(false);
    } else {
      socket.emit('add synebot');
      setSyneBotInterval(setInterval(() => syneBotClick.current.click(), 3000))
      setIsSyneBotOn(true);
    }
  };

  return (
    <div
      id="welcome"
      ref={syneBotClick}
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
