import React, { useEffect, useRef, useState } from 'react';
import { Synth } from 'tone';

const Welcome = ({ username, currentUsers }) => {
  const [isListening, setIsListening] = useState(true);
  const [noteRegister, setNoteRegister] = useState(1);

  const naturalNotes = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
  const flatNotes = naturalNotes.map(note => note + ' flat');
  const sharpNotes = naturalNotes.map(note => note + ' sharp');
  const notes = naturalNotes.concat(flatNotes, sharpNotes).sort();

  const grammar = '#JSGF V1.0; grammar notes; public <note> = ' + notes.join(' | ') + ' ;'
  const speechRecognitionList = new window.webkitSpeechGrammarList();
  speechRecognitionList.addFromString(grammar, 1);

  const recognition = new window.webkitSpeechRecognition();
  recognition.grammars = speechRecognitionList;
  recognition.continuous = false;
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.start();

  const ref = useRef();
  const synth = new Synth().toMaster();

  const handleClick = () => {
    ref.current.textContent = 'Syne is listening...';
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
    }
  }

  useEffect(() => {
    recognition.onresult = e => {
      const note = e.results[0][0].transcript;
      ref.current.textContent = 'Result received: ' + note + '. \n Click to speak again.';
      ref.current.style.backgroundColor = note;
      let noteToPlay = note + noteRegister;
      if (notes.includes(note)) {
        if (note.split(' ').length === 1) {
          noteToPlay = note + noteRegister;
        } else {
          const noteParts = note.split(' ');
          if (noteParts[1] === 'sharp') {
            noteToPlay = note + '#' + noteRegister;
          }
        }
      }
       synth.triggerAttackRelease(noteToPlay, '1m');
      console.log(e.results)
      console.log('Confidence: ' + e.results[0][0].confidence);
    }

    recognition.onspeechend = () => {
      recognition.stop();
    }

    recognition.onnomatch = e => {
      ref.current.textContent = "Syne didn't recognise that note.";
    }

    recognition.onerror = e => {
      ref.current.textContent = 'Error occurred in recognition: ' + e.error;
    }
  }, [recognition, isListening]);
  
  const changeNoteRegister = e => setNoteRegister(e.target.value);
  const users = currentUsers.filter((user) => user.username !== username);

  return (
    <div id="welcome" onClick={handleClick} >
      <h2>Welcome, {username}!</h2>
      <h3 id="wave">Click to begin waving.</h3>
      <div className="current-users">
        <h4>You are currently waving sines with...</h4>
        {users.map(({id, username}, i) => {
          let name = username;

          if (users.length === 2 && i === 1) {
            name = ` and ${username}.`;
          } else if (i !== 0) {
            i < users.length - 1
              ? name = `, ${username}`
              : name = `, and ${username}.`;
          }

          return <span key={id}>{name}</span>;
        })}
      </div>
      <h3>Low or High</h3>
      <h4>Current selected note register: {noteRegister}</h4>
      <input type="range" min="1" max="7" value={noteRegister} onChange={changeNoteRegister} />
      
      <div ref={ref} id="syne"></div>
    </div>
  );
}

export default Welcome;
