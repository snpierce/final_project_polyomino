import { Component } from 'react';

type CountDownProps = {
  startTime: number;
};

type CountDownState = {
  time: number;
};

class CountDown extends Component<CountDownProps, CountDownState> {
  private time?: number;
  private stopTime: number;

  constructor(props: CountDownProps) {
    super(props);
    this.state = {
      time: props.startTime * 10,
    };
    this.tick = this.tick.bind(this);
    this.stopTime = Date.now() + props.startTime * 1000;
  }

  componentDidMount() {
    this.time = window.setInterval(this.tick, 100);
  }

  componentWillUnmount() {
    clearInterval(this.time);
  }

  tick() {
    const now = Date.now();
    if (this.stopTime - now <= 0) {
      this.setState({ time: 0 });
      clearInterval(this.time);
    } else {
      this.setState({ time: Math.round((this.stopTime - now) / 100) });
    }
  }

  render() {
    const time = this.state.time / 10;
    const seconds = Math.floor(time);
    if (seconds > 9) {
      return <span>{seconds}</span>;
    }
    return <span style={{ color: 'red' }}>{time.toFixed(1)}</span>;
  }
}

export default CountDown;
