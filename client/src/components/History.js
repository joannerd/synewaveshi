import React, { useContext } from 'react';
import HistoryContext from '../HistoryContext';

const History = () => {
  const { syneHistory } = useContext(HistoryContext);

  return (
    <ul id="history">
      <h3>History</h3>
      {syneHistory.map(({ timestamp, value, user }, i) => {
        const alignClass = i % 2 === 0 ? 'left' : 'right';
        return (
          <li key={i}>
            <div className="time">{timestamp}</div>
            <p className="msg">{value}</p>
            <div className={`user ${alignClass}`}>{user}</div>
          </li>
        );})}
    </ul>
  );
};

export default History;
