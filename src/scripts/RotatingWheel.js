export default class RotatingWheel {
  constructor() {
    this.wheel = document.querySelector('[data-rotating-wheel]')

    this.currentAngle = 0;
    this.oldAngle = 0;
    this.lastAngles = [0, 0, 0];
    this.isDragging = false;

    this.positionCallbacks = [];

    this.initListener()
  }

  initListener() {
    this.wheel.addEventListener('mousedown', e => {
      this.onGrab(e.clientX, e.clientY);
    });
    this.wheel.addEventListener('touchstart', e => {
      this.onGrab(e.touches[0].clientX, e.touches[0].clientY);
    });

    window.addEventListener('mousemove', e => {
      if (e.which == 1)
        this.onMove(e.clientX, e.clientY);
      else if (!this.isDragging)
        this.onRelease()
    });

    window.addEventListener('touchmove', e => {
      this.onMove(e.touches[0].clientX, e.touches[0].clientY);
    });

    window.addEventListener('mouseup', () => this.onRelease());
    window.addEventListener('touchend', () => this.onRelease());

    window.addEventListener('resize', () => this.onResize());

    this.calculatePositions()
  }

  calculatePositions() {
    this.wheelWidth = this.wheel.getBoundingClientRect()['width'];
    this.wheelHeight = this.wheel.getBoundingClientRect()['height']
    this.wheelX = this.wheel.getBoundingClientRect()['x'] + this.wheelWidth / 2;
    this.wheelY = this.wheel.getBoundingClientRect()['y'] + this.wheelHeight / 2;
  }

  onGrab(x, y) {
    if (!this.isSpinning) {
      this.isDragging = true;
      this.startAngle = this.calculateAngle(x, y);
    }
  }

  onMove(x, y) {
    if (!this.isDragging)
      return

    this.lastAngles.shift();
    this.lastAngles.push(this.currentAngle);

    let deltaAngle = this.calculateAngle(x, y) - this.startAngle;
    this.currentAngle = deltaAngle + this.oldAngle;

    this.render(this.currentAngle);
  }

  onRelease() {
    if (this.isDragging) {
      this.isDragging = false;
      this.oldAngle = this.currentAngle;

      let speed = this.lastAngles[0] - this.lastAngles[2];
      this.giveMoment(speed);
    }
  }

  onResize() {
    this.calculatePositions()
  }

  calculateAngle(currentX, currentY) {
    let xLength = currentX - this.wheelX;
    let yLength = currentY - this.wheelY;
    let angle = Math.atan2(xLength, yLength) * (180 / Math.PI);
    return 365 - angle;
  }
  giveMoment(speed){
    let maxSpeed = 10;
    if(speed >= maxSpeed)
      speed = maxSpeed;
    else if(speed <= -maxSpeed)
      speed = -maxSpeed;

    if(speed >= 0.1){
      speed -= 0.1;
      window.requestAnimationFrame(this.giveMoment.bind(this, speed));
      this.isSpinning = true;
    }
    else if(speed <= -0.1){
      speed += 0.1;
      window.requestAnimationFrame(this.giveMoment.bind(this, speed));
      this.isSpinning = true;
    }
    else{
      this.isSpinning = false;
    }

    this.oldAngle -= speed;
    this.render(this.oldAngle);
  }

  render(deg){
    this.wheel.style.transform = `rotate(${deg}deg)`;
    for(let callback of this.positionCallbacks){
      callback(deg);
    }
  }

}
