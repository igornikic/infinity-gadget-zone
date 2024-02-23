import React, { useState, useEffect, useRef } from "react";
import { MicIcon } from "../../icons/NavIcons";

const VoiceSearch = ({ onTranscriptChange }) => {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);

  // Check browser support for SpeechRecognition API
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  const createRecognition = () => {
    // See if feature speech recognition is available
    if (!SpeechRecognition) {
      return;
    }

    // Create SpeechRecognition instance
    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      // Get last result
      const last = event.results.length - 1;
      // Extract transcript from last result
      const text = event.results[last][0].transcript;

      setTranscript(text);
      onTranscriptChange(text);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    return recognition;
  };

  const recognitionRef = useRef(createRecognition());

  const startListening = () => {
    setIsListening(true);
    setTranscript("");
    recognitionRef.current.start();
  };

  const stopListening = () => {
    recognitionRef.current.stop();
    setIsListening(false);
  };

  const modalOverlayRef = useRef(null);

  // Stop listening if click is outside modal
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        modalOverlayRef.current &&
        !modalOverlayRef.current.contains(event.target)
      ) {
        stopListening();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <>
      {isListening ? (
        <>
          {/* Render voice search modal */}
          <div className="voice-modal-overlay">
            <div
              className="voice-modal-content"
              onClick={stopListening}
              ref={modalOverlayRef}
            >
              <MicIcon />
            </div>
          </div>
          <MicIcon />
        </>
      ) : (
        // Render voice search icon
        <div onClick={startListening}>
          <MicIcon />
        </div>
      )}
    </>
  );
};

export default VoiceSearch;
