/**
 * 校园生存模拟器 - 声音引擎
 * 支持背景音乐 (BGM) 的循环播放、平滑切换与音量控制。
 */

class SoundEngine {
  private bgm: HTMLAudioElement | null = null;
  private currentTrack: string | null = null;
  private fadeInterval: number | null = null;
  private targetVolume: number = 0.5;

  /**
   * 播放背景音乐
   * @param src 音乐文件路径 (位于 public 目录下)
   * @param loop 是否循环
   */
  playBGM(src: string, loop: boolean = true) {
    if (this.currentTrack === src) return;

    // 如果已经在播放，先淡出旧音乐
    if (this.bgm) {
      this.fadeOutAndSwitch(src, loop);
      return;
    }

    this.startNewTrack(src, loop);
  }

  private startNewTrack(src: string, loop: boolean) {
    this.currentTrack = src;
    this.bgm = new Audio(src);
    this.bgm.loop = loop;
    this.bgm.volume = 0;
    this.bgm.play().catch(e => console.warn('自动播放被浏览器拦截:', e));
    this.fadeIn();
  }

  private fadeIn() {
    if (!this.bgm) return;
    let vol = 0;
    const interval = window.setInterval(() => {
      if (!this.bgm) {
        clearInterval(interval);
        return;
      }
      vol += 0.05;
      if (vol >= this.targetVolume) {
        this.bgm.volume = this.targetVolume;
        clearInterval(interval);
      } else {
        this.bgm.volume = vol;
      }
    }, 100);
  }

  private fadeOutAndSwitch(newSrc: string, loop: boolean) {
    if (!this.bgm) return;
    let vol = this.bgm.volume;
    const interval = window.setInterval(() => {
      if (!this.bgm) {
        clearInterval(interval);
        return;
      }
      vol -= 0.05;
      if (vol <= 0) {
        this.bgm.volume = 0;
        this.bgm.pause();
        clearInterval(interval);
        this.startNewTrack(newSrc, loop);
      } else {
        this.bgm.volume = vol;
      }
    }, 100);
  }

  stopBGM() {
    if (this.bgm) {
      this.bgm.pause();
      this.bgm = null;
      this.currentTrack = null;
    }
  }

  setVolume(volume: number) {
    this.targetVolume = Math.max(0, Math.min(1, volume));
    if (this.bgm) {
      this.bgm.volume = this.targetVolume;
    }
  }
}

export const soundEngine = new SoundEngine();
