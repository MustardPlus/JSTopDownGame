/*
MustardPlus: pls dont steal
4/18/17 - 4/27/17
*/
// Constants
const NONE = -1, TILE_SIZE = 64;

var container = document.getElementById('container');
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

// [ - - Input - - ]
var Key = {
  _pressed: {},
  i_p: {},

  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  A: 65,
  D: 68,
  S: 83,
  W: 87,
  T: 84,
  SPACE: 32,
  SHIFT: 16,
  
  isDown: function(keyCode) {
    return this._pressed[keyCode];
  },

  isPressed: function(keyCode){
    return this.i_p[keyCode];
  },
  
  onKeydown: function(event) {
    if(!this.isDown(event.keyCode)){
      this.i_p[event.keyCode] = true;
    }else{
      delete this.i_p[event.keyCode];
    }
    this._pressed[event.keyCode] = true;
  },
  
  onKeyup: function(event) {
    delete this._pressed[event.keyCode];
    delete this.i_p[event.keyCode];
  }
};

document.addEventListener('keyup', function(event) { Key.onKeyup(event); }, false);
document.addEventListener('keydown', function(event) { Key.onKeydown(event); }, false);

// [ - - General Methods - - ]
/**
  * Get Element by use of ID.
  * @param name ID of Element.
*/
function getByID(name){
  return document.getElementById(name);
}

function getElWidth(name){
  var post = getByID(name).getBoundingClientRect();
  return post.width;
}
function getElHeight(name){
  var post = getByID(name).getBoundingClientRect();
  return post.height;
}

/**
  * Get Random Integer.
  * @param max Maximum Integer.
*/
function random_int(max){
  return Math.floor(Math.random()*max);
}

function slide_into(base, dest, spd){
  var dif = Math.abs(dest - base);
  if(dif < spd)return dest;
  var dir = sign(dest - base);
  return base+(dir*spd);
}

function sign(value){
  if(value == 0)return 0;
  if(value > 0){
    return 1;
  }else{
    return -1;
  }
}

function bool_sub(b1, b2){
  if(b1){
    if(b2)return 0;
    return 1;
  }else{
    if(b2)return -1;
    return 0;
  }
}

function inRange(value, min, max){
  return (value >= Math.min(min, max)) && (value <= Math.max(min, max));
}

function rangeIntersect(min0, max0, min1, max1){
  return (Math.max(min0, max0) >= Math.min(min1, max1)) && (Math.min(min0, max0) <= Math.max(min1, max1));
}

function rectIntersect(msk0, msk1){
  return (rangeIntersect(msk0.left, msk0.right, msk1.left, msk1.right)) &&
  (rangeIntersect(msk0.up, msk0.down, msk1.up, msk1.down));
}

/**
  * Check if a Value is defined.
  * @param value Value to Check.
*/
function valid(value){
  return (value != NONE);
}

/**
  * Remove Random Value from Array. Warning, Will not check for remaining values.
  * @param array Array to remove value from.
*/
function array_random_removal(array){
  var length = array.length;
  var pos = random_int(length);
  var val = array[pos];
  while(val == NONE){
    pos = random_int(length);
    val = array[pos];
  }
  array[pos] = NONE;
  return val;
}

/**
  * Convert entire array into a String.
  * @param array Array to convert into String.
*/
function array_write(array){
  var str = "[";
  for(var i = 0; i < array.length; i++){
    var ext = ", ";
    if(i == array.length-1)ext = "]";
    str+=String(array[i])+ext;
  }
  return str;
}
/**
  * Convert entire 2D array into a String.
  * @param array Array to convert into String.
*/
function array_write2D(array){
  var str = "[";
  for(var i = 0; i < array.length; i++){
    var ext = ", ";
    if(i == array.length-1)ext = "]";
    str+=array_write(array[i])+ext;
  }
  return str;
}

/**
  * Alarms, used for delayed events.
*/
class alarm {
  constructor(){
    this.time = NONE;
    this.func = NONE;
    this.param = NONE;
  }

  update(){
    this.tick();
    this.check();
  }

  tick(){
    if(this.time != NONE){
      this.time = this.time - 1;
    }
  }

  check(){
    if(valid(this.time)){
      if(this.time == 0){
        // Execute Function
        if(this.param == NONE){
          this.func();
        }else{
          this.func(this.param);
        }
        this.reset();
      }
    }
  }

  set(time, func, param){
    this.time = time;
    this.func = func;
    this.param = param;
  }

  reset(){
    this.time = NONE;
    this.func = NONE;
    this.param = NONE;
  }
}

/**
  * Alarm System, controls alarms.
*/
class alarm_system {
  constructor(num){
    this.alarms = [NONE];
    for(var i = 0; i < num; i++){
      this.alarms.push(new alarm());
    }
  }

  get_alarm(aID){
    return this.alarms[aID];
  }

  update(){
    // Update all Alarms
    for(var i = 0; i < this.alarms.length; i++){
      var alrm = this.get_alarm(i);
      if(alrm != NONE){
        // Alarm Exists
        alrm.update();
      }
    }
  }

  // Add to Specific Position
  set(aID, time, func, param){
    this.get_alarm(aID).set(time, func, param);
  }

  // Add to Unknown Position
  // Not recommended if using Specifics
  add(time, func, param){
    var open = 0;
    for(var i = 0; i < this.alarms.length; i++){
      var alrm = this.get_alarm(i);
      if(alrm != NONE){
        // Alarm Exists
        if(alrm.time == NONE)open = i;
      }
    }
    // Set Alarm
    this.get_alarm(open).set(time, func, param);
  }

  wipe(){
    for(var i = 0; i < this.alarms.length; i++){
      var alrm = this.get_alarm(i);
      if(alrm != NONE){
        // Alarm Exists
        alrm.reset();
      }
    }
  }
}

class Slide {
  // Value that slides into destination
  constructor(base, dest, spd){
    this.base = base;
    this.dest = dest;
    this.spd = spd;
    this.dir = 1;
  }

  update(){
    this.dir = sign(this.dest - this.base);
    this.base += this.dir*this.spd;
    if(this.dir == 1){
      if(this.base >= this.dest){
        this.dir = 0;
        this.base = this.dest;
      }
    }else if(this.dir == -1){
      if(this.base <= this.dest){
        this.dir = 0;
        this.base = this.dest;
      }
    }
  }
}

class Pendulum {
  // Value that bounces back and forth
  constructor(base, min, max, spd){
    this.base = base;
    this.vmin = min;
    this.vmax = max;
    this.spd = spd;
    this.dir = 1;
  }

  update(){
    this.base += (this.spd*this.dir);
    if(this.dir == 1){ // Less than, Increasing
      if(this.base >= this.vmax){
        //this.base = this.vmax;
        this.dir = -1;
      }
    }else{ // Greater than, Decreasing
      if(this.base <= this.vmin){
        //this.base = this.vmin;
        this.dir = 1;
      }
    }
  }
}

class Mask {
  constructor(xx, yy, width, height){
    this.x = xx;
    this.y = yy;
    this.ww = width;
    this.hh = height;
    this.hlfw = width/2;
    this.hlfh = height/2;
    this.update(xx, yy);
  }

  update(xx, yy){
    this.x = xx;
    this.y = yy;
    this.left = this.x - this.hlfw;
    this.right = this.x + this.hlfw;
    this.up = this.y - this.hlfh;
    this.down = this.y + this.hlfh;
  }
}

// Camera
class Camera {
  constructor(Entity){
    this.follow = Entity;
    this.x = 0;
    this.y = 0;
  }

  update(){
    if(this.follow != NONE){
      // Follow Abstract Entity
      this.x = this.follow.x;
      this.y = this.follow.y;
    }
  }
}

// Entity Classes
class AbstractEntity {
  constructor(type, xx, yy){
    this.type = type;
    this.instID = GAME.INSTANCES.length;
    this.LABEL = 1;
    var sz = TILE_SIZE;
    if(this.type == 0){
        sz = TILE_SIZE/2;
        //GAME.player = this;
    }
    this.home = {x: xx, y: yy};
    this.post = { x: xx, y : yy };
    this.vel = { h: 0, v : 0 };
    this.msk = new Mask(xx, yy, sz, sz);
    this.spd = 9;//*(sz/32);
    this.color = "tomato";
    // Physics
    this.hface = 1;
    this.onground = false;
    this.onwall = false;
    this.onwallB = false;
    this.cling = false;
    // Player
    this.hp_max = 24;
    this.hp = this.hp_max;
    this.stamina_max = 16;
    this.stamina = this.stamina_max;
    this.input_set(1);
    this.score = 0;
    this.faceangle = 0;
    this.batangle = 0;
    this.batswing = false;
    this.batslide = new Slide(0, 0, 60);
    this.STATE = 0;
    // Invincibility Frames
    this.stateslide = new Slide(0, 0, 0.1);
  }
  // Get
  get side_l(){
    return this.msk.left;
  }
  get side_r(){
    return this.msk.right;
  }
  get side_u(){
    return this.msk.up;
  }
  get side_d(){
    return this.msk.down;
  }

  // Set
  setPost(xx, yy){
    this.post.x = xx;
    this.post.y = yy;
  }

  // Physics
  gravity(){
    var weight = 0.5;
    if(this.onwall){
      weight = 0.1;
      if(this.vel.v < 0)this.vel.v = 0;
    }
    if(this.cling){
      weight = 0;
      if(!this.onwall){
        // Underneath
        this.vel.v = -2;
      }else{
        this.vel.v = 0;
      }
    }
    this.vel.v += weight;
    if(this.vel.v >= 9)this.vel.v = 9;
  }

  boundcheck(){
    var half = TILE_SIZE/2
    if(this.side_l > canvas.width)this.post.x = -half;
    if(this.side_r < -half)this.post.x = canvas.width;//getElWidth("canvas");
    if(this.side_u > canvas.height)this.post.y = -half;
    if(this.side_d < -half)this.post.y = canvas.height+half;//getElHeight("canvas");
  }

  stamina_charge(){
    this.stamina += 1;
    if(this.stamina > this.stamina_max)this.stamina = this.stamina_max;
  }

  stamina_use(cost){
    if(this.stamina >= cost){
      // Use
      this.stamina -= cost;
      return true;
    }else{
      return false;
    }
  }

  set_home(xx, yy){
    this.home.x = xx;
    this.home.y = yy;
  }

  reset(){
    this.post.x = this.home.x;
    this.post.y = this.home.y;
    this.vel.x = 0;
    this.vel.y = 0;
    this.msk.update(this.post.x, this.post.y);
    this.stamina = this.stamina_max;
    //instance_create(9, this.post.x, this.post.y);
  }

  input_set(inpID){
    this.input = [Key.D, Key.A, Key.D, Key.W, Key.T];
    if(inpID == 1){
      this.input = [Key.RIGHT, Key.LEFT, Key.DOWN, Key.UP, Key.SHIFT];
    }
  }

  damage(dmg){
    //alert("hey");
    this.hp -= dmg;
    this.STATE = 1;
    this.stateslide.base = 1;
    if(this.hp <= 0){
      this.hp = 0;
      this.destroy();
    }
  }

  destroy(){
    instance_destroy(this.instID);
  }

  // Update
  update(){
    // Swing Slide
    this.batslide.update();
    this.stateslide.update();
    if(this.STATE == 1){
      if(this.stateslide.base == this.stateslide.dest)this.STATE = 0;
    }
    // Physics
    //this.gravity();
    var ir = Key.isDown(this.input[0]), il = Key.isDown(this.input[1]);
    var id = Key.isDown(this.input[2]), iu = Key.isDown(this.input[3]);
    var isp = Key.isPressed(this.input[4]);
    var hdir = bool_sub(ir, il), vdir = bool_sub(id, iu);

    // Turn
    this.faceangle = slide_into(this.faceangle, this.faceangle+(hdir*60), 16);

    // Forward
    if(iu){
      this.vel.h = slide_into(this.vel.h, lengthdir_x(6, degToRad(this.faceangle)), 1);
      this.vel.v = slide_into(this.vel.v, lengthdir_y(6, degToRad(this.faceangle)), 1);
      // Spawn Dust Effect
      var fang = degToRad(this.faceangle);
      var dstx = this.post.x, dsty = this.post.y;
      instance_add(11, dstx, dsty);
    }else{
      this.vel.h = slide_into(this.vel.h, 0, 1);
      this.vel.v = slide_into(this.vel.v, 0, 1);
    }

    if(isp){
      if(this.batslide.base == this.batslide.dest){
        if(this.batslide.dest == 0){
          this.batslide.dest = -140;
        }else{
          this.batslide.dest = 0;
        }
        // Spawn Hitbox
        var fang = degToRad(this.faceangle);
        var nx = this.post.x+(this.vel.h*this.spd*3), ny = this.post.y+(this.vel.v*this.spd*3);
        var hitx = nx+(lengthdir_x(96, fang)), hity = ny+(lengthdir_y(96, fang));
        var hitr = instance_add(10, hitx, hity);
        hitr.creator = this;
        hitr.dmg = 4;
      }
      // Swing
      if(this.stamina > 4){
        this.stamina_use(4);
        // Spawn Wave
        var wave = instance_add(12, hitx, hity);
        wave.ang = fang;
      }
    }else{
      this.stamina_charge();
    }
    this.batangle = this.batslide.base;
    /*
    if(this.onground){
      // Jumping
      if(iu){
        this.vel.v = -4;
      }
      // Stamina
      this.stamina_charge();
    }
    if(this.onwall){
      if(iu){
        if(this.stamina_use(1)){
          this.vel.v = -3;
          this.vel.h = -this.hface*2;
        }
      }
    }
    */
    var ox = this.post.x, oy = this.post.y;
    var nx = this.post.x + (this.vel.h*this.spd);
    var ny = this.post.y + (this.vel.v*this.spd);
    this.msk.update(nx, ny);
    var hs = this.vel.h;
    var vs = this.vel.v;
    var forceh = 0, forcev = 0;
    this.onground = false;
    this.onwallB = false;
    this.onwall = false;
    this.cling = false;
    // COLLISION CHECK
    var grid = GAME.INSTANCES;
    var gridw = grid.length;
    /*
    for(var i = 0; i < gridw; i++){
      var inst = grid[i];
      if(inst != NONE){
        var type = inst.type;
        // Collision
        switch(type){
          case 0: // Players
          case 1: // Wall
          case 2: // StickyWall
          case 3: // BouncyWall
          case 4: // SpeedWall
          case 5: // SlickWall
          case 6: // DangerWall
          case 7: // CheckPoint
            var ix = inst.post.x, iy = inst.post.y;
            var disx = Math.abs(ix - this.post.x);
            var dirx = sign(ix - this.post.x);
            var colh = false;

            var disy = Math.abs(iy - this.post.y);
            var diry = sign(iy - this.post.y);
            var affect = true;
            switch(type){
              case 0:
              case 7: affect = false; break;
            }
            // Within Range
            if((disx <= TILE_SIZE*2)&&(disy <= TILE_SIZE*2)){
              // VERTICAL
              this.msk.update(ox, ny);
              if(this.place_meeting(inst)){
                this.msk.update(ox, oy);
                if(affect)this.vel.v = 0;
                switch(type){
                  case 3: // BOUNCYWALL
                    if(Math.abs(vs) < 4)vs *= Math.sign(vs)*4;
                    forcev = (vs*-2);
                    break;
                  case 6: // DANGERWALL
                    this.reset();
                    break;
                  case 7:
                    this.set_home(inst.post.x, inst.post.y);
                    break;
                }
                if(affect)vs = 0;
                if(diry == 1){
                  this.onground = true;
                  switch(type){
                    case 4: // SPEEDWALL
                      forceh = (hs*1.4);
                      break;
                    case 0: // PLAYERS
                    forcev = (vs*-2);
                      inst.reset();
                      this.score++;
                      break;
                  }
                  // Player hits top side of
                  if(affect)this.post.y = -1+inst.side_u-this.msk.hlfh;
                }else{
                  this.onwallB = true;
                  switch(type){
                    case 2: // STICKYWALL
                      this.cling = true;
                      this.stamina_charge();
                      break;
                  }
                  // Player hits bottom side of
                  if(affect)this.post.y = 1+inst.side_d+this.msk.hlfh;
                }
                if(affect){
                  ny = this.post.y;
                  this.msk.update(nx, oy);
                }
              }

              this.msk.update(nx, oy);
              if(this.place_meeting(inst)){
                this.msk.update(ox, oy);
                // HORIZONTAL
                if(affect){
                  this.vel.h = 0;
                  this.onwall = true;
                }
                switch(type){
                  case 2: // STICKYWALL
                    this.cling = true;
                    this.stamina_charge();
                    break;
                  case 3: // BOUNCYWALL
                    forceh = (hs*-1.5);
                    break;
                  case 5: // SLICKWALL
                    this.onwall = false;
                    break;
                  case 6: // DANGERWALL
                    this.reset();
                    break;
                  case 7: // CHECKPOINT
                    this.set_home(inst.post.x, inst.post.y);
                    break;
                }
                if(affect)hs = 0;
                if(dirx == 1){
                  
                  // Player hits left side of
                  if(affect)this.post.x = -1+inst.side_l-this.msk.hlfw;
                }else{
                  // Player hits right side of
                  if(affect)this.post.x = 1+inst.side_r+this.msk.hlfw;
                }
                if(affect){
                  nx = this.post.x;
                  this.msk.update(nx, ny);
                }
                //this.vel.h = hs;
                colh = true;
              }
            }
        }
      }
    }
    */
    // Update Position
    // add force to velocity
    if(forceh != 0)this.vel.h = forceh;
    var vx = (this.vel.h*this.spd);
    if(forcev != 0)this.vel.v = forcev;
    var vy = (this.vel.v*this.spd);
    this.post.x += vx;
    this.post.y += vy;
    // Force
    //this.post.x += forceh;
    //this.post.y += forcev;
    this.boundcheck();
    this.msk.update(this.post.x, this.post.y);

    //GAME.CAMERA.x = Math.floor(this.post.x) - (canvas.width / 2);
    //GAME.CAMERA.y = Math.floor(this.post.y) - (canvas.height / 2);
  }

  place_meeting(inst){
    // Check Collision Masks
    return rectIntersect(this.msk, inst.msk);
  }

  // Draw
  draw(){
    var ll = this.side_l;
    var ww = this.msk.ww;
    var uu = this.side_u;
    var hh = this.msk.hh;
    //draw_rectangle(ll, uu, ww, hh, this.color);
    if(this.type == 0){
      GAME.ctx.font = "128px Times";
      GAME.ctx.textAlign = "center";
      GAME.ctx.fillStyle = "lightyellow";
      GAME.ctx.fillText("$"+String(this.score), 128, 128);
      // Draw Player
      draw_set_color("#FFFFFF");
      if(this.stateslide.base != this.stateslide.dest)draw_set_color("red");
      var hfw = ww/2, hfh = hh/2;
      draw_line(this.side_l-hfw, this.side_u+hfh, this.side_l+hfw, this.side_d+hfh, 2, 0);
      draw_line(this.side_l+hfw, this.side_d+hfh, this.side_r+hfw, this.side_u+hfh, 2, 0);
      draw_line(this.side_l-hfw, this.side_u+hfh, this.side_l+hfw, this.side_u-hfh, 2, 0);
      draw_line(this.side_l+hfw, this.side_u-hfh, this.side_r+hfw, this.side_u+hfh, 2, 0);
      draw_set_color(this.color);
      draw_line(this.side_l, this.side_u, this.side_r, this.side_u, 2, 0);
      draw_line(this.side_l, this.side_d, this.side_r, this.side_d, 2, 0);
      draw_line(this.side_l, this.side_u, this.side_l, this.side_d, 2, 0);
      draw_line(this.side_r, this.side_u, this.side_r, this.side_d, 2, 0);
      // Draw 
      var fang = degToRad(this.faceangle), bang = degToRad(this.faceangle+96+this.batangle);
      var tarx = this.post.x+(lengthdir_x(64, fang)), tary = this.post.y+(lengthdir_y(64, fang));
      // Draw Direction
      draw_set_color("lightgreen");
      draw_line(this.post.x, this.post.y, tarx, tary, 2, 0);
      draw_set_color(this.color);
      // Draw cool circle thing
      //draw_surround_point(tarx, tary, 4, 128, 180);
      //draw_circle(tarx, tary, 8, 108);

      tarx = this.post.x+(lengthdir_x(128, bang));
      tary = this.post.y+(lengthdir_y(128, bang));
      // Draw
      draw_set_color("#FFF");
      draw_line(this.post.x, this.post.y, tarx, tary, 2, 0);
      // Draw Stamina
      draw_rectangle(ll, uu-64, this.msk.ww+16, 16, "#424242");
      var stmissing = (this.stamina_max - this.stamina)/2;
      draw_rectangle(ll, uu-64, (this.stamina / this.stamina_max)*(this.msk.ww+16), 16, "lightgreen");
      // Draw HP
      draw_rectangle(ll, uu-84, this.msk.ww+16, 16, "#424242");
      draw_rectangle(ll, uu-84, (this.hp / this.hp_max)*(this.msk.ww+16), 16, "tomato");
      // try drawing them centered
    }
  }

  // Render
  render(){
    this.update();
    this.draw();
  }
}

class PlayerOne extends AbstractEntity {
  constructor(xx, yy){
    super(0, xx, yy);
    this.input_set(0);
    this.LABEL = 1;
	this.color = "#FFD600";
  }
}

class PlayerTwo extends AbstractEntity {
  constructor(xx, yy){
    super(0, xx, yy);
    this.input_set(1);
    this.color = "#00BCD4";
  }
}

class Particle extends AbstractEntity {
  constructor(xx, yy){
    super(0, xx, yy);
    this.input_set(2);
    this.color = "#FFFFFF";
  }
}

class Wall extends AbstractEntity {
  constructor(xx, yy){
    super(1, xx, yy);
    this.color = "#FFFFFF";
  }
  
  update(){
    // DO NOTHING
  }
}

class StickyWall extends AbstractEntity {
  constructor(xx, yy){
    super(2, xx, yy);
    this.color = "#6A1B9A";
  }

  update(){
    // DO NOTHING
  }
}

class BouncyWall extends AbstractEntity {
  constructor(xx, yy){
    super(3, xx, yy);
    this.color = "#FFC400";
  }

  update(){
    // DO NOTHING
  }
}

class SpeedWall extends AbstractEntity {
  constructor(xx, yy){
    super(4, xx, yy);
    this.color = "#42A5F5";
  }

  update(){
    // DO NOTHING
  }
}

class SlickWall extends AbstractEntity {
  constructor(xx, yy){
    super(5, xx, yy);
    this.color = "#616161";
  }

  update(){
    // DO NOTHING
  }
}

class DangerWall extends AbstractEntity {
  constructor(xx, yy){
    super(6, xx, yy);
    this.color = "#EF6C00";
  }

  update(){
    // DO NOTHING
  }
}

class CheckPoint extends AbstractEntity {
  constructor(xx, yy){
    super(7, xx, yy);
    this.color = "#00C853";
  }

  update(){
    // DO NOTHING
  }
}

class HitRadius {
  constructor(xx, yy){
    this.LABEL = 0;
    this.radius = 0;
    this.post = {x: xx, y: yy};
    this.instID = GAME.INSTANCES.length;
    this.color = "tomato";
    this.radmax = 108;
    this.radspd = 20;
    this.creator = NONE;
    this.dmg = 1;
  }

  update(){
    this.radius = slide_into(this.radius, this.radmax, this.radspd);
    if(this.radius >= this.radmax)instance_destroy(this.instID);// Destroy
    if(this.dmg > 0){
      var gridw = GAME.INSTANCES.length;
      for(var i = 0; i < gridw; i++){
        var inst = GAME.INSTANCES[i];
        if(inst.LABEL == 1){
          // Vulnerable
          var dis = getDistance(this.post.x, this.post.y, inst.post.x, inst.post.y);
          if(dis <= this.radmax){
            // Damage
            if(this.creator != inst){
              // Can Damage
              if(inst.STATE == 0){
                // Vulnerable State
                //alert("hello");
                inst.damage(this.dmg);
                instance_destroy(this.instID);
                // Spawn Dust Effect
                var dstx = inst.post.x, dsty = inst.post.y;
                var shock = instance_add(11, dstx, dsty);
                shock.radspd = 18;
                shock.radmax = 24;
                shock.color = "orange";
              }
            }
          }
        }
      }
    }
  }

  draw(){
    if(this.dmg == 0){
      draw_set_color(this.color);
      draw_circle(this.post.x, this.post.y, 8, this.radius);
    }
  }

  render(){
    this.update();
    this.draw();
  }
}

class GrowRadius extends HitRadius {
  constructor(xx, yy){
    super(xx, yy);
    this.color = "#FFFFFF";
    this.radmax = 48;
    this.radspd = 6;
    this.dmg = 0;
  }

}

class Wave {
  constructor(xx, yy){
    this.instID = GAME.INSTANCES.length;
    this.LABEL = 0;
    this.post = {x: xx, y: yy};
    this.ang = 0;
    this.spd = 64;
    this.color = "violet";
    this.lifespan = 18;
    this.creator = NONE;
  }

  update(){
    this.post.x += lengthdir_x(this.spd, this.ang);
    this.post.y += lengthdir_y(this.spd, this.ang);
    this.lifespan--;
    if(this.lifespan <= 0)instance_destroy(this.instID);

    // Check for Vulnerable Instance
    var gridw = GAME.INSTANCES.length;
    for(var i = 0; i < gridw; i++){
      var inst = GAME.INSTANCES[i];
      if(inst.LABEL == 1){
        // Vulnerable
        var dis = getDistance(this.post.x, this.post.y, inst.post.x, inst.post.y);
        if(dis <= 48){
          // Damage
          if(this.creator != inst){
            // Can Damage
            if(inst.STATE == 0){
              //alert("hey");
              //var hit = new HitRadius(this.post.x, this.post.y);
              var hit = instance_add(10, this.post.x, this.post.y);
              hit.creator = this.creator;
              hit.dmg = 2;
              instance_destroy(this.instID);
            }
          }
        }
      }
    }
  }

  draw(){
    draw_set_color(this.color);
    draw_line(this.post.x, this.post.y, this.post.x-lengthdir_x(32, this.ang), this.post.y-lengthdir_y(32, this.ang), 4, 0);
    var wx = this.post.x - lengthdir_x(32, this.ang - 32);
    var wy = this.post.y - lengthdir_y(32, this.ang - 32);
    draw_line(this.post.x, this.post.y, wx, wy, 4, 0);
    var wx2 = this.post.x - lengthdir_x(32, this.ang + 32);
    var wy2 = this.post.y - lengthdir_y(32, this.ang + 32);
    draw_line(this.post.x, this.post.y, wx2, wy2, 4, 0);
    draw_set_color("#FFFFFF");
  }

  render(){
    this.update();
    this.draw();
  }
}

class Orb {
  constructor(xx, yy){
    this.instID = GAME.INSTANCES.length;
    this.LABEL = 0;
    this.post = {x: xx, y: yy};
    this.value = 1;
    this.color = "lightgreen";
    this.pulsate = new Pendulum(20, 16, 24, 6);

  }

  update(){
    this.pulsate.update();
    // sit around
    var pl = PLAYER;
    var dis = getDistance(this.post.x, this.post.y, pl.post.x, pl.post.y);
    if(dis < 48){
      this.effect(pl);
      instance_destroy(this.instID);
    }
  }

  effect(pl){
    pl.score++;
    pl.stamina = pl.stamina_max;
  }

  draw(){
    draw_set_color(this.color);
    draw_circle(this.post.x, this.post.y, 8, this.pulsate.base);
  }

  render(){
    this.update();
    this.draw();
  }
}

class OrbHP extends Orb {
  constructor(xx, yy){
    super(xx, yy);
    this.color = "tomato";
  }

  effect(pl){
    pl.hp+=4;
    if(pl.hp > pl.hp_max)pl.hp = pl.hp_max;
  }
}

class Spawner {
  constructor(xx, yy){
    this.instID = GAME.INSTANCES.length;
    this.LABEL = 0;
    this.post = {x: xx, y: yy};
  }

  update(){
    // do nothing
  }

  draw(){
    draw_set_color("red");
    draw_circle(this.post.x, this.post.y, 8, 32);
  }

  render(){
    this.update();
    this.draw();
  }
}

class SpawnerWave {
  // Spawn Waves
  constructor(xx, yy){
    this.instID = GAME.INSTANCES.length;
    this.LABEL = 0;
    this.post = {x: xx, y: yy};
    this.delay = new Slide(0, 0, 0.2);
    this.color = "purple";
  }

  update(){
    // do nothing
    this.delay.update();
    if(this.delay.base == this.delay.dest){
      // Open
      var pl = PLAYER;
      var dis = getDistance(this.post.x, this.post.y, pl.post.x, pl.post.y);
      if(dis < 320){
        // Spawn Wave
        //alert("spawn wave");
        var dir = degToRad(getDirection(this.post.x, this.post.y, pl.post.x, pl.post.y));
        var wave = instance_add(12, this.post.x, this.post.y);
        wave.ang = dir;
        wave.creator = this;
        this.delay.base = 1;
      }
    }
  }

  draw(){
    draw_set_color(this.color);
    draw_circle(this.post.x, this.post.y, 8, 32);
  }

  render(){
    this.update();
    this.draw();
  }
}

class Enemy {
  constructor(xx, yy){
    this.instID = GAME.INSTANCES.length;
    this.LABEL = 1;
    this.post = {x: xx, y: yy};
    this.vel = {h: 0, v: 0};
    this.spd = 6;
    this.faceangle = 0;
    this.dirchange = new Pendulum(0, -16, 16, 1);
    this.STATE = 0; // 0 - Neutral, 1- Damaged
    this.hp = 1;
    this.hp_max = 1;
  }

  boundcheck(){
    var half = 16;
    var sl = this.post.x - half, sr = this.post.x + half;
    var su = this.post.y - half, sd = this.post.y + half;
    if(sl > canvas.width)this.post.x = -half;
    if(sr < -half)this.post.x = canvas.width;//getElWidth("canvas");
    if(su > canvas.height)this.post.y = -half;
    if(sd < -half)this.post.y = canvas.height+half;//getElHeight("canvas");
  }

  update(){
    // do nothing
    this.dirchange.update();
    //var pl = GAME.PLAYER;
    var pl = PLAYER;
    var dis = getDistance(this.post.x, this.post.y, pl.post.x, pl.post.y);
    if(dis < 720){
      // Approach
      // Turn
      
      var dir = getDirection(this.post.x, this.post.y, pl.post.x, pl.post.y);
      this.faceangle = slide_into(this.faceangle, dir, 16);
      this.vel.h = slide_into(this.vel.h, lengthdir_x(6, degToRad(this.faceangle)), 1);
      this.vel.v = slide_into(this.vel.v, lengthdir_y(6, degToRad(this.faceangle)), 1);

      // Spawn Dust Effect
      var fang = degToRad(this.faceangle);
      var dstx = this.post.x, dsty = this.post.y;
      instance_add(11, dstx, dsty);

      // Damage
      if(pl.STATE == 0){
        if(dis < 48){
          //alert("hey");
          //var hit = new HitRadius(this.post.x, this.post.y);
          var hit = instance_add(10, this.post.x, this.post.y);
          hit.creator = this;
          hit.dmg = 4;
        }
      }
      
    }else{
      this.faceangle = slide_into(this.faceangle, this.faceangle+this.dirchange.base, 16);
      this.vel.h = slide_into(this.vel.h, lengthdir_x(6, degToRad(this.faceangle)), 0.1);
      this.vel.v = slide_into(this.vel.v, lengthdir_y(6, degToRad(this.faceangle)), 0.1);
      /*
      // Still
      this.vel.h = slide_into(this.vel.h, 0, 1);
      this.vel.v = slide_into(this.vel.v, 0, 1);
      */
    }
    
    var vx = (this.vel.h*this.spd);
    var vy = (this.vel.v*this.spd);
    this.post.x += vx;
    this.post.y += vy;
    this.boundcheck();
  }

  draw(){
    draw_set_color("red");
    draw_circle(this.post.x, this.post.y, 8, 32);
  }

  render(){
    this.update();
    this.draw();
  }

  damage(dmg){
    this.hp -= dmg;
    this.STATE = 1;
    if(this.hp <= 0){
      this.hp = 0;
      this.destroy();
    }
  }

  destroy(){
    // Spawn Loot Drops
    var chance = random_int(10);
    if(chance < 8){
      // Spawn OrbHP
      instance_add(16, this.post.x+4, this.post.y);
    }
    if(chance < 4){
      // Spawn Orb
      instance_add(13, this.post.x, this.post.y);
    }
    instance_destroy(this.instID);
    instance_add(15, 64, 64);
  }
}
 
/*
GAME STATES:
0 - INITIALIZATION
*/
var STATE = 0, PLAYER = NONE;
var GAME = {
  ctx: getByID("canvas").getContext("2d"),
  INSTANCES: [NONE, NONE],
  ALARM: new alarm_system(6),
  start: function(){
      this.interval = setInterval(update, 60);

      },
  CAMERA: new Camera(NONE),
  render: function(){
    draw_bg();
    draw_insts();
    //GAME.PLAYER.render();
  },
  //PLAYER: instance_add(0, canvas.width/2, canvas.height/2)//new PlayerOne(canvas.width/2, canvas.height/2)
}

// [ - - Game Methods - - ]
/**
  * Begin Game.
*/
function play(){
  GAME.start();
}

/**
  * Update Game.
*/
function update(){
  GAME.CAMERA.update();
  drawImage(imageObj.image);
  GAME.ALARM.update();
  
  switch(STATE){
    case 0: // INITIALIZATION
      //level_load(GAME.level[1]);
      PLAYER = instance_add(0, canvas.width/2, canvas.height/4);
      instance_add(1, canvas.width/2, canvas.height - canvas.height/4);
      /*
      var cwf = canvas.width/4, chf = canvas.height/4;
      instance_add(15, cwf+32, chf+32);
      // Wave Spawners
      instance_add(14, cwf, chf);
      instance_add(14, cwf, canvas.height - chf);
      instance_add(14, canvas.width - cwf, canvas.height - chf);
      instance_add(14, canvas.width - cwf, chf);
      */
      STATE = 1;
      break;
    case 1:
      break;
  }
  
}

// Drawing
function draw_bg(){
  draw_rectangle(GAME.CAMERA.x, GAME.CAMERA.y, canvas.width, canvas.height, "#000000");
}

function draw_insts(){
  if(STATE == 0)return;
  
  var grid = GAME.INSTANCES;
  var gridw = grid.length;
  for(var i = 0; i < gridw; i++){
    var inst = grid[i];
    if(inst != NONE){
      inst.render();
    }
  }
}

function level_switch(levelID){
  level_trash();
  GAME.ALARM.add(level_load, 1, levelID);
}

function level_load(plan){
  var planw = plan.length;
  var planh = plan[0].length;
  for(var i = 0; i < planw; i++){
    for(var j = 0; j < planh; j++){
      var type = NONE;
      var spot = plan[i].substring(j, j+1);
      switch(spot){
        case "@": type = 0; break; // PLAYER1
        case "%": type = 1; break; // PLAYER2
        case "X": type = 2; break; // WALL
        case "=": type = 3; break; // STICKYWALL
        case "O": type = 4; break; // BOUNCYWALL
        case ">": type = 5; break; // SPEEDWALL
        case "|": type = 6; break; // SLICKWALL
        case "*": type = 7; break; // DANGERWALL
        case "~": type = 8; break; // DANGERWALL
      }
      if(type != NONE){
        //alert("made a wall:"+i+", "+j);
        // Add Instance
        //var inst = new Instance(instID, posX, posY);
        var posX = j*TILE_SIZE, posY = i*TILE_SIZE;
        var inst = instance_create(type, posX, posY);
        GAME.INSTANCES.push(inst);
      }
    }
  }
}

function level_trash(){
  GAME.INSTANCES = [NONE, NONE];
}

function instance_add(type, xx, yy){
  var inst = instance_create(type, xx, yy);
  GAME.INSTANCES.push(inst);
  return inst;
}

function instance_create(type, xx, yy){
  switch(type){
    case 0: return new PlayerOne(xx, yy);
    case 1: return new PlayerTwo(xx, yy);
    case 2: return new Wall(xx, yy);
    case 3: return new StickyWall(xx, yy);
    case 4: return new BouncyWall(xx, yy);
    case 5: return new SpeedWall(xx, yy);
    case 6: return new SlickWall(xx, yy);
    case 7: return new DangerWall(xx, yy);
    case 8: return new CheckPoint(xx, yy);
    case 9: return new Particle(xx, yy);
    case 10: return new HitRadius(xx, yy);
    case 11: return new GrowRadius(xx, yy);
    case 12: return new Wave(xx, yy);
    case 13: return new Orb(xx, yy);
    case 14: return new SpawnerWave(xx, yy);
    case 15: return new Enemy(xx, yy);
    case 16: return new OrbHP(xx, yy);
  }
  return undefined;
}

function instance_destroy(instID){
  GAME.INSTANCES[instID] = NONE;
}

// [ - - Player Control Buttons - - ]
/**
  * Player Reset Button.
*/
function btn_reset(){
  STATE = 0;
}



// DISPLAY FIX - - - - - - - - - - - - - - -
$(window).bind(
  'touchmove',
   function(e) {
    e.preventDefault();
  }
);

// this function fill an image on canvas
function drawImage(image) {
   context.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);
}

// this function will render your drawings
var ww = 300;
function drawImage(stage) {

  GAME.render();

  //ww++;
  //context.fillRect (50, 50, ww, 700);
  //draw_rectangle(50, 50, ww, 700, "deepskyblue");
  //draw_rectangle(800, 100, 1000, 300, "darkseagreen");
  //draw_rectangle(1708, 200, 500, 900, "tomato");

  //alert("render");
}

function draw_set_color(color){
  context.fillStyle = color;
}

function draw_set_rgba(rr, gg, bb, aa){
  var col = "rgba("+String(rr)+","+String(gg)+","+String(bb)+","+String(aa)+")";
  draw_set_color(col);
}

function draw_rectangle(x1, y1, ww, hh){
  draw_set_color("#FFF");
  context.fillRect(Math.floor(x1-GAME.CAMERA.x), Math.floor(y1-GAME.CAMERA.y), ww, hh);
}
function draw_rectangle(x1, y1, ww, hh, color){
  draw_set_color(color);
  context.fillRect(x1-GAME.CAMERA.x, y1-GAME.CAMERA.y, ww, hh);
}

function draw_line(x1, y1, x2, y2, thickness, sep){
  var dis = getDistance(x1, y1, x2, y2);
  var angle = degToRad(getDirection(x1, y1, x2, y2));
  var truesize = thickness+sep;
  var spaces = Math.floor(dis / truesize);
  for(var i = 0; i < spaces; i++){
    var xx = x1 + lengthdir_x((thickness*i)+(sep*i), angle), yy = y1 + lengthdir_y((thickness*i)+(sep*i), angle);
    // Draw
    draw_rectangle(xx, yy, thickness, thickness);
  }
}

function draw_surround_point(xx, yy, thickness, sep, amount){
  var portion = 360 / amount;
  for(var i = 0; i <= amount; i++){
    var ang = i*portion;
    var lx = xx+lengthdir_x(sep, ang);
    var ly = yy+lengthdir_y(sep, ang);
    draw_pixel(lx, ly, thickness);
  }
}

function draw_circle(xx, yy, thickness, radius){
  draw_surround_point(xx, yy, thickness, radius, 360);
}

function draw_pixel(xx, yy, thickness){
  draw_rectangle(xx, yy, thickness, thickness);
}

// The Length between Two X Coordinates
function lengthdir_x(len, rad){
  return Math.cos(rad)*len;
}

// The Length between Two Y Coordinates
function lengthdir_y(len, rad){
  return Math.sin(rad)*len;
}

function getDistance(x1, y1, x2, y2){
  var disX = Math.abs(x2 - x1), disY = Math.abs(y2 - y1);
  disX *= disX;
  disY *= disY;
  return Math.sqrt(disX + disY);
}

function getDirection(x1, y1, x2, y2){
  var dy = y2 - y1, dx = x2 - x1;
  return radToDeg(Math.atan2(dy, dx));
}

function radToDeg(rad){
  return rad*(180 / Math.PI);
}

function degToRad(deg){
  return deg*(Math.PI / 180);
}

var imageObj = new Image();
imageObj.onload = function () {
   drawImage(image);
};

var drawStage = new Image();
drawStage.onload = function () {
   drawImage(stage);
};

// set this to false to maintain the canvas aspect ratio, or true otherwise
var stretch_to_fit = false;

function resize() {
   // aspect ratio
   var widthToHeight = canvas.width / canvas.height;
   var newWidthToHeight = widthToHeight;

   // cache the window dimensions (discount the border)
   var newWidth = window.innerWidth,
       newHeight = window.innerHeight;

   if (stretch_to_fit) {
       // overwrite the current canvas aspect ratio to fit the entire screen
       widthToHeight = window.innerWidth / window.innerHeight;
   } else {
       newWidthToHeight = newWidth / newHeight;
   }


   // scale the container using CSS		
   if (newWidthToHeight > widthToHeight) {
       newWidth = newHeight * widthToHeight;
       container.style.height = newHeight + 'px';
       container.style.width = newWidth + 'px';
   } else {
       newHeight = newWidth / widthToHeight;
       container.style.width = newWidth + 'px';
       container.style.height = newHeight + 'px';
   }

   // adjust the container position 
   container.style.marginTop = (-newHeight / 2) + 'px';
   container.style.marginLeft = (-newWidth / 2) + 'px';

};

// listen to resize events
window.addEventListener('resize', function () {
   resize();
}, false);

// also resize the screen on orientation changes
window.addEventListener('orientationchange', function () {
   resize();
}, false);

// draw the image on canvas
// note that you dont need to redraw on resize since the canvas element stays intact    
drawImage(imageObj);

// first resize
resize();




/*
  TODO:
  - New Entity Types [
    X- HitBox Radius
    X- Enemy AI 
    X- Orb (Player Currency)
    X- StaminaOrb (Refills Player Stamina)

  ]
*/
