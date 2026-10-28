/**
 * GLSL sources for the silk strand renderer.
 *
 * Each strand is an instanced, screen-space-expanded ribbon whose path is
 * computed entirely in the vertex shader (no CPU simulation), so thousands of
 * strands cost a single draw call. Shading follows the Kajiya-Kay hair model:
 * the highlight depends on the strand tangent, which is what gives hair its
 * characteristic sheen bands.
 */

export const TRAIL_LENGTH = 8

const pathChunk = /* glsl */ `
uniform float uTime;
uniform float uMotion;
uniform int uMode;
uniform vec4 uShape;   // x length, y spread, z wave amplitude, w wave frequency
uniform vec4 uShape2;  // mode-specific extras
uniform vec4 uFrame;   // xy offset (world), z scale, w rotation (rad)

const float TAU = 6.28318530718;
const float PI = 3.14159265359;

vec2 rot(vec2 p, float a) {
  float c = cos(a), s = sin(a);
  return vec2(c * p.x - s * p.y, s * p.x + c * p.y);
}

// A: strandU, clumpU, clumpPhase, strandRand
// B: depth, lengthScale, tone, widthScale
vec3 strandPath(float t, vec4 A, vec4 B) {
  float u = A.x * 2.0 - 1.0;
  float cu = A.y * 2.0 - 1.0;
  float ph = A.z * TAU;
  float r = A.w;
  float depth = B.x;
  float time = uTime * uMotion;
  float L = uShape.x;
  float spread = uShape.y;
  float amp = uShape.z;
  float freq = uShape.w;
  vec3 p;

  if (uMode == 0) {
    // CASCADE — a long, broad fall of hair sweeping diagonally.
    float s = t * L;
    float cx = 0.26 * sin(t * 2.6 + 0.3) - 0.5 * t;
    float w = spread * (0.48 + 0.52 * sin(PI * min(t * 1.1 + 0.12, 1.0)));
    float uu = sign(u) * pow(abs(u), 0.9);
    float lock = sin(freq * t * TAU + ph + time * 0.55 + r * 0.35);
    float body = sin(t * 3.4 - time * 0.3 + cu * 0.6);
    float x = cx + uu * w + amp * lock * smoothstep(0.0, 0.3, t) + 0.06 * body * t;
    // Depth: one broad, shared undulation (coherent sheen bands) plus a little per-lock variation.
    float z = depth * 0.4 + 0.06 * cos(freq * t * TAU + ph + time * 0.55)
            + 0.34 * cos(t * 4.2 - time * 0.3 + cu * 0.5);
    p = vec3(x, 1.12 - s, z);
  } else if (uMode == 1) {
    // CARRÉ — a blunt bob: dome from the crown, crisp horizontal cut line.
    float cut = uShape2.x;
    float y = mix(1.0, cut + (r - 0.5) * 0.006, t);
    float dome = 0.62 + 0.38 * sin(min(t * 1.6, 1.0) * PI * 0.5);
    float bevel = smoothstep(0.8, 1.0, t);
    float x = u * spread * dome * (1.0 - 0.07 * bevel) + amp * sin(freq * t * TAU + ph + time * 0.4) * t;
    float z = depth * 0.25 + 0.42 * sin(t * PI * 0.92) * cos(u * 1.2) - 0.12 * bevel;
    p = vec3(x, y, z);
  } else if (uMode == 2) {
    // ONDES — coherent beach waves across the whole tress.
    float s = t * L;
    float wave = sin(freq * t * TAU + u * 0.7 + ph * 0.12 + time * 0.5);
    float env = smoothstep(0.0, 0.18, t) * (0.6 + 0.4 * t);
    float x = u * spread * (0.7 + 0.3 * t) + amp * wave * env;
    float z = depth * 0.35 + 0.3 * cos(freq * t * TAU + u * 0.7 + ph * 0.12 + time * 0.5) * env;
    p = vec3(x, 1.1 - s, z);
  } else if (uMode == 3) {
    // BOUCLES — helical curls: each clump is a full coil of many strands.
    float s = t * L;
    float turns = uShape2.x;
    float spring = uShape2.y * (0.75 + 0.5 * fract(A.z * 7.13)) * (0.8 + 0.5 * t);
    float off = clamp((u - cu) * uShape2.z, -1.6, 1.6);
    float a = t * turns * TAU * (0.9 + 0.2 * fract(A.z * 3.7)) + ph + off * 0.35 + time * 0.25;
    float rr = spring * (1.0 + off * 0.22);
    float drift = 0.05 * sin(t * 2.3 + ph);
    float x = cu * spread + rr * cos(a) + drift;
    float z = depth * 0.35 + rr * sin(a) * 2.6;
    p = vec3(x, 1.12 - s - 0.04 * sin(time * 0.3 + ph) + 0.08 * fract(A.z * 11.0), z);
  } else if (uMode == 4) {
    // TORSADE — a spiral twist, like a chignon seen from behind.
    float turns = uShape2.x;
    float th = A.y * TAU + t * turns * TAU + time * 0.05;
    float wobble = 0.022 * sin(th * 3.0 + ph) + 0.012 * sin(th * 7.0 + ph * 2.0);
    float rho = spread * (1.0 - 0.82 * t) * (1.0 + wobble) + u * amp * (1.0 - 0.5 * t);
    float x = rho * cos(th);
    float y = rho * sin(th) * 0.84;
    float z = depth * 0.2 + 0.35 * sin(th + 0.6) * (1.0 - t);
    p = vec3(x, y, z);
  } else {
    // LISSE — long straight silk with a strong gloss band.
    float s = t * L;
    float x = u * spread * (0.88 + 0.12 * t) + amp * sin(freq * t * TAU + ph + time * 0.35) * t;
    float z = depth * 0.25 + 0.45 * sin(t * PI * 0.85 + 0.2) * cos(u * 0.9);
    p = vec3(x, 1.1 - s, z);
  }

  p.xy = rot(p.xy, uFrame.w) * uFrame.z + uFrame.xy;
  p.z *= uFrame.z;
  return p;
}
`

export const strandVert = /* glsl */ `#version 300 es
precision highp float;
layout(location = 0) in vec2 aTemplate; // x: t along strand, y: side (-1 / +1)
layout(location = 1) in vec4 aA;
layout(location = 2) in vec4 aB;

${pathChunk}

uniform vec2 uRes;
uniform float uAspect;
uniform float uDpr;
uniform float uWidth;
uniform float uReveal;
uniform vec4 uTrail[${TRAIL_LENGTH}]; // xy world position, z strength, w radius
uniform vec2 uVel;
uniform vec3 uLight;

out float vT;
out float vDepth;
out float vTone;
out float vDist;
out float vHalf;
out float vCover;
out float vDiff;
out float vSpec1;
out float vSpec2;
out float vReveal;

vec2 comb(vec2 p, float t) {
  vec2 disp = vec2(0.0);
  float anchor = smoothstep(0.02, 0.4, t);
  for (int i = 0; i < ${TRAIL_LENGTH}; i++) {
    vec4 tr = uTrail[i];
    if (tr.z <= 0.001) continue;
    vec2 d = p - tr.xy;
    float rad = tr.w;
    float f = exp(-dot(d, d) / (rad * rad)) * tr.z;
    vec2 dir = d / (length(d) + 1e-4);
    disp += dir * f * rad * 0.75;
    if (i == 0) disp += uVel * f * 0.06;
  }
  return disp * anchor;
}

vec3 finalPos(float t) {
  vec3 p = strandPath(t, aA, aB);
  p.xy += comb(p.xy, t);
  return p;
}

vec2 toScreen(vec3 p) {
  vec2 ndc = vec2(p.x / uAspect, p.y);
  return (ndc * 0.5 + 0.5) * uRes;
}

void main() {
  float t = aTemplate.x * aB.y;
  float eps = 0.006;
  vec3 p0 = finalPos(t);
  vec3 p1 = finalPos(t + eps);

  vec2 s0 = toScreen(p0);
  vec2 s1 = toScreen(p1);
  vec2 dir = s1 - s0;
  float len = length(dir);
  dir = len > 1e-5 ? dir / len : vec2(0.0, -1.0);
  vec2 n = vec2(-dir.y, dir.x);

  float near = clamp(aB.x, 0.0, 1.0);
  float taper = 1.0 - 0.65 * smoothstep(0.62, 1.0, aTemplate.x);
  float w = uWidth * uDpr * aB.w * taper * mix(0.75, 1.35, near);
  float halfCore = 0.5 * w;
  float halfQuad = halfCore + 1.0;
  vec2 sp = s0 + n * aTemplate.y * halfQuad;
  gl_Position = vec4(sp / uRes * 2.0 - 1.0, 0.0, 1.0);

  vDist = aTemplate.y * halfQuad;
  vHalf = max(halfCore, 0.5);
  vCover = min(w, 1.0);

  // Kajiya-Kay shading, evaluated per vertex (segments are short).
  vec3 T = normalize(vec3(p1 - p0));
  vec3 Ld = normalize(uLight);
  vec3 H = normalize(Ld + vec3(0.0, 0.0, 1.0));
  float tl = dot(T, Ld);
  vDiff = sqrt(max(0.0, 1.0 - tl * tl));
  vec3 T1 = normalize(T + vec3(0.0, 0.0, 0.16));
  vec3 T2 = normalize(T - vec3(0.0, 0.0, 0.1));
  float h1 = dot(T1, H);
  float h2 = dot(T2, H);
  vSpec1 = pow(sqrt(max(0.0, 1.0 - h1 * h1)), 64.0);
  vSpec2 = pow(sqrt(max(0.0, 1.0 - h2 * h2)), 14.0);

  vT = aTemplate.x;
  vDepth = near;
  vTone = aB.z;
  float stagger = fract(aA.y * 5.31 + aA.w * 0.4) * 0.25;
  vReveal = smoothstep(uReveal * 1.3 - stagger, uReveal * 1.3 - stagger - 0.18, aTemplate.x);
}
`

export const strandFrag = /* glsl */ `#version 300 es
precision highp float;

in float vT;
in float vDepth;
in float vTone;
in float vDist;
in float vHalf;
in float vCover;
in float vDiff;
in float vSpec1;
in float vSpec2;
in float vReveal;

uniform vec3 uRoot;
uniform vec3 uMid;
uniform vec3 uTip;
uniform vec3 uSheen;
uniform vec2 uBlend;   // where root -> tip transition happens along the strand
uniform float uAlpha;
uniform float uSpecular;
uniform float uTipFade;

out vec4 outColor;

void main() {
  float coverage = clamp(vHalf + 0.5 - abs(vDist), 0.0, 1.0) * vCover;
  float tipFade = 1.0 - smoothstep(uTipFade, 1.0, vT);
  float a = uAlpha * coverage * tipFade * mix(0.45, 1.0, vDepth) * vReveal;
  if (a < 0.002) discard;

  float k = smoothstep(uBlend.x, uBlend.y, vT + (vTone - 0.5) * 0.35);
  vec3 base = k < 0.5 ? mix(uRoot, uMid, k * 2.0) : mix(uMid, uTip, k * 2.0 - 1.0);
  base *= 0.82 + vTone * 0.36;

  float shade = mix(0.32, 1.0, vDepth);
  vec3 col = base * (0.16 + 0.84 * vDiff) * shade;
  col += uSheen * vSpec1 * uSpecular * 0.55 * shade;
  col += base * vSpec2 * 0.7 * uSpecular;

  outColor = vec4(col * a, a);
}
`

export const quadVert = /* glsl */ `#version 300 es
precision highp float;
layout(location = 0) in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`

export const backgroundFrag = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
uniform vec3 uBg;
uniform vec3 uGlow;
uniform vec2 uGlowPos;
uniform float uAspect;
out vec4 outColor;
void main() {
  vec2 p = vec2((vUv.x - uGlowPos.x) * uAspect, vUv.y - uGlowPos.y);
  float g = exp(-dot(p, p) * 1.6);
  vec3 col = uBg + uGlow * g;
  col *= 0.92 + 0.08 * vUv.y;
  outColor = vec4(col, 1.0);
}
`

export const brightFrag = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uTex;
uniform float uThreshold;
out vec4 outColor;
void main() {
  vec3 c = texture(uTex, vUv).rgb;
  float l = max(max(c.r, c.g), c.b);
  float k = smoothstep(uThreshold, uThreshold + 0.25, l);
  outColor = vec4(c * k, 1.0);
}
`

export const blurFrag = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uDir;
out vec4 outColor;
void main() {
  vec3 c = texture(uTex, vUv).rgb * 0.227027;
  c += texture(uTex, vUv + uDir * 1.3846153846).rgb * 0.3162162162;
  c += texture(uTex, vUv - uDir * 1.3846153846).rgb * 0.3162162162;
  c += texture(uTex, vUv + uDir * 3.2307692308).rgb * 0.0702702703;
  c += texture(uTex, vUv - uDir * 3.2307692308).rgb * 0.0702702703;
  outColor = vec4(c, 1.0);
}
`

export const compositeFrag = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uScene;
uniform sampler2D uBloom;
uniform float uBloomStrength;
uniform float uGrain;
uniform float uTime;
uniform float uVignette;
out vec4 outColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  vec3 c = texture(uScene, vUv).rgb;
  c += texture(uBloom, vUv).rgb * uBloomStrength;
  vec2 q = vUv - 0.5;
  c *= 1.0 - uVignette * dot(q, q) * 1.6;
  float n = hash(gl_FragCoord.xy + fract(uTime * 7.0) * 100.0) - 0.5;
  c += n * uGrain;
  outColor = vec4(c, 1.0);
}
`
