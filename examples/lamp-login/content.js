/**
 * The words on the login card and what the demo types. Edit this file to re-skin
 * the example for a different video without touching the behaviour.
 */
export const CONTENT = {
  eyebrow: 'Member access',
  heading: 'Good evening.',
  headingAccent: 'Come on in.',
  email: { id: 'email', label: 'Email', placeholder: 'you@lantern.app', demoValue: 'sam@lantern.app' },
  password: { id: 'password', label: 'Password', placeholder: 'Your password', demoValue: 'evening7' },
  remember: 'Keep me signed in',
  forgot: 'Forgot it?',
  submit: 'Sign in',
  submitDone: 'You’re in ✓',
  divider: 'or',
  alternatives: ['Passkey', 'Magic link'],
  footer: 'New here? <span class="card__link">Request an invite</span>',
};

/** Where the cord hangs from and its length, in scene pixels. */
export const CORD = {
  anchor: { x: 300, y: 408 },
  length: 240,
};

/** The scene's offset from the top of the stage. Matches styles.css. */
export const SCENE_TOP = 260;

/** How far below its resting point the cord must be pulled to switch the lamp. */
export const PULL_THRESHOLD = 90;
