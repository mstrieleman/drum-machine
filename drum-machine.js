var audio = new AudioContext();

function createSineWave(audio, duration) {
  var oscillator = audio.createOscillator();

  oscillator.type = 'sine';
  oscillator.start(audio.currentTime);
  oscillator.stop(audio.currentTime + duration);
  return oscillator;
}

function turnDown(audio, value, startValue, duration) {
  value.setValueAtTime(startValue, audio.currentTime);
  value.exponentialRampToValueAtTime(0.01, audio.currentTime + duration);
}

function createAmplifier(audio, startValue, duration) {
  var amplifier = audio.createGain();

  turnDown(audio, amplifier.gain, startValue, duration);
  return amplifier;
}

function link(items) {
  for (var i = 0; i < items.length - 1; i++) {
    items[i].connect(items[i + 1]);
  }
}

function note(audio, frequency) {
  return function() {
    var duration = 1;
    var sineWave = createSineWave(audio, duration);

    sineWave.frequency.value = frequency;
    link([sineWave, createAmplifier(audio, 0.2, duration), audio.destination]);
  };
}

note(audio, 444)();
