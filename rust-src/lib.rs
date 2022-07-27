#[macro_use]
extern crate lazy_static;

mod utils;

use std::sync::RwLock;
use wasm_bindgen::prelude::*;
use js_sys::Array;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

const BIG_G: f64 = 0.00000000006674;

lazy_static! {
    static ref UNIVERSE: RwLock<Vec<Body>> = RwLock::new(vec![]);
    static ref TIME_STEP: RwLock<f64> = RwLock::new(0.2);
    static ref NUM_SIMS_PER_STEP: RwLock<i32> = RwLock::new(5);
}

#[derive(Clone, Copy)]
pub struct Vector2D {
    x: f64,
    y: f64,
}

#[derive(Clone, Copy)]
pub struct Body {
    mass: f64,
    position: Vector2D,
    velocity: Vector2D,
}

impl Body {
    fn next_velocity(&mut self, uni: &Vec<Body>) {
        if self.mass.abs() < 0.000001 {
            return;
        }

        let ts = *(TIME_STEP.read().unwrap());

        for i in 0..uni.len() {
            if uni[i].mass.abs() > 0.000001 {
                let dx = self.position.x - uni[i].position.x;
                let dy = self.position.y - uni[i].position.y;

                let dist = dx.powf(2.0) + dy.powf(2.0);
                if dist < 0.0001 { continue; }

                let angle = dy.atan2(dx);

                let delta_v = (BIG_G * uni[i].mass / dist) * ts; // (G(m1)(m2)/d^2) / m1 * t = G(m2)/d^2 * t = at = delta_v

                self.velocity.x += delta_v * -angle.cos();
                self.velocity.y += delta_v * -angle.sin();
            }
        }
    }

    fn next_position(&mut self) {
        let ts = *(TIME_STEP.read().unwrap());

        self.position.x += self.velocity.x * ts;
        self.position.y += self.velocity.y * ts;
    }
}

#[wasm_bindgen]
pub fn step_time() {
    let mut uni = UNIVERSE.write().unwrap();
    let num_bodies = uni.len();

    let nsps = *(NUM_SIMS_PER_STEP.read().unwrap());

    for _ in 0..nsps {
        for i in 0..num_bodies {
            let mut body = uni[i];
            body.next_velocity(&uni);
            uni[i] = body;
        }
        for i in 0..num_bodies {
            uni[i].next_position();
        }
    }
}

#[wasm_bindgen]
pub fn add_body(mass: f64, position_x: f64, position_y: f64, velocity_x: f64, velocity_y: f64) {
    let new_body = Body {
        mass: mass,
        position: Vector2D {
            x: position_x,
            y: position_y,
        },
        velocity: Vector2D {
            x: velocity_x,
            y: velocity_y,
        },
    };

    UNIVERSE.write().unwrap().push(new_body);
}

#[wasm_bindgen]
pub fn remove_body(i: usize) {
    let mut uni = UNIVERSE.write().unwrap();
    if i < uni.len() {
        uni.remove(i);
    }
}

#[wasm_bindgen]
pub fn clear_universe() {
    UNIVERSE.write().unwrap().clear();
}

#[wasm_bindgen]
pub fn get_positions() -> Array {
    let uni = UNIVERSE.read().unwrap();
    let out: Array = Array::new();
    
    for i in 0..uni.len() {
        out.push(&JsValue::from_f64(uni[i].position.x));
        out.push(&JsValue::from_f64(uni[i].position.y));
    }

    return out;
}

#[wasm_bindgen]
pub fn get_velocities() -> Array {
    let uni = UNIVERSE.read().unwrap();
    let out: Array = Array::new();
    
    for i in 0..uni.len() {
        out.push(&JsValue::from_f64(uni[i].velocity.x));
        out.push(&JsValue::from_f64(uni[i].velocity.y));
    }

    return out;
}

#[wasm_bindgen]
pub fn set_simulation_accuracy(time_step: f64, num_sims_per_step: i32) {
    let mut ts = TIME_STEP.write().unwrap();
    *ts = time_step;

    let mut nsps = NUM_SIMS_PER_STEP.write().unwrap();
    *nsps = num_sims_per_step;
}