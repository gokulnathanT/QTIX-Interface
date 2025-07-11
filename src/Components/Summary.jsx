import React from 'react'
import { useLocation } from 'react-router-dom';
import '../Css/Summary.css'
export default function Summary() {
    const location =useLocation();
    

    const data=JSON.parse(location.state.Summary);
    const topics = data.topics;

    const scores = Object.entries(data.score);
  return (
    <div className="summary-content">
      <div className="summary">
        <h3>Summary !!!</h3>
        <ul>
          {topics.map((topic, index) => (
            <li key={index}>{topic}</li>
          ))}
        </ul>
        <br />
        <ul>
          {scores.map(([key, value], index) => (
            <li key={index}>
              <strong>{key}</strong>: {value}/10
            </li>
          ))}
        </ul>
        <br />
        <p>{data.summary}</p>
      </div>
    </div>
  );
}
