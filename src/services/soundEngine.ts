/**
 * 校园生存模拟器 - 声音引擎
 * 支持背景音乐 (BGM) 的循环播放、平滑切换与音量控制。
 */

class SoundEngine {
  private bgm: HTMLAudioElement | null = null;
  private currentTrack: string | null = null;
  private audioContext: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private fadeTimer: number | null = null;
  private targetVolume: number = 0.5;
  private enabled = true;

  /**
   * 播放背景音乐
   * @param src 音乐文件路径或内置 preset:* 音景
   * @param loop 是否循环
   */
  playBGM(src: string, loop: boolean = true) {
    if (!this.enabled) return;
    if (this.currentTrack === src) return;

    this.clearFadeTimer();

    if (src.startsWith('preset:')) {
      this.stopAudioElement();
      this.startProceduralTrack(src);
      return;
    }

    // 如果已经在播放，先淡出旧音乐
    if (this.bgm) {
      this.fadeOutAndSwitch(src, loop);
      return;
    }

    this.startNewTrack(src, loop);
  }

  private startNewTrack(src: string, loop: boolean) {
    this.stopProceduralTrack();
    this.currentTrack = src;
    this.bgm = new Audio(src);
    this.bgm.loop = loop;
    this.bgm.volume = 0;
    this.bgm.play().catch(e => {
      console.warn('背景音乐播放失败，已静音兜底:', e);
      this.stopBGM();
    });
    this.fadeIn();
  }

  private fadeIn() {
    if (!this.bgm) return;
    let vol = 0;
    this.clearFadeTimer();
    this.fadeTimer = window.setInterval(() => {
      if (!this.bgm) {
        this.clearFadeTimer();
        return;
      }
      vol += 0.05;
      if (vol >= this.targetVolume) {
        this.bgm.volume = this.targetVolume;
        this.clearFadeTimer();
      } else {
        this.bgm.volume = vol;
      }
    }, 100);
  }

  private fadeOutAndSwitch(newSrc: string, loop: boolean) {
    if (!this.bgm) return;
    let vol = this.bgm.volume;
    this.clearFadeTimer();
    this.fadeTimer = window.setInterval(() => {
      if (!this.bgm) {
        this.clearFadeTimer();
        return;
      }
      vol -= 0.05;
      if (vol <= 0) {
        this.bgm.volume = 0;
        this.bgm.pause();
        this.clearFadeTimer();
        this.startNewTrack(newSrc, loop);
      } else {
        this.bgm.volume = vol;
      }
    }, 100);
  }

  stopBGM() {
    this.clearFadeTimer();
    this.stopAudioElement();
    this.stopProceduralTrack();
    this.currentTrack = null;
  }

  setVolume(volume: number) {
    this.targetVolume = Math.max(0, Math.min(1, volume));
    if (this.bgm) {
      this.bgm.volume = this.targetVolume;
    }
    if (this.gainNode) {
      this.gainNode.gain.value = this.targetVolume * 0.16;
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) {
      this.stopBGM();
    }
  }

  private startProceduralTrack(trackId: string) {
    if (this.currentTrack === trackId) return;

    this.stopProceduralTrack();
    this.currentTrack = trackId;

    const AudioContextCtor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) {
      return;
    }

    this.audioContext = new AudioContextCtor();
    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = getPresetFrequency(trackId);
    gain.gain.value = this.targetVolume * 0.12;
    oscillator.connect(gain);
    gain.connect(this.audioContext.destination);
    oscillator.start();
    this.oscillator = oscillator;
    this.gainNode = gain;
  }

  private stopAudioElement() {
    if (!this.bgm) {
      return;
    }

    this.bgm.pause();
    this.bgm.src = '';
    this.bgm = null;
  }

  private stopProceduralTrack() {
    this.oscillator?.stop();
    this.oscillator?.disconnect();
    this.gainNode?.disconnect();
    void this.audioContext?.close().catch(() => undefined);
    this.oscillator = null;
    this.gainNode = null;
    this.audioContext = null;
  }

  private clearFadeTimer() {
    if (this.fadeTimer !== null) {
      window.clearInterval(this.fadeTimer);
      this.fadeTimer = null;
    }
  }
}

function getPresetFrequency(trackId: string): number {
  if (trackId.includes('study')) return 196;
  if (trackId.includes('emotional')) return 164.81;
  if (trackId.includes('daily')) return 220;
  if (trackId.includes('menu')) return 174.61;
  return 185;
}

export const soundEngine = new SoundEngine();
