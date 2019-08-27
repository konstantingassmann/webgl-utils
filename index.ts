import { mat3 } from "gl-matrix";

export const createShader = (
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
};

export const createProgram = (
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
): WebGLProgram => {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  return program;
};

export const createBuffer = (
  gl: WebGLRenderingContext,
  subX = 1,
  subY = 1
): [WebGLBuffer, number] => {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

  const length = rect({
    gl,
    x: 0,
    y: 0,
    width: 1,
    height: 1,
    subX,
    subY
  });

  return [buffer, length];
};

export const createTexCoordBuffer = (
  gl: WebGLRenderingContext,
  location: number,
  subX = 1,
  subY = 1
): WebGLBuffer => {
  return createBuffer(gl, subX, subY);
};

type TUAttrbutes = {
  [key: string]: number;
};

export const getAttribs = (
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  attrbutes: Array<string>
): TUAttrbutes => {
  return attrbutes.reduce((acc, name) => {
    acc[name] = gl.getAttribLocation(program, `a_${name}`);
    return acc;
  }, {});
};

type TUniforms = {
  [key: string]: WebGLUniformLocation;
};

export const getUniforms = (
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  uniforms: Array<string>
): TUniforms => {
  return uniforms.reduce((acc, name) => {
    acc[name] = gl.getUniformLocation(program, `u_${name}`);
    return acc;
  }, {});
};

export const bindBufferWithAttrib = (gl, buffer, location) => {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(location);
  gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
};

type TDrawImage = {
  gl: WebGLRenderingContext;
  texture?: WebGLTexture;
  x: number;
  y: number;
  w: number;
  h: number;
  positionBuffer: WebGLBuffer;
  texcoordBuffer: WebGLBuffer;
  positionLocation: number;
  texLocation: number;
  matrixLocation: WebGLUniformLocation;
  textureLocation: WebGLUniformLocation;
  disableMatrix?: boolean
};

export const drawImage = ({
  gl,
  texture,
  x,
  y,
  w,
  h,
  positionBuffer,
  texcoordBuffer,
  positionLocation,
  texLocation,
  matrixLocation,
  textureLocation,
  disableMatrix
}: TDrawImage) => {
  bindBufferWithAttrib(gl, positionBuffer, positionLocation);

  bindBufferWithAttrib(gl, texcoordBuffer, texLocation);

  if (!disableMatrix) {
    const projectionMatrix = mat3.projection(
      [],
      gl.canvas.width,
      gl.canvas.height
    );

    let matrix = mat3.translate([], projectionMatrix, [x, y]);
    matrix = mat3.scale([], matrix, [w, h]);
    matrix = mat3.translate([], matrix, [-0.5, -0.5]);

    gl.uniformMatrix3fv(matrixLocation, false, matrix);
  }

  gl.uniform1i(textureLocation, 0);
};

export const createTexture = (
  gl: WebGLRenderingContext,
  image: TexImageSource
): WebGLTexture => {
  const texture = gl.createTexture();

  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  return texture;
};

type TRect = {
  gl: WebGLRenderingContext;
  x: number;
  y: number;
  width: number;
  height: number;
  subX?: number;
  subY?: number;
};

export const rect = ({
  gl,
  x,
  y,
  width,
  height,
  subX = 1,
  subY = 1
}: TRect) => {
  const stepX = width / subX;
  const stepY = height / subY;

  const positions = [];

  const yEnd = y + stepY;
  const xEnd = x + stepX;

  for (let j = 0; j < height; j += stepY) {
    for (let i = 0; i < width; i += stepX) {
      // one quad made of two triangles
      positions.push(
        x + i,
        y + j,
        xEnd + i,
        y + j,
        x + i,
        yEnd + j,

        x + i,
        yEnd + j,
        xEnd + i,
        y + j,
        xEnd + i,
        yEnd + j
      );
    }
  }

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  return positions.length;
};
