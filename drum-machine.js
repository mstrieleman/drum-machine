var audio = new AudioContext();
var BUTTON_SIZE = 30;

var sounds = {
  beat: 0,
  tracks: [
    createTrack('#3A6EDB', keyboard(audio, 880)),
    createTrack('#3A6EDB', keyboard(audio, 659)),
    createTrack('#3A6EDB', keyboard(audio, 587)),
    createTrack('#3A6EDB', keyboard(audio, 523)),
    createTrack('#3A6EDB', keyboard(audio, 440)),
    createTrack('#3A6EDB', keyboard(audio, 392)),
    createTrack('#F7C505', bassKick(audio)),
    createTrack('#FF0000', snare(audio)),
    createTrack('#00FF1C', hhat(audio))
  ]
};

function smoothEffect(audio, value, startValue, duration) {
  value.setValueAtTime(startValue, audio.currentTime);
  value.exponentialRampToValueAtTime(0.01, audio.currentTime + duration);
}

function createAmplifier(audio, startValue, duration) {
  var amplifier = audio.createGain();

  smoothEffect(audio, amplifier.gain, startValue, duration);
  return amplifier;
}

function keyboard(audio, frequency) {
  return function() {
    var duration = 1;
    var wave = createNoteShape(audio, duration);

    wave.frequency.value = frequency;
    link([wave, createAmplifier(audio, 0.2, duration), audio.destination]);
  };
}

function bassKick(audio) {
  return function() {
    var duration = 1;
    var wave = createDrumShape(audio, duration);

    smoothEffect(audio, wave.frequency, 164.81, duration);
    link([wave, createAmplifier(audio, 0.4, duration), audio.destination]);
  };
}

function snare(audio) {
  return function() {
    var duration = 0.1;
    var wave = createDrumShape(audio, duration);

    smoothEffect(audio, wave.frequency, 880, duration);
    link([wave, createAmplifier(audio, 2.0, duration), audio.destination]);
  };
}

function hhat(audio) {
  return function() {
    var duration = 0.05;
    var wave = createDrumShape(audio, duration);

    smoothEffect(audio, wave.frequency, 15804.26, duration);
    link([wave, createAmplifier(audio, 1.0, duration), audio.destination]);
  };
}

function createDrumShape(audio, duration) {
  var oscillator = audio.createOscillator();

  oscillator.type = 'square';
  oscillator.start(audio.currentTime);
  oscillator.stop(audio.currentTime + duration);
  return oscillator;
}

function createNoteShape(audio, duration) {
  var oscillator = audio.createOscillator();

  oscillator.type = 'sawtooth';
  oscillator.start(audio.currentTime);
  oscillator.stop(audio.currentTime + duration);
  return oscillator;
}

function link(items) {
  for (var i = 0; i < items.length - 1; i++) {
    items[i].connect(items[i + 1]);
  }
}

function createTrack(color, playSound) {
  var beats = [];

  for (var i = 0; i < 16; i++) {
    beats.push(false);
  }
  return { beats: beats, color: color, playSound: playSound };
}

function buttonPosition(column, row) {
  return {
    x: 50 + column * BUTTON_SIZE * 1.5,
    y: 127 + row * BUTTON_SIZE * 1.2
  };
}

function buttonToggle() {
  addEventListener('click', function(event) {
    var mouseLocation = { x: event.offsetX, y: event.offsetY };
    sounds.tracks.forEach(function(track, row) {
      track.beats.forEach(function(on, column) {
        if (isMouseOnButton(mouseLocation, column, row)) {
          track.beats[column] = !on;
        }
      });
    });
  });
}

function isMouseOnButton(mouseLocation, column, row) {
  var button = buttonPosition(column, row);

  return !(
    mouseLocation.x < button.x ||
    mouseLocation.y < button.y ||
    mouseLocation.x > button.x + BUTTON_SIZE ||
    mouseLocation.y > button.y + BUTTON_SIZE
  );
}

setInterval(function() {
  sounds.beat = (sounds.beat + 1) % sounds.tracks[0].beats.length;

  sounds.tracks
    .filter(function(track) {
      return track.beats[sounds.beat];
    })
    .forEach(function(track) {
      track.playSound();
    });
}, 100);

function drawButton(screen, column, row, color) {
  var position = buttonPosition(column, row);

  screen.fillStyle = color;
  screen.fillRect(position.x, position.y, 40, BUTTON_SIZE);
}

function drawTracks(screen, sounds) {
  sounds.tracks.forEach(function(track, row) {
    track.beats.forEach(function(on, column) {
      drawButton(screen, column, row, on ? track.color : 'white');
    });
  });
}

function drawSequencer() {
  var screen = document.getElementById('sequencer').getContext('2d');

  screen.clearRect(0, 0, screen.canvas.width, screen.canvas.height);
  drawTracks(screen, sounds);
  requestAnimationFrame(drawSequencer);
}

function drawOutline() {
  var outlineWidth = 813;
  var outlineHeight = 600;
  var innerWidth = 783;
  var innerHeight = 570;
  var canvas = document.getElementById('outline');
  var ctx = canvas.getContext('2d');

  ctx.fillStyle = '#660000';
  ctx.fillRect(1, 1, outlineWidth, outlineHeight);

  ctx.fillStyle = '#333333';
  ctx.fillRect(15, 15, innerWidth, innerHeight);

  ctx.fillStyle = 'black';
  ctx.fillRect(25, 25, 580, 70);
  ctx.fillRect(615, 25, 175, 70);
  ctx.fillRect(25, 106, 765, 382);
  ctx.fillRect(25, 500, 765, 75);

  ctx.beginPath();
  ctx.lineWidth = '2';
  ctx.strokeStyle = 'white';
  ctx.rect(24, 25, 580, 70);
  ctx.rect(614, 25, 175, 70);
  ctx.rect(24, 106, 765, 382);
  ctx.rect(24, 500, 765, 75);
  ctx.stroke();

  ctx.beginPath();
  ctx.lineWidth = '2';
  ctx.strokeStyle = 'black';
  ctx.rect(0, 0, outlineWidth, outlineHeight);
  ctx.rect(15, 15, innerWidth, innerHeight);
  ctx.stroke();

  ctx.beginPath();
  ctx.lineWidth = '2';
  ctx.strokeStyle = 'white';
  ctx.rect(43, 120, 729, 332);
  ctx.stroke();
}

function drawGuide() {
  var canvas = document.getElementById('overlay');
  var ctx = canvas.getContext('2d');

  ctx.fillStyle = 'rgba(50, 50, 50, 0.40)';
  ctx.fillRect(50, 125, 40, 325);
  ctx.fillRect(230, 125, 40, 325);
  ctx.fillRect(410, 125, 40, 325);
  ctx.fillRect(590, 125, 40, 325);
}

drawSequencer();
drawOutline();
buttonToggle();
drawGuide();
