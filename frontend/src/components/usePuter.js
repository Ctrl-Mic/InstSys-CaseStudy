import { useEffect, useRef } from "react";

export function usePuter() {
  const puterLoadedRef = useRef(false);
  const audioCtxRef = useRef(null);

  useEffect(() => {
    if (!puterLoadedRef.current) {
      const script = document.createElement("script");
      script.src = "https://js.puter.com/v2/";
      script.async = true;
      script.onload = () => {
        console.log("Puter.js loaded");
        puterLoadedRef.current = true;
      };
      document.body.appendChild(script);
    }

    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
  }, []);

  const speak = async (text) => {
    if (!window.puter || !window.puter.ai) return null;

    try {
      // Request TTS from Puter.js
      const audio = await window.puter.ai.txt2speech(text, { voice: "Joey" });

      const audioCtx = audioCtxRef.current;

      // Resume AudioContext if suspended (browser autoplay restriction)
      if (audioCtx.state === "suspended") await audioCtx.resume();

      // Connect audio to analyser
      const source = audioCtx.createMediaElementSource(audio);
      const analyser = audioCtx.createAnalyser();
      source.connect(analyser);
      analyser.connect(audioCtx.destination);

      // Play the audio
      await audio.play(); // await ensures it triggers a user gesture

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      return { analyser, dataArray };
    } catch (err) {
      console.error("Puter.js TTS error:", err);
      return null;
    }
  };

  return speak;
}
