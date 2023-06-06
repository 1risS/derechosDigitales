export class AnimationInterval {
  constructor(func, duration = 1000) {
    this.duration = duration;
    this.func = func;

    this._start = undefined;
    this._previousTimeStamp = undefined;
    this._done = false;

    window.requestAnimationFrame(this.step.bind(this));
  }

  clear() {
    this._done = true;
    this._start = undefined;
  }

  step(timeStamp) {
    if (this._done) return;

    if (this._start === undefined) {
      this._start = timeStamp;
    }
    const elapsed = timeStamp - this._start;

    if (elapsed >= this.duration) {
      this.func(elapsed);
      this._start = undefined;
    }

    window.requestAnimationFrame(this.step.bind(this));
  }
}
