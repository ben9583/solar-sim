<div align="center">

  <h1>Solar Sim 🪐</h1>

  <strong>A planetary body simulator with a HTML5/CSS3/JS frontend and simulated using Rust WebAssembly.</strong>
  
  <a href="https://www.ocf.berkeley.edu/~bplate/solarsim/latest/"><b>Try the latest version here!</b></a>
  
  <img src="https://app.travis-ci.com/ben9583/solar-sim.svg?token=WtRJ5C3dvCnaJwX6svrD&branch=main" alt="Travis CI Build Status" />

  <sub>Built with 🦀🕸 by <a href="https://rustwasm.github.io/">The Rust and WebAssembly Working Group</a></sub>
  
  ![Preview of Solar Sim](https://user-images.githubusercontent.com/16968917/173254046-1da624e7-bbaf-4ad0-be30-27895b9e7ae2.gif)
  
</div>

## About

This is a hobby project I started in 2020 as part of a project about [Lagrange points](https://youtu.be/03I7-etQ6Xc) for an astronomy class I took. Originally, this was written purely in JavaScript, but the performance was quite bad even on my i9 MacBook Pro and had a lot of stuttering, especially on Firefox. Almost 2 years later, I decided to return to the project to see if I could make it more useful for other people.

Now that it uses Rust WebAssembly, the performance is significantly better and uses much less CPU. I'm looking to expand the functionality by allowing users to add and remove planets, change the speed of the simulation, and maybe expand from Lagrange points to other educational topics about space, such as the Three-Body Problem.

## Install

Before getting started, you will need [NodeJS v16](https://nodejs.org/dist/latest-v16.x/) and the [Rust Toolchain](https://www.rust-lang.org/tools/install).

Once you have these, begin by cloning the repo and updating `rustup`:
```sh
git clone https://github.com/ben9583/solar-sim.git solar-sim
cd solar-sim
rustup update
```
You will also need to install the requisite `npm` packages. Remember to be on NodeJS v16 if you use `nvm`.
```sh
cd website-src
npm install
cd ..
```

## Develop

Ensure you are in the root directory of this project. Begin by creating the `npm` package using `wasm-pack`; this will create the package in `./pkg`.
```sh
wasm-pack build
```
To start the website for development, run the following command in `website-src`. This will reload the website when you make a change or run `wasm-pack build` again.
```sh
cd website-src
npm start
```

## Build

Finally, to make a production-ready build, use `npm run build` to generate a static website in `website-src/dist`:
```sh
cd website-src
npm run build
```

## Links

* [`wasm-bindgen`](https://github.com/rustwasm/wasm-bindgen) for communicating
  between WebAssembly and JavaScript.
* [`console_error_panic_hook`](https://github.com/rustwasm/console_error_panic_hook)
  for logging panic messages to the developer console.
* [`wee_alloc`](https://github.com/rustwasm/wee_alloc), an allocator optimized
  for small code size.
