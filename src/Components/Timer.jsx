import "../Css/Timer.css";
import { useState, useEffect } from "react";

export default function Timer({onDataSend }) {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  useEffect(()=>{
    let startTime=localStorage.getItem("interviewStartTime");
    if(!startTime){
      startTime=Date.now();
      localStorage.setItem("interviewStartTime",startTime);
    }
    const interval=setInterval(()=>{
      const elapsed=Date.now()-parseInt(startTime,10);
      setTime(elapsed);
    },1000);
  })
 
  useEffect(()=>{
    const formattedTime = formatTime(time);
    onDataSend(formattedTime);
  },[time,onDataSend]);

  
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor((totalSeconds / 3600));
    const minutes = Math.floor((totalSeconds%3600) / 60);
    const seconds = totalSeconds%60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2, "0")}`;
  };
  return (
    <div id="stopwatch" >
      <div id="time">{formatTime(time)}</div>
    </div>
  );
}
