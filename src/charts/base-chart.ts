import { merge } from "lodash-es";
import enhanceCtx from "../ctx";
import { select } from "d3-selection";
import Ani from "./ani";
import { Component } from "../components";
import { csv } from "d3-fetch";
import { interval, Timer } from "d3-timer";

class BaseChart implements Ani {
  fps: number;
  sec: number;
  totalFrames: number;
  cFrame: number;
  components: Component[];
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  output: boolean;
  data: any;
  meta: any;

  background: string;
  colorScheme: string[];
  hint: string;
  player: Timer;

  constructor(options: object = {}) {
    this.fps = 12;
    this.sec = 3;
    this.width = 1366;
    this.height = 768;
    this.components = [];
    this.cFrame = 0;
    this.colorScheme = [
      "#27C",
      "#FB0",
      "#FFF",
      "#2C8",
      "#D23",
      "#0CE",
      "#E8A",
      "#DDA",
      "#C86",
      "#F72",
      "#C8C",
      "#BCA",
      "#F27",
    ];
    this.background = "1E1E1E";
    this.setOptions(options);
  }
  addComponent(c: Component): void {
    c.ani = this;
    this.components.push(c);
  }

  async loadData(path: string | any): Promise<void> {
    this.drawHint("Loading Data...");
    if (typeof path == "string") {
      this.data = await csv(path);
    } else {
      this.data = await csv(path.default);
    }
    this.drawHint("Loading Data...Finished!");
  }

  async loadMeta(path: string): Promise<void> {
    this.meta = await csv(path);
  }

  ready(): void {
    throw new Error("Method not implemented.");
  }
  play(): void {
    if (this.player) {
      this.player.stop();
      this.player = null;
      return;
    }
    if (this.output) {
      while (this.cFrame < this.totalFrames) {
        this.draw(this.cFrame++);
      }
    } else {
      let start = new Date().getTime();
      this.player = interval(async () => {
        this.draw(this.cFrame++);
        if (this.cFrame >= this.totalFrames) {
          this.player.stop();
          this.drawHint(
            `Finished! FPS: ${(
              (this.sec * this.fps) /
              ((new Date().getTime() - start) / 1000)
            ).toFixed(2)}`
          );
        }
      }, (1 / this.fps) * 1000);
    }
  }
  draw(frame: number): void {
    this.drawBackground();
    this.components.forEach((component) => {
      component.draw(frame);
    });
  }

  setOptions(options: object): void {
    merge(this, options);
    this.calOptions();
  }
  calOptions(): void {
    this.totalFrames = this.fps * this.sec;
  }

  setCanvas(selector?: string): void {
    if (typeof window != "undefined") {
      this.canvas = <HTMLCanvasElement>select(selector).node();
      if (!this.canvas || this.canvas.getContext == undefined) {
        this.initCanvas();
      }
    } else {
      const { createCanvas } = require("canvas");
      this.canvas = createCanvas(this.width, this.height);
    }
    this.ctx = this.canvas.getContext("2d");
    enhanceCtx(this.ctx);
  }

  private initCanvas(): void {
    this.canvas = select("body")
      .append("canvas")
      .attr("width", this.width)
      .attr("height", this.height)
      .node();
  }

  preRender() {}

  private drawBackground() {
    this.ctx.save();
    this.ctx.fillStyle = this.background;
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.restore();
  }

  private drawHint(text: any) {
    if (this.ctx) {
      this.drawBackground();
      this.ctx.save();
      this.ctx.font = `${18}px Sarasa Mono SC`;
      this.ctx.fillStyle = "#FFF";
      this.ctx.fillText(text, 20, 38);
      this.ctx.restore();
    }
    this.hint = text;
    console.log(text);
  }
}
export { BaseChart };
