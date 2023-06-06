window.global ||= window;

import './style.css'
import Hydra from 'hydra-synth'
import { WebMidi } from 'webmidi'
import './style.css'
import { AnimationInterval } from './interval';
import preguntas from './preguntas'
import fonts from './fonts'

const OPACITY_CC = 7;               // opacity
const QUESTION_NUMBER_CC = 8;       // amount of questions (1-8)
const FONT_SIZE_CC = 9;             // font size
const INTERVAL_FAMILY_CC = 10;      // interval font family (8 fonts)
const INTERVAL_QUESTIONS_CC = 11;   // interval for random questions
const INTERVAL_CASING_CC = 12;      // interval for random casing
const INTERVAL_POSITION_CC = 13;    // interval for random position
const INTERVAL_COLOR_CC = 14;       // interval for random color

let questionAnim, familyAnim;

function init(){
  enableMIDI();

  initHydra();

  setError("");

  // window.addEventListener('resize', onWindowResize);
  window.addEventListener("message", handleFlokMessages, false);

  const texto = document.getElementById("texto")

  questionAnim = new AnimationInterval(() => {
    texto.innerHTML = getRandomElement()
  }, 1000);

  familyAnim = new AnimationInterval(() => {
    texto.style.fontFamily = fonts[Math.floor(Math.random() * fonts.length)]
  }, 1000);
}

function getRandomElement() {
  const randomIndex = Math.floor(Math.random() * preguntas.length);
  return preguntas[randomIndex];
}

function initHydra() {
  let canvas = document.getElementById("hydra");
  canvas.width = 2560;
  canvas.height = 1600;

  const _hydra = new Hydra({ canvas: canvas, detectAudio: false });

  // output threejs canvas to hydra canvas by default
  noise().out()
}

function enableMIDI() {
  WebMidi.enable(function (err) {
    if (err) {
      console.log("WebMidi could not be enabled.", err);
    } else {
      console.log("WebMidi enabled!");
      console.log("Inputs:", WebMidi.inputs);
      subscribeToAllMIDIInputs();
    }
  });
}

function rescale(v, min, max) {
  return v * (max - min) + min;
}

function subscribeToAllMIDIInputs() {

  const texto = document.getElementById("texto")

  const randomRgbColor = () => {
    let r = Math.floor(Math.random() * 256); // Random between 0-255
    let g = Math.floor(Math.random() * 256); // Random between 0-255
    let b = Math.floor(Math.random() * 256); // Random between 0-255
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  };

  WebMidi.inputs.forEach(input => {
    input.addListener("controlchange", "all", function (e) {
      const ccn = e.controller.number;
      const ccv = e.value;
      // change cnn # if reasigning knows or faders

      if (ccn === OPACITY_CC) {
        texto.style.opacity = rescale(ccv, 0, 1).toString();
      }

      if (ccn === FONT_SIZE_CC) { 
        texto.style.fontSize = `${rescale(ccv, 20, 100).toString()}px`;
      }

      if (ccn === INTERVAL_FAMILY_CC) { 
        familyAnim.duration = rescale(ccv, 100, 10000);
      }

      if (ccn === INTERVAL_QUESTIONS_CC) {
        questionAnim.duration = rescale(ccv, 100, 10000);
      }

      // if (ccn === 2) { 
      //   // console.log( rescale(ccv, 20, 100).toString())
      //   texto.style.color = randomRgbColor();
      //   }
      
      // if (ccn === 17) { 
      //   // console.log( rescale(ccv, 20, 100).toString())
      //   interval = 10000;
      //   }

     // console.debug("MIDI CC", ccn, "=", ccv);
    });


  });
}

function handleFlokMessages(event) {
  const msg = event.data;
  if (msg.cmd == "evaluateCode" && msg.args.target == "hydra") {
    const body = msg.args.body;
    console.log("Evaluate hydra:", body);
    try {
      setError("");
      eval(body);
    } catch (err) {
      setError(err);
    }
  }
}

function setError(err) {
  const el = document.getElementById("error");
  if (err) {
    console.log("Error:", err);
    el.innerHTML = err;
    el.classList.remove("hide");
  } else {
    el.innerHTML = "";
    el.classList.add("hide");
  }
}

init()
