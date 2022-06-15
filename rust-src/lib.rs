#[macro_use]
extern crate lazy_static;

mod utils;

use std::ptr;
use std::sync::RwLock;
use wasm_bindgen::prelude::*;
use js_sys::Array;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

const BIG_G: f64 = 0.00000000006674;
const TIME_STEP: f64 = 1.0;

lazy_static! {
    static ref UNIVERSE: RwLock<Vec<Body<'static>>> = RwLock::new(vec![]);
}

#[derive(Clone, Copy)]
pub struct Vector2D {
    x: f64,
    y: f64,
}

pub struct Body<'a> {
    mass: f64,
    position: Vector2D,
    velocity: Vector2D,
    scene: &'a RwLock<Vec<Body<'a>>>,
}

impl Body<'_> {
    fn next_velocity(&self) -> Vector2D {
        if self.mass.abs() < 0.000001 {
            return self.velocity;
        }

        let mut out: Vector2D = self.velocity;

        let uni = self.scene.read().unwrap();
        for i in 0..uni.len() {
            if !ptr::eq(&uni[i], self) && uni[i].mass.abs() > 0.000001 {
                let dx = self.position.x - uni[i].position.x;
                let dy = self.position.y - uni[i].position.y;

                let angle = dy.atan2(dx);

                let delta_v = BIG_G * uni[i].mass / (dx.powf(2.0) + dy.powf(2.0)) * TIME_STEP; // (G(m1)(m2)/d^2) / m1 * t = G(m2)/d^2 * t = at = delta_v

                out.x += delta_v * -angle.cos();
                out.y += delta_v * -angle.sin();
            }
        }

        return out;
    }

    fn next_position(&self) -> Vector2D {
        return Vector2D { x: self.position.x + self.velocity.x * TIME_STEP, y: self.position.y + self.velocity.y * TIME_STEP }; // x_new = x_old + vt
    }
}

#[wasm_bindgen]
pub fn step_time() {
    let mut next_velocities: Vec<Vector2D> = vec![];
    let mut next_positions: Vec<Vector2D> = vec![];
    
    {
        let uni = UNIVERSE.read().unwrap();
        for i in 0..uni.len() {
            next_velocities.push(uni[i].next_velocity());
        }
    }
    {
        let mut uni = UNIVERSE.write().unwrap();
        for i in 0..uni.len() {
            uni[i].velocity = next_velocities[i];
        }
    }
    {
        let uni = UNIVERSE.read().unwrap();
        for i in 0..uni.len() {
            next_positions.push(uni[i].next_position());
        }
    }
    {
        let mut uni = UNIVERSE.write().unwrap();
        for i in 0..uni.len() {
            uni[i].position = next_positions[i];
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
        scene: &UNIVERSE,
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
