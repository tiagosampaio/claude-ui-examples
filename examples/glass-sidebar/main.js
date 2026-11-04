import { DemoCursor } from '../../shared/demo-cursor.js';
import { runDemo } from '../../shared/demo-runner.js';
import { Stage } from '../../shared/stage.js';
import { CONTENT, DEFAULT_ACTIVE_ROW } from './content.js';
import { playDemo, START_POINT } from './demo.js';
import { Sidebar } from './sidebar.js';

const stage = new Stage(document.getElementById('stage'));
const cursor = new DemoCursor(stage);
const sidebar = new Sidebar({
  root: document.getElementById('sidebar'),
  scene: document.getElementById('scene'),
  stage,
  content: CONTENT,
  defaultActive: DEFAULT_ACTIVE_ROW,
});

runDemo({
  cursor,
  reset: () => {
    sidebar.reset();
    cursor.jumpTo(START_POINT);
  },
  play: () => playDemo(cursor, sidebar),
});
