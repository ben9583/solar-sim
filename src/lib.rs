mod utils;

use std::ptr;
use wasm_bindgen::prelude::*;
use js_sys::Array;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

const BIG_G: f64 = 0.00000000006674;
const TIME_STEP: f64 = 1.0;

static mut UNIVERSE: Vec<Body> = vec![];

#[derive(Clone, Copy)]
pub struct Vector2D {
    x: f64,
    y: f64,
}

pub struct Body<'a> {
    radius: f64,
    mass: f64,
    position: Vector2D,
    velocity: Vector2D,
    scene: &'a mut Vec<Body<'a>>,
}

impl Body<'_> {
    fn next_velocity(&mut self) {
        if self.mass.abs() < 0.000001 {
            return;
        }

        let mut out: Vector2D = self.velocity;

        for i in 0..self.scene.len() {
            if !ptr::eq(&self.scene[i], self) && self.scene[i].mass.abs() > 0.000001 {
                let dx = self.position.x - self.scene[i].position.x;
                let dy = self.position.y - self.scene[i].position.y;

                let angle = dy.atan2(dx);

                let distance = (dx.powf(2.0) + dy.powf(2.0)).sqrt();

                let acceleration = BIG_G * self.scene[i].mass / distance.powi(2);
                let delta_v = acceleration * TIME_STEP;

                out.x += delta_v * -angle.cos();
                out.y += delta_v * -angle.sin();
            }
        }

        self.velocity = out;
    }

    fn next_position(&mut self) {
        self.position.x += self.velocity.x * TIME_STEP;
        self.position.y += self.velocity.y * TIME_STEP;
    }
}

#[wasm_bindgen]
pub fn step_time() {
    unsafe {
        for i in 0..UNIVERSE.len() {
            UNIVERSE[i].next_velocity();
        }
        for i in 0..UNIVERSE.len() {
            UNIVERSE[i].next_position();
        }
    }
}

#[wasm_bindgen]
pub fn add_body(radius: f64, mass: f64, position_x: f64, position_y: f64, velocity_x: f64, velocity_y: f64) {
    unsafe {
        let new_body = Body {
            radius: radius,
            mass: mass,
            position: Vector2D {
                x: position_x,
                y: position_y,
            },
            velocity: Vector2D {
                x: velocity_x,
                y: velocity_y,
            },
            scene: &mut UNIVERSE,
        };

        UNIVERSE.push(new_body);
    }
}

#[wasm_bindgen]
pub fn remove_body(i: usize) {
    unsafe {
        if i < UNIVERSE.len() {
            UNIVERSE.remove(i);
        }
    }
}

#[wasm_bindgen]
pub fn get_positions() -> Array {
    unsafe {
        let out: Array = Array::new();
        
        for i in 0..UNIVERSE.len() {
            out.push(&JsValue::from_f64(UNIVERSE[i].position.x));
            out.push(&JsValue::from_f64(UNIVERSE[i].position.y));
        }

        return out;
    }
}