import { DemoCursor } from '../../shared/demo-cursor.js';
import { runDemo } from '../../shared/demo-runner.js';
import { Stage } from '../../shared/stage.js';
import { CONTENT } from './content.js';
import { playDemo, START_POINT } from './demo.js';
import { LampScene } from './lamp-scene.js';

const stage = new Stage(document.getElementById('stage'));
const cursor = new DemoCursor(stage);
const scene = new LampScene({
  scene: document.getElementById('scene'),
  stage,
  content: CONTENT,
});

runDemo({
  cursor,
  reset: () => {
    scene.reset();
    cursor.jumpTo(START_POINT);
  },
  play: () => playDemo(cursor, scene),
});
