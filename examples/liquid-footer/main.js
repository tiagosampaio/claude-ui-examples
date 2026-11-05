import { DemoCursor } from '../../shared/demo-cursor.js';
import { runDemo } from '../../shared/demo-runner.js';
import { Stage } from '../../shared/stage.js';
import { CONTENT } from './content.js';
import { playDemo, START_POINT } from './demo.js';
import { LiquidScene } from './liquid-scene.js';
import { PALETTES, roomArt } from './room-art.js';

const stage = new Stage(document.getElementById('stage'));
const cursor = new DemoCursor(stage);
const scene = new LiquidScene({
  scene: document.getElementById('scene'),
  content: CONTENT,
  rooms: { day: roomArt(PALETTES.day), night: roomArt(PALETTES.night) },
});

// In ?manual mode there's no script to pour the glass, so runDemo returns early.
runDemo({
  cursor,
  reset: () => {
    scene.reset();
    cursor.jumpTo(START_POINT);
  },
  play: () => playDemo(cursor, scene),
}).then(() => scene.pour());
