import React, { useEffect } from "react";
import { useState } from "react";
import "../Css/Interview.css";
import { useCallback } from "react";
import img from "../assets/booster.png";
import img2 from "../assets/mic.png";
// import VoiceSynthesis from "../Components/VoiceSynthesis";
import Editor from "@monaco-editor/react";
import Timer from "../Components/Timer";
import { useNavigate } from "react-router-dom";

export default function Interview() {
  const [loading, setLoading] = useState(false);
  const [language,setLanguage]=useState("Java");
  const [chats, setChats] = useState([
    {
      sender: "ai",
      text: "Hello !\t I am Danveer . Shall we start the interview?",
    },
  ]);
  const [input, setInput] = useState("");
  const [editorLogic,setEditorLogic] = useState(``);
  const [markedLogic, setMarkedLogic] = useState(``);
  const [audio,setAudio] =useState(``);
  const [isRecording, setIsRecording] = useState(false);
  const [recognitionRef, setRecognitionRef] = useState(null);
    const Navigate =useNavigate();

  const fetchModelResponse = useCallback(async () => {
    if (!input.trim()) return;
    const combined = markedLogic
      ? `${input}\n\n\`\`\`\n${markedLogic}\n\`\`\``
      : input;

    const userMessage = { sender: "user", text: combined };

    setChats((msgs) => [...msgs, userMessage]);
    setInput("");
    setMarkedLogic(``);
    setLoading(true);
    try {
        const historyMap = [...chats.slice(-10), userMessage].map((msg) => ({
          role: msg.sender==="ai"?"model":"user",
          parts: [{ text: msg.text }],
        }));
      const responsePara = await fetch(
        `http://localhost:8080/api/geminiAI/ask`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ input: input, history: historyMap ,base:"base"}),
        }
      );

      if (!responsePara.ok) {
        throw new Error(`Error : ${responsePara.status}`);
      }
      const data = await responsePara.text();
      speak(data);
      setChats((msgs) => [...msgs, { sender: "ai", text: data }]);
    } catch (error) {
      return error.message;
    }
    finally{
      setLoading(false);
    }
  }, [input, chats,markedLogic]);

  const element = document.getElementById("chat-message");
  useEffect(()=>{
    if(element){
      element.scrollTop=element.scrollHeight;
    }
  },[chats]);

 

  const handleEditorMount = (editor, monaco) => {
    monaco.editor.defineTheme("custom-dark", {
      base: "hc-light",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#011522",
        "editor.foreground": "#ffffff",
      },
    });

    monaco.editor.setTheme("custom-dark");
  };



  const speak = (response) => {             // stop if new req arrive
    const synthesis = window.speechSynthesis;
    const voices = synthesis.getVoices();
    const selectedVoice = voices.find((v) => v.lang === "en-IN") || voices[0];

    if (!selectedVoice) return;

    const utterance = new SpeechSynthesisUtterance(
      makeVoiceFriendly(response)
    );
    utterance.speed = 0.95; // Adjust speed as needed
    utterance.pitch = 1.2; // Adjust pitch as needed
    utterance.volume=1;
    utterance.voice = selectedVoice;
    synthesis.speak(utterance);
  };

  const makeVoiceFriendly = (text) => {
    if (!text) return "";

    // Replace tree-like symbols and code-related chars
    return text
      .replace(/\*/g, "asterisk")
      .replace(/ -/g, "minus")
      .replace(/\\/g, "backslash")
      .replace(/\//g, "slash")
      .replace(/\n/g, ". ")
      .replace(/[\[\]{}]/g, "")
      .replace(/_/g, "underscore")
      .replace(/`/g, "")
      .replace(/\s{2,}/g, " ")
      .replace(/[\|]/g, "pipe")
      .replace(/ +(?=\W)/g, "") // Remove extra spaces before punctuation
      .trim();
  };
  
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error("Speech recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = true;

    recognition.onstart = () => {
      console.log("🎙️ Voice recognition started");
      setIsRecording(true);
    };

    recognition.onerror = (event) => {
      console.error("❌ Speech recognition error:", event.error);
    };

    recognition.onend = () => {
      console.log("🛑 Voice recognition ended");
      setIsRecording(false);
    };

    recognition.onresult = (e) => {
      const voice = e.results[e.resultIndex][0].transcript;
      if (voice) {
        console.log("🎧 Voice Input Detected:", voice);
        setInput(voice);
        fetchModelResponse();
      }
    };

    setRecognitionRef(recognition);

    return () => {
      recognition.stop();
      recognition.onresult = null;
      recognition.onend = null;
    };
  }, []);
  

  const toggleMic = () => {
    if (!recognitionRef) return;

    if (isRecording) {
      recognitionRef.stop();
    } else {
      recognitionRef.start();
    }
  };
  
  const summarizeLogic= useCallback(async () => {
    if(chats.length===1) return;

  
    console.log("Summarizing logic...");
    setLoading(true);
    try {
        const historyMap =chats.map((msg) => ({
          role: msg.sender==="ai"?"model":"user",
          parts: [{ text: msg.text }],
        }));
      const responsePara = await fetch(
        `http://localhost:8080/api/geminiAI/summary`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            input:
              "Summarize the entire interview, highlighting the key discussion points, and provide specific areas where I can improve.",
            history: historyMap,
            base: "base",
          }),
        }
      );
      if (!responsePara.ok) {
        throw new Error(`Error : ${responsePara.status}`);
      }
      const data = await responsePara.text();
      console.log(data);
      Navigate("/Summary", { state: { Summary: data } });
    } catch (error) {
      return error.message;
    }
    finally{
      setLoading(false);
    }
  }, [chats]);
  return (
    <div className="interview-container">
      <div className="topBar">
        <p style={{ color: "lightsteelblue" }}>Q T I X</p>
      </div>
      <div className="content">
        <div className="content-top">
          <div className="tools">
            <div className="circle">
              <span className="red box"></span>
            </div>
            <div className="circle">
              <span className="yellow box"></span>
            </div>
            <div className="circle">
              <span className="green box"></span>
            </div>
          </div>
          <div className="Timer">
            <Timer />
          </div>
        </div>

        <div className="plane">
          <div className="left-plane">
            <div className="text-area">
              <Editor
                className="input-area"
                height="90%"
                language="plaintext"
                theme="custom-dark"
                defaultValue="Enter logic here !!!"
                value={editorLogic}
                onChange={(value) => setEditorLogic(value)}
                onMount={handleEditorMount}
                options={{
                  fontSize: 16,
                  fontFamily: "Roboto Mono",
                  lineHeight: 24,
                  minimap: { enabled: false },
                  wordWrap: "on",
                  scrollBeyondLastLine: true,
                  cursorStyle: "line",
                  selectionHighlight: false,
                  tabSize: 3,
                  padding: { top: 10, bottom: 10 },
                }}
              />
            </div>
            <div className="button-area">
              <button
                disabled={loading}
                onClick={() => {
                  setMarkedLogic(editorLogic);
                }}
              >
                {loading ? "Loading" : "Mark for review"}
              </button>
              <button
                onClick={() => {
                  summarizeLogic();
                }}
              >
                {" "}
                {loading ? "Loading" : "End & Summarize"}
              </button>
            </div>
          </div>
          <div className="chat-box">
            <div className="chat-message" id="chat-message">
              {chats.map((chat, index) => (
                <div key={index} className={`message ${chat.sender}`}>
                  {chat.text.includes("```") ? (
                    <pre className="code-block">
                      <code>{chat.text.replace(/```/g, "")}</code>
                    </pre>
                  ) : (
                    <span>{chat.text}</span>
                  )}
                </div>
              ))}
            </div>
            <div className="input-area">
              <input
                value={input}
                type="text"
                onChange={(e) => {
                  setInput(e.target.value);
                  e.preventDefault();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !loading) fetchModelResponse();
                }}
                placeholder="Type your message..."
                disabled={loading}
              />
              <img
                src={img2}
                className={`mic-icon ${isRecording ? "mic-listening" : ""}`}
                alt="mic"
                onClick={toggleMic}
              />
            </div>
            {/* <VoiceSynthesis/> */}
          </div>
        </div>
      </div>
    </div>
  );
}
