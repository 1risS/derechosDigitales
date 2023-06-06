window.global ||= window;

import './style.css'
import Hydra from 'hydra-synth'
import { WebMidi } from 'webmidi'
import './style.css'
import preguntas from './preguntas'

function init(){
  enableMIDI();

  initHydra();

  setError("");

  // window.addEventListener('resize', onWindowResize);
  window.addEventListener("message", handleFlokMessages, false);

  addTxt()

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

let interval = 1000;

function addTxt () {

  const texto = document.getElementById("texto")

  setInterval(()=> { 
    texto.innerHTML = getRandomElement()
  }, interval)

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


      if (ccn === 16) { 
        // console.log( rescale(ccv, 20, 100).toString())
        texto.style.fontSize = `${rescale(ccv, 20, 100).toString()}px`;
        }

      if (ccn === 32) { 
        // console.log( rescale(ccv, 20, 100).toString())
        texto.style.color = randomRgbColor();
        }
      
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