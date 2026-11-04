import { DemoCursor } from '../../shared/demo-cursor.js';
import { runDemo } from '../../shared/demo-runner.js';
import { Stage } from '../../shared/stage.js';
import { ClosetScene } from './closet-scene.js';
import { BRAND, DEFAULT_ACTIVE, GARMENTS, LABELS } from './content.js';
import { playDemo, START_POINT } from './demo.js';

const stage = new Stage(document.getElementById('stage'));
const cursor = new DemoCursor(stage);
const scene = new ClosetScene({
  scene: document.getElementById('scene'),
  brand: BRAND,
  garments: GARMENTS,
  labels: LABELS,
  defaultActive: DEFAULT_ACTIVE,
});

runDemo({
  cursor,
  reset: () => {
    scene.reset();
    cursor.jumpTo(START_POINT);
  },
  play: () => playDemo(cursor, scene),
});
