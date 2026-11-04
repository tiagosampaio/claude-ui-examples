/** Off to the side of the panel, where each take starts and ends. */
export const START_POINT = { x: 840, y: 1180 };

/**
 * The take, about 15 seconds. It ends exactly where it began (collapsed, first
 * row selected, cursor at START_POINT) so the video loops with no visible cut.
 *
 * Edit the order or durations (in milliseconds) here to re-time the video.
 *
 * @param {import('../../shared/demo-cursor.js').DemoCursor} cursor The cursor.
 * @param {import('./sidebar.js').Sidebar} sidebar The sidebar.
 * @returns {Promise<void>} Resolves when the take ends.
 */
export async function playDemo(cursor, sidebar) {
  await cursor.wait(250);

  // Run along the collapsed icons to show off the dock effect.
  await cursor.moveTo(sidebar.item('search'), 650);
  await cursor.moveTo(sidebar.item('inbox'), 800, 10);
  await cursor.wait(180);
  await cursor.moveTo(sidebar.item('wallet'), 500, 10);
  await cursor.wait(160);

  // Open the panel.
  await cursor.moveTo(sidebar.item('toggle'), 480);
  await cursor.wait(120);
  await cursor.click();
  await cursor.wait(760);

  // Throw the glass pill around.
  await cursor.moveTo(sidebar.item('activity'), 420);
  await cursor.moveTo(sidebar.item('wallet'), 300, 10);
  await cursor.click();
  await cursor.wait(480);
  await cursor.moveTo(sidebar.item('calendar'), 300, 10);
  await cursor.click();
  await cursor.wait(480);
  await cursor.moveTo(sidebar.item('inbox'), 360, 10);
  await cursor.click();
  await cursor.wait(480);

  // Fold and unfold the project tree.
  await cursor.moveTo(sidebar.item('projects'), 300, 10);
  await cursor.click();
  await cursor.wait(520);

  // Folding shortens the panel, which re-centers and moves the row, so re-aim.
  await cursor.moveTo(sidebar.item('projects'), 260, 10);
  await cursor.click();
  await cursor.wait(520);

  // Night mode is the big visual moment: the whole room dims behind the glass.
  await cursor.moveTo(sidebar.item('night'), 520);
  await cursor.click();
  await cursor.wait(1100);
  await cursor.click();
  await cursor.wait(700);

  // Back to the first frame for the loop.
  await cursor.moveTo(sidebar.item('overview'), 620);
  await cursor.click();
  await cursor.wait(420);
  await cursor.moveTo(sidebar.item('toggle'), 480);
  await cursor.wait(120);
  await cursor.click();
  await cursor.wait(620);
  await cursor.moveTo(START_POINT, 560);
}
