import React from 'react';
import './App.css';

const intervalX = [10, 90];
const intervalY = [10, 60];

const isTargetHit = (circleX, circleY, rad, x, y) => ((x - circleX) * (x - circleX)
  + (y - circleY) * (y - circleY) <= rad * rad);

const randomIntFromInterval = ([min, max]) => (
  Math.floor(Math.random() * (max - min + 1) + min) / 100
);

const getRandomPosition = () => ({
  x: randomIntFromInterval(intervalX),
  y: randomIntFromInterval(intervalY),
});

const absolutePosition = (landmark) => {
  const totalWidth = window.handsfree.debug.$canvas.pose.clientWidth;
  const totalHeight = window.handsfree.debug.$canvas.pose.clientHeight;

  return {
    left: (1 - landmark.x) * totalWidth,
    top: landmark.y * totalHeight,
  };
};

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      handle: {
        leftHand: { x: 0, y: 0, glow: false },
        rightHand: { x: 0, y: 0, glow: false },
        leftFoot: { x: 0, y: 0, glow: false },
        rightFoot: { x: 0, y: 0, glow: false },
        head: { x: 0, y: 0, glow: false },
      },
      hits: 0,
      falls: 0,
      time: 120,
      targets: [
        { x: 0.1, y: 0, speed: 0.02 },
        { x: 0.2, y: 0.1, speed: 0.03 },
        { x: 0.4, y: 0.2, speed: 0.02 },
        { x: 0.5, y: 0.3, speed: 0.03 },
        { x: 0.9, y: 0.4, speed: 0.02 },
      ],
    };
  }

  hitTarget = (landmark) => {
    const { hits, targets } = this.state;
    const tolerance = 0.07;

    targets.forEach((target, i) => {
      if (isTargetHit(target.x, target.y, tolerance, landmark.x, landmark.y)) {
        const newTarget = getRandomPosition();

        targets[i].x = newTarget.x;
        targets[i].y = 0;

        this.setState({ targets, hits: hits + 1 });
      }
    });
  }

  stopHandsfree = () => {
    window.handsfree.stop();
    if (this.interval) clearInterval(this.interval);
    if (this.falling) clearInterval(this.falling);
  }

  startHandsfree = () => {
    let { time, targets, falls } = this.state;

    window.handsfree.start();

    window.handsfree.on('modelReady', () => {
      this.falling = setInterval(() => {
        targets = targets.map((target) => {
          if (target.y >= 1) falls += 1;

          target.y = target.y > 1 ? 0 : (target.y + target.speed);
          return target;
        });

        this.setState({ targets, falls });
      }, 100);

      this.interval = setInterval(() => {
        time -= 1;
        this.setState({ time }, () => {
          if (time <= 0) {
            console.log('time is up');
            this.stopHandsfree();
          }
        });
      }, 1000);
    });

    window.handsfree.on('data', (data) => {
      if (!data.pose || !data.pose.poseLandmarks) return;

      const leftHand = data.pose.poseLandmarks[19];
      const rightHand = data.pose.poseLandmarks[20];
      const leftFoot = data.pose.poseLandmarks[31];
      const rightFoot = data.pose.poseLandmarks[32];
      const head = data.pose.poseLandmarks[0];

      this.setState({
        handle: {
          leftHand,
          rightHand,
          leftFoot,
          rightFoot,
          head,
        },
      });

      this.hitTarget(leftHand);
      this.hitTarget(rightHand);
    });
  }

  render() {
    const {
      handle, targets, hits, falls, time,
    } = this.state;

    return (
      <div className="App">
        <div className="controls">
          <div className="score">
            {`Score: ${hits - falls}`}
          </div>
          <div className="button">
            <button type="button" className="handsfree-show-when-stopped handsfree-hide-when-loading" onClick={this.startHandsfree}>Start</button>
            <button type="button" className="handsfree-show-when-loading">Take 3 steps back and wait...</button>
            <button type="button" className="handsfree-show-when-started" onClick={this.stopHandsfree}>Stop</button>
          </div>
          <div className="time">
            {`Time: ${time}`}
          </div>
        </div>
        <div
          style={{
            width: window.handsfree.debug.$canvas.pose.clientWidth,
            height: window.handsfree.debug.$canvas.pose.clientHeight,
            zIndex: 1,
            left: 0,
            position: 'absolute',
            overflow: 'hidden',
          }}
        >
          <div
            className="handle"
            style={{
              ...absolutePosition(handle.leftHand),
              border: '10px solid cyan',
            }}
          />

          <div
            className="handle"
            style={{
              ...absolutePosition(handle.rightHand),
              border: '10px solid cyan',
            }}
          />

          <div
            className="handle head"
            style={{
              ...absolutePosition(handle.head),
              border: '10px solid cyan',
            }}
          />

          {targets.map((target, i) => (
            <div
              key={i}
              className="target left hand"
              style={{
                ...absolutePosition(target),
                backgroundColor: target.speed === 0.02 ? 'yellow' : 'cyan',
              }}
            />
          ))}
        </div>

      </div>
    );
  }
}
