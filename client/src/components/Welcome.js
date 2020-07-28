import React, { useEffect, useState } from 'react';
import Tone from 'tone';
import CurrentUsersList from './CurrentUsersList';
import { naturalNotes, notes, colors, getRandomInt } from './util';

const synth = new Tone.Synth().toMaster();

const Welcome = ({
  socket,
  username,
  setSyneHistory,
  currentUsers,
}) => {
  const users = currentUsers.filter((user) => user.username !== username);
  const [isSyneBotOn, setIsSyneBotOn] = useState(false);
  const [syneBotInterval, setSyneBotInterval] = useState(null);

  const [syneStatus, setSyneStatus] = useState('Click and say something to begin!');
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
    const recognition = new window.webkitSpeechRecognition();
    recognition.grammars = speechRecognitionList;
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();

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

    recognition.onspeechend = () => setSyneStatus('Click and speak again.');

    recognition.onend = () => recognition.start();

    recognition.onnomatch = () => {
      setSyneText("Syne didn't recognize that note.");
    };

    recognition.onerror = (e) => {
      if (e.error !== 'aborted')
        setSyneText(`Error occurred in recognition: ${e.error}.`);
    };

    // Clean-up function to close voice recognition
    return () => {
      recognition.stop();
    };
    // eslint-disable-next-line
  }, []);

  const handleClick = () => {
    window.navigator.permissions.query({ name: 'microphone' })
      .then(res => {
        if (res.state === 'granted') {
          setSyneStatus('Listening...');
        } else {
          setSyneStatus('Please enable microphone access.');
        }
      });
  };

  const syneBotButtonText = isSyneBotOn ? 'say bye to' : 'wave with';
  const toggleSyneBot = () => {
    if (isSyneBotOn) {
      clearInterval(syneBotInterval);
      socket.emit('disconnect synebot');
      setIsSyneBotOn(false);
    } else {
      socket.emit('add synebot');
      setSyneBotInterval(setInterval(() => {
        const randomIdx = getRandomInt(7);
        let noteToPlay = naturalNotes[randomIdx];
        let newColor = colors[noteToPlay];

        const fullNote = noteToPlay + noteRegister;
        socket.emit('add note', {
          fullNote,
          newColor,
          username: 'SyneBot',
          message: noteToPlay,
        });

        synth.triggerAttackRelease(fullNote, '3');
        setBackgroundColor1(backgroundColor2);
        setBackgroundColor2(newColor);
      }, 3000))
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
