import React, { useEffect } from "react";
import { useState } from "react";
import "../Css/Interview.css";
import { useCallback } from "react";
import img from "../assets/booster.png";
import img2 from "../assets/mic.png";
import Editor from "@monaco-editor/react";
import Timer from "../Components/Timer";
import { useNavigate } from "react-router-dom";
import { SaveSummary } from "../Components/SaveSummary";

export default function Interview() {
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("Java");
  const [chats, setChats] = useState([
    {
      sender: "ai",
      text: "Hello !\t I am Danveer . Shall we start the interview?",
    },
  ]);
  const [input, setInput] = useState("");
  const [editorLogic, setEditorLogic] = useState(``);
  const [markedLogic, setMarkedLogic] = useState(``);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [time, setTime] = useState(0);
  const [recognitionRef, setRecognitionRef] = useState(null);
  const Navigate = useNavigate();
  const [back,setBack]=useState(false);

  const handleTime = (time) => {
    setTime(time);
  };

useEffect(() => {
  const handlePopState = (event) => {
    if (!back) {
      window.history.pushState(null, null, window.location.href);
      alert("Back navigation is disabled during the interview.");
    }
  };

  window.history.pushState(null, null, window.location.href);
  window.addEventListener("popstate", handlePopState);

  return () => {
    window.removeEventListener("popstate", handlePopState);
  };
}, [back]);


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
        role: msg.sender === "ai" ? "model" : "user",
        parts: [{ text: msg.text }],
      }));
      const responsePara = await fetch(
        `http://localhost:8080/api/geminiAI/ask`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            input: input,
            history: historyMap,
            base: "base",
          }),
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
    } finally {
      setLoading(false);
    }
  }, [input, chats, markedLogic]);

  const element = document.getElementById("chat-message");
  useEffect(() => {
    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  }, [chats]);

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

  const speak = (response) => {
    const synthesis = window.speechSynthesis;

    const speakNow = () => {
      const voices = synthesis.getVoices();
      const selectedVoice = voices.find((v) => v.lang === "en-IN") || voices[0];

      if (!selectedVoice) return;

      const utterance = new SpeechSynthesisUtterance(
        makeVoiceFriendly(response)
      );
      utterance.rate = 0.95;
      utterance.pitch = 1.2;
      utterance.volume = 1;
      utterance.voice = selectedVoice;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);

      synthesis.speak(utterance);
    };

    if (synthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        speakNow();
      };
    } else {
      speakNow();
    }
  };

  const makeVoiceFriendly = (text) => {
    if (!text) return "";

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
      setIsRecording(true);
    };

    recognition.onerror = (event) => {
      console.error("❌ Speech recognition error:", event.error);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.onresult = (e) => {
      const voice = e.results[e.resultIndex][0].transcript;
      if (voice) {
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

  const summarizeLogic = useCallback(async () => {
    if (chats.length === 1) return;
    setLoading(true);
    try {
      const historyMap = chats.map((msg) => ({
        role: msg.sender === "ai" ? "model" : "user",
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
      
      localStorage.removeItem("interviewStartTime");
      Navigate("/Summary", { state: { Summary: data, duration: time } });
    } catch (error) {
      return error.message;
    } finally {
      setLoading(false);
    }
  }, [chats]);
  return (
    <div className="interview-container">
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
          <div className="Timer-container">
            <div className="Timer">
              <Timer onDataSend={handleTime} />
            </div>

            <div
              className="exit"
              
            >
              <p onClick={() => {
                localStorage.removeItem("interviewStartTime");
                setBack(true);
                Navigate("/");
              }}>❌</p>
            </div>
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
                  setBack(true);
                }}
              >
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
                  if (e.key === "Enter" && !loading && !isSpeaking)
                    fetchModelResponse();
                }}
                placeholder={
                  isSpeaking
                    ? "🔊 Listening to response..."
                    : "Type your message..."
                }
              />
              <img
                src={img2}
                className={`mic-icon ${isRecording ? "mic-listening" : ""}`}
                alt="mic"
                onClick={toggleMic}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
