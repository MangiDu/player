import './player.scss'

const MINUTE_SECONDS = 60
const HOUR_SECONDS = 60 * 60
const GAP_TIME = 500
const VOLUME = 0.6

class Player {
  constructor (option) {
    this.el = option.el
    this._setHTML(this.el)

    this.musics = option.musics || []
    this.audio = document.createElement('audio')
    this.audio.autoplay = option.autoplay || false
    this.playing = false

    this._getElements()
    this._bindEvents()

    this.setMusic()
    this.setVolume(VOLUME)
    if (this.audio.autoplay) this.play()
  }

  _setHTML (el) {
    el.innerHTML = `
    <div class="player__wrapper">
      <div class="player__content">
        <div class="player__cover">
          <img class="cover" src="">
          <div class="player__info">
            <div class="title player__name"></div>
            <span class="player__author">
              <span class="author player__author-name"></span>
            </span>
          </div>
          <div class="player__progress">
            <span class="current-time player__progress-current">00:00</span>
            <div class="player__progress-bar">
              <div class="progress player__progress-bar--fullfill">
                <span class="progress-passed player__progress-bar--passed">
                </span>
              </div>
            </div>
            <span class="duration player__progress-whole">00:00</span>
          </div>
        </div>
        <div class="player__operations">
          <span class="prev player__operation-prev"></span>
          <span class="play-or-pause player__operation-play"></span>
          <span class="next player__operation-next"></span>
        </div>
      </div>
      <div class="player__settings-wrapper">
        <div class="player__settings">
          <div class="player__orders">
            <span class="player__order-random"></span>
            <span class="player__order-loop"></span>
          </div>
          <span class="player__share"></span>
          <span class="player__like"></span>
          <span class="player__add"></span>
          <div class="player__volume">
            <span class="volume-max player__volume-louder"></span>
            <span class="volume player__volume-liquid">
              <span class="volume-measure player__volume-liquid-measure"></span>
            </span>
            <span class="volume-quiet player__volume-quiet"></span>
          </div>
          <span class="player__setting"></span>
        </div>
      </div>
    </div>
    `
  }

  _getElements () {
    this._coverEl = this.el.getElementsByClassName('cover')[0]
    this._titleEl = this.el.getElementsByClassName('title')[0]
    this._authorEl = this.el.getElementsByClassName('author')[0]
    this._playOrPauseEl = this.el.getElementsByClassName('play-or-pause')[0]
    this._prevEl = this.el.getElementsByClassName('prev')[0]
    this._nextEl = this.el.getElementsByClassName('next')[0]
    this._currentTimeEl = this.el.getElementsByClassName('current-time')[0]
    this._durationEl = this.el.getElementsByClassName('duration')[0]
    this._progressEl = this.el.getElementsByClassName('progress')[0]
    this._progressPassedEl = this.el.getElementsByClassName('progress-passed')[0]
    this._volumeEl = this.el.getElementsByClassName('volume')[0]
    this._volumeMeasureEl = this.el.getElementsByClassName('volume-measure')[0]
    this._volumeMaxEl = this.el.getElementsByClassName('volume-max')[0]
    this._volumeQuietEl = this.el.getElementsByClassName('volume-quiet')[0]
  }

  _bindEvents () {
    this._playOrPauseEl.onclick = () => {
      if (this._preventCombo) return
      this._preventCombo = true
      this.playing ? this.pause() : this.play()
      setTimeout(() => {
        this._preventCombo = false
      }, GAP_TIME)
    }
    this._prevEl.onclick = () => {
      this.prev()
    }
    this._nextEl.onclick = () => {
      this.next()
    }
    this._progressEl.onclick = (e) => {
      let progress = (Number(e.offsetX) / this._progressEl.clientWidth) * this.audio.duration
      this.audio.currentTime = progress
      this.play()
    }
    this.audio.onloadeddata = () => {
      this._durationEl.innerHTML = this._parseTime(this.audio.duration)
    }
    this.audio.ontimeupdate = () => {
      this._currentTimeEl.innerHTML = this._parseTime(this.audio.currentTime)
      this._progressPassedEl.style.width = `${(this.audio.currentTime / this.audio.duration * 100).toFixed(2)}%`
    }
    this.audio.onended = () => {
      this._reset()
    }
    this._volumeEl.onclick = (e) => {
      let targetEl = e.target
      window.t = targetEl
      let measure = e.offsetY
      while (targetEl != this._volumeEl) {
        measure += targetEl.offsetTop
        targetEl = targetEl.parentElement
      }
      measure = (this._volumeEl.clientHeight - measure) / this._volumeEl.clientHeight
      this.setVolume(measure)
    }
    this._volumeMaxEl.onclick = () => {
      this.setVolume(1)
    }
    this._volumeQuietEl.onclick = () => {
      this.setVolume(0)
    }
  }

  _unbindEvents () {
    this._progressPassedEl.onclick = null
    this._progressEl.onclick = null
    this._prevEl.onclick = null
    this._nextEl.onclick = null
    this.audio.onloadeddata = null
    this.audio.ontimeupdate = null
    this.audio.onended = null
    this._volumeEl.onclick = null
    this._volumeMaxEl.onclick = null
    this._volumeQuietEl.onclick = null
  }

  _parseTime (seconds) {
    let minutes = this._patchZero(Math.floor(seconds / MINUTE_SECONDS))
    let leftSeconds = this._patchZero(Math.round(seconds % MINUTE_SECONDS))
    return `${minutes}:${leftSeconds}`
  }

  _patchZero (value) {
    value = Number(value)
    if (value != value) {
      return '00'
    }
    return value > 9 ? value : `0${value}`
  }

  _toggleClassname (el, regExp, target) {
    let name = el.className
    el.className = name.replace(regExp, target)
  }

  _reset () {
    this.playing = false
    this.audio.currentTime = 0
    this._currentTimeEl.innerHTML = this._parseTime()
    this._progressPassedEl.style.width = '0'
    this._toggleClassname(this._playOrPauseEl, /player__operation-(pause|play)/, 'player__operation-play')
  }

  setMusic (index) {
    index = index || 0
    let currentMusic = this.musics[index]
    if (currentMusic) {
      this.index = index
      this.audio.src = currentMusic.url
      this._coverEl.src = currentMusic.cover
      // TODO: cover pic auto fix max width or height
      this._coverEl.style.opacity = (currentMusic.cover && currentMusic.cover.length) ? 1 : 0
      this._titleEl.innerHTML = currentMusic.title
      this._authorEl.innerHTML = currentMusic.author
    }
    this._reset()
  }

  setVolume (measure) {
    this.audio.volume = measure
    this._volumeMeasureEl.style.height = `${(measure * 100).toFixed(2)}%`
  }

  play () {
    this.playing = true
    this.audio.play()
    this._toggleClassname(this._playOrPauseEl, /player__operation-(pause|play)/, 'player__operation-pause')
  }
  pause () {
    this.playing = false
    this.audio.pause()
    this._toggleClassname(this._playOrPauseEl, /player__operation-(pause|play)/, 'player__operation-play')
  }

  next () {
    if (this.index < this.musics.length - 1) this.setMusic(this.index + 1)
    else this.setMusic(0)

    this.play()
  }

  prev () {
    if (this.index > 0) this.setMusic(this.index - 1)
    else this.setMusic(this.musics.length - 1)

    this.play()
  }

  destroy () {
    this.pause()
    this._unbindEvents()

    for (let key in this) {
      delete this[key]
    }

    this.el.innerHTML = ''
  }
}

module.exports = Player
