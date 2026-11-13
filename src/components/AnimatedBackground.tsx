import React, { useEffect, useRef } from 'react';

interface ColorRGB {
  r: number;
  g: number;
  b: number;
}

// Soft, low-saturation pearlescent mist palette matching the airy reference fluid:
// Warm cream mist, pale sea-mint, soft lilac, ice blue, and muted blush haze
const FLUID_PALETTE: ColorRGB[] = [
  { r: 0.88, g: 0.83, b: 0.72 }, // Warm pearl cream
  { r: 0.64, g: 0.84, b: 0.82 }, // Pale sea-mint mist
  { r: 0.74, g: 0.70, b: 0.88 }, // Soft lavender-lilac haze
  { r: 0.66, g: 0.78, b: 0.90 }, // Muted ice cyan
  { r: 0.86, g: 0.70, b: 0.78 }, // Dusty rose / blush mist
  { r: 0.70, g: 0.86, b: 0.76 }, // Light sage mist
];

function lerpColor(a: ColorRGB, b: ColorRGB, t: number): ColorRGB {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  };
}

function getContinuousColor(phase: number, brightness = 0.22): ColorRGB {
  const len = FLUID_PALETTE.length;
  const wrapped = ((phase % len) + len) % len;
  const idx = Math.floor(wrapped);
  const next = (idx + 1) % len;
  const frac = wrapped - idx;
  const c = lerpColor(FLUID_PALETTE[idx], FLUID_PALETTE[next], frac);
  return {
    r: c.r * brightness,
    g: c.g * brightness,
    b: c.b * brightness,
  };
}

export const AnimatedBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const contextParams: WebGLContextAttributes = {
      alpha: false,
      depth: false,
      stencil: false,
      antialias: false,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance',
    };

    let gl: WebGL2RenderingContext | WebGLRenderingContext | null =
      (canvas.getContext('webgl2', contextParams) as WebGL2RenderingContext | null);
    const isWebGL2 = Boolean(gl);

    if (!gl) {
      gl = (canvas.getContext('webgl', contextParams) ||
        canvas.getContext('experimental-webgl', contextParams)) as WebGLRenderingContext | null;
    }

    if (!gl) {
      return;
    }

    const webgl = gl;

    // Detect float/half-float texture support
    let halfFloatTexType: number = webgl.UNSIGNED_BYTE;
    let supportLinearFiltering = false;

    if (isWebGL2) {
      const gl2 = webgl as WebGL2RenderingContext;
      gl2.getExtension('EXT_color_buffer_float');
      supportLinearFiltering = Boolean(gl2.getExtension('OES_texture_float_linear'));
      halfFloatTexType = gl2.HALF_FLOAT;
    } else {
      const halfFloatExt = webgl.getExtension('OES_texture_half_float');
      supportLinearFiltering = Boolean(webgl.getExtension('OES_texture_half_float_linear'));
      if (halfFloatExt) {
        halfFloatTexType = halfFloatExt.HALF_FLOAT_OES;
      }
    }

    const getSupportedFormat = (
      internalFormat: number,
      format: number,
      type: number
    ): { internalFormat: number; format: number; type: number } => {
      const tex = webgl.createTexture();
      webgl.bindTexture(webgl.TEXTURE_2D, tex);
      webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MIN_FILTER, webgl.NEAREST);
      webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MAG_FILTER, webgl.NEAREST);
      webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_S, webgl.CLAMP_TO_EDGE);
      webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_T, webgl.CLAMP_TO_EDGE);
      webgl.texImage2D(webgl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);

      const fbo = webgl.createFramebuffer();
      webgl.bindFramebuffer(webgl.FRAMEBUFFER, fbo);
      webgl.framebufferTexture2D(webgl.FRAMEBUFFER, webgl.COLOR_ATTACHMENT0, webgl.TEXTURE_2D, tex, 0);
      const status = webgl.checkFramebufferStatus(webgl.FRAMEBUFFER);

      webgl.deleteFramebuffer(fbo);
      webgl.deleteTexture(tex);
      webgl.bindFramebuffer(webgl.FRAMEBUFFER, null);

      if (status === webgl.FRAMEBUFFER_COMPLETE) {
        return { internalFormat, format, type };
      }

      // Fallback to 8-bit RGBA if half-float FBOs aren't renderable on this GPU/driver
      return {
        internalFormat: webgl.RGBA,
        format: webgl.RGBA,
        type: webgl.UNSIGNED_BYTE,
      };
    };

    const rgbaFormat = isWebGL2
      ? getSupportedFormat((webgl as WebGL2RenderingContext).RGBA16F, webgl.RGBA, halfFloatTexType)
      : getSupportedFormat(webgl.RGBA, webgl.RGBA, halfFloatTexType);

    const rgFormat = isWebGL2
      ? getSupportedFormat(
          (webgl as WebGL2RenderingContext).RG16F,
          (webgl as WebGL2RenderingContext).RG,
          halfFloatTexType
        )
      : rgbaFormat;

    const rFormat = isWebGL2
      ? getSupportedFormat(
          (webgl as WebGL2RenderingContext).R16F,
          (webgl as WebGL2RenderingContext).RED,
          halfFloatTexType
        )
      : rgbaFormat;

    const filterMode = supportLinearFiltering ? webgl.LINEAR : webgl.NEAREST;

    // Shader compilation helpers
    const compileShader = (type: number, source: string): WebGLShader => {
      const shader = webgl.createShader(type)!;
      webgl.shaderSource(shader, source);
      webgl.compileShader(shader);
      return shader;
    };

    const createProgram = (vertexSrc: string, fragmentSrc: string) => {
      const program = webgl.createProgram()!;
      const vs = compileShader(webgl.VERTEX_SHADER, vertexSrc);
      const fs = compileShader(webgl.FRAGMENT_SHADER, fragmentSrc);
      webgl.attachShader(program, vs);
      webgl.attachShader(program, fs);
      webgl.linkProgram(program);

      const uniforms: Record<string, WebGLUniformLocation | null> = {};
      const uniformCount = webgl.getProgramParameter(program, webgl.ACTIVE_UNIFORMS);
      for (let i = 0; i < uniformCount; i++) {
        const info = webgl.getActiveUniform(program, i);
        if (info) {
          uniforms[info.name] = webgl.getUniformLocation(program, info.name);
        }
      }

      return {
        program,
        uniforms,
        bind: () => webgl.useProgram(program),
      };
    };

    const baseVertexShader = `
      precision highp float;
      attribute vec2 aPosition;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform vec2 texelSize;
      void main () {
        vUv = aPosition * 0.5 + 0.5;
        vL = vUv - vec2(texelSize.x, 0.0);
        vR = vUv + vec2(texelSize.x, 0.0);
        vT = vUv + vec2(0.0, texelSize.y);
        vB = vUv - vec2(0.0, texelSize.y);
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    const clearShaderSrc = `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      uniform sampler2D uTexture;
      uniform float value;
      void main () {
        gl_FragColor = value * texture2D(uTexture, vUv);
      }
    `;

    const splatShaderSrc = `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      uniform sampler2D uTarget;
      uniform float aspectRatio;
      uniform vec3 color;
      uniform vec2 point;
      uniform float radius;
      void main () {
        vec2 p = vUv - point.xy;
        p.x *= aspectRatio;
        vec3 splat = exp(-dot(p, p) / radius) * color;
        vec3 base = texture2D(uTarget, vUv).xyz;
        gl_FragColor = vec4(base + splat, 1.0);
      }
    `;

    const advectionShaderSrc = `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      uniform sampler2D uVelocity;
      uniform sampler2D uSource;
      uniform vec2 texelSize;
      uniform vec2 dyeTexelSize;
      uniform float dt;
      uniform float dissipation;

      vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
        vec2 st = uv / tsize - 0.5;
        vec2 iuv = floor(st);
        vec2 fuv = fract(st);
        vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
        vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
        vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
        vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
        return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
      }

      void main () {
        ${
          supportLinearFiltering
            ? `
          vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
          vec4 result = texture2D(uSource, coord);
        `
            : `
          vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
          vec4 result = bilerp(uSource, coord, dyeTexelSize);
        `
        }
        float decay = 1.0 + dissipation * dt;
        gl_FragColor = result / decay;
      }
    `;

    const divergenceShaderSrc = `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uVelocity, vL).x;
        float R = texture2D(uVelocity, vR).x;
        float T = texture2D(uVelocity, vT).y;
        float B = texture2D(uVelocity, vB).y;
        vec2 C = texture2D(uVelocity, vUv).xy;
        if (vL.x < 0.0) { L = -C.x; }
        if (vR.x > 1.0) { R = -C.x; }
        if (vT.y > 1.0) { T = -C.y; }
        if (vB.y < 0.0) { B = -C.y; }
        float div = 0.5 * (R - L + T - B);
        gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
      }
    `;

    const curlShaderSrc = `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uVelocity, vL).y;
        float R = texture2D(uVelocity, vR).y;
        float T = texture2D(uVelocity, vT).x;
        float B = texture2D(uVelocity, vB).x;
        float vorticity = R - L - T + B;
        gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
      }
    `;

    const vorticityShaderSrc = `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uVelocity;
      uniform sampler2D uCurl;
      uniform float curl;
      uniform float dt;
      void main () {
        float L = texture2D(uCurl, vL).x;
        float R = texture2D(uCurl, vR).x;
        float T = texture2D(uCurl, vT).x;
        float B = texture2D(uCurl, vB).x;
        float C = texture2D(uCurl, vUv).x;
        vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
        force /= length(force) + 0.0001;
        force *= curl * C;
        force.y *= -1.0;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity += force * dt;
        velocity = min(max(velocity, -1000.0), 1000.0);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
      }
    `;

    const pressureShaderSrc = `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uPressure;
      uniform sampler2D uDivergence;
      void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        float divergence = texture2D(uDivergence, vUv).x;
        float pressure = (L + R + B + T - divergence) * 0.25;
        gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
      }
    `;

    const gradientSubtractShaderSrc = `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uPressure;
      uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity.xy -= vec2(R - L, T - B);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
      }
    `;

    // Display shader with soft pearlescent bloom shading & pure #030305 obsidian floor
    const displayShaderSrc = `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uTexture;
      uniform vec2 texelSize;
      void main () {
        vec3 c = texture2D(uTexture, vUv).rgb;

        // Soft 4-tap halo diffusion for velvety volumetric smoke edges
        vec3 blur = (
          texture2D(uTexture, vL).rgb +
          texture2D(uTexture, vR).rgb +
          texture2D(uTexture, vT).rgb +
          texture2D(uTexture, vB).rgb
        ) * 0.25;

        vec3 color = mix(c, blur, 0.35);

        // Desaturate slightly & apply gentle mist intensity scaling
        float gray = dot(color, vec3(0.299, 0.587, 0.114));
        color = mix(vec3(gray), color, 0.58);
        color *= 0.52;

        // Soft filmic compression over pure obsidian black (#030305)
        color = color / (1.0 + color * 0.85);
        vec3 baseBg = vec3(0.012, 0.012, 0.020);
        gl_FragColor = vec4(baseBg + color, 1.0);
      }
    `;

    // Fullscreen quad geometry
    const quadBuffer = webgl.createBuffer();
    webgl.bindBuffer(webgl.ARRAY_BUFFER, quadBuffer);
    webgl.bufferData(
      webgl.ARRAY_BUFFER,
      new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]),
      webgl.STATIC_DRAW
    );
    const indexBuffer = webgl.createBuffer();
    webgl.bindBuffer(webgl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    webgl.bufferData(webgl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), webgl.STATIC_DRAW);

    webgl.vertexAttribPointer(0, 2, webgl.FLOAT, false, 0, 0);
    webgl.enableVertexAttribArray(0);

    interface FBO {
      texture: WebGLTexture;
      fbo: WebGLFramebuffer;
      width: number;
      height: number;
      texelSizeX: number;
      texelSizeY: number;
      attach: (id: number) => number;
    }

    interface DoubleFBO {
      width: number;
      height: number;
      texelSizeX: number;
      texelSizeY: number;
      read: FBO;
      write: FBO;
      swap: () => void;
    }

    const createFBO = (
      w: number,
      h: number,
      internalFormat: number,
      format: number,
      type: number,
      param: number
    ): FBO => {
      webgl.activeTexture(webgl.TEXTURE0);
      const texture = webgl.createTexture()!;
      webgl.bindTexture(webgl.TEXTURE_2D, texture);
      webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MIN_FILTER, param);
      webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MAG_FILTER, param);
      webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_S, webgl.CLAMP_TO_EDGE);
      webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_T, webgl.CLAMP_TO_EDGE);
      webgl.texImage2D(webgl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);

      const fbo = webgl.createFramebuffer()!;
      webgl.bindFramebuffer(webgl.FRAMEBUFFER, fbo);
      webgl.framebufferTexture2D(webgl.FRAMEBUFFER, webgl.COLOR_ATTACHMENT0, webgl.TEXTURE_2D, texture, 0);
      webgl.viewport(0, 0, w, h);
      webgl.clear(webgl.COLOR_BUFFER_BIT);

      return {
        texture,
        fbo,
        width: w,
        height: h,
        texelSizeX: 1.0 / w,
        texelSizeY: 1.0 / h,
        attach: (id: number) => {
          webgl.activeTexture(webgl.TEXTURE0 + id);
          webgl.bindTexture(webgl.TEXTURE_2D, texture);
          return id;
        },
      };
    };

    const createDoubleFBO = (
      w: number,
      h: number,
      internalFormat: number,
      format: number,
      type: number,
      param: number
    ): DoubleFBO => {
      let fbo1 = createFBO(w, h, internalFormat, format, type, param);
      let fbo2 = createFBO(w, h, internalFormat, format, type, param);
      return {
        width: w,
        height: h,
        texelSizeX: fbo1.texelSizeX,
        texelSizeY: fbo1.texelSizeY,
        get read() {
          return fbo1;
        },
        set read(value) {
          fbo1 = value;
        },
        get write() {
          return fbo2;
        },
        set write(value) {
          fbo2 = value;
        },
        swap() {
          const temp = fbo1;
          fbo1 = fbo2;
          fbo2 = temp;
        },
      };
    };

    const blit = (target: FBO | null) => {
      if (!target) {
        webgl.viewport(0, 0, webgl.drawingBufferWidth, webgl.drawingBufferHeight);
        webgl.bindFramebuffer(webgl.FRAMEBUFFER, null);
      } else {
        webgl.viewport(0, 0, target.width, target.height);
        webgl.bindFramebuffer(webgl.FRAMEBUFFER, target.fbo);
      }
      webgl.drawElements(webgl.TRIANGLES, 6, webgl.UNSIGNED_SHORT, 0);
    };

    // Compile shader programs
    const clearProgram = createProgram(baseVertexShader, clearShaderSrc);
    const splatProgram = createProgram(baseVertexShader, splatShaderSrc);
    const advectionProgram = createProgram(baseVertexShader, advectionShaderSrc);
    const divergenceProgram = createProgram(baseVertexShader, divergenceShaderSrc);
    const curlProgram = createProgram(baseVertexShader, curlShaderSrc);
    const vorticityProgram = createProgram(baseVertexShader, vorticityShaderSrc);
    const pressureProgram = createProgram(baseVertexShader, pressureShaderSrc);
    const gradientSubtractProgram = createProgram(baseVertexShader, gradientSubtractShaderSrc);
    const displayProgram = createProgram(baseVertexShader, displayShaderSrc);

    const getResolution = (resolution: number) => {
      let aspectRatio = webgl.drawingBufferWidth / Math.max(1, webgl.drawingBufferHeight);
      if (aspectRatio < 1) aspectRatio = 1.0 / aspectRatio;
      const min = Math.round(resolution);
      const max = Math.round(resolution * aspectRatio);
      if (webgl.drawingBufferWidth > webgl.drawingBufferHeight) {
        return { width: max, height: min };
      }
      return { width: min, height: max };
    };

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.max(1, Math.floor(window.innerWidth * dpr));
      const h = Math.max(1, Math.floor(window.innerHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        return true;
      }
      return false;
    };

    resizeCanvas();

    const SIM_RESOLUTION = 128;
    const DYE_RESOLUTION = 768;
    const DENSITY_DISSIPATION = 1.85;
    const VELOCITY_DISSIPATION = 0.72;
    const PRESSURE = 0.8;
    const PRESSURE_ITERATIONS = 18;
    const CURL = 26;
    const SPLAT_RADIUS = 0.25;
    const SPLAT_FORCE = 5200;

    let simRes = getResolution(SIM_RESOLUTION);
    let dyeRes = getResolution(DYE_RESOLUTION);

    let dye = createDoubleFBO(
      dyeRes.width,
      dyeRes.height,
      rgbaFormat.internalFormat,
      rgbaFormat.format,
      rgbaFormat.type,
      filterMode
    );
    let velocity = createDoubleFBO(
      simRes.width,
      simRes.height,
      rgFormat.internalFormat,
      rgFormat.format,
      rgFormat.type,
      filterMode
    );
    let divergence = createFBO(
      simRes.width,
      simRes.height,
      rFormat.internalFormat,
      rFormat.format,
      rFormat.type,
      webgl.NEAREST
    );
    let curl = createFBO(
      simRes.width,
      simRes.height,
      rFormat.internalFormat,
      rFormat.format,
      rFormat.type,
      webgl.NEAREST
    );
    let pressure = createDoubleFBO(
      simRes.width,
      simRes.height,
      rFormat.internalFormat,
      rFormat.format,
      rFormat.type,
      webgl.NEAREST
    );

    const correctRadius = (radius: number) => {
      const aspectRatio = canvas.width / Math.max(1, canvas.height);
      return aspectRatio > 1 ? radius * aspectRatio : radius;
    };

    const splat = (x: number, y: number, dx: number, dy: number, color: ColorRGB, radiusScale = 1.0) => {
      splatProgram.bind();
      webgl.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0));
      webgl.uniform1f(splatProgram.uniforms.aspectRatio, canvas.width / Math.max(1, canvas.height));
      webgl.uniform2f(splatProgram.uniforms.point, x, y);
      webgl.uniform3f(splatProgram.uniforms.color, dx, dy, 0.0);
      webgl.uniform1f(splatProgram.uniforms.radius, correctRadius((SPLAT_RADIUS * radiusScale) / 100.0));
      blit(velocity.write);
      velocity.swap();

      webgl.uniform1i(splatProgram.uniforms.uTarget, dye.read.attach(0));
      webgl.uniform3f(splatProgram.uniforms.color, color.r, color.g, color.b);
      blit(dye.write);
      dye.swap();
    };

    // Emit an initial gentle mist swirl so the hero feels softly illuminated on first paint
    const emitInitialSwirl = () => {
      const strokes = [
        { x: 0.72, y: 0.56, dx: -280, dy: 210, phase: 0.2 },
        { x: 0.65, y: 0.48, dx: 240, dy: 260, phase: 1.6 },
        { x: 0.78, y: 0.44, dx: -220, dy: -190, phase: 2.8 },
      ];
      strokes.forEach((s) => {
        splat(s.x, s.y, s.dx, s.dy, getContinuousColor(s.phase, 0.14), 1.4);
      });
    };

    emitInitialSwirl();

    // Pointer tracking with continuous ribbon interpolation
    let colorPhase = 0;
    let lastPointerTime = performance.now();
    const pointer = {
      x: 0.5,
      y: 0.5,
      prevX: 0.5,
      prevY: 0.5,
      initialized: false,
    };

    const injectPointerStroke = (clientX: number, clientY: number) => {
      const nx = clientX / Math.max(1, window.innerWidth);
      const ny = 1.0 - clientY / Math.max(1, window.innerHeight);

      if (!pointer.initialized) {
        pointer.x = nx;
        pointer.y = ny;
        pointer.prevX = nx;
        pointer.prevY = ny;
        pointer.initialized = true;
        return;
      }

      pointer.prevX = pointer.x;
      pointer.prevY = pointer.y;
      pointer.x = nx;
      pointer.y = ny;

      const deltaX = pointer.x - pointer.prevX;
      const deltaY = pointer.y - pointer.prevY;
      const dist = Math.hypot(deltaX, deltaY);

      if (dist < 0.0005) return;

      lastPointerTime = performance.now();
      colorPhase += dist * 2.8 + 0.03;

      // Interpolate intermediate splats along fast mouse movements to keep the ribbon silky and unbroken
      const steps = Math.min(8, Math.max(1, Math.ceil(dist / 0.015)));
      const aspectRatio = canvas.width / Math.max(1, canvas.height);
      const scaledDx = deltaX * SPLAT_FORCE * (aspectRatio < 1 ? aspectRatio : 1);
      const scaledDy = deltaY * SPLAT_FORCE * (aspectRatio > 1 ? 1 / aspectRatio : 1);
      const stepDx = scaledDx / steps;
      const stepDy = scaledDy / steps;
      const color = getContinuousColor(colorPhase, 0.085 / Math.sqrt(steps));

      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const ix = pointer.prevX + deltaX * t;
        const iy = pointer.prevY + deltaY * t;
        splat(ix, iy, stepDx, stepDy, color, 1.05);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (prefersReducedMotion) return;
      injectPointerStroke(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (prefersReducedMotion || e.touches.length === 0) return;
      const touch = e.touches[0];
      injectPointerStroke(touch.clientX, touch.clientY);
    };

    const handleResize = () => {
      if (resizeCanvas()) {
        simRes = getResolution(SIM_RESOLUTION);
        dyeRes = getResolution(DYE_RESOLUTION);
        dye = createDoubleFBO(
          dyeRes.width,
          dyeRes.height,
          rgbaFormat.internalFormat,
          rgbaFormat.format,
          rgbaFormat.type,
          filterMode
        );
        velocity = createDoubleFBO(
          simRes.width,
          simRes.height,
          rgFormat.internalFormat,
          rgFormat.format,
          rgFormat.type,
          filterMode
        );
        divergence = createFBO(
          simRes.width,
          simRes.height,
          rFormat.internalFormat,
          rFormat.format,
          rFormat.type,
          webgl.NEAREST
        );
        curl = createFBO(
          simRes.width,
          simRes.height,
          rFormat.internalFormat,
          rFormat.format,
          rFormat.type,
          webgl.NEAREST
        );
        pressure = createDoubleFBO(
          simRes.width,
          simRes.height,
          rFormat.internalFormat,
          rFormat.format,
          rFormat.type,
          webgl.NEAREST
        );
        emitInitialSwirl();
      }
    };

    let isTabVisible = true;
    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const stepSimulation = (dt: number) => {
      webgl.disable(webgl.BLEND);

      // 1. Curl
      curlProgram.bind();
      webgl.uniform2f(curlProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      webgl.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0));
      blit(curl);

      // 2. Vorticity Confinement
      vorticityProgram.bind();
      webgl.uniform2f(vorticityProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      webgl.uniform1i(vorticityProgram.uniforms.uVelocity, velocity.read.attach(0));
      webgl.uniform1i(vorticityProgram.uniforms.uCurl, curl.attach(1));
      webgl.uniform1f(vorticityProgram.uniforms.curl, CURL);
      webgl.uniform1f(vorticityProgram.uniforms.dt, dt);
      blit(velocity.write);
      velocity.swap();

      // 3. Divergence
      divergenceProgram.bind();
      webgl.uniform2f(divergenceProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      webgl.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.read.attach(0));
      blit(divergence);

      // 4. Clear pressure slightly
      clearProgram.bind();
      webgl.uniform1i(clearProgram.uniforms.uTexture, pressure.read.attach(0));
      webgl.uniform1f(clearProgram.uniforms.value, PRESSURE);
      blit(pressure.write);
      pressure.swap();

      // 5. Jacobi Pressure Solve
      pressureProgram.bind();
      webgl.uniform2f(pressureProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      webgl.uniform1i(pressureProgram.uniforms.uDivergence, divergence.attach(0));
      for (let i = 0; i < PRESSURE_ITERATIONS; i++) {
        webgl.uniform1i(pressureProgram.uniforms.uPressure, pressure.read.attach(1));
        blit(pressure.write);
        pressure.swap();
      }

      // 6. Subtract Pressure Gradient
      gradientSubtractProgram.bind();
      webgl.uniform2f(gradientSubtractProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      webgl.uniform1i(gradientSubtractProgram.uniforms.uPressure, pressure.read.attach(0));
      webgl.uniform1i(gradientSubtractProgram.uniforms.uVelocity, velocity.read.attach(1));
      blit(velocity.write);
      velocity.swap();

      // 7. Advect Velocity
      advectionProgram.bind();
      webgl.uniform2f(advectionProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      webgl.uniform2f(advectionProgram.uniforms.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY);
      const velocityId = velocity.read.attach(0);
      webgl.uniform1i(advectionProgram.uniforms.uVelocity, velocityId);
      webgl.uniform1i(advectionProgram.uniforms.uSource, velocityId);
      webgl.uniform1f(advectionProgram.uniforms.dt, dt);
      webgl.uniform1f(advectionProgram.uniforms.dissipation, VELOCITY_DISSIPATION);
      blit(velocity.write);
      velocity.swap();

      // 8. Advect Dye
      webgl.uniform2f(advectionProgram.uniforms.dyeTexelSize, dye.texelSizeX, dye.texelSizeY);
      webgl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
      webgl.uniform1i(advectionProgram.uniforms.uSource, dye.read.attach(1));
      webgl.uniform1f(advectionProgram.uniforms.dissipation, DENSITY_DISSIPATION);
      blit(dye.write);
      dye.swap();
    };

    const renderToScreen = () => {
      webgl.blendFunc(webgl.ONE, webgl.ONE_MINUS_SRC_ALPHA);
      webgl.enable(webgl.BLEND);
      displayProgram.bind();
      webgl.uniform2f(displayProgram.uniforms.texelSize, 1.0 / canvas.width, 1.0 / canvas.height);
      webgl.uniform1i(displayProgram.uniforms.uTexture, dye.read.attach(0));
      blit(null);
    };

    let lastTime = performance.now();
    let autonomousPhase = 0;
    let animationFrameId = 0;

    const update = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.016667);
      lastTime = now;

      if (isTabVisible) {
        // Gentle autonomous ambient drift on mobile / when cursor rests for > 2.2s
        if (!prefersReducedMotion && now - lastPointerTime > 2200) {
          autonomousPhase += dt * 0.65;
          const ax = 0.62 + Math.sin(autonomousPhase * 1.1) * 0.22;
          const ay = 0.50 + Math.cos(autonomousPhase * 0.85) * 0.22;
          const adx = Math.cos(autonomousPhase * 1.3) * 95;
          const ady = Math.sin(autonomousPhase * 1.1) * 95;
          colorPhase += dt * 0.35;
          splat(ax, ay, adx, ady, getContinuousColor(colorPhase, 0.025), 1.15);
        }

        if (!prefersReducedMotion) {
          stepSimulation(dt);
        }
        renderToScreen();
      }

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(update);
      }
    };

    renderToScreen();
    if (!prefersReducedMotion) {
      animationFrameId = requestAnimationFrame(update);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#030305]"
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
