import React, { Component } from 'react';

type CountUpState = {
  time: number;
};

type CountUpProps = {
  paused: boolean;
};

class CountUp extends Component<CountUpProps, CountUpState> {
  private startTime: number;
  private timer?: number;

  constructor(props: CountUpProps) {
    super(props);
    this.startTime = Date.now();
    this.state = { time: 0 };
    this.tick = this.tick.bind(this);
  }

  convertTime (mSec : number) {
    var seconds = Math.round(mSec / 1000);
    var minutes = Math.floor(seconds / 60);
    var sec = seconds % 60;
    var strMin = minutes < 10 ? "0" + minutes : "" + minutes;
    var strSec = sec < 10 ? "0" + sec : "" + sec;
    return strMin + ":" + strSec;
  };

  componentDidMount() {
    this.timer = window.setInterval(this.tick, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  tick() {
    if (!this.props.paused) {
      this.setState({ time: Date.now() - this.startTime });
    }
  }

  render() {
    return <span>{this.convertTime(this.state.time)}</span>;
  }
}

export default CountUp;
