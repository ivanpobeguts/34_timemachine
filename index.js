var TIMEOUT_IN_SECS = 3 * 60
var ALERT_INTERVAL_IN_SECS = 30
var TEMPLATE = '<h1><span class="js-timer-minutes">00</span>:<span class="js-timer-seconds">00</span></h1>'
var ALERT_TEXT = [
  'If time be of all things the most precious, wasting time must be the greatest prodigality.',
  'There is no good way to waste your time. Wasting time is just wasting time.',
  'Only I can change my life. No one can do it for me.',
  'Good, better, best. Never let it rest. Until your good is better and your better is best.',
  'The past cannot be changed. The future is yet in your power.',
  'Set your goals high, and don\'t stop till you get there.',
  'Without hard work, nothing grows but weeds.',
  'Things do not happen. Things are made to happen.'
]

function padZero(number) {
  return ("00" + String(number)).slice(-2);
}

class Timer {
  // IE does not support new style classes yet
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
  constructor(timeout_in_secs) {
    this.initial_timeout_in_secs = timeout_in_secs
    this.reset()
  }

  getTimestampInSecs() {
    var timestampInMilliseconds = new Date().getTime()
    return Math.round(timestampInMilliseconds / 1000)
  }

  start() {
    if (this.isRunning)
      return
    this.timestampOnStart = this.getTimestampInSecs()
    this.isRunning = true
  }

  stop() {
    if (!this.isRunning)
      return
    this.timeout_in_secs = this.calculateSecsLeft()
    this.timestampOnStart = null
    this.isRunning = false
  }

  reset(timeout_in_secs) {
    this.isRunning = false
    this.timestampOnStart = null
    this.timeout_in_secs = this.initial_timeout_in_secs
  }

  calculateSecsLeft() {
    if (!this.isRunning)
      return this.timeout_in_secs
    var currentTimestamp = this.getTimestampInSecs()
    var secsGone = currentTimestamp - this.timestampOnStart
    return Math.max(this.timeout_in_secs - secsGone, 0)
  }

  isTimeOver() {
    return this.calculateSecsLeft() === 0
  }
}

class TimerWidget {
  // IE does not support new style classes yet
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
  construct() {
    this.timerContainer = this.minutes_element = this.seconds_element = null
  }

  mount(rootTag) {
    if (this.timerContainer)
      this.unmount()

    // adds HTML tag to current page
    this.timerContainer = document.createElement('div')
    this.timerContainer.setAttribute("style", "height: 100px;")
    this.timerContainer.style.position = "fixed"
    this.timerContainer.style.zIndex = "1000"
    this.timerContainer.style.top = "10px"
    this.timerContainer.style.padding = "20px 10px 10px 10px"
    this.timerContainer.style.margin = "10px"
    this.timerContainer.style.color = "#6A5ACD"
    this.timerContainer.style.border = "thick solid #6A5ACD"

    rootTag.insertBefore(this.timerContainer, rootTag.firstChild)
    this.timerContainer.innerHTML = TEMPLATE

    this.minutes_element = this.timerContainer.getElementsByClassName('js-timer-minutes')[0]
    this.seconds_element = this.timerContainer.getElementsByClassName('js-timer-seconds')[0]
  }

  update(secsLeft) {
    var minutes = Math.floor(secsLeft / 60);
    var seconds = secsLeft - minutes * 60;

    this.minutes_element.innerHTML = padZero(minutes)
    this.seconds_element.innerHTML = padZero(seconds)
  }

  unmount() {
    if (!this.timerContainer)
      return
    this.timerContainer.remove()
    this.timerContainer = this.minutes_element = this.seconds_element = null
  }
}


function main() {

  var timer = new Timer(TIMEOUT_IN_SECS)
  var alertTimer = new Timer(ALERT_INTERVAL_IN_SECS)
  var timerWiget = new TimerWidget()
  var intervalId = null
  var alertIntervalId = null

  timerWiget.mount(document.body)

  function throwAlert() {
    if (timer.isTimeOver()) {
      alertTimer.start();
    }

    if (alertTimer.isTimeOver()) {
      var randomNumber = Math.floor(Math.random() * ALERT_TEXT.length)
      window.alert(ALERT_TEXT[randomNumber])
      alertTimer = new Timer(5)
    }
  }

  function handleIntervalTick() {
    var secsLeft = timer.calculateSecsLeft()
    timerWiget.update(secsLeft)
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      timer.stop()
      alertTimer.stop()
      clearInterval(intervalId)
      clearInterval(alertIntervalId)
      intervalId = null
      alertIntervalId = null
    } else {
      timer.start()
      intervalId = intervalId || setInterval(handleIntervalTick, 300)
      alertIntervalId = alertIntervalId || setInterval(throwAlert, 300)
    }
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
  document.addEventListener("visibilitychange", handleVisibilityChange, false);
  handleVisibilityChange()
}

if (document.readyState === "complete" || document.readyState === "loaded") {
  main();
} else {
  // initialize timer when page ready for presentation
  window.addEventListener('DOMContentLoaded', main);
}
