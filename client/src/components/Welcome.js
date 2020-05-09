import React, { useEffect, useRef, useState } from 'react';
import Tone from 'tone';
import CurrentUsersList from './CurrentUsersList';

const SYNE_IS_LISTENING = 'Syne is listening...';
const CLICK_TO_SPEAK_AGAIN = 'Click to speak again.'

const Welcome = ({ username, currentUsers, socket }) => {
  const [syneText, setSyneText] = useState('Click and say a note to begin.');
  const [noteRegister, setNoteRegister] = useState(3);

  const naturalNotes = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
  const flatNotes = naturalNotes.map((note) => note + ' flat');
  const sharpNotes = naturalNotes.map((note) => note + ' sharp');
  const notes = naturalNotes.concat(flatNotes, sharpNotes).sort();

  const grammar = 'grammar notes; public <note> = ' + notes.join(' | ') + ' ;';
  const speechRecognitionList = new window.webkitSpeechGrammarList();
  speechRecognitionList.addFromString(grammar, 1);

  const recognition = new window.webkitSpeechRecognition();
  recognition.grammars = speechRecognitionList;
  recognition.continuous = false;
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  const ref = useRef();
  const synth = new Tone.Synth().toMaster();

  const handleClick = () => {
    window.navigator.permissions.query({ name: 'microphone' })
      .then(res => {
        if (res.state === 'granted') {
          setSyneText(SYNE_IS_LISTENING);
        } else {
          recognition.stop();
          setSyneText('Please enable microphone access.');
        }
      });
  };

  const changeNoteRegister = (e) => setNoteRegister(e.target.value);
  
  const getRandomInt = (max) => {
    return Math.floor(Math.random() * Math.floor(max));
  };

  useEffect(() => {
    recognition.start();
    
    socket.on('note added', (data) => {
      console.log(`Added new note: ${data.note}!`);
      synth.triggerAttackRelease(data.note, '10');
    });

    recognition.onresult = (e) => {
      const note = e.results[0][0].transcript.toLowerCase();

      setSyneText(SYNE_IS_LISTENING);
      ref.current.textContent = 'Received input: ' + note.toUpperCase();

      const randomIdx = getRandomInt(7);
      let noteToPlay = naturalNotes[randomIdx];

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

          noteToPlay = (noteParts[1] === 'sharp')
            ? noteParts[0] + '#'
            : flatToSharp[note];
        }
      } else {
        ref.current.style.backgroundColor = note;
      }

      const fullNote = noteToPlay + noteRegister;
      console.log(fullNote);
      socket.emit('add note', fullNote);

      synth.triggerAttackRelease(fullNote, '10');
      // console.log(synth);

      console.log('Confidence: ' + e.results[0][0].confidence);
    };

    recognition.onspeechend = () => {
      setSyneText(CLICK_TO_SPEAK_AGAIN);
    }

    recognition.onnomatch = (e) => {
      ref.current.textContent = "Syne didn't recognize that note.";
    };

    recognition.onerror = (e) => {
      if (e.error !== 'aborted')
        ref.current.textContent = 'Error occurred in recognition: ' + e.error;
    };
  }, [
    noteRegister,
    socket,
    recognition,
    synth,
    syneText,
    naturalNotes,
    notes,
  ]);

  const users = currentUsers.filter((user) => user.username !== username);

  return (
    <div id="welcome" onClick={handleClick}>
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

      {syneText}
      <div ref={ref} id="syne" />
    </div>
  );
};

export default Welcome;
