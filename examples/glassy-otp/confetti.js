import { createRandom } from '../../shared/seeded-random.js';

const PARTICLE_COUNT = 96;
const SEED = 11;
const MIN_SPEED = 260;
const MAX_SPEED = 1900;
const DRAG = 4.4;
const FLOAT_SPEED = 14;
const MIN_SIZE = 6;
const MAX_SIZE = 17;
const MIN_LIFE = 1.5;
const FADE_SHARE = 0.45;
const SHAPES = ['circle', 'square', 'diamond'];
const COLORS = ['#5dea8f', '#35c96f', '#a8f5c4', '#7cc8ff', '#cfeaff'];

/** The longest any particle lives, in seconds. */
export const MAX_LIFE = 3;

/**
 * Particles that burst out fast, slow down hard and then float while they fade.
 * It holds no DOM and is reseeded on every burst, so every take is identical.
 */
export class ConfettiField {
  #particles = [];

  /** @returns {object[]} The particles still alive. */
  get particles() {
    return this.#particles;
  }

  /**
   * Replaces any current particles with a new burst.
   *
   * @param {{x: number, y: number}} origin Where they start.
   * @returns {void}
   */
  burst(origin) {
    const random = createRandom(SEED);

    this.#particles = Array.from({ length: PARTICLE_COUNT }, () => {
      const angle = random() * Math.PI * 2;
      const speed = MIN_SPEED + random() * (MAX_SPEED - MIN_SPEED);
      const life = MIN_LIFE + random() * (MAX_LIFE - MIN_LIFE);

      return {
        x: origin.x,
        y: origin.y,
        speedX: Math.cos(angle) * speed,
        speedY: Math.sin(angle) * speed,
        floatY: -FLOAT_SPEED * random(),
        size: MIN_SIZE + random() * (MAX_SIZE - MIN_SIZE),
        shape: SHAPES[Math.floor(random() * SHAPES.length)],
        color: COLORS[Math.floor(random() * COLORS.length)],
        spin: (random() - 0.5) * 5,
        rotation: random() * Math.PI,
        age: 0,
        life,
        alpha: 1,
      };
    });
  }

  /**
   * Advances every particle and drops the ones that have faded out.
   *
   * @param {number} dt Elapsed time in seconds.
   * @returns {void}
   */
  step(dt) {
    const friction = Math.exp(-DRAG * dt);

    for (const particle of this.#particles) {
      particle.speedX *= friction;
      particle.speedY *= friction;
      particle.x += particle.speedX * dt;
      particle.y += (particle.speedY + particle.floatY) * dt;
      particle.rotation += particle.spin * dt;
      particle.age += dt;
      particle.alpha = Math.min((1 - particle.age / particle.life) / FADE_SHARE, 1);
    }

    this.#particles = this.#particles.filter((particle) => particle.age < particle.life);
  }

  /**
   * Removes every particle.
   *
   * @returns {void}
   */
  clear() {
    this.#particles = [];
  }
}

/**
 * Draws a ConfettiField onto a canvas.
 */
export class ConfettiCanvas {
  #context;
  #canvas;

  /**
   * @param {HTMLCanvasElement} canvas The canvas to draw on.
   */
  constructor(canvas) {
    this.#canvas = canvas;
    this.#context = canvas.getContext('2d');
  }

  /**
   * Redraws the canvas.
   *
   * @param {object[]} particles The particles to draw.
   * @returns {void}
   */
  draw(particles) {
    const context = this.#context;

    context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);

    for (const particle of particles) {
      context.save();
      context.globalAlpha = particle.alpha;
      context.fillStyle = particle.color;
      context.translate(particle.x, particle.y);
      context.rotate(particle.shape === 'diamond' ? Math.PI / 4 : particle.rotation);
      this.#drawShape(particle);
      context.restore();
    }
  }

  /**
   * @param {{shape: string, size: number}} particle The particle to draw.
   * @returns {void}
   */
  #drawShape({ shape, size }) {
    const context = this.#context;

    if (shape === 'circle') {
      context.beginPath();
      context.arc(0, 0, size / 2, 0, Math.PI * 2);
      context.fill();
    } else {
      context.fillRect(-size / 2, -size / 2, size, size);
    }
  }
}
