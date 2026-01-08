//60hz Monitors only for now
const FRAMES_TO_SKIP = 10;

class TimeController{
    constructor(){
        this.skippedFrames = 0;
        this.paused = false;
    }
}

class GameClock{
    constructor(timeController, callbackFn, args=[]){
        this.ticksPassed = 0;
        this.timeController = timeController;
        this.callbackFn = callbackFn;
        this.args = args;
    }
    onTick(){
        if(!this.timeController.paused) window.requestAnimationFrame(()=>{this.onTick()});
        if(this.timeController.skippedFrames === FRAMES_TO_SKIP){
            this.callbackFn(...this.args);
            this.timeController.skippedFrames = 0;
            this.ticksPassed++;
        }
        this.timeController.skippedFrames++;
    }
    start(){
        window.requestAnimationFrame(()=>{this.onTick()});
    }
    pause(){
        this.timeController.paused = true;
    }
    resume(){
        if(this.timeController.paused){
            this.timeController.paused = false;
            window.requestAnimationFrame(()=>{this.onTick()});
        }
    }
}

const tc = new TimeController();
const gc = new GameClock(tc, () => {console.log("tick")});