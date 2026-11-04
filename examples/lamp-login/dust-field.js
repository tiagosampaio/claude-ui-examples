import { createRandom } from '../../shared/seeded-random.js';

const PARTICLE_COUNT = 80;
const MIN_RADIUS = 1;
const MAX_RADIUS = 3.4;
const MAX_SPEED = 16;
const TWINKLE_SPEED = 1.2;
const DUST_COLOR = '255, 224, 170';

/**
 * Dust drifting through the lamplight. It always runs, and the CSS fades the
 * canvas with the light, so the dust is already in motion when the lamp comes on.
 */
export class DustField {
  #context;
  #width;
  #height;
  #particles;

  /**
   * @param {HTMLCanvasElement} canvas The canvas to draw on.
   */
  constructor(canvas) {
    const random = createRandom(7);

    this.#context = canvas.getContext('2d');
    this.#width = canvas.width;
    this.#height = canvas.height;
    this.#particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: random() * this.#width,
      y: random() * this.#height,
      radius: MIN_RADIUS + random() * (MAX_RADIUS - MIN_RADIUS),
      speedX: (random() - 0.5) * MAX_SPEED,
      speedY: (random() - 0.65) * MAX_SPEED,
      phase: random() * Math.PI * 2,
    }));
  }

  /**
   * Moves and redraws every particle, wrapping them around the edges.
   *
   * @param {number} dt Elapsed time in seconds.
   * @returns {void}
   */
  update(dt) {
    this.#context.clearRect(0, 0, this.#width, this.#height);

    for (const particle of this.#particles) {
      particle.x = (particle.x + particle.speedX * dt + this.#width) % this.#width;
      particle.y = (particle.y + particle.speedY * dt + this.#height) % this.#height;
      particle.phase += TWINKLE_SPEED * dt;

      const alpha = 0.3 + 0.5 * Math.abs(Math.sin(particle.phase));

      this.#context.fillStyle = `rgba(${DUST_COLOR}, ${alpha.toFixed(3)})`;
      this.#context.beginPath();
      this.#context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      this.#context.fill();
    }
  }
}
